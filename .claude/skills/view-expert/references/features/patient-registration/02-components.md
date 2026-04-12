# Patient Registration — Component Catalog

> Componentes específicos desta feature. Segue o padrão do `components-catalog.md`:
> `(props: Readonly<{...}>) => JSX`. Zero fetch, zero useReducer. useState ONLY para UI local.
> Imports: `css`, `cx`, `keyframes` de `hono/css`. Tokens de `src/client/styles/tokens.ts`.
> Design System: **Sage Garden** — ver tokens abaixo.

## Sage Garden Token Override

Esta feature usa a paleta **Sage Garden** (aprovada em 2026-04-11). Os tokens são:

```typescript
// Sage Garden additions to src/client/styles/tokens.ts
const sage = {
  bgBase: "#F8F3EC",
  bgWarm: "#F0E8DC",
  bgSage: "#E2E8DF",
  bgSageDeep: "#D4DDD0",
  bgCard: "rgba(255,255,255,0.45)",
  bgCardHover: "rgba(255,255,255,0.65)",
  bgCardBorder: "rgba(255,255,255,0.6)",
  bgCardBorderHover: "rgba(79,132,72,0.2)",
  textPrimary: "#1E2B1A",
  textSecondary: "#3D5235",
  textMuted: "#6B7F65",
  textSoft: "#8B9E85",
  greenPrimary: "#4F8448",
  greenDark: "#3D6A37",
  greenLight: "rgba(79,132,72,0.08)",
  danger: "#C4422B",
  dangerLight: "rgba(196,66,43,0.08)",
} as const
```

---

## Component Tree

```
RegistrationPage (orchestrator)
│
├── Sidebar
│   ├── SidebarLogo
│   ├── SidebarBrand
│   ├── SidebarNav
│   │   └── SidebarItem (×4)
│   └── SidebarFooter (avatar + username)
│
├── MainContent
│   ├── WizardTopBar
│   │   ├── BackLink
│   │   └── DraftIndicator
│   │
│   ├── WizardStepper
│   │   ├── ProgressBar
│   │   └── StepDot (×7)
│   │
│   ├── StepperMobile              ← condicional (< 600px)
│   │
│   ├── StepContent (glass card)
│   │   ├── StepHeader
│   │   │
│   │   ├── [step 0] StepPersonalData
│   │   │   ├── FormField (×8, grid 2-col)
│   │   │   └── CardSelectorGroup (Sexo)
│   │   │
│   │   ├── [step 1] StepDocuments
│   │   │   ├── GlobalErrorBanner         ← condicional (CD-001)
│   │   │   ├── FormField (CPF, NIS, CNS)
│   │   │   ├── FormSectionTitle ("RG")
│   │   │   └── FormField (RG ×4)
│   │   │
│   │   ├── [step 2] StepAddress
│   │   │   ├── GlobalErrorBanner         ← condicional
│   │   │   ├── LocationTypeGate
│   │   │   │   └── AddressTypeCard (×3: Urbano/Rural/Rua)
│   │   │   ├── AddressInfoBanner         ← condicional (Rural ou Rua)
│   │   │   └── AddressFields             ← reveal animation, campos condicionais
│   │   │
│   │   ├── [step 3] StepDiagnosis
│   │   │   ├── GlobalErrorBanner         ← condicional (PAT-001)
│   │   │   ├── DiagnosisCard (×N)
│   │   │   │   ├── DiagnosisStatus       ← PENDENTE/COMPLETO badge
│   │   │   │   ├── DiagnosisRemoveBtn
│   │   │   │   ├── FormField (CID, Data, Descrição)
│   │   │   │   └── QuickCIDChips (×8)
│   │   │   └── AddDiagnosisButton
│   │   │
│   │   ├── [step 4] StepFamily
│   │   │   ├── MemberRow (×N)
│   │   │   │   ├── MemberIndex
│   │   │   │   ├── MemberName
│   │   │   │   ├── MemberMeta
│   │   │   │   └── MemberRemoveBtn
│   │   │   ├── FamilyForm                ← condicional (adding member)
│   │   │   │   ├── FormField (×6)
│   │   │   │   ├── DocumentChips (×6)
│   │   │   │   ├── DocumentSection (×N, dynamic)
│   │   │   │   │   └── FormField (per document type)
│   │   │   │   └── ConfirmBar
│   │   │   └── AddMemberButton
│   │   │
│   │   ├── [step 5] StepSpecificity
│   │   │   └── FormField (×3, grid)
│   │   │
│   │   ├── [step 6] StepIngress
│   │   │   ├── FormField (tipo, origem, contato)
│   │   │   ├── TextareaField (motivo)
│   │   │   ├── FormSectionTitle
│   │   │   ├── ProgramsGrid
│   │   │   │   └── ProgramItem (×5)
│   │   │   └── TextareaField (observação)
│   │   │
│   │   └── ButtonBar
│   │       ├── BackButton (secondary)
│   │       └── NextButton / SubmitButton (primary)
│   │
│   └── SuccessOverlay              ← condicional (saveResult.ok)
│       ├── SuccessCircle (checkmark SVG)
│       ├── SuccessText
│       ├── SuccessSubtitle
│       └── SuccessActions (Novo cadastro + Ver famílias)
```

---

## Shared Components

### FormField

```typescript
interface FormFieldProps {
  readonly label: string
  readonly name: string
  readonly placeholder: string
  readonly required?: boolean
  readonly full?: boolean           // grid-column: 1 / -1
  readonly value: string
  readonly error?: string
  readonly maxLength?: number
  readonly onInput: (value: string) => void
  readonly mask?: (el: HTMLInputElement) => void
}

// Layout: flex column, gap 6px
// Label: Satoshi 12px 600 uppercase, letter-spacing 1px, textSoft
// Required: ::after " *" in danger
// Input: transparent bg, bottom border 1.5px rgba(79,132,72,0.15)
//   padding 10px 0, Satoshi 15px, textPrimary
// Placeholder: textSoft, italic
// Focus: border-color greenPrimary
// Error state: border-color danger, .field-error shows below
// Filled state: border opacity increases to 0.3
// Error text: 12.5px danger, margin-top 4px
```

### CardSelectorGroup

```typescript
interface CardSelectorGroupProps {
  readonly options: readonly string[]
  readonly selected: string | null
  readonly onSelect: (value: string) => void
  readonly error?: string
}

// Container: flex row, gap 10px, margin-top 8px
// Each card: flex 1, padding 14px 16px, text-center
//   bg: rgba(255,255,255,0.4), border 1.5px rgba(79,132,72,0.1)
//   radius 12px (r-md), Satoshi 14px 500 textMuted
// Hover: bg rgba(255,255,255,0.6), border rgba(79,132,72,0.2)
// Selected: bg greenLight, border greenPrimary, color greenPrimary
//   font-weight 600, box-shadow 0 0 0 3px rgba(79,132,72,0.08)
// Error state: all cards get border rgba(196,66,43,0.3)
//
// ARIA: role="radiogroup", each card role="radio"
//   aria-checked, tabindex="0", onkeydown Enter/Space
// Focus-visible: outline 2px solid greenPrimary, offset 2px
// Mobile: flex-direction column
```

### GlobalErrorBanner

```typescript
interface GlobalErrorBannerProps {
  readonly message: string
}

// SÓ RENDERIZA SE: message não vazio
// Container: flex, align-items center, gap 12px
//   padding 12px 16px, bg rgba(196,66,43,0.06)
//   border 1px rgba(196,66,43,0.15), radius 12px (r-md)
// Icon: 22px circle, bg danger, color white, "!" 13px bold
// Text: 13px 500, color danger, line-height 1.4
//
// Animação: bannerSlide 500ms ease-out (opacity + translateX -8px→0)
// ARIA: role="alert" (auto-announce)
```

---

## Step-Specific Components

### AddressTypeCard

```typescript
interface AddressTypeCardProps {
  readonly type: 'URBANO' | 'RURAL' | 'RUA'
  readonly icon: string            // emoji: 🏗 🌾 🛌
  readonly label: string
  readonly description: string
  readonly selected: boolean
  readonly onSelect: () => void
}

// Layout: flex column, align-items center, padding 20px 16px 16px
//   min-height 100px, gap 4px
// Icon: 28px font-size, margin-bottom 4px
// Label: Erode 14px 600 textPrimary
// Description: Satoshi 11px textSoft, text-align center, line-height 1.3
// Selected: label color greenPrimary, desc color greenDark
//   + standard card-selector selected styles
//
// ARIA: role="radio", aria-checked, tabindex, onkeydown
// Focus-visible: outline 2px solid greenPrimary, offset 2px
```

### AddressInfoBanner

```typescript
interface AddressInfoBannerProps {
  readonly type: 'RURAL' | 'RUA'
}

// SÓ RENDERIZA SE: locationType === 'RURAL' ou 'RUA'
// Container: flex, align-items center, gap 8px
//   padding 10px 14px, bg rgba(79,132,72,0.06)
//   border 1px rgba(79,132,72,0.12), radius 12px
// Icon: ℹ 16px greenPrimary, flex-shrink 0
// Text: Satoshi 12px 500, textSecondary, line-height 1.4
//   RURAL: "Rua e Complemento nao se aplicam para area rural."
//   RUA: "Apenas Estado e Cidade sao necessarios para cobertura territorial do CRAS."
//
// ARIA: role="status"
```

### DiagnosisCard

```typescript
interface DiagnosisCardProps {
  readonly index: number
  readonly entry: DiagnosisEntry
  readonly errors: ReadonlyMap<string, string>
  readonly onUpdate: (field: keyof DiagnosisEntry, value: string) => void
  readonly onRemove: () => void
  readonly onQuickCID: (code: string, description: string) => void
}

// Container: bg rgba(255,255,255,0.3), backdrop-filter blur(12px)
//   border 1px rgba(255,255,255,0.5), radius 16px (r-lg)
//   padding 24px (s5), position relative
// Completed state (.diag-complete):
//   border rgba(79,132,72,0.3), bg rgba(79,132,72,0.04)
// Grid: 2-column for CID + Date, full-width for Description
// Quick CIDs: full-width row of chips below description
//
// Animation: fadeInUp 500ms ease-out
// Spacing: + .diagnosis-card margin-top 12px
```

### DiagnosisStatus

```typescript
interface DiagnosisStatusProps {
  readonly isComplete: boolean
}

// Position: absolute, top 12px, right 44px
// Layout: flex, align-items center, gap 5px
// Text: Satoshi 11px 600 uppercase, letter-spacing 0.5px
//   Pendente: textSoft
//   Completo: greenPrimary
// Icon: 18×18px circle
//   Pendente: border 1.5px rgba(79,132,72,0.2), bg rgba(255,255,255,0.4), transparent checkmark
//   Completo: border greenPrimary, bg greenPrimary, white checkmark ✓
// Transition: all 300ms ease-out
// white-space: nowrap (evita quebra de linha)
```

### QuickCIDChip

```typescript
interface QuickCIDChipProps {
  readonly code: string
  readonly label: string           // "G80 -- Paralisia cerebral"
  readonly isActive: boolean
  readonly onClick: () => void
}

// <button> semântico, type="button"
// Satoshi 12px 500, padding 4px 12px, radius pill (100px)
// Default: border 1px rgba(79,132,72,0.15), bg rgba(255,255,255,0.3), textMuted
// Hover: border greenPrimary, color greenPrimary, bg greenLight
// Active (.chip-active): border greenPrimary, bg greenPrimary, color white, weight 600
// Transition: all 150ms ease-out
//
// Focus-visible: outline 2px solid greenPrimary, offset 2px
```

### MemberRow

```typescript
interface MemberRowProps {
  readonly index: number           // 01, 02, 03...
  readonly name: string
  readonly meta: string            // "Conjuge | Masculino | Reside | CPF, RG"
  readonly isReference: boolean    // first row, no remove button
  readonly onRemove?: () => void
}

// Grid: auto 1fr 1fr auto, gap 16px, padding 12px 0
// Border-bottom: 1px rgba(79,132,72,0.08)
// Index: Satoshi 12px textSoft, tabular-nums, min-width 20px
// Name: Erode 16px 600 textPrimary
// Meta: Satoshi 14px textMuted
// Remove: 28×28px circle, border 1px rgba(79,132,72,0.15)
//   bg transparent, textMuted, 14px "×"
// Remove hover: border danger, color danger
//
// Animation: fadeInUp 500ms ease-out
// Mobile: grid 3-col (auto 1fr auto), meta moves to row 2
```

### DocumentChip

```typescript
interface DocumentChipProps {
  readonly label: string           // "CPF", "RG", "Certidao de Nascimento", etc.
  readonly docType: string         // "cpf", "rg", "cn", "cns", "te", "ctps"
  readonly isActive: boolean
  readonly onToggle: () => void
}

// Reusa QuickCIDChip styles (same visual)
// Active state toggles the chip-active class
// <button> type="button"
// ARIA: aria-pressed={isActive}
```

### DocumentSection

```typescript
interface DocumentSectionProps {
  readonly docType: 'cpf' | 'rg' | 'cn' | 'cns' | 'te' | 'ctps'
  readonly fields: Readonly<Record<string, string>>
  readonly errors: ReadonlyMap<string, string>
  readonly onUpdate: (field: string, value: string) => void
}

// Container: bg rgba(255,255,255,0.25), border 1px rgba(79,132,72,0.1)
//   radius 12px, padding 16px, margin-top 12px
// Title: flex, align-items center, gap 6px
//   Badge: Satoshi 10px 600 uppercase, padding 2px 8px, pill radius
//     bg greenLight, color greenPrimary
//   Text: Erode 13px 600 textSecondary
// Grid: standard form-grid with reduced gaps (12px 16px)
//
// Animation: fadeInUp 400ms ease-out
//
// Document-specific field layouts:
//   CPF: 1 field (number)
//   RG: 4 fields (number, UF, agency, date)
//   CN: 1 field full-width (matricula 32 digits)
//   CNS: 1 field full-width (15 digits)
//   TE: 4 fields (number, zona, secao, UF)
//   CTPS: 3 fields (number, serie, UF)
```

### ProgramItem

```typescript
interface ProgramItemProps {
  readonly label: string
  readonly selected: boolean
  readonly onToggle: () => void
}

// Container: flex, align-items center, gap 12px
//   padding 12px 16px, border 1.5px rgba(79,132,72,0.1)
//   radius 12px, bg rgba(255,255,255,0.3), cursor pointer
// Checkbox: 18×18px, radius 8px, border 1.5px rgba(79,132,72,0.2)
//   Default: transparent, checkmark hidden
//   Selected: bg greenPrimary, border greenPrimary, white checkmark
// Label: Satoshi 14px textMuted
//   Selected: color greenPrimary, weight 500
// Container selected: border greenPrimary, bg greenLight
//   box-shadow 0 0 0 3px rgba(79,132,72,0.08)
// Hover: border rgba(79,132,72,0.2), bg rgba(255,255,255,0.5)
//
// Grid: 2 columns, gap 12px
// Mobile: 1 column
// ARIA: role="checkbox", aria-checked, tabindex="0"
// Focus-visible: outline 2px solid greenPrimary, offset 2px
// IMPORTANT: nenhum programa pré-selecionado (por contrato)
```

### ButtonBar

```typescript
interface ButtonBarProps {
  readonly currentStep: number
  readonly isLastStep: boolean
  readonly saving: boolean
  readonly onBack: () => void
  readonly onNext: () => void
}

// Container: flex, justify-content space-between, align-items center
//   margin-top 40px, padding-top 24px
//   border-top 1px rgba(79,132,72,0.08)
//
// Back button (secondary):
//   bg transparent, border 1.5px rgba(79,132,72,0.2)
//   Satoshi 14px 600 textMuted, padding 10px 20px, pill radius
//   Hover: border rgba(79,132,72,0.4), color textSecondary
//   Hidden on step 0 (visibility: hidden)
//   Text: "← Anterior"
//
// Next button (primary):
//   bg: linear-gradient(135deg, greenPrimary, greenDark)
//   color white, Satoshi 14px 600, padding 12px 28px, pill radius
//   shadow: 0 2px 12px rgba(79,132,72,0.2)
//   Hover: translateY(-1px), shadow 0 4px 20px rgba(79,132,72,0.3)
//   Text: "Proximo →" (steps 0-5) | "Salvar Cadastro" (step 6)
//   Saving: "Salvando..." + disabled
//
// Focus-visible (ambos): outline 2px solid greenPrimary, offset 2px
```

### SuccessOverlay

```typescript
interface SuccessOverlayProps {
  readonly visible: boolean
  readonly onNewRegistration: () => void
  readonly onViewFamilies: () => void
}

// Overlay: fixed inset 0, bg rgba(248,243,236,0.88), backdrop-filter blur(8px)
//   flex center, z-index 1000
//   opacity 0 + pointer-events none → visible: opacity 1 + auto
//   Transition: opacity 500ms ease-out
//
// Glass card: bgCard, backdrop blur(20px), border bgCardBorder
//   radius 20px, padding 48px 56px, text-center, max-width 420px
//   shadow: 0 8px 40px rgba(0,0,0,0.06)
//   Animation: successIn 800ms spring (scale 0.95→1)
//
// Circle: 64×64px, radius 50%, bg gradient(greenPrimary→greenDark)
//   shadow: 0 4px 20px rgba(79,132,72,0.25)
//   Animation: successScale 600ms spring
// Checkmark SVG: 28×28px, stroke white 2.5px, round caps
//   stroke-dasharray 30, animation checkDraw 500ms ease-out 400ms
//
// Title: Erode 24px 700, textPrimary, margin-bottom 8px
//   Animation: fadeInUp 500ms ease-out 600ms
//   Text: "Cadastro realizado!"
//
// Subtitle: Satoshi 14px textMuted, line-height 1.5, margin-bottom 24px
//   Animation: fadeInUp 500ms ease-out 750ms
//   Text: "A familia foi cadastrada com sucesso no sistema Conecta."
//
// Actions: flex, gap 12px, justify-content center
//   Animation: fadeInUp 500ms ease-out 900ms
//   "Novo cadastro" → secondary button → onNewRegistration
//   "Ver familias →" → primary button → onViewFamilies
//
// ARIA: role="dialog", aria-modal="true", aria-labelledby (title)
// Focus trap: tab cycles within overlay
// Escape: dismiss → onViewFamilies
```

---

## Sidebar Components

### Sidebar

```typescript
interface SidebarProps {
  readonly activeItem: 'familias' | 'cadastro' | 'relatorios' | 'config'
  readonly userName: string
  readonly userInitials: string
}

// Fixed left 0 top 0 bottom 0, width 64px
// bg rgba(255,255,255,0.3), backdrop-filter blur(20px)
// border-right 1px rgba(79,132,72,0.08)
// Hover: width 220px (transition 300ms ease-out)
// Labels + badge: opacity 0→1, translateX(-8px)→0 on parent hover
//
// Mobile (< 600px): display none
//
// ARIA: <nav aria-label="Menu principal">
```

---

## Shared CSS Classes (Sage Garden)

```typescript
import { css, keyframes } from "hono/css"

// Entry animations
export const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`

export const containerFadeIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`

export const bannerSlide = keyframes`
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
`

export const successScale = keyframes`
  0% { transform: scale(0); }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); }
`

export const checkDraw = keyframes`
  to { stroke-dashoffset: 0; }
`

export const successIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`

// Easing curves
export const easeOut = "cubic-bezier(0.16, 1, 0.3, 1)"
export const easeSpring = "cubic-bezier(0.34, 1.56, 0.64, 1)"
```
