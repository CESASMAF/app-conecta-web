# Feature: Auth Landing + App Hub

> **NOTA:** Este arquivo é um resumo. A spec completa e detalhada está em:
> `features/auth-hub/README.md` (índice com 4 documentos separados)
>
> - `01-feature-spec.md` — Fluxo, layout, ViewModel, tipos, segurança, rotas
> - `02-components.md` — Catálogo de componentes com props, variantes, CSS
> - `03-states-and-flows.md` — State machine, todos os estados, edge cases
> - `04-copy-a11y-responsive.md` — UX copy, ARIA, keyboard, contraste, breakpoints, animações
>
> Protótipo interativo de referência: `prototype-auth-hub.html` (raiz do projeto)

## Visão Geral
- **Usuário alvo:** Todos os perfis (assistentes sociais, administradores, profissionais de saúde, educadores)
- **Objetivo:** Autenticar o usuário via OIDC (Zitadel) e direcioná-lo ao micro-app correto baseado em suas roles/permissões
- **Rotas:** `/` (landing), `/hub` (app selector pós-auth), `/auth/callback` (OIDC callback)
- **Contrato API:** OIDC endpoints via Zitadel + `GET /api/v1/me` (retorna user profile + apps permitidos)

## Fluxo de Decisão (Auth → Destino)

```
Usuário acessa /
  ├── Tem sessão válida?
  │   ├── SIM → GET /api/me → quantos apps?
  │   │   ├── 0 apps → /hub (empty state: sem permissões)
  │   │   ├── 1 app → redirect direto ao app (ex: /social-care)
  │   │   └── 2+ apps → /hub (app selector)
  │   └── NÃO → Landing page (botão "Entrar")
  │
  ├── Clica "Entrar" → redirect ao Zitadel (PKCE)
  │   ├── Sucesso → /auth/callback → cria sessão → mesmo fluxo acima
  │   └── Erro → Landing com banner de erro
  │
  └── Sessão expirou? → Landing com banner "Sessão expirada"
```

---

## Tela 1: Landing Page (pré-auth)

### Layout
- **Background:** `backgroundDark` (#172D48) com orbs de gradiente animados (verde primary + bege)
- **Conteúdo centralizado:** Logo (80x80, radius 20px, bg #F2E2C4) → Nome do sistema "ACDG" (Satoshi 40px bold) → Tagline (Playfair 18px italic 300, opacity 0.6) → Botão "Entrar na plataforma"
- **Footer:** Nome completo do sistema, opacity 0.3, 13px

### Componentes

| Componente | Props | Comportamento |
|-----------|-------|---------------|
| LandingLogo | — | Estático, 80x80, sombra profunda |
| LandingTitle | — | "ACDG", Satoshi 40px bold, textOnDark |
| LandingTagline | — | Playfair italic 300, max-width 380px |
| LandingButton | onClick | Pill button, bg #F2E2C4, cor dark, ícone seta → |
| LandingAlert | type: 'error' \| 'warning', title, description | Banner contextual entre tagline e botão |

### Estados

**Normal (sem alertas):**
- Logo + título + tagline + botão
- Entrada com fadeInUp 800ms spring

**Erro de autenticação:**
- Mesmo layout + `LandingAlert` tipo error
- Título: "Falha na autenticação"
- Descrição: "Não foi possível concluir o login. Verifique suas credenciais ou entre em contato com o suporte."
- Cor: vermelho claro sobre fundo translúcido (#A6290D @ 0.15)
- Aparece quando: callback do Zitadel retorna com `?error=`

**Sessão expirada:**
- Mesmo layout + `LandingAlert` tipo warning
- Título: "Sessão expirada"
- Descrição: "Sua sessão expirou por inatividade. Faça login novamente para continuar."
- Cor: amarelo/âmbar (#C9960A @ 0.15)
- Aparece quando: middleware detecta sessão inválida e redireciona com `?reason=session_expired`

### Animações
- Orbs de fundo: `float` 12-15s ease-in-out infinite, translate + scale sutil
- Conteúdo: fadeInUp 800ms spring (0.34, 1.56, 0.64, 1)
- Botão hover: scale(1.04) 300ms spring
- Botão active: scale(0.98)
- Seta do botão: translateX(4px) on hover

### Responsividade
- **Mobile (< 600px):** Título 28px, tagline 16px, padding 24px
- **Desktop:** Título 40px, max-width 520px

---

## Tela 2: App Hub (pós-auth, múltiplos apps)

### Layout

```
┌──────────────────────────────────────────┐
│  Header: [Logo ACDG]    [Nome · Role · Avatar · Sair] │
├──────────────────────────────────────────┤
│                                          │
│         Boa tarde, Maria                 │
│    Selecione um módulo para continuar    │
│                                          │
│  ╔══════════════════════════════════════╗ │
│  ║  ÚLTIMO ACESSADO                    ║ │
│  ║  [icon] Assistência Social      →   ║ │
│  ╚══════════════════════════════════════╝ │
│                                          │
│  TODOS OS MÓDULOS (3)                    │
│  ┌────────┐ ┌────────┐ ┌────────┐       │
│  │ Social │ │Relat.  │ │Educação│       │
│  └────────┘ └────────┘ └────────┘       │
│                                          │
└──────────────────────────────────────────┘
```

- **Background:** `background` (#F2E2C4)
- **Header:** Logo + brand name à esquerda; nome + role + avatar + botão Sair à direita
- **Welcome:** Saudação contextual (Bom dia/Boa tarde/Boa noite) + nome, Satoshi 32px bold
- **Último acessado:** Card em `backgroundDark`, ícone + nome + desc + seta. Só aparece se `lastUsed` existe e user tem 2+ apps.
- **Grid de apps:** Cards em `surface` (#FAF0E0), auto-fill minmax(220px, 1fr), gap 16px, max-width 720px

### Componentes

| Componente | Props | Comportamento |
|-----------|-------|---------------|
| HubHeader | user: { name, role, initials } | Logo + info do usuário + botão sair |
| HubWelcome | greeting, subtitle | Saudação + instrução |
| RecentAppCard | app: { name, desc, icon, color }, onClick | Card dark destacado, hover scale + arrow animation |
| AppCard | app: { name, desc, icon, color }, onClick | Card surface com accent bar no hover |
| AppGrid | apps[], onAppClick | Grid responsivo com cards |
| EmptyState | onLogout | Ícone cadeado + mensagem + botão voltar |
| NetworkError | onRetry | Ícone wifi-off + mensagem + botão retry |

### Estados

**Normal (com último acessado):**
- Header + welcome + seção "Último acessado" + grid com todos os apps
- Grid filtrado por role: só apps que o user tem permissão

**Primeiro acesso (sem último acessado):**
- Header + welcome + grid direto (sem seção "Último acessado")
- Subtítulo: "Selecione um módulo para continuar"

**Sem permissões (0 apps):**
- Header + welcome + EmptyState
- Ícone: cadeado (lock)
- Título: "Nenhum módulo disponível"
- Descrição: "Sua conta ainda não tem acesso a nenhum módulo da plataforma. Entre em contato com o administrador do sistema para solicitar as permissões necessárias."
- CTA: "Voltar ao início" (faz logout)

**Erro de rede:**
- Header + welcome + NetworkError
- Ícone: wifi-off
- Título: "Erro ao carregar módulos"
- Descrição: "Não foi possível carregar suas permissões. Verifique sua conexão com a internet e tente novamente."
- CTA: "Tentar novamente" (retry GET /api/me)

### Animações
- Header: fadeInUp 500ms ease
- Welcome: fadeInUp 600ms ease, delay 100ms
- Recent card: fadeInUp 600ms ease, delay 200ms
- Grid label: fadeInUp 600ms ease, delay 300ms
- Cards: fadeInUp 500ms staggered (delay +70ms cada)
- Card hover: translateY(-4px) 300ms spring, accent bar opacity 0→1
- Recent card hover: translateY(-2px) scale(1.01), seta translateX(4px)
- Botão Sair hover: border e texto mudam para danger color

### Responsividade
- **Mobile (< 600px):** Grid 1 coluna, padding 20px, esconde nome/role no header (só avatar)
- **Desktop:** Grid auto-fill 220px min, padding 48px, max-width 720px

---

## Tela 3: Auto-Redirect (1 app só)

### Layout
- Centralizado: ícone do app (64x64) + "Entrando em [Nome]..." + subtítulo + progress bar
- Background: `background` (#F2E2C4)

### Componentes

| Componente | Props | Comportamento |
|-----------|-------|---------------|
| RedirectIcon | app: { icon, color } | Ícone do app em fundo translúcido |
| RedirectTitle | appName | "Entrando em {appName}..." |
| RedirectSubtitle | — | "Você tem acesso a um módulo. Redirecionando automaticamente." |
| ProgressBar | — | Track 200px + fill animado 2s |

### Animações
- Ícone: fadeInUp 500ms
- Título: fadeInUp 500ms, delay 100ms
- Subtítulo: fadeInUp 500ms, delay 200ms
- Progress bar: fill de 0% a 100% em 2s ease-in-out, delay 400ms

---

## Tela 4: Loading (transição)

### Layout
- Centralizado: spinner (40x40) + texto contextual
- Background: `background` (#F2E2C4)

### Textos contextuais
- Durante auth: "Autenticando..."
- Entrando em app: "Entrando em {appName}..."
- Carregando permissões: "Carregando módulos..."

---

## ViewModel (hubReducer)

```typescript
type HubLoadingState = 'idle' | 'authenticating' | 'loading-permissions' | 'redirecting'

type HubState = Readonly<{
  loading: HubLoadingState
  user: Readonly<{
    name: string
    initials: string
    role: string
  }> | null
  apps: readonly AppInfo[]
  lastUsedAppId: string | null
  error: Readonly<{ type: 'auth' | 'session' | 'network'; message: string }> | null
}>

type AppInfo = Readonly<{
  id: string
  name: string
  description: string
  icon: string
  color: string
  route: string
}>

type HubAction =
  | Readonly<{ type: 'AUTH_START' }>
  | Readonly<{ type: 'AUTH_SUCCESS'; user: HubState['user']; apps: readonly AppInfo[]; lastUsedAppId: string | null }>
  | Readonly<{ type: 'AUTH_FAILURE'; error: HubState['error'] }>
  | Readonly<{ type: 'LOAD_PERMISSIONS_START' }>
  | Readonly<{ type: 'LOAD_PERMISSIONS_SUCCESS'; apps: readonly AppInfo[]; lastUsedAppId: string | null }>
  | Readonly<{ type: 'LOAD_PERMISSIONS_FAILURE' }>
  | Readonly<{ type: 'SELECT_APP'; appId: string }>
  | Readonly<{ type: 'LOGOUT' }>
```

## Dados do App Registry

O BFF mantém um registry dos micro-apps disponíveis. Cada app tem:

```typescript
type AppRegistryEntry = Readonly<{
  id: string
  name: string
  description: string
  icon: string        // SVG string ou componente
  color: string       // cor accent do app
  route: string       // rota base (ex: /social-care)
  requiredRoles: readonly string[]   // roles que dão acesso
}>
```

O filtro acontece server-side: `GET /api/me` retorna apenas os apps que o usuário pode acessar, já filtrados pelo BFF baseado nas roles do JWT.

## Segurança

- Landing page é pública (não requer sessão)
- Hub requer sessão válida (authGuard middleware)
- O `lastUsedAppId` é armazenado no SessionStore (server-side), não em localStorage
- O filtro de apps é feito no BFF, nunca no client (defense in depth)
- Se o user manipular a URL e acessar um app sem permissão, o app individual rejeita via authGuard + role check

## Acessibilidade

- **Landmarks:** `<main>` para conteúdo, `<header>` para nav, `<nav>` para grid de apps (com `aria-label="Módulos disponíveis"`)
- **Cards:** `<article>` com `role="link"`, `aria-label="{nome do app}: {descrição}"`
- **Botão Sair:** `aria-label="Sair da plataforma"`
- **Alerts na landing:** `role="alert"` para aparecer em screen readers automaticamente
- **Loading:** `aria-busy="true"` no container, `aria-live="polite"` para texto de status
- **Empty state:** Texto claro com instrução de próximo passo
- **Tab order:** Logo/brand (skip) → cards em ordem → botão sair
- **Contraste:** Texto sobre dark (#F2E2C4 sobre #172D48) = ratio ~9.5:1 (AAA). Texto muted sobre surface verificar AA mínimo.
- **Reduced motion:** Desabilitar animações de orbs, fadeInUp, card hover transforms
- **Reduced transparency:** N/A nesta tela (sem glass/backdrop-filter)

## UX Copy (PT-BR)

```typescript
export const AUTH_HUB_STRINGS = {
  // Landing
  landingTitle: 'ACDG',
  landingTagline: 'Plataforma integrada de assistência e cuidado social para gestão de famílias e acompanhamento comunitário',
  landingButton: 'Entrar na plataforma',
  landingFooter: 'ACDG — Assistência e Cuidado em Desenvolvimento e Gestão',

  // Landing alerts
  authErrorTitle: 'Falha na autenticação',
  authErrorDesc: 'Não foi possível concluir o login. Verifique suas credenciais ou entre em contato com o suporte.',
  sessionExpiredTitle: 'Sessão expirada',
  sessionExpiredDesc: 'Sua sessão expirou por inatividade. Faça login novamente para continuar.',

  // Hub
  greeting: (name: string) => {
    const h = new Date().getHours()
    const period = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
    return `${period}, ${name}`
  },
  hubSubtitle: 'Selecione um módulo para continuar',
  lastUsedLabel: 'ÚLTIMO ACESSADO',
  allModulesLabel: (count: number) => `TODOS OS MÓDULOS (${count})`,
  logoutButton: 'Sair',

  // Empty state
  emptyTitle: 'Nenhum módulo disponível',
  emptyDesc: 'Sua conta ainda não tem acesso a nenhum módulo da plataforma. Entre em contato com o administrador do sistema para solicitar as permissões necessárias.',
  emptyAction: 'Voltar ao início',

  // Network error
  networkErrorTitle: 'Erro ao carregar módulos',
  networkErrorDesc: 'Não foi possível carregar suas permissões. Verifique sua conexão com a internet e tente novamente.',
  networkErrorAction: 'Tentar novamente',

  // Auto-redirect
  redirectTitle: (appName: string) => `Entrando em ${appName}...`,
  redirectSubtitle: 'Você tem acesso a um módulo. Redirecionando automaticamente.',

  // Loading
  loadingAuth: 'Autenticando...',
  loadingApp: (appName: string) => `Entrando em ${appName}...`,
  loadingPermissions: 'Carregando módulos...',
} as const
```

## Protótipo Interativo

Protótipo HTML com todos os estados implementados: `prototype-auth-hub.html` (na raiz do projeto).
Inclui painel de cenários para simular cada estado descrito nesta spec.
