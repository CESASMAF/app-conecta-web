# Component Catalog — hono/jsx/dom + hono/css

> All components are `(props: Readonly<{...}>) => JSX`. Zero fetch, zero useReducer. useState ONLY for local UI state (hover, focus, open/close).

## Table of Contents
1. Base Styles (reusable css`` blocks)
2. UI Primitives (generic, no business knowledge)
3. Dark Theme Components (modals, panels)
4. Animations (CSS transitions)

---

## 1. Base Styles

```typescript
// src/client/styles/base.ts
import { css, cx, keyframes } from "hono/css"
import { color, alpha, font, weight, space, radius, shadow } from "./tokens.ts"

// Pill button base
export const pillButton = css`
  border-radius: ${radius.pill};
  font-family: ${font.playfair};
  font-style: italic;
  font-size: 16px;
  padding: 12px 24px;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s, background 0.2s;
  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`

export const pillButtonPrimary = css`
  ${pillButton}
  background: ${color.primary};
  color: white;
`

export const pillButtonSecondary = css`
  ${pillButton}
  background: transparent;
  color: ${color.textPrimary};
  border: 1.5px solid ${color.textPrimary};
`

export const pillButtonDanger = css`
  ${pillButton}
  background: transparent;
  color: ${color.danger};
  border: none;
`

// Input base (underline style)
export const underlineInput = css`
  border: none;
  border-bottom: 1px solid ${color.inputLine};
  padding: 8px 0;
  font-family: ${font.satoshi};
  font-size: 16px;
  color: ${color.textPrimary};
  background: transparent;
  outline: none;
  width: 100%;
  transition: border-color 0.2s;
  &:focus { border-bottom: 2px solid ${color.textPrimary}; }
  &::placeholder { color: ${color.textMuted}; font-family: ${font.playfair}; font-style: italic; font-weight: 300; }
`

export const underlineInputError = css`
  ${underlineInput}
  border-bottom: 2px solid ${color.danger};
`

// Dark theme input (for modals on backgroundDark)
export const darkInput = css`
  border: none;
  border-bottom: 1px solid ${alpha(color.background, 0.3)};
  padding: 0 0 6px 0;
  font-family: ${font.playfair};
  font-style: italic;
  font-size: 14px;
  font-weight: 300;
  color: ${color.background};
  background: transparent;
  outline: none;
  width: 100%;
  &:focus { border-bottom-color: ${color.background}; }
  &::placeholder { color: ${alpha(color.background, 0.5)}; }
`

// Section title (all caps, spaced)
export const sectionTitle = css`
  font-family: ${font.satoshi};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: ${color.textMuted};
`

// Field label (all caps, small)
export const fieldLabel = css`
  font-family: ${font.satoshi};
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.65px;
  text-transform: uppercase;
`

// Card container
export const card = css`
  background: ${color.surface};
  border-radius: ${radius.card};
  padding: ${space[4]};
`
```

---

## 2. UI Primitives

### StatusBadge

```tsx
interface StatusBadgeProps {
  readonly status: "Ativo" | "Inativo"
}

const dotStyle = (active: boolean) => css`
  width: 8px; height: 8px; border-radius: 50%;
  background: ${active ? color.primary : color.danger};
`

export const StatusBadge: FC<StatusBadgeProps> = ({ status }) => (
  <div class={css`display: flex; align-items: center; gap: 6px;`}>
    <div class={dotStyle(status === "Ativo")} />
    <span class={css`font-family: ${font.satoshi}; font-weight: 500; font-size: 14px;`}>
      {status}
    </span>
  </div>
)
```

### StepIndicator

```tsx
interface StepIndicatorProps {
  readonly current: number
  readonly total: number
  readonly labels?: readonly string[]
}
```

Step states: `pending` (transparent, inputLine border), `active` (textPrimary fill, number in background color), `complete` (primary fill, white checkmark). Connecting lines: primary if completed, inputLine otherwise. Labels visible only on desktop.

### Spinner

```tsx
export const Spinner: FC = () => (
  <div class={css`
    width: 32px; height: 32px;
    border: 3px solid ${color.inputLine};
    border-top-color: ${color.primary};
    border-radius: 50%;
    animation: ${keyframes`to { transform: rotate(360deg) }`} 0.8s linear infinite;
  `} />
)
```

### ErrorBanner

Animated entry: opacity 0→1 + translateX -8px→0, 400ms easeOut.
Background: danger @ 0.06. Border: 1px danger @ 0.12. Radius: 8px. Icon "!" in circle.

### EmptyState

Icon (search_off or custom) + message in Playfair italic. Centered, textMuted color.

### DataField (for detail panel, dark background)

```tsx
interface DataFieldProps {
  readonly label: string
  readonly value: string | null
}

export const DataField: FC<DataFieldProps> = ({ label, value }) => (
  <div>
    <div class={css`${fieldLabel} color: ${alpha(color.background, 0.5)};`}>
      {label}
    </div>
    <div class={css`
      font-family: ${font.playfair}; font-size: 16px;
      color: ${color.background}; margin-top: 4px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    `}>
      {value ?? "—"}
    </div>
  </div>
)
```

### CircleButton (for panel header)

40x40px. Border 1.5px. Two variants: normal (background colored border/icon) and close (danger colored). Hover state with 200ms transition.

---

## 3. Dark Theme Components

All modals and the detail panel use `backgroundDark` (#172D48) as background. Text/borders use `background` (#F2E2C4) as the light color.

### Modal Shell

```tsx
interface ModalShellProps {
  readonly maxWidth?: string
  readonly children: any
  readonly onClose: () => void
}
```

Backdrop: blur 4px + dark overlay. Container: maxWidth (default 760px), backgroundDark, radius 6px, modal shadow, padding 40px. Max-height 92vh with overflow scroll.

### Dark Radio Group

17x17px circles. Border 2px. Selected: background fill + inner 6x6px dark dot. Labels: Playfair italic 14px.

### Dark Checkbox

16x16px. Radius 4px. Border 1.5px. Checked: background fill + "✓" white 9px.

### Dark Text Input

Uses `darkInput` base style. Underline only. Playfair italic 14px weight 300.

### Relationship Selection List

Scrollable list inside a bordered container (radius 8px). Items: 12px horizontal padding, 8px vertical. Hover: background @ 0.05. Selected: background @ 0.1, weight 600.

---

## 4. Animations — CSS Transitions

**Key UX improvement over Flutter:** Use CSS transitions natively instead of JS-driven animations. Simpler, more performant, and the browser handles frame scheduling.

### Detail Panel

```css
/* Overlay */
.panel-overlay {
  background: rgba(38, 29, 17, 0.05);
  transition: opacity 300ms ease;
}

/* Panel slide */
.detail-panel {
  position: fixed;
  top: 0; bottom: 0; right: 0;
  transform: translateX(100%);
  transition: transform 350ms ease-in-out;
}
.detail-panel[data-visible="true"] {
  transform: translateX(0);
}
```

### Family Item Hover

```css
.family-item {
  transition: color 250ms, font-weight 250ms;
}
.family-item-details {
  opacity: 0;
  transform: translateX(-5%);
  transition: opacity 300ms ease-out, transform 300ms ease-out;
}
.family-item[data-expanded="true"] .family-item-details {
  opacity: 1;
  transform: translateX(0);
}
```

### Toast Notification

```typescript
const slideUp = keyframes`
  from { transform: translateY(150%); }
  to { transform: translateY(0); }
`
const toastStyle = css`
  animation: ${slideUp} 400ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
`
```

Auto-dismiss after 4s. Reverse animation on exit.

### Success Button

Scale 0→1 with elastic ease (600ms). Checkmark draws via SVG stroke-dashoffset animation (500ms).

### Error Banner Entry

```typescript
const bannerEntry = keyframes`
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
`
```

### View Transitions API (UX Improvement)

hono/jsx/dom supports `startViewTransition` natively. Use for:
- Panel open/close
- Step transitions in wizard
- Page navigation

```tsx
import { startViewTransition } from "hono/jsx"

const handleSelectPatient = (id: string) => {
  startViewTransition(() => dispatch({ type: "SELECT_PATIENT", id }))
}
```

---

## 5. Responsive Strategy

**UX Improvement:** Use container queries where possible instead of only window breakpoints. This makes components responsive to their container, not just the viewport.

```css
.form-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 28px 40px;
}
.form-grid > * {
  flex: 1 1 280px; /* auto 2-column on desktop, 1-column when narrow */
  min-width: 0;
}
```

For the detail panel and modals, use `@container` queries (supported in all modern browsers):

```css
.modal-body {
  container-type: inline-size;
}
@container (min-width: 500px) {
  .modal-layout { flex-direction: row; }
}
@container (max-width: 499px) {
  .modal-layout { flex-direction: column; }
}
```

---

## 6. Skeleton Loading (UX Improvement)

**Replace spinners with skeleton screens** for better perceived performance. This is especially important for rural/low-connectivity users.

```tsx
const skeletonPulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
`

const skeleton = css`
  background: ${alpha(color.textPrimary, 0.08)};
  border-radius: 4px;
  animation: ${skeletonPulse} 1.5s ease-in-out infinite;
`

export const SkeletonLine: FC<{ width?: string; height?: string }> = ({ width = "100%", height = "16px" }) => (
  <div class={cx(skeleton, css`width: ${width}; height: ${height};`)} />
)

// Usage: while patient detail loads
const DetailPanelSkeleton: FC = () => (
  <div class={css`padding: 48px; display: flex; flex-direction: column; gap: 28px;`}>
    <SkeletonLine width="120px" height="48px" />
    <SkeletonLine width="80px" height="20px" />
    <div class={css`display: flex; flex-direction: column; gap: 16px;`}>
      <SkeletonLine width="60%" />
      <SkeletonLine width="80%" />
      <SkeletonLine width="40%" />
    </div>
  </div>
)
```

---

## 7. Keyboard Navigation (UX Improvement)

- **Escape**: Close panel, close modal
- **Arrow Up/Down**: Navigate family list
- **Enter**: Select/open current item
- **Tab**: Standard focus navigation through form fields

Implement in Pages via `useEffect` with `keydown` listener:

```tsx
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === "Escape") dispatch({ type: "CLOSE_PANEL" })
  }
  document.addEventListener("keydown", handler)
  return () => document.removeEventListener("keydown", handler)
}, [])
```
