// Estilos do wizard de cadastro — vanilla-extract token-only (ADR-0007). Mobile-first (FR-014).
import { style } from '@vanilla-extract/css'
import { vars } from '../../../../shared/ui/tokens/theme.css'

export const wrap = style({ display: 'flex', flexDirection: 'column', gap: vars.space.lg, maxWidth: '560px' })

export const back = style({
  fontSize: vars.text.sm,
  fontWeight: vars.weight.medium,
  color: vars.color.action.primary,
  textDecoration: 'none',
  alignSelf: 'flex-start',
  selectors: { '&:focus-visible': { outline: `2px solid ${vars.color.focus}`, outlineOffset: '2px' } },
})

export const header = style({ display: 'flex', flexDirection: 'column', gap: vars.space.sm })
export const title = style({ fontSize: vars.text.xxl, fontWeight: vars.weight.bold, letterSpacing: vars.tracking.tight })

// Stepper ●───○ / ○───●
export const stepper = style({ display: 'flex', alignItems: 'center', gap: vars.space.sm })
const dotBase = {
  width: '14px',
  height: '14px',
  borderRadius: vars.radius.full,
  border: `${vars.border.strong} solid ${vars.color.border.strong}`,
  background: vars.color.bg.elevated,
  flexShrink: 0,
} as const
export const dot = style(dotBase)
export const dotActive = style([dotBase, { background: vars.color.action.primary, borderColor: vars.color.action.primary }])
export const stepLine = style({ flex: 1, height: vars.border.strong, background: vars.color.border.default })

export const caption = style({ fontSize: vars.text.sm, color: vars.color.text.secondary, fontWeight: vars.weight.medium })

export const form = style({ display: 'flex', flexDirection: 'column', gap: vars.space.lg })

export const errorBox = style({
  padding: vars.space.md,
  borderRadius: vars.radius.md,
  background: vars.color.dangerBg,
  border: `${vars.border.hairline} solid ${vars.color.dangerBorder}`,
  color: vars.color.danger,
  fontSize: vars.text.sm,
})

export const muted = style({ color: vars.color.text.secondary, fontSize: vars.text.sm })

export const actions = style({ display: 'flex', justifyContent: 'space-between', gap: vars.space.md, marginTop: vars.space.sm })

const btnBase = {
  height: '44px',
  padding: `0 ${vars.space.xl}`,
  borderRadius: vars.radius.md,
  fontFamily: vars.font.sans,
  fontSize: vars.text.sm,
  fontWeight: vars.weight.semibold,
  cursor: 'pointer',
  border: 'none',
  selectors: { '&:focus-visible': { outline: `2px solid ${vars.color.focus}`, outlineOffset: '2px' } },
} as const

export const btnPrimary = style([
  btnBase,
  {
    background: vars.color.brand.gradient,
    color: vars.color.action.fg,
    marginLeft: 'auto', // empurra p/ a direita quando é o único botão (passo 1)
    selectors: { '&:disabled': { opacity: 0.6, cursor: 'progress' } },
  },
])

export const btnGhost = style([
  btnBase,
  {
    background: 'transparent',
    color: vars.color.action.primary,
    border: `${vars.border.hairline} solid ${vars.color.border.default}`,
  },
])
