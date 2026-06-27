---
name: raros-web02-design
description: Use this skill to generate well-branded interfaces and assets for RAROS Boa Vista's web_02 platform (the unified social-care / people-context / analysis-bi app), either for production or throwaway prototypes/mocks. Contains essential design guidelines, OKLCH color tokens, Atkinson Hyperlegible typography, fonts, logos, and Material-3-flavoured React UI-kit components for prototyping. Accessibility-first (WCAG 2.2 AA) and LGPD/privacy-first.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Map of this design system
- `readme.md` — the design guide: product context, content/voice rules, visual foundations, iconography, and the full index. Read this first.
- `styles.css` — the single CSS entry point (links every token + the webfonts). Link this one file.
- `tokens/` — OKLCH colors, chart palette (Okabe–Ito), Atkinson Hyperlegible typography, 4px spacing, elevation, semantic aliases, base layer.
- `components/` — React primitives (`M3`-prefixed) in `forms/`, `feedback/`, `data-display/`, `navigation/`, `dataviz/`. Each has a `.jsx`, a `.d.ts` (props), a `.prompt.md` (what/when + usage), and a `*.card.html` specimen.
- `ui_kits/analysis-bi/` — interactive recreation of the Indicadores/BI product (shell → dashboards → export center).
- `guidelines/` — foundation specimen cards (Type, Colors, Spacing, Brand).
- `assets/` — RAROS logos + reference screenshot.

## Non-negotiables for this brand
- **Accessibility is the brand.** Atkinson Hyperlegible type, always-visible coral focus ring, keyboard parity, color is never the only channel.
- **Privacy is an invariant.** Aggregated data shows the suppression banner whenever `suppressed_groups > 0` (LGPD Art. 12, K-anonymity K=5). Never fabricate or fill suppressed cells. No individual drill-down.
- **Honesty over mocks.** Unimplemented = an honest empty state, never fake data.
- **Tokens only.** Reference the semantic CSS variables (`--color-*`, `--space-*`, `--text-*`); don't introduce raw hex/px. Coral is the single accent over warm-gray neutrals.
- **PT-BR, sentence case, neutral tone, no emoji.** Numbers/codes in mono with pt-BR `Intl` formatting.

## How to render components in HTML
Load React 18 + Babel, then `_ds_bundle.js`, then read components off the namespace:
`const { M3Button, M3KpiCard, AgePyramidChart } = window.RAROSWeb02DesignSystem_9e80fa;`
Load the Material Symbols Rounded webfont for icons. In production, self-host the Atkinson fonts (ADR-0008) instead of the Google Fonts CDN this DS links.
