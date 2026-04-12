# Pipeline Request: admin-hub-client

## Scope
Implement the full client-side of the Admin Hub feature. The backend (API routes, adminGuard middleware, auditStore adapter) is already implemented in `src/routes/api_admin.ts`, `src/middleware/admin_guard.ts`, and `src/adapters/admin/`.

## Classification
- **Profile:** `client-only`
- **Bounded Context:** admin / cross-cutting
- **Atomic Unit:** Full client app (Admin Hub SPA)

## What to Build
1. **ViewModel** — `src/client/viewmodels/admin-hub/` (types.ts, strings.ts, reducer.ts)
2. **Views** — `src/client/views/pages/admin-hub-page.tsx` + components in `src/client/views/components/admin/`
3. **Service** — `src/client/services/admin-service.ts` (people + audit + stats endpoints)
4. **Entry** — `src/client/apps/admin-hub/entry.tsx`
5. **SSR View** — `src/views/pages/admin-view.tsx`
6. **Pages Route** — Add `/admin` route to `src/routes/pages.tsx`
7. **Build Task** — Add admin-hub bundle to `deno.json` build task

## Specs Reference
- `.claude/skills/view-expert/references/features/admin-hub/01-feature-spec.md`
- `.claude/skills/view-expert/references/features/admin-hub/02-components.md`
- `.claude/skills/view-expert/references/features/admin-hub/03-states-and-flows.md`
- `.claude/skills/view-expert/references/features/admin-hub/04-copy-a11y-responsive.md`

## Existing Infrastructure
- `src/routes/api_admin.ts` — All API endpoints already implemented
- `src/client/services/lookup-admin-service.ts` — Lookup CRUD already exists
- `src/client/services/base-client.ts` — Fetch wrapper with Result pattern
- `src/client/styles/tokens.ts` — Design tokens

## Waves

### Wave 0: Design (SKIP — specs are the contracts)
- [SKIP] domain-architect — specs serve as contracts
- [SKIP] test-writer — client-only, no domain tests needed

### Wave 1: Core Implementation (parallel)
- [x] viewmodel-engineer → types.ts, strings.ts, reducer.ts
- [x] view-implementer → admin-hub-page.tsx + 18 components

### Wave 2: Infrastructure (after Wave 1)
- [x] infra-implementer → admin-service.ts, entry.tsx, SSR view, route, build task

### Wave 3: Quality Gates (sequential)
- [x] integration-validator → deno check, lint, fmt, test
