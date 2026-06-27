'use server'
// Server function (D11, espelha getCurrentUserFn): SSR-safe, roda só no servidor (RPC no browser) →
// `~/server/app` fora do bundle do client (Princ. I). Chama a rota BFF via app.handle (sem hop HTTP),
// encaminhando o cookie de sessão. Devolve `Result<PatientPage, AppError>` (Princ. II).
import { getRequestEvent } from 'solid-js/web'
import { app } from '~/server/app'
import { ok, err, type Result } from '~/shared/http/result'
import type { AppError } from '~/shared/http/app-error'
import { toUpstreamError } from '~/shared/http/upstream-error'
import type { PatientPage, PageMeta, PatientSummary } from '~/shared/domain/patient'

export type ListPatientsInput = Readonly<{ search?: string; status?: string; cursor?: string; limit?: number }>

export async function listPatientsFn(input: ListPatientsInput): Promise<Result<PatientPage, AppError>> {
  const cookie = getRequestEvent()?.request.headers.get('cookie') ?? ''
  const qs = new URLSearchParams()
  if (input.search) qs.set('search', input.search)
  if (input.status) qs.set('status', input.status)
  if (input.cursor) qs.set('cursor', input.cursor)
  qs.set('limit', String(input.limit ?? 20))
  const res = await app.handle(
    new Request(`http://internal/api/patients?${qs.toString()}`, { headers: { cookie } }),
  )
  let body: unknown = null
  try {
    body = await res.json()
  } catch {
    /* corpo vazio/não-JSON */
  }
  if (!res.ok) return err(toUpstreamError(res.status, body))
  const env = body as { data: readonly PatientSummary[]; meta: PageMeta }
  return ok({ items: env.data, meta: env.meta })
}
