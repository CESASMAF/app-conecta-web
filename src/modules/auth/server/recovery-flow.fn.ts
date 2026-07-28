'use server'
// Server function (ADR-0009): carrega o recovery flow do Kratos ("esqueci minha senha").
// Sem `flow` → cria um no Kratos (redirect); com `flow` → lê e normaliza (fase e-mail ou código).
import { getRequestEvent } from 'solid-js/web'
import { redirect } from '@solidjs/router'
import { fetchRecoveryFlow, createRecoveryBrowserUrl } from '~/server/kratos'
import type { RecoveryFlowResult } from '~/shared/domain/login-flow'

export async function getRecoveryFlowFn(flowId: string | null): Promise<RecoveryFlowResult> {
  if (!flowId) {
    let to: string
    try {
      to = createRecoveryBrowserUrl()
    } catch {
      return { kind: 'expired' }
    }
    throw redirect(to)
  }
  const event = getRequestEvent()
  const cookie = event?.request.headers.get('cookie') ?? ''
  const view = await fetchRecoveryFlow(flowId, cookie)
  if (!view) return { kind: 'expired' }
  return { kind: 'flow', view }
}
