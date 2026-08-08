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

// `cpf`/`email` entram porque a ficha precisa deles para editar sem apagar (o form abria vazio e o
// PUT zerava o CPF). O que NAO entra e deliberado: `idpUserId` (id interno do IdP, correlaciona
// sistemas) e `createdAt` — nenhuma tela usa e o upstream os devolve.
export type PersonRecord = Readonly<{
  id: string
  fullName: string
  birthDate: string
  active: boolean
  cpf: string | null
  email: string | null
  // derivado de `idpUserId` na projecao: a tela precisa saber SE ha acesso, nunca QUAL o id no IdP.
  hasLogin: boolean
}>
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
// 207 = criado, IdP falhou. `alreadyExisted` = o CPF ja pertencia a alguem e o upstream devolveu
// ESSA pessoa (200, idempotencia por CPF) — nada foi criado e os dados digitados foram descartados.
export type CreatePersonResult = Readonly<{
  id: string
  idpProvisioned: boolean
  alreadyExisted: boolean
  existingName?: string
}>
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

// Projecao EXPLICITA da linha do upstream (LGPD — minimizacao).
//
// `dataOf<PersonRecord>` e so um cast: em runtime o objeto do people-context passa inteiro, com
// `idpUserId` e `createdAt` junto. Era assim que `GET /api/people/by-cpf/:cpf` entregava PII
// completa ao browser. Tipo nao filtra nada em runtime — a construcao campo a campo filtra.
const asPersonRecord = (raw: unknown): PersonRecord => {
  const p = (raw ?? {}) as Record<string, unknown>
  return {
    id: String(p.id ?? ''),
    fullName: String(p.fullName ?? ''),
    birthDate: String(p.birthDate ?? ''),
    active: Boolean(p.active),
    cpf: typeof p.cpf === 'string' ? p.cpf : null,
    email: typeof p.email === 'string' ? p.email : null,
    // o `idpUserId` cru morre AQUI: vira booleano e nao segue para o client.
    hasLogin: typeof p.idpUserId === 'string' && p.idpUserId !== '',
  }
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
      const env_ = r.value.body as PaginatedResponse<unknown>
      return ok({
        // projeta cada linha: a listagem tambem recebia `idpUserId`/`createdAt` do upstream.
        items: env_.data.map(asPersonRecord),
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
      return ok(asPersonRecord(dataOf<unknown>(r.value.body)))
    },

    async getByCpf(token, cpf) {
      const r = await request(baseUrl, { token, path: `/api/v1/people/by-cpf/${encodeURIComponent(cpf)}` })
      if (!r.ok) return r
      return ok(asPersonRecord(dataOf<unknown>(r.value.body)))
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
      const d = dataOf<{ id: string; alreadyExisted?: boolean; fullName?: string }>(r.value.body)
      // 200 (em vez de 201) = o upstream reusou uma pessoa existente por CPF; `alreadyExisted`
      // confirma. Projecao explicita: so o nome atravessa, para a tela poder dizer DE QUEM e a ficha.
      const alreadyExisted = d.alreadyExisted === true || r.value.status === 200
      return ok({
        id: d.id,
        idpProvisioned: r.value.status !== 207,
        alreadyExisted,
        ...(alreadyExisted && d.fullName ? { existingName: d.fullName } : {}),
      })
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
