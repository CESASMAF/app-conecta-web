# Admin Hub — Feature Spec

> Documento principal da feature. Define o fluxo, layout, ViewModel e tipos.
> Leia `design-tokens.md` e `components-catalog.md` antes.

## Fluxo de Decisao (Entrada → Destino)

```
Usuario autenticado com role admin/owner
  ├── Acessa /admin ou clica card "Administracao" no Auth Hub
  │   ├── adminGuard verifica session.roles
  │   │   ├── TEM admin/owner → renderiza Admin Hub shell
  │   │   └── NAO TEM → redirect / (Auth Hub)
  │   │
  │   └── Client hydrates → Tab Dashboard (default)
  │       ├── GET /api/admin/stats → stats cards
  │       ├── GET /api/admin/lookups/requests → pending items
  │       └── GET /api/admin/audit?limit=5 → recent activity
  │
  ├── Navega entre tabs (client-side, sem reload)
  │   ├── Dashboard → carrega stats + pendentes + audit recente
  │   ├── Pessoas → GET /api/admin/people → tabela
  │   ├── Lookup Tables → lista de 13 tabelas → click → GET /api/admin/lookups/:table
  │   ├── Solicitacoes → GET /api/admin/lookups/requests → tabela com acoes
  │   └── Auditoria → GET /api/admin/audit?limit=20&offset=0 → log paginado
  │
  └── Acoes de mutacao (POST/PUT/PATCH):
      ├── Criar pessoa → POST /api/admin/people → audit PERSON_CREATED
      ├── Atribuir role → POST /api/admin/people/:id/roles → audit ROLE_ASSIGNED
      ├── Toggle lookup → PATCH /api/admin/lookups/:table/:id/toggle → audit LOOKUP_TOGGLED
      ├── Criar request → POST /api/admin/lookups/requests → audit LOOKUP_REQUEST_CREATED
      ├── Aprovar → PUT /api/admin/lookups/requests/:id/approve → audit LOOKUP_REQUEST_APPROVED
      └── Rejeitar → PUT /api/admin/lookups/requests/:id/reject → audit LOOKUP_REQUEST_REJECTED
```

Decisoes-chave:
- Toda mutacao gera audit entry automaticamente (server-side)
- Header `X-Actor-Id` e enviado em TODA request ao backend
- Lookup tables tem whitelist de 13 nomes validos (path traversal prevention)
- UUIDs sao validados server-side antes de proxy
- Tab state vive no client (reducer), dados sao fetched on-demand por tab

---

## Page Structure

```
AdminHubPage (orchestrator, ~100 lines)
├── useReducer(adminReducer, initialState)
├── useEffect: loadDashboard on mount
├── useEffect: loadTabData on tab change
│
├── AdminHeader (sempre visivel)
├── AdminTabBar (sempre visivel)
│
├── [tab === 'dashboard']     DashboardTab
├── [tab === 'pessoas']       PessoasTab
├── [tab === 'lookups']       LookupsTab
├── [tab === 'solicitacoes']  SolicitacoesTab
├── [tab === 'auditoria']     AuditoriaTab
│
├── ConfirmModal (condicional — approve/reject)
└── Toast (condicional — success/error feedback)
```

O Page e um orchestrator puro: le state, despacha actions, e renderiza a tab correta. Fetches sao feitos via services injetados.

---

## ViewModel (adminReducer)

```typescript
// src/client/viewmodels/admin-hub/types.ts

type AdminTab = 'dashboard' | 'pessoas' | 'lookups' | 'solicitacoes' | 'auditoria'
type TabLoadState = 'idle' | 'loading' | 'loaded' | 'error'

type AdminState = Readonly<{
  activeTab: AdminTab
  tabStates: Readonly<Record<AdminTab, TabLoadState>>

  // Dashboard
  stats: Readonly<{
    people: Readonly<{ total: number }>
    roles: Readonly<{ active: number }>
    audit: Readonly<{ total: number }>
    pendingRequests: number
  }> | null

  // Pessoas
  people: readonly PersonSummary[]
  peopleSearch: string

  // Lookups
  lookupTables: readonly LookupTableSummary[]
  selectedTable: string | null
  lookupEntries: readonly LookupEntry[]

  // Solicitacoes
  requests: readonly LookupRequest[]

  // Auditoria
  auditEntries: readonly AuditEntry[]
  auditTotal: number
  auditOffset: number

  // UI
  modal: Readonly<{
    type: 'approve' | 'reject' | null
    targetId: string | null
    targetLabel: string | null
  }>
  toast: Readonly<{
    type: 'success' | 'error'
    message: string
  }> | null
  error: Readonly<{
    title: string
    message: string
  }> | null
}>
```

### Data Models

```typescript
type PersonSummary = Readonly<{
  id: string
  name: string
  cpf: string
  birthDate: string
  roles: readonly string[]
  active: boolean
}>

type LookupTableSummary = Readonly<{
  tableName: string
  entryCount: number
}>

type LookupEntry = Readonly<{
  id: string
  label: string
  active: boolean
}>

type LookupRequest = Readonly<{
  id: string
  tableName: string
  label: string
  status: 'pendente' | 'aprovado' | 'rejeitado'
  requestedBy: string
  reviewedBy: string | null
  reviewNote: string | null
  createdAt: string
  updatedAt: string
}>

type AuditEntry = Readonly<{
  id: string
  timestamp: string
  actorId: string
  actorName: string
  action: string
  targetId: string | null
  details: string | null
  outcome: 'SUCCESS' | 'FAILURE'
}>
```

### Actions

```typescript
type AdminAction =
  // Navigation
  | Readonly<{ type: 'SWITCH_TAB'; tab: AdminTab }>

  // Dashboard
  | Readonly<{ type: 'LOAD_DASHBOARD_START' }>
  | Readonly<{ type: 'LOAD_DASHBOARD_SUCCESS'; stats: AdminState['stats']; pendingRequests: readonly LookupRequest[]; recentAudit: readonly AuditEntry[] }>
  | Readonly<{ type: 'LOAD_DASHBOARD_FAILURE'; title: string; message: string }>

  // Pessoas
  | Readonly<{ type: 'LOAD_PEOPLE_START' }>
  | Readonly<{ type: 'LOAD_PEOPLE_SUCCESS'; people: readonly PersonSummary[] }>
  | Readonly<{ type: 'LOAD_PEOPLE_FAILURE' }>
  | Readonly<{ type: 'SET_PEOPLE_SEARCH'; query: string }>

  // Lookups
  | Readonly<{ type: 'LOAD_LOOKUPS_START' }>
  | Readonly<{ type: 'LOAD_LOOKUPS_SUCCESS'; tables: readonly LookupTableSummary[] }>
  | Readonly<{ type: 'LOAD_LOOKUPS_FAILURE' }>
  | Readonly<{ type: 'SELECT_LOOKUP_TABLE'; tableName: string }>
  | Readonly<{ type: 'LOAD_ENTRIES_SUCCESS'; entries: readonly LookupEntry[] }>
  | Readonly<{ type: 'TOGGLE_ENTRY_SUCCESS'; entryId: string; active: boolean }>

  // Solicitacoes
  | Readonly<{ type: 'LOAD_REQUESTS_START' }>
  | Readonly<{ type: 'LOAD_REQUESTS_SUCCESS'; requests: readonly LookupRequest[] }>
  | Readonly<{ type: 'LOAD_REQUESTS_FAILURE' }>

  // Audit
  | Readonly<{ type: 'LOAD_AUDIT_START' }>
  | Readonly<{ type: 'LOAD_AUDIT_SUCCESS'; entries: readonly AuditEntry[]; total: number }>
  | Readonly<{ type: 'LOAD_MORE_AUDIT_SUCCESS'; entries: readonly AuditEntry[]; total: number }>
  | Readonly<{ type: 'LOAD_AUDIT_FAILURE' }>

  // Modals
  | Readonly<{ type: 'OPEN_MODAL'; modalType: 'approve' | 'reject'; targetId: string; targetLabel: string }>
  | Readonly<{ type: 'CLOSE_MODAL' }>
  | Readonly<{ type: 'APPROVE_SUCCESS'; requestId: string }>
  | Readonly<{ type: 'REJECT_SUCCESS'; requestId: string }>

  // Toast
  | Readonly<{ type: 'SHOW_TOAST'; toast: AdminState['toast'] }>
  | Readonly<{ type: 'HIDE_TOAST' }>
```

### Reducer (esqueleto)

```typescript
// src/client/viewmodels/admin-hub/reducer.ts

function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case 'SWITCH_TAB':
      return { ...state, activeTab: action.tab, error: null }

    case 'LOAD_DASHBOARD_START':
      return { ...state, tabStates: { ...state.tabStates, dashboard: 'loading' } }

    case 'LOAD_DASHBOARD_SUCCESS':
      return {
        ...state,
        tabStates: { ...state.tabStates, dashboard: 'loaded' },
        stats: action.stats,
        requests: action.pendingRequests,
        auditEntries: action.recentAudit,
      }

    case 'LOAD_DASHBOARD_FAILURE':
      return {
        ...state,
        tabStates: { ...state.tabStates, dashboard: 'error' },
        error: { title: action.title, message: action.message },
      }

    case 'LOAD_PEOPLE_START':
      return { ...state, tabStates: { ...state.tabStates, pessoas: 'loading' } }

    case 'LOAD_PEOPLE_SUCCESS':
      return { ...state, tabStates: { ...state.tabStates, pessoas: 'loaded' }, people: action.people }

    case 'LOAD_PEOPLE_FAILURE':
      return { ...state, tabStates: { ...state.tabStates, pessoas: 'error' } }

    case 'SET_PEOPLE_SEARCH':
      return { ...state, peopleSearch: action.query }

    case 'LOAD_LOOKUPS_START':
      return { ...state, tabStates: { ...state.tabStates, lookups: 'loading' } }

    case 'LOAD_LOOKUPS_SUCCESS':
      return { ...state, tabStates: { ...state.tabStates, lookups: 'loaded' }, lookupTables: action.tables }

    case 'SELECT_LOOKUP_TABLE':
      return { ...state, selectedTable: action.tableName, lookupEntries: [] }

    case 'LOAD_ENTRIES_SUCCESS':
      return { ...state, lookupEntries: action.entries }

    case 'TOGGLE_ENTRY_SUCCESS': {
      const updated = state.lookupEntries.map(e =>
        e.id === action.entryId ? { ...e, active: action.active } : e
      )
      return { ...state, lookupEntries: updated }
    }

    case 'LOAD_REQUESTS_START':
      return { ...state, tabStates: { ...state.tabStates, solicitacoes: 'loading' } }

    case 'LOAD_REQUESTS_SUCCESS':
      return { ...state, tabStates: { ...state.tabStates, solicitacoes: 'loaded' }, requests: action.requests }

    case 'LOAD_AUDIT_START':
      return { ...state, tabStates: { ...state.tabStates, auditoria: 'loading' } }

    case 'LOAD_AUDIT_SUCCESS':
      return { ...state, tabStates: { ...state.tabStates, auditoria: 'loaded' }, auditEntries: action.entries, auditTotal: action.total, auditOffset: action.entries.length }

    case 'LOAD_MORE_AUDIT_SUCCESS':
      return { ...state, auditEntries: [...state.auditEntries, ...action.entries], auditTotal: action.total, auditOffset: state.auditOffset + action.entries.length }

    case 'OPEN_MODAL':
      return { ...state, modal: { type: action.modalType, targetId: action.targetId, targetLabel: action.targetLabel } }

    case 'CLOSE_MODAL':
      return { ...state, modal: { type: null, targetId: null, targetLabel: null } }

    case 'APPROVE_SUCCESS': {
      const updatedReqs = state.requests.map(r =>
        r.id === action.requestId ? { ...r, status: 'aprovado' as const } : r
      )
      return { ...state, requests: updatedReqs, modal: { type: null, targetId: null, targetLabel: null } }
    }

    case 'REJECT_SUCCESS': {
      const updatedReqs = state.requests.map(r =>
        r.id === action.requestId ? { ...r, status: 'rejeitado' as const } : r
      )
      return { ...state, requests: updatedReqs, modal: { type: null, targetId: null, targetLabel: null } }
    }

    case 'SHOW_TOAST':
      return { ...state, toast: action.toast }

    case 'HIDE_TOAST':
      return { ...state, toast: null }

    default:
      return state
  }
}
```

### Initial State

```typescript
const initialState: AdminState = {
  activeTab: 'dashboard',
  tabStates: {
    dashboard: 'idle',
    pessoas: 'idle',
    lookups: 'idle',
    solicitacoes: 'idle',
    auditoria: 'idle',
  },
  stats: null,
  people: [],
  peopleSearch: '',
  lookupTables: [],
  selectedTable: null,
  lookupEntries: [],
  requests: [],
  auditEntries: [],
  auditTotal: 0,
  auditOffset: 0,
  modal: { type: null, targetId: null, targetLabel: null },
  toast: null,
  error: null,
}
```

---

## API Contract

### GET /api/admin/stats
```typescript
type StatsResponse = Readonly<{
  people: Readonly<{ total: number }>
  roles: Readonly<{ active: number }>
  audit: Readonly<{ total: number }>
}>
```

### GET /api/admin/people
```typescript
type PeopleListResponse = readonly PersonSummary[]
```

### POST /api/admin/people
```typescript
type CreatePersonRequest = Readonly<{ name: string; cpf: string; birthDate: string }>
type CreatePersonResponse = Readonly<{ id: string }>
```

### GET /api/admin/people/:id/roles
```typescript
type RolesListResponse = readonly Readonly<{ id: string; role: string; active: boolean }>[]
```

### POST /api/admin/people/:id/roles
```typescript
type AssignRoleRequest = Readonly<{ role: string }>
```

### GET /api/admin/lookups/:tableName
```typescript
type LookupEntriesResponse = readonly LookupEntry[]
```

### PATCH /api/admin/lookups/:tableName/:id/toggle
```typescript
type ToggleResponse = Readonly<{ active: boolean }>
```

### GET /api/admin/lookups/requests
```typescript
type RequestsListResponse = readonly LookupRequest[]
```

### POST /api/admin/lookups/requests
```typescript
type CreateRequestBody = Readonly<{ tableName: string; label: string }>
```

### PUT /api/admin/lookups/requests/:id/approve
No body required.

### PUT /api/admin/lookups/requests/:id/reject
```typescript
type RejectRequestBody = Readonly<{ reviewNote: string }>
```

### GET /api/admin/audit
```typescript
type AuditResponse = Readonly<{
  entries: readonly AuditEntry[]
  total: number
}>
// Query params: ?limit=20&offset=0
```

---

## Seguranca

- Admin Hub requer **sessao valida + role admin/owner** (authGuard + adminGuard)
- `adminGuard` retorna 403 JSON para `/api/admin/*`, redirect para `/` em rotas SSR
- Toda mutacao gera audit entry com actorId do session.userSub
- Header `X-Actor-Id` enviado em TODA request ao backend
- Lookup table names validados contra whitelist de 13 tabelas
- UUIDs validados server-side antes de proxy
- Cookie: `__Host-session` (HttpOnly, Secure, SameSite=Strict)
- O browser NUNCA ve tokens, backend URLs ou CPFs em JSON no JS state

---

## Rotas do BFF

```typescript
// src/routes/pages.tsx (SSR)
app.get('/admin', authGuard, adminGuard, adminPage) // SSR shell, client hydrates

// src/routes/api_admin.ts (proxy + audit)
// Pessoas (proxy → people-context)
app.get('/api/admin/people', ...)
app.get('/api/admin/people/:id', ...)
app.post('/api/admin/people', ...)
app.get('/api/admin/people/:id/roles', ...)
app.post('/api/admin/people/:id/roles', ...)

// Lookups (proxy → social-care)
app.get('/api/admin/lookups/requests', ...)     // ANTES de :tableName
app.post('/api/admin/lookups/requests', ...)
app.put('/api/admin/lookups/requests/:id/approve', ...)
app.put('/api/admin/lookups/requests/:id/reject', ...)
app.get('/api/admin/lookups/:tableName', ...)
app.post('/api/admin/lookups/:tableName', ...)
app.patch('/api/admin/lookups/:tableName/:id/toggle', ...)

// Audit + Stats (local store)
app.get('/api/admin/audit', ...)
app.get('/api/admin/stats', ...)
```

---

## Entry Points (client)

```
src/client/apps/
  admin-hub/
    entry.tsx          <- hydration do Admin Hub SPA
```

O shell SSR renderiza header + tab bar + container vazio. O client hydrates e carrega dados on-demand por tab.
