// Envelopes padrão (ADR convenções; guia social-care §1). O BFF desembrulha o upstream e re-emite
// o envelope `{ data, meta }`. Tipos como referência; a validação de contrato é TypeBox nas rotas.

export type StandardResponse<T> = Readonly<{ data: T; meta: Readonly<{ timestamp: string }> }>

export type PaginatedMeta = Readonly<{
  pageSize: number
  totalCount: number
  hasMore: boolean
  nextCursor: string | null
  timestamp?: string
}>

export type PaginatedResponse<T> = Readonly<{ data: readonly T[]; meta: PaginatedMeta }>

export type ErrorEnvelope = Readonly<{ error: Readonly<{ code: string; message: string }> }>

// Type guard: o corpo é um envelope de erro do backend?
export function isErrorEnvelope(body: unknown): body is ErrorEnvelope {
  return (
    typeof body === 'object' &&
    body !== null &&
    'error' in body &&
    typeof (body as { error: unknown }).error === 'object' &&
    (body as { error: unknown }).error !== null &&
    'code' in (body as { error: { code: unknown } }).error
  )
}

// Carimba o `meta.timestamp` corrente (servidor).
export const nowMeta = (): { timestamp: string } => ({ timestamp: new Date().toISOString() })
