# Auth Hub — States & Flows

> Todos os estados de cada tela, transições entre eles, e edge cases.
> Este documento é a referência do viewmodel-engineer e view-implementer para garantir que nenhum estado foi esquecido.

## State Machine Overview

```
                    ┌────────────┐
                    │  LANDING   │◄──────────────────────────────────────┐
                    │ (pública)  │                                       │
                    └─────┬──────┘                                       │
                          │ click "Entrar"                               │
                          ▼                                              │
                    ┌────────────┐                                       │
             ┌──────│  LOADING   │──────┐                                │
             │      │"Autentic." │      │                                │
             │      └────────────┘      │                                │
             │                          │                                │
        auth error                 auth success                          │
        session exp.                    │                                │
             │                          ▼                                │
             │                    GET /api/v1/me                         │
             │                          │                                │
             │           ┌──────────────┼──────────────┐                 │
             │           │              │              │                 │
             │        0 apps         1 app          2+ apps              │
             │           │              │              │                 │
             │           ▼              ▼              ▼                 │
             │     ┌──────────┐  ┌───────────┐  ┌──────────┐            │
             │     │   HUB    │  │ REDIRECT  │  │   HUB    │            │
             │     │ (empty)  │  │ (auto)    │  │ (normal) │            │
             │     └────┬─────┘  └─────┬─────┘  └────┬─────┘            │
             │          │              │              │                  │
             │      "Voltar"      cancel?        select app             │
             │          │              │              │                  │
             │          ▼              │              ▼                  │
             └──────► LANDING ◄────────┘        ┌──────────┐            │
                                                │ LOADING  │            │
                                                │"Entrando"│            │
                                                └────┬─────┘            │
                                                     │                  │
                                                     ▼                  │
                                               window.location          │
                                                = app.route             │
                                                                        │
                                          ┌──────────────┐              │
                                  ┌───────│   HUB        │              │
                             net error    │ (net error)  │              │
                                  │       └──────────────┘              │
                                  │              │                      │
                                  │         "Tentar novamente"          │
                                  ▼              │                      │
                            ┌──────────┐         │                      │
                            │ LOADING  │◄────────┘                      │
                            │"Carrega" │                                │
                            └────┬─────┘                                │
                                 │                                      │
                            sucesso → HUB (normal)                      │
                            falha  → HUB (net error)                    │
                                                                        │
                            logout (qualquer tela) ─────────────────────┘
```

---

## Tela 1: Landing — Estados

### 1.1 Normal (default)

- **Condição:** Sem sessão, sem error
- **Renderiza:** Logo + título + tagline + botão "Entrar"
- **Animação de entrada:** fadeInUp 800ms spring (toda a `landing-content`)
- **Orbs de fundo:** float1 12s e float2 15s (infinite)
- **Footer:** Sempre visível

### 1.2 Erro de autenticação

- **Condição:** `state.error?.type === 'auth'`
- **Trigger:** Callback do Zitadel retorna com `?error=`
- **Renderiza:** Normal + LandingAlert(type='error')
- **Posição do alert:** Entre tagline e botão
- **Alert animação:** fadeInUp 500ms ease
- **O botão "Entrar" continua funcional** (permite retry)

### 1.3 Sessão expirada

- **Condição:** `state.error?.type === 'session'`
- **Trigger:** Middleware detecta sessão inválida, redireciona com `?reason=session_expired`
- **Renderiza:** Normal + LandingAlert(type='warning')
- **Mesma posição e animação do erro de auth**
- **O botão "Entrar" continua funcional**

### 1.4 Retorno do logout

- **Condição:** Dispatch LOGOUT_COMPLETE → screen 'landing'
- **Renderiza:** Normal (sem alerts)
- **Diferença:** Não há animação de entrada (a tela já estava montada no DOM)

---

## Tela 2: Hub — Estados

### 2.1 Normal com último acessado

- **Condição:** `apps.length >= 2 && lastUsedAppId !== null`
- **Renderiza:** Header + Welcome + RecentAppCard + AppGrid
- **Saudação:** Contextual por hora (`Bom dia/Boa tarde/Boa noite, {firstName}`)
- **Último acessado:** Card destaque em dark bg, com nome + desc + seta
- **Grid:** Label "TODOS OS MÓDULOS ({count})" + cards

### 2.2 Primeiro acesso (sem último acessado)

- **Condição:** `apps.length >= 2 && lastUsedAppId === null`
- **Renderiza:** Header + Welcome + AppGrid (SEM RecentAppCard)
- **Saudação:** Mesmo pattern contextual
- **Grid:** Direto, sem seção "Último acessado"

### 2.3 Sem permissões (empty state)

- **Condição:** `apps.length === 0 && error === null`
- **Renderiza:** Header + Welcome + EmptyState
- **Saudação:** usa `firstName` do user (o user existe, só não tem apps)
- **Subtitle:** vazio (string '')
- **EmptyState:** ícone cadeado + título + descrição + botão "Falar com admin" + "Voltar ao início"
- **"Falar com admin":** `mailto:admin@acdg.gov.br?subject=Solicitação de acesso - ACDG`
- **"Voltar ao início":** dispara LOGOUT_START → LOGOUT_COMPLETE

### 2.4 Erro de rede

- **Condição:** `error?.type === 'network'`
- **Trigger:** GET /api/v1/me falha (timeout, network error, 5xx)
- **Renderiza:** Header + Welcome + NetworkError
- **Subtitle:** vazio
- **NetworkError:** ícone wifi-off + título + descrição + botão "Tentar novamente"
- **Retry flow:**
  1. Click "Tentar novamente"
  2. Dispatch LOAD_PERMISSIONS_START → screen 'loading', context 'loading-permissions'
  3. Chama GET /api/v1/me novamente
  4. Sucesso → LOAD_PERMISSIONS_SUCCESS → screen 'hub' (normal)
  5. Falha → LOAD_PERMISSIONS_FAILURE → screen 'hub' (erro de rede novamente)

---

## Tela 3: Auto-Redirect — Estados

### 3.1 Redirecionando

- **Condição:** `apps.length === 1`
- **Renderiza:** Ícone do app + "Entrando em {name}..." + subtítulo + progress bar + botão cancelar
- **Progress bar:** 0% → 100% em 2s, ease-in-out, delay 400ms
- **Ao completar (2.4s):** `window.location.href = app.route`
- **Botão cancelar:** "Não é o que esperava? Voltar" → volta pra landing

### 3.2 Cancelado

- **Trigger:** Click no "Voltar"
- **Efeito:** Dispatch action que volta screen para 'landing'
- **Progress bar:** Para de animar (componente desmonta)

---

## Tela 4: Loading — Estados

### 4.1 Autenticando

- **Context:** 'authenticating'
- **Texto:** "Autenticando..."
- **Quando:** Após click "Entrar" e antes do redirect ao Zitadel

### 4.2 Carregando permissões

- **Context:** 'loading-permissions'
- **Texto:** "Carregando módulos..."
- **Quando:** Retry após erro de rede

### 4.3 Entrando em app

- **Context:** 'entering-app'
- **Texto:** "Entrando em {appName}..."
- **Quando:** Após selecionar um app no hub

---

## Edge Cases & Regras de Negócio

### EC-1: Usuário com 1 app mas app muda durante sessão

Se o admin remove permissão enquanto o user está logado:
- O redirect leva ao app
- O app individual rejeita via authGuard + role check
- User vê erro de permissão no app → deve voltar ao hub manualmente
- **Não tratamos isso no hub** (responsabilidade do app individual)

### EC-2: Multiple tabs

Se o user abre o hub em duas abas:
- Cada aba tem sua sessão (mesmo cookie)
- `lastUsedAppId` é server-side, então as duas abas veem o mesmo valor
- Não há conflito (read-only no hub, write só no SELECT_APP)

### EC-3: Token refresh durante hub

O hub não faz polling. Se o token expirar enquanto o user está olhando os cards:
- Próxima ação (click num app) vai para o BFF
- BFF tenta refresh proativo
- Se refresh falha → redirect para landing com `?reason=session_expired`

### EC-4: Deep link direto para /hub sem sessão

- authGuard no BFF rejeita
- Redirect para `/` (landing)
- Após login, callback reconstrói a sessão e decide destino normalmente

### EC-5: Callback com error no query param

- URL: `/auth/callback?error=access_denied&error_description=...`
- BFF extrai error, redireciona para `/?error=auth&message=...`
- Landing lê query params e exibe LandingAlert

### EC-6: User fecha aba durante loading

- Nenhum efeito colateral (não há state persistido no client)
- Sessão continua válida no server
- Ao reabrir, fluxo recomeça do início

### EC-7: Greeting muda durante uso

- O greeting é calculado no render (`new Date().getHours()`)
- Se o user deixa a aba aberta e cruza das 18h (tarde→noite), o greeting não atualiza automaticamente
- Aceitável — atualiza no próximo render (click em algo, ou F5)

---

## Transition Timing

| De → Para | Duração | O que acontece |
|-----------|---------|---------------|
| Landing → Loading | Imediato | Troca de screen |
| Loading → Hub | ~1-2s | Tempo do auth + GET /api/v1/me |
| Loading → Landing (error) | ~1-2s | Auth falha, redirect back |
| Hub → Loading (select app) | Imediato | Troca de screen |
| Loading → App | ~300ms | `window.location.href` |
| Hub → Landing (logout) | ~500ms | POST /auth/logout + clear session |
| Loading → Redirect | Imediato | Após detectar 1 app |
| Redirect → App | 2.4s | Progress bar completa + navigate |
| Redirect → Landing (cancel) | Imediato | Troca de screen |
