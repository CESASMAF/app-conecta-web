// Binding Solid (ADR-0009) — único ponto que toca a reatividade. Lê os search params e expõe
// o href de login + a mensagem de erro (já resolvida via i18n). Trocar Solid = reescrever só aqui.
import { useSearchParams } from '@solidjs/router'
import { loginViewModel } from './login.view-model'
import { t } from '~/shared/i18n/auth'

export function useLoginBinding() {
  const [params] = useSearchParams()
  const param = (k: string): string | null => {
    const v = params[k]
    return typeof v === 'string' ? v : null
  }
  return {
    loginHref: (): string => loginViewModel.loginHref(param('redirect')),
    errorMessage: (): string | null => {
      const tag = loginViewModel.toErrorTag(param('error'))
      return tag ? t(tag) : null
    },
  }
}
