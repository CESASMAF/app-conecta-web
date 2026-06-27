'use server'
// Server functions do Cuidado Clínico + Proteção + Histórico (US5): ler (agregado/auditoria) + 5 escritas.
// Via app.handle (SSR-safe, sem leak), CSRF nas mutações. Erros como VALOR. As escritas devolvem só ack/id;
// o binding RE-LÊ o agregado (revalidate) p/ refletir o novo estado (estes endpoints não recompõem).
import { getRequestEvent } from 'solid-js/web'
import { app } from '~/server/app'
import { ok, err, type Result } from '~/shared/http/result'
import type { AppError } from '~/shared/http/app-error'
import { toUpstreamError } from '~/shared/http/upstream-error'
import type { PatientCare, AuditEntry } from '~/shared/domain/patient-care'
import type {
  AppointmentBody,
  IntakeBody,
  PlacementBody,
  ViolationBody,
  ReferralBody,
} from '../client/detail/care.view-model'

const enc = encodeURIComponent
const cookieHeader = (): string => getRequestEvent()?.request.headers.get('cookie') ?? ''

async function readJson(res: Response): Promise<unknown> {
  try {
    return await res.json()
  } catch {
    return null
  }
}

async function getCare(path: string): Promise<Result<unknown, AppError>> {
  const res = await app.handle(new Request(`http://internal${path}`, { headers: { cookie: cookieHeader() } }))
  const body = await readJson(res)
  if (!res.ok) return err(toUpstreamError(res.status, body))
  return ok((body as { data: unknown }).data)
}

async function mutate(method: string, path: string, payload?: unknown): Promise<Result<void, AppError>> {
  const res = await app.handle(
    new Request(`http://internal${path}`, {
      method,
      headers: { cookie: cookieHeader(), 'x-requested-with': 'fetch', ...(payload !== undefined ? { 'content-type': 'application/json' } : {}) },
      ...(payload !== undefined ? { body: JSON.stringify(payload) } : {}),
    }),
  )
  if (res.ok) return ok(undefined)
  return err(toUpstreamError(res.status, await readJson(res)))
}

export async function getCareFn(patientId: string): Promise<Result<PatientCare, AppError>> {
  const r = await getCare(`/api/patients/${enc(patientId)}/care`)
  return r.ok ? ok(r.value as PatientCare) : r
}

export async function getAuditTrailFn(patientId: string): Promise<Result<readonly AuditEntry[], AppError>> {
  const r = await getCare(`/api/patients/${enc(patientId)}/audit-trail?limit=50`)
  if (!r.ok) return r
  // Descarta `payload` (pode conter PII — LGPD); o client só exibe data + tipo + ator.
  const entries = (r.value as ReadonlyArray<Record<string, unknown>>).map((e) => ({
    id: String(e.id),
    eventType: String(e.eventType),
    actorId: (e.actorId ?? null) as string | null,
    occurredAt: String(e.occurredAt),
    recordedAt: String(e.recordedAt),
  }))
  return ok(entries)
}

export async function registerAppointmentFn(id: string, input: AppointmentBody): Promise<Result<void, AppError>> {
  return mutate('POST', `/api/patients/${enc(id)}/appointments`, input)
}
export async function updateIntakeFn(id: string, input: IntakeBody): Promise<Result<void, AppError>> {
  return mutate('PUT', `/api/patients/${enc(id)}/intake-info`, input)
}
export async function updatePlacementFn(id: string, input: PlacementBody): Promise<Result<void, AppError>> {
  return mutate('PUT', `/api/patients/${enc(id)}/placement-history`, input)
}
export async function reportViolationFn(id: string, input: ViolationBody): Promise<Result<void, AppError>> {
  return mutate('POST', `/api/patients/${enc(id)}/violation-reports`, input)
}
export async function createReferralFn(id: string, input: ReferralBody): Promise<Result<void, AppError>> {
  return mutate('POST', `/api/patients/${enc(id)}/referrals`, input)
}
