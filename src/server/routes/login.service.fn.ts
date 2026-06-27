// Rota de início do OIDC (US1). Gera PKCE, grava cookie `pkce` (assinado pela app) e redireciona ao IdP.
import { Elysia, t } from 'elysia'
import type { AppDeps } from '~/server/deps'
import { generatePkce, buildAuthorizeUrl } from '~/server/oidc'
import { PKCE_COOKIE, type PkceCookie } from '~/server/session'
import { sanitizeRedirectPath } from '~/shared/http/safe-redirect'

export function loginRoute(_deps: AppDeps) {
  return new Elysia().get(
    '/auth/login',
    async ({ query, cookie, redirect }) => {
      const pkce = await generatePkce()
      const payload: PkceCookie = {
        verifier: pkce.verifier,
        state: pkce.state,
        nonce: pkce.nonce,
        redirectTo: sanitizeRedirectPath(query.redirect),
      }
      cookie[PKCE_COOKIE]!.set({
        // base64 (string opaca) — Elysia trata valor JSON-like de forma especial e quebra a serialização.
        value: btoa(JSON.stringify(payload)),
        httpOnly: true,
        secure: true,
        sameSite: 'lax', // sobrevive ao redirect de volta do IdP
        path: '/',
        maxAge: 600,
      })
      return redirect(buildAuthorizeUrl(pkce), 302)
    },
    { query: t.Object({ redirect: t.Optional(t.String()) }) },
  )
}
