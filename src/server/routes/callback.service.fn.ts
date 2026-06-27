// Rota de callback do OIDC (US1). Valida state, troca code->token, verifica id_token, cria sessao,
// grava cookie opaco `__Host-session` e redireciona ao destino saneado.
import { Elysia, t } from 'elysia'
import type { AppDeps } from '~/server/deps'
import { createSession, SESSION_COOKIE, PKCE_COOKIE, type PkceCookie } from '~/server/session'
import { sanitizeRedirectPath } from '~/shared/http/safe-redirect'
import { logAuthEvent } from '~/shared/log'

export function callbackRoute(deps: AppDeps) {
  return new Elysia().get(
    '/auth/callback',
    async ({ query, cookie, redirect, set }) => {
      const requestId = crypto.randomUUID()
      set.headers['x-request-id'] = requestId // correlacao (L2)
      const envelopeError = (code: string) => ({ error: { code, message: code, requestId } })

      const raw = cookie[PKCE_COOKIE]!.value
      cookie[PKCE_COOKIE]!.remove()

      let pkce: PkceCookie | null = null
      if (typeof raw === 'string') {
        try {
          pkce = JSON.parse(atob(raw)) as PkceCookie
        } catch {
          pkce = null
        }
      }
      if (!pkce || query.state !== pkce.state) {
        set.status = 400
        logAuthEvent('login.failed', { requestId, reason: 'state' })
        return envelopeError('AUTH-STATE')
      }

      try {
        const tokens = await deps.oidc.exchangeCode(query.code, pkce.verifier)
        const claims = await deps.oidc.verifyIdToken(tokens.idToken, pkce.nonce)
        const session = await createSession(deps.sessions, tokens, claims, false)
        cookie[SESSION_COOKIE]!.set({
          value: session.sessionId,
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          path: '/',
        })
        logAuthEvent('login.success', { requestId, sub: claims.sub })
        return redirect(sanitizeRedirectPath(pkce.redirectTo), 302)
      } catch {
        set.status = 502
        logAuthEvent('login.failed', { requestId, reason: 'idp' })
        return envelopeError('AUTH-IDP')
      }
    },
    { query: t.Object({ code: t.String(), state: t.String() }) },
  )
}
