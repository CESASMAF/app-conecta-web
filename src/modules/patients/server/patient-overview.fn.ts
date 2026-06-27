'use server'
// Server function do prontuário (D11): lê a visão composta view-ready (overview) via app.handle —
// SSR-safe, sem leak de token/URL ao browser. Mesmo padrão de server-fn de leitura da 002.
import { getRequestEvent } from 'solid-js/web'
import { app } from '~/server/app'
import { ok, err, type Result } from '~/shared/http/result'
import { appError, type AppError } from '~/shared/http/app-error'
import { toUpstreamError } from '~/shared/http/upstream-error'
import type { PatientOverview } from '~/shared/domain/patient-overview'

export async function getPatientOverviewFn(patientId: string): Promise<Result<PatientOverview, AppError>> {
  if (patientId.trim() === '') return err(appError('notFound', 'PAT-EMPTY'))
  const cookie = getRequestEvent()?.request.headers.get('cookie') ?? ''
  const res = await app.handle(
    new Request(`http://internal/api/patients/${encodeURIComponent(patientId)}/overview`, { headers: { cookie } }),
  )
  let body: unknown = null
  try {
    body = await res.json()
  } catch {
    /* corpo vazio/não-JSON */
  }
  if (!res.ok) return err(toUpstreamError(res.status, body))
  return ok((body as { data: PatientOverview }).data)
}
