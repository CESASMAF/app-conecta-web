// Catálogo i18n (PT-BR) de domínios — usado pelos selects das features de escrita (003+).
import type { AppErrorKind } from '~/shared/http/app-error'

export const domainsMessages = {
  'domains.error.generic': 'Não foi possível carregar as opções. Tente novamente.',
  'domains.error.forbidden': 'Você não tem permissão para esta lista.',
  'domains.error.unavailable': 'Serviço temporariamente indisponível.',
} as const

export type DomainsTag = keyof typeof domainsMessages

export function domainsErrorTag(kind: AppErrorKind): DomainsTag {
  switch (kind) {
    case 'forbidden':
      return 'domains.error.forbidden'
    case 'dependencyUnavailable':
    case 'idpUnavailable':
      return 'domains.error.unavailable'
    default:
      return 'domains.error.generic'
  }
}

export const td = (tag: DomainsTag): string => domainsMessages[tag]
