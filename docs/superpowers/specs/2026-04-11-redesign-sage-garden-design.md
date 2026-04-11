# Design Spec: Redesign "Sage Garden" — Conecta Social Care

**Date:** 2026-04-11
**Author:** Davi Franklin (UI/UX Designer)
**Status:** Approved
**Approach:** B — Strategic Richness

---

## 1. Design Direction

**Feeling:** Curated, Refined, Purposeful, Artisanal, Elegant

**References:** uneevo.com, akis.studio, linearity.io, bartbeyond.art, funtownstudio.com, avalonplatforms.com, anima-cc.com, Firecrawl, Mistral AI, MasterClass, Luma AI

**Approach:** Strategic Richness — visual impact concentrated at the right moments. Glass morphism on key cards and containers. Static decorative blobs (CSS-only). Animations are purposeful: staggered fade-in on lists, smooth step transitions, micro-interactions on buttons. The wizard stays functionally focused with elegant touches.

---

## 2. Color Palette — Sage Garden

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-base` | `#F8F3EC` | Page background start |
| `--bg-warm` | `#F0E8DC` | Gradient mid-warm |
| `--bg-sage` | `#E2E8DF` | Gradient mid-sage |
| `--bg-sage-deep` | `#D4DDD0` | Gradient end |
| `--bg-card` | `rgba(255,255,255,0.45)` | Glass card background |
| `--bg-card-hover` | `rgba(255,255,255,0.65)` | Glass card hover |
| `--bg-card-border` | `rgba(255,255,255,0.6)` | Glass card border |
| `--bg-card-border-hover` | `rgba(79,132,72,0.2)` | Glass card border hover |
| `--text-primary` | `#1E2B1A` | Headings, names |
| `--text-secondary` | `#3D5235` | Secondary text |
| `--text-muted` | `#6B7F65` | Labels, descriptions |
| `--text-soft` | `#8B9E85` | Placeholders, hints |
| `--green-primary` | `#4F8448` | Primary accent, CTA |
| `--green-dark` | `#3D6A37` | Gradient end, hover |
| `--green-light` | `rgba(79,132,72,0.08)` | Subtle backgrounds |
| `--danger` | `#C4422B` | Error, inactive status |
| `--danger-light` | `rgba(196,66,43,0.08)` | Inactive background |

### Background Gradient

```css
background: linear-gradient(155deg, #F8F3EC 0%, #F0E8DC 25%, #E2E8DF 55%, #D4DDD0 100%);
```

### Decorative Blobs (CSS-only, static)

- Blob 1: top-right, `rgba(79,132,72,0.06)`, 450px radial gradient
- Blob 2: bottom-left, `rgba(180,160,100,0.04)`, 500px radial gradient

---

## 3. Typography — Hybrid Duo

| Role | Font | Weight | Size | Tracking |
|------|------|--------|------|----------|
| Page title | Erode (serif) | 700 | 42px | -0.03em |
| Wizard title | Erode (serif) | 700 | 28px | -0.02em |
| Card name | Erode (serif) | 600 | 16px | normal |
| Brand "Conecta" | Erode (serif) | 600 | 15px | -0.01em |
| Body text | Satoshi (sans) | 400-500 | 13-15px | normal |
| Labels | Satoshi (sans) | 600 | 10-11px | 1-1.5px uppercase |
| Counter | Satoshi (sans) | 500 | 14px | normal |
| Diagnosis | Satoshi (sans) | 400 | 12px | italic |

### Font Loading

```css
@import url('https://api.fontshare.com/v2/css?f[]=erode@400,500,600,700&f[]=satoshi@400,500,600,700&display=swap');
```

---

## 4. Navigation — Icon Sidebar

### Behavior

- Default: 64px width, icons only
- Hover: expands to 220px with labels (slide-in animation, 300ms ease-out)
- Active item: green-light background + green-primary text
- Badge: pill counter (appears on hover expand)
- Footer: avatar circle with initials + username on expand
- Mobile (<768px): sidebar hidden entirely

### Structure

```
[Logo C] ← 36px rounded square, green gradient
[Brand]  ← "Conecta", visible on hover

[≡ Familias] [9]  ← active
[+ Cadastro]
[■ Relatorios]
[⚙ Config]

--- spacer ---

[DF] Davi Franklin  ← footer
```

### CSS Key Properties

- `backdrop-filter: blur(20px)` on sidebar background
- `transition: width 300ms cubic-bezier(0.16, 1, 0.3, 1)`
- Labels: `opacity: 0 → 1`, `translateX(-8px) → 0` on parent hover

---

## 5. Cards — Glass Morphism

### Family Card (Home)

```css
background: rgba(255,255,255,0.45);
backdrop-filter: blur(16px);
border: 1px solid rgba(255,255,255,0.6);
border-radius: 16px;
padding: 18px 22px;
```

### Hover State

```css
background: rgba(255,255,255,0.65);
border-color: rgba(79,132,72,0.2);
transform: translateY(-2px);
box-shadow: 0 8px 32px rgba(79,132,72,0.06);
```

### Inactive Card Variant

- Text opacity reduced to 0.6
- Hover restores to 0.85

### Card Layout

```
[Index] [Name (Erode)]                    [Members]  [● Status]
        [Diagnosis (Satoshi italic)]
```

### Mobile (<768px)

- Members and status columns hidden
- Meta info shown below diagnosis via `data-meta` attribute
- Single column layout

---

## 6. Wizard (Registration)

### Structure

```
[← Voltar para Familias]          [Etapa X de 7]

[═══════ Progress Bar ═══════════════════════]
 ●       ◎       ○       ○       ○       ○       ○
Dados  Docs   Ender.  Acolh.  Fam.   Diag.   Prog.

╭──────────────── Glass Container ─────────────────╮
│  Title (Erode 28px)                              │
│  Subtitle (Satoshi 14px muted)                   │
│                                                  │
│  [Form fields in 2-column grid]                  │
│                                                  │
│  ─────────────────────────────────               │
│  [← Anterior]              [Proximo →]           │
╰──────────────────────────────────────────────────╯
```

### Progress Bar

- 3px height line, green gradient fill
- Dots below: completed (filled green + glow), current (white + green border + glow), pending (faint green)
- Step names below dots
- Mobile: dots hidden, "Etapa X de 7" text shown

### Wizard Container

- Glass morphism (same as cards but with 20px blur)
- Border-radius: 20px
- Padding: 40px 44px
- Entry animation: fadeIn + translateY(16px), 600ms

### Form Inputs

- Underline style (no border except bottom)
- Bottom border: `1.5px solid rgba(79,132,72,0.15)`
- Focus: border turns `var(--green-primary)`
- Filled: border opacity increases to 0.3
- Placeholder: italic, text-soft color

### Card Selectors (Sexo, Localizacao)

- Flex row of pill-like selectors
- Default: white-40% bg, faint green border
- Hover: white-60% bg, slightly more visible border
- Selected: green-light bg, green-primary border, green text, outer glow ring

### Buttons

- **Primary (Next):** green gradient pill, white text, shadow, hover lifts -1px
- **Secondary (Back):** transparent, green border outline, hover darkens border
- **Submit:** same as primary but with loading state ("Salvando...")

### Success Overlay

- Glass container, center-aligned
- Green gradient circle with checkmark SVG
- Title: "Cadastro realizado!" (Erode)
- Subtitle: description (Satoshi)
- Two pill buttons: "Novo cadastro" (secondary) + "Ver familias" (primary)
- Entry animation: scale 0.95→1, spring easing, 800ms

---

## 7. Animations & Micro-interactions

| Animation | Trigger | Duration | Easing |
|-----------|---------|----------|--------|
| Card staggered fade-in | Page load | 500ms + 60ms delay per item | ease-out |
| Wizard container fade-in | Step change | 600ms | ease-out |
| Success overlay | Submit complete | 800ms | spring |
| Sidebar expand | Hover | 300ms | ease-out |
| Sidebar labels slide-in | Hover | 300ms | ease-out |
| Button hover lift | Hover | 300ms | ease-out |
| Input focus border | Focus | 300ms | ease-out |
| Progress bar fill | Step change | 600ms | ease-out |
| Card hover elevation | Hover | 300ms | ease-out |

### Easing Curves

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Duration Scale

```css
--duration-fast: 150ms;   /* micro-interactions */
--duration-normal: 300ms; /* standard transitions */
--duration-slow: 500ms;   /* entrance animations */
```

---

## 8. Spacing & Radius

### Spacing (8px base)

| Token | Value |
|-------|-------|
| `--s1` | 4px |
| `--s2` | 8px |
| `--s3` | 12px |
| `--s4` | 16px |
| `--s5` | 24px |
| `--s6` | 32px |
| `--s7` | 40px |
| `--s8` | 48px |
| `--s9` | 64px |
| `--s10` | 80px |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--r-sm` | 8px | Sidebar items, small elements |
| `--r-md` | 12px | Card selectors, badges |
| `--r-lg` | 16px | Family cards |
| `--r-xl` | 20px | Wizard container |
| `--r-pill` | 100px | Buttons, search input |

---

## 9. Shadows

| Usage | Value |
|-------|-------|
| Card default | none (glass border handles depth) |
| Card hover | `0 8px 32px rgba(79,132,72,0.06)` |
| Wizard container | `0 8px 40px rgba(0,0,0,0.03)` |
| Button primary | `0 2px 12px rgba(79,132,72,0.2)` |
| Button primary hover | `0 4px 20px rgba(79,132,72,0.3)` |
| Success icon | `0 4px 20px rgba(79,132,72,0.25)` |

---

## 10. Semantic Status Colors

| Status | Dot | Text | Background (inactive row) |
|--------|-----|------|--------------------------|
| Ativo | `var(--green-primary)` | `var(--green-primary)` | none |
| Inativo | `var(--danger)` | `var(--danger)` | `rgba(196,66,43,0.04)` |

---

## 11. Files to Modify

### Prototypes (full rewrite)

- `prototype-home-redesign.html` — apply complete Sage Garden design
- `prototype-registration-redesign.html` — apply complete Sage Garden design

### Tokens (update)

- `src/client/styles/tokens.ts` — new color palette, typography, radius, shadows

### Business Logic Preserved

All form fields, steps, validations, masks, parentesco lookup, localStorage communication, draggable panels, and scenario switching remain intact. Only visual presentation changes.

---

## 12. Mockup References

- Home mockup: `.superpowers/brainstorm/*/content/05-home-fullmockup.html`
- Wizard mockup: `.superpowers/brainstorm/*/content/06-wizard-fullmockup.html`
