> NOTE: This ticket scope exceeds the 1-atomic-unit rule. In future sprints, break into separate tickets per tab.

# Pipeline Complete: admin-hub-client

## Status: DONE

## Scope
Client-side implementation of the Admin Hub SPA — a 5-tab admin panel (Dashboard, Pessoas, Lookup Tables, Solicitacoes, Auditoria) with full CRUD operations, ARIA accessibility, and responsive design.

## Profile: client-only
Backend (API routes, adminGuard, auditStore) was already implemented. This pipeline built the client layer only.

## Artifacts Produced

### ViewModel (3 files)
- `src/client/viewmodels/admin-hub/types.ts` — AdminState, AdminAction (24 variants), data models
- `src/client/viewmodels/admin-hub/strings.ts` — ADMIN_HUB_STRINGS (PT-BR UX copy)
- `src/client/viewmodels/admin-hub/reducer.ts` — adminReducer + derived state helpers

### Views (22 files)
- `src/client/views/pages/admin-hub-page.tsx` — Page orchestrator (~133 lines)
- `src/client/views/components/admin/` — 21 components:
  admin-header, admin-tab-bar, admin-search-input, stat-card, pending-item,
  audit-entry, people-table, lookup-card, lookup-detail-panel, toggle-switch,
  requests-table, confirm-modal, toast, tab-skeleton, error-state, section-header,
  dashboard-tab, pessoas-tab, lookups-tab, solicitacoes-tab, auditoria-tab

### Service (1 file)
- `src/client/services/admin-service.ts` — getStats, listPeople, createPerson, listAudit

### Infrastructure (4 files modified/created)
- `src/client/apps/admin-hub/entry.tsx` — Client entry point, wires services to page
- `src/views/pages/admin-view.tsx` — SSR shell with user data injection
- `src/routes/pages.tsx` — Added `/admin` route with admin session data
- `Dockerfile` — Added admin-hub bundle step
- `deno.json` — Added admin-hub to build task

## Quality Gates
- `deno check src/server.ts` — PASS
- `deno lint` — PASS (0 errors)
- `deno fmt --check` — PASS
- `deno test` — 797 passed, 0 failed

## Commit Message
```
feat(admin): implement Admin Hub client-side SPA

- ViewModel: 24-action reducer with 5-tab state management
- Views: 22 components following design spec (WCAG 2.1 AA)
- Service: admin-service.ts for people/audit/stats
- Entry: SSR shell + client hydration at /admin
- Responsive: mobile-first, breakpoints at 600px/1200px
- A11Y: ARIA roles, keyboard nav, focus trap, live regions

feat(admin/hub-client): implement Admin Hub client-side SPA

- ViewModel: 24-action reducer with 5-tab state management
- Views: 22 components following design spec (WCAG 2.1 AA)
- Service: admin-service.ts for people/audit/stats
- Entry: SSR shell + client hydration at /admin
- Responsive: mobile-first, breakpoints at 600px/1200px
- A11Y: ARIA roles, keyboard nav, focus trap, live regions
- Error unions: AdminAction (24 variants), Result<T, ServiceError>
- Coverage: deno check PASS, lint PASS, fmt PASS, 797 tests passed

Pipeline: viewmodel-engineer, view-implementer, infra-implementer (manual)
```
