'use server'
// Server functions da Avaliação (US4): ler o estado das 7 seções + salvar uma seção. Via app.handle
// (SSR-safe, sem leak), CSRF nas mutações. Erros como VALOR (Princ. II).
import { getRequestEvent } from 'solid-js/web'
import { app } from '~/server/app'
import { ok, err, type Result } from '~/shared/http/result'
import type { AppError } from '~/shared/http/app-error'
import { toUpstreamError } from '~/shared/http/upstream-error'
import type { PatientAssessment, AssessmentSectionKey } from '~/shared/domain/patient-assessment'

const enc = encodeURIComponent

// Caminho REST de cada seção (= a chave da seção em kebab-case do contrato).
const SECTION_PATH: Record<AssessmentSectionKey, string> = {
  housingCondition: 'housing-condition',
  socioeconomicSituation: 'socioeconomic-situation',
  workAndIncome: 'work-and-income',
  educationalStatus: 'educational-status',
  healthStatus: 'health-status',
  communitySupportNetwork: 'community-support-network',
  socialHealthSummary: 'social-health-summary',
}

export async function getAssessmentFn(patientId: string): Promise<Result<PatientAssessment, AppError>> {
  const cookie = getRequestEvent()?.request.headers.get('cookie') ?? ''
  const res = await app.handle(new Request(`http://internal/api/patients/${enc(patientId)}/assessment`, { headers: { cookie } }))
  let body: unknown = null
  try {
    body = await res.json()
  } catch {
    /* corpo vazio/não-JSON */
  }
  if (!res.ok) return err(toUpstreamError(res.status, body))
  return ok((body as { data: PatientAssessment }).data)
}

// Salva uma seção (PUT). O backend devolve um ack; o client usa o próprio form enviado p/ refletir o estado.
export async function saveAssessmentSectionFn(
  patientId: string,
  section: AssessmentSectionKey,
  payload: unknown,
): Promise<Result<void, AppError>> {
  const cookie = getRequestEvent()?.request.headers.get('cookie') ?? ''
  const res = await app.handle(
    new Request(`http://internal/api/patients/${enc(patientId)}/${SECTION_PATH[section]}`, {
      method: 'PUT',
      headers: { cookie, 'x-requested-with': 'fetch', 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  )
  if (res.ok) return ok(undefined)
  let body: unknown = null
  try {
    body = await res.json()
  } catch {
    /* corpo vazio */
  }
  return err(toUpstreamError(res.status, body))
}
