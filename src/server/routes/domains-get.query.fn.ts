// GET /api/domains/:tableName — catálogo de domínio (US4). Allowlist enforçada no BFF (LKP-T002):
// tableName fora das 13 → 400 LKP-001, SEM tocar o upstream. Itens ativos ordenados vêm do social-care.
import { Elysia } from 'elysia'
import type { AppDeps } from '~/server/deps'
import { requireSession } from '~/modules/auth/server/guard'
import { SESSION_COOKIE } from '~/server/session'
import { isErr } from '~/shared/http/result'
import { statusForKind, errorBody } from '~/server/routes/error-response'
import { isDomainTable } from '~/shared/domain/domain-catalog'

export function domainsGetRoute(deps: AppDeps) {
  return new Elysia().get('/domains/:tableName', async ({ cookie, params, set }) => {
    const requestId = crypto.randomUUID()
    set.headers['x-request-id'] = requestId
    const sid = cookie[SESSION_COOKIE]!.value
    const session = await requireSession(deps, typeof sid === 'string' ? sid : undefined)
    if (!session) {
      set.status = 401
      return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
    }
    if (!isDomainTable(params.tableName)) {
      set.status = 400
      return { error: { code: 'LKP-001', message: 'validation', requestId } }
    }
    const r = await deps.socialCare.listDomain(session.accessToken, params.tableName)
    if (isErr(r)) {
      set.status = statusForKind(r.error.kind)
      return errorBody(r.error, requestId)
    }
    return { data: r.value, meta: { timestamp: new Date().toISOString() } }
  })
}
