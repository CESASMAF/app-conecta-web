// Rota de logout (US3). Revoga a sessão no store + (best-effort) o refresh no IdP (L1).
// CSRF (X-Requested-With + Origin) é exigido no onRequest do app.
import { Elysia } from 'elysia'
import type { AppDeps } from '~/server/deps'
import { SESSION_COOKIE } from '~/server/session'
import type { SessionId } from '~/external/session-store'
import { logAuthEvent } from '~/shared/log'

export function logoutRoute(deps: AppDeps) {
  return new Elysia().post('/auth/logout', async ({ cookie }) => {
    const sid = cookie[SESSION_COOKIE]!.value
    if (typeof sid === 'string') {
      const session = await deps.sessions.get(sid as SessionId)
      if (session) {
        // L1: revoga o refresh no IdP (defense-in-depth) — best-effort, nao bloqueia o logout.
        try {
          await deps.oidc.revokeToken(session.refreshToken)
        } catch {
          /* ignora falha de rede/IdP — a sessao local ja sera revogada */
        }
        await deps.sessions.revoke(session.sessionId)
        logAuthEvent('logout', { sub: session.idpSub })
      }
    }
    cookie[SESSION_COOKIE]!.remove()
    return { data: { ok: true }, meta: { timestamp: new Date().toISOString() } }
  })
}
