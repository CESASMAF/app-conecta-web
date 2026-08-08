// Rota de logout (US3). Revoga a sessão no store + (best-effort) o refresh no IdP (L1)
// e diz ao browser para onde ir a seguir.
//
// São TRÊS sessões, não uma: a deste BFF (cookie + Redis), a do Hydra (OAuth2) e a do
// Kratos (identidade). Revogar só a primeira NÃO desloga: o `/authorize` seguinte encontra
// a sessão do Hydra viva, faz `skip`, e o usuário volta autenticado sem digitar nada —
// era o que acontecia em produção, com o browser passando por /api/auth/callback?code=…
// logo depois do clique em "Sair".
//
// Divisão de trabalho:
//   • aqui           → sessão do BFF (cookie + store) e o refresh no Hydra;
//   • RP-initiated logout → sessão do Hydra (é para lá que devolvemos o browser);
//   • consent-bridge → sessão do Kratos, no `/logout` que o Hydra chama em seguida.
//
// CSRF (X-Requested-With + Origin) é exigido no onRequest do app.
import { Elysia } from 'elysia'
import type { AppDeps } from '~/server/deps'
import { env, oidcEndpoints } from '~/server/env'
import { SESSION_COOKIE } from '~/server/session'
import type { SessionId } from '~/external/session-store'
import { logAuthEvent } from '~/shared/log'

// Onde o browser cai quando o Hydra termina. Precisa estar em `post_logout_redirect_uris`
// do client `acdg-web` (o bootstrap do IdP registra a raiz) — se não estiver, o Hydra
// responde `invalid_request` e o usuário fica preso numa tela de erro do OAuth.
const posLogout = (): string => `${env.publicBaseUrl}/`

// `id_token_hint` é OBRIGATÓRIO quando se manda `post_logout_redirect_uri`: sem ele o Hydra
// responde "Logout failed because query parameter post_logout_redirect_uri is set but
// id_token_hint is missing" (verificado em produção).
//
// Sem o hint — sessão criada antes desta versão, ou refresh que não reemitiu o id_token —
// vamos ao end_session MESMO ASSIM, só que sem o `post_logout_redirect_uri`. O Hydra deriva
// o subject do próprio cookie de sessão dele e cai no `urls.post_logout_redirect` do
// hydra.yml. O que NÃO se pode fazer é pular o IdP: mandar o browser direto para a raiz
// deixa Hydra e Kratos de pé, o /authorize seguinte faz `skip` e o usuário volta logado —
// exatamente o bug que esta rota existe para corrigir, e que atingiria TODA sessão já viva
// no Redis no momento do deploy.
export function buildLogoutRedirect(idToken: string | undefined): string {
  const u = new URL(oidcEndpoints.endSession)
  if (!idToken) return u.toString()
  u.searchParams.set('id_token_hint', idToken)
  u.searchParams.set('post_logout_redirect_uri', posLogout())
  return u.toString()
}

export function logoutRoute(deps: AppDeps) {
  return new Elysia().post('/auth/logout', async ({ cookie }) => {
    const sid = cookie[SESSION_COOKIE]!.value
    let idToken: string | undefined
    if (typeof sid === 'string') {
      const session = await deps.sessions.get(sid as SessionId)
      if (session) {
        // Lido ANTES de revogar — depois a sessão não existe mais para consultar.
        idToken = session.idToken
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
    return {
      // O client navega para cá (navegação DURA: é outra origem). Sem esta viagem, só a
      // sessão local morre e o próximo /authorize reloga o usuário em silêncio.
      data: { ok: true, redirectTo: buildLogoutRedirect(idToken) },
      meta: { timestamp: new Date().toISOString() },
    }
  })
}
