// Setor Papéis & Acesso + admin (people-context). RBAC system-scoped é enforçado no backend; o BFF injeta
// Bearer + X-Actor-Id (=sub) nas mutações. `reconcile-idp` exige superadmin — DEFESA em profundidade no BFF.
// CSRF (mutações) vem do guard global. Erros como valor.
import { Elysia, t } from 'elysia'
import type { AppDeps } from '~/server/deps'
import { requireSession } from '~/modules/auth/server/guard'
import { SESSION_COOKIE } from '~/server/session'
import { isErr } from '~/shared/http/result'
import { statusForKind, errorBody } from '~/server/routes/error-response'
import { isSuperadmin } from '~/shared/auth/roles'

const readSid = (raw: unknown): string | undefined => (typeof raw === 'string' ? raw : undefined)
const now = () => new Date().toISOString()

export function rolesRoutes(deps: AppDeps) {
  return new Elysia()
    // GET /api/people/:id/roles?active= — papéis da pessoa
    .get(
      '/people/:id/roles',
      async ({ cookie, params, query, set }) => {
        const requestId = crypto.randomUUID()
        set.headers['x-request-id'] = requestId
        const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
        if (!session) {
          set.status = 401
          return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
        }
        const active = query.active === undefined ? undefined : query.active === 'true'
        const r = await deps.peopleContext.getRoles(session.accessToken, params.id, active)
        if (isErr(r)) {
          set.status = statusForKind(r.error.kind)
          return errorBody(r.error, requestId)
        }
        return { data: r.value, meta: { timestamp: now() } }
      },
      { query: t.Object({ active: t.Optional(t.String()) }) },
    )

    // GET /api/roles?system=&role=&active= — consulta por sistema (system obrigatório → ROL-004)
    .get(
      '/roles',
      async ({ cookie, query, set }) => {
        const requestId = crypto.randomUUID()
        set.headers['x-request-id'] = requestId
        const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
        if (!session) {
          set.status = 401
          return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
        }
        if (!query.system) {
          set.status = 400
          return { error: { code: 'ROL-004', message: 'validation', requestId } }
        }
        const r = await deps.peopleContext.listRoles(session.accessToken, {
          system: query.system,
          ...(query.role !== undefined ? { role: query.role } : {}),
          ...(query.active !== undefined ? { active: query.active === 'true' } : {}),
        })
        if (isErr(r)) {
          set.status = statusForKind(r.error.kind)
          return errorBody(r.error, requestId)
        }
        return { data: r.value, meta: { timestamp: now() } }
      },
      { query: t.Object({ system: t.Optional(t.String()), role: t.Optional(t.String()), active: t.Optional(t.String()) }) },
    )

    // POST /api/people/:id/roles — atribuir papel (X-Actor-Id); 201 se criado, 200 se já existia ativo
    .post(
      '/people/:id/roles',
      async ({ cookie, params, body, set }) => {
        const requestId = crypto.randomUUID()
        set.headers['x-request-id'] = requestId
        const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
        if (!session) {
          set.status = 401
          return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
        }
        const r = await deps.peopleContext.assignRole(session.accessToken, session.idpSub, params.id, body)
        if (isErr(r)) {
          set.status = statusForKind(r.error.kind)
          return errorBody(r.error, requestId)
        }
        set.status = r.value.created ? 201 : 200
        return { data: { id: r.value.id, created: r.value.created }, meta: { timestamp: now() } }
      },
      { body: t.Object({ system: t.String({ minLength: 1 }), role: t.String({ minLength: 1 }) }) },
    )

    // PUT /api/people/:id/roles/:roleId/deactivate — desativar papel (X-Actor-Id)
    .put('/people/:id/roles/:roleId/deactivate', async ({ cookie, params, set }) => {
      const requestId = crypto.randomUUID()
      set.headers['x-request-id'] = requestId
      const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
      if (!session) {
        set.status = 401
        return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
      }
      const r = await deps.peopleContext.deactivateRole(session.accessToken, session.idpSub, params.id, params.roleId)
      if (isErr(r)) {
        set.status = statusForKind(r.error.kind)
        return errorBody(r.error, requestId)
      }
      return { data: { roleId: params.roleId, active: false }, meta: { timestamp: now() } }
    })

    // PUT /api/people/:id/roles/:roleId/reactivate — reativar papel (X-Actor-Id)
    .put('/people/:id/roles/:roleId/reactivate', async ({ cookie, params, set }) => {
      const requestId = crypto.randomUUID()
      set.headers['x-request-id'] = requestId
      const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
      if (!session) {
        set.status = 401
        return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
      }
      const r = await deps.peopleContext.reactivateRole(session.accessToken, session.idpSub, params.id, params.roleId)
      if (isErr(r)) {
        set.status = statusForKind(r.error.kind)
        return errorBody(r.error, requestId)
      }
      return { data: { roleId: params.roleId, active: true }, meta: { timestamp: now() } }
    })

    // POST /api/admin/reconcile-idp — manutenção IdP↔DB. DEFESA: superadmin no BFF, ANTES de encaminhar.
    .post('/admin/reconcile-idp', async ({ cookie, set }) => {
      const requestId = crypto.randomUUID()
      set.headers['x-request-id'] = requestId
      const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
      if (!session) {
        set.status = 401
        return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
      }
      if (!isSuperadmin(session.groups)) {
        set.status = 403
        return { error: { code: 'ADM-001', message: 'forbidden', requestId } }
      }
      const r = await deps.peopleContext.reconcileIdp(session.accessToken, session.idpSub)
      if (isErr(r)) {
        set.status = statusForKind(r.error.kind)
        return errorBody(r.error, requestId)
      }
      return { data: r.value, meta: { timestamp: now() } }
    })
}
