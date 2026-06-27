// Estilos do card de login — vanilla-extract, token-only (ADR-0007). Coral sobre warm-gray.
import { style } from '@vanilla-extract/css'
// import RELATIVO: o compilador do vanilla-extract não resolve o alias `~` (limitação Vinxi).
import { vars } from '../../../../shared/ui/tokens/theme.css'

export const screen = style({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: vars.space.xl,
  background: vars.color.bg.primary,
})

export const card = style({
  width: '100%',
  maxWidth: '400px',
  background: vars.color.bg.elevated,
  border: `${vars.border.hairline} solid ${vars.color.border.default}`,
  borderRadius: vars.radius.lg,
  boxShadow: vars.shadow.sm,
  padding: vars.space.xxl,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.xl,
})

export const brand = style({ display: 'flex', flexDirection: 'column', gap: vars.space.sm })
export const logo = style({ height: '36px', width: 'auto', objectFit: 'contain' })
export const title = style({ fontSize: vars.text.xxl, fontWeight: vars.weight.bold, letterSpacing: vars.tracking.tight })
export const subtitle = style({ fontSize: vars.text.sm, color: vars.color.text.secondary, lineHeight: vars.leading.snug })

export const button = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '48px',
  padding: `0 ${vars.space.xl}`,
  borderRadius: vars.radius.md,
  border: 'none',
  background: vars.color.action.primary,
  color: vars.color.action.fg,
  fontFamily: vars.font.sans,
  fontSize: vars.text.base,
  fontWeight: vars.weight.semibold,
  textDecoration: 'none',
  cursor: 'pointer',
  transition: `background ${vars.motion.fast} ${vars.motion.ease}`,
  selectors: {
    '&:hover': { background: vars.color.action.hover },
    '&:active': { background: vars.color.action.active },
  },
})

export const errorBox = style({
  padding: vars.space.md,
  borderRadius: vars.radius.md,
  background: vars.color.dangerBg,
  border: `${vars.border.hairline} solid ${vars.color.dangerBorder}`,
  color: vars.color.text.primary,
  fontSize: vars.text.sm,
  lineHeight: vars.leading.snug,
})
