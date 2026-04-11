# Design Tokens — hono/css TypeScript Reference

> Source of truth for all visual values. Import from `src/client/styles/tokens.ts`.

## Colors

```typescript
// src/client/styles/tokens.ts

export const color = {
  // Backgrounds
  background: "#F2E2C4",
  backgroundDark: "#172D48",
  surface: "#FAF0E0",
  surfaceLight: "#FFFBF4",
  cardAlternate: "#C8BBA4",

  // Text
  textPrimary: "#261D11",
  textOnDark: "#F2E2C4",
  textMuted: "rgba(38, 29, 17, 0.5)",
  antiFlash: "#EBEBEB",

  // Semantic
  primary: "#4F8448",
  danger: "#A6290D",
  warning: "#C9960A",

  // Borders
  inputLine: "rgba(38, 29, 17, 0.2)",
  borderOnDark: "#F2E2C4",
} as const

// Helper: apply alpha to any hex color
export const alpha = (hex: string, a: number): string => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}
```

## Typography

```typescript
export const font = {
  satoshi: "'Satoshi', sans-serif",
  playfair: "'Playfair Display', serif",
  erode: "'Erode', serif",
} as const

export const weight = {
  light: "300",
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const
```

### Usage Guide

| Font | When |
|------|------|
| **Satoshi** | Headings, labels, nav, badges, table headers, UI chrome |
| **Playfair Display** | Decorative, placeholders, CTA buttons, hints, subtitles (always italic) |
| **Erode** | Form inputs, design system buttons (serif) |

### Common Sizes (hardcoded in features)

| Size | Font | Weight | Usage |
|------|------|--------|-------|
| 48px | Satoshi | 700 | Panel titles ("Dados", "Fichas") |
| 40px | Satoshi | 400/700 | Family list surname |
| 38px | Satoshi | 700 | Page title "Composição Familiar" |
| 22px | Satoshi | 700 | Modal title |
| 18px | Playfair | 300i | Search input, empty state |
| 16px | Satoshi | 500 | Body text, ficha row |
| 15px | Playfair | 300i | Panel subtitle |
| 14px | Satoshi | 700 | Nav links, counter |
| 13px | Satoshi | 700 | Table text, labels ALL CAPS (ls: 0.05em) |
| 12px | Satoshi | 700 | Small modal labels |
| 11px | Satoshi | — | Validation errors, doc labels |
| 10px | Satoshi | 700 | Section titles (ls: 1.5px) |

## Spacing

```typescript
export const space = {
  1: "4px",
  2: "8px",
  3: "16px",
  4: "24px",
  5: "32px",
  6: "40px",
  7: "48px",
  8: "56px",
  9: "64px",
  10: "72px",
} as const
```

## Shadows

```typescript
import { css } from "hono/css"

export const shadow = {
  button: css`box-shadow: 2.5px 2.5px 5px 2px rgba(0,0,0,0.12), -1px -1px 4px rgba(0,0,0,0.06);`,
  panel: css`box-shadow: -8px 0 40px ${alpha(color.textPrimary, 0.3)};`,
  fab: css`box-shadow: 0 2px 8px rgba(0,0,0,0.12);`,
  dialog: css`box-shadow: 0 24px 80px ${color.inputLine};`,
  modal: css`
    box-shadow:
      0 0 0 1px rgba(0,0,0,0.04),
      -9px 9px 9px -0.5px rgba(0,0,0,0.04),
      -18px 18px 18px -1.5px rgba(0,0,0,0.08),
      -37px 37px 37px -3px rgba(0,0,0,0.16),
      -75px 75px 75px -6px rgba(0,0,0,0.24),
      -150px 150px 150px -12px rgba(0,0,0,0.48);
  `,
} as const
```

## Border Radius

```typescript
export const radius = {
  pill: "100px",
  panel: "24px",
  card: "12px",
  dropdown: "8px",
  modal: "6px",
  checkbox: "4px",
  small: "3px",
} as const
```

## Breakpoints

```typescript
export const breakpoint = {
  mobile: 600,
  tablet: 1200,
} as const

// Usage in components: check window.innerWidth or container width
export const isMobile = () => window.innerWidth < breakpoint.mobile
export const isTablet = () => window.innerWidth >= breakpoint.mobile && window.innerWidth < breakpoint.tablet
export const isDesktop = () => window.innerWidth >= breakpoint.tablet
```

## Responsive Adaptations

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Page padding horizontal | 20px | 40px | 48px |
| Grid columns | 1 | 1-2 | 2 |
| Stepper labels | Hidden | Hidden | Shown |
| Modal max-width | 92vw | 760px | 760px |
| Button height | 48px | 56px | 72px |
| Detail panel width | 100% | 56vw | min(56vw, 720px) |
