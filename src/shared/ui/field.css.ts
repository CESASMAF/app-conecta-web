// Estilos de campo compartilhados (formulários de todas as áreas) — vanilla-extract token-only.
import { style } from '@vanilla-extract/css'
import { vars } from './tokens/theme.css'

export const field = style({ display: 'flex', flexDirection: 'column', gap: vars.space.xs, border: 'none', margin: 0, padding: 0 })
export const label = style({ fontSize: vars.text.sm, fontWeight: vars.weight.medium, color: vars.color.text.primary })

const control = {
  height: '44px',
  padding: `0 ${vars.space.md}`,
  borderRadius: vars.radius.md,
  border: `${vars.border.hairline} solid ${vars.color.border.default}`,
  background: vars.color.bg.elevated,
  color: vars.color.text.primary,
  fontFamily: vars.font.sans,
  fontSize: vars.text.base,
  width: '100%',
  selectors: {
    '&:focus-visible': { outline: `2px solid ${vars.color.focus}`, outlineOffset: '1px' },
    '&[aria-invalid="true"]': { borderColor: vars.color.dangerBorder },
  },
} as const
export const input = style(control)
export const select = style({ ...control, cursor: 'pointer' })

export const radioGroup = style({ display: 'flex', gap: vars.space.lg, flexWrap: 'wrap', paddingTop: vars.space.xs })
export const radio = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.xs,
  fontSize: vars.text.base,
  color: vars.color.text.primary,
  cursor: 'pointer',
})

export const error = style({ fontSize: vars.text.xs, color: vars.color.danger, fontWeight: vars.weight.medium })
