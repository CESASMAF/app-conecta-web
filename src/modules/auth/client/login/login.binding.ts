// Binding Solid (ADR-0009) — único ponto reativo. Carrega o login flow do Kratos (server fn) e
// resolve a mensagem de erro do ?error via i18n. Trocar Solid = reescrever só aqui.
import { createAsync, query, useSearchParams } from '@solidjs/router'
import { getLoginFlowFn } from '../../server/login-flow.fn'
import { loginViewModel } from './login.view-model'
import { t } from '~/shared/i18n/auth'

const loginFlowQuery = query(
  (arg: { flowId: string | null; status: string | null; returnTo: string | null }) =>
    getLoginFlowFn(arg.flowId, arg.status, arg.returnTo),
  'auth:login-flow',
)

export function useLoginBinding() {
  const [params] = useSearchParams()
  const param = (k: string): string | null => {
    const v = params[k]
    return typeof v === 'string' ? v : null
  }
  // deferStream: espera o loader resolver ANTES de dar flush no SSR → um `throw redirect` vira
  // redirect de DOCUMENTO (302), não client-side. Essencial p/ a cadeia OIDC↔Kratos fechar sem JS.
  const flow = createAsync(
    () => loginFlowQuery({ flowId: param('flow'), status: param('status'), returnTo: param('return_to') }),
    { deferStream: true },
  )
  return {
    flow, // () => LoginFlowResult | undefined (undefined = carregando/redirecionando)
    errorMessage: (): string | null => {
      const tag = loginViewModel.toErrorTag(param('error'))
      return tag ? t(tag) : null
    },
  }
}
