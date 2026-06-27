// ViewModel PURO do login (ADR-0009) — sem Solid; testável em bun:test.
// Login é OIDC redirect-based: a "ação" é navegar p/ o BFF (/api/auth/login), nao uma mutation.
import { sanitizeRedirectPath } from '~/shared/http/safe-redirect'
import type { AuthTag } from '~/shared/i18n/auth'

export const loginViewModel = {
  // href para iniciar o login no BFF, preservando (saneado) o destino pretendido.
  loginHref: (redirectTo?: string | null): string => {
    const safe = sanitizeRedirectPath(redirectTo, '/')
    return safe === '/' ? '/api/auth/login' : `/api/auth/login?redirect=${encodeURIComponent(safe)}`
  },

  // mapeia o ?error=<kind> (retorno de um callback falho) para uma tag i18n GENÉRICA (anti-enumeração).
  toErrorTag: (errorParam: string | null | undefined): AuthTag | null => {
    if (!errorParam) return null
    switch (errorParam) {
      case 'idp':
        return 'auth.error.idp'
      case 'state':
        return 'auth.error.state'
      case 'session':
        return 'auth.error.unauthorized'
      default:
        return 'auth.error.generic'
    }
  },
}
