// Tela de último recurso quando um componente lança no render (ver crash-fallback.component).
import { style } from '@vanilla-extract/css'
import { vars } from './tokens/theme.css'

export const wrap = style({
  minHeight: '100dvh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: vars.space.lg,
  background: vars.color.bg.secondary,
})

export const card = style({
  maxWidth: '32rem',
  width: '100%',
  background: vars.color.bg.elevated,
  border: `${vars.border.hairline} solid ${vars.color.border.default}`,
  borderRadius: vars.radius.card,
  padding: vars.space.xl,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.md,
})

export const title = style({
  fontFamily: vars.font.sans,
  fontWeight: vars.weight.bold,
  fontSize: vars.text.xl,
  color: vars.color.text.primary,
  margin: 0,
})

export const body = style({
  fontSize: vars.text.sm,
  color: vars.color.text.secondary,
  margin: 0,
  lineHeight: vars.leading.normal,
})

export const actions = style({
  display: 'flex',
  gap: vars.space.sm,
  marginTop: vars.space.sm,
  flexWrap: 'wrap',
})

// O detalhe técnico fica fechado por padrão: serve para o print que o usuário manda,
// não para assustar quem só quer voltar a trabalhar.
export const details = style({
  fontSize: vars.text.xs,
  color: vars.color.text.secondary,
})

export const pre = style({
  fontFamily: vars.font.mono,
  fontSize: vars.text.xs,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  background: vars.color.bg.secondary,
  border: `${vars.border.hairline} solid ${vars.color.border.soft}`,
  borderRadius: vars.radius.md,
  padding: vars.space.sm,
  marginTop: vars.space.sm,
})
