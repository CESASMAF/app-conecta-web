# 001-contracts REPORT: admin-hub-sprint1

## Agent
domain-architect

## What was defined

### types.ts
- AdminRole: "admin" | "owner" (subset of ZitadelRole)
- ADMIN_ROLES: readonly array constant for guard checks
- AuditAction: 10-variant string literal union
- AuditOutcome: "SUCCESS" | "FAILURE"
- AuditEntry: immutable audit log entry
- AuditAppendInput: input for append (id/timestamp auto-generated)
- AuditListOptions: pagination (limit, offset)
- AuditListResult: paginated result (entries, total)
- AuditStore: store contract (append, list, listByActor, count)
- AdminStats: aggregated dashboard response
- AdminHttpMethod: extends existing method union with "PATCH"
- HasAdminRole: predicate type for session role check

### signatures.ts
- adminGuard(): factory returning MiddlewareHandler<AppEnv>
- createAuditStore(): factory returning AuditStore
- createAdminApiRoutes(deps): factory returning Hono<AppEnv>
- hasAdminRole(session): pure predicate helper
- AdminRoutesDeps: dependency type (remoteClient + auditStore)

### errors.ts
- AdminGuardError: FORBIDDEN_API | FORBIDDEN_SSR
- AuditStoreError: AUDIT_STORE_FULL
- AdminRouteError: NO_SESSION | FORBIDDEN | MALFORMED_JSON_BODY | INVALID_REQUEST_BODY | PROXY_NETWORK_ERROR | PROXY_TIMEOUT | PROXY_UNAUTHORIZED | PROXY_SERVER_ERROR | STATS_FETCH_FAILED
- AdminError: full union of all above

## Public API for downstream agents

### For test-writer (002-tests)
1. adminGuard(): 403 JSON for API, redirect for SSR, pass with admin/owner
2. createAuditStore(): append, list DESC, listByActor, FIFO at 10K, count
3. createAdminApiRoutes(deps): proxy, audit-wrap mutations, stats, validate
4. hasAdminRole(session): true for admin/owner, false otherwise

### For infra-implementer (003-infra)
1. src/middleware/admin_guard.ts: export adminGuard + hasAdminRole
2. src/adapters/admin/audit_store.ts: export createAuditStore
3. src/routes/api_admin.ts: export createAdminApiRoutes
4. src/server.ts: wire auditStore, adminGuard, adminApiRoutes

### Key decisions
- Duplicate proxy utilities in api_admin.ts (do NOT extract from api.ts)
- RemoteRequestOptions.method needs "PATCH" added
- auditStore.append auto-generates id + timestamp
- Stats aggregates from people-context + audit store
- Session.userSub used as X-Actor-Id

## Patterns followed
- adminGuard follows authGuard pattern
- createAuditStore follows createSessionStore pattern
- createAdminApiRoutes follows createApiRoutes pattern
