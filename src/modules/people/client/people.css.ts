// Estilos da área de Pessoas — vanilla-extract token-only (ADR-0007). Mobile-first.
// Reestilizado p/ casar com o protótipo hi-fi RORAIMA_DESIGN (Raros Boa Vista): reutiliza o kit
// compartilhado (panel/avatar/chip/btn/overline). Default = Modo Enxuto/HIG: superfícies chapadas
// (hairline antes de sombra), cor só no crítico (status).
import { style } from '@vanilla-extract/css'
import { vars } from '../../../shared/ui/tokens/theme.css'
import { btn, panel as kitPanel, avatar, chipStatus, overline } from '../../../shared/ui/kit.css'

// ---------------------------------------------------------------- Layout
export const wrap = style({ display: 'flex', flexDirection: 'column', gap: vars.space.lg, maxWidth: '720px' })
export const header = style({ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: vars.space.md, flexWrap: 'wrap' })
export const title = style({ fontSize: vars.text.xxl, fontWeight: vars.weight.bold, color: vars.color.text.primary, letterSpacing: vars.tracking.tight })
export const count = style({ fontSize: vars.text.sm, color: vars.color.text.secondary })
export const headerActions = style({ display: 'flex', alignItems: 'center', gap: vars.space.md })

export const back = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.xs,
  fontSize: vars.text.sm,
  fontWeight: vars.weight.medium,
  color: vars.color.text.secondary,
  textDecoration: 'none',
  alignSelf: 'flex-start',
  selectors: {
    '&:hover': { color: vars.color.action.primary },
    '&:focus-visible': { outline: `${vars.focusRing.width} solid ${vars.color.focus}`, outlineOffset: vars.focusRing.offset },
  },
})

// CTA principal (gradiente da marca) — aplicado em <A>.
export const newBtn = style([btn.gradient, { textDecoration: 'none' }])

export const searchInput = style({
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
    '&::placeholder': { color: vars.color.text.disabled },
    '&:focus-visible': { outline: `${vars.focusRing.width} solid ${vars.color.focus}`, outlineOffset: vars.focusRing.offset },
  },
})

// ---------------------------------------------------------------- Lista (att-row)
// Linha = avatar (iniciais) + nome/meta + status à direita.
export const list = style({ display: 'flex', flexDirection: 'column', gap: vars.space.sm, listStyle: 'none', margin: 0, padding: 0 })

export const row = style({
  display: 'grid',
  gridTemplateColumns: 'auto 1fr auto',
  alignItems: 'center',
  gap: vars.space.md,
  padding: vars.space.md,
  borderRadius: vars.radius.card,
  border: `${vars.border.hairline} solid ${vars.color.border.default}`,
  background: vars.color.bg.elevated,
  textDecoration: 'none',
  color: 'inherit',
  transition: `border-color ${vars.motion.fast} ${vars.motion.ease}, box-shadow ${vars.motion.fast} ${vars.motion.ease}`,
  selectors: {
    '&:hover': { borderColor: vars.color.action.tint, boxShadow: vars.shadow.sm },
    '&:focus-visible': { outline: `${vars.focusRing.width} solid ${vars.color.focus}`, outlineOffset: vars.focusRing.offset },
  },
})

// Avatar da linha (iniciais dentro) — reaproveita o primitivo do kit.
export const avatarCell = avatar.md
export const rowMain = style({ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 })
export const name = style({
  fontSize: vars.text.base,
  fontWeight: vars.weight.semibold,
  color: vars.color.text.primary,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
})
export const sub = style({ fontSize: vars.text.sm, color: vars.color.text.secondary })

// Status = significado. Ativo → acolhido (verde discreto); inativo → neutro sóbrio.
export const badge = chipStatus.acolhido
export const badgeOff = chipStatus.neutral

export const muted = style({ color: vars.color.text.secondary, fontSize: vars.text.sm })
export const sentinel = style({ height: '1px', width: '100%' })
export const loadMoreBtn = style([btn.ghost, { alignSelf: 'center' }])

// ---------------------------------------------------------------- Detalhe
export const detailHeader = style({ display: 'flex', alignItems: 'center', gap: vars.space.md, flexWrap: 'wrap' })
export const avatarLg = avatar.lg

// Micro-rótulo de seção (aparência de overline do kit).
export const sectionTitle = style([overline, { color: vars.color.text.secondary }])
export const sectionHead = style({ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: vars.space.md, marginTop: vars.space.lg })

// Grade chave/valor (dados da pessoa).
export const dgrid = style({ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: vars.space.md })
export const dfield = style({ display: 'flex', flexDirection: 'column', gap: vars.space.xs, minWidth: 0 })
export const dlabel = style([overline])
export const dvalue = style({ fontSize: vars.text.base, fontWeight: vars.weight.medium, color: vars.color.text.primary })

// ---------------------------------------------------------------- Forms + cartões
export const form = style({ display: 'flex', flexDirection: 'column', gap: vars.space.lg })

// Cartão (panel do kit) com padding/coluna — serve p/ seções, edição e alerts.
export const panel = style([
  kitPanel,
  { display: 'flex', flexDirection: 'column', gap: vars.space.md, padding: vars.space.lg },
])

export const actions = style({ display: 'flex', justifyContent: 'flex-end', gap: vars.space.sm, marginTop: vars.space.sm })
export const rowActions = style({ display: 'flex', gap: vars.space.sm, flexWrap: 'wrap', alignItems: 'center' })

// Pergunta da confirmacao em dois passos (desativar / redefinir senha) — fica na propria linha de
// acoes, nomeando a pessoa, para que "Confirmar" nunca seja um sim no escuro.
export const confirmText = style({
  fontSize: vars.text.sm,
  color: vars.color.text.primary,
  fontWeight: vars.weight.bold,
})

export const btnPrimary = style([btn.gradient, { textDecoration: 'none' }])
export const btnGhost = style([btn.ghost, { textDecoration: 'none' }])

export const linkBtn = style({
  appearance: 'none',
  background: 'none',
  border: 'none',
  padding: 0,
  fontSize: vars.text.sm,
  fontWeight: vars.weight.medium,
  color: vars.color.action.primary,
  cursor: 'pointer',
  selectors: {
    '&:hover:not(:disabled)': { color: vars.color.action.hover, textDecoration: 'underline' },
    '&:disabled': { opacity: 0.5, cursor: 'progress' },
    '&:focus-visible': { outline: `${vars.focusRing.width} solid ${vars.color.focus}`, outlineOffset: vars.focusRing.offset },
  },
})

export const roleRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space.md,
  padding: `${vars.space.md} 0`,
  borderBottom: `${vars.border.hairline} solid ${vars.color.border.soft}`,
})

// ---------------------------------------------------------------- Feedback
export const errorBanner = style({
  padding: `${vars.space.md} ${vars.space.lg}`,
  borderRadius: vars.radius.md,
  background: vars.color.dangerBg,
  border: `${vars.border.hairline} solid ${vars.color.dangerBorder}`,
  color: vars.color.danger,
  fontSize: vars.text.sm,
  fontWeight: vars.weight.medium,
})
export const warnBanner = style({
  padding: `${vars.space.md} ${vars.space.lg}`,
  borderRadius: vars.radius.md,
  background: vars.color.bg.sunken,
  border: `${vars.border.hairline} solid ${vars.color.border.default}`,
  color: vars.color.text.body,
  fontSize: vars.text.sm,
})
export const fieldError = style({ fontSize: vars.text.xs, color: vars.color.danger, fontWeight: vars.weight.medium })
