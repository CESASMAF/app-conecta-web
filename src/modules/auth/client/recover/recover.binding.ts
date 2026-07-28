// Binding Solid (ADR-0009) — carrega o recovery flow do Kratos p/ a tela de recuperação.
import { createAsync, query, useSearchParams } from '@solidjs/router'
import { getRecoveryFlowFn } from '../../server/recovery-flow.fn'

const recoveryFlowQuery = query((flowId: string | null) => getRecoveryFlowFn(flowId), 'auth:recovery-flow')

export function useRecoverBinding() {
  const [params] = useSearchParams()
  const flowId = (): string | null => {
    const v = params['flow']
    return typeof v === 'string' ? v : null
  }
  // deferStream: redirect de DOCUMENTO (302) no SSR em vez de client-side (ver login.binding).
  return { flow: createAsync(() => recoveryFlowQuery(flowId()), { deferStream: true }) }
}
