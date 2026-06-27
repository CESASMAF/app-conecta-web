// GET /api/patients/:patientId — cabeçalho mínimo p/ o detalhe-stub (US3). 200 ou 404 (REG-014).
// O agregado completo do prontuário é a feature 003.
import { Elysia } from 'elysia'
import type { AppDeps } from '~/server/deps'
import { requireSession } from '~/modules/auth/server/guard'
import { SESSION_COOKIE } from '~/server/session'
import { isErr } from '~/shared/http/result'
import { statusForKind, errorBody } from '~/server/routes/error-response'

export function patientGetRoute(deps: AppDeps) {
  return new Elysia().get('/patients/:patientId', async ({ cookie, params, set }) => {
    const requestId = crypto.randomUUID()
    set.headers['x-request-id'] = requestId
    const sid = cookie[SESSION_COOKIE]!.value
    const session = await requireSession(deps, typeof sid === 'string' ? sid : undefined)
    if (!session) {
      set.status = 401
      return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
    }
    const r = await deps.socialCare.getPatientHeader(session.accessToken, params.patientId)
    if (isErr(r)) {
      set.status = statusForKind(r.error.kind)
      return errorBody(r.error, requestId)
    }
    return { data: r.value, meta: { timestamp: new Date().toISOString() } }
  })
}
