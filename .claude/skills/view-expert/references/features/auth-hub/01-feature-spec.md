# Auth Hub — Feature Spec

> Documento principal da feature. Define o fluxo, layout, ViewModel e tipos.
> Leia `design-tokens.md` e `components-catalog.md` antes.

## Fluxo de Decisão (Auth → Destino)

```
Usuário acessa /
  ├── Tem sessão válida?
  │   ├── SIM → GET /api/v1/me → quantos apps?
  │   │   ├── 0 apps → /hub (empty state: sem permissões)
  │   │   ├── 1 app → auto-redirect ao app (ex: /social-care)
  │   │   └── 2+ apps → /hub (app selector com grid)
  │   └── NÃO → Landing page (botão "Entrar")
  │
  ├── Clica "Entrar" → redirect ao Zitadel (PKCE)
  │   ├── Sucesso → /auth/callback → cria sessão → mesmo fluxo acima
  │   └── Erro → Landing com banner de erro
  │
  └── Sessão expirou? → Landing com banner "Sessão expirada"
```

Decisões-chave:
- O filtro de apps é **server-side** (BFF filtra por roles do JWT)
- `lastUsedAppId` vive no **SessionStore** (server-side), nunca em localStorage
- Se user acessa app sem permissão via URL, o app individual rejeita via authGuard + role check

---

## Page Structure

```
AuthHubPage (orchestrator, ~80 lines)
├── useReducer(hubReducer, initialState)
├── useEffect: checkSession on mount → decide screen
├── useEffect: keyboard listener (Escape fecha modais futuros)
│
├── [screen === 'landing'] LandingScreen
├── [screen === 'loading']  LoadingScreen
├── [screen === 'hub']      HubScreen
├── [screen === 'redirect'] RedirectScreen
```

O Page é um orchestrator puro: lê state, despacha actions, e renderiza o screen correto. Nenhum fetch direto — tudo via service injetado.

---

## ViewModel (hubReducer)

```typescript
// src/client/viewmodels/auth-hub/types.ts

type HubScreen = 'landing' | 'loading' | 'hub' | 'redirect'
type HubLoadingContext = 'authenticating' | 'loading-permissions' | 'entering-app'
type HubErrorType = 'auth' | 'session' | 'network'

type HubState = Readonly<{
  screen: HubScreen
  loadingContext: HubLoadingContext | null
  user: Readonly<{
    name: string
    firstName: string
    initials: string
    role: string
  }> | null
  apps: readonly AppInfo[]
  lastUsedAppId: string | null
  error: Readonly<{
    type: HubErrorType
    title: string
    message: string
  }> | null
}>

type AppInfo = Readonly<{
  id: string
  name: string
  description: string
  icon: string        // SVG string
  color: string       // hex accent do app
  route: string       // rota base (ex: /social-care)
}>
```

### Actions

```typescript
// src/client/viewmodels/auth-hub/types.ts

type HubAction =
  | Readonly<{ type: 'INIT_SESSION_CHECK' }>
  | Readonly<{ type: 'NO_SESSION' }>
  | Readonly<{ type: 'SESSION_EXPIRED' }>
  | Readonly<{ type: 'AUTH_START' }>
  | Readonly<{ type: 'AUTH_CALLBACK_SUCCESS'; user: HubState['user']; apps: readonly AppInfo[]; lastUsedAppId: string | null }>
  | Readonly<{ type: 'AUTH_CALLBACK_FAILURE'; title: string; message: string }>
  | Readonly<{ type: 'LOAD_PERMISSIONS_START' }>
  | Readonly<{ type: 'LOAD_PERMISSIONS_SUCCESS'; apps: readonly AppInfo[]; lastUsedAppId: string | null }>
  | Readonly<{ type: 'LOAD_PERMISSIONS_FAILURE' }>
  | Readonly<{ type: 'SELECT_APP'; appId: string }>
  | Readonly<{ type: 'LOGOUT_START' }>
  | Readonly<{ type: 'LOGOUT_COMPLETE' }>
```

### Reducer (esqueleto)

```typescript
// src/client/viewmodels/auth-hub/reducer.ts

function hubReducer(state: HubState, action: HubAction): HubState {
  switch (action.type) {
    case 'INIT_SESSION_CHECK':
      return { ...state, screen: 'loading', loadingContext: 'authenticating' }

    case 'NO_SESSION':
      return { ...state, screen: 'landing', error: null }

    case 'SESSION_EXPIRED':
      return {
        ...state,
        screen: 'landing',
        error: { type: 'session', title: STRINGS.sessionExpiredTitle, message: STRINGS.sessionExpiredDesc },
      }

    case 'AUTH_START':
      return { ...state, screen: 'loading', loadingContext: 'authenticating' }

    case 'AUTH_CALLBACK_SUCCESS': {
      const { user, apps, lastUsedAppId } = action
      if (apps.length === 0) return { ...state, screen: 'hub', user, apps, lastUsedAppId: null, error: null }
      if (apps.length === 1) return { ...state, screen: 'redirect', user, apps, lastUsedAppId: apps[0].id, error: null }
      return { ...state, screen: 'hub', user, apps, lastUsedAppId, error: null }
    }

    case 'AUTH_CALLBACK_FAILURE':
      return {
        ...state,
        screen: 'landing',
        error: { type: 'auth', title: action.title, message: action.message },
      }

    case 'LOAD_PERMISSIONS_START':
      return { ...state, screen: 'loading', loadingContext: 'loading-permissions' }

    case 'LOAD_PERMISSIONS_SUCCESS': {
      const { apps, lastUsedAppId } = action
      if (apps.length === 1) return { ...state, screen: 'redirect', apps, lastUsedAppId: apps[0].id }
      return { ...state, screen: 'hub', apps, lastUsedAppId }
    }

    case 'LOAD_PERMISSIONS_FAILURE':
      return {
        ...state,
        screen: 'hub',
        error: { type: 'network', title: STRINGS.networkErrorTitle, message: STRINGS.networkErrorDesc },
      }

    case 'SELECT_APP':
      return { ...state, screen: 'loading', loadingContext: 'entering-app' }

    case 'LOGOUT_START':
      return { ...state, screen: 'loading', loadingContext: 'authenticating' }

    case 'LOGOUT_COMPLETE':
      return { ...initialState, screen: 'landing' }

    default:
      return state
  }
}
```

### Initial State

```typescript
const initialState: HubState = {
  screen: 'landing',
  loadingContext: null,
  user: null,
  apps: [],
  lastUsedAppId: null,
  error: null,
}
```

---

## App Registry (server-side)

O BFF mantém um registry estático dos micro-apps:

```typescript
type AppRegistryEntry = Readonly<{
  id: string
  name: string
  description: string
  icon: string
  color: string
  route: string
  requiredRoles: readonly string[]
}>

const APP_REGISTRY: readonly AppRegistryEntry[] = [
  { id: 'social',      name: 'Assistência Social', description: 'Famílias, cadastros e fichas de acompanhamento',       color: '#4F8448', route: '/social-care',           icon: '...', requiredRoles: ['social_worker', 'admin'] },
  { id: 'relatorios',  name: 'Relatórios',         description: 'Indicadores, exportações e painéis gerenciais',        color: '#C9960A', route: '/reports',               icon: '...', requiredRoles: ['social_worker', 'admin', 'manager'] },
  { id: 'admin',       name: 'Administração',      description: 'Usuários, permissões e configurações do sistema',      color: '#172D48', route: '/admin',                 icon: '...', requiredRoles: ['admin'] },
  { id: 'saude',       name: 'Saúde',              description: 'Prontuários, diagnósticos e encaminhamentos',          color: '#A6290D', route: '/health',                icon: '...', requiredRoles: ['health_professional', 'admin'] },
  { id: 'educacao',    name: 'Educação',           description: 'Acompanhamento escolar e oficinas socioeducativas',    color: '#7B5EA7', route: '/education',             icon: '...', requiredRoles: ['social_worker', 'educator', 'admin'] },
]
```

Filtro: `GET /api/v1/me` cruza `user.roles[]` com `requiredRoles[]` e retorna só os apps autorizados.

---

## API Contract

### GET /api/v1/me

Retorna perfil do usuário + apps permitidos.

```typescript
type MeResponse = Readonly<{
  user: Readonly<{
    id: string
    name: string
    firstName: string
    initials: string
    role: string              // display role (ex: "Assistente Social")
    email: string
  }>
  apps: readonly AppInfo[]    // já filtrados por role
  lastUsedAppId: string | null
}>
```

### POST /api/v1/me/last-used

Atualiza o último app usado (chamado ao selecionar um app).

```typescript
type LastUsedRequest = Readonly<{ appId: string }>
```

---

## Segurança

- Landing page é **pública** (não requer sessão)
- Hub requer **sessão válida** (authGuard middleware)
- `lastUsedAppId` armazenado no **SessionStore** (server-side), não em localStorage
- Filtro de apps feito no **BFF**, nunca no client (defense in depth)
- Cookie: `__Host-session` (HttpOnly, Secure, SameSite=Strict)
- Se user manipular URL → app individual rejeita via authGuard + role check

---

## Rotas do BFF

```typescript
// src/routes/pages.tsx (SSR)
app.get('/', landingPage)           // SSR: renderiza Landing HTML
app.get('/hub', authGuard, hubPage) // SSR: renderiza Hub shell, client hydrates

// src/routes/auth.ts
app.get('/auth/login', authLoginHandler)       // Redirect ao Zitadel
app.get('/auth/callback', authCallbackHandler) // Processa code + verifier
app.post('/auth/logout', authLogoutHandler)    // Revoke + clear session
app.get('/auth/me', authGuard, meHandler)      // Retorna MeResponse

// src/routes/api.ts
app.post('/api/v1/me/last-used', authGuard, lastUsedHandler)
```

---

## Entry Points (client)

```
src/client/apps/
  auth-hub/
    entry.tsx          ← hydration do Hub (landing é SSR-only)
```

O landing é server-rendered e não precisa de hydration (é estático + 1 botão que faz redirect). O Hub precisa de client interactivity (click nos cards, greeting dinâmico, retry, logout).
