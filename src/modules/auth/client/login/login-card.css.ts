// Estilos da tela de login — vanilla-extract, token-only (ADR-0007).
// Portado do design RORAIMA_DESIGN ("Login - Raros Boa Vista"): duas colunas —
// painel de marca (gradiente) + painel de formulário (e-mail/senha). Atkinson (sem Poppins).
// Modo Enxuto. import RELATIVO ao tema (o compilador do v-e não resolve `~`).
import { style, keyframes } from '@vanilla-extract/css'
import { vars } from '../../../../shared/ui/tokens/theme.css'

// ---------------------------------------------------------------- shell 2 colunas
export const screen = style({
  minHeight: '100vh',
  display: 'grid',
  gridTemplateColumns: '1.05fr 1fr',
  background: vars.color.bg.primary,
  '@media': { '(max-width: 860px)': { gridTemplateColumns: '1fr' } },
})

// ---------------------------------------------------------------- painel de marca (esquerda)
export const brand = style({
  position: 'relative',
  overflow: 'hidden',
  background: vars.color.brand.gradient,
  color: vars.color.action.fg,
  padding: '52px 56px',
  display: 'flex',
  flexDirection: 'column',
  '@media': { '(max-width: 860px)': { display: 'none' } },
})

export const brandLogoPlate = style({
  alignSelf: 'flex-start',
  background: vars.color.bg.elevated,
  borderRadius: vars.radius.lg,
  padding: `${vars.space.md} ${vars.space.lg}`,
  boxShadow: vars.shadow.lg,
})
export const brandLogoImg = style({ height: '34px', display: 'block' })

export const brandMid = style({ marginTop: 'auto', marginBottom: 'auto', position: 'relative', zIndex: 1 })
export const brandTitle = style({
  fontFamily: vars.font.sans,
  fontWeight: vars.weight.bold,
  fontSize: vars.text.hero,
  lineHeight: vars.leading.tight,
  letterSpacing: vars.tracking.tight,
  maxWidth: '12ch',
  color: vars.color.action.fg,
})
export const brandText = style({ fontSize: vars.text.base, opacity: 0.92, marginTop: vars.space.lg, maxWidth: '38ch', lineHeight: vars.leading.relaxed })

export const brandTag = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.sm,
  marginTop: vars.space.xl,
  fontWeight: vars.weight.semibold,
  fontSize: vars.text.sm,
  background: 'rgba(255,255,255,0.16)',
  border: '1px solid rgba(255,255,255,0.28)',
  padding: `${vars.space.sm} ${vars.space.md}`,
  borderRadius: vars.radius.full,
})

export const brandFeatures = style({ display: 'flex', flexDirection: 'column', gap: vars.space.md, marginTop: vars.space.xl })
export const brandFeature = style({ display: 'flex', alignItems: 'center', gap: vars.space.md, fontSize: vars.text.sm, opacity: 0.95 })
export const brandFeatureIcon = style({
  width: '32px',
  height: '32px',
  borderRadius: vars.radius.sm,
  background: 'rgba(255,255,255,0.16)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 'none',
})
export const brandFoot = style({ position: 'relative', zIndex: 1, fontFamily: vars.font.mono, fontSize: vars.text.xs, opacity: 0.8, lineHeight: vars.leading.relaxed })

// ---------------------------------------------------------------- painel de formulário (direita)
export const pane = style({ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: `${vars.space.xxl} ${vars.space.xl}` })
export const card = style({ width: '100%', maxWidth: '392px', display: 'flex', flexDirection: 'column' })

export const mobileLogo = style({
  display: 'none',
  '@media': { '(max-width: 860px)': { display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: vars.space.xl } },
})
export const mobileLogoImg = style({ height: '34px' })

export const title = style({ fontSize: vars.text.xxl, fontWeight: vars.weight.bold, color: vars.color.text.primary, letterSpacing: vars.tracking.tight })
export const subtitle = style({ color: vars.color.text.secondary, fontSize: vars.text.sm, margin: `${vars.space.sm} 0 ${vars.space.xl}` })
export const subtitleStrong = style({ color: vars.color.text.body, fontFamily: vars.font.mono, fontWeight: vars.weight.medium })

// campo
export const field = style({ marginBottom: vars.space.lg })
export const label = style({ display: 'block', fontWeight: vars.weight.semibold, fontSize: vars.text.xs, color: vars.color.text.body, marginBottom: vars.space.sm })
export const inputWrap = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.sm,
  border: `${vars.border.hairline} solid ${vars.color.border.default}`,
  borderRadius: vars.radius.md,
  padding: `${vars.space.md} ${vars.space.md}`,
  background: vars.color.bg.elevated,
  transition: `border-color ${vars.motion.fast} ${vars.motion.ease}, box-shadow ${vars.motion.fast} ${vars.motion.ease}`,
  selectors: {
    '&:focus-within': { borderColor: vars.color.border.active, boxShadow: `0 0 0 3px ${vars.color.action.tint}` },
  },
})
export const inputIcon = style({ color: vars.color.text.disabled, flex: 'none', display: 'flex' })
export const input = style({
  border: 0,
  outline: 0,
  flex: 1,
  minWidth: 0,
  fontFamily: vars.font.sans,
  fontSize: vars.text.base,
  color: vars.color.text.primary,
  background: 'transparent',
  '::placeholder': { color: vars.color.text.disabled },
})
export const eyeBtn = style({ color: vars.color.text.disabled, cursor: 'pointer', background: 'none', border: 0, padding: 0, display: 'flex', selectors: { '&:hover': { color: vars.color.text.secondary } } })

// linha "manter conectado" / "esqueci a senha"
export const rowBetween = style({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: `2px 0 ${vars.space.xl}` })
export const remember = style({ display: 'inline-flex', alignItems: 'center', gap: vars.space.sm, fontSize: vars.text.sm, color: vars.color.text.body, cursor: 'pointer', background: 'none', border: 0, padding: 0, fontFamily: vars.font.sans })
export const rememberBox = style({
  width: '17px',
  height: '17px',
  borderRadius: vars.radius.xs,
  border: `${vars.border.strong} solid ${vars.color.text.disabled}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.color.action.fg,
  flex: 'none',
  transition: `background ${vars.motion.fast} ${vars.motion.ease}, border-color ${vars.motion.fast} ${vars.motion.ease}`,
})
export const rememberBoxOn = style([rememberBox, { background: vars.color.action.primary, borderColor: vars.color.action.primary }])
export const link = style({ color: vars.color.action.primary, fontSize: vars.text.sm, fontWeight: vars.weight.semibold, fontFamily: vars.font.sans, textDecoration: 'none', cursor: 'pointer', background: 'none', border: 0, padding: 0, selectors: { '&:hover': { color: vars.color.accent.magenta } } })

// botão primário
export const submit = style({
  width: '100%',
  border: 0,
  background: vars.color.action.primary,
  color: vars.color.action.fg,
  borderRadius: vars.radius.md,
  padding: vars.space.md,
  fontFamily: vars.font.sans,
  fontWeight: vars.weight.semibold,
  fontSize: vars.text.base,
  cursor: 'pointer',
  boxShadow: vars.shadow.sm,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space.sm,
  transition: `background ${vars.motion.fast} ${vars.motion.ease}, box-shadow ${vars.motion.fast} ${vars.motion.ease}`,
  selectors: {
    '&:hover': { background: vars.color.action.hover, boxShadow: vars.shadow.md },
    '&:active': { background: vars.color.action.active },
    '&:focus-visible': { outline: `${vars.focusRing.width} solid ${vars.color.focus}`, outlineOffset: vars.focusRing.offset },
  },
})

// botão secundário (entrar com código por e-mail) — contornado
export const ssoBtn = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space.sm,
  width: '100%',
  marginTop: vars.space.md,
  border: `${vars.border.hairline} solid ${vars.color.border.default}`,
  background: vars.color.bg.elevated,
  borderRadius: vars.radius.md,
  padding: vars.space.md,
  fontFamily: vars.font.sans,
  fontWeight: vars.weight.semibold,
  fontSize: vars.text.sm,
  color: vars.color.text.primary,
  cursor: 'pointer',
  transition: `border-color ${vars.motion.fast} ${vars.motion.ease}, background ${vars.motion.fast} ${vars.motion.ease}`,
  selectors: {
    '&:hover': { borderColor: vars.color.action.tint, background: vars.color.bg.secondary },
    '&:focus-visible': { outline: `${vars.focusRing.width} solid ${vars.color.focus}`, outlineOffset: vars.focusRing.offset },
  },
})

// nota LGPD
export const lgpd = style({
  display: 'flex',
  gap: vars.space.sm,
  alignItems: 'flex-start',
  marginTop: vars.space.xl,
  padding: `${vars.space.md} ${vars.space.md}`,
  background: vars.color.tint.tec,
  border: `${vars.border.hairline} solid ${vars.color.status.tecBorder}`,
  borderRadius: vars.radius.md,
  fontSize: vars.text.xs,
  color: vars.color.action.active,
  lineHeight: vars.leading.normal,
})
export const lgpdIcon = style({ color: vars.color.action.primary, flex: 'none', marginTop: '1px', display: 'flex' })
export const lgpdStrong = style({ fontWeight: vars.weight.bold })

export const support = style({ textAlign: 'center', marginTop: vars.space.xl, fontSize: vars.text.sm, color: vars.color.text.secondary })
export const powered = style({ textAlign: 'center', marginTop: vars.space.lg, fontFamily: vars.font.mono, fontSize: vars.text.xs, color: vars.color.text.disabled, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: vars.space.xs })

export const errorBox = style({
  padding: vars.space.md,
  borderRadius: vars.radius.md,
  background: vars.color.dangerBg,
  border: `${vars.border.hairline} solid ${vars.color.dangerBorder}`,
  color: vars.color.danger,
  fontSize: vars.text.sm,
  lineHeight: vars.leading.snug,
  marginBottom: vars.space.lg,
})

// voltar (telas secundárias)
export const backLink = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.xs,
  color: vars.color.text.secondary,
  fontSize: vars.text.sm,
  fontWeight: vars.weight.semibold,
  fontFamily: vars.font.sans,
  textDecoration: 'none',
  background: 'none',
  border: 0,
  cursor: 'pointer',
  padding: 0,
  marginBottom: vars.space.md,
  selectors: { '&:hover': { color: vars.color.action.primary } },
})

// input de código (recovery/MFA) — mono, centralizado, espaçado
export const codeInput = style({
  width: '100%',
  height: '52px',
  textAlign: 'center',
  fontFamily: vars.font.mono,
  fontSize: vars.text.xl,
  letterSpacing: '0.4em',
  color: vars.color.text.primary,
  background: vars.color.bg.elevated,
  border: `${vars.border.hairline} solid ${vars.color.border.default}`,
  borderRadius: vars.radius.md,
  outline: 0,
  selectors: {
    '&:focus-visible': { borderColor: vars.color.border.active, boxShadow: `0 0 0 3px ${vars.color.action.tint}` },
  },
})

export const hint = style({ fontSize: vars.text.xs, color: vars.color.text.secondary, marginTop: vars.space.sm })

// ---------------------------------------------------------------- estados de status
export const status = style({ textAlign: 'center', padding: `${vars.space.sm} 0` })
export const statusBadge = style({
  width: '64px',
  height: '64px',
  borderRadius: vars.radius.xl,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: `0 auto ${vars.space.lg}`,
  color: vars.color.action.fg,
})
export const statusBadgeLoad = style({ background: vars.color.action.primary })
export const statusBadgeWarn = style({ background: vars.color.accent.orange })
export const statusBadgeDeny = style({ background: vars.color.danger })
export const statusBadgeOk = style({ background: vars.color.accent.green })
export const statusTitle = style({ fontSize: vars.text.xl, fontWeight: vars.weight.bold, color: vars.color.text.primary, marginBottom: vars.space.sm, letterSpacing: vars.tracking.tight })
export const statusText = style({ color: vars.color.text.secondary, fontSize: vars.text.sm, margin: `0 auto ${vars.space.lg}`, maxWidth: '38ch', lineHeight: vars.leading.normal })

const spin = keyframes({ to: { transform: 'rotate(360deg)' } })
export const spinner = style({
  width: '30px',
  height: '30px',
  border: '3px solid rgba(255,255,255,0.35)',
  borderTopColor: vars.color.action.fg,
  borderRadius: vars.radius.full,
  animation: `${spin} 0.8s linear infinite`,
})
