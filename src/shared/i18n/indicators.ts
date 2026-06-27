// Catálogo i18n (PT-BR) do painel de Indicadores (Donos).
import type { AppErrorKind } from '~/shared/http/app-error'

export const indicatorsMessages = {
  'indicators.title': 'Indicadores',
  'indicators.axis': 'Eixo',
  'indicators.periodStart': 'Início (AAAA-MM)',
  'indicators.periodEnd': 'Fim (AAAA-MM)',
  'indicators.apply': 'Aplicar',
  'indicators.empty': 'Sem dados para o período/eixo selecionado.',
  'indicators.period.invalid': 'Informe o período no formato AAAA-MM (início ≤ fim).',
  'indicators.col.value': 'Valor',
  'indicators.col.period': 'Período',
  'indicators.kanon': 'Privacidade (K-anonimato)',
  'indicators.kanon.note': 'Grupos com menos de {k} registros são suprimidos para proteger a identidade. Suprimidos: {n}.',
  'indicators.error.forbidden': 'Acesso restrito a analistas/donos.',
  'indicators.error.unavailable': 'Serviço de indicadores indisponível. Tente novamente.',
  'indicators.error.generic': 'Não foi possível carregar os indicadores. Tente novamente.',
} as const

export type IndicatorsTag = keyof typeof indicatorsMessages
export const tpi = (tag: IndicatorsTag): string => indicatorsMessages[tag]

export function indicatorsErrorTag(kind: AppErrorKind): IndicatorsTag {
  switch (kind) {
    case 'forbidden':
      return 'indicators.error.forbidden'
    case 'dependencyUnavailable':
    case 'idpUnavailable':
      return 'indicators.error.unavailable'
    default:
      return 'indicators.error.generic'
  }
}
