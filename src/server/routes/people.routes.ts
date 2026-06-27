// Setor Pessoas & Identidade (people-context). POLÍTICA DE ATOR: mutações enviam X-Actor-Id=sub (via o
// PeopleContextClient da Foundation). Leitura de tela compõe a visão da pessoa (dados+papéis) view-ready.
// Erasure (DELETE) exige superadmin — DEFESA em profundidade no BFF. CSRF (mutações) vem do guard global.
import { Elysia, t } from 'elysia'
import type { AppDeps } from '~/server/deps'
import { requireSession } from '~/modules/auth/server/guard'
import { SESSION_COOKIE } from '~/server/session'
import { isErr } from '~/shared/http/result'
import { statusForKind, errorBody } from '~/server/routes/error-response'
import { isSuperadmin } from '~/shared/auth/roles'
import { composePersonOverview } from '~/server/composition/person-overview.compose'

const readSid = (raw: unknown): string | undefined => (typeof raw === 'string' ? raw : undefined)
const now = () => new Date().toISOString()

export function peopleRoutes(deps: AppDeps) {
  return new Elysia()
    // GET /api/people — lista paginada (leitura, sem ator)
    .get(
      '/people',
      async ({ cookie, query, set }) => {
        const requestId = crypto.randomUUID()
        set.headers['x-request-id'] = requestId
        const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
        if (!session) {
          set.status = 401
          return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
        }
        const limit = query.limit ?? 20
        if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
          set.status = 400
          return { error: { code: 'PAG-001', message: 'limit', requestId } }
        }
        const r = await deps.peopleContext.listPeople(session.accessToken, {
          limit,
          ...(query.search !== undefined ? { search: query.search } : {}),
          ...(query.cursor !== undefined ? { cursor: query.cursor } : {}),
        })
        if (isErr(r)) {
          set.status = statusForKind(r.error.kind)
          return errorBody(r.error, requestId)
        }
        return { data: r.value.items, meta: { ...r.value.meta, timestamp: now() } }
      },
      { query: t.Object({ search: t.Optional(t.String()), cursor: t.Optional(t.String()), limit: t.Optional(t.Numeric()) }) },
    )

    // GET /api/people/:id — visão composta (dados + papéis), view-ready
    .get('/people/:id', async ({ cookie, params, set }) => {
      const requestId = crypto.randomUUID()
      set.headers['x-request-id'] = requestId
      const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
      if (!session) {
        set.status = 401
        return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
      }
      const r = await composePersonOverview(deps, session.accessToken, params.id)
      if (isErr(r)) {
        set.status = statusForKind(r.error.kind)
        return errorBody(r.error, requestId)
      }
      return { data: r.value, meta: { timestamp: now(), partial: r.value.partial } }
    })

    // POST /api/people — criar (X-Actor-Id; 207 = criado mas IdP não provisionado → aviso no view-state)
    .post(
      '/people',
      async ({ cookie, body, set }) => {
        const requestId = crypto.randomUUID()
        set.headers['x-request-id'] = requestId
        const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
        if (!session) {
          set.status = 401
          return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
        }
        const r = await deps.peopleContext.createPerson(session.accessToken, session.idpSub, body)
        if (isErr(r)) {
          set.status = statusForKind(r.error.kind)
          return errorBody(r.error, requestId)
        }
        set.status = 201
        return {
          data: { id: r.value.id, idpProvisioned: r.value.idpProvisioned },
          meta: { timestamp: now(), ...(r.value.idpProvisioned ? {} : { warning: 'idp-not-provisioned' }) },
        }
      },
      {
        body: t.Object({
          fullName: t.String({ minLength: 1 }),
          birthDate: t.String(),
          cpf: t.Optional(t.String()),
          email: t.Optional(t.String()),
          createLogin: t.Optional(t.Boolean()),
          initialPassword: t.Optional(t.String()),
        }),
      },
    )

    // PUT /api/people/:id — editar (X-Actor-Id)
    .put(
      '/people/:id',
      async ({ cookie, params, body, set }) => {
        const requestId = crypto.randomUUID()
        set.headers['x-request-id'] = requestId
        const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
        if (!session) {
          set.status = 401
          return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
        }
        const r = await deps.peopleContext.updatePerson(session.accessToken, session.idpSub, params.id, body)
        if (isErr(r)) {
          set.status = statusForKind(r.error.kind)
          return errorBody(r.error, requestId)
        }
        return { data: { id: params.id, updated: true }, meta: { timestamp: now() } }
      },
      {
        body: t.Object({
          fullName: t.String({ minLength: 1 }),
          birthDate: t.String(),
          cpf: t.Optional(t.String()),
          email: t.Optional(t.String()),
        }),
      },
    )

    // PUT /api/people/:id/deactivate — desativar (X-Actor-Id; IdP-first no upstream)
    .put('/people/:id/deactivate', async ({ cookie, params, set }) => {
      const requestId = crypto.randomUUID()
      set.headers['x-request-id'] = requestId
      const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
      if (!session) {
        set.status = 401
        return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
      }
      const r = await deps.peopleContext.deactivatePerson(session.accessToken, session.idpSub, params.id)
      if (isErr(r)) {
        set.status = statusForKind(r.error.kind)
        return errorBody(r.error, requestId)
      }
      return { data: { id: params.id, active: false }, meta: { timestamp: now() } }
    })

    // PUT /api/people/:id/reactivate — reativar (X-Actor-Id)
    .put('/people/:id/reactivate', async ({ cookie, params, set }) => {
      const requestId = crypto.randomUUID()
      set.headers['x-request-id'] = requestId
      const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
      if (!session) {
        set.status = 401
        return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
      }
      const r = await deps.peopleContext.reactivatePerson(session.accessToken, session.idpSub, params.id)
      if (isErr(r)) {
        set.status = statusForKind(r.error.kind)
        return errorBody(r.error, requestId)
      }
      return { data: { id: params.id, active: true }, meta: { timestamp: now() } }
    })

    // DELETE /api/people/:id — erasure LGPD. DEFESA: superadmin no BFF, ANTES de encaminhar.
    .delete('/people/:id', async ({ cookie, params, set }) => {
      const requestId = crypto.randomUUID()
      set.headers['x-request-id'] = requestId
      const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
      if (!session) {
        set.status = 401
        return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
      }
      if (!isSuperadmin(session.groups)) {
        set.status = 403
        return { error: { code: 'PEO-010', message: 'forbidden', requestId } }
      }
      const r = await deps.peopleContext.deletePerson(session.accessToken, session.idpSub, params.id)
      if (isErr(r)) {
        set.status = statusForKind(r.error.kind)
        return errorBody(r.error, requestId)
      }
      return { data: { id: params.id, deleted: true }, meta: { timestamp: now() } }
    })

    // GET /api/people/by-cpf/:cpf — busca por CPF (leitura, sem ator)
    .get('/people/by-cpf/:cpf', async ({ cookie, params, set }) => {
      const requestId = crypto.randomUUID()
      set.headers['x-request-id'] = requestId
      const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
      if (!session) {
        set.status = 401
        return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
      }
      const r = await deps.peopleContext.getByCpf(session.accessToken, params.cpf)
      if (isErr(r)) {
        set.status = statusForKind(r.error.kind)
        return errorBody(r.error, requestId)
      }
      return { data: r.value, meta: { timestamp: now() } }
    })

    // POST /api/people/:id/request-password-reset — 202 SEM link (o link viaja por NATS — nunca no HTTP).
    .post('/people/:id/request-password-reset', async ({ cookie, params, set }) => {
      const requestId = crypto.randomUUID()
      set.headers['x-request-id'] = requestId
      const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
      if (!session) {
        set.status = 401
        return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
      }
      const r = await deps.peopleContext.requestPasswordReset(session.accessToken, session.idpSub, params.id)
      if (isErr(r)) {
        set.status = statusForKind(r.error.kind)
        return errorBody(r.error, requestId)
      }
      set.status = 202
      return { data: { requested: true }, meta: { timestamp: now() } }
    })

    // POST /api/people/:id/login — provisão de login retroativa no IdP (X-Actor-Id)
    .post(
      '/people/:id/login',
      async ({ cookie, params, body, set }) => {
        const requestId = crypto.randomUUID()
        set.headers['x-request-id'] = requestId
        const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
        if (!session) {
          set.status = 401
          return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
        }
        const r = await deps.peopleContext.provisionLogin(session.accessToken, session.idpSub, params.id, body)
        if (isErr(r)) {
          set.status = statusForKind(r.error.kind)
          return errorBody(r.error, requestId)
        }
        set.status = 201
        return { data: r.value, meta: { timestamp: now() } }
      },
      { body: t.Object({ email: t.Optional(t.String()), initialPassword: t.Optional(t.String()) }) },
    )
}
