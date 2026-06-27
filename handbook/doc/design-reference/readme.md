# RAROS · web_02 — Design System

> The design system for **`web_02`**, the unified web platform of **RAROS Boa Vista**
> (Centro de Assistência Multiprofissional em Doenças Raras de Boa Vista — the ACDG
> ecosystem). One app, three domains: **social-care** (prontuário / case record),
> **people-context** (identity), and **analysis-bi** (aggregated, anonymised
> indicators). This repository is the visual + component source of truth that the
> three modules share.
>
> **Locale:** UI copy is **PT-BR**; code identifiers (tokens, component names,
> props) are **EN**. **Dated:** 2026-06-12.

---

## 1. What this is / product context

RAROS Boa Vista supports families affected by rare diseases in Boa Vista, Roraima.
`web_02` is the staff-facing administrative platform — **not** the public marketing
site. It is a calm, dense, accessibility-first application built around three ideas
the whole brand turns on:

1. **Hyperlegibility is a product value.** The platform serves and is operated by
   people for whom reading clarity matters. The typeface (Atkinson Hyperlegible,
   from the Braille Institute) and the WCAG 2.2 AA focus discipline are not stylistic
   — they are the brand.
2. **Privacy is an invariant, not a setting.** `analysis-bi` only ever shows
   K-anonymous aggregates (K=5). The suppression banner is a compliance requirement
   (LGPD Art. 12), and components are forbidden from hiding it.
3. **One coherent product over three backends.** A single shell, a single session,
   a single design system. The user never sees the three-service topology.

The platform's six constitutional principles (referenced throughout the source docs):
**I — Iron Frontier** (the BFF is the only border), **II — Errors as Values**,
**III — MVVM** (dumb views), **IV — Bun-Native** (zero-npm, tokens-only),
**V — TypeBox/Eden** (typed contract), **VI — Honesty** (no mocks; `not-implemented`
as a value, never fabricated data).

### Sources given (store even if the reader lacks access)
- **`uploads/README.md`** — integration hub: how 3 backends become one app.
- **`uploads/design-*.fe.md`** — the Atomic-Design catalog for the `003-analysis-bi-web`
  feature (tokens → atoms → molecules → organisms → templates → pages → governance).
  These describe a design system built in **vanilla-extract** (`src/styles/tokens.css.ts`
  + `contract.css.ts`), engine origin for the CSS variables reproduced here.
- **`uploads/spec.fe.md`, `metrics.fe.md`, `plan.fe.md`** — the analysis-bi web feature
  spec, NFRs and plan.
- **`uploads/constitution.md`, `adr.*.md`** — governance (ADR-0001 vertical-modular,
  ADR-0005 OIDC/Authentik, ADR-0007 vanilla-extract tokens, ADR-0008 self-host fonts,
  ADR-0009 framework-agnostic MVVM, ADR-0010 BFF orchestration).
- **Figma (referenced in governance):** `bHV9kAG2pIWMnEjOQIUCOE` — not accessible to
  this build; reproduced from the written specs + the one product screenshot.
- **Assets:** `assets/logo-raros.webp` (wordmark), `assets/logo-raros-mark.webp`,
  `assets/reference-public-site.png` (the *public* marketing site — palette differs
  from this admin platform; kept for brand reference only).

> **Frontend stack (for context, not reproduced here):** SolidStart + a single Elysia
> BFF on Bun; styling via vanilla-extract (CSS-in-TS, zero-runtime). This DS ports the
> token contract to plain CSS custom properties and rebuilds the components in React so
> design agents can compose them in HTML.

---

## 2. Content fundamentals — how copy is written

- **Language & person.** PT-BR throughout. Addresses the user implicitly /
  impersonally — instructions and empty states are phrased as outcomes, not commands
  with "você". E.g. *"Sem dados no período selecionado"*, *"Aguarde alguns segundos e
  tente de novo"*. Microcopy is plain, calm, and never cute.
- **Tone.** Institutional but humane. This is social-assistance software touching
  vulnerable data; copy is **neutral and non-celebratory** — an empty protection
  dashboard reads *"nenhum encaminhamento no período"*, never "🎉 tudo certo!".
- **Casing.** Sentence case for everything (titles, buttons, labels). Eyebrows /
  overlines are the only UPPERCASE, with letter-spacing. No Title Case.
- **Numbers & units.** Always pt-BR formatted via `Intl` — `1.247 registros`,
  `R$ 1.412,00`, `72%`, periods as `mar/2025` · `T1 2025` · `2025`. Values and codes
  (`E75.2`, IBGE codes) render in **mono**.
- **Privacy vocabulary is fixed** (DPO-reviewed): *"supressão por privacidade"*,
  *"K-anonimato (K=5)"*, *"grupos com menos de 5 pessoas foram omitidos para proteger
  a privacidade"*. Never softened, never hidden.
- **Errors are actionable, never raw.** No HTTP status codes shown; every error maps
  to a PT-BR message that names the fix (`400` → *"use o formato AAAA-MM"*).
- **Emoji:** never. **Icons:** Material Symbols, used sparingly and always with a text
  label (color/icon is never the only channel).
- **Examples of voice:**
  - Button: *"Aplicar filtros"*, *"Exportar"*, *"Ver como tabela"*, *"Tentar de novo"*.
  - Suppression: *"3 grupos com menos de 5 pessoas foram omitidos para proteger a
    privacidade."*
  - Empty (privacy): *"Sem dados exibíveis — 3 grupos foram suprimidos por privacidade
    (K=5)."*

---

## 3. Visual foundations

- **Color vibe.** Warm and quiet. A single confident accent — **coral**
  (`--coral-500` = `oklch(62% 0.21 25)`) — for primary action and active/focus states,
  over a **warm-gray** neutral field (hue ~70). No second brand color; semaphores
  (success/warning/danger/info) appear only to carry meaning. The mood is a trustworthy
  public-service tool, not a SaaS dashboard.
- **Backgrounds.** Flat warm-gray (`--color-bg-primary`) with white elevated cards.
  **No gradients, no photographic hero, no texture, no blur** inside the app — those
  belong to the public marketing site, not the platform. Surfaces are honest fills.
- **Typography.** Atkinson Hyperlegible Next for UI; Atkinson Hyperlegible Mono for
  numerals, codes and tables (equal-width → scannable). Big KPI numerals in mono
  (`--text-3xl/4xl`). Tight tracking on headings, generous line-height on body.
- **Spacing & layout.** 4px base grid. Fixed left nav rail (72px) + sticky top app bar
  (64px) + content capped at 1200px with 24px gutters. Dashboards use a sticky filter
  header governing everything below; chart cards have **fixed heights** by type
  (pyramid 480 / bars 360 / series 320) so skeletons don't shift layout (CLS budget).
- **Corner radii.** Calm and rounded: inputs `--radius-md` (12px), cards `--radius-lg`
  (16px), chips/pills/FAB `--radius-full`. Nothing sharp.
- **Cards.** White fill, 1px `--color-border-default`, `--radius-lg`, and a soft warm
  `--shadow-sm`. Elevation is low — this is a reading surface. No colored left-border
  accent cards.
- **Borders.** Hairline 1px default, 1.5–2px for strong/active. Active = coral.
- **Shadows.** Warm-gray-tinted, low and soft (`--shadow-xs…lg`). Used for elevation
  (menus, tooltips, dialogs), never decoration.
- **Hover / press.** M3 **state layers**: a translucent overlay at hover `0.08`,
  focus `0.12`, pressed `0.16` — not opacity changes on the element itself. Filled
  buttons darken coral (`500 → 600 → 700`). Chips/rows tint on hover.
- **Focus.** Always visible: 2px coral ring, 1px offset. Keyboard parity is mandatory
  — every interactive bar/point in a chart is focusable.
- **Transparency / blur.** Effectively none in-app, except the suppression banner's
  10% info tint. No glassmorphism.
- **Animation.** Minimal and calm — short (120–320ms), standard easing
  (`cubic-bezier(0.2,0,0,1)`), fades and small moves only. No bounce, no infinite
  loops. `prefers-reduced-motion` disables motion but never the data.
- **Dark mode.** Partial (v1): neutrals invert; coral and chart palettes stay
  calibrated against light. Charts are out of scope for dark in v1.
- **Dataviz.** Own SVG charts on Okabe–Ito categorical tokens (colorblind-safe).
  Every chart ships a data-table alternative, a textual summary, keyboard nav, and a
  legend — **color is never the only channel**.

---

## 4. Iconography

- **System:** **Material Symbols Rounded** (Google), weight 400, optical size 24,
  fill 0 by default — it pairs naturally with the M3 component grammar and Atkinson's
  rounded humanist forms. Linked from the Google CDN in cards/kits (see any
  `*.card.html` head). In production these are self-hosted with the fonts (ADR-0008).
  - *Substitution flag:* the written specs don't name an icon set; Material Symbols
    Rounded is this DS's choice to match the M3 components. Swap freely if the team
    standardises on another — the components take an `icon` slot, not a hard-coded set.
- **Usage rules:** icons are **supportive, never sole meaning** — always beside a text
  label (a11y + the "color/icon never the only channel" rule). 24px default;
  decorative icons get `aria-hidden`. No filled/duotone icons in-app. No emoji. No
  hand-drawn SVG.
- **Brand marks:** `assets/logo-raros.webp` (heart wordmark, "RAROS BOA VISTA") and
  `assets/logo-raros-mark.webp`. The public marketing site (`reference-public-site.png`)
  uses a purple/indigo + blue palette and photography — that is a **separate surface**;
  do not import its palette into the platform.

---

## 5. Index / manifest

**Foundations (root)**
- `styles.css` — the single entry point consumers link (`@import` lines only).
- `tokens/` — `fonts.css`, `colors.css`, `charts.css`, `typography.css`,
  `spacing.css`, `elevation.css`, `semantic.css`, `status.css`, `base.css`.
- `guidelines/` — foundation specimen cards (Type, Colors, Spacing, Brand).

**Components** (`components/<group>/`) — 33 React primitives, `M3`-prefixed where they
map to the platform's M3 catalog. Each has `<Name>.jsx`, `<Name>.d.ts`,
`<Name>.prompt.md` and a `*.card.html`. Namespace: `window.RAROSWeb02DesignSystem_9e80fa`.
- `components/forms/` — `M3Button`, `M3TextField`, `M3DropdownField`, `M3ChoiceChip`, `M3Switch`, `M3PasswordField`, `M3MaskedField`, `M3SearchBar`.
- `components/feedback/` — `M3Badge`, `SuppressionBanner`, `M3EmptyState`, `M3ActiveBadge`, `M3LoginIndicator`, `M3RoleBadge`, `IdpRetryBanner`, `M3StatusChip`, `M3RiskChip`, `M3Dialog`, `LgpdAnonymizedBanner`.
- `components/data-display/` — `M3Card`, `M3KpiCard`, `M3KpiValue`, `M3PeriodLabel`, `M3SectionHeader`, `M3DataField`, `M3StatCard`, `M3Avatar`, `M3TimelineItem`.
- `components/navigation/` — `M3TopAppBar`, `M3NavRail`.
- `components/dataviz/` — `M3SeriesLegendItem`, `AgePyramidChart`, `TopNBarChart`.

The social-care atoms (`M3StatusChip`, `M3RiskChip`, `M3StatCard`, `M3Avatar`,
`M3TimelineItem`, `M3MaskedField`, `M3SearchBar`, `M3Dialog`, `LgpdAnonymizedBanner`)
read their status/risk/flow/LGPD colours from `tokens/status.css`
(`--color-status-*`, `--color-risk-*`, `--color-flow-*`, `--color-banner-lgpd-*`).

The People-context atoms (`M3ActiveBadge`, `M3LoginIndicator`, `M3RoleBadge`),
`M3PasswordField` and `IdpRetryBanner` are global candidates introduced by the
`people-context` feature; their domain colours live in `tokens/semantic.css`
(`--color-person-*`, `--color-idp-*`).

**UI kits** (`ui_kits/<product>/`) — interactive recreations of real product views.
- `ui_kits/analysis-bi/` — indicators home, demographic dashboard (age pyramid), and
  the 8-format export center, inside the authenticated shell.
- `ui_kits/people-context/` — the People registry: list/search (`/people`), new-person
  form with optional login provisioning (207 retry), and the record's three tabs —
  Perfil, Vínculos (scoped-admin role management), Acesso (IdP provisioning, password
  reset, deactivate, LGPD erasure with typed double-confirmation).
- `ui_kits/social-care/` — the patient case-record: list/search with status & risk
  chips (`/patients`), the prontuário (computed-analytics stat grid, family
  composition, audit timeline), and the discharge lifecycle dialog.

**Templates** (`templates/<slug>/`) — copy-and-edit starting pages for consuming
projects. Each loads the system via a one-line `ds-base.js`.
- `templates/dashboard-page/` — an indicator dashboard page: shell + sticky filter
  bar + KPI strip + a ranking chart card, ready to wire to real data.

**Skill**
- `SKILL.md` — Agent-Skills-compatible entry so this DS can be used in Claude Code.

> **Production note (font self-hosting):** this DS links Atkinson Hyperlegible from
> Google Fonts for portability. ADR-0008 requires self-hosted `.woff2` before go-live
> (LGPD — zero IP to third parties). Swap `tokens/fonts.css` to local `@font-face`.
