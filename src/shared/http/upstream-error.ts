// Mapa de erro UNIFICADO dos upstreams (social-care · people-context · analysis-bi) → AppError como
// VALOR (Princ. II — UI decide por semântica). O `kind` vem do STATUS (estável entre serviços); o
// `code` estruturado é preservado para observabilidade. Cobre os formatos de envelope distintos:
// `{error:{code}}` (social-care), `{success:false,error:{code}}` (people-context) e `{code}` no topo.
// Difere do auth `kindFromHttpStatus`: 5xx upstream é dependência de dados fora (`dependencyUnavailable`).
import { appError, type AppError, type AppErrorKind } from './app-error'
import { isErrorEnvelope } from './envelope'

function kindForStatus(status: number): AppErrorKind {
  if (status === 401) return 'unauthorized'
  if (status === 403) return 'forbidden'
  if (status === 404) return 'notFound'
  if (status === 409) return 'conflict'
  if (status === 400 || status === 422) return 'validation'
  if (status === 502 || status === 503 || status === 504) return 'dependencyUnavailable'
  return 'unknown'
}

// Extrai o código estruturado do corpo de erro, tolerando os 3 formatos dos backends.
function extractCode(body: unknown, status: number): string {
  if (isErrorEnvelope(body)) return body.error.code // {error:{code}} e {success:false,error:{code}}
  if (
    typeof body === 'object' &&
    body !== null &&
    'code' in body &&
    typeof (body as { code: unknown }).code === 'string'
  ) {
    return (body as { code: string }).code // {code} no topo (variação observada do social-care)
  }
  return `UPSTREAM-${status}`
}

// Resposta upstream NÃO-ok (status + corpo) → AppError. Nunca vaza URL/stack — só kind + code.
export function toUpstreamError(status: number, body: unknown, requestId?: string): AppError {
  return appError(kindForStatus(status), extractCode(body, status), requestId)
}

// Falha de transporte (fetch rejeitou / timeout) → tratada como dependência fora.
export function toTransportError(requestId?: string): AppError {
  return appError('dependencyUnavailable', 'UPSTREAM-NETWORK', requestId)
}
