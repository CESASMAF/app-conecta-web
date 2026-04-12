# ViewModel Engineer Report -- Admin Hub

**Status:** COMPLETED
**Agent:** viewmodel-engineer
**Ticket:** admin-hub-client

---

## What I Did

Implemented the Admin Hub ViewModel following the spec in 01-feature-spec.md, 03-states-and-flows.md, and 04-copy-a11y-responsive.md. The implementation matches the existing auth-hub viewmodel patterns exactly: pure reducer with exhaustive switch (no default fallback), Readonly types, discriminated union actions, and derived state as separate exported functions.

## Artifacts Produced

| File | Location (src) | Location (pipeline) |
|------|----------------|---------------------|
| types.ts | src/client/viewmodels/admin-hub/types.ts | 003-viewmodel/types.ts |
| strings.ts | src/client/viewmodels/admin-hub/strings.ts | 003-viewmodel/strings.ts |
| reducer.ts | src/client/viewmodels/admin-hub/reducer.ts | 003-viewmodel/reducer.ts |

## Public API

### State Types

- AdminTab: dashboard, pessoas, lookups, solicitacoes, auditoria
- TabLoadState: idle, loading, loaded, error
- AdminState: Full state with fields: activeTab, tabStates, stats, people, peopleSearch, lookupTables, selectedTable, lookupEntries, requests, auditEntries, auditTotal, auditOffset, modal, toast, error
- AdminAction: 24-variant discriminated union covering navigation, dashboard, pessoas, lookups, solicitacoes, audit, modals, and toast

### Data Models

- PersonSummary: id, name, cpf, birthDate, roles, active
- LookupTableSummary: tableName, entryCount
- LookupEntry: id, label, active
- LookupRequest: id, tableName, label, status (pendente/aprovado/rejeitado), requestedBy, reviewedBy, reviewNote, createdAt, updatedAt
- AuditEntry: id, timestamp, actorId, actorName, action, targetId, details, outcome (SUCCESS/FAILURE)

### Constants

- initialState: AdminState -- Default state with dashboard tab active, all tabs idle

### Reducer

- adminReducer(state, action) -> AdminState -- Pure function, exhaustive switch, 24 action handlers, zero side effects

### Derived State Helpers

- filteredPeople(people, search) -> readonly PersonSummary[]
- filteredAudit(entries, search) -> readonly AuditEntry[]
- pendingRequests(requests) -> readonly LookupRequest[]
- pendingRequestCount(requests) -> number
- hasMoreAudit(state) -> boolean

### Strings

- ADMIN_HUB_STRINGS -- All PT-BR UX copy as const object
- Dynamic strings: tabSolicitacoesAria, statPeopleDetail, statRolesDetail, pessoasSearchEmpty, lookupDetailTitle, lookupCardAria, toggleOnAria, toggleOffAria, approvedAt, rejectedReason, approveModalDesc, toastToggled

## Design Decisions

1. No default fallback in switch -- Matches auth-hub pattern
2. Shared closedModal constant -- Avoids repeating same object literal
3. setTabState helper -- Reduces boilerplate for Readonly Record spread pattern
4. Derived state as pure functions -- Keeps reducer focused on state transitions only
5. No persistence file -- Admin Hub does not persist drafts
