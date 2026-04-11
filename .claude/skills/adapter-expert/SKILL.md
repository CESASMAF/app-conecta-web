---
name: adapter-expert
description: >
  Expert skill for implementing the Adapter layer: Hono HTTP handlers, middlewares, RemoteClient
  (backend proxy), SessionStore, auth OIDC flows, security headers, CSP nonce, Fetch Metadata guards.
  Use when the user mentions: adapter, handler, middleware, route, Hono, session, auth, OIDC, login,
  callback, proxy, RemoteClient, security headers, CSP, CSRF, cookie, BFF, fetch metadata, CORS.
  Also trigger for "create a route for X", "add middleware", "proxy to backend", "implement session store".
  Project uses Deno + Hono (jsr:@hono/hono). Zero node_modules.
---

# Adapter Expert — Hono BFF Security Layer (Deno)

You are the adapter/infrastructure specialist. You implement the **Fronteira de Ferro** (Iron Frontier) — the single Deno server that sits between browser and backend.

## Reference Documents

**Before implementing any auth-related code**, read the auth handbook:
→ `references/auth-handbook.md` — Complete spec: OIDC flow, session store, PKCE, handlers, middleware, security fixes (G1-G11), token refresh, implementation order.
→ `references/hono_reference.md` — Hono docs: routing, middleware, context, request/response, static files, error handling.

The handbook contains exact code for every auth handler, middleware, and security fix. Follow it precisely.

## Architecture: One Server, One Port

```
Browser → Hono (:8081) → Backend Swift/Vapor
         │
         ├── SSR pages (hono/jsx)
         ├── API proxy (/api/*) — injects Bearer token from session
         ├── Auth OIDC (/auth/*) — login, callback, logout
         ├── Static files (/static/*)
         └── Middleware chain (security, session, CSRF, fetch metadata)
```

## Core Rules

1. **Adapters implement Application ports** — The Application layer defines `type` contracts (RemoteClient, SessionStore, EventBus). Adapters provide the real implementation using Hono, fetch, Deno KV.
2. **`try/catch` is ALLOWED here** — But it must ALWAYS convert to `Result` before crossing into domain/application.
3. **The browser NEVER sees tokens** — JWT, refresh token, client secret live in the SessionStore. Browser only has `__Host-session` cookie (HttpOnly, Secure, SameSite=Strict).
4. **All input is untrusted** — Every request body passes through domain smart constructors before reaching the backend.

## Security Middleware Stack

Every request passes through this chain IN ORDER:

```typescript
app.use("*", securityHeaders())     // HSTS, CSP nonce, nosniff, DENY, Referrer, Permissions
app.use("/static/*", serveStatic()) // Static files with cache headers
app.use("*", csrf())                // Origin + Sec-Fetch-Site validation
app.use("*", sessionMiddleware())   // Cookie → SessionStore → c.set("session")
app.use("/api/*", fetchMetadata())  // Sec-Fetch-Site must be same-origin
app.use("/api/*", authGuard())      // Reject if no session
```

## Session Flow

```typescript
// Port (Application layer)
type Session = Readonly<{
  userId: string
  accessToken: string
  refreshToken: string
  expiresAt: number
}>
type SessionStore = Readonly<{
  get: (id: string) => Promise<Result<Session, 'NOT_FOUND' | 'EXPIRED'>>
  set: (id: string, session: Session) => Promise<void>
  delete: (id: string) => Promise<void>
}>

// Adapter (implements port)
// sessionMiddleware reads cookie, resolves session, sets on Hono context
// authGuard rejects if c.get("session") is undefined
```

## API Proxy Pattern

```typescript
app.post("/api/patients", authGuard(), async (c) => {
  const session = c.get("session")
  const body = await c.req.json()
  // Iron Frontier: validate in domain before proxying
  const cpf = CPF(body.cpf)
  if (!cpf.ok) return c.json({ error: cpf.error }, 400)
  // Proxy with token injection
  const result = await remoteClient.post("/patients", body, {
    authorization: `Bearer ${session.accessToken}`,
    "x-actor-id": session.userId,
  })
  if (!result.ok) return c.json({ error: result.error }, 502)
  return c.json(result.value, 201)
})
```

## RemoteClient — Backend communication

```typescript
type RemoteHeaders = Readonly<{ authorization: string; "x-actor-id": string }>
const remoteClient = {
  get: async <T>(path: string, headers: RemoteHeaders): Promise<Result<T, string>> => {
    try {
      const res = await fetch(`${BACKEND_URL}${path}`, { headers: { ...headers, "Content-Type": "application/json" } })
      if (!res.ok) return Err(`BACKEND_${res.status}`)
      return Ok(await res.json() as T)
    } catch { return Err("BACKEND_UNREACHABLE") }
  },
  post: async <T>(path: string, body: unknown, headers: RemoteHeaders): Promise<Result<T, string>> => {
    try {
      const res = await fetch(`${BACKEND_URL}${path}`, {
        method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(body)
      })
      if (!res.ok) return Err(`BACKEND_${res.status}`)
      return Ok(await res.json() as T)
    } catch { return Err("BACKEND_UNREACHABLE") }
  },
}
```

## Auth OIDC Flow

Login: generate PKCE → redirect to IdP → callback: exchange code → store session → set cookie.
Logout: delete session → clear cookie → redirect to IdP logout.
Refresh: check expiresAt → if expired, use refresh_token → update session.

## Cookie Rules

- Name: `__Host-session` (prefix requires Secure + Path=/ + no Domain)
- Flags: `HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=<ttl>`
- Value: 64-char hex (crypto.getRandomValues)

## SSR Pages

```typescript
app.get("/social-care", authGuard(), async (c) => {
  const session = c.get("session")
  const patients = await remoteClient.get("/patients", session)
  return c.render(<SocialCarePage patients={patients.value} />)
})
```

SSR renders with `hono/jsx` (server). Client apps mount with `hono/jsx/dom` (client). These are DIFFERENT imports — never mix.

## Folder Structure
```
src/adapters/
  config/server_config.ts
  auth/bff_service.ts, session_store.ts, auth_repository.ts
  remote/remote_client.ts
  infrastructure/dtos/, mappers/
src/routes/
  health.ts, auth.ts, api.ts, pages.tsx
src/middleware/
  security_headers.ts, session.ts, fetch_metadata.ts, auth_guard.ts
src/views/
  layouts/, pages/, partials/
src/server.ts — single entrypoint
```

## Security Checklist
- [ ] `__Host-session` prefix on cookie
- [ ] HttpOnly, Secure, SameSite=Strict on all cookies
- [ ] CSP with nonce per request (crypto.getRandomValues)
- [ ] HSTS, X-Content-Type-Options: nosniff, X-Frame-Options: DENY
- [ ] Sec-Fetch-Site validation on /api/*
- [ ] X-Requested-With header required on POST/PUT/DELETE
- [ ] PKCE verifiers have TTL (5min) and max entries (1000)
- [ ] Session has expiresAt, auto-delete on expired get()
- [ ] JWT/tokens NEVER sent to browser
- [ ] Backend URL NEVER exposed to browser
- [ ] Domain validation on ALL request bodies before proxying
