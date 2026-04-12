# Auth & Session Audit -- Social Care BFF (Deno + Hono)
**Date**: 2026-04-11
**Auditor**: auth-auditor agent
**Scope**: Authentication, authorization, session management, OIDC/PKCE flow, cookie security, CSRF, API proxy token handling

---

## Executive Summary

Overall auth security posture: **ADEQUATE** with **2 CRITICAL** and **3 HIGH** findings that must be addressed before production hardening.

The BFF implements a solid OIDC Authorization Code + PKCE flow with S256 code challenge, HMAC-signed session cookies, in-memory session store with TTL and bounds, and a defense-in-depth middleware chain. However, the id_token is decoded without cryptographic signature verification, the SESSION_SECRET has no entropy validation, there is no rate limiting on auth endpoints, no role-based authorization on the API proxy, and the CSRF token comparison is not timing-safe.

---

## Compliance Matrix

| Control | Status | Details |
|---------|--------|---------|
| Password Storage | N/A | Delegated to Zitadel OIDC provider -- no local passwords |
| JWT Security | CRITICAL | id_token decoded without signature verification; claims validation is present but relies on unverified payload |
| Session Management | WARNING | Good cookie flags and HMAC signing; no idle timeout renewal; in-memory store loses sessions on restart; no session regeneration on privilege change |
| OAuth/OIDC | WARNING | PKCE S256 correct; state parameter validated; id_token signature NOT verified; nonce not used |
| MFA | N/A | Delegated to Zitadel -- BFF does not implement MFA directly |
| Authorization | CRITICAL | No role-based access control on API proxy; any authenticated user can access any backend endpoint |
| Account Security | HIGH | Zero rate limiting on /auth/login and /auth/callback; no account lockout |
| CSRF Protection | WARNING | Double-submit cookie pattern with non-timing-safe string comparison |

---

## Critical Findings

### CRITICAL-01: id_token decoded without cryptographic signature verification

**File**: `/Users/gabriel_aderaldo/Desktop/dev/envolve/acdg/social-care-deno/src/adapters/auth/bff_service.ts` (lines 165-178)

**Description**: The `decodeIdTokenPayload` function splits the JWT and base64-decodes the payload without verifying the RSA/EC signature. The `validateIdTokenClaims` function (lines 184-211) checks `iss`, `aud`, and `exp`, but these claims come from an unverified payload. An attacker who intercepts or manipulates the token exchange response could inject arbitrary claims (including roles and user identity).

**Comment in code says**: "no verification -- token came over TLS from provider". While TLS protects transport, this violates the OIDC Core spec (Section 3.1.3.7) which requires the RP to validate the id_token signature using the OP's published keys. Reasons:
1. TLS termination at a load balancer/CDN means the BFF-to-provider hop may not be end-to-end encrypted in all deployments.
2. A compromised DNS or MITM on the internal network can forge tokens.
3. The OIDC spec mandates it -- compliance requires it.

**Impact**: An attacker could forge identity claims, escalate roles, and impersonate any user.

**Remediation**: Use the Zitadel JWKS endpoint to fetch public keys and verify the id_token signature before trusting any claims. Deno's `crypto.subtle.verify` with imported JWK can do this, or use a library like `jose` (available on deno.land/x).

```typescript
// Recommended fix using jose (deno.land/x/jose)
import * as jose from "https://deno.land/x/jose@v5.2.0/index.ts";

const JWKS = jose.createRemoteJWKSet(
  new URL(`${config.oidc.issuer}/oauth/v2/keys`)
);

const verifyIdToken = async (
  idToken: string,
  expectedIssuer: string,
  expectedClientId: string,
): Promise<Result<jose.JWTPayload, "ID_TOKEN_DECODE_FAILED">> => {
  try {
    const { payload } = await jose.jwtVerify(idToken, JWKS, {
      issuer: expectedIssuer,
      audience: expectedClientId,
      algorithms: ["RS256"],
    });
    return ok(payload);
  } catch {
    return err("ID_TOKEN_DECODE_FAILED");
  }
};
```

---

### CRITICAL-02: No role-based authorization on API proxy

**File**: `/Users/gabriel_aderaldo/Desktop/dev/envolve/acdg/social-care-deno/src/routes/api.ts` (lines 119-161)

**Description**: The API proxy at `/api/v1/*` and `/api/people/*` checks only that a session exists (`if (!session)`). It does not verify the user's roles before forwarding requests. Any authenticated user (regardless of their Zitadel role) can access any backend endpoint, including admin-only operations.

The session already contains `roles` (extracted from the id_token's Zitadel claim at `bff_service.ts` line 429), but these are never checked in the proxy layer.

**Impact**: Horizontal and vertical privilege escalation. A user with `social_worker` role could access admin endpoints. The backend may have its own RBAC, but defense-in-depth requires the BFF to enforce it too.

**Remediation**: Add a role-checking middleware or route-level guards on the API proxy.

```typescript
// Example: role guard middleware factory
const requireRole = (...allowed: readonly string[]): MiddlewareHandler<AppEnv> => {
  return async (c, next) => {
    const session = c.get("session");
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    const hasRole = session.roles.some((r) => allowed.includes(r));
    if (!hasRole) return c.json({ error: "Forbidden" }, 403);
    await next();
  };
};

// Usage on specific API paths
api.use("/api/v1/admin/*", requireRole("admin", "owner"));
api.use("/api/v1/patients/*", requireRole("social_worker", "admin", "owner"));
```

---

## High Findings

### HIGH-01: No rate limiting on auth endpoints

**Files**:
- `/Users/gabriel_aderaldo/Desktop/dev/envolve/acdg/social-care-deno/src/routes/auth.ts`
- `/Users/gabriel_aderaldo/Desktop/dev/envolve/acdg/social-care-deno/src/server.ts`

**Description**: There is zero rate limiting on `/auth/login`, `/auth/callback`, and `/auth/logout`. A grep for `rateLimit`, `rate.limit`, and `throttle` across the entire `src/` directory returned no results. An attacker can:
1. Flood `/auth/login` to exhaust the PKCE store (capped at 1000 entries, but flooding forces constant sweeps and evictions).
2. Brute-force authorization codes on `/auth/callback` (though codes are single-use at the provider).
3. DoS the session store by repeatedly completing login flows.

**Impact**: Denial of service via PKCE store exhaustion; potential session store memory pressure.

**Remediation**: Add rate limiting middleware. Hono has no built-in rate limiter, but a simple in-memory token bucket or sliding window can be implemented.

```typescript
// Simple per-IP rate limiter for auth routes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const rateLimit = (
  maxRequests: number,
  windowMs: number,
): MiddlewareHandler<AppEnv> => {
  return async (c, next) => {
    const ip = c.req.header("x-forwarded-for")?.split(",")[0]?.trim()
      ?? c.req.header("cf-connecting-ip")
      ?? "unknown";
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetAt) {
      rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
      await next();
      return;
    }

    if (entry.count >= maxRequests) {
      return c.json({ error: "Too many requests" }, 429);
    }

    entry.count++;
    await next();
  };
};

// Apply: max 10 login attempts per IP per 15 minutes
app.use("/auth/*", rateLimit(10, 15 * 60 * 1000));
```

---

### HIGH-02: SESSION_SECRET has no entropy validation

**File**: `/Users/gabriel_aderaldo/Desktop/dev/envolve/acdg/social-care-deno/src/adapters/config/server_config.ts` (line 45)

**Description**: `SESSION_SECRET` is loaded via `requireEnv("SESSION_SECRET")` which only checks the value is non-empty. A developer could set `SESSION_SECRET=abc` and the HMAC signing would use a trivially weak key. The HMAC key is derived from this secret via `importHmacKey` which encodes it as UTF-8 bytes -- a 3-character secret gives only 24 bits of key material, far below the 256-bit minimum for HMAC-SHA256.

**Impact**: Session cookie forgery if the secret is weak. An attacker who guesses or brute-forces the secret can sign arbitrary session IDs.

**Remediation**: Validate minimum entropy at startup.

```typescript
const requireSecret = (key: string, minBytes: number): string => {
  const value = requireEnv(key);
  // Assume hex-encoded or base64-encoded secret
  const byteLength = value.length / 2; // conservative: hex encoding
  if (value.length < minBytes * 2) {
    throw new Error(
      `${key} must be at least ${minBytes} bytes (${minBytes * 2} hex chars). Got ${value.length} chars.`
    );
  }
  return value;
};

// Usage:
sessionSecret: requireSecret("SESSION_SECRET", 32), // minimum 256 bits
```

---

### HIGH-03: CSRF token comparison is not timing-safe

**File**: `/Users/gabriel_aderaldo/Desktop/dev/envolve/acdg/social-care-deno/src/middleware/csrf.ts` (line 63)

**Description**: The CSRF double-submit cookie comparison uses `cookieToken !== headerToken` (JavaScript strict equality), which is vulnerable to timing side-channel attacks. An attacker could theoretically measure response times to deduce the CSRF token character by character.

Additionally, the HMAC session verification in `bff_service.ts` line 129 (`if (sig !== expectedSig) return undefined`) has the same issue.

**Impact**: Low-to-medium in practice (network jitter masks timing differences), but it violates best practices for security-sensitive comparisons.

**Remediation**: Use `crypto.subtle.timingSafeEqual` (available in Deno) or compare via HMAC.

```typescript
// Timing-safe comparison using crypto.subtle
const timingSafeEqual = (a: string, b: string): boolean => {
  const encoder = new TextEncoder();
  const aBuf = encoder.encode(a);
  const bBuf = encoder.encode(b);
  if (aBuf.length !== bBuf.length) return false;
  // Use crypto.subtle.timingSafeEqual if available, or XOR-based comparison
  let result = 0;
  for (let i = 0; i < aBuf.length; i++) {
    result |= aBuf[i]! ^ bBuf[i]!;
  }
  return result === 0;
};
```

---

## Medium Findings

### MED-01: No OIDC nonce parameter in authorization request

**File**: `/Users/gabriel_aderaldo/Desktop/dev/envolve/acdg/social-care-deno/src/adapters/auth/bff_service.ts` (lines 349-357)

**Description**: The OIDC authorization request includes `state` (for CSRF) but does not include a `nonce` parameter. Per OIDC Core spec (Section 3.1.2.1), the `nonce` should be included in the authorization request and validated in the id_token to prevent replay attacks of id_tokens.

**Impact**: An id_token from a previous authentication could potentially be replayed.

**Remediation**: Generate a nonce, store it alongside the PKCE verifier, and validate it appears in the id_token payload after exchange.

---

### MED-02: In-memory session store loses all sessions on process restart

**File**: `/Users/gabriel_aderaldo/Desktop/dev/envolve/acdg/social-care-deno/src/adapters/auth/session_store.ts`

**Description**: The session store is a plain `Map<string, Session>` in process memory. Any restart (deployment, crash, OOM kill) destroys all active sessions, forcing all users to re-authenticate. In a multi-instance deployment (Kubernetes with >1 replica), sessions are not shared across pods.

**Impact**: User disruption on deployments; inability to scale horizontally without sticky sessions.

**Remediation**: For production, use Redis or Deno KV as the session backing store. For the current single-instance deployment, this is acceptable but should be flagged for future scaling.

---

### MED-03: No idle timeout renewal -- session expires at fixed time

**File**: `/Users/gabriel_aderaldo/Desktop/dev/envolve/acdg/social-care-deno/src/middleware/session.ts`

**Description**: The session middleware checks `session.expiresAt` but never extends it on activity. Per OWASP Session Management Cheat Sheet, sessions should have both an idle timeout (renewed on activity) and an absolute timeout (never extended). Currently there is only an absolute timeout (set at login time based on `min(token_expiry, SESSION_TTL_MINUTES)`). A user active for 59 minutes of a 60-minute session gets logged out without warning.

**Impact**: Poor UX for active users; no distinction between abandoned and active sessions.

**Remediation**: Add a sliding window to the session middleware that bumps `expiresAt` on each request, up to an absolute maximum.

---

### MED-04: Session ID not regenerated on token refresh

**File**: `/Users/gabriel_aderaldo/Desktop/dev/envolve/acdg/social-care-deno/src/adapters/auth/bff_service.ts` (lines 482-543)

**Description**: The `refresh` function updates the session data in place (`sessionStore.set(sessionId, newSession)`) using the same session ID. When a privilege change occurs (e.g., roles updated in the new id_token), the session ID should be regenerated to prevent session fixation.

**Impact**: If an attacker obtains a pre-refresh session cookie, it remains valid after the refresh with potentially elevated privileges.

**Remediation**: Generate a new session ID on refresh, delete the old one, and update the cookie.

---

### MED-05: validateIdTokenClaims allows missing claims to pass

**File**: `/Users/gabriel_aderaldo/Desktop/dev/envolve/acdg/social-care-deno/src/adapters/auth/bff_service.ts` (lines 184-211)

**Description**: The `validateIdTokenClaims` function only validates `iss`, `aud`, and `exp` when they are present (`if (payload.iss !== undefined)`). If any of these claims are missing from the payload, validation is silently skipped. Per OIDC Core spec, `iss`, `sub`, `aud`, `exp`, and `iat` are all REQUIRED claims in an id_token.

**Impact**: A malformed or stripped-down id_token without standard claims would pass validation.

**Remediation**: Require mandatory claims to be present.

```typescript
const validateIdTokenClaims = (
  payload: JWTPayload,
  expectedIssuer: string,
  expectedClientId: string,
): Result<JWTPayload, "ID_TOKEN_DECODE_FAILED"> => {
  // REQUIRED claims per OIDC Core 2. ID Token
  if (!payload.iss || !payload.sub || !payload.aud || !payload.exp) {
    return err("ID_TOKEN_DECODE_FAILED");
  }
  if (payload.iss !== expectedIssuer) {
    return err("ID_TOKEN_DECODE_FAILED");
  }
  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!audiences.includes(expectedClientId)) {
    return err("ID_TOKEN_DECODE_FAILED");
  }
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (payload.exp < nowSeconds) {
    return err("ID_TOKEN_DECODE_FAILED");
  }
  return ok(payload);
};
```

---

## Low Findings

### LOW-01: Dev cookie fallback uses SameSite=Lax instead of Strict

**File**: `/Users/gabriel_aderaldo/Desktop/dev/envolve/acdg/social-care-deno/src/adapters/auth/bff_service.ts` (line 224)

**Description**: When `secureCookies` is false (HTTP / localhost), the cookie is set with `SameSite=Lax` and without the `Secure` flag. While acceptable for local development, ensure this code path is never active in production. The `secureCookies` flag is derived from whether `OIDC_REDIRECT_URI` starts with `https://` (server_config.ts line 46), which is a reasonable guard.

---

### LOW-02: Error responses on auth callback may leak internal error codes

**File**: `/Users/gabriel_aderaldo/Desktop/dev/envolve/acdg/social-care-deno/src/routes/auth.ts` (line 40)

**Description**: On callback failure, the route returns `c.json({ error: result.error }, 401)` where `result.error` is a string like `"TOKEN_EXCHANGE_FAILED"` or `"INVALID_STATE"`. These internal error codes could aid an attacker in understanding the system.

**Remediation**: Return a generic error message to the client; log the specific error server-side.

---

### LOW-03: PKCE store and session store share no monitoring/alerting

**Description**: There is no logging or metrics when the PKCE store hits its 1000-entry limit or when sessions are evicted. In a DoS scenario, this would be invisible to operators.

**Remediation**: Add structured logging when PKCE entries are evicted or when session store approaches capacity.

---

## Positive Findings (Things Done Well)

1. **PKCE S256 implementation** (bff_service.ts lines 79-89): Correct use of `crypto.getRandomValues(32)` for verifier, `crypto.subtle.digest("SHA-256")` for challenge, proper base64url encoding. PKCE TTL of 5 minutes and max 1000 entries with sweep is well-bounded.

2. **HMAC-signed session cookies** (bff_service.ts lines 96-131): Session IDs are HMAC-SHA256 signed before being placed in cookies. Verification reconstructs the signature rather than comparing raw values.

3. **Cookie security flags** (bff_service.ts line 223): `__Host-session` prefix with `HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=...` is textbook correct.

4. **BFF pattern -- browser never sees tokens**: The access token, refresh token, backend URL, and client secret are all server-side only. The browser only sees an opaque HMAC-signed session ID.

5. **Middleware chain ordering** (server.ts lines 49-54): `securityHeaders -> serveStatic -> csrf -> session -> fetchMetadata -> authGuard` is correct and well-documented.

6. **Fetch Metadata validation** (fetch_metadata.ts): Validates `Sec-Fetch-Site` and requires `X-Requested-With: XMLHttpRequest` on ALL methods to `/api/*` -- good defense-in-depth against CSRF.

7. **CSRF double-submit cookie** (csrf.ts): Properly generates 256-bit random tokens, separates API routes (which use fetch-metadata instead), and validates on mutating methods.

8. **CSP with per-request nonce** (security_headers.ts): `strict-dynamic` + nonce for scripts, nonce + `unsafe-inline` fallback for styles, `frame-ancestors: 'none'`, restrictive `connect-src`.

9. **Session TTL enforcement** (session_store.ts): Auto-delete expired sessions on `get()`, sweep expired on `set()`, and evict oldest when approaching memory limit.

10. **Client-side base-client** (base-client.ts): Always sends `credentials: "same-origin"` and `X-Requested-With: XMLHttpRequest`. On 401, redirects to `/auth/login`.

---

## Prioritized Recommendations

| Priority | Finding | Effort | Impact |
|----------|---------|--------|--------|
| P0 | CRITICAL-01: Add id_token signature verification via JWKS | Medium (add jose dependency, implement JWKS fetch + verify) | Eliminates token forgery risk |
| P0 | CRITICAL-02: Add role-based guards on API proxy routes | Low (roles already in session, add middleware) | Prevents privilege escalation |
| P1 | HIGH-01: Add rate limiting on /auth/* endpoints | Low-Medium (implement in-memory rate limiter) | Prevents DoS and brute-force |
| P1 | HIGH-02: Validate SESSION_SECRET minimum entropy | Low (add length check in config loader) | Prevents weak HMAC keys |
| P1 | HIGH-03: Use timing-safe comparison for CSRF and HMAC | Low (replace === with constant-time compare) | Closes timing side-channel |
| P2 | MED-01: Add nonce to OIDC authorization request | Low (generate + store + validate) | Prevents id_token replay |
| P2 | MED-05: Require mandatory OIDC claims | Low (tighten validation logic) | Hardens token validation |
| P2 | MED-04: Regenerate session ID on token refresh | Low (create new ID, delete old, update cookie) | Prevents session fixation |
| P3 | MED-02: Migrate session store to Redis/Deno KV | Medium-High | Enables horizontal scaling |
| P3 | MED-03: Add sliding idle timeout | Low (bump expiresAt on activity) | Better UX and security |
| P4 | LOW-01 through LOW-03 | Low | Defense-in-depth improvements |

---

## Files Audited

| File | Purpose | Lines |
|------|---------|-------|
| `src/adapters/auth/bff_service.ts` | OIDC login, callback, logout, token refresh, PKCE, HMAC signing | 581 |
| `src/adapters/auth/session_store.ts` | In-memory session store with TTL and bounds | 87 |
| `src/adapters/config/server_config.ts` | Config loading from env vars | 47 |
| `src/adapters/remote/remote_client.ts` | Backend proxy with token injection | 119 |
| `src/middleware/session.ts` | Session resolution middleware | 97 |
| `src/middleware/auth_guard.ts` | Route protection (authn only, no authz) | 49 |
| `src/middleware/fetch_metadata.ts` | Sec-Fetch-Site + X-Requested-With validation | 44 |
| `src/middleware/csrf.ts` | Double-submit cookie CSRF protection | 71 |
| `src/middleware/security_headers.ts` | CSP, HSTS, X-Frame-Options, Permissions-Policy | 51 |
| `src/routes/auth.ts` | Auth route handlers (login, callback, logout) | 67 |
| `src/routes/api.ts` | API proxy routes | 215 |
| `src/routes/me.ts` | Current user profile endpoint | 60 |
| `src/types.ts` | Session type, SessionStore contract, AppEnv | 47 |
| `src/server.ts` | Server bootstrap and middleware chain | 72 |
| `src/client/services/base-client.ts` | Client-side fetch wrapper | 161 |
