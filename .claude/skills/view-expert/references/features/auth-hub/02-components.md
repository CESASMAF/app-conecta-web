# Auth Hub — Component Catalog

> Componentes específicos desta feature. Segue o padrão do `components-catalog.md`:
> `(props: Readonly<{...}>) => JSX`. Zero fetch, zero useReducer. useState ONLY para UI local.
> Imports: `css`, `cx`, `keyframes` de `hono/css`. Tokens de `src/client/styles/tokens.ts`.

## Component Tree

```
AuthHubPage (orchestrator)
│
├── LandingScreen
│   ├── LandingLogo
│   ├── LandingTitle
│   ├── LandingTagline
│   ├── LandingAlert          ← condicional (error | warning | null)
│   ├── LandingButton
│   └── LandingFooter
│
├── LoadingScreen
│   ├── Spinner                ← reusa do components-catalog.md
│   └── LoadingText
│
├── HubScreen
│   ├── HubHeader
│   │   ├── HubBrand
│   │   ├── HubUserInfo
│   │   ├── HubAvatar
│   │   └── HubLogoutButton
│   ├── HubWelcome
│   ├── RecentAppCard          ← condicional (lastUsed + apps > 1)
│   ├── AppGrid
│   │   └── AppCard (×N)
│   ├── EmptyState             ← condicional (0 apps)
│   └── NetworkError           ← condicional (erro de rede)
│
└── RedirectScreen
    ├── RedirectIcon
    ├── RedirectTitle
    ├── RedirectSubtitle
    ├── ProgressBar
    └── RedirectCancel
```

---

## Landing Components

### LandingLogo

```typescript
interface LandingLogoProps {}
// Nenhuma prop — estático

// Visual: 80×80px, radius 20px, bg: color.background (#F2E2C4)
// Texto "A" centralizado, 36px bold, cor: color.backgroundDark
// Sombra: 0 8px 32px rgba(0,0,0,0.2)
```

### LandingTitle

```typescript
interface LandingTitleProps {}
// Estático: "ACDG"

// Satoshi 40px bold, color.textOnDark (#F2E2C4), line-height 1.2
// Mobile (< 600px): 28px
```

### LandingTagline

```typescript
interface LandingTaglineProps {}
// Estático: texto da plataforma

// Playfair 18px italic 300, color: rgba(242,226,196,0.82), max-width 380px
// line-height 1.6
// Mobile: 16px
// CONTRASTE: 0.82 opacity garante WCAG AA (≥4.5:1 sobre #172D48)
```

### LandingAlert

```typescript
interface LandingAlertProps {
  readonly type: 'error' | 'warning'
  readonly title: string
  readonly description: string
}

// Container: max-width 440px, width 90%, padding 16px 20px, radius 10px
// Layout: flex, align-items flex-start, gap 12px
// Animação: fadeInUp 500ms ease
//
// type === 'error':
//   bg: rgba(166,41,13, 0.15), border: 1px solid rgba(166,41,13, 0.25)
//   Título: #FF8A7A, 14px semibold
//   Desc: rgba(242,226,196,0.8), 13px Playfair italic 300
//   Ícone: triângulo warning, stroke #FF8A7A, aria-hidden="true"
//
// type === 'warning':
//   bg: rgba(201,150,10, 0.15), border: 1px solid rgba(201,150,10, 0.25)
//   Título: #FFD066, 14px semibold
//   Desc: rgba(242,226,196,0.8), 13px Playfair italic 300
//   Ícone: relógio, stroke #FFD066, aria-hidden="true"
//
// ARIA: role="alert" no container (anuncia automaticamente em screen readers)
```

### LandingButton

```typescript
interface LandingButtonProps {
  readonly onClick: () => void
}

// Pill button: padding 16px 40px, radius pill (100px), border none
// bg: color.background (#F2E2C4), cor: color.backgroundDark (#172D48)
// Font: Playfair italic 18px 400
// Sombra: shadow.button (2.5px 2.5px 5px 2px rgba(0,0,0,0.12))
// Ícone: seta → (SVG 20px, stroke currentColor), aria-hidden="true"
// 
// Hover: scale(1.04) 300ms spring(0.34,1.56,0.64,1), shadow cresce
// Active: scale(0.98)
// Hover SVG: translateX(4px) 300ms ease
// Focus-visible: outline 2px solid color.background, offset 3px
//
// Texto: "Entrar na plataforma"
```

### LandingFooter

```typescript
interface LandingFooterProps {}
// Estático: "ACDG — Assistência e Cuidado em Desenvolvimento e Gestão"

// <footer> semântico
// position absolute, bottom 32px, text-align center
// 13px Satoshi, color: rgba(242,226,196,0.5), letter-spacing 0.5px
```

---

## Hub Components

### HubHeader

```typescript
interface HubHeaderProps {
  readonly user: Readonly<{ name: string; role: string; initials: string }>
  readonly onLogout: () => void
}

// <header> semântico
// Layout: flex, justify-content space-between, align-items center
// Padding: 32px 48px 0 (mobile: 20px 20px 0)
// Animação: fadeInUp 500ms ease
//
// Esquerda: HubBrand (logo 40px + "ACDG" Satoshi 18px bold)
// Direita: nome (14px medium) + role (12px muted) + avatar + botão sair
// Mobile: esconde nome/role, mostra só avatar + sair
```

### HubAvatar

```typescript
interface HubAvatarProps {
  readonly initials: string
}

// Círculo 40×40px, bg: color.backgroundDark, cor: color.background
// Font: 16px semibold, centered
```

### HubLogoutButton

```typescript
interface HubLogoutButtonProps {
  readonly onClick: () => void
}

// <button> semântico, aria-label="Sair da plataforma"
// Pill border: 1px solid color.inputLine, padding 8px 18px, radius pill
// Font: Satoshi 13px semibold, color.textMuted
// Hover: border-color danger, color danger (200ms ease)
// Focus-visible: outline 2px solid primary, offset 2px
```

### HubWelcome

```typescript
interface HubWelcomeProps {
  readonly greeting: string   // "Bom dia, Maria"
  readonly subtitle: string   // "Selecione um módulo para continuar"
}

// text-align center, margin-bottom 48px
// Animação: fadeInUp 600ms ease, delay 100ms
//
// h1: Satoshi 32px bold, color.textPrimary (mobile: 24px)
// p: Playfair italic 300 16px, color.textMuted
```

### RecentAppCard

```typescript
interface RecentAppCardProps {
  readonly app: AppInfo
  readonly onClick: () => void
}

// SÓ RENDERIZA SE: lastUsedAppId !== null E apps.length > 1
//
// Container: width 100%, max-width 720px, margin-bottom 40px
// Label: "ÚLTIMO ACESSADO" — sectionTitle style (10px uppercase, textMuted)
// Card: flex, align-items center, gap 20px, padding 20px 24px
//   bg: color.backgroundDark, radius card (12px), shadow.card
//
// Ícone: 48×48px, radius 12px, bg: alpha(app.color, 0.15), SVG 24px
// Info: h3 (16px semibold, textOnDark) + p (13px Playfair italic 300, rgba F2E2C4 0.75)
// Seta: "→" 20px, rgba(242,226,196,0.6)
//
// Hover: translateY(-2px) scale(1.01) 300ms spring, shadow.cardHover
// Hover seta: translateX(4px), cor textOnDark
// Focus-visible: outline 2px solid primary, offset 2px
//
// ARIA: role="button", tabindex="0", onkeydown Enter/Space
// Animação: fadeInUp 600ms ease, delay 200ms
```

### AppGrid

```typescript
interface AppGridProps {
  readonly apps: readonly AppInfo[]
  readonly onAppClick: (appId: string) => void
}

// Label: "TODOS OS MÓDULOS ({count})" — sectionTitle style
//   Se 1 app: "SEU MÓDULO"
// Grid: display grid, grid-template-columns repeat(auto-fill, minmax(220px, 1fr))
//   gap 16px, max-width 720px
// Mobile: grid-template-columns 1fr (1 coluna)
// Label animação: fadeInUp 600ms ease, delay 300ms
```

### AppCard

```typescript
interface AppCardProps {
  readonly app: AppInfo
  readonly index: number     // para stagger delay
  readonly onClick: () => void
}

// <article> semântico
// bg: color.surface (#FAF0E0), radius card (12px), padding 24px
// border: 1px solid transparent, shadow.card
//
// Accent line: ::before pseudo, top 0, height 3px, bg: app.color
//   SEMPRE VISÍVEL: opacity 0.5, hover → opacity 1 (200ms ease)
//
// Ícone: 44×44px, radius 11px, bg: alpha(app.color, 0.12), SVG 22px
//   margin-bottom 16px, aria-hidden="true"
//
// h3: Satoshi 15px bold, color.textPrimary, margin-bottom 6px
// p: Playfair italic 300 13px, color.textMuted, line-height 1.5
//
// Hover: translateY(-4px) 300ms spring, shadow.cardHover, border-color inputLine
// Focus-visible: outline 2px solid primary, offset 2px (mesma elevação do hover)
//
// ARIA: role="button", tabindex="0", aria-label="Abrir {app.name}"
//       onkeydown Enter/Space → onClick
// Animação: fadeInUp 500ms ease, delay (350 + index * 70)ms
```

### EmptyState

```typescript
interface EmptyStateProps {
  readonly onContactAdmin: () => void    // mailto: link
  readonly onLogout: () => void
}

// SÓ RENDERIZA SE: apps.length === 0 E error === null
//
// text-align center, padding 48px 24px, max-width 400px
// Animação: fadeInUp 600ms ease, delay 200ms
//
// Ícone: 72×72px, radius 18px, bg: alpha(danger, 0.08), aria-hidden
//   SVG cadeado 32px, stroke danger, weight 1.5
//
// h2: Satoshi 20px bold, textPrimary, margin-bottom 8px
//   "Nenhum módulo disponível"
//
// p: Playfair italic 300 15px, textMuted, line-height 1.6, margin-bottom 24px
//   Texto completo (ver 04-copy-a11y-responsive.md)
//
// CTA primário: <a href="mailto:admin@acdg.gov.br?subject=...">
//   Estilo: pillButtonPrimary (bg primary, cor white)
//   Ícone envelope + "Falar com o administrador"
//
// CTA secundário: <button> pillButtonSecondary
//   "Voltar ao início" → onLogout
```

### NetworkError

```typescript
interface NetworkErrorProps {
  readonly onRetry: () => void
}

// SÓ RENDERIZA SE: error?.type === 'network'
//
// Mesmo layout do EmptyState, mas:
// Ícone: wifi-off SVG, stroke danger
// h2: "Erro ao carregar módulos"
// p: mensagem de rede (ver 04-copy-a11y-responsive.md)
// CTA: pillButtonPrimary com ícone refresh + "Tentar novamente"
```

---

## Redirect Components

### RedirectScreen

```typescript
interface RedirectScreenProps {
  readonly app: AppInfo
  readonly onCancel: () => void
}

// Centralizado vertical e horizontal, bg: color.background
// gap 20px, text-align center
//
// RedirectIcon: 64×64px, radius 16px, bg: alpha(app.color, 0.12)
//   SVG 28px do app, fadeInUp 500ms
//
// h2: Satoshi 22px bold, textPrimary
//   "Entrando em {app.name}..."
//   fadeInUp 500ms, delay 100ms
//
// p: Playfair italic 300 15px, textMuted
//   "Você tem acesso a um módulo. Redirecionando automaticamente."
//   fadeInUp 500ms, delay 200ms
//
// ProgressBar: track 200×3px, bg inputLine, radius 2px
//   fill: bg primary, animação 0→100% em 2s ease-in-out, delay 400ms
//   fadeInUp 500ms, delay 300ms
//
// Botão cancelar: <button> sem estilo, Playfair italic 300 13px, textMuted
//   text-decoration underline, text-underline-offset 3px
//   "Não é o que esperava? Voltar" → onCancel (volta pra landing)
//   Hover: color textPrimary
//   Focus-visible: outline 2px solid primary, offset 2px
//   fadeInUp 500ms, delay 400ms
```

---

## Loading Components

### LoadingScreen

```typescript
interface LoadingScreenProps {
  readonly context: HubLoadingContext   // 'authenticating' | 'loading-permissions' | 'entering-app'
  readonly appName?: string            // só quando context === 'entering-app'
}

// Centralizado, bg: color.background, gap 24px
// ARIA: role="status", aria-live="polite" (notifica screen readers)
//
// Spinner: reusa componente genérico (40×40px, border 3px, spin 0.8s)
//   aria-hidden="true"
//
// Texto: Playfair italic 300 16px, textMuted
//   context === 'authenticating' → "Autenticando..."
//   context === 'loading-permissions' → "Carregando módulos..."
//   context === 'entering-app' → "Entrando em {appName}..."
```

---

## Shared CSS Classes

Estas classes devem ser definidas em `src/client/styles/auth-hub.ts`:

```typescript
import { css, keyframes } from "hono/css"
import { color, font, weight, radius, shadow, alpha, space } from "./tokens.ts"

// Animação base reutilizada por todos os componentes
export const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
`

// Orbs flutuantes do landing (background)
export const float1 = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(40px, 30px) scale(1.05); }
`

export const float2 = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-30px, -20px) scale(1.08); }
`

// Progress bar fill
export const progressFill = keyframes`
  from { width: 0; }
  to { width: 100%; }
`
```
