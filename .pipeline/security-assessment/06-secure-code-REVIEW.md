# Security Code Review -- Social Care BFF (Final Pass)
**Date**: 2026-04-11
**Reviewer**: secure-code-reviewer agent (appsec-code-reviewer skill)
**Scope**: Full 10-dimension defensive review, filtering out 11 previously-reported findings

## Summary
- **NEW issues found: 9** (Critical: 1 | High: 3 | Medium: 3 | Low: 1 | Info: 1)
- **Top 3 priorities**:
  1. [CRITICAL] `validateIdTokenClaims` skips validation when claims are undefined -- attacker can craft token with missing iss/aud/exp
  2. [HIGH] Logout via GET is a state-changing operation vulnerable to CSRF via link/image prefetch
  3. [HIGH] Unsanitized `patientId` URL parameter rendered into SSR HTML data-attribute (stored XSS vector)

## Positive Findings

1. **Strong BFF architecture** -- tokens never reach the browser; session is opaque cookie with HMAC signature.
2. **PKCE with S256** -- proper code challenge flow with TTL and max-entries enforcement.
3. **Domain layer is clean** -- zero `throw`, `class`, `this`, or `new Error` found in `src/domain/`.
4. **CSP with per-request nonce** -- using Hono's built-in NONCE constant with `strict-dynamic`.
5. **Sec-Fetch-Site + X-Requested-With** on all API methods -- defense-in-depth against cross-origin abuse.
6. **Session store bounds** -- MAX_SESSIONS with sweep and eviction prevents unbounded memory growth.
7. **Double-submit CSRF cookie** on non-API mutations.
8. **`.env` is in `.gitignore`** -- `.env`, `.env.local`, `.env.production`, `.env.staging` all excluded.
9. **Client services return `Result<T, E>`** -- never throw, auto-redirect on 401.
10. **No `dangerouslySetInnerHTML` or `innerHTML`** anywhere in the codebase.

---

## Issues

### [CRITICAL] id_token claim validation skips when claims are undefined (MUST_FIX)

**File**: `src/adapters/auth/bff_service.ts:184-206`
**Category**: Authentication

**Problem**: `validateIdTokenClaims` only validates `iss`, `aud`, and `exp` when those fields are *present* in the payload. If an attacker crafts a token where these fields are simply absent (which is trivially possible since the token is decoded without cryptographic verification -- a known issue), all three checks are skipped and the token is accepted. The validation should *require* these claims to be present, not treat their absence as acceptable.

**Before** (insecure):
```typescript
const validateIdTokenClaims = (
  payload: JWTPayload,
  expectedIssuer: string,
  expectedClientId: string,
): Result<JWTPayload, "ID_TOKEN_DECODE_FAILED"> => {
  // Validate issuer claim
  if (payload.iss !== undefined && payload.iss !== expectedIssuer) {
    return err("ID_TOKEN_DECODE_FAILED");
  }
  // Validate audience claim
  if (payload.aud !== undefined) {
    const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (!audiences.includes(expectedClientId)) {
      return err("ID_TOKEN_DECODE_FAILED");
    }
  }
  // Validate expiration claim
  if (payload.exp !== undefined) {
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (payload.exp < nowSeconds) {
      return err("ID_TOKEN_DECODE_FAILED");
    }
  }
  return ok(payload);
};
```

**After** (secure):
```typescript
const validateIdTokenClaims = (
  payload: JWTPayload,
  expectedIssuer: string,
  expectedClientId: string,
): Result<JWTPayload, "ID_TOKEN_DECODE_FAILED"> => {
  // REQUIRE issuer claim
  if (payload.iss === undefined || payload.iss !== expectedIssuer) {
    return err("ID_TOKEN_DECODE_FAILED");
  }
  // REQUIRE audience claim
  if (payload.aud === undefined) {
    return err("ID_TOKEN_DECODE_FAILED");
  }
  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!audiences.includes(expectedClientId)) {
    return err("ID_TOKEN_DECODE_FAILED");
  }
  // REQUIRE expiration claim
  if (payload.exp === undefined) {
    return err("ID_TOKEN_DECODE_FAILED");
  }
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (payload.exp < nowSeconds) {
    return err("ID_TOKEN_DECODE_FAILED");
  }
  return ok(payload);
};
```

**Why it matters**: Combined with the already-known finding that the id_token is decoded without signature verification, this means an attacker who can intercept the TLS connection to the OIDC provider (or who can inject a crafted token response) can create a token with `{"sub":"admin"}` and no iss/aud/exp, and it will be accepted. The claims guard is the last line of defense when signature verification is absent.

---

### [HIGH] Logout via GET is a state-changing operation (MUST_FIX)

**File**: `src/routes/auth.ts:49`
**Category**: CSRF

**Problem**: Logout destroys the server-side session and is triggered by `GET /auth/logout`. Because the CSRF middleware only validates tokens on POST/PUT/DELETE/PATCH, and because `/auth/` is a public prefix path in `auth_guard.ts` (bypasses session check), any page or external site can trigger logout by embedding `<img src="/auth/logout">` or via a link prefetch. This is a session destruction attack.

Additionally, on the client side (`auth-hub-page.tsx:58`), logout is triggered via `location.href = "/auth/logout"` -- confirming this is designed as a GET navigation.

**Before** (insecure):
```typescript
// routes/auth.ts
auth.get("/auth/logout", (c) => {
  const sessionId = c.get("sessionId");
  // ... destroys session
});
```

**After** (secure):
```typescript
// routes/auth.ts -- Change to POST
auth.post("/auth/logout", (c) => {
  const sessionId = c.get("sessionId");
  if (!sessionId) {
    return c.redirect("/auth/login");
  }
  const { endSessionUrl } = authService.logout(sessionId);
  deleteCookie(c, SESSION_COOKIE, {
    path: "/",
    secure: true,
    httpOnly: true,
    sameSite: "Strict",
  });
  if (endSessionUrl) {
    return c.redirect(endSessionUrl);
  }
  return c.redirect("/auth/login");
});

// Client side -- Change to form submission or fetch POST
const handleLogout = async (): Promise<void> => {
  await fetch("/auth/logout", {
    method: "POST",
    credentials: "same-origin",
    headers: { "X-Requested-With": "XMLHttpRequest" },
  });
  globalThis.location.href = "/auth/login";
};
```

**Why it matters**: An attacker can force-logout any user by getting them to visit a page containing `<img src="https://target.example/auth/logout">`. While this doesn't directly compromise data, it is a denial-of-service vector and can be chained with phishing (logout user -> redirect to fake login).

---

### [HIGH] Unsanitized patientId URL param rendered into SSR HTML (MUST_FIX)

**File**: `src/routes/pages.tsx:67-68` and `src/views/pages/family-view.tsx:8`
**Category**: Output Encoding / XSS

**Problem**: The `patientId` route parameter from `c.req.param("patientId")` is passed directly as a JSX prop and rendered into the `data-patient-id` HTML attribute without validation. While Hono's JSX engine does attribute-encode values (preventing attribute breakout in most cases), the patientId should be validated as a UUID before use. If the JSX engine has any edge case in attribute encoding, or if the value is consumed by client JS without sanitization, this could become an XSS vector. Defense-in-depth requires input validation at the boundary.

**Before** (no validation):
```typescript
// routes/pages.tsx
pageRoutes.get("/family-composition/:patientId", (c) => {
  const patientId = c.req.param("patientId");
  // ... passed directly to view
});
```

**After** (secure):
```typescript
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

pageRoutes.get("/family-composition/:patientId", (c) => {
  const patientId = c.req.param("patientId");
  if (!UUID_RE.test(patientId)) {
    return c.notFound();
  }
  const nonce = c.get("secureHeadersNonce");
  return c.html(
    <AppLayout title="Composicao Familiar" nonce={nonce} scripts={["/static/js/family-composition.js"]}>
      <FamilyView patientId={patientId} />
    </AppLayout>
  );
});
```

**Why it matters**: The client code at `family-composition/entry.tsx:8` also extracts `patientId` from the URL path and uses it directly in API calls like `/api/v1/patients/${patientId}/family-members`. Without server-side validation, a crafted URL like `/family-composition/../../admin/something` could manipulate the API path construction, even though the proxy would likely reject it.

---

### [HIGH] No Cache-Control on authenticated responses (MUST_FIX)

**File**: `src/middleware/security_headers.ts` and `src/routes/me.ts`
**Category**: Data Protection

**Problem**: Authenticated pages and the `/api/v1/me` endpoint return user data (name, roles, initials) but no `Cache-Control: no-store` header is set. Browsers and intermediate proxies may cache these responses. On shared or public computers, the next user could see cached PII by hitting the back button or checking browser cache.

**Before** (no cache control):
```typescript
// security_headers.ts -- no Cache-Control configured
export const securityHeaders = () =>
  honoSecureHeaders({
    // ... no cache-control
  });
```

**After** (secure):
```typescript
// Add a middleware for authenticated routes that sets Cache-Control
// Option A: In security_headers or as a separate middleware
app.use("*", async (c, next) => {
  await next();
  // For non-static responses, prevent caching
  if (!c.req.path.startsWith("/static/")) {
    c.header("Cache-Control", "no-store, no-cache, must-revalidate");
    c.header("Pragma", "no-cache");
  }
});
```

**Why it matters**: PII (user name, roles) returned by `/api/v1/me` and rendered in SSR pages can be retrieved from browser cache on shared machines. OWASP ASVS V3.3.1 requires that authenticated responses contain anti-caching headers.

---

### [MEDIUM] OIDC callback does not handle `error` query parameter (SHOULD_FIX)

**File**: `src/routes/auth.ts:30-36`
**Category**: Error Handling

**Problem**: The OIDC specification states that when authorization fails, the provider redirects back with `?error=access_denied&error_description=...` instead of `?code=...&state=...`. The current callback handler only checks for missing `code` or `state` and returns a generic 400. It does not check for an `error` parameter, meaning the user sees "Missing code or state" instead of the actual error reason. More importantly, the `error_description` parameter (user-controlled in some IdPs) is not checked, so if it were ever rendered to the user it would be an XSS risk.

**Before**:
```typescript
auth.get("/auth/callback", async (c) => {
  const code = c.req.query("code");
  const state = c.req.query("state");
  if (!code || !state) {
    return c.json({ error: "Missing code or state" }, 400);
  }
  // ...
});
```

**After**:
```typescript
auth.get("/auth/callback", async (c) => {
  // Check for OIDC error response first
  const oidcError = c.req.query("error");
  if (oidcError) {
    // Log the error_description server-side only (never render to user)
    console.error(`OIDC error: ${oidcError}`);
    return c.redirect("/login?auth_error=1");
  }

  const code = c.req.query("code");
  const state = c.req.query("state");
  if (!code || !state) {
    return c.redirect("/login?auth_error=1");
  }
  // ...
});
```

**Why it matters**: Proper OIDC error handling improves UX and prevents potential information leakage from `error_description`.

---

### [MEDIUM] Client-side patientId extraction from URL path lacks validation (SHOULD_FIX)

**File**: `src/client/apps/family-composition/entry.tsx:7-8`
**Category**: Input Validation

**Problem**: The client extracts `patientId` from the URL path by splitting on `/` and indexing. This value is then used directly in API fetch calls (`/api/v1/patients/${patientId}/family-members`). While the server-side proxy protects against most abuse (requires auth session + X-Requested-With), a malicious patientId could contain encoded path traversal characters that survive URL splitting.

**Before**:
```typescript
const pathParts = window.location.pathname.split("/")
const patientId = pathParts[pathParts.indexOf("family-composition") + 1] ?? ""
```

**After**:
```typescript
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const pathParts = window.location.pathname.split("/");
const rawId = pathParts[pathParts.indexOf("family-composition") + 1] ?? "";
const patientId = UUID_RE.test(rawId) ? rawId : "";
if (!patientId) {
  // Show error or redirect
}
```

**Why it matters**: Defense-in-depth. Even though the server validates the session, validating the format of IDs on the client prevents accidental misuse in API path construction.

---

### [MEDIUM] id_token claims not validated during token refresh (SHOULD_FIX)

**File**: `src/adapters/auth/bff_service.ts:512-520`
**Category**: Authentication

**Problem**: During the `refresh` flow, when a new `id_token` is received, the code only calls `decodeIdTokenPayload` to extract roles but does NOT call `validateIdTokenClaims`. This means a refreshed id_token with an expired `exp`, wrong `iss`, or wrong `aud` would still have its roles extracted and applied to the session.

**Before**:
```typescript
// In refresh():
if (tokenData.id_token !== undefined) {
  newIdToken = tokenData.id_token;
  const decodeResult = decodeIdTokenPayload(tokenData.id_token);
  if (decodeResult.ok) {
    const rolesClaim = decodeResult.value[ROLES_CLAIM_KEY];
    if (rolesClaim !== undefined) {
      newRoles = Object.keys(rolesClaim);
    }
  }
}
```

**After**:
```typescript
// In refresh():
if (tokenData.id_token !== undefined) {
  newIdToken = tokenData.id_token;
  const decodeResult = decodeIdTokenPayload(tokenData.id_token);
  if (decodeResult.ok) {
    const claimsResult = validateIdTokenClaims(
      decodeResult.value,
      config.oidc.issuer,
      config.oidc.clientId,
    );
    if (claimsResult.ok) {
      const rolesClaim = claimsResult.value[ROLES_CLAIM_KEY];
      if (rolesClaim !== undefined) {
        newRoles = Object.keys(rolesClaim);
      }
    }
    // If claims validation fails, keep previous roles (safe default)
  }
}
```

**Why it matters**: Without claim validation on refresh, a compromised or replayed id_token could inject elevated roles into an existing session.

---

### [LOW] CSRF cookie not set on OIDC callback response (SHOULD_FIX)

**File**: `src/middleware/csrf.ts:38-52` and `src/routes/auth.ts:30-46`
**Category**: CSRF

**Problem**: The CSRF middleware sets the `__Host-csrf` cookie only if it is missing on safe (GET) requests. However, after a successful OIDC callback, the response is a `302 redirect` to `/`. The CSRF cookie may not be set until the user's browser follows the redirect and makes the subsequent GET. If client JS on the landing page immediately makes a mutating request (e.g., updating a draft), the CSRF cookie might not yet be available. This is a narrow timing window but worth noting.

**Why it matters**: Race condition where a fast client-side mutation after login could fail with a 403 CSRF error, degrading UX.

---

### [INFO] Deno permissions allow full network and env access

**File**: `Dockerfile:37` and `deno.json:7`
**Category**: Defense in Depth

**Problem**: The production CMD uses `--allow-net` (all hosts), `--allow-env` (all environment variables), and `--allow-read` (all files). Deno's permission system supports granular host/path allowlists that could limit blast radius if the process is compromised.

**Recommendation**:
```dockerfile
CMD ["deno", "run", \
  "--allow-net=0.0.0.0:8081,auth.acdgbrasil.com.br,<backend-host>", \
  "--allow-env=PORT,HOST,SESSION_TTL_MINUTES,API_BASE_URL,PEOPLE_CONTEXT_BASE_URL,OIDC_ISSUER,OIDC_CLIENT_ID,OIDC_CLIENT_SECRET,OIDC_REDIRECT_URI,SESSION_SECRET", \
  "--allow-read=src/,static/,deno.json", \
  "src/server.ts"]
```

**Why it matters**: If an SSRF or code injection vulnerability is discovered, broad Deno permissions allow the attacker to access any network host, read any file, and exfiltrate any environment variable.

---

## Tooling Recommendations

1. **`deno lint` custom rule or pre-commit hook** -- Enforce that `validateIdTokenClaims` is always called after `decodeIdTokenPayload`.
2. **CSP reporting** -- Add `report-uri` or `report-to` directive to detect CSP violations in production.
3. **`deno test --coverage`** -- Ensure middleware tests cover the edge cases identified (missing claims, GET logout CSRF, error callback).
4. **Dependency pinning** -- `deno.json` uses `^4` for Hono. Consider pinning to exact version or using `deno.lock` for reproducible builds.
5. **OWASP ZAP or Nuclei** -- Automated DAST scanning in CI to catch header misconfigurations and auth bypasses.

---

## Verdict

**NEEDS FIXES**

### MUST_FIX (Critical/High -- block deployment):
1. `validateIdTokenClaims` must require iss/aud/exp (not skip when undefined)
2. Change logout from GET to POST
3. Validate patientId as UUID on the server before rendering into HTML
4. Add `Cache-Control: no-store` to authenticated responses

### SHOULD_FIX (Medium/Low -- address before next release):
5. Handle OIDC `error` query parameter in callback
6. Validate patientId format on client side
7. Call `validateIdTokenClaims` during token refresh flow
8. Ensure CSRF cookie is set before first client-side mutation after login
9. Restrict Deno permissions to minimum required hosts/paths/env vars
