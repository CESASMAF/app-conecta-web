# Admin Hub — Component Catalog

> Componentes especificos desta feature. Segue o padrao do `components-catalog.md`:
> `(props: Readonly<{...}>) => JSX`. Zero fetch, zero useReducer. useState ONLY para UI local.
> Imports: `css`, `cx`, `keyframes` de `hono/css`. Tokens de `src/client/styles/tokens.ts`.

## Component Tree

```
AdminHubPage (orchestrator)
│
├── AdminHeader
│   ├── AdminBrand (logo + "ACDG Administracao")
│   └── AdminUserInfo (name + role + avatar)
│
├── AdminTabBar
│   └── TabButton (x5, com badge condicional em Solicitacoes)
│
├── [tab === 'dashboard'] DashboardTab
│   ├── StatsGrid
│   │   └── StatCard (x4)
│   ├── PendingSection
│   │   ├── SectionHeader
│   │   └── PendingItem (xN)
│   └── RecentAuditSection
│       ├── SectionHeader
│       └── AuditEntry (xN)
│
├── [tab === 'pessoas'] PessoasTab
│   ├── SectionHeader (com botao "+ Nova Pessoa")
│   ├── SearchInput
│   └── PeopleTable
│       └── PersonRow (xN, com StatusBadge)
│
├── [tab === 'lookups'] LookupsTab
│   ├── SearchInput
│   ├── LookupGrid
│   │   └── LookupCard (x13)
│   └── [selectedTable] LookupDetailPanel
│       ├── SectionHeader (com botao "+ Novo Valor")
│       └── LookupEntryTable
│           └── LookupEntryRow (xN, com ToggleSwitch)
│
├── [tab === 'solicitacoes'] SolicitacoesTab
│   ├── SectionHeader
│   └── RequestsTable
│       └── RequestRow (xN, com ActionButtons condicional)
│
├── [tab === 'auditoria'] AuditoriaTab
│   ├── SectionHeader
│   ├── SearchInput
│   ├── AuditLog
│   │   └── AuditEntry (xN)
│   └── LoadMoreButton
│
├── ConfirmModal                    <- condicional (modal.type !== null)
│   ├── [type === 'approve'] ApproveContent
│   └── [type === 'reject'] RejectContent (com textarea)
│
└── Toast                           <- condicional (toast !== null)
```

---

## Shared Components

### AdminHeader

```typescript
interface AdminHeaderProps {
  readonly user: Readonly<{ name: string; role: string; initials: string }>
}

// <header> semantico
// bg: color.backgroundDark (#172D48), padding 20px 48px
// Layout: flex, justify-content space-between, align-items center
//
// Esquerda: AdminBrand
//   Logo: 36x36px, radius 10px, bg color.background, font 700 16px Satoshi, cor backgroundDark
//   Texto: "ACDG" Satoshi 700 18px textOnDark + "Administracao" Satoshi 400 18px rgba(F2E2C4, 0.6)
//
// Direita: AdminUserInfo
//   Nome: Satoshi 500 14px textOnDark
//   Role: Satoshi 400 12px rgba(F2E2C4, 0.5)
//   Avatar: 36x36px circulo, bg rgba(F2E2C4, 0.15), font 600 14px textOnDark, iniciais
//
// Mobile (< 600px): padding 16px 20px, esconde nome/role, mostra so avatar
```

### AdminTabBar

```typescript
interface AdminTabBarProps {
  readonly activeTab: AdminTab
  readonly pendingCount: number
  readonly onTabChange: (tab: AdminTab) => void
}

// <nav> semantico, role="tablist", aria-label="Secoes do admin"
// bg: color.surface (#FAF0E0), padding 0 48px
// border-bottom: 1px solid color.inputLine
// display: flex, gap 0
//
// Mobile: padding 0 20px, overflow-x auto, -webkit-overflow-scrolling touch
```

### TabButton

```typescript
interface TabButtonProps {
  readonly label: string
  readonly tab: AdminTab
  readonly isActive: boolean
  readonly badge?: number
  readonly onClick: () => void
}

// <button> role="tab", aria-selected={isActive}
// padding 14px 24px, border none, bg none
// font: Satoshi 600 13px, letter-spacing 0.3px
// border-bottom: 2px solid transparent
// transition: all 200ms ease
//
// Normal: color textMuted
// Active: color textPrimary, border-bottom-color backgroundDark, bg rgba(23,45,72,0.06)
// Hover (not active): color textPrimary
//
// Badge (solicitacoes):
//   <span> bg danger, color white, font 700 10px Satoshi
//   padding 2px 6px, radius pill, margin-left 6px
//   aria-hidden="true" (o botao tem aria-label com contagem)
//   Botao: aria-label="Solicitacoes, {count} pendentes"
//
// Focus-visible: outline 2px solid primary, offset 2px
```

---

## Dashboard Components

### StatCard

```typescript
interface StatCardProps {
  readonly label: string
  readonly value: number
  readonly detail?: string
  readonly highlight?: boolean
}

// bg: color.surface, radius card (12px), padding 20px
// border: 1px solid transparent (highlight: 2px solid warning)
// transition: all 200ms ease
// Hover: border-color inputLine, shadow cardHover
//
// Label: Satoshi 700 11px uppercase, letter-spacing 1.5px, color textMuted
//   (highlight: color warning)
// Value: Playfair italic 400 36px, color textPrimary, line-height 1
// Detail: Satoshi 400 12px, color textMuted, margin-top 6px
```

### PendingItem

```typescript
interface PendingItemProps {
  readonly title: string
  readonly meta: string
  readonly onApprove: () => void
  readonly onReject: () => void
}

// role="button", tabindex="0"
// display flex, align-items center, gap 12px
// padding 12px 16px, bg surface, radius dropdown (8px)
// border: 1px solid transparent
// transition: all 200ms ease
// Hover: border-color inputLine, shadow card
//
// TypeIcon: 32x32px, radius 8px, bg rgba(201,150,10,0.12)
// Info.title: Satoshi 600 14px
// Info.meta: Satoshi 400 12px, color textMuted
//
// Actions: flex, gap 10px
//   Approve: padding 8px 18px, radius pill, bg rgba(79,132,72,0.12), color primary
//     font 600 13px Satoshi
//     Hover: bg primary, color white
//   Reject: padding 8px 18px, radius pill, bg rgba(166,41,13,0.08), color danger
//     font 600 13px Satoshi
//     Hover: bg danger, color white
//
// Focus-visible (botoes): outline 2px solid primary, offset 2px
```

### AuditEntry

```typescript
interface AuditEntryProps {
  readonly timestamp: string
  readonly action: string
  readonly description: string
  readonly actorName: string
}

// display flex, align-items flex-start, gap 12px
// padding 10px 0, border-bottom 1px solid rgba(38,29,17,0.06)
// (last child: no border)
//
// Timestamp: Satoshi 400 12px, color textMuted, white-space nowrap, min-width 120px
// ActionTag: Satoshi 600 10px uppercase, padding 3px 8px, radius 4px, letter-spacing 0.5px
//   min-width 100px, text-align center
//   Cores por tipo:
//     PERSON_CREATED/LOOKUP_CREATED → bg rgba(79,132,72,0.1), color primary
//     ROLE_ASSIGNED/LOOKUP_REQUEST_APPROVED → bg rgba(23,45,72,0.1), color backgroundDark
//     LOOKUP_TOGGLED/LOOKUP_REQUEST_REJECTED → bg rgba(201,150,10,0.1), color warning
// Description: Satoshi 400 13px, flex 1
// Actor: Satoshi 500 12px, color textMuted, min-width 100px, text-align right
//
// Mobile: empilhar timestamp+actor acima de description (flex-wrap)
```

---

## Pessoas Components

### SearchInput

```typescript
interface SearchInputProps {
  readonly placeholder: string
  readonly value: string
  readonly onChange: (value: string) => void
  readonly ariaLabel: string
}

// display flex, align-items center, gap 8px
// padding 10px 16px, bg surface, radius pill, border 1px solid inputLine
// max-width 400px, margin-bottom 24px
//
// Icon: color textMuted, 16px (decorativo, aria-hidden)
// Input: border none, bg none, font Playfair italic 300 14px, color textPrimary
//   flex 1, outline none
//   placeholder: color textMuted
// Focus container: border-color backgroundDark
```

### PeopleTable

```typescript
interface PeopleTableProps {
  readonly people: readonly PersonSummary[]
  readonly searchQuery: string
}

// <table> aria-label="Lista de pessoas"
// width 100%, border-collapse collapse
// bg surface, radius card (12px), overflow hidden, shadow card
//
// thead th: Satoshi 700 11px uppercase, letter-spacing 0.8px, color textMuted
//   padding 12px 16px, text-align left, bg rgba(38,29,17,0.03)
//   border-bottom 1px solid inputLine
//
// tbody td: Satoshi 400 14px, padding 12px 16px
//   border-bottom 1px solid rgba(38,29,17,0.06)
//   (last row: no border)
// tbody tr: transition background 150ms ease
// tbody tr:hover: bg rgba(38,29,17,0.02)
//
// Colunas: Nome (bold) | CPF | Nascimento | Roles (StatusBadge) | Status (StatusBadge)
//
// Filtragem: client-side por searchQuery (nome ou CPF)
```

### StatusBadge

```typescript
interface StatusBadgeProps {
  readonly variant: 'active' | 'inactive' | 'pending' | 'rejected'
  readonly label: string
}

// display inline-flex, align-items center, gap 6px
// padding 4px 12px, radius pill
// font Satoshi 600 11px uppercase, letter-spacing 0.5px
//
// active: bg rgba(79,132,72,0.12), color primary
// inactive: bg rgba(38,29,17,0.06), color textMuted
// pending: bg rgba(201,150,10,0.12), color warning
// rejected: bg rgba(166,41,13,0.08), color danger
//
// Dot: 6x6px circulo, bg currentColor
```

---

## Lookup Components

### LookupCard

```typescript
interface LookupCardProps {
  readonly tableName: string
  readonly entryCount: number
  readonly isSelected: boolean
  readonly onClick: () => void
}

// role="button", tabindex="0", aria-label="Ver {tableName}, {entryCount} valores ativos"
// onkeydown: Enter/Space → onClick
// bg surface, radius card (12px), padding 16px
// border: 1px solid transparent (isSelected: border-left 3px solid primary)
// cursor pointer, transition all 200ms ease
// Hover: border-color inputLine, translateY(-2px), shadow cardHover
//
// TableName: Satoshi 600 13px
// EntryCount: Playfair italic 300 13px, color textMuted
//
// Focus-visible: outline 2px solid primary, offset 2px
```

### LookupDetailPanel

```typescript
interface LookupDetailPanelProps {
  readonly tableName: string
  readonly entries: readonly LookupEntry[]
  readonly onToggle: (entryId: string) => void
  readonly onCreateEntry: () => void
}

// bg surfaceLight (#FFFBF4), radius panel (24px), padding 24px, margin-top 24px
// Animacao entrada: fadeInUp 400ms ease
//
// Header: SectionHeader com titulo "Detalhes: {tableName}" e botao "+ Novo Valor"
// Tabela: mesma estrutura de PeopleTable
// Colunas: Valor | Status (StatusBadge) | Ativo (ToggleSwitch)
```

### ToggleSwitch

```typescript
interface ToggleSwitchProps {
  readonly checked: boolean
  readonly label: string
  readonly onToggle: () => void
}

// <button> role="switch", aria-checked={checked}
// aria-label="Desativar valor {label}" (ou "Ativar valor {label}" se !checked)
// width 40px, height 22px, radius 11px
// bg: off → inputLine, on → primary
// position relative, cursor pointer, transition background 200ms ease
// border none
//
// Knob: 18x18px circulo, bg white, position absolute, top 2px, left 2px
//   transition transform 200ms ease, shadow 0 1px 3px rgba(0,0,0,0.2)
//   checked: transform translateX(18px)
//
// Focus-visible: outline 2px solid primary, offset 2px
```

---

## Solicitacoes Components

### RequestsTable

```typescript
interface RequestsTableProps {
  readonly requests: readonly LookupRequest[]
  readonly onApprove: (id: string, label: string) => void
  readonly onReject: (id: string, label: string) => void
}

// Mesma estrutura de PeopleTable
// Colunas: Tabela | Valor Proposto (bold) | Solicitante | Data | Status (StatusBadge) | Acoes
//
// Acoes (somente para status === 'pendente'):
//   Botoes Aprovar/Rejeitar (mesmo estilo dos PendingItem actions)
// Acoes (aprovado/rejeitado):
//   Texto descritivo: "Aprovado em {date}" ou "Motivo: {reviewNote}"
//   Satoshi 400 12px, color textMuted
```

---

## Modal Components

### ConfirmModal

```typescript
interface ConfirmModalProps {
  readonly type: 'approve' | 'reject'
  readonly targetLabel: string
  readonly onConfirm: (reviewNote?: string) => void
  readonly onCancel: () => void
}

// Overlay: position fixed, inset 0, bg rgba(38,29,17,0.4)
//   display flex, align-items center, justify-content center, z-index 5000
//   Animacao: opacity 0→1, 300ms ease
//
// Box: bg surfaceLight, radius panel (24px), padding 32px
//   max-width 440px, width 90%
//   shadow: 0 24px 80px rgba(38,29,17,0.2)
//   Animacao: fadeInUp 400ms ease
//
// role="dialog", aria-labelledby="modal-title", aria-modal="true"
// Focus trap: Tab cicla dentro do modal
// Escape: fecha modal
//
// type === 'approve':
//   h3: "Aprovar solicitacao"
//   p: "Deseja aprovar a inclusao do valor "{targetLabel}"? Esta acao ira adicionar o valor imediatamente."
//   Botoes: Cancelar (secondary) + Aprovar (bg primary, color white)
//
// type === 'reject':
//   h3: "Rejeitar solicitacao"
//   p: "Informe o motivo da rejeicao. Esta informacao sera enviada ao solicitante."
//   textarea: placeholder "Motivo da rejeicao (obrigatorio)..."
//     width 100%, padding 12px, border 1px solid inputLine, radius dropdown
//     font Satoshi 400 14px, resize vertical, min-height 80px
//     Focus: border-color backgroundDark
//   Botoes: Cancelar (secondary) + Rejeitar (bg danger, color white)
//     aria-label="Confirmar rejeicao da solicitacao"
//
// Cancel btn: bg none, border 1px solid inputLine, color textMuted
//   padding 10px 24px, radius pill, font Satoshi 600 13px
// Confirm btn: padding 10px 24px, radius pill, font Satoshi 600 13px, border none
```

### Toast

```typescript
interface ToastProps {
  readonly type: 'success' | 'error'
  readonly message: string
  readonly onDismiss: () => void
}

// position fixed, bottom 24px, left 50%, transform translateX(-50%)
// padding 12px 24px, radius pill
// font Satoshi 600 13px, color white
// shadow: 0 4px 24px rgba(0,0,0,0.2), z-index 6000
//
// success: bg primary
// error: bg danger
//
// Animacao entrada: translateY(150%) → translateY(0), 400ms cubic-bezier(0.175,0.885,0.32,1.275)
// Auto-dismiss: 4000ms
//
// ARIA: role="status" (success), role="alert" (error)
//       aria-live="polite" (success), aria-live="assertive" (error)
```

---

## Loading & Error States

### TabSkeleton

```typescript
interface TabSkeletonProps {
  readonly variant: 'dashboard' | 'table' | 'grid'
}

// Shimmer animation: linear-gradient slide, 1.5s infinite
// bg: linear-gradient(90deg, rgba(38,29,17,0.06) 0%, rgba(38,29,17,0.12) 50%, rgba(38,29,17,0.06) 100%)
//
// variant 'dashboard': 4 stat cards + 3 list rows
// variant 'table': search input disabled + 4 table rows
// variant 'grid': 6 lookup cards com skeleton lines
//
// radius 6px em todas as skeleton lines
// role="status", aria-label="Carregando dados..."
```

### ErrorState

```typescript
interface ErrorStateProps {
  readonly title: string
  readonly message: string
  readonly onRetry: () => void
}

// role="alert"
// padding 24px, bg rgba(166,41,13,0.05), border 1px solid rgba(166,41,13,0.15)
// radius card (12px), display flex, align-items flex-start, gap 12px
//
// Icon: warning triangle, 20px, aria-hidden, flex-shrink 0
// Message h4: Satoshi 600 14px, color danger
// Message p: Satoshi 400 13px, color textMuted
//
// RetryBtn: margin-left auto, padding 8px 16px
//   border 1px solid danger, radius pill, bg none, color danger
//   font Satoshi 600 12px, cursor pointer
//   Focus-visible: outline 2px solid primary, offset 2px
```

### EmptyState

```typescript
interface EmptyStateProps {
  readonly icon: string
  readonly title: string
  readonly description: string
}

// text-align center, padding 48px 24px
//
// IconWrap: 64x64px, radius 16px, bg rgba(38,29,17,0.05)
//   margin 0 auto 16px, display flex, align-items center, justify-content center
//   font-size 24px, aria-hidden="true"
// h3: Satoshi 600 16px
// p: Playfair italic 300 14px, color textMuted, max-width 300px, margin 0 auto
```

---

## Shared CSS Classes

```typescript
import { css, keyframes } from "hono/css"
import { color, font, weight, radius, alpha } from "./tokens.ts"

export const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
`

export const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: 200px 0; }
`
```
