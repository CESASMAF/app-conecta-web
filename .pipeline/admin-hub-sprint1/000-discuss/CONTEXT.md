<!-- This file follows the discuss phase convention from pipeline-maestro (000-discuss/CONTEXT.md). -->
<!-- Non-standard folder/filename is expected for discuss phase outputs. -->

# Discuss Context: admin-hub-sprint1

## Mode: assumptions

## Decisions

### Architecture
1. **admin_guard** follows exact same pattern as `authGuard` in `src/middleware/auth_guard.ts` — factory function returning MiddlewareHandler<AppEnv>
2. **audit_store** follows exact same pattern as `createSessionStore` in `src/adapters/auth/session_store.ts` — factory function, in-memory Map, max entries + eviction
3. **api_admin routes** follow exact same pattern as `createApiRoutes` in `src/routes/api.ts` — factory function receiving RemoteClient, returns Hono<AppEnv>
4. **Server integration** follows existing pattern in `server.ts` — import, instantiate, mount

### adminGuard Behavior
- Runs AFTER authGuard (session already resolved)
- Checks `c.get("session")?.roles` for "admin" or "owner"
- For `/api/admin/*`: returns 403 JSON `{ error: "Forbidden: admin role required" }`
- For `/admin/*` SSR: redirects to `/` (not /auth/login since they ARE authenticated)
- Applied via `app.use("/admin/*", adminGuard())` and `app.use("/api/admin/*", adminGuard())`

### Audit Store
- MAX_ENTRIES = 10_000 (same as session store)
- FIFO eviction: when full, remove oldest entries (sorted by timestamp)
- `id`: crypto.randomUUID()
- `timestamp`: new Date().toISOString()
- `append(entry)`: adds with auto-generated id + timestamp
- `list({ limit, offset })`: returns entries sorted by timestamp DESC
- `listByActor(actorId, { limit, offset })`: filtered by actorId
- `count()`: total entries

### Admin Routes — Proxy Pattern
- Uses existing `RemoteClient` for proxying (same as api.ts)
- People routes proxy to `config.peopleContextBaseUrl`
- Lookup routes proxy to `config.apiBaseUrl` (social-care Swift)
- Every mutation: wraps proxy call with audit logging
- `X-Actor-Id` sent to backends using `session.userSub`
- `safeParseBody`, `validateRequestBody`, `toJsonBody`, `toResponseStatus`, `isNullBodyStatus` — extracted from api.ts as shared utilities, OR duplicated in api_admin.ts to avoid touching existing code

### Decision: Shared proxy utilities
- DUPLICATE the utility functions in api_admin.ts rather than extracting shared module
- Reason: avoid modifying api.ts (which is tested and stable)
- Future refactor can extract shared proxy utils when needed

### RemoteRequestOptions.method
- Current type only allows "GET" | "POST" | "PUT" | "DELETE"
- Admin routes need "PATCH" for approve/reject lookups
- Will extend RemoteRequestOptions method union to include "PATCH"

### Stats Endpoint
- `/api/admin/stats` calls:
  - GET /api/v1/people?limit=0 on people-context → extract total count from response
  - GET /api/v1/roles?active=true on people-context → count active roles
  - Audit store count → total admin actions
- Returns aggregated JSON: { people: { total }, roles: { active }, audit: { total } }
- > OPTIMIZATION: Use Promise.all for parallel calls to people-context (count + roles are independent).

## Open Items
- None — scope is well-defined

## User Preferences
- Portuguese for user-facing error messages is NOT needed (JSON API errors are in English)
- Follow existing patterns exactly
- No over-engineering — MVP first
