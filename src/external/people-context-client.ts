// Adapter HTTP outbound ao people-context (server-only — Princ. I). `fetch` nativo + Bearer + timeout.
// POLÍTICA DE ATOR (difere do social-care!): nas MUTAÇÕES o BFF envia `X-Actor-Id` = sub validado da
// sessão (ADR-023 do people-context). Em leitura, não envia. Erros como VALOR (Princ. II).
// Porta injetável em AppDeps → fakeada nos contract tests (sem mock em src/ — Princ. VI).
import { env } from '~/server/env'
import { ok, err, type Result } from '~/shared/http/result'
import type { AppError } from '~/shared/http/app-error'
import { toUpstreamError, toTransportError } from '~/shared/http/upstream-error'
import type { StandardResponse, PaginatedResponse } from '~/shared/http/envelope'
import { withTimeout } from '~/shared/with-timeout'

const TIMEOUT_MS = 8_000

export type PersonRecord = Readonly<{ id: string; fullName: string; birthDate: string; active: boolean }>
export type PersonPage = Readonly<{
  items: readonly PersonRecord[]
  meta: Readonly<{ pageSize: number; totalCount: number; hasMore: boolean; nextCursor: string | null }>
}>
export type ListPeopleParams = Readonly<{ search?: string; cursor?: string; limit: number }>
export type CreatePersonInput = Readonly<{
  fullName: string
  birthDate: string
  cpf?: string
  email?: string
  createLogin?: boolean
  initialPassword?: string
}>
export type UpdatePersonInput = Readonly<{ fullName: string; birthDate: string; cpf?: string; email?: string }>
export type ProvisionLoginInput = Readonly<{ email?: string; initialPassword?: string }>
export type CreatePersonResult = Readonly<{ id: string; idpProvisioned: boolean }> // 207 = criado, IdP falhou
export type Role = Readonly<{
  id: string
  personId: string
  system: string
  role: string
  active: boolean
  assignedAt: string
}>
export type ListRolesParams = Readonly<{ system: string; role?: string; active?: boolean }>
export type RoleQueryResult = Readonly<{ person: PersonRecord; role: Role }>
export type AssignRoleInput = Readonly<{ system: string; role: string }>
export type AssignRoleResult = Readonly<{ id: string | null; created: boolean }>
export type ReconciliationReport = Readonly<{ checked: number; inSync: number; fixed: unknown[]; errors: unknown[] }>

export interface PeopleContextClient {
  // leitura (sem ator)
  listPeople(token: string, params: ListPeopleParams): Promise<Result<PersonPage, AppError>>
  getPerson(token: string, personId: string): Promise<Result<PersonRecord, AppError>>
  getByCpf(token: string, cpf: string): Promise<Result<PersonRecord, AppError>>
  getRoles(token: string, personId: string, active?: boolean): Promise<Result<readonly Role[], AppError>>
  listRoles(token: string, params: ListRolesParams): Promise<Result<readonly RoleQueryResult[], AppError>>
  // escrita (X-Actor-Id = sub)
  createPerson(token: string, actorId: string, input: CreatePersonInput): Promise<Result<CreatePersonResult, AppError>>
  updatePerson(token: string, actorId: string, personId: string, input: UpdatePersonInput): Promise<Result<void, AppError>>
  deactivatePerson(token: string, actorId: string, personId: string): Promise<Result<void, AppError>>
  reactivatePerson(token: string, actorId: string, personId: string): Promise<Result<void, AppError>>
  requestPasswordReset(token: string, actorId: string, personId: string): Promise<Result<void, AppError>>
  provisionLogin(token: string, actorId: string, personId: string, input: ProvisionLoginInput): Promise<Result<{ id: string }, AppError>>
  deletePerson(token: string, actorId: string, personId: string): Promise<Result<void, AppError>>
  assignRole(token: string, actorId: string, personId: string, input: AssignRoleInput): Promise<Result<AssignRoleResult, AppError>>
  deactivateRole(token: string, actorId: string, personId: string, roleId: string): Promise<Result<void, AppError>>
  reactivateRole(token: string, actorId: string, personId: string, roleId: string): Promise<Result<void, AppError>>
  reconcileIdp(token: string, actorId: string): Promise<Result<ReconciliationReport, AppError>>
}

type RequestOpts = Readonly<{ method?: string; token: string; actorId?: string; path: string; body?: unknown }>

// Request autenticado. Bearer sempre; `X-Actor-Id` SÓ quando `actorId` é fornecido (mutações).
// Devolve o status (para distinguir 201 vs 207 vs 204) + corpo parseado.
async function request(baseUrl: string, opts: RequestOpts): Promise<Result<{ status: number; body: unknown }, AppError>> {
  const headers: Record<string, string> = { authorization: `Bearer ${opts.token}`, accept: 'application/json' }
  if (opts.actorId) headers['x-actor-id'] = opts.actorId
  if (opts.body !== undefined) headers['content-type'] = 'application/json'
  let res: Response
  try {
    res = await withTimeout(
      fetch(`${baseUrl}${opts.path}`, {
        method: opts.method ?? 'GET',
        headers,
        ...(opts.body !== undefined ? { body: JSON.stringify(opts.body) } : {}),
      }),
      TIMEOUT_MS,
    )
  } catch {
    return err(toTransportError())
  }
  let body: unknown = null
  try {
    body = await res.json()
  } catch {
    /* corpo vazio/não-JSON (204/202) */
  }
  if (!res.ok) return err(toUpstreamError(res.status, body))
  return ok({ status: res.status, body })
}

export function createPeopleContextClient(baseUrl: string = env.peopleContextUrl): PeopleContextClient {
  const dataOf = <T>(body: unknown): T => (body as StandardResponse<T>).data

  return {
    async listPeople(token, params) {
      const qs = new URLSearchParams()
      if (params.search) qs.set('search', params.search)
      if (params.cursor) qs.set('cursor', params.cursor)
      qs.set('limit', String(params.limit))
      const r = await request(baseUrl, { token, path: `/api/v1/people?${qs}` })
      if (!r.ok) return r
      const env_ = r.value.body as PaginatedResponse<PersonRecord>
      return ok({
        items: env_.data,
        meta: {
          pageSize: env_.meta.pageSize,
          totalCount: env_.meta.totalCount,
          hasMore: env_.meta.hasMore,
          nextCursor: env_.meta.nextCursor,
        },
      })
    },

    async getPerson(token, personId) {
      const r = await request(baseUrl, { token, path: `/api/v1/people/${encodeURIComponent(personId)}` })
      if (!r.ok) return r
      return ok(dataOf<PersonRecord>(r.value.body))
    },

    async getByCpf(token, cpf) {
      const r = await request(baseUrl, { token, path: `/api/v1/people/by-cpf/${encodeURIComponent(cpf)}` })
      if (!r.ok) return r
      return ok(dataOf<PersonRecord>(r.value.body))
    },

    async getRoles(token, personId, active) {
      const qs = active === undefined ? '' : `?active=${active}`
      const r = await request(baseUrl, { token, path: `/api/v1/people/${encodeURIComponent(personId)}/roles${qs}` })
      if (!r.ok) return r
      return ok(dataOf<readonly Role[]>(r.value.body))
    },

    async listRoles(token, params) {
      const qs = new URLSearchParams()
      qs.set('system', params.system)
      if (params.role) qs.set('role', params.role)
      if (params.active !== undefined) qs.set('active', String(params.active))
      const r = await request(baseUrl, { token, path: `/api/v1/roles?${qs}` })
      if (!r.ok) return r
      return ok(dataOf<readonly RoleQueryResult[]>(r.value.body))
    },

    async createPerson(token, actorId, input) {
      const r = await request(baseUrl, { method: 'POST', token, actorId, path: '/api/v1/people', body: input })
      if (!r.ok) return r
      return ok({ id: dataOf<{ id: string }>(r.value.body).id, idpProvisioned: r.value.status !== 207 })
    },

    async updatePerson(token, actorId, personId, input) {
      const r = await request(baseUrl, { method: 'PUT', token, actorId, path: `/api/v1/people/${encodeURIComponent(personId)}`, body: input })
      return r.ok ? ok(undefined) : r
    },

    async deactivatePerson(token, actorId, personId) {
      const r = await request(baseUrl, { method: 'PUT', token, actorId, path: `/api/v1/people/${encodeURIComponent(personId)}/deactivate` })
      return r.ok ? ok(undefined) : r
    },

    async reactivatePerson(token, actorId, personId) {
      const r = await request(baseUrl, { method: 'PUT', token, actorId, path: `/api/v1/people/${encodeURIComponent(personId)}/reactivate` })
      return r.ok ? ok(undefined) : r
    },

    async requestPasswordReset(token, actorId, personId) {
      // 202 sem link (o link viaja por NATS p/ o queue-manager — nunca no HTTP/BFF).
      const r = await request(baseUrl, { method: 'POST', token, actorId, path: `/api/v1/people/${encodeURIComponent(personId)}/request-password-reset` })
      return r.ok ? ok(undefined) : r
    },

    async provisionLogin(token, actorId, personId, input) {
      const r = await request(baseUrl, { method: 'POST', token, actorId, path: `/api/v1/people/${encodeURIComponent(personId)}/login`, body: input })
      if (!r.ok) return r
      return ok(dataOf<{ id: string }>(r.value.body))
    },

    async deletePerson(token, actorId, personId) {
      const r = await request(baseUrl, { method: 'DELETE', token, actorId, path: `/api/v1/people/${encodeURIComponent(personId)}` })
      return r.ok ? ok(undefined) : r
    },

    async assignRole(token, actorId, personId, input) {
      const r = await request(baseUrl, { method: 'POST', token, actorId, path: `/api/v1/people/${encodeURIComponent(personId)}/roles`, body: input })
      if (!r.ok) return r
      // 201 = criado (corpo {data:{id}}); 204 = já existia ativo (sem corpo)
      const id = r.value.status === 201 ? dataOf<{ id: string }>(r.value.body).id : null
      return ok({ id, created: r.value.status === 201 })
    },

    async deactivateRole(token, actorId, personId, roleId) {
      const r = await request(baseUrl, { method: 'PUT', token, actorId, path: `/api/v1/people/${encodeURIComponent(personId)}/roles/${encodeURIComponent(roleId)}/deactivate` })
      return r.ok ? ok(undefined) : r
    },

    async reactivateRole(token, actorId, personId, roleId) {
      const r = await request(baseUrl, { method: 'PUT', token, actorId, path: `/api/v1/people/${encodeURIComponent(personId)}/roles/${encodeURIComponent(roleId)}/reactivate` })
      return r.ok ? ok(undefined) : r
    },

    async reconcileIdp(token, actorId) {
      const r = await request(baseUrl, { method: 'POST', token, actorId, path: '/api/v1/admin/reconcile-idp' })
      if (!r.ok) return r
      return ok(dataOf<ReconciliationReport>(r.value.body))
    },
  }
}
