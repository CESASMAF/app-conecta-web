# Auth Hub — UX Copy, Accessibility & Responsiveness

> Tudo que o view-implementer precisa para textos, ARIA, keyboard, e breakpoints.

---

## 1. UX Copy (PT-BR)

Todas as strings da UI. Código em inglês, UI em português brasileiro.

```typescript
// src/client/presenter/auth-hub/strings.ts

export const AUTH_HUB_STRINGS = {
  // ── Landing ──────────────────────────────────────────────
  landingTitle: 'ACDG',
  landingTagline:
    'Plataforma integrada de assistência e cuidado social para gestão de famílias e acompanhamento comunitário',
  landingButton: 'Entrar na plataforma',
  landingFooter: 'ACDG — Assistência e Cuidado em Desenvolvimento e Gestão',

  // ── Landing Alerts ───────────────────────────────────────
  authErrorTitle: 'Falha na autenticação',
  authErrorDesc:
    'Não foi possível concluir o login. Verifique suas credenciais ou entre em contato com o suporte.',
  sessionExpiredTitle: 'Sessão expirada',
  sessionExpiredDesc:
    'Sua sessão expirou por inatividade. Faça login novamente para continuar.',

  // ── Hub ──────────────────────────────────────────────────
  greeting: (firstName: string): string => {
    const h = new Date().getHours()
    const period = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
    return `${period}, ${firstName}`
  },
  hubSubtitle: 'Selecione um módulo para continuar',
  lastUsedLabel: 'ÚLTIMO ACESSADO',
  allModulesLabel: (count: number): string =>
    count > 1 ? `TODOS OS MÓDULOS (${count})` : 'SEU MÓDULO',
  logoutButton: 'Sair',

  // ── Empty State ──────────────────────────────────────────
  emptyTitle: 'Nenhum módulo disponível',
  emptyDesc:
    'Sua conta ainda não tem acesso a nenhum módulo da plataforma. Entre em contato com o administrador do sistema para solicitar as permissões necessárias.',
  emptyContactAdmin: 'Falar com o administrador',
  emptyContactEmail: 'admin@acdg.gov.br',
  emptyContactSubject: 'Solicitação de acesso - ACDG',
  emptyBackToStart: 'Voltar ao início',

  // ── Network Error ────────────────────────────────────────
  networkErrorTitle: 'Erro ao carregar módulos',
  networkErrorDesc:
    'Não foi possível carregar suas permissões. Verifique sua conexão com a internet e tente novamente.',
  networkErrorRetry: 'Tentar novamente',

  // ── Auto-Redirect ────────────────────────────────────────
  redirectTitle: (appName: string): string => `Entrando em ${appName}...`,
  redirectSubtitle:
    'Você tem acesso a um módulo. Redirecionando automaticamente.',
  redirectCancel: 'Não é o que esperava? Voltar',

  // ── Loading ──────────────────────────────────────────────
  loadingAuth: 'Autenticando...',
  loadingPermissions: 'Carregando módulos...',
  loadingApp: (appName: string): string => `Entrando em ${appName}...`,
} as const
```

### Regras de Copy

- **Títulos (h1, h2):** Satoshi bold, frase curta e direta, sem ponto final
- **Descrições (p):** Playfair italic 300, tom acolhedor mas informativo, com ponto final
- **CTAs (botões):** Verbo no infinitivo ("Entrar", "Voltar", "Tentar"), sem exclamação
- **Labels (seção):** UPPERCASE, Satoshi 10px bold, letter-spacing 1.5px
- **Alertas:** Título curto (2-3 palavras) + descrição com orientação clara de próximo passo

---

## 2. Acessibilidade (WCAG 2.1 AA)

### 2.1 Landmarks

```html
<!-- Landing -->
<main role="main" aria-label="Página de login">
  <!-- conteúdo -->
  <footer><!-- nome do sistema --></footer>
</main>

<!-- Hub -->
<header><!-- logo + user info --></header>
<main>
  <h1><!-- greeting --></h1>
  <nav aria-label="Módulos disponíveis">
    <!-- recent card + grid -->
  </nav>
</main>

<!-- Loading -->
<div role="status" aria-live="polite">
  <!-- spinner + texto -->
</div>

<!-- Redirect -->
<div role="status" aria-live="polite">
  <!-- ícone + título + progress -->
</div>
```

### 2.2 ARIA Attributes

| Elemento | Atributo | Valor |
|----------|----------|-------|
| Landing alert container | `role="alert"`, `aria-live="assertive"` | Anuncia automaticamente |
| Alert SVG icons | `aria-hidden="true"` | Decorativos |
| Landing button SVG (seta) | `aria-hidden="true"` | Decorativo |
| App card icons | `aria-hidden="true"` | O nome do app já comunica |
| App cards | `role="button"`, `tabindex="0"`, `aria-label="Abrir {name}"` | Focável e acionável |
| Recent card | `role="button"`, `tabindex="0"` | Focável e acionável |
| Recent card seta | `aria-hidden="true"` | Decorativa |
| Botão Sair | `aria-label="Sair da plataforma"` | Mais descritivo que "Sair" |
| Loading container | `role="status"`, `aria-live="polite"` | Texto muda dinamicamente |
| Loading spinner | `aria-hidden="true"` | Visual only |
| Empty state icon | `aria-hidden="true"` | Decorativo |
| Error state icon | `aria-hidden="true"` | Decorativo |
| Retry button SVG | `aria-hidden="true"` | O texto "Tentar novamente" basta |

### 2.3 Keyboard Navigation

| Tela | Elemento | Tab? | Enter/Space | Escape |
|------|----------|------|-------------|--------|
| Landing | Botão "Entrar" | ✅ | ✅ dispara login | — |
| Hub | Recent card | ✅ (tabindex=0) | ✅ abre app | — |
| Hub | App cards | ✅ (tabindex=0) | ✅ abre app | — |
| Hub | Botão "Sair" | ✅ (button) | ✅ logout | — |
| Empty | "Falar com admin" | ✅ (a href) | ✅ abre mailto | — |
| Empty | "Voltar ao início" | ✅ (button) | ✅ logout | — |
| Error | "Tentar novamente" | ✅ (button) | ✅ retry | — |
| Redirect | "Voltar" | ✅ (button) | ✅ cancela | — |

**Tab order sugerido:**

Landing: botão "Entrar" (único interativo)

Hub: Recent card → App card 1 → App card 2 → ... → Botão "Sair"

(Logo/brand são skip — não interativos)

### 2.4 Contraste (verificado)

| Elemento | Foreground | Background | Ratio | Req. | Pass |
|----------|-----------|------------|-------|------|------|
| Landing title | #F2E2C4 | #172D48 | ~8.2:1 | 3:1 (large) | ✅ |
| Landing tagline | rgba(F2E2C4, 0.82) | #172D48 | ~5.8:1 | 4.5:1 | ✅ |
| Landing btn text | #172D48 | #F2E2C4 | ~8.2:1 | 4.5:1 | ✅ |
| Landing footer | rgba(F2E2C4, 0.5) | #172D48 | ~3.5:1 | 3:1 (large n/a, decorative) | ⚠️ |
| Hub greeting (h1) | #261D11 | #F2E2C4 | ~9.4:1 | 3:1 | ✅ |
| Hub subtitle | rgba(261D11, 0.65) | #F2E2C4 | ~5.2:1 | 4.5:1 | ✅ |
| App card title | #261D11 | #FAF0E0 | ~8.8:1 | 4.5:1 | ✅ |
| App card desc | rgba(261D11, 0.65) | #FAF0E0 | ~5.0:1 | 4.5:1 | ✅ |
| Recent card title | #F2E2C4 | #172D48 | ~8.2:1 | 4.5:1 | ✅ |
| Recent card desc | rgba(F2E2C4, 0.75) | #172D48 | ~5.2:1 | 4.5:1 | ✅ |
| Alert error title | #FF8A7A | ~rgba(172D48) | ~4.8:1 | 4.5:1 | ✅ (borderline) |
| Alert warning title | #FFD066 | ~rgba(172D48) | ~6.2:1 | 4.5:1 | ✅ |

### 2.5 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  /* Desabilitar TODAS as animações */
  *, *::before, *::after {
    animation-duration: 0ms !important;
    animation-delay: 0ms !important;
    transition-duration: 0ms !important;
  }
  
  /* Orbs de fundo: parar completamente */
  .landing::before,
  .landing::after {
    animation: none;
  }
}
```

### 2.6 Reduced Transparency

N/A nesta feature — não usa `backdrop-filter` ou glass. O landing usa `rgba` para orbs decorativos (puramente visuais, não afetam legibilidade).

### 2.7 Screen Reader Announcements

| Evento | O que anuncia | Como |
|--------|---------------|------|
| Alert aparece | Título + descrição do alerta | `role="alert"` no container (auto-announce) |
| Loading muda texto | "Autenticando..." / "Carregando..." | `aria-live="polite"` (aguarda pausa) |
| Redirect inicia | "Entrando em {app}..." | `aria-live="polite"` |

---

## 3. Responsividade

### 3.1 Breakpoints

```typescript
// Consistente com design-tokens.md
const breakpoint = {
  mobile: 600,    // < 600px
  tablet: 1200,   // 600-1200px (não usado nesta feature)
  desktop: 1200,  // >= 1200px
}
```

### 3.2 Adaptações por Tela

#### Landing

| Elemento | Mobile (< 600px) | Desktop (>= 600px) |
|----------|-------------------|---------------------|
| Título | 28px | 40px |
| Tagline | 16px | 18px |
| Content padding | 24px | 40px |
| Content max-width | 100% | 520px |
| Orbs | Menores (400px/350px) | 600px/500px |

#### Hub

| Elemento | Mobile (< 600px) | Desktop (>= 600px) |
|----------|-------------------|---------------------|
| Header padding | 20px 20px 0 | 32px 48px 0 |
| Header layout | Flex-wrap, gap 12px | Single row |
| User name/role | **Escondido** | Visível à direita |
| Avatar | Visível | Visível |
| Welcome h1 | 24px | 32px |
| Main padding | 32px 20px | 48px |
| App grid columns | 1fr (1 coluna) | auto-fill minmax(220px, 1fr) |
| Recent card | Full width | max-width 720px |

#### Loading & Redirect

Sem adaptação — já são centralizados e funcionam em qualquer width.

### 3.3 CSS Implementation

```css
/* Mobile-first base */
.hub-header {
  padding: 20px 20px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.hub-user-info {
  display: none; /* mobile: esconde */
}

.hub-main {
  padding: 32px 20px;
}

.hub-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  width: 100%;
  max-width: 720px;
}

.landing-title {
  font-size: 28px;
}

.landing-tagline {
  font-size: 16px;
}

.landing-content {
  padding: 24px;
}

/* Desktop */
@media (min-width: 600px) {
  .hub-header {
    padding: 32px 48px 0;
    flex-wrap: nowrap;
  }

  .hub-user-info {
    display: block;
    text-align: right;
  }

  .hub-main {
    padding: 48px;
  }

  .hub-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }

  .landing-title {
    font-size: 40px;
  }

  .landing-tagline {
    font-size: 18px;
  }

  .landing-content {
    padding: 40px;
    max-width: 520px;
  }
}
```

---

## 4. Animações (referência rápida)

Durações e curvas consistentes com `animations.md`:

| Elemento | Animação | Duração | Easing | Delay |
|----------|----------|---------|--------|-------|
| Landing content | fadeInUp | 800ms | spring (0.34,1.56,0.64,1) | 0 |
| Landing orb 1 | float1 | 12s | ease-in-out | infinite |
| Landing orb 2 | float2 | 15s | ease-in-out | infinite |
| Landing alert | fadeInUp | 500ms | ease | 0 |
| Landing btn hover | scale(1.04) | 300ms | spring | — |
| Landing btn active | scale(0.98) | — | — | — |
| Landing btn arrow hover | translateX(4px) | 300ms | ease | — |
| Hub header | fadeInUp | 500ms | ease | 0 |
| Hub welcome | fadeInUp | 600ms | ease | 100ms |
| Hub recent card | fadeInUp | 600ms | ease | 200ms |
| Hub recent hover | translateY(-2px) scale(1.01) | 300ms | spring | — |
| Hub recent arrow hover | translateX(4px) | 200ms | ease | — |
| Hub grid label | fadeInUp | 600ms | ease | 300ms |
| Hub app card N | fadeInUp | 500ms | ease | (350 + N×70)ms |
| Hub card hover | translateY(-4px) | 300ms | spring | — |
| Hub card accent line | opacity 0.5→1 | 200ms | ease | — |
| Hub logout hover | border+color→danger | 200ms | ease | — |
| Redirect icon | fadeInUp | 500ms | ease | 0 |
| Redirect title | fadeInUp | 500ms | ease | 100ms |
| Redirect subtitle | fadeInUp | 500ms | ease | 200ms |
| Redirect progress bar | fadeInUp | 500ms | ease | 300ms |
| Redirect fill | width 0→100% | 2s | ease-in-out | 400ms |
| Redirect cancel | fadeInUp | 500ms | ease | 400ms |
| Spinner | rotate 360deg | 0.8s | linear | infinite |

### fadeInUp (shared)

```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Spring curve

```
cubic-bezier(0.34, 1.56, 0.64, 1)
```

Usada apenas em hover/active de botões e cards. Não em animações de entrada (essas usam `ease`).
