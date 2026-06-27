// Estilos da área de Pessoas — vanilla-extract token-only (ADR-0007). Mobile-first.
import { style } from '@vanilla-extract/css'
import { vars } from '../../../shared/ui/tokens/theme.css'

export const wrap = style({ display: 'flex', flexDirection: 'column', gap: vars.space.lg, maxWidth: '720px' })
export const header = style({ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: vars.space.md, flexWrap: 'wrap' })
export const title = style({ fontSize: vars.text.xxl, fontWeight: vars.weight.bold, letterSpacing: vars.tracking.tight })
export const count = style({ fontSize: vars.text.sm, color: vars.color.text.secondary })
export const headerActions = style({ display: 'flex', alignItems: 'center', gap: vars.space.md })

export const back = style({
  fontSize: vars.text.sm,
  fontWeight: vars.weight.medium,
  color: vars.color.action.primary,
  textDecoration: 'none',
  alignSelf: 'flex-start',
  selectors: { '&:focus-visible': { outline: `2px solid ${vars.color.focus}`, outlineOffset: '2px' } },
})

export const newBtn = style({
  display: 'inline-flex',
  alignItems: 'center',
  height: '40px',
  padding: `0 ${vars.space.lg}`,
  borderRadius: vars.radius.md,
  background: vars.color.brand.gradient,
  color: vars.color.action.fg,
  fontSize: vars.text.sm,
  fontWeight: vars.weight.medium,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  selectors: { '&:focus-visible': { outline: `2px solid ${vars.color.focus}`, outlineOffset: '2px' } },
})

export const searchInput = style({
  height: '40px',
  padding: `0 ${vars.space.md}`,
  borderRadius: vars.radius.md,
  border: `${vars.border.hairline} solid ${vars.color.border.default}`,
  background: vars.color.bg.elevated,
  color: vars.color.text.primary,
  fontFamily: vars.font.sans,
  fontSize: vars.text.base,
  width: '100%',
  selectors: { '&:focus-visible': { outline: `2px solid ${vars.color.focus}`, outlineOffset: '1px' } },
})

export const list = style({ display: 'flex', flexDirection: 'column', gap: vars.space.sm, listStyle: 'none', margin: 0, padding: 0 })
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
export const name = style({ fontSize: vars.text.base, fontWeight: vars.weight.semibold })
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
export const badgeOff = style([badge, { background: vars.color.bg.secondary, color: vars.color.text.secondary }])

export const muted = style({ color: vars.color.text.secondary, fontSize: vars.text.sm })
export const sentinel = style({ height: '1px', width: '100%' })

export const loadMoreBtn = style({
  height: '40px',
  padding: `0 ${vars.space.lg}`,
  borderRadius: vars.radius.md,
  border: `${vars.border.hairline} solid ${vars.color.border.default}`,
  background: vars.color.bg.elevated,
  color: vars.color.action.primary,
  fontFamily: vars.font.sans,
  fontSize: vars.text.sm,
  fontWeight: vars.weight.semibold,
  cursor: 'pointer',
  alignSelf: 'center',
})

// --- detalhe + forms ---
export const detailHeader = style({ display: 'flex', alignItems: 'center', gap: vars.space.md, flexWrap: 'wrap' })
export const sectionTitle = style({ fontSize: vars.text.sm, fontWeight: vars.weight.bold, textTransform: 'uppercase', color: vars.color.text.secondary, marginTop: vars.space.lg })
export const sectionHead = style({ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: vars.space.md, marginTop: vars.space.lg })

export const form = style({ display: 'flex', flexDirection: 'column', gap: vars.space.lg })
export const panel = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.md,
  padding: vars.space.lg,
  borderRadius: vars.radius.md,
  border: `${vars.border.hairline} solid ${vars.color.border.default}`,
  background: vars.color.bg.secondary,
  marginTop: vars.space.sm,
})
export const actions = style({ display: 'flex', justifyContent: 'flex-end', gap: vars.space.sm, marginTop: vars.space.sm })
export const rowActions = style({ display: 'flex', gap: vars.space.md, flexWrap: 'wrap' })

const btnBase = {
  height: '40px',
  padding: `0 ${vars.space.lg}`,
  borderRadius: vars.radius.md,
  fontFamily: vars.font.sans,
  fontSize: vars.text.sm,
  fontWeight: vars.weight.semibold,
  cursor: 'pointer',
  border: 'none',
  selectors: {
    '&:focus-visible': { outline: `2px solid ${vars.color.focus}`, outlineOffset: '2px' },
    '&:disabled': { opacity: 0.6, cursor: 'progress' },
  },
} as const
export const btnPrimary = style([btnBase, { background: vars.color.brand.gradient, color: vars.color.action.fg }])
export const btnGhost = style([btnBase, { background: 'transparent', color: vars.color.action.primary, border: `${vars.border.hairline} solid ${vars.color.border.default}` }])

export const linkBtn = style({
  appearance: 'none',
  background: 'none',
  border: 'none',
  padding: 0,
  fontSize: vars.text.sm,
  fontWeight: vars.weight.medium,
  color: vars.color.action.primary,
  cursor: 'pointer',
  selectors: { '&:disabled': { opacity: 0.5, cursor: 'progress' }, '&:focus-visible': { outline: `2px solid ${vars.color.focus}`, outlineOffset: '2px' } },
})
export const roleRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space.md,
  padding: `${vars.space.sm} 0`,
  borderBottom: `${vars.border.hairline} solid ${vars.color.border.default}`,
})

export const errorBanner = style({
  padding: vars.space.md,
  borderRadius: vars.radius.md,
  background: vars.color.dangerBg,
  border: `${vars.border.hairline} solid ${vars.color.dangerBorder}`,
  color: vars.color.danger,
  fontSize: vars.text.sm,
})
export const warnBanner = style({
  padding: vars.space.md,
  borderRadius: vars.radius.md,
  background: vars.color.bg.secondary,
  border: `${vars.border.hairline} solid ${vars.color.border.strong}`,
  color: vars.color.text.primary,
  fontSize: vars.text.sm,
})
export const fieldError = style({ fontSize: vars.text.xs, color: vars.color.danger, fontWeight: vars.weight.medium })
