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
export const title = style({ fontSize: vars.text.xxl, fontWeight: vars.weight.semibold, letterSpacing: vars.tracking.tight, color: vars.color.text.primary })

export const badge = style({
  fontSize: vars.text.xs,
  fontWeight: vars.weight.medium,
  padding: `2px ${vars.space.sm}`,
  borderRadius: vars.radius.sm,
  background: vars.color.action.tint,
  color: vars.color.action.tintFg,
})

// --- Layout master-detail (RORAIMA_DESIGN): cartão de identidade fixo + coluna principal com abas ---
export const record = style({
  display: 'grid',
  gridTemplateColumns: '312px 1fr',
  gap: vars.space.xl,
  alignItems: 'start',
  '@media': { '(max-width: 900px)': { gridTemplateColumns: '1fr' } },
})

export const pcard = style({
  background: vars.color.bg.elevated,
  border: `${vars.border.hairline} solid ${vars.color.border.default}`,
  borderRadius: vars.radius.lg,
  overflow: 'hidden',
  position: 'sticky',
  top: vars.space.lg,
  '@media': { '(max-width: 900px)': { position: 'static' } },
})

export const pcardTop = style({
  padding: vars.space.lg,
  borderBottom: `${vars.border.hairline} solid ${vars.color.border.soft}`,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: vars.space.sm,
})

export const pcardName = style({
  fontSize: vars.text.lg,
  fontWeight: vars.weight.semibold,
  color: vars.color.text.primary,
  letterSpacing: vars.tracking.tight,
  lineHeight: vars.leading.snug,
})

export const preftag = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.xs,
  fontSize: vars.text.xs,
  fontWeight: vars.weight.semibold,
  color: vars.color.action.primary,
  background: vars.color.action.tint,
  borderRadius: vars.radius.full,
  padding: `2px ${vars.space.sm}`,
})

export const pcardSec = style({
  padding: vars.space.lg,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.sm,
})

export const pcardMeta = style({ fontSize: vars.text.sm, color: vars.color.text.secondary })

export const rmain = style({ minWidth: 0, display: 'flex', flexDirection: 'column', gap: vars.space.lg })

// Abas em pílula (rtab2) — trilho com fundo, item ativo preenchido de roxo.
export const rtabs2 = style({
  display: 'flex',
  gap: '2px',
  flexWrap: 'wrap',
  background: vars.color.bg.elevated,
  border: `${vars.border.hairline} solid ${vars.color.border.default}`,
  borderRadius: vars.radius.md,
  padding: vars.space.xs,
})

const rtab2Base = {
  appearance: 'none',
  border: 'none',
  background: 'transparent',
  fontFamily: vars.font.sans,
  fontWeight: vars.weight.semibold,
  fontSize: vars.text.sm,
  color: vars.color.text.secondary,
  padding: `${vars.space.sm} ${vars.space.md}`,
  borderRadius: vars.radius.sm,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: `background-color ${vars.motion.fast} ${vars.motion.ease}, color ${vars.motion.fast} ${vars.motion.ease}`,
  selectors: {
    '&:hover': { background: vars.color.bg.sunken, color: vars.color.text.primary },
    '&:focus-visible': { outline: `${vars.focusRing.width} solid ${vars.color.focus}`, outlineOffset: vars.focusRing.offset },
  },
} as const

export const rtab2 = style(rtab2Base)
export const rtab2Active = style([
  rtab2Base,
  { background: vars.color.action.primary, color: vars.color.action.fg, selectors: { '&:hover': { background: vars.color.action.hover, color: vars.color.action.fg } } },
])

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

// --- Timeline de atendimentos (RORAIMA_DESIGN) ---
export const timeline = style({ display: 'flex', flexDirection: 'column', listStyle: 'none', margin: 0, padding: 0 })

export const tlItem = style({ display: 'grid', gridTemplateColumns: '26px 1fr', gap: vars.space.md, paddingBottom: vars.space.lg })

export const tlRail = style({ display: 'flex', flexDirection: 'column', alignItems: 'center' })

export const tlDot = style({
  width: '26px',
  height: '26px',
  borderRadius: vars.radius.sm,
  background: vars.color.brand.gradient,
  color: vars.color.action.fg,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 'none',
  fontSize: vars.text.xs,
  fontWeight: vars.weight.bold,
})

export const tlThread = style({
  flex: 1,
  width: '2px',
  background: vars.color.border.default,
  marginTop: vars.space.xs,
  selectors: { [`${tlItem}:last-child &`]: { display: 'none' } },
})

export const tlCard = style({
  background: vars.color.bg.elevated,
  border: `${vars.border.hairline} solid ${vars.color.border.default}`,
  borderRadius: vars.radius.md,
  padding: `${vars.space.md} ${vars.space.md}`,
})

export const tlHead = style({ display: 'flex', alignItems: 'center', gap: vars.space.sm, flexWrap: 'wrap', marginBottom: vars.space.xs })
export const tlType = style({ fontWeight: vars.weight.semibold, fontSize: vars.text.sm, color: vars.color.text.primary })
export const tlDate = style({ marginLeft: 'auto', fontFamily: vars.font.mono, fontSize: vars.text.xs, color: vars.color.text.secondary })
export const tlBody = style({ fontSize: vars.text.sm, color: vars.color.text.body, lineHeight: vars.leading.normal })

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
