'use server'
// Server function (ADR-0009): roda SÓ no servidor (o client recebe um stub RPC). Carrega o login flow
// do Kratos para a tela de login. Sem `flow` → cria um no Kratos (redirect); com `flow` → lê e normaliza.
import { getRequestEvent } from 'solid-js/web'
import { redirect } from '@solidjs/router'
import { fetchLoginFlow, createLoginBrowserUrl } from '~/server/kratos'
import type { LoginFlowResult } from '~/shared/domain/login-flow'

export async function getLoginFlowFn(
  flowId: string | null,
  status?: string | null,
  returnTo?: string | null,
): Promise<LoginFlowResult> {
  // Telas terminais (não tocam o Kratos): confirmação de logout e acesso negado (403 sem papéis).
  if (status === 'logout') return { kind: 'logout' }
  if (status === 'denied') return { kind: 'denied' }
  if (!flowId) {
    // COM return_to = a consent-bridge nos mandou aqui (somos a UI do Kratos): cria o Kratos login flow,
    // que volta à bridge após o login p/ o Authorization Code (Hydra consent) fechar.
    if (returnTo) {
      let to: string
      try {
        to = createLoginBrowserUrl({ returnTo })
      } catch {
        return { kind: 'expired' } // Kratos não configurado → estado seguro
      }
      throw redirect(to)
    }
    // SEM return_to = usuário entrando do zero: inicia o OIDC no BFF (→ Hydra → bridge → volta aqui).
    throw redirect('/api/auth/login')
  }
  // Repassa os cookies do browser p/ o Kratos casar o flow (o cookie do flow vive no domínio do Kratos).
  const event = getRequestEvent()
  const cookie = event?.request.headers.get('cookie') ?? ''
  const view = await fetchLoginFlow(flowId, cookie)
  if (!view) return { kind: 'expired' } // flow expirado/inválido → tela de recomeço
  return { kind: 'flow', view }
}
