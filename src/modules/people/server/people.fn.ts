'use server'
// Server functions da área de Pessoas (Admin/RH): leitura (lista, visão, papéis) + mutações. Via app.handle
// (SSR-safe, sem leak), CSRF nas mutações. Erros como VALOR. Mutações não recompõem → o binding re-lê.
import { getRequestEvent } from 'solid-js/web'
import { app } from '~/server/app'
import { ok, err, type Result } from '~/shared/http/result'
import { appError, type AppError } from '~/shared/http/app-error'
import { toUpstreamError } from '~/shared/http/upstream-error'
import type { PersonPage, PersonSummary, PersonPageMeta, PersonOverview, PersonRole } from '~/shared/domain/person'
import type { PersonCreateBody, PersonUpdateBody, AssignRoleBody } from '../client/person-form.view-model'

const enc = encodeURIComponent
const cookieHeader = (): string => getRequestEvent()?.request.headers.get('cookie') ?? ''
const readJson = async (res: Response): Promise<unknown> => {
  try {
    return await res.json()
  } catch {
    return null
  }
}

async function get(path: string): Promise<Result<unknown, AppError>> {
  const res = await app.handle(new Request(`http://internal${path}`, { headers: { cookie: cookieHeader() } }))
  const body = await readJson(res)
  if (!res.ok) return err(toUpstreamError(res.status, body))
  return ok(body)
}

async function mutate(method: string, path: string, payload?: unknown): Promise<Result<unknown, AppError>> {
  const res = await app.handle(
    new Request(`http://internal${path}`, {
      method,
      headers: { cookie: cookieHeader(), 'x-requested-with': 'fetch', ...(payload !== undefined ? { 'content-type': 'application/json' } : {}) },
      ...(payload !== undefined ? { body: JSON.stringify(payload) } : {}),
    }),
  )
  const body = await readJson(res)
  if (!res.ok) return err(toUpstreamError(res.status, body))
  return ok((body as { data?: unknown })?.data ?? null)
}

export type ListPeopleInput = Readonly<{ search?: string; cursor?: string; limit?: number }>
export async function peopleListFn(input: ListPeopleInput): Promise<Result<PersonPage, AppError>> {
  const qs = new URLSearchParams()
  if (input.search) qs.set('search', input.search)
  if (input.cursor) qs.set('cursor', input.cursor)
  qs.set('limit', String(input.limit ?? 20))
  const r = await get(`/api/people?${qs.toString()}`)
  if (!r.ok) return r
  const envp = r.value as { data: readonly PersonSummary[]; meta: PersonPageMeta }
  return ok({ items: envp.data, meta: envp.meta })
}

export async function getPersonFn(id: string): Promise<Result<PersonOverview, AppError>> {
  if (id.trim() === '') return err(appError('notFound', 'PEO-EMPTY'))
  const r = await get(`/api/people/${enc(id)}`)
  if (!r.ok) return r
  const d = (r.value as { data: PersonOverview }).data
  return ok({ id: d.id, fullName: d.fullName, birthDate: d.birthDate, active: d.active, partial: d.partial })
}

export async function getPersonRolesFn(id: string): Promise<Result<readonly PersonRole[], AppError>> {
  const r = await get(`/api/people/${enc(id)}/roles`)
  if (!r.ok) return r
  const rows = (r.value as { data: ReadonlyArray<Record<string, unknown>> }).data
  return ok(rows.map((x) => ({ id: String(x.id), system: String(x.system), role: String(x.role), active: Boolean(x.active) })))
}

// --- Mutações ---
export async function createPersonFn(input: PersonCreateBody): Promise<Result<{ id: string; idpProvisioned: boolean }, AppError>> {
  const r = await mutate('POST', '/api/people', input)
  if (!r.ok) return r
  const d = r.value as { id: string; idpProvisioned: boolean }
  return ok({ id: d.id, idpProvisioned: d.idpProvisioned })
}
export async function updatePersonFn(id: string, input: PersonUpdateBody): Promise<Result<void, AppError>> {
  const r = await mutate('PUT', `/api/people/${enc(id)}`, input)
  return r.ok ? ok(undefined) : r
}
export async function setPersonActiveFn(id: string, active: boolean): Promise<Result<void, AppError>> {
  const r = await mutate('PUT', `/api/people/${enc(id)}/${active ? 'reactivate' : 'deactivate'}`)
  return r.ok ? ok(undefined) : r
}
export async function requestPasswordResetFn(id: string): Promise<Result<void, AppError>> {
  const r = await mutate('POST', `/api/people/${enc(id)}/request-password-reset`)
  return r.ok ? ok(undefined) : r
}
export async function assignRoleFn(id: string, input: AssignRoleBody): Promise<Result<void, AppError>> {
  const r = await mutate('POST', `/api/people/${enc(id)}/roles`, input)
  return r.ok ? ok(undefined) : r
}
export async function setRoleActiveFn(id: string, roleId: string, active: boolean): Promise<Result<void, AppError>> {
  const r = await mutate('PUT', `/api/people/${enc(id)}/roles/${enc(roleId)}/${active ? 'reactivate' : 'deactivate'}`)
  return r.ok ? ok(undefined) : r
}
