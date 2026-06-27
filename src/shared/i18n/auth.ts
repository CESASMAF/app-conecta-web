// Catálogo i18n (PT-BR) de auth — mensagens GENÉRICAS (anti-enumeração de usuários).
// FR-009 / SC-007. Fonte das tags consumidas por `errorTag` da ViewModel (ADR-0009).
// Redação final é da P.O. (@lekadecastro) — estes são placeholders aceitáveis no MVP.
import type { AppErrorKind } from '~/shared/http/app-error'

export const authMessages = {
  'auth.error.generic': 'Não foi possível concluir. Verifique os dados e tente novamente.',
  'auth.error.unauthorized': 'Sua sessão expirou. Entre novamente.',
  'auth.error.forbidden': 'Você não tem permissão para esta ação.',
  'auth.error.idp': 'Falha de comunicação com o provedor de identidade — tente novamente.',
  'auth.error.state': 'Sua sessão de login expirou. Tente entrar novamente.',
  'auth.error.csrf': 'Requisição inválida. Recarregue a página e tente novamente.',
} as const

export type AuthTag = keyof typeof authMessages

// Mapeia o kind do AppError para uma tag i18n — credencial inválida cai no GENÉRICO.
export function authErrorTag(kind: AppErrorKind): AuthTag {
  switch (kind) {
    case 'unauthorized':
      return 'auth.error.unauthorized'
    case 'forbidden':
      return 'auth.error.forbidden'
    case 'idpUnavailable':
      return 'auth.error.idp'
    case 'state':
      return 'auth.error.state'
    case 'csrf':
      return 'auth.error.csrf'
    case 'validation':
    case 'notFound':
    case 'conflict':
    case 'dependencyUnavailable':
    case 'unknown':
      return 'auth.error.generic'
  }
}

export const t = (tag: AuthTag): string => authMessages[tag]
