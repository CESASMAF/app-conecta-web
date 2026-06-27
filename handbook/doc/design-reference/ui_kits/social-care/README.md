# UI Kit — Social Care (`web_02`)

Interactive recreation of the **Atendimento socioassistencial** product — the
patient case-record (prontuário) that is the foundation of the RAROS platform.

Flow: **Patient list** (search + status filter + masked CPF + status/risk chips)
→ **Prontuário** (record header with status + discharge action, the
`computedAnalytics` stat grid, and tabs: **Cadastro** = personal data + family
composition; **Avaliação** = an independently-savable assessment section;
**Histórico** = the audit timeline with before→after diffs) → **discharge dialog**
(reason + notes, confirm disabled until valid).

## Files
- `index.html` — entry. Loads React + Babel + `_ds_bundle.js`, then `fixtures.js`
  and `screens.jsx`; mounts `window.ScApp.App`.
- `screens.jsx` — all screens, composing the design-system primitives
  (`M3StatusChip`, `M3RiskChip`, `M3StatCard`, `M3MaskedField`, `M3Dialog`,
  `M3TimelineItem`, `M3Avatar`, …). Reads `window.RAROSWeb02DesignSystem_9e80fa`.
- `fixtures.js` — synthetic illustrative data (`window.ScData`). No real PII.

## What it shows (and what it doesn't)
- ✅ Patient list, the prontuário (analytics + family + audit), one assessment
  section, and the lifecycle (discharge) dialog — faithfully.
- ✅ Domain rules surfaced: masked PT-BR documents, the "Pessoa de referência"
  invariant, computed-analytics risk tones, an LGPD-anonymized row in the list.
- ⬜ The remaining 6 assessment sections, care/protection tabs, family add/remove
  wizard, and lookup admin reuse the same primitives — left out for brevity, not
  faked.

## Source of truth
Built from the social-care specs (`social-care/spec.fe.md`,
`design-pages.fe.md`, `design-organisms.fe.md`, `design-tokens.fe.md`). The
original Figma was not accessible to this build.
