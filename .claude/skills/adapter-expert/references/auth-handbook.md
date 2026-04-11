# Auth Handbook — BFF OIDC with Zitadel (Deno + Hono)

> Reference document for implementing the authentication layer. Read this BEFORE implementing any auth-related code.

## Table of Contents
1. Current State (what exists vs TODO)
2. Architecture & Data Flow
3. Zitadel Configuration
4. Domain Types (auth)
5. BFF Service Implementation
6. Session Store (with security fixes)
7. PKCE State Management (with security fixes)
8. HTTP Handlers (/auth/*)
9. Middleware Chain
10. Security Fixes (G1-G11)
11. Token Refresh Strategy
12. Implementation Order

---

## 1. Current State

| Component | Status | File |
|-----------|--------|------|
| BFF Service (login, callback, logout, refresh logic) | ✅ EXISTS | src/adapters/auth/bff_service.ts |
| Session Store (in-memory Map) | ✅ EXISTS (needs fixes) | src/adapters/auth/session_store.ts |
| RemoteClient (proxy with Bearer injection) | ✅ EXISTS | src/adapters/remote/remote_client.ts |
| Domain types (Session, AuthToken, AuthRole, AuthUser) | ✅ EXISTS | src/domain/auth/ |
| Token query functions (isExpired, expiresWithin) | ✅ EXISTS | src/domain/auth/value_objects/token/queries.ts |
| Auth config (issuer, clientId, scopes) | ✅ EXISTS | src/domain/auth/ports/auth_config.ts |
| HTTP handlers (/auth/login, callback, logout, me, refresh) | ❌ TODO | src/routes/auth.ts |
| Session middleware (cookie → store → context) | ❌ TODO | src/middleware/session.ts |
| Auth guard middleware | ❌ TODO | src/middleware/auth_guard.ts |
| Security headers middleware | ❌ TODO | src/middleware/security_headers.ts |
| Fetch metadata middleware | ❌ TODO | src/middleware/fetch_metadata.ts |
| CSP nonce generation | ❌ TODO | (AppState has cspNonce field, nothing generates it) |
| Cookie handling (__Host-session) | ❌ TODO | (tests reference __session, needs fix to __Host-) |
| Proactive token refresh | ❌ TODO | (domain functions exist, nothing calls them) |

---

## 2. Architecture & Data Flow

```
Browser
  │ Cookie: __Host-session=<64-hex>
  │ X-Requested-With: XMLHttpRequest
  ▼
Hono Server (:8081)
  ├── Middleware: securityHeaders → session → csrf → fetchMetadata → authGuard
  ├── /auth/login      → generate PKCE, redirect to Zitadel
  ├── /auth/callback    → exchange code+verifier for tokens, create session, set cookie
  ├── /auth/logout      → revoke token, delete session, clear cookie
  ├── /auth/me          → return user info from session
  ├── /auth/refresh     → refresh tokens, update session
  ├── /api/*            → authGuard → proxy to backend with Bearer token
  └── /*                → SSR pages (authGuard on protected routes)
```

**Iron Frontier Rule:** Tokens (access, refresh, id) NEVER leave the server. Browser only sees an opaque session cookie.

---

## 3. Zitadel Configuration

| Setting | Value |
|---------|-------|
| Issuer | https://auth.acdgbrasil.com.br |
| Client Type | **Confidential** (with PKCE as defense-in-depth) |
| Client ID | env var: OIDC_CLIENT_ID |
| Client Secret | env var: OIDC_CLIENT_SECRET |
| Redirect URI (dev) | http://localhost:8081/auth/callback |
| Redirect URI (prod) | env var: OIDC_REDIRECT_URI |
| Post-logout URI | (not used — current impl uses token revocation, not end_session) |
| Scopes | openid, profile, email, offline_access, urn:zitadel:iam:org:project:roles |
| Roles Claim Path | urn:zitadel:iam:org:project:roles |
| Roles | social_worker (CRUD), owner (read-only), admin (read + admin area) |

### Endpoints (hardcoded from issuer)

| Purpose | URL |
|---------|-----|
| Authorize | {issuer}/oauth/v2/authorize |
| Token | {issuer}/oauth/v2/token |
| Userinfo | {issuer}/oidc/v1/userinfo |
| Revoke | {issuer}/oauth/v2/revoke |

NOTE: Discovery document (.well-known/openid-configuration) is NOT used. Endpoints are constructed from issuer. This is acceptable for a single IdP but consider fetching discovery for robustness.

---

## 4. Domain Types (auth)

### AuthRole
```typescript
type AuthRole = 'social_worker' | 'owner' | 'admin'
```
- social_worker: CRUD on all social-care modules
- owner: read-only access
- admin: read + admin area

### AuthToken
```typescript
type AuthToken = Readonly<{
  accessToken: string
  refreshToken: string | null  // null on web if not available
  idToken: string | null
  expiresAt: Date
}>
```

### Session (NEEDS FIX: add expiresAt)
```typescript
type Session = Readonly<{
  id: string                    // 64-hex, crypto random
  userId: string                // from OIDC sub claim
  roles: ReadonlySet<AuthRole>
  token: AuthToken
  createdAt: Date
  expiresAt: Date               // ← ADD THIS (G4 fix)
}>
```

### Roles Claim Format (Zitadel)
```json
{
  "urn:zitadel:iam:org:project:roles": {
    "social_worker": { "363110312318140539": "acdgbrasil.com.br" },
    "admin": { "363110312318140539": "acdgbrasil.com.br" }
  }
}
```
Extract OUTER KEYS only. Inner map (orgId → domain) is ignored.

---

## 5. BFF Service — What EXISTS and How It Works

The bff_service.ts contains the core auth logic as a factory function. The HTTP handlers need to CALL these methods.

### login() flow
1. Generate code_verifier: 32 random bytes → hex (64 chars)
2. Generate state: 32 random bytes → hex
3. Compute code_challenge: SHA-256(code_verifier) → base64url
4. Store: pendingVerifiers.set(state, codeVerifier)
5. Return authorize URL with params: response_type=code, client_id, redirect_uri, scope, state, code_challenge, code_challenge_method=S256

### handleCallback(code, state) flow
1. Retrieve code_verifier from pendingVerifiers.get(state)
2. Delete from pendingVerifiers immediately
3. POST to {issuer}/oauth/v2/token with: grant_type=authorization_code, code, redirect_uri, client_id, client_secret, code_verifier
4. Parse response as TokenEndpointResponse
5. Fetch userinfo from {issuer}/oidc/v1/userinfo with Bearer token
6. Extract roles from urn:zitadel:iam:org:project:roles claim
7. Create Session with generated session ID
8. Store in sessionStore
9. Return session

### logout(sessionId) flow
1. Get session from store
2. Delete session from store (ALWAYS, even if revoke fails)
3. If refresh_token exists, POST to {issuer}/oauth/v2/revoke (best-effort, non-fatal)

### refreshToken(sessionId) flow
1. Get session from store (throw if not found)
2. Verify refresh_token exists (throw if not)
3. POST to {issuer}/oauth/v2/token with: grant_type=refresh_token, refresh_token, client_id, client_secret
4. Update session in store with new tokens
5. Return updated session

---

## 6. Session Store — Implementation with Security Fixes

Current: Map<string, Session> with no TTL. Fix required for G4.

```typescript
// FIXED session store
type SessionStore = Readonly<{
  get: (id: string) => Promise<Result<Session, 'NOT_FOUND' | 'EXPIRED'>>
  set: (id: string, session: Session) => Promise<void>
  delete: (id: string) => Promise<void>
}>

function createInMemorySessionStore(ttlMs: number = 8 * 60 * 60 * 1000): SessionStore {
  const sessions = new Map<string, Session>()

  // Periodic sweep of expired sessions (every 5 min)
  setInterval(() => {
    const now = Date.now()
    for (const [id, session] of sessions) {
      if (now > session.expiresAt.getTime()) sessions.delete(id)
    }
  }, 5 * 60 * 1000)

  return {
    get: async (id) => {
      const session = sessions.get(id)
      if (!session) return Err('NOT_FOUND')
      if (Date.now() > session.expiresAt.getTime()) {
        sessions.delete(id)
        return Err('EXPIRED')
      }
      return Ok(session)
    },
    set: async (id, session) => { sessions.set(id, session) },
    delete: async (id) => { sessions.delete(id) },
  }
}
```

Session creation must set expiresAt:
```typescript
const session: Session = {
  id: generateRandomHex(32),
  userId: userinfo.sub,
  roles: extractRoles(userinfo),
  token: { accessToken, refreshToken, idToken, expiresAt: tokenExpiry },
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + SESSION_TTL_MS), // e.g. 8 hours
}
```

---

## 7. PKCE State — Fix for G6

Current: Map with no TTL, no limit. Fix required.

```typescript
type PendingVerifier = Readonly<{ verifier: string; createdAt: number }>

function createPkceStore(ttlMs: number = 5 * 60 * 1000, maxEntries: number = 1000) {
  const pending = new Map<string, PendingVerifier>()

  function sweep() {
    const now = Date.now()
    for (const [state, entry] of pending) {
      if (now - entry.createdAt > ttlMs) pending.delete(state)
    }
  }

  return {
    set: (state: string, verifier: string): Result<void, 'STORE_FULL'> => {
      sweep() // clean expired before adding
      if (pending.size >= maxEntries) return Err('STORE_FULL')
      pending.set(state, { verifier, createdAt: Date.now() })
      return Ok(undefined)
    },
    consume: (state: string): Result<string, 'INVALID_STATE' | 'EXPIRED'> => {
      const entry = pending.get(state)
      if (!entry) return Err('INVALID_STATE')
      pending.delete(state)
      if (Date.now() - entry.createdAt > ttlMs) return Err('EXPIRED')
      return Ok(entry.verifier)
    },
  }
}
```

---

## 8. HTTP Handlers — What Needs to Be Built

### GET /auth/login
```typescript
authRoutes.get("/login", async (c) => {
  const authorizeUrl = bffService.login() // returns URL string
  return c.redirect(authorizeUrl, 302)
})
```

### GET /auth/callback
```typescript
authRoutes.get("/callback", async (c) => {
  const code = c.req.query("code")
  const state = c.req.query("state")
  if (!code || !state) return c.json({ error: "Missing code or state" }, 400)

  const sessionResult = await bffService.handleCallback(code, state)
  if (!sessionResult.ok) return c.json({ error: sessionResult.error }, 401)

  const session = sessionResult.value
  setCookie(c, "__Host-session", session.id, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  })

  return c.redirect("/", 302)
})
```

### GET /auth/me
```typescript
authRoutes.get("/me", async (c) => {
  const session = c.get("session")
  if (!session) return c.json({ error: "UNAUTHORIZED" }, 401)
  return c.json({
    userId: session.userId,
    roles: [...session.roles],
    // name and email are NOT stored in session currently
    // to add them: fetch from userinfo during callback and store in session
  })
})
```

### POST /auth/logout
```typescript
authRoutes.post("/logout", async (c) => {
  const sessionId = c.get("sessionId")
  if (sessionId) {
    await bffService.logout(sessionId)
  }
  deleteCookie(c, "__Host-session", { path: "/" })
  return c.json({ ok: true })
})
```

### POST /auth/refresh
```typescript
authRoutes.post("/refresh", async (c) => {
  const sessionId = c.get("sessionId")
  if (!sessionId) return c.json({ error: "UNAUTHORIZED" }, 401)

  const result = await bffService.refreshToken(sessionId)
  if (!result.ok) {
    deleteCookie(c, "__Host-session", { path: "/" })
    return c.json({ error: result.error }, 401)
  }
  return c.json({ ok: true })
})
```

---

## 9. Middleware Chain — Implementation Spec

### Order (in server.ts)
```typescript
app.use("*", securityHeaders())
app.use("/static/*", serveStatic({ root: "./" }))
app.use("*", csrf())
app.use("*", sessionMiddleware(sessionStore))
app.use("/api/*", fetchMetadataGuard())
app.use("/api/*", authGuard())
```

### securityHeaders()
```typescript
// Generate CSP nonce per request
const nonce = crypto.randomUUID().replace(/-/g, '')
c.set("cspNonce", nonce)

// Set headers
c.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
c.header("X-Content-Type-Options", "nosniff")
c.header("X-Frame-Options", "DENY")
c.header("Referrer-Policy", "strict-origin-when-cross-origin")
c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
c.header("X-DNS-Prefetch-Control", "off")
c.header("Content-Security-Policy",
  `default-src 'none'; script-src 'nonce-${nonce}' 'strict-dynamic'; style-src 'nonce-${nonce}'; connect-src 'self'; img-src 'self'; font-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'`
)
c.header("Cache-Control", "no-store") // for authenticated responses
```

### sessionMiddleware(store)
```typescript
const sessionId = getCookie(c, "__Host-session")
if (sessionId) {
  const result = await store.get(sessionId)
  if (result.ok) {
    c.set("session", result.value)
    c.set("sessionId", sessionId)
  }
  // If expired/not found, don't set — downstream treats as unauthenticated
}
await next()
```

### authGuard()
```typescript
const session = c.get("session")
if (!session) return c.json({ error: "UNAUTHORIZED" }, 401)
await next()
```

### fetchMetadataGuard()
```typescript
const site = c.req.header("Sec-Fetch-Site")
// Allow same-origin and browser-initiated navigation
if (site && site !== "same-origin" && site !== "none") {
  return c.json({ error: "FORBIDDEN" }, 403)
}
// Require X-Requested-With on mutations
const method = c.req.method
if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
  if (!c.req.header("X-Requested-With")) {
    return c.json({ error: "FORBIDDEN" }, 403)
  }
}
await next()
```

---

## 10. Security Fixes Summary

| Gap | Fix | Where |
|-----|-----|-------|
| G1 | Cookie name __session → __Host-session | auth handlers (setCookie) |
| G2 | Cookie Secure: true always | setCookie flags |
| G3 | Cookie Max-Age = SESSION_TTL_SECONDS | setCookie flags |
| G4 | Session.expiresAt + auto-delete on get() | session store + Session type |
| G6 | PKCE store: TTL 5min + max 1000 + sweep | createPkceStore() |
| G7 | Sec-Fetch-Site validation on /api/* | fetchMetadataGuard middleware |
| G8 | X-Requested-With required on POST/PUT/DELETE | fetchMetadataGuard middleware |
| G9 | CSP with nonce per request | securityHeaders middleware |
| G10 | HSTS, nosniff, DENY, Referrer, Permissions | securityHeaders middleware |
| G11 | CI lint: grep for token leaks in src/client/ | CI script (not in runtime code) |

---

## 11. Token Refresh Strategy

### Proactive (recommended, implement as middleware)
```typescript
// refreshGuard middleware — runs before authGuard on /api/*
const session = c.get("session")
if (session && expiresWithin(session.token, 5 * 60 * 1000)) {
  // Token expires within 5 minutes — refresh proactively
  const refreshed = await bffService.refreshToken(session.id)
  if (refreshed.ok) c.set("session", refreshed.value)
  // If refresh fails, continue with current token — it might still work
}
await next()
```

### Reactive (fallback — if backend returns 401)
```typescript
// In API proxy handler, after backend returns 401:
if (backendResponse.status === 401) {
  const refreshed = await bffService.refreshToken(sessionId)
  if (refreshed.ok) {
    // Retry the original request with new token
    const retryResponse = await remoteClient.get(path, refreshed.value)
    return c.json(await retryResponse.json(), retryResponse.status)
  }
  // Refresh failed — session is dead
  deleteCookie(c, "__Host-session", { path: "/" })
  return c.json({ error: "SESSION_EXPIRED" }, 401)
}
```

---

## 12. Implementation Order (Pipeline Tickets)

Each ticket follows the pipeline: architect → test → implement → review → validate.

| # | Ticket | Scope | Agents |
|---|--------|-------|--------|
| 1 | Fix Session type (add expiresAt) | Value Object | domain-architect → test-writer → domain-modeler |
| 2 | Fix Session Store (TTL, auto-delete) | Adapter | domain-architect → test-writer → infra-implementer |
| 3 | Create PKCE Store (TTL, max entries) | Adapter | domain-architect → test-writer → infra-implementer |
| 4 | Security Headers middleware | Middleware | domain-architect → test-writer → infra-implementer |
| 5 | Session middleware | Middleware | domain-architect → test-writer → infra-implementer |
| 6 | Fetch Metadata Guard middleware | Middleware | domain-architect → test-writer → infra-implementer |
| 7 | Auth Guard middleware | Middleware | domain-architect → test-writer → infra-implementer |
| 8 | GET /auth/login handler | Route | domain-architect → test-writer → infra-implementer |
| 9 | GET /auth/callback handler | Route | domain-architect → test-writer → infra-implementer |
| 10 | GET /auth/me handler | Route | domain-architect → test-writer → infra-implementer |
| 11 | POST /auth/logout handler | Route | domain-architect → test-writer → infra-implementer |
| 12 | POST /auth/refresh handler | Route | domain-architect → test-writer → infra-implementer |
| 13 | Proactive refresh middleware | Middleware | domain-architect → test-writer → infra-implementer |
| 14 | API proxy with 401 retry | Route | domain-architect → test-writer → infra-implementer |

Do tickets 1-3 FIRST (fixes), then 4-7 (middleware), then 8-12 (handlers), then 13-14 (refresh).
