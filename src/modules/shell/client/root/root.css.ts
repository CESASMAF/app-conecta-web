// Estilos do shell autenticado — vanilla-extract token-only (ADR-0007/0012).
// Rail 224px rotulado (logo + nav + card de usuário) + topbar; alinhado ao protótipo RORAIMA_DESIGN.
// import RELATIVO (o compilador do v-e não resolve o alias `~` no Vinxi).
import { style } from '@vanilla-extract/css'
import { vars } from '../../../../shared/ui/tokens/theme.css'

export const shell = style({
  display: 'grid',
  gridTemplateColumns: `${vars.layout.railWidth} 1fr`,
  minHeight: '100vh',
  background: vars.color.bg.primary,
  '@media': {
    '(max-width: 760px)': { gridTemplateColumns: '1fr' },
  },
})

export const rail = style({
  width: vars.layout.railWidth,
  background: vars.color.bg.secondary,
  borderRight: `${vars.border.hairline} solid ${vars.color.border.default}`,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.xs,
  padding: `${vars.space.lg} ${vars.space.md}`,
  position: 'sticky',
  top: 0,
  height: '100vh',
  overflowY: 'auto',
  '@media': {
    '(max-width: 760px)': {
      width: 'auto',
      height: 'auto',
      flexDirection: 'row',
      alignItems: 'center',
      gap: vars.space.sm,
      overflowX: 'auto',
      overflowY: 'hidden',
      borderRight: 'none',
      borderBottom: `${vars.border.hairline} solid ${vars.color.border.default}`,
      padding: `${vars.space.sm} ${vars.space.md}`,
    },
  },
})

export const railLogo = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.sm,
  padding: `${vars.space.xs} ${vars.space.sm} ${vars.space.md}`,
  '@media': { '(max-width: 760px)': { padding: 0, flex: 'none' } },
})

export const railLogoImg = style({ height: '28px', width: 'auto', display: 'block' })

export const railLogoText = style({
  fontFamily: vars.font.sans,
  fontWeight: vars.weight.bold,
  fontSize: vars.text.sm,
  color: vars.color.text.primary,
  lineHeight: vars.leading.tight,
  letterSpacing: vars.tracking.tight,
  '@media': { '(max-width: 760px)': { display: 'none' } },
})

export const railNav = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  '@media': { '(max-width: 760px)': { flexDirection: 'row', gap: vars.space.xs } },
})

export const railItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.sm,
  minHeight: '40px',
  padding: `${vars.space.sm} ${vars.space.sm}`,
  borderRadius: vars.radius.sm,
  color: vars.color.text.body,
  textDecoration: 'none',
  fontSize: vars.text.sm,
  fontWeight: vars.weight.semibold,
  lineHeight: vars.leading.tight,
  whiteSpace: 'nowrap',
  transition: `background-color ${vars.motion.fast} ${vars.motion.ease}, color ${vars.motion.fast} ${vars.motion.ease}`,
  selectors: { '&:hover': { background: vars.color.bg.sunken } },
})

export const railItemActive = style([
  railItem,
  { color: vars.color.action.primary, background: vars.color.action.tint },
])

export const railUser = style({
  marginTop: 'auto',
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.sm,
  padding: `${vars.space.sm} ${vars.space.xs}`,
  borderTop: `${vars.border.hairline} solid ${vars.color.border.soft}`,
  '@media': { '(max-width: 760px)': { display: 'none' } },
})

export const railUserInfo = style({ display: 'flex', flexDirection: 'column', minWidth: 0 })

export const railUserName = style({
  fontFamily: vars.font.sans,
  fontWeight: vars.weight.semibold,
  fontSize: vars.text.sm,
  color: vars.color.text.primary,
  lineHeight: vars.leading.tight,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

export const railUserRole = style({
  fontSize: vars.text.xs,
  color: vars.color.text.secondary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

export const main = style({ display: 'flex', flexDirection: 'column', minWidth: 0 })

export const topbar = style({
  height: vars.layout.topbarHeight,
  position: 'sticky',
  top: 0,
  zIndex: 1,
  background: vars.color.bg.elevated,
  borderBottom: `${vars.border.hairline} solid ${vars.color.border.soft}`,
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.lg,
  padding: `0 ${vars.space.xl}`,
})

export const topbarTitleWrap = style({ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 })

export const topbarCrumb = style({
  fontSize: vars.text.xs,
  color: vars.color.text.disabled,
  fontFamily: vars.font.mono,
})

export const topbarTitle = style({
  fontSize: vars.text.lg,
  fontWeight: vars.weight.semibold,
  letterSpacing: vars.tracking.tight,
  color: vars.color.text.primary,
})

export const logoutBtn = style({
  height: '36px',
  padding: `0 ${vars.space.lg}`,
  borderRadius: vars.radius.md,
  border: `${vars.border.hairline} solid ${vars.color.border.default}`,
  background: vars.color.bg.elevated,
  color: vars.color.text.body,
  fontFamily: vars.font.sans,
  fontSize: vars.text.sm,
  fontWeight: vars.weight.medium,
  cursor: 'pointer',
  transition: `background-color ${vars.motion.fast} ${vars.motion.ease}`,
  selectors: { '&:hover': { background: vars.color.bg.secondary } },
})

export const content = style({
  flex: 1,
  width: '100%',
  maxWidth: vars.layout.contentMax,
  margin: '0 auto',
  padding: vars.space.xl,
})
