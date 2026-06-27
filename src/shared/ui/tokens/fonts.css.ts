// @font-face self-hosted (ADR-0008) — Atkinson Hyperlegible Next/Mono, VARIABLE, subset latin (PT-BR).
// Os .woff2 vivem em public/fonts/ (servidos same-origin; aquisição reprodutível via `bun run fonts:fetch`
// — scripts/fetch-fonts.ts, origem + SHA-256 fixados). Sem CDN externa (LGPD/CSP), zero dep npm de fonte.
//
// Os nomes de família batem EXATAMENTE com os tokens vars.font.{sans,mono} em ./theme.css.ts.
// font-display: swap → sem FOUC bloqueante; cai no fallback de sistema até a fonte carregar.
// font-weight como range (variable) → 400/500/600/700 dos tokens saem do mesmo arquivo.
import { globalFontFace } from '@vanilla-extract/css'

export const sansFamily = 'Atkinson Hyperlegible Next'
export const monoFamily = 'Atkinson Hyperlegible Mono'

globalFontFace(sansFamily, {
  src: 'url("/fonts/atkinson-hyperlegible-next-latin-wght-normal.woff2") format("woff2")',
  fontWeight: '200 800',
  fontStyle: 'normal',
  fontDisplay: 'swap',
})

globalFontFace(monoFamily, {
  src: 'url("/fonts/atkinson-hyperlegible-mono-latin-wght-normal.woff2") format("woff2")',
  fontWeight: '200 800',
  fontStyle: 'normal',
  fontDisplay: 'swap',
})
