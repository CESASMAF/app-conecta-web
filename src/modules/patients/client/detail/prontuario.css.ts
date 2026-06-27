// Estilos do prontuário (abas) — vanilla-extract token-only (ADR-0007). Cores da marca via tokens.
import { style } from '@vanilla-extract/css'
import { vars } from '../../../../shared/ui/tokens/theme.css'

export const wrap = style({ display: 'flex', flexDirection: 'column', gap: vars.space.lg })

export const back = style({
  fontSize: vars.text.sm,
  fontWeight: vars.weight.medium,
  color: vars.color.action.primary,
  textDecoration: 'none',
  alignSelf: 'flex-start',
  selectors: { '&:focus-visible': { outline: `2px solid ${vars.color.focus}`, outlineOffset: '2px' } },
})

export const header = style({ display: 'flex', alignItems: 'center', gap: vars.space.md, flexWrap: 'wrap' })
export const title = style({ fontSize: vars.text.xxl, fontWeight: vars.weight.bold, letterSpacing: vars.tracking.tight })

export const badge = style({
  fontSize: vars.text.xs,
  fontWeight: vars.weight.medium,
  padding: `2px ${vars.space.sm}`,
  borderRadius: vars.radius.sm,
  background: vars.color.action.tint,
  color: vars.color.action.tintFg,
})

export const tabs = style({
  display: 'flex',
  gap: vars.space.xs,
  borderBottom: `${vars.border.hairline} solid ${vars.color.border.default}`,
  overflowX: 'auto',
})

const tabBase = {
  appearance: 'none',
  background: 'none',
  border: 'none',
  padding: `${vars.space.sm} ${vars.space.md}`,
  fontSize: vars.text.sm,
  fontWeight: vars.weight.medium,
  color: vars.color.text.secondary,
  cursor: 'pointer',
  borderBottom: `${vars.border.strong} solid transparent`,
  whiteSpace: 'nowrap',
} as const

export const tab = style(tabBase)
export const tabActive = style([tabBase, { color: vars.color.action.primary, borderBottomColor: vars.color.action.primary }])

export const panel = style({ paddingTop: vars.space.md, display: 'flex', flexDirection: 'column', gap: vars.space.sm })

export const sectionTitle = style({
  fontSize: vars.text.sm,
  fontWeight: vars.weight.bold,
  textTransform: 'uppercase',
  color: vars.color.text.secondary,
  marginTop: vars.space.lg,
})

export const muted = style({ color: vars.color.text.secondary, fontSize: vars.text.sm })

export const familyList = style({
  listStyle: 'none',
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.xs,
  margin: 0,
  padding: 0,
})

export const star = style({ color: vars.color.action.primary, fontWeight: vars.weight.bold })

export const soon = style({
  color: vars.color.text.secondary,
  fontSize: vars.text.sm,
  padding: vars.space.xl,
  textAlign: 'center',
})

export const card = style({
  padding: vars.space.xl,
  borderRadius: vars.radius.lg,
  border: `${vars.border.hairline} solid ${vars.color.border.default}`,
  background: vars.color.bg.elevated,
  color: vars.color.text.secondary,
})

// --- Ações do Resumo (US3) ---
export const lifecycle = style({ display: 'flex', flexWrap: 'wrap', gap: vars.space.sm, alignItems: 'flex-start' })

const btn = {
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
export const actionBtn = style([btn, { background: vars.color.brand.gradient, color: vars.color.action.fg }])
export const ghostBtn = style([
  btn,
  { background: 'transparent', color: vars.color.action.primary, border: `${vars.border.hairline} solid ${vars.color.border.default}` },
])

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
export const dangerLink = style([linkBtn, { color: vars.color.danger }])

export const editPanel = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.md,
  padding: vars.space.lg,
  borderRadius: vars.radius.md,
  border: `${vars.border.hairline} solid ${vars.color.border.default}`,
  background: vars.color.bg.secondary,
  marginTop: vars.space.sm,
})
export const reasonActions = style({ display: 'flex', justifyContent: 'flex-end', gap: vars.space.sm })
export const checkRow = style({ display: 'flex', gap: vars.space.lg, flexWrap: 'wrap' })
export const caption2 = style({ fontSize: vars.text.sm, fontWeight: vars.weight.semibold, color: vars.color.text.primary })

export const sectionHead = style({ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: vars.space.md, marginTop: vars.space.lg })

export const familyRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space.md,
  padding: `${vars.space.sm} 0`,
  borderBottom: `${vars.border.hairline} solid ${vars.color.border.default}`,
})
export const rowActions = style({ display: 'flex', gap: vars.space.md, flexShrink: 0 })

export const fieldError = style({ fontSize: vars.text.xs, color: vars.color.danger, fontWeight: vars.weight.medium })

// --- Avaliação (US4) ---
export const assessmentRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space.md,
  padding: `${vars.space.md} 0`,
  borderBottom: `${vars.border.hairline} solid ${vars.color.border.default}`,
})
export const statusIcon = style({ marginRight: vars.space.xs })
export const subRow = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.sm,
  padding: vars.space.md,
  borderRadius: vars.radius.sm,
  border: `${vars.border.hairline} solid ${vars.color.border.default}`,
  background: vars.color.bg.elevated,
})
export const errorBanner = style({
  padding: vars.space.md,
  borderRadius: vars.radius.md,
  background: vars.color.dangerBg,
  border: `${vars.border.hairline} solid ${vars.color.dangerBorder}`,
  color: vars.color.danger,
  fontSize: vars.text.sm,
})
