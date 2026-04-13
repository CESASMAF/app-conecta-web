---
name: view-expert
description: >
  Expert skill for implementing Views: Pages (orchestrators) and Components (specialized, autocontained).
  Uses hono/jsx/dom for client-side and hono/css for styling with TypeScript design tokens.
  Use when the user mentions: page, component, view, JSX, UI, form, button, input, card, modal,
  layout, atomic design, design system, styling, hono/css, design tokens, step form, wizard UI.
  Also trigger for "create a component for X", "build the page for Y", "style Z".
  Project uses Deno + Hono JSX DOM (2.8KB) + hono/css. Zero Tailwind, zero styled-components.
---

# View Expert — Pages & Components (hono/jsx/dom + hono/css)

You are a UI implementation specialist. You build Pages (orchestrators) and Components (autocontained specialists).

## Reference Documents

Before implementing any UI code, read the relevant reference:
→ `references/design-tokens.md` — Colors, typography, spacing, shadows, breakpoints (TypeScript source of truth)
→ `references/components-catalog.md` — Base styles, UI primitives, dark theme components, responsive strategy
→ `references/features.md` — Home, Registration Wizard, Family Composition specs (layouts, state, data models, strings PT-BR)
→ `references/animations.md` — Animation philosophy, durations, curves, CSS implementations for every animation in the system
→ `references/api-integration.md` — API endpoints, pagination (cursor-based), response shapes, error handling, date formatting

## Architecture

```
Page (orchestrator)
  ├── useReducer → connects ViewModel
  ├── useEffect → persistence, event listeners (ONLY here)
  ├── calls Service → gets Result → dispatches action
  └── renders Components → passes props + callbacks

Component (specialist)
  ├── receives props (Readonly)
  ├── returns JSX
  ├── useState ONLY for local UI (tooltip open, dropdown expanded)
  └── NEVER: fetch, useReducer, useEffect, business state
```

## Page Rules

Pages are **orchestrators** — they wire ViewModel + Service + Components. Max ~100 lines.

```tsx
import { useReducer, useEffect } from "hono/jsx"
import { wizardReducer, initialState } from "../../presenter/registration/reducer.ts"
import { loadDraft, saveDraft } from "../../presenter/registration/persistence.ts"
import { patientService } from "../../data/services/patient-service.ts"
import { StepPersonalData } from "../components/registration/step-personal-data.tsx"
import { StepIndicator } from "../components/ui/step-indicator.tsx"

export const RegistrationPage: FC = () => {
  const [state, dispatch] = useReducer(wizardReducer, loadDraft() ?? initialState)
  useEffect(() => { saveDraft(state) }, [state])

  const handleSubmit = async () => {
    dispatch({ type: "SAVE_START" })
    const result = await patientService.create(state.fields)
    dispatch(result.ok
      ? { type: "SAVE_SUCCESS", message: "Cadastrado" }
      : { type: "SAVE_FAILURE", message: result.error })
  }

  const steps = [StepPersonalData, StepDocuments, StepAddress]
  const CurrentStep = steps[state.currentStep]

  return (
    <main>
      <StepIndicator current={state.currentStep} total={steps.length} />
      <CurrentStep
        fields={state.fields}
        errors={state.showErrors ? state.errors : new Map()}
        onUpdate={(f, v) => dispatch({ type: "UPDATE_FIELD", field: f, value: v })}
      />
      <button onClick={() => dispatch({ type: "NEXT_STEP" })}>Próximo</button>
    </main>
  )
}
```

**If the page exceeds 100 lines, extract sections into components.**

## Component Rules

Components are **specialists** — each does ONE thing, receives everything via props.

```tsx
import type { FC } from "hono/jsx"
import { css } from "hono/css"
import { color, space } from "../../styles/tokens.ts"

interface PatientCardProps {
  readonly name: string
  readonly cpf: string
  readonly status: string
  readonly onSelect: () => void
}

const cardStyle = css`
  background: ${color.surface};
  border-radius: 8px;
  padding: ${space.md};
  cursor: pointer;
  &:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
`

export const PatientCard: FC<PatientCardProps> = ({ name, cpf, status, onSelect }) => (
  <div class={cardStyle} onClick={onSelect}>
    <span>{name}</span>
    <span>{cpf}</span>
    <StatusBadge status={status} />
  </div>
)
```

### Allowed in Components
- Props (Readonly)
- `useState` ONLY for local UI: tooltip open, dropdown expanded, input focus
- `css` template literals from hono/css
- Rendering other components

### FORBIDDEN in Components
- `fetch`, `useEffect`, `useReducer`
- Business state, data transformations
- Direct service calls
- Receiving raw API responses as props (must be already processed)

### When to break a component
- More than ~50 lines of JSX → extract subcomponents
- Handles multiple unrelated concerns → split
- Has conditional rendering for different data shapes → one component per shape

## Styling with hono/css

### Design Tokens (TypeScript module)
```typescript
// src/client/styles/tokens.ts
export const color = {
  primary: "#FF6B35", secondary: "#004E89", accent: "#F7B801",
  danger: "#DC2626", success: "#16A34A",
  text: "#2E2E2E", textLight: "#6B7280",
  background: "#FAFAFA", surface: "#FFFFFF", border: "#E5E7EB",
} as const

export const space = { xs: "0.25rem", sm: "0.5rem", md: "1rem", lg: "1.5rem", xl: "2rem" } as const
export const radius = { sm: "4px", md: "8px", lg: "12px", full: "9999px" } as const
export const font = {
  family: "'Satoshi', sans-serif",
  size: { sm: "0.875rem", md: "1rem", lg: "1.25rem", xl: "1.5rem" },
  weight: { regular: "400", medium: "500", bold: "700" },
} as const
```

### Composable Styles
```typescript
import { css, cx, keyframes } from "hono/css"
import { color, space, radius } from "./tokens.ts"

export const inputBase = css`
  border: none; border-bottom: 2px solid ${color.border};
  padding: ${space.sm} 0; font-size: 1rem; outline: none; width: 100%;
  &:focus { border-color: ${color.primary}; }
`
export const inputError = css`${inputBase} border-color: ${color.danger};`

// cx for conditional composition
<input class={cx(inputBase, hasError && inputError)} />
```

### CSP Nonce (SSR)
```tsx
// In SSR layout, Style component gets nonce
<Style nonce={c.get("secureHeadersNonce")} />
```

## Client Apps (entry points)
```tsx
// src/client/apps/registration/entry.tsx
import { render } from "hono/jsx/dom"
import { Style } from "hono/css"
import { RegistrationPage } from "../../views/pages/registration-page.tsx"

const root = document.getElementById("registration-app")
if (root) render(<><Style /><RegistrationPage /></>, root)
```

## Component Organization
```
src/client/views/
  pages/
    social-care-page.tsx
    registration-page.tsx
    family-page.tsx
  components/
    ui/                    — generic primitives (no business knowledge)
      underline-input.tsx, button.tsx, status-badge.tsx, spinner.tsx,
      error-banner.tsx, modal.tsx, step-indicator.tsx, stack.tsx
    patient/               — knows how to render Patient
      patient-card.tsx, patient-search-result.tsx, patient-header.tsx
    family/                — knows how to render FamilyMember
      family-member-row.tsx, add-member-form.tsx, relationship-select.tsx
    registration/          — knows how to render wizard steps
      step-personal-data.tsx, step-documents.tsx, step-address.tsx
    care/                  — knows how to render care concepts
```

## Import Boundaries
- Components import from: `hono/jsx`, `hono/css`, `../styles/tokens.ts`, `../../contracts/`, other components
- Components NEVER import from: `../../data/`, `../../presenter/`, `hono` (server)
- Pages import from: `hono/jsx`, contracts, components, presenter, data/services
- Mocks import ONLY from: `../../contracts/`
- Client code uses `hono/jsx/dom`. Server code uses `hono/jsx`. NEVER mix.

## Contracts & Mocks (Design Companion workflow)
- **Contracts** (`src/client/contracts/`) define component prop types — the handshake between developer and designer
- **Mocks** (`src/client/mocks/`) provide realistic test data with 3+ scenarios (empty, filled, withErrors)
- Components MUST satisfy contract prop types
- When a contract exists for a component, use it as the props type

## Checklist
- [ ] Pages max ~100 lines, only orchestrate (reducer + service + components)
- [ ] Components are (props) => JSX, autocontained, specialized
- [ ] No `fetch`, `useEffect`, `useReducer` in components
- [ ] useState in components ONLY for local UI state
- [ ] Styles use hono/css with TypeScript tokens
- [ ] No Tailwind classes, no inline styles (except dynamic values)
- [ ] Import boundary respected: client never imports server modules
- [ ] God pages forbidden — extract sections into components
