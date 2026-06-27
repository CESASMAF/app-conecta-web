// GET /api/bi/metadata/:resource — catálogo de BI (datasets/formats/regions). Só exige autenticação
// (sem papel — metadata é não-sensível). Allowlist de resource enforçada no BFF. Bearer sempre.
import { Elysia } from 'elysia'
import type { AppDeps } from '~/server/deps'
import { requireSession } from '~/modules/auth/server/guard'
import { SESSION_COOKIE } from '~/server/session'
import { isErr } from '~/shared/http/result'
import { statusForKind, errorBody } from '~/server/routes/error-response'
import { authorizeAnalysisBi } from '~/server/guards/analysis-bi-access'
import { isMetadataResource } from '~/external/analysis-bi-client'

export function biMetadataRoute(deps: AppDeps) {
  return new Elysia().get('/bi/metadata/:resource', async ({ cookie, params, set }) => {
    const requestId = crypto.randomUUID()
    set.headers['x-request-id'] = requestId
    const sid = cookie[SESSION_COOKIE]!.value
    const session = await requireSession(deps, typeof sid === 'string' ? sid : undefined)
    if (!session) {
      set.status = 401
      return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
    }
    // metadata: qualquer autenticado (a defesa devolve ok) — incluída por consistência/futuro.
    const guard = authorizeAnalysisBi(session.groups, 'metadata')
    if (isErr(guard)) {
      set.status = statusForKind(guard.error.kind)
      return errorBody(guard.error, requestId)
    }
    if (!isMetadataResource(params.resource)) {
      set.status = 400
      return { error: { code: 'ABI-RESOURCE', message: 'validation', requestId } }
    }
    const r = await deps.analysisBi.getMetadata(session.accessToken, params.resource)
    if (isErr(r)) {
      set.status = statusForKind(r.error.kind)
      return errorBody(r.error, requestId)
    }
    const data = (r.value as { data?: unknown }).data ?? r.value
    return { data, meta: { timestamp: new Date().toISOString() } }
  })
}
