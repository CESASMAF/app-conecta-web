// Estilos do painel de Indicadores — vanilla-extract token-only (ADR-0007). Mobile-first.
import { style } from '@vanilla-extract/css'
import { vars } from '../../../shared/ui/tokens/theme.css'

export const wrap = style({ display: 'flex', flexDirection: 'column', gap: vars.space.lg })
export const title = style({ fontSize: vars.text.xxl, fontWeight: vars.weight.bold, letterSpacing: vars.tracking.tight })

export const controls = style({ display: 'flex', gap: vars.space.md, flexWrap: 'wrap', alignItems: 'flex-end' })
export const field = style({ display: 'flex', flexDirection: 'column', gap: vars.space.xs })
export const label = style({ fontSize: vars.text.sm, fontWeight: vars.weight.medium, color: vars.color.text.primary })
const control = {
  height: '40px',
  padding: `0 ${vars.space.md}`,
  borderRadius: vars.radius.md,
  border: `${vars.border.hairline} solid ${vars.color.border.default}`,
  background: vars.color.bg.elevated,
  color: vars.color.text.primary,
  fontFamily: vars.font.sans,
  fontSize: vars.text.base,
} as const
export const input = style(control)
export const select = style({ ...control, cursor: 'pointer' })

export const applyBtn = style({
  height: '40px',
  padding: `0 ${vars.space.xl}`,
  borderRadius: vars.radius.md,
  border: 'none',
  background: vars.color.brand.gradient,
  color: vars.color.action.fg,
  fontFamily: vars.font.sans,
  fontSize: vars.text.sm,
  fontWeight: vars.weight.semibold,
  cursor: 'pointer',
})

export const muted = style({ color: vars.color.text.secondary, fontSize: vars.text.sm })
export const fieldError = style({ fontSize: vars.text.xs, color: vars.color.danger, fontWeight: vars.weight.medium })
export const errorBanner = style({
  padding: vars.space.md,
  borderRadius: vars.radius.md,
  background: vars.color.dangerBg,
  border: `${vars.border.hairline} solid ${vars.color.dangerBorder}`,
  color: vars.color.danger,
  fontSize: vars.text.sm,
})

export const kanon = style({
  padding: vars.space.md,
  borderRadius: vars.radius.md,
  background: vars.color.bg.secondary,
  border: `${vars.border.hairline} solid ${vars.color.border.default}`,
  color: vars.color.text.secondary,
  fontSize: vars.text.sm,
})

export const tableWrap = style({ overflowX: 'auto' })
export const table = style({ width: '100%', borderCollapse: 'collapse', fontSize: vars.text.sm })
export const th = style({
  textAlign: 'left',
  padding: vars.space.sm,
  borderBottom: `${vars.border.strong} solid ${vars.color.border.default}`,
  color: vars.color.text.secondary,
  fontWeight: vars.weight.semibold,
  whiteSpace: 'nowrap',
})
export const td = style({ padding: vars.space.sm, borderBottom: `${vars.border.hairline} solid ${vars.color.border.default}` })
export const num = style({ textAlign: 'right', fontVariantNumeric: 'tabular-nums' })
