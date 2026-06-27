'use server'
// Server function do cadastro (D11): MUTAÇÃO via app.handle — SSR-safe, sem leak de token/URL ao browser.
// Encaminha o cookie de sessão e injeta o header CSRF (X-Requested-With) que o BFF exige nas mutações
// (sem origin → a checagem same-origin passa numa chamada interna). Devolve o overview view-ready (Princ. II).
import { getRequestEvent } from 'solid-js/web'
import { app } from '~/server/app'
import { ok, err, type Result } from '~/shared/http/result'
import type { AppError } from '~/shared/http/app-error'
import { toUpstreamError } from '~/shared/http/upstream-error'
import type { PatientOverview } from '~/shared/domain/patient-overview'
import type { RegisterPatientBody } from '../client/create/patient-create.view-model'

export async function registerPatientFn(input: RegisterPatientBody): Promise<Result<PatientOverview, AppError>> {
  const cookie = getRequestEvent()?.request.headers.get('cookie') ?? ''
  const res = await app.handle(
    new Request('http://internal/api/patients', {
      method: 'POST',
      headers: { cookie, 'x-requested-with': 'fetch', 'content-type': 'application/json' },
      body: JSON.stringify(input),
    }),
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
