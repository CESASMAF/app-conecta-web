# API Security Hardening -- Social Care BFF (Deno + Hono)

**Date**: 2026-04-11
**Agent**: api-hardener
**Scope**: All API routes, middleware chain, proxy layer, client services, auth flows

---

## API Surface Map

| Route | Method | Auth | Rate Limit | Validation | CORS | Cache-Control | Status |
|-------|--------|------|------------|------------|------|---------------|--------|
| `GET /health` | GET | N/A (public) | NONE | N/A | NONE | NONE | NEEDS WORK |
| `GET /ready` | GET | N/A (public) | NONE | N/A | NONE | NONE | NEEDS WORK |
| `GET /auth/login` | GET | N/A (public) | NONE | N/A | N/A | N/A | NEEDS WORK |
| `GET /auth/callback` | GET | N/A (public) | NONE | Partial (code+state) | N/A | N/A | NEEDS WORK |
| `GET /auth/logout` | GET | Session | NONE | N/A | N/A | N/A | NEEDS WORK |
| `GET /api/v1/me` | GET | Session | NONE | N/A | N/A | NONE | NEEDS WORK |
| `ALL /api/v1/*` | ALL | Session | NONE | Basic JSON | N/A | NONE | NEEDS WORK |
| `ALL /api/people/*` | ALL | Session | NONE | Basic JSON | N/A | NONE | NEEDS WORK |
| `GET /` | GET | N/A (public) | NONE | N/A | N/A | N/A | OK |
| `GET /hub` | GET | Session | NONE | N/A | N/A | N/A | OK |
| `GET /login` | GET | N/A (public) | NONE | N/A | N/A | N/A | OK |
| `GET /social-care` | GET | Session | NONE | N/A | N/A | N/A | OK |
| `GET /patient-registration` | GET | Session | NONE | N/A | N/A | N/A | OK |
| `GET /family-composition/:patientId` | GET | Session | Partial (params) | NONE | N/A | N/A | NEEDS WORK |

---

## Findings & Patches

### [CRITICAL] F01 -- No Rate Limiting on Any Endpoint

**Routes**: ALL
**Files**: `src/server.ts`

**Problem**: Zero rate limiting exists anywhere in the application. Every endpoint -- including auth login, auth callback, API proxy, health checks -- is completely unthrottled. This allows:
- Brute-force attacks on auth callback (code/state guessing)
- PKCE store exhaustion (despite the 1000-entry cap, an attacker can churn entries)
- Upstream backend abuse via the API proxy
- Resource exhaustion via health/ready endpoint polling
- Session store flooding

**Patch** -- Create `src/middleware/rate_limit.ts`:

```typescript
// src/middleware/rate_limit.ts
// In-memory sliding-window rate limiter. No external dependencies.
// For production with multiple replicas, replace with Redis-backed store.

import type { MiddlewareHandler } from "@hono/hono";
import type { AppEnv } from "../types.ts";

type RateLimitEntry = Readonly<{
  count: number;
  windowStart: number;
}>;

type RateLimitConfig = Readonly<{
  /** Maximum requests per window. */
  max: number;
  /** Window duration in milliseconds. */
  windowMs: number;
  /** Key extractor -- defaults to IP-based. */
  keyGenerator?: (c: { req: { header: (name: string) => string | undefined } }) => string;
  /** Maximum number of tracked keys before sweep. */
  maxKeys?: number;
}>;

const DEFAULT_MAX_KEYS = 50_000;

const getClientIp = (c: { req: { header: (name: string) => string | undefined } }): string =>
  c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
  c.req.header("x-real-ip") ??
  "unknown";

export const rateLimiter = (config: RateLimitConfig): MiddlewareHandler<AppEnv> => {
  const store = new Map<string, RateLimitEntry>();
  const maxKeys = config.maxKeys ?? DEFAULT_MAX_KEYS;

  // Periodic sweep of expired entries
  const sweep = (now: number): void => {
    for (const [key, entry] of store) {
      if (now - entry.windowStart > config.windowMs) {
        store.delete(key);
      }
    }
  };

  return async (c, next) => {
    const now = Date.now();
    const key = config.keyGenerator ? config.keyGenerator(c) : getClientIp(c);

    // Sweep if store is getting large
    if (store.size > maxKeys) {
      sweep(now);
    }

    const existing = store.get(key);

    if (existing === undefined || now - existing.windowStart > config.windowMs) {
      // New window
      store.set(key, { count: 1, windowStart: now });
      c.header("X-RateLimit-Limit", String(config.max));
      c.header("X-RateLimit-Remaining", String(config.max - 1));
      await next();
      return;
    }

    if (existing.count >= config.max) {
      const retryAfterMs = config.windowMs - (now - existing.windowStart);
      const retryAfterSec = Math.ceil(retryAfterMs / 1000);
      c.header("Retry-After", String(retryAfterSec));
      c.header("X-RateLimit-Limit", String(config.max));
      c.header("X-RateLimit-Remaining", "0");
      return c.json({ error: "Too many requests" }, 429);
    }

    // Increment
    store.set(key, { count: existing.count + 1, windowStart: existing.windowStart });
    c.header("X-RateLimit-Limit", String(config.max));
    c.header("X-RateLimit-Remaining", String(config.max - existing.count - 1));
    await next();
  };
};
```

**Apply in `src/server.ts`** -- add after the dependency injection middleware, before securityHeaders:

```typescript
import { rateLimiter } from "./middleware/rate_limit.ts";

// Global rate limit: 200 requests per 15 minutes per IP
app.use("*", rateLimiter({ max: 200, windowMs: 15 * 60 * 1000 }));

// Strict rate limit on auth endpoints: 10 per 15 min per IP
app.use("/auth/*", rateLimiter({ max: 10, windowMs: 15 * 60 * 1000 }));

// Strict rate limit on API mutations: 60 per minute per IP
app.use("/api/*", rateLimiter({ max: 60, windowMs: 60 * 1000 }));
```

---

### [HIGH] F02 -- No Request Body Size Limit on API Proxy

**Route**: `ALL /api/v1/*`, `ALL /api/people/*`
**File**: `src/routes/api.ts:102-116`

**Problem**: The API proxy reads and parses the full request body via `req.json()` and `req.raw.clone().json()` without any size check. An attacker can send a multi-gigabyte JSON payload to exhaust server memory (OOM) before the request even reaches the upstream backend.

**Patch** -- Add body size guard in the pre-validation middleware in `src/routes/api.ts`:

```typescript
// Add at the top of api.ts
const MAX_BODY_SIZE = 64 * 1024; // 64 KB max for JSON API bodies

// Replace the existing api.use("*", ...) middleware (lines 102-116) with:
api.use("*", async (c, next) => {
  const method = c.req.method;
  if (method === "POST" || method === "PUT" || method === "DELETE" || method === "PATCH") {
    // Check Content-Length before reading body
    const contentLength = c.req.header("content-length");
    if (contentLength !== undefined) {
      const size = parseInt(contentLength, 10);
      if (Number.isNaN(size) || size > MAX_BODY_SIZE) {
        return c.json({ error: "Payload too large" }, 413);
      }
    }

    const contentType = c.req.header("content-type") ?? "";

    // Reject unexpected Content-Types on mutating requests
    if (contentType && !contentType.includes("application/json")) {
      return c.json({ error: "Unsupported Media Type" }, 415);
    }

    if (contentType.includes("application/json")) {
      try {
        const clone = c.req.raw.clone();
        const bodyText = await clone.text();
        if (bodyText.length > MAX_BODY_SIZE) {
          return c.json({ error: "Payload too large" }, 413);
        }
        JSON.parse(bodyText); // Validate JSON
      } catch {
        return c.json({ error: "Malformed JSON body" }, 400);
      }
    }
  }
  await next();
});
```

---

### [HIGH] F03 -- No Role-Based Authorization on API Proxy

**Route**: `ALL /api/v1/*`, `ALL /api/people/*`
**File**: `src/routes/api.ts:119-213`

**Problem**: The proxy checks only that a session exists -- any authenticated user can access any API endpoint regardless of their role. A user with `educator` role could access admin endpoints or social worker data. The `roles` field exists on the session but is never consulted in the proxy layer.

**Patch** -- Add route-level role enforcement in `src/routes/api.ts`:

```typescript
// Add at top of api.ts

type RouteRoleRule = Readonly<{
  pathPrefix: string;
  methods: readonly string[];
  allowedRoles: readonly string[];
}>;

/** Role-based access rules. Any route not matching a rule requires any authenticated session. */
const ROUTE_ROLE_RULES: readonly RouteRoleRule[] = [
  // Patient data -- social workers and admins only
  { pathPrefix: "/api/v1/patients", methods: ["GET", "POST", "PUT", "DELETE"], allowedRoles: ["social_worker", "admin"] },
  // Family members -- social workers and admins only
  { pathPrefix: "/api/v1/patients/", methods: ["POST", "PUT", "DELETE"], allowedRoles: ["social_worker", "admin"] },
  // People context -- social workers, admins, and health professionals
  { pathPrefix: "/api/people", methods: ["GET", "POST", "PUT", "DELETE"], allowedRoles: ["social_worker", "admin", "health_professional"] },
] as const;

const isRoleAuthorized = (
  path: string,
  method: string,
  roles: readonly string[],
): boolean => {
  for (const rule of ROUTE_ROLE_RULES) {
    if (path.startsWith(rule.pathPrefix) && rule.methods.includes(method)) {
      return rule.allowedRoles.some((r) => roles.includes(r));
    }
  }
  // No specific rule -- any authenticated user is allowed
  return true;
};

// Then in both /api/v1/* and /api/people/* handlers, after the session check:
// Add after: if (!session) { return c.json({ error: "Unauthorized" }, 401); }
if (!isRoleAuthorized(c.req.path, c.req.method, session.roles)) {
  return c.json({ error: "Forbidden" }, 403);
}
```

---

### [HIGH] F04 -- HMAC Session Cookie Verification Uses String Comparison (Timing Attack)

**File**: `src/adapters/auth/bff_service.ts:127-131`

**Problem**: The `verifySignedSessionId` function compares the HMAC signature using plain string comparison (`sig !== expectedSig`). This is vulnerable to timing attacks where an attacker can measure response time differences to progressively guess valid session cookie signatures one character at a time.

**Patch** -- Replace the string comparison in `verifySignedSessionId` with a constant-time comparison:

```typescript
// In src/adapters/auth/bff_service.ts, replace the verifySignedSessionId function:

export const verifySignedSessionId = async (
  cookieValue: string,
  key: CryptoKey,
): Promise<string | undefined> => {
  const dotIndex = cookieValue.lastIndexOf(".");
  if (dotIndex === -1) return undefined;
  const sessionId = cookieValue.slice(0, dotIndex);

  // Use crypto.subtle.verify for constant-time comparison
  const encoder = new TextEncoder();
  const sigPart = cookieValue.slice(dotIndex + 1);

  // Decode the base64url signature back to bytes
  const base64 = sigPart.replace(/-/g, "+").replace(/_/g, "/");
  let sigBytes: Uint8Array;
  try {
    sigBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  } catch {
    return undefined;
  }

  const isValid = await crypto.subtle.verify(
    "HMAC",
    key,
    sigBytes,
    encoder.encode(sessionId),
  );
  return isValid ? sessionId : undefined;
};
```

---

### [HIGH] F05 -- CSRF Token Comparison Uses String Equality (Timing Attack)

**File**: `src/middleware/csrf.ts:60-63`

**Problem**: The CSRF double-submit cookie comparison uses `cookieToken !== headerToken` which is not constant-time. An attacker could use timing side-channels to progressively discover the CSRF token value.

**Patch** -- Replace in `src/middleware/csrf.ts`:

```typescript
// Add at the top of csrf.ts:
const constantTimeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);
  // Use crypto.subtle.timingSafeEqual if available (Deno 2.x)
  // Fallback: XOR-based comparison
  let result = 0;
  for (let i = 0; i < bufA.length; i++) {
    result |= (bufA[i] ?? 0) ^ (bufB[i] ?? 0);
  }
  return result === 0;
};

// Replace the comparison block (lines 57-66):
if (!path.startsWith("/api/")) {
  const cookieToken = getCookie(c, CSRF_COOKIE);
  const headerToken = c.req.header(CSRF_HEADER);

  if (
    !cookieToken ||
    !headerToken ||
    !constantTimeEqual(cookieToken, headerToken)
  ) {
    return c.json({ error: "Forbidden: CSRF token mismatch" }, 403);
  }
}
```

---

### [MEDIUM] F06 -- No Cache-Control Headers on API Responses

**Routes**: `ALL /api/*`, `GET /api/v1/me`
**Files**: `src/routes/api.ts`, `src/routes/me.ts`

**Problem**: API responses containing sensitive data (patient records, personal data, session info) are served without `Cache-Control: no-store` headers. Browsers and intermediate proxies may cache these responses, leaking sensitive health and social data.

**Patch** -- Add a middleware for all API routes in `src/server.ts`:

```typescript
// Add after the authGuard middleware in server.ts:
app.use("/api/*", async (c, next) => {
  await next();
  c.header("Cache-Control", "no-store, no-cache, must-revalidate");
  c.header("Pragma", "no-cache");
});
```

---

### [MEDIUM] F07 -- No CORS Configuration (Implicit Permissiveness)

**Files**: `src/server.ts`

**Problem**: No explicit CORS policy is configured. While the fetch-metadata middleware (`fetchMetadata`) and `X-Requested-With` requirements provide strong same-origin enforcement, the absence of explicit CORS headers means:
1. No `Access-Control-Allow-Origin` header -- browser behavior varies
2. Preflight requests (OPTIONS) are not handled -- they may fall through to route handlers

Since this is a same-origin BFF, the correct approach is to explicitly deny all cross-origin requests.

**Patch** -- Add CORS denial middleware in `src/server.ts`:

```typescript
// Add before the route registrations in server.ts:
// Explicit CORS denial -- this BFF serves same-origin only.
app.use("/api/*", async (c, next) => {
  // Handle preflight: deny all cross-origin
  if (c.req.method === "OPTIONS") {
    return c.body(null, 204);
  }
  await next();
  // Explicitly set restrictive CORS headers
  c.header("Access-Control-Allow-Origin", ""); // deny by absence
  c.header("Vary", "Origin");
});
```

---

### [MEDIUM] F08 -- Path Parameter Not Validated in Family Composition Route

**Route**: `GET /family-composition/:patientId`
**File**: `src/routes/pages.tsx:66-74`

**Problem**: The `patientId` path parameter is taken directly from the URL and passed into the SSR template without validation. While it is rendered in HTML (not executed), an unvalidated string could contain XSS payloads that get reflected. Additionally, the patientId is passed to the client-side JavaScript context via the `FamilyView` component.

**Patch** -- Validate the patientId as a UUID before rendering:

```typescript
// In src/routes/pages.tsx, replace the family-composition route:
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

pageRoutes.get("/family-composition/:patientId", (c) => {
  const patientId = c.req.param("patientId");
  if (!UUID_REGEX.test(patientId)) {
    return c.text("Invalid patient ID", 400);
  }
  const nonce = c.get("secureHeadersNonce");
  return c.html(
    <AppLayout title="Composicao Familiar" nonce={nonce} scripts={["/static/js/family-composition.js"]}>
      <FamilyView patientId={patientId} />
    </AppLayout>
  );
});
```

---

### [MEDIUM] F09 -- Client Service Builds URLs Without Sanitizing Path Segments

**Files**: `src/client/services/patient-service.ts:82-83`, `src/client/services/family-service.ts:16,22,30`, `src/client/services/people-service.ts:36,60,66,72`

**Problem**: Client services interpolate user-controlled IDs directly into URL paths (e.g., `` `/api/v1/patients/${patientId}` ``). If an ID contains path traversal characters (e.g., `../../../auth/logout`), the fetch request could be directed to unintended endpoints.

**Patch** -- Add a path segment encoder in `src/client/services/base-client.ts`:

```typescript
// Add to base-client.ts:
/** Encodes a single path segment to prevent path traversal. */
export const encodePathSegment = (segment: string): string =>
  encodeURIComponent(segment).replace(/%2F/gi, "");
```

Then update all services to use it:
```typescript
// patient-service.ts:
getById: (patientId: string) =>
  get<PatientDetail>(`/api/v1/patients/${encodePathSegment(patientId)}`),

// family-service.ts:
addMember: (patientId: string, data: unknown) =>
  post<void>(`/api/v1/patients/${encodePathSegment(patientId)}/family-members`, data),
// ... same pattern for all ID interpolations
```

---

### [MEDIUM] F10 -- Auth Login Endpoint Lacks Rate Limiting (PKCE Store Abuse)

**Route**: `GET /auth/login`
**File**: `src/adapters/auth/bff_service.ts:315-361`

**Problem**: While the PKCE store has a 1000-entry cap and TTL sweep, an attacker can repeatedly call `/auth/login` to:
1. Churn the PKCE store, evicting legitimate login attempts
2. Cause repeated OIDC discovery fetches (if cache expires)
3. Generate excessive redirects to the identity provider (Zitadel abuse)

This is addressed by F01 (rate limiting) but deserves specific mention since auth endpoints should have the strictest limits.

---

### [MEDIUM] F11 -- Error Responses May Leak Internal State

**Files**: `src/routes/api.ts:151`, `src/routes/auth.ts:24`

**Problem**: The API proxy maps `RemoteError` values directly into client-facing JSON responses (`UNAUTHORIZED`, `SERVER_ERROR`, `NETWORK_ERROR`, `TIMEOUT`). While these are string literals (not stack traces), the distinction between `SERVER_ERROR`, `NETWORK_ERROR`, and `TIMEOUT` reveals backend infrastructure behavior to the client -- whether the backend is down, unreachable, or slow.

**Patch** -- Normalize upstream errors in `src/routes/api.ts`:

```typescript
// Replace ERROR_STATUS_MAP with a version that normalizes client-facing messages:
const ERROR_RESPONSES: Readonly<Record<RemoteError, Readonly<{ status: ContentfulStatusCode; message: string }>>> = {
  UNAUTHORIZED: { status: 401, message: "Unauthorized" },
  SERVER_ERROR: { status: 502, message: "Service unavailable" },
  NETWORK_ERROR: { status: 502, message: "Service unavailable" },
  TIMEOUT: { status: 504, message: "Service unavailable" },
} as const;

// Then replace usages:
if (!result.ok) {
  const { status, message } = ERROR_RESPONSES[result.error];
  // Log the actual error server-side
  console.error(`Proxy error: ${result.error} for ${method} ${path}`);
  return c.json({ error: message }, status);
}
```

---

### [MEDIUM] F12 -- Auth Callback Error Responses Vary by Failure Mode

**Route**: `GET /auth/callback`
**File**: `src/routes/auth.ts:23-25, 38-40`

**Problem**: The auth callback returns different error messages depending on the failure:
- Missing code/state: 400 `"Missing code or state"`
- Invalid state/PKCE: 401 with the specific `BFFAuthError` string
This allows an attacker to enumerate which phase of the OIDC flow failed, aiding replay/forgery attacks.

**Patch** -- Normalize to a single error response:

```typescript
// In src/routes/auth.ts, replace the callback handler:
auth.get("/auth/callback", async (c) => {
  const code = c.req.query("code");
  const state = c.req.query("state");

  if (!code || !state) {
    return c.redirect("/auth/login?error=auth_failed");
  }

  const result = await authService.callback(code, state);
  if (!result.ok) {
    console.error(`Auth callback failed: ${result.error}`);
    return c.redirect("/auth/login?error=auth_failed");
  }

  c.header("Set-Cookie", result.value.cookieValue);
  return c.redirect("/");
});
```

---

### [MEDIUM] F13 -- Health/Ready Endpoints Expose Server Timestamp

**Route**: `GET /ready`
**File**: `src/routes/health.ts:8-9`

**Problem**: The `/ready` endpoint returns `new Date().toISOString()`, leaking the server's exact clock. This aids timing attacks and helps attackers synchronize attacks against time-based tokens (PKCE, session expiry).

**Patch**:

```typescript
// In src/routes/health.ts, remove the timestamp:
healthRoutes.get("/ready", (c) => {
  return c.json({ status: "ok" });
});
```

---

### [LOW] F14 -- X-Content-Type-Options Missing on API JSON Responses

**Files**: `src/routes/api.ts`, `src/routes/me.ts`

**Problem**: While `securityHeaders` sets `X-Content-Type-Options: nosniff` globally via Hono's `secureHeaders`, API JSON responses do not explicitly set `Content-Type: application/json`. Hono's `c.json()` does set it, so this is informational -- but the `c.body(null, ...)` calls for null-body responses (lines 157-158) do not.

**Patch** -- Already handled by Hono's `c.json()`. No action needed for JSON responses. For null-body responses, this is correct behavior (no body = no sniffing risk).

---

### [LOW] F15 -- Logout Endpoint Uses GET Method

**Route**: `GET /auth/logout`
**File**: `src/routes/auth.ts:49`

**Problem**: Logout is triggered via GET, which means:
1. Prefetch/prerender by browsers could log users out
2. Links in emails/chat could be crafted to force logout (CSRF via GET)
3. The CSRF middleware only protects POST/PUT/DELETE/PATCH

While low severity (logout is non-destructive), it deviates from best practices.

**Patch** -- Change to POST and update any client-side logout links to use forms/fetch:

```typescript
// In src/routes/auth.ts:
auth.post("/auth/logout", (c) => {
  // ... same logic
});
```

---

### [LOW] F16 -- Query Parameters Not Validated in Client Services

**File**: `src/client/services/patient-service.ts:67-78`

**Problem**: The `search` function's `limit` parameter accepts any number. A malicious caller could pass `limit=999999` to request excessive data from the backend. While the backend should enforce limits, defense-in-depth says the BFF should clamp.

**Patch** -- Clamp in the service:

```typescript
// In patient-service.ts search function:
const clampedLimit = Math.min(Math.max(1, limit), 100);
params.set("limit", String(clampedLimit));
```

---

### [LOW] F17 -- No X-DNS-Prefetch-Control Header

**File**: `src/middleware/security_headers.ts`

**Problem**: The security headers do not include `X-DNS-Prefetch-Control: off`. Browsers may prefetch DNS for links in the page, leaking information about what the user is viewing.

**Patch** -- This can be added to the secureHeaders config, but Hono's secureHeaders may not support it directly. Add as a manual header:

```typescript
// In server.ts, after the securityHeaders() middleware:
app.use("*", async (c, next) => {
  await next();
  c.header("X-DNS-Prefetch-Control", "off");
});
```

---

## Middleware Stack Recommendations

The current middleware chain order is correct:
```
securityHeaders -> serveStatic -> csrf -> session -> fetchMetadata -> authGuard
```

**Recommended updated chain with new middleware:**
```
rateLimiter(global) -> securityHeaders -> serveStatic -> csrf -> session -> fetchMetadata -> authGuard -> rateLimiter(auth) -> rateLimiter(api) -> cacheControl(api)
```

In `src/server.ts`, the full recommended order:

```typescript
// 1. Global rate limit (before any processing)
app.use("*", rateLimiter({ max: 200, windowMs: 15 * 60 * 1000 }));

// 2. Security headers
app.use("*", securityHeaders());

// 3. Static files (before CSRF to avoid blocking static assets)
app.use("/static/*", serveStatic({ root: "./" }));

// 4. CSRF
app.use("*", csrf());

// 5. Session resolution
app.use("*", sessionMiddleware());

// 6. Fetch metadata
app.use("*", fetchMetadata());

// 7. Auth guard
app.use("*", authGuard());

// 8. Auth-specific rate limit (stricter)
app.use("/auth/*", rateLimiter({ max: 10, windowMs: 15 * 60 * 1000 }));

// 9. API-specific rate limit (per-minute)
app.use("/api/*", rateLimiter({ max: 60, windowMs: 60 * 1000 }));

// 10. API cache-control
app.use("/api/*", async (c, next) => {
  await next();
  c.header("Cache-Control", "no-store, no-cache, must-revalidate");
  c.header("Pragma", "no-cache");
});
```

---

## Security Dimensions Summary

| Dimension | Score | Notes |
|-----------|-------|-------|
| 1. Transport (HTTPS/HSTS) | GOOD | HSTS max-age=63072000, includeSubDomains. __Host- cookie prefix enforces Secure. |
| 2. Input Validation | PARTIAL | JSON syntax validated, but no schema validation on body fields. No body size limit. Path params unvalidated. |
| 3. Authentication | GOOD | Session-based with HMAC-signed cookies, PKCE, token refresh. But HMAC verify is not timing-safe. |
| 4. Rate Limiting | MISSING | Zero rate limiting on any endpoint. |
| 5. CORS | ADEQUATE | Same-origin enforced via fetchMetadata + X-Requested-With. No explicit CORS headers (acceptable for same-origin BFF). |
| 6. Security Headers | GOOD | CSP with nonce, HSTS, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy. Missing Cache-Control on API responses. |
| 7. Error Handling | PARTIAL | No stack traces leaked, but error strings reveal infrastructure state. Auth errors distinguish failure modes. |
| 8. Response Safety | NEEDS WORK | No Cache-Control: no-store on API responses. No explicit Content-Type on null-body responses. |
| 9. GraphQL | N/A | No GraphQL in this project. |

---

## Priority Order for Remediation

1. **F01** -- Rate limiting (CRITICAL) -- prevents abuse of all endpoints
2. **F02** -- Body size limit (HIGH) -- prevents OOM via large payloads
3. **F03** -- Role-based authorization (HIGH) -- prevents horizontal privilege escalation
4. **F04** -- Timing-safe HMAC verification (HIGH) -- prevents session forgery
5. **F05** -- Timing-safe CSRF comparison (HIGH) -- prevents CSRF token discovery
6. **F06** -- Cache-Control on API responses (MEDIUM) -- prevents data leakage via caches
7. **F08** -- Path parameter validation (MEDIUM) -- prevents reflected XSS
8. **F09** -- Client URL sanitization (MEDIUM) -- prevents path traversal
9. **F11** -- Error response normalization (MEDIUM) -- reduces information disclosure
10. **F12** -- Auth callback error normalization (MEDIUM) -- reduces enumeration surface
11. **F13** -- Remove server timestamp (MEDIUM) -- reduces timing attack surface
12. Remaining LOW items as time permits
