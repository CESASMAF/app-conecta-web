// Estilos do painel de Indicadores (BI) — vanilla-extract token-only (ADR-0007). Mobile-first.
// Restyle visual RORAIMA_DESIGN / Modo Enxuto: superfícies chapadas (hairline antes de sombra),
// cor só onde há significado. Reutiliza o kit compartilhado por composição.
import { style, globalStyle } from '@vanilla-extract/css'
import { vars } from '../../../shared/ui/tokens/theme.css'
import * as kit from '../../../shared/ui/kit.css'

export const wrap = style({ display: 'flex', flexDirection: 'column', gap: vars.space.lg })
export const title = style({
  fontSize: vars.text.xxl,
  fontWeight: vars.weight.bold,
  color: vars.color.text.primary,
  letterSpacing: vars.tracking.tight,
})

// ---------------------------------------------------------------- Barra de filtros (card chapado)
export const controls = style([
  kit.panel,
  {
    display: 'flex',
    gap: vars.space.md,
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    padding: vars.space.lg,
  },
])
export const field = style({ display: 'flex', flexDirection: 'column', gap: vars.space.xs })
export const label = style({ fontSize: vars.text.sm, fontWeight: vars.weight.medium, color: vars.color.text.body })

const control = {
  height: '40px',
  padding: `0 ${vars.space.md}`,
  borderRadius: vars.radius.md,
  border: `${vars.border.hairline} solid ${vars.color.border.default}`,
  background: vars.color.bg.elevated,
  color: vars.color.text.primary,
  fontFamily: vars.font.sans,
  fontSize: vars.text.base,
  transition: `border-color ${vars.motion.fast} ${vars.motion.ease}, box-shadow ${vars.motion.fast} ${vars.motion.ease}`,
  selectors: {
    '&:hover': { borderColor: vars.color.border.strong },
    '&:focus-visible': {
      outline: `${vars.focusRing.width} solid ${vars.color.focus}`,
      outlineOffset: vars.focusRing.offset,
      borderColor: vars.color.border.active,
    },
  },
} as const
export const input = style(control)
export const select = style([control, { cursor: 'pointer' }])

// CTA principal — gradiente da marca (reaproveita o botão do kit + realce sutil no hover).
export const applyBtn = style([
  kit.btn.gradient,
  { selectors: { '&:hover:not(:disabled)': { boxShadow: vars.shadow.sm } } },
])

// ---------------------------------------------------------------- Estados (loading / vazio / erro)
export const muted = style({ color: vars.color.text.secondary, fontSize: vars.text.sm })
export const empty = style({
  padding: vars.space.xl,
  textAlign: 'center',
  color: vars.color.text.secondary,
  fontSize: vars.text.sm,
})
export const fieldError = style({ fontSize: vars.text.xs, color: vars.color.danger, fontWeight: vars.weight.medium })
export const errorBanner = style({
  padding: `${vars.space.md} ${vars.space.lg}`,
  borderRadius: vars.radius.md,
  background: vars.color.dangerBg,
  border: `${vars.border.hairline} solid ${vars.color.dangerBorder}`,
  color: vars.color.danger,
  fontSize: vars.text.sm,
  fontWeight: vars.weight.medium,
})

// ---------------------------------------------------------------- Nota de k-anonimato (callout discreto)
export const kanon = style({
  display: 'flex',
  gap: vars.space.sm,
  alignItems: 'baseline',
  padding: `${vars.space.sm} ${vars.space.md}`,
  borderRadius: vars.radius.md,
  background: vars.color.bg.sunken,
  border: `${vars.border.hairline} solid ${vars.color.border.soft}`,
  borderLeft: `${vars.border.strong} solid ${vars.color.action.primary}`,
  color: vars.color.text.secondary,
  fontSize: vars.text.sm,
  lineHeight: vars.leading.snug,
})
globalStyle(`${kanon} strong`, { color: vars.color.action.primary, fontWeight: vars.weight.semibold })

// ---------------------------------------------------------------- Tabela (dentro de painel chapado)
export const resultPanel = style([kit.panel, { overflow: 'hidden' }])
export const tableWrap = style({ overflowX: 'auto' })
export const table = style({
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: vars.text.sm,
})
globalStyle(`${table} tbody tr`, { transition: `background-color ${vars.motion.fast} ${vars.motion.ease}` })
globalStyle(`${table} tbody tr:hover`, { background: vars.color.bg.secondary })
globalStyle(`${table} tbody tr:last-child td`, { borderBottom: 'none' })
export const th = style({
  textAlign: 'left',
  padding: `${vars.space.sm} ${vars.space.md}`,
  background: vars.color.bg.sunken,
  borderBottom: `${vars.border.hairline} solid ${vars.color.border.default}`,
  color: vars.color.text.secondary,
  fontSize: vars.text.xs,
  fontWeight: vars.weight.semibold,
  letterSpacing: vars.tracking.wide,
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
})
export const td = style({
  padding: `${vars.space.sm} ${vars.space.md}`,
  borderBottom: `${vars.border.hairline} solid ${vars.color.border.soft}`,
  color: vars.color.text.body,
  verticalAlign: 'top',
})
export const num = style({ textAlign: 'right', fontVariantNumeric: 'tabular-nums' })

// Célula de valor: número (mono/tabular) + barra horizontal (track sunken + fill primary).
export const valueCell = style({ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: vars.space.xs })
export const valueNum = style({
  fontFamily: vars.font.mono,
  fontWeight: vars.weight.semibold,
  color: vars.color.text.primary,
  fontVariantNumeric: 'tabular-nums',
})
export const hbarTrack = style([kit.progress, { width: '100%', minWidth: '48px', height: '6px' }])
export const hbarFill = style({
  display: 'block',
  height: '100%',
  borderRadius: vars.radius.full,
  background: vars.color.action.primary,
})
