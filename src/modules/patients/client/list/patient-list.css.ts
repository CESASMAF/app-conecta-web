// Estilos da lista de pacientes — vanilla-extract token-only (ADR-0007). import RELATIVO ao tema.
import { style } from '@vanilla-extract/css'
import { vars } from '../../../../shared/ui/tokens/theme.css'

export const wrap = style({ display: 'flex', flexDirection: 'column', gap: vars.space.lg })

export const header = style({
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: vars.space.md,
  flexWrap: 'wrap',
})

export const title = style({ fontSize: vars.text.xxl, fontWeight: vars.weight.bold, letterSpacing: vars.tracking.tight })
export const count = style({ fontSize: vars.text.sm, color: vars.color.text.secondary })

export const headerActions = style({ display: 'flex', alignItems: 'center', gap: vars.space.md })

export const newBtn = style({
  display: 'inline-flex',
  alignItems: 'center',
  height: '40px',
  padding: `0 ${vars.space.lg}`,
  borderRadius: vars.radius.md,
  background: vars.color.brand.gradient, // gradiente da marca (CTA principal)
  color: vars.color.action.fg,
  fontSize: vars.text.sm,
  fontWeight: vars.weight.medium,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  selectors: { '&:focus-visible': { outline: `2px solid ${vars.color.focus}`, outlineOffset: '2px' } },
})

export const toolbar = style({ display: 'flex', gap: vars.space.md, flexWrap: 'wrap', alignItems: 'center' })

const control = {
  height: '40px',
  padding: `0 ${vars.space.md}`,
  borderRadius: vars.radius.md,
  border: `${vars.border.hairline} solid ${vars.color.border.default}`,
  background: vars.color.bg.elevated,
  color: vars.color.text.primary,
  fontFamily: vars.font.sans,
  fontSize: vars.text.base,
  selectors: { '&:focus-visible': { outline: `2px solid ${vars.color.focus}`, outlineOffset: '1px' } },
} as const

export const searchInput = style({ ...control, flex: 1, minWidth: '220px' })
export const select = style({ ...control, cursor: 'pointer' })

export const list = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.sm,
  listStyle: 'none',
  margin: 0,
  padding: 0,
})

export const row = style({
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  alignItems: 'center',
  gap: vars.space.md,
  padding: vars.space.md,
  borderRadius: vars.radius.lg,
  border: `${vars.border.hairline} solid ${vars.color.border.default}`,
  background: vars.color.bg.elevated,
  textDecoration: 'none',
  color: 'inherit',
  selectors: {
    '&:hover': { background: vars.color.bg.secondary },
    '&:focus-visible': { outline: `2px solid ${vars.color.focus}`, outlineOffset: '2px' },
  },
})

export const rowMain = style({ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 })
export const name = style({
  fontSize: vars.text.base,
  fontWeight: vars.weight.semibold,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
})
export const sub = style({ fontSize: vars.text.sm, color: vars.color.text.secondary })

export const badge = style({
  fontSize: vars.text.xs,
  fontWeight: vars.weight.medium,
  padding: `2px ${vars.space.sm}`,
  borderRadius: vars.radius.sm,
  background: vars.color.action.tint,
  color: vars.color.action.tintFg,
  whiteSpace: 'nowrap',
})

export const centered = style({
  padding: vars.space.xxl,
  textAlign: 'center',
  color: vars.color.text.secondary,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: vars.space.md,
})

export const skeleton = style({
  height: '66px',
  borderRadius: vars.radius.lg,
  background: vars.color.bg.secondary,
  border: `${vars.border.hairline} solid ${vars.color.border.default}`,
})

export const sentinel = style({ height: '1px', width: '100%' })

export const retryBtn = style({
  height: '36px',
  padding: `0 ${vars.space.lg}`,
  borderRadius: vars.radius.md,
  border: 'none',
  background: vars.color.action.primary,
  color: vars.color.action.fg,
  fontFamily: vars.font.sans,
  fontSize: vars.text.sm,
  fontWeight: vars.weight.semibold,
  cursor: 'pointer',
  selectors: { '&:hover': { background: vars.color.action.hover } },
})
