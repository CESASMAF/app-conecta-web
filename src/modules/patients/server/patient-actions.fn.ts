'use server'
// Server functions das AÇÕES do Resumo (US3): cada mutação via app.handle (SSR-safe, sem leak), com CSRF
// (X-Requested-With) e cookie de sessão. TODAS devolvem o overview view-ready RECOMPOSTO pelo BFF — o
// client troca o estado sem refetch (ADR-0010 §3 / FR-009). Erros como VALOR (Princ. II).
import { getRequestEvent } from 'solid-js/web'
import { app } from '~/server/app'
import { ok, err, type Result } from '~/shared/http/result'
import type { AppError } from '~/shared/http/app-error'
import { toUpstreamError } from '~/shared/http/upstream-error'
import type { PatientOverview } from '~/shared/domain/patient-overview'
import type { AddMemberBody, SocialIdentityBody } from '../client/detail/resumo-actions.view-model'

const enc = encodeURIComponent

async function mutate(method: string, path: string, body?: unknown): Promise<Result<PatientOverview, AppError>> {
  const cookie = getRequestEvent()?.request.headers.get('cookie') ?? ''
  const res = await app.handle(
    new Request(`http://internal${path}`, {
      method,
      headers: {
        cookie,
        'x-requested-with': 'fetch',
        ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    }),
  )
  let parsed: unknown = null
  try {
    parsed = await res.json()
  } catch {
    /* corpo vazio/não-JSON */
  }
  if (!res.ok) return err(toUpstreamError(res.status, parsed))
  return ok((parsed as { data: PatientOverview }).data)
}

// --- Ciclo de vida ---
export async function admitPatientFn(id: string): Promise<Result<PatientOverview, AppError>> {
  return mutate('POST', `/api/patients/${enc(id)}/admit`)
}
export async function dischargePatientFn(id: string, input: { reason: string; notes?: string }): Promise<Result<PatientOverview, AppError>> {
  return mutate('POST', `/api/patients/${enc(id)}/discharge`, input)
}
export async function readmitPatientFn(id: string, input: { notes?: string }): Promise<Result<PatientOverview, AppError>> {
  return mutate('POST', `/api/patients/${enc(id)}/readmit`, input)
}
export async function withdrawPatientFn(id: string, input: { reason: string; notes?: string }): Promise<Result<PatientOverview, AppError>> {
  return mutate('POST', `/api/patients/${enc(id)}/withdraw`, input)
}

// --- Núcleo familiar ---
export async function addFamilyMemberFn(id: string, input: AddMemberBody): Promise<Result<PatientOverview, AppError>> {
  return mutate('POST', `/api/patients/${enc(id)}/family-members`, input)
}
export async function removeFamilyMemberFn(id: string, memberId: string): Promise<Result<PatientOverview, AppError>> {
  return mutate('DELETE', `/api/patients/${enc(id)}/family-members/${enc(memberId)}`)
}
export async function setPrimaryCaregiverFn(id: string, memberPersonId: string): Promise<Result<PatientOverview, AppError>> {
  return mutate('PUT', `/api/patients/${enc(id)}/primary-caregiver`, { memberPersonId })
}

// --- Identidade social ---
export async function updateSocialIdentityFn(id: string, input: SocialIdentityBody): Promise<Result<PatientOverview, AppError>> {
  return mutate('PUT', `/api/patients/${enc(id)}/social-identity`, input)
}
