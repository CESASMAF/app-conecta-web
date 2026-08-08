// Binding Solid (ADR-0009) — único ponto reativo da tela de erro. Lê o `?id=` que o
// Kratos põe na URL e busca o detalhe pela server fn.
import { createAsync, query, useSearchParams } from '@solidjs/router'
import { getFlowErrorFn } from '../../server/flow-error.fn'

const flowErrorQuery = query((id: string | null) => getFlowErrorFn(id), 'auth:flow-error')

export function useErrorBinding() {
  const [params] = useSearchParams()
  const errorId = (): string | null => {
    const v = params['id']
    return typeof v === 'string' && v ? v : null
  }
  // deferStream: resolve ANTES do flush do SSR. Aqui não há redirect a preservar, mas a
  // página existe para ser LIDA — servir o esqueleto e preencher depois faria a tela de
  // erro piscar "carregando" no exato momento em que a pessoa precisa de uma resposta.
  return {
    result: createAsync(() => flowErrorQuery(errorId()), { deferStream: true }),
    errorId,
  }
}
