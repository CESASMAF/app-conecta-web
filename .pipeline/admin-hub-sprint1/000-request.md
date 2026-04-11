# 000-request: Admin Hub Sprint 1 MVP

## Scope
Admin Hub module in the BFF (social-care-deno) — middleware, adapter, routes, server integration.
Enables non-technical admins to manage people and lookup tables via proxy to existing backends.

## Classification
- **Layer**: Adapter/Infrastructure only
- **Profile**: infra-only (no domain, no application, no viewmodel, no view)
- **Bounded Context**: admin-hub (new namespace within BFF)

## Sub-tickets (all infra layer)

### T1: admin_guard middleware
- Checks session.roles for "admin" | "owner"
- 403 JSON for /api/admin/*, redirect to / for /admin/* SSR
- Runs AFTER authGuard

### T2: audit_store adapter
- AuditAction: PERSON_CREATED | PERSON_DEACTIVATED | PERSON_REACTIVATED | ROLE_ASSIGNED | ROLE_DEACTIVATED | ROLE_REACTIVATED | LOOKUP_CREATED | LOOKUP_UPDATED | LOOKUP_APPROVED | LOOKUP_REJECTED
- AuditEntry: id, timestamp, actorId, actorName, action, targetId, details, outcome, errorMessage
- In-memory, max 10_000 entries, FIFO eviction
- Factory: createAuditStore() => AuditStore

### T3: api_admin routes (proxy + audit)
- /api/admin/people/* → proxy to people-context (PEOPLE_CONTEXT_BASE_URL)
- /api/admin/lookups/* → proxy to social-care (API_BASE_URL /api/v1/dominios/)
- /api/admin/audit → local audit store
- /api/admin/stats → aggregated dashboard data
- Every mutation: validate → audit.append → proxy → update audit outcome → respond
- X-Actor-Id header sent to backends

### T4: Server integration
- Wire audit store, admin guard, admin routes into server.ts
- Mount adminGuard on /admin/* and /api/admin/*

## Waves

### Wave 0: Design (always)
- [x] domain-architect → 001-contracts/
- [x] test-writer → 002-tests/

### Wave 1: Implementation
- [ ] domain-modeler          ← SKIP: no domain logic
- [ ] application-orchestrator ← SKIP: no use cases
- [ ] viewmodel-engineer      ← SKIP: no client state
- [ ] view-implementer        ← SKIP: SSR pages deferred
- [x] infra-implementer       ← ALL work is here

### Wave 2: Quality Gates
- [x] code-reviewer
- [x] ts-quality-checker
- [x] secure-code-reviewer
- [x] integration-validator

## Backends (DO NOT modify)
- people-context: Bun+Elysia at PEOPLE_CONTEXT_BASE_URL, 12 endpoints
- social-care: Swift/Vapor at API_BASE_URL, /api/v1/dominios/:tableName

## Dependencies
- src/types.ts (AppEnv, Session, ZitadelRole)
- src/middleware/auth_guard.ts (pattern reference)
- src/routes/api.ts (proxy pattern reference)
- src/adapters/auth/session_store.ts (in-memory store pattern reference)
- src/adapters/remote/remote_client.ts (HTTP client for proxying)
