// Estilos do wizard de cadastro — vanilla-extract token-only (ADR-0007). Mobile-first (FR-014).
// Restyle RORAIMA_DESIGN (Modo Enxuto): stepper numerado + trilha de progresso, etapa em cartão
// enxuto (kit `panel`), navegação com botões do kit (`btn.gradient`/`btn.ghost`).
import { style } from '@vanilla-extract/css'
import { vars } from '../../../../shared/ui/tokens/theme.css'
import { panel, btn } from '../../../../shared/ui/kit.css'

export const wrap = style({ display: 'flex', flexDirection: 'column', gap: vars.space.lg, maxWidth: '560px' })

export const back = style({
  fontSize: vars.text.sm,
  fontWeight: vars.weight.medium,
  color: vars.color.action.primary,
  textDecoration: 'none',
  alignSelf: 'flex-start',
  selectors: { '&:focus-visible': { outline: `2px solid ${vars.color.focus}`, outlineOffset: '2px' } },
})

export const header = style({ display: 'flex', flexDirection: 'column', gap: vars.space.md })
export const title = style({
  fontSize: vars.text.xxl,
  fontWeight: vars.weight.bold,
  letterSpacing: vars.tracking.tight,
  color: vars.color.text.primary,
})

// Stepper — círculos numerados ① ─── ② com trilha de progresso da marca.
export const stepper = style({ display: 'flex', alignItems: 'center', gap: vars.space.sm })
const nodeBase = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  flexShrink: 0,
  borderRadius: vars.radius.full,
  fontFamily: vars.font.sans,
  fontSize: vars.text.xs,
  fontWeight: vars.weight.bold,
  border: `${vars.border.hairline} solid ${vars.color.border.default}`,
  background: vars.color.bg.sunken,
  color: vars.color.text.secondary,
} as const
export const stepNode = style(nodeBase)
export const stepNodeActive = style([
  nodeBase,
  { background: vars.color.brand.gradient, color: vars.color.action.fg, borderColor: 'transparent' },
])
export const stepTrack = style({
  flex: 1,
  height: '6px',
  background: vars.color.bg.sunken,
  borderRadius: vars.radius.full,
  overflow: 'hidden',
})
export const stepTrackFill = style({
  display: 'block',
  height: '100%',
  borderRadius: vars.radius.full,
  background: vars.color.brand.gradient,
  transition: `width ${vars.motion.normal} ${vars.motion.ease}`,
})

// Cada etapa é um cartão enxuto (kit `panel`): superfície chapada + hairline.
export const form = style([
  panel,
  { display: 'flex', flexDirection: 'column', gap: vars.space.lg, padding: vars.space.xl },
])

// Cabeçalho de seção dentro do cartão (a legenda "Passo X de 2 · …").
export const caption = style({
  fontSize: vars.text.sm,
  fontWeight: vars.weight.semibold,
  color: vars.color.text.primary,
  paddingBottom: vars.space.md,
  borderBottom: `${vars.border.hairline} solid ${vars.color.border.soft}`,
})

export const errorBox = style({
  padding: vars.space.md,
  borderRadius: vars.radius.md,
  background: vars.color.dangerBg,
  border: `${vars.border.hairline} solid ${vars.color.dangerBorder}`,
  color: vars.color.danger,
  fontSize: vars.text.sm,
})

export const muted = style({ color: vars.color.text.secondary, fontSize: vars.text.sm })

export const actions = style({ display: 'flex', justifyContent: 'space-between', gap: vars.space.md, marginTop: vars.space.xs })

// Navegação — compõe os botões do kit; primário empurrado à direita quando é o único (passo 1).
export const btnPrimary = style([btn.gradient, { marginLeft: 'auto' }])
export const btnGhost = btn.ghost
