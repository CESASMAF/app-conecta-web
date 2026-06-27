# UI Kit — Analysis BI (`web_02`)

Interactive recreation of the **Indicadores e BI** product: the aggregated,
anonymised dashboards of the RAROS Boa Vista platform. It runs inside the shared
authenticated shell (nav rail + top app bar) and demonstrates the real flow:

**Indicators home** (5 axis KPI cards + export shortcut) → **Demographic
dashboard** (sticky filter panel → suppression banner → KPI strip → age pyramid
with "Ver como tabela" → mesoregion breakdown) → **Export center** (5 datasets ×
8 formats, sticky summary with the predicted filename, download toast).

## Files
- `index.html` — entry. Loads React + Babel + `_ds_bundle.js`, then `fixtures.js`
  and `screens.jsx`, and mounts `window.KitApp.App`.
- `screens.jsx` — all screens, composing the design-system primitives (it never
  re-implements a Button/Card/chart). Reads `window.RAROSWeb02DesignSystem_9e80fa`.
- `fixtures.js` — synthetic **aggregate** data only (`window.KitData`). Every cell
  is ≥ 5 except where the demo intentionally shows K=5 suppression. No PII, ever.

## What it shows (and what it doesn't)
- ✅ The demographic axis end-to-end + the export center, faithfully.
- ✅ The privacy invariant: `SuppressionBanner` is always present when groups are
  suppressed; charts always offer a data-table alternative.
- ⬜ The other four axes (epidemiological, socioeconomic, protection, care) reuse
  the same components; they're left as honest "em construção nesta demonstração"
  placeholders rather than faked (Principle VI — no mocks).
- ⬜ Prontuário (social-care) and Pessoas (people-context) modules are out of
  scope here — they share this shell and design system but aren't recreated.

## Source of truth
Built from the written specs (`uploads/spec.fe.md`, `design-*.fe.md`,
`design-pages.fe.md`, `design-templates.fe.md`). The original Figma
(`bHV9kAG2pIWMnEjOQIUCOE`) was not accessible to this build.
