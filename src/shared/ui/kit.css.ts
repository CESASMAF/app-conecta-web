// Kit de primitivos visuais compartilhados — vanilla-extract token-only (ADR-0007).
// Portado do protótipo hi-fi RORAIMA_DESIGN (Raros Boa Vista). Default = Modo Enxuto/HIG:
// superfícies chapadas (hairline antes de sombra), cor só onde há significado.
import { style, styleVariants, keyframes } from '@vanilla-extract/css'
import { vars } from './tokens/theme.css'

// ---------------------------------------------------------------- Panel (card)
export const panel = style({
  background: vars.color.bg.elevated,
  border: `${vars.border.hairline} solid ${vars.color.border.default}`,
  borderRadius: vars.radius.card,
})

export const panelHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.md,
  padding: `${vars.space.md} ${vars.space.lg}`,
  borderBottom: `${vars.border.hairline} solid ${vars.color.border.soft}`,
})

export const panelTitle = style({
  fontSize: vars.text.base,
  fontWeight: vars.weight.semibold,
  color: vars.color.text.primary,
  letterSpacing: vars.tracking.tight,
})

export const panelMeta = style({ marginLeft: 'auto', fontSize: vars.text.sm, color: vars.color.text.secondary })

export const panelBody = style({ padding: vars.space.lg, display: 'flex', flexDirection: 'column', gap: vars.space.md })

// ---------------------------------------------------------------- Micro-rótulo
// Rótulo maiúsculo discreto (HIG: menos gritante — tracking + cor suaves).
export const overline = style({
  fontFamily: vars.font.sans,
  fontSize: vars.text.xs,
  fontWeight: vars.weight.semibold,
  letterSpacing: vars.tracking.wide,
  textTransform: 'uppercase',
  color: vars.color.text.disabled,
})

// ---------------------------------------------------------------- Chip / status
const chipBase = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.xs,
  fontSize: vars.text.xs,
  fontWeight: vars.weight.semibold,
  fontFamily: vars.font.sans,
  lineHeight: vars.leading.tight,
  padding: `3px ${vars.space.sm}`,
  borderRadius: vars.radius.full,
  border: `${vars.border.hairline} solid ${vars.color.border.default}`,
  background: vars.color.bg.elevated,
  color: vars.color.text.body,
  whiteSpace: 'nowrap',
} as const

export const chip = style(chipBase)

// Cor = significado. Categóricos (neutral) ficam sóbrios; semânticos mantêm a cor.
export const chipStatus = styleVariants({
  neutral: [chipBase, { color: vars.color.text.secondary }],
  acolhido: [chipBase, { color: vars.color.status.acolhidoFg, background: vars.color.status.acolhidoBg, borderColor: vars.color.status.acolhidoBorder }],
  fila: [chipBase, { color: vars.color.status.filaFg, background: vars.color.status.filaBg, borderColor: vars.color.status.filaBorder }],
  alta: [chipBase, { color: vars.color.status.altaFg, background: vars.color.status.altaBg, borderColor: vars.color.status.altaBorder }],
  risco: [chipBase, { color: vars.color.status.riscoFg, background: vars.color.status.riscoBg, borderColor: vars.color.status.riscoBorder }],
  saude: [chipBase, { color: vars.color.status.saudeFg, background: vars.color.status.saudeBg, borderColor: vars.color.status.saudeBorder }],
  tec: [chipBase, { color: vars.color.status.tecFg, background: vars.color.status.tecBg, borderColor: vars.color.status.tecBorder }],
  tut: [chipBase, { color: vars.color.status.tutFg, background: vars.color.status.tutBg, borderColor: vars.color.status.tutBorder }],
})

export const chipDot = style({ width: '7px', height: '7px', borderRadius: vars.radius.full, background: 'currentColor', flex: 'none' })

// Selo discreto (contadores, metadados) — sóbrio por padrão (Modo Enxuto).
export const pillSoft = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.xs,
  fontSize: vars.text.xs,
  fontWeight: vars.weight.semibold,
  fontFamily: vars.font.sans,
  padding: `2px ${vars.space.sm}`,
  borderRadius: vars.radius.full,
  background: vars.color.bg.sunken,
  color: vars.color.text.secondary,
})

// ---------------------------------------------------------------- Avatar
const avatarBase = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 'none',
  fontFamily: vars.font.sans,
  fontWeight: vars.weight.bold,
  color: vars.color.action.fg,
  background: vars.color.brand.gradient,
} as const

export const avatar = styleVariants({
  sm: [avatarBase, { width: '32px', height: '32px', borderRadius: vars.radius.sm, fontSize: vars.text.xs }],
  md: [avatarBase, { width: '40px', height: '40px', borderRadius: vars.radius.md, fontSize: vars.text.sm }],
  lg: [avatarBase, { width: '56px', height: '56px', borderRadius: vars.radius.lg, fontSize: vars.text.xl }],
})

// ---------------------------------------------------------------- KPI / stat
export const kpi = style({
  background: vars.color.bg.elevated,
  border: `${vars.border.hairline} solid ${vars.color.border.default}`,
  borderRadius: vars.radius.md,
  padding: vars.space.lg,
})

export const kpiClickable = style([
  kpi,
  {
    cursor: 'pointer',
    transition: `box-shadow ${vars.motion.fast} ${vars.motion.ease}, border-color ${vars.motion.fast} ${vars.motion.ease}`,
    selectors: {
      '&:hover': { boxShadow: vars.shadow.md, borderColor: vars.color.action.tint },
      '&:focus-visible': { outline: `${vars.focusRing.width} solid ${vars.color.focus}`, outlineOffset: vars.focusRing.offset },
    },
  },
])

export const kpiIcon = style({
  width: '34px',
  height: '34px',
  borderRadius: vars.radius.sm,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: vars.space.md,
  background: vars.color.bg.sunken,
  color: vars.color.action.primary,
})

export const kpiValue = style({ fontFamily: vars.font.sans, fontWeight: vars.weight.bold, fontSize: vars.text.xxxl, color: vars.color.text.primary, lineHeight: vars.leading.tight })
export const kpiValueMono = style([kpiValue, { fontFamily: vars.font.mono }])
export const kpiLabel = style({ fontSize: vars.text.sm, color: vars.color.text.secondary, marginTop: vars.space.xs })

// ---------------------------------------------------------------- Progress
export const progress = style({
  height: '7px',
  background: vars.color.bg.sunken,
  borderRadius: vars.radius.full,
  overflow: 'hidden',
})
export const progressFill = style({ display: 'block', height: '100%', borderRadius: vars.radius.full, background: vars.color.brand.gradient })

// ---------------------------------------------------------------- Botões
const btnBase = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space.sm,
  height: '40px',
  padding: `0 ${vars.space.lg}`,
  borderRadius: vars.radius.md,
  fontFamily: vars.font.sans,
  fontSize: vars.text.sm,
  fontWeight: vars.weight.semibold,
  cursor: 'pointer',
  border: `${vars.border.hairline} solid transparent`,
  transition: `background-color ${vars.motion.fast} ${vars.motion.ease}, border-color ${vars.motion.fast} ${vars.motion.ease}, box-shadow ${vars.motion.fast} ${vars.motion.ease}`,
  selectors: {
    '&:focus-visible': { outline: `${vars.focusRing.width} solid ${vars.color.focus}`, outlineOffset: vars.focusRing.offset },
    '&:disabled': { opacity: 0.6, cursor: 'not-allowed' },
  },
} as const

export const btn = styleVariants({
  primary: [btnBase, { background: vars.color.action.primary, color: vars.color.action.fg, selectors: { '&:hover:not(:disabled)': { background: vars.color.action.hover } } }],
  gradient: [btnBase, { background: vars.color.brand.gradient, color: vars.color.action.fg }],
  ghost: [btnBase, { background: vars.color.bg.elevated, color: vars.color.text.body, borderColor: vars.color.border.default, selectors: { '&:hover:not(:disabled)': { background: vars.color.bg.secondary } } }],
  tonal: [btnBase, { background: vars.color.action.tint, color: vars.color.action.tintFg, selectors: { '&:hover:not(:disabled)': { background: vars.color.status.tecBorder } } }],
  text: [btnBase, { background: 'transparent', color: vars.color.action.primary, padding: `0 ${vars.space.sm}` }],
})

export const btnSm = style({ height: '32px', padding: `0 ${vars.space.md}`, fontSize: vars.text.xs })

// Divisória fina
export const hr = style({ height: vars.border.hairline, background: vars.color.border.soft, border: 'none', margin: 0 })

// ------------------------------------------------- Estado ocupado (botão de ação)
// Um botão que só fica `disabled` durante a gravação apaga e não explica nada: quem
// clicou não sabe se o clique pegou, e a reação natural é clicar de novo. Em mutação
// isso vira registro duplicado. O spinner transforma "nada acontece" em "está indo".
const spin = keyframes({ to: { transform: 'rotate(360deg)' } })

export const btnSpinner = style({
  width: '14px',
  height: '14px',
  flex: 'none',
  borderRadius: vars.radius.full,
  border: '2px solid currentColor',
  borderTopColor: 'transparent',
  opacity: 0.85,
  animation: `${spin} 0.7s linear infinite`,
  // Respeita quem pediu menos movimento: sem girar, o anel parcial ainda comunica
  // "ocupado" — e o texto do botão muda junto, então nada depende só da animação.
  '@media': { '(prefers-reduced-motion: reduce)': { animation: 'none' } },
})

// O botão não pode encolher/crescer ao trocar "Salvar" por "Salvando…": isso desloca o
// que está ao lado e move o alvo do clique no exato instante em que a pessoa ainda pode
// estar mirando nele.
export const btnBusy = style({ minWidth: '11ch', justifyContent: 'center' })
