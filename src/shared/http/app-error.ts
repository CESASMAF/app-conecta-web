// AppError — a UI decide por SEMÂNTICA (kind), nunca por status HTTP (ADR-0002).
// `code` preserva o código estruturado do backend (AUTH-xxx, PEO-xxx...) para observabilidade.
export type AppErrorKind =
  | 'unauthorized' // sessão ausente/expirada → re-login
  | 'forbidden' // sem permissão
  | 'validation' // input inválido
  | 'notFound'
  | 'conflict'
  | 'idpUnavailable' // falha de comunicação com o IdP
  | 'dependencyUnavailable' // dependência de dados upstream fora (ex.: social-care/people-context 503)
  | 'csrf' // mutação sem X-Requested-With
  | 'state' // pkce/state inválido no callback
  | 'unknown'

export type AppError = Readonly<{
  kind: AppErrorKind
  code: string
  requestId?: string
}>

export const appError = (kind: AppErrorKind, code: string, requestId?: string): AppError =>
  requestId === undefined ? { kind, code } : { kind, code, requestId }

// Discrimina por status HTTP (mais estável que o slug do backend).
export function kindFromHttpStatus(status: number): AppErrorKind {
  if (status === 401) return 'unauthorized'
  if (status === 403) return 'forbidden'
  if (status === 404) return 'notFound'
  if (status === 409) return 'conflict'
  if (status === 422 || status === 400) return 'validation'
  if (status === 502 || status === 503) return 'idpUnavailable'
  return 'unknown'
}
