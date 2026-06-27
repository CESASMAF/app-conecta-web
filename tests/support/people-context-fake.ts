// Fake configurável da porta PeopleContextClient + captura de chamadas (FIXTURE em tests/ — Princ. VI).
// `calls.actors` registra o X-Actor-Id que o BFF deriva do sub — usado para provar a política de ator.
import { ok, type Result } from '~/shared/http/result'
import type { AppError } from '~/shared/http/app-error'
import type {
  PeopleContextClient,
  PersonRecord,
  CreatePersonInput,
  CreatePersonResult,
  Role,
} from '~/external/people-context-client'

export type PeopleCalls = Readonly<{ tokens: string[]; actors: string[] }>

export type PeopleFakeConfig = Partial<{
  person: (token: string, id: string) => Promise<Result<PersonRecord, AppError>>
  roles: (token: string, id: string) => Promise<Result<readonly Role[], AppError>>
  create: (token: string, actor: string, input: CreatePersonInput) => Promise<Result<CreatePersonResult, AppError>>
}>

const samplePerson = (id: string): PersonRecord => ({ id, fullName: 'Maria Teste', birthDate: '1990-01-01', active: true })
const sampleRoles = (id: string): readonly Role[] => [
  { id: 'r1', personId: id, system: 'social-care', role: 'worker', active: true, assignedAt: '2025-01-01T00:00:00Z' },
]

export function makeFakePeople(cfg: PeopleFakeConfig = {}): PeopleContextClient & { calls: PeopleCalls } {
  const calls = { tokens: [] as string[], actors: [] as string[] }
  const read = (token: string) => calls.tokens.push(token)
  const mutate = (token: string, actor: string) => {
    calls.tokens.push(token)
    calls.actors.push(actor)
  }
  return {
    calls,
    async listPeople(token, params) {
      read(token)
      return ok({ items: [samplePerson('p1')], meta: { pageSize: params.limit, totalCount: 1, hasMore: false, nextCursor: null } })
    },
    async getPerson(token, id) {
      read(token)
      return cfg.person ? cfg.person(token, id) : ok(samplePerson(id))
    },
    async getByCpf(token, _cpf) {
      read(token)
      return ok(samplePerson('p1'))
    },
    async getRoles(token, id) {
      read(token)
      return cfg.roles ? cfg.roles(token, id) : ok(sampleRoles(id))
    },
    async listRoles(token) {
      read(token)
      return ok([])
    },
    async createPerson(token, actor, input) {
      mutate(token, actor)
      return cfg.create ? cfg.create(token, actor, input) : ok({ id: 'person-1', idpProvisioned: true })
    },
    async updatePerson(token, actor) {
      mutate(token, actor)
      return ok(undefined)
    },
    async deactivatePerson(token, actor) {
      mutate(token, actor)
      return ok(undefined)
    },
    async reactivatePerson(token, actor) {
      mutate(token, actor)
      return ok(undefined)
    },
    async requestPasswordReset(token, actor) {
      mutate(token, actor)
      return ok(undefined)
    },
    async provisionLogin(token, actor) {
      mutate(token, actor)
      return ok({ id: 'login-1' })
    },
    async deletePerson(token, actor) {
      mutate(token, actor)
      return ok(undefined)
    },
    async assignRole(token, actor) {
      mutate(token, actor)
      return ok({ id: 'role-1', created: true })
    },
    async deactivateRole(token, actor) {
      mutate(token, actor)
      return ok(undefined)
    },
    async reactivateRole(token, actor) {
      mutate(token, actor)
      return ok(undefined)
    },
    async reconcileIdp(token, actor) {
      mutate(token, actor)
      return ok({ checked: 0, inSync: 0, fixed: [], errors: [] })
    },
  }
}
