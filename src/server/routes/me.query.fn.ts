// Rota da identidade atual (US1). Minimo necessario p/ "quem esta logado" (FR-008). 200 ou 401.
// Usa o guard reutilizavel (valida + renova single-flight + desliza inatividade).
import { Elysia } from 'elysia'
import type { AppDeps } from '~/server/deps'
import { requireSession } from '~/modules/auth/server/guard'
import { toAuthenticatedUser, SESSION_COOKIE } from '~/server/session'
import { logAuthEvent } from '~/shared/log'

export function meRoute(deps: AppDeps) {
  return new Elysia().get('/me', async ({ cookie, set }) => {
    const requestId = crypto.randomUUID()
    set.headers['x-request-id'] = requestId // correlacao (L2)
    const sid = cookie[SESSION_COOKIE]!.value
    const session = await requireSession(deps, typeof sid === 'string' ? sid : undefined)
    if (!session) {
      set.status = 401
      logAuthEvent('unauthorized', { requestId })
      return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
    }
    return { data: toAuthenticatedUser(session), meta: { timestamp: new Date().toISOString() } }
  })
}
