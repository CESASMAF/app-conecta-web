// Estilos do shell autenticado — vanilla-extract token-only (ADR-0007/0012). Rail 72 + topbar 64.
// import RELATIVO (o compilador do v-e não resolve o alias `~` no Vinxi).
import { style } from '@vanilla-extract/css'
import { vars } from '../../../../shared/ui/tokens/theme.css'

export const shell = style({
  display: 'grid',
  gridTemplateColumns: `${vars.layout.railWidth} 1fr`,
  minHeight: '100vh',
  background: vars.color.bg.primary,
})

export const rail = style({
  width: vars.layout.railWidth,
  background: vars.color.bg.secondary,
  borderRight: `${vars.border.hairline} solid ${vars.color.border.default}`,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: vars.space.xs,
  padding: `${vars.space.md} ${vars.space.sm}`,
  position: 'sticky',
  top: 0,
  height: '100vh',
})

export const railItem = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '52px',
  padding: `${vars.space.sm} ${vars.space.xs}`,
  borderRadius: vars.radius.md,
  color: vars.color.text.secondary,
  textDecoration: 'none',
  fontSize: vars.text.xs,
  fontWeight: vars.weight.medium,
  textAlign: 'center',
  lineHeight: vars.leading.tight,
  selectors: { '&:hover': { background: vars.color.bg.primary } },
})

export const railItemActive = style([
  railItem,
  { color: vars.color.action.primary, background: vars.color.action.tint, fontWeight: vars.weight.semibold },
])

export const main = style({ display: 'flex', flexDirection: 'column', minWidth: 0 })

export const topbar = style({
  height: vars.layout.topbarHeight,
  position: 'sticky',
  top: 0,
  zIndex: 1,
  background: vars.color.bg.elevated,
  borderBottom: `${vars.border.hairline} solid ${vars.color.border.default}`,
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.lg,
  padding: `0 ${vars.space.xl}`,
})

export const topbarTitle = style({
  fontSize: vars.text.xl,
  fontWeight: vars.weight.bold,
  letterSpacing: vars.tracking.tight,
  flex: 1,
})

export const topbarUser = style({ fontSize: vars.text.sm, color: vars.color.text.secondary })

export const logoutBtn = style({
  height: '36px',
  padding: `0 ${vars.space.lg}`,
  borderRadius: vars.radius.md,
  border: `${vars.border.hairline} solid ${vars.color.border.strong}`,
  background: 'transparent',
  color: vars.color.text.primary,
  fontFamily: vars.font.sans,
  fontSize: vars.text.sm,
  fontWeight: vars.weight.medium,
  cursor: 'pointer',
  selectors: { '&:hover': { background: vars.color.bg.secondary } },
})

export const content = style({
  flex: 1,
  width: '100%',
  maxWidth: vars.layout.contentMax,
  margin: '0 auto',
  padding: vars.space.xl,
})
