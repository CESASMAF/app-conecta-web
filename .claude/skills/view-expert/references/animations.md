# Animation System — Philosophy & CSS Implementation

> Every animation has a reason. This document explains WHY each animation exists and HOW to implement it with CSS transitions in hono/jsx/dom.

## Animation Philosophy

Animations in this system serve **communication**, not decoration. Each one tells the user something about spatial relationships, state changes, or hierarchy. The durations and curves are calibrated for the specific context.

## Animation Catalog

### 1. Panel Slide (350ms, standard easing)

**Why:** When the user clicks a surname, the detail panel slides from the right. The curve `cubic-bezier(0.4, 0, 0.2, 1)` (Material Design standard easing) starts fast and decelerates, giving a sense of physical weight. 350ms is the sweet spot for panels: fast enough not to annoy, slow enough for the eye to follow.

```css
.detail-panel {
  position: fixed;
  top: 0; bottom: 0; right: 0;
  width: min(56vw, 720px);
  transform: translateX(100%);
  transition: transform 350ms cubic-bezier(0.4, 0, 0.2, 1);
}
.detail-panel[data-visible="true"] {
  transform: translateX(0);
}
```

**Close orchestration:** When closing, set `panelVisible = false` first (triggers slideOut), then `setTimeout(350)` to clear `selectedPatientId` and `patientDetail` AFTER the animation completes. If you clear state immediately, the component unmounts and the animation is cut.

### 2. Overlay Fade (300ms, ease)

**Why:** The dark overlay (`rgba(38,29,17,0.05)`) fades in 300ms — slightly faster than the panel slide. This creates a layering effect: the overlay arrives before the panel finishes entering, adding depth.

```css
.panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(38, 29, 17, 0.05);
  opacity: 0;
  pointer-events: none;
  transition: opacity 300ms ease;
}
.panel-overlay[data-visible="true"] {
  opacity: 1;
  pointer-events: auto;
}
```

### 3. Family Item Hover — Sibling Fade (250ms)

**Why:** When hovering or selecting a surname, others receive `color: textMuted` while the active one becomes `fontWeight: 700`. This is the Figma "Hover" screen behavior — the highlighted name goes dark and bold while siblings fade.

```css
.family-item {
  transition: color 250ms ease, font-weight 250ms ease;
}
/* Default state */
.family-item { color: var(--text-primary); font-weight: 500; }
/* When ANY item is selected, dim all others */
.family-list[data-has-selection="true"] .family-item { color: var(--text-muted); font-weight: 400; }
/* The selected/hovered item stays prominent */
.family-item[data-selected="true"],
.family-item:hover { color: var(--text-primary); font-weight: 700; }
```

### 4. Subtitle Reveal — Name + Members (300ms, ease-out)

**Why:** The text "Ana · 3 membros" that appears next to the surname uses a combined transition: `opacity 0→1` + `translateX(-8px→0)`. The 8px horizontal offset creates a micro-slide that makes the info feel like it "emerges" from the surname.

```css
.family-item-details {
  opacity: 0;
  transform: translateX(-8px);
  transition: opacity 300ms ease-out, transform 300ms ease-out;
  pointer-events: none;
}
.family-item[data-expanded="true"] .family-item-details {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}
```

### 5. FAB Hover Lift (200ms)

**Why:** The "Novo cadastro" button lifts 2px on hover while its shadow grows. The growing shadow with the lift creates a physical elevation illusion. 200ms — buttons need instant response.

```css
.fab {
  transition: transform 200ms ease, box-shadow 200ms ease;
  box-shadow: 0 4px 24px rgba(79, 132, 72, 0.35);
}
.fab:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 32px rgba(79, 132, 72, 0.45);
}
```

### 6. Circle Buttons — Background Fill (200ms)

**Why:** The panel's circular buttons (edit, fichas, close) transition from transparent to a tinted background on hover. The close button gets a red tint `rgba(166,41,13,0.2)` — subtle "destructive action" hint without being aggressive.

```css
.circle-button {
  transition: background 200ms ease, border-color 200ms ease;
  background: transparent;
}
.circle-button:hover {
  background: rgba(242, 226, 196, 0.1);
}
.circle-button.close:hover {
  background: rgba(166, 41, 13, 0.2);
}
```

### 7. Ficha Rows — Opacity (150ms)

**Why:** The shortest duration in the system. List items need ultra-fast response to keep up with mouse movement during scrolling. Filled fichas: 0.9 idle, 1.0 hover. Pending fichas: 0.5 idle, 1.0 hover.

```css
.ficha-row {
  transition: opacity 150ms ease;
}
.ficha-row[data-filled="true"] { opacity: 0.9; }
.ficha-row[data-filled="false"] { opacity: 0.5; }
.ficha-row:hover { opacity: 1; }
```

### 8. Error Banner Entry (400ms, ease-out)

**Why:** Validation errors slide in from the left with a fade. The 400ms + easeOut creates urgency without being jarring.

```typescript
const bannerEntry = keyframes`
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`
// Apply: animation: ${bannerEntry} 400ms ease-out;
```

### 9. Toast Notification (400ms, elastic-out)

**Why:** Toasts slide up from below with elastic overshoot — playful, attention-grabbing without being disruptive. Auto-dismiss after 4 seconds.

```typescript
const slideUp = keyframes`
  from { transform: translateY(150%); }
  to { transform: translateY(0); }
`
// Apply: animation: ${slideUp} 400ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
// Reverse on dismiss: same but to→from
```

**Implementation pattern:**
```tsx
const [visible, setVisible] = useState(true)
useEffect(() => {
  const timer = setTimeout(() => setVisible(false), 4000)
  return () => clearTimeout(timer)
}, [])
```

### 10. Success Button (600ms, elastic-out + 500ms checkmark)

**Why:** The save success animation is celebratory — the button scales from 0→1 with elastic bounce, then a checkmark draws via SVG stroke animation. This is the emotional payoff for completing the 7-step wizard.

```css
.success-button {
  animation: scaleIn 600ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes scaleIn {
  from { transform: scale(0); }
  to { transform: scale(1); }
}

/* Checkmark draws via SVG stroke-dashoffset */
.checkmark path {
  stroke-dasharray: 40;
  stroke-dashoffset: 40;
  animation: draw 500ms ease-out 200ms forwards; /* 200ms delay after button scales */
}
@keyframes draw {
  to { stroke-dashoffset: 0; }
}
```

## Duration Cheatsheet

| Duration | Where | Why |
|----------|-------|-----|
| **150ms** | Ficha rows, micro-interactions | Ultra-fast, keeps up with mouse |
| **200ms** | Buttons, circle buttons | Immediate response feel |
| **250ms** | Font weight, color changes | Smooth but quick state change |
| **300ms** | Overlay, subtitle reveal | Noticeable but not slow |
| **350ms** | Panel slide | Physical, weighty |
| **400ms** | Error banner, toast | Attention-grabbing entry |
| **500ms** | Checkmark draw | Deliberate, celebratory |
| **600ms** | Success button scale | Elastic, emotional payoff |
| **4000ms** | Toast auto-dismiss | Enough time to read |

## Curve Cheatsheet

| Curve | CSS | When |
|-------|-----|------|
| Standard easing | `cubic-bezier(0.4, 0, 0.2, 1)` | Panels, overlays (physical movement) |
| Ease-out | `ease-out` | Elements entering the screen |
| Ease | `ease` | General purpose |
| Elastic | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` | Celebratory (toast, success) |

## View Transitions API (Enhancement)

Use `startViewTransition` from hono/jsx for coordinated state changes:

```tsx
import { startViewTransition } from "hono/jsx"

// Panel open: coordinated overlay + panel + list dimming
const handleSelect = (id: string) => {
  startViewTransition(() => dispatch({ type: "SELECT_PATIENT", id }))
}
```

The browser handles the cross-fade between old and new state automatically. Falls back to instant update in unsupported browsers.
