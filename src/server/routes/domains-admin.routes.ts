// Setor Domínios & Governança (social-care, admin) — CRUD de catálogos + fluxo de solicitação/aprovação.
// Ator do JWT.sub (sem header). A ALLOWLIST de tabelas é enforçada no BFF (fora da lista → 400 LKP-001,
// sem tocar o upstream). RBAC fino (admin/worker) é do backend; o BFF repassa e mapeia o erro por tag.
// CSRF vem do guard global. Erros como valor.
import { Elysia, t } from 'elysia'
import type { AppDeps } from '~/server/deps'
import { requireSession } from '~/modules/auth/server/guard'
import { SESSION_COOKIE } from '~/server/session'
import { isErr } from '~/shared/http/result'
import { statusForKind, errorBody } from '~/server/routes/error-response'
import { isDomainTable } from '~/shared/domain/domain-catalog'

const readSid = (raw: unknown): string | undefined => (typeof raw === 'string' ? raw : undefined)
const now = () => new Date().toISOString()

const ITEM = t.Object({
  codigo: t.String({ minLength: 1 }),
  descricao: t.String({ minLength: 1 }),
  exigeRegistroNascimento: t.Optional(t.Boolean()),
  exigeCpfFalecido: t.Optional(t.Boolean()),
  exigeDescricao: t.Optional(t.Boolean()),
})
const ITEM_UPDATE = t.Object({ descricao: t.String({ minLength: 1 }) })
const REQUEST = t.Object({
  tableName: t.String({ minLength: 1 }),
  codigo: t.String({ minLength: 1 }),
  descricao: t.String({ minLength: 1 }),
  justificativa: t.String({ minLength: 1 }),
})
const REJECT = t.Object({ reviewNote: t.String({ minLength: 1 }) })

export function domainsAdminRoutes(deps: AppDeps) {
  return (
    new Elysia()
      // GET /api/domains/requests — listar solicitações (worker vê próprias; admin todas — backend decide)
      .get(
        '/domains/requests',
        async ({ cookie, query, set }) => {
          const requestId = crypto.randomUUID()
          set.headers['x-request-id'] = requestId
          const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
          if (!session) {
            set.status = 401
            return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
          }
          const r = await deps.socialCare.listLookupRequests(session.accessToken, query.status)
          if (isErr(r)) {
            set.status = statusForKind(r.error.kind)
            return errorBody(r.error, requestId)
          }
          return { data: r.value, meta: { timestamp: now() } }
        },
        { query: t.Object({ status: t.Optional(t.String()) }) },
      )

      // POST /api/domains/requests — solicitar novo lookup
      .post(
        '/domains/requests',
        async ({ cookie, body, set }) => {
          const requestId = crypto.randomUUID()
          set.headers['x-request-id'] = requestId
          const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
          if (!session) {
            set.status = 401
            return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
          }
          const r = await deps.socialCare.createLookupRequest(session.accessToken, body)
          if (isErr(r)) {
            set.status = statusForKind(r.error.kind)
            return errorBody(r.error, requestId)
          }
          set.status = 201
          return { data: { id: r.value.id }, meta: { timestamp: now() } }
        },
        { body: REQUEST },
      )

      // PUT /api/domains/requests/:requestId/approve — aprovar (admin)
      .put('/domains/requests/:requestId/approve', async ({ cookie, params, set }) => {
        const requestId = crypto.randomUUID()
        set.headers['x-request-id'] = requestId
        const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
        if (!session) {
          set.status = 401
          return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
        }
        const r = await deps.socialCare.approveLookupRequest(session.accessToken, params.requestId)
        if (isErr(r)) {
          set.status = statusForKind(r.error.kind)
          return errorBody(r.error, requestId)
        }
        return { data: { id: params.requestId, status: 'APPROVED' }, meta: { timestamp: now() } }
      })

      // PUT /api/domains/requests/:requestId/reject {reviewNote} — rejeitar (admin)
      .put(
        '/domains/requests/:requestId/reject',
        async ({ cookie, params, body, set }) => {
          const requestId = crypto.randomUUID()
          set.headers['x-request-id'] = requestId
          const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
          if (!session) {
            set.status = 401
            return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
          }
          const r = await deps.socialCare.rejectLookupRequest(session.accessToken, params.requestId, body.reviewNote)
          if (isErr(r)) {
            set.status = statusForKind(r.error.kind)
            return errorBody(r.error, requestId)
          }
          return { data: { id: params.requestId, status: 'REJECTED' }, meta: { timestamp: now() } }
        },
        { body: REJECT },
      )

      // POST /api/domains/:tableName — criar item (allowlist no BFF)
      .post(
        '/domains/:tableName',
        async ({ cookie, params, body, set }) => {
          const requestId = crypto.randomUUID()
          set.headers['x-request-id'] = requestId
          const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
          if (!session) {
            set.status = 401
            return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
          }
          const table = params.tableName
          if (!isDomainTable(table)) {
            set.status = 400
            return { error: { code: 'LKP-001', message: 'validation', requestId } }
          }
          const r = await deps.socialCare.createLookupItem(session.accessToken, table, body)
          if (isErr(r)) {
            set.status = statusForKind(r.error.kind)
            return errorBody(r.error, requestId)
          }
          set.status = 201
          return { data: { id: r.value.id }, meta: { timestamp: now() } }
        },
        { body: ITEM },
      )

      // PUT /api/domains/:tableName/:itemId — atualizar descrição
      .put(
        '/domains/:tableName/:itemId',
        async ({ cookie, params, body, set }) => {
          const requestId = crypto.randomUUID()
          set.headers['x-request-id'] = requestId
          const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
          if (!session) {
            set.status = 401
            return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
          }
          const table = params.tableName
          if (!isDomainTable(table)) {
            set.status = 400
            return { error: { code: 'LKP-001', message: 'validation', requestId } }
          }
          const r = await deps.socialCare.updateLookupItem(session.accessToken, table, params.itemId, body.descricao)
          if (isErr(r)) {
            set.status = statusForKind(r.error.kind)
            return errorBody(r.error, requestId)
          }
          return { data: { tableName: table, itemId: params.itemId, updated: true }, meta: { timestamp: now() } }
        },
        { body: ITEM_UPDATE },
      )

      // PATCH /api/domains/:tableName/:itemId/toggle — ativar/desativar item
      .patch('/domains/:tableName/:itemId/toggle', async ({ cookie, params, set }) => {
        const requestId = crypto.randomUUID()
        set.headers['x-request-id'] = requestId
        const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
        if (!session) {
          set.status = 401
          return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
        }
        const table = params.tableName
        if (!isDomainTable(table)) {
          set.status = 400
          return { error: { code: 'LKP-001', message: 'validation', requestId } }
        }
        const r = await deps.socialCare.toggleLookupItem(session.accessToken, table, params.itemId)
        if (isErr(r)) {
          set.status = statusForKind(r.error.kind)
          return errorBody(r.error, requestId)
        }
        return { data: { tableName: table, itemId: params.itemId, toggled: true }, meta: { timestamp: now() } }
      })
  )
}
