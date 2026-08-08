// Middleware do SolidStart — security headers + CSP com nonce per-request (ADR-0006, T050).
// onRequest (ANTES do render): gera o nonce, publica em locals (entry-server o usa nos scripts de
// hidratação) e carimba a CSP estrita (nonce + strict-dynamic) + demais headers.
import { createMiddleware } from '@solidjs/start/middleware'
import { redirect } from '@solidjs/router'
import { buildSecurityHeaders, isHttpsFromForwardedProto } from '~/shared/http/security-headers'
import { newNonce } from '~/external/csp-nonce'
import { isProtectedPagePath, loadCurrentUser } from '~/modules/auth/server/page-guard'
import { requiredGroupForPath, rootViewModel } from '~/modules/shell/client/root/root.view-model'
import { sanitizeRedirectPath } from '~/shared/http/safe-redirect'
import { env } from '~/server/env'

// Início do OIDC: gera PKCE e manda ao Hydra, que devolve o browser à UI do Ory. `redirect`
// é saneado lá também (safe-redirect); saneamos aqui para não montar um Location inválido.
function inicioDoLogin(destino: string): string {
  return `/api/auth/login?redirect=${encodeURIComponent(sanitizeRedirectPath(destino))}`
}

export default createMiddleware({
  onRequest: async (event) => {
    const nonce = newNonce()
    event.locals.nonce = nonce
    const isHttps = isHttpsFromForwardedProto(event.request.headers.get('x-forwarded-proto'))
    // prod: style-src sem 'unsafe-inline' (CSS estático do vanilla-extract) — L5.
    const headers = buildSecurityHeaders({ nonce, isHttps, styleUnsafeInline: !env.isProd })
    for (const [key, value] of Object.entries(headers)) {
      event.response.headers.set(key, value)
    }
    // Guard de página protegida: 302 HARD no SSR do documento se não houver sessão (ADR-0005/0012).
    // Popula locals.user p/ o shell não reler a sessão. (Navegação SPA é guardada pela rota.)
    const url = new URL(event.request.url)
    const path = url.pathname
    // As telas de autenticação são da UI do Ory (kratos-ui), não deste app. Mantemos /login e
    // /recover vivos como REDIRECT — bookmarks, links em e-mail do Kratos e o histórico do
    // usuário continuam funcionando sem que o app volte a renderizar formulário de auth.
    if (path === '/login') {
      return redirect(inicioDoLogin(url.searchParams.get('redirect') ?? '/'))
    }
    if (path === '/recover') {
      // Em dev sem IdP real, `kratosUiUrl` é '' (required() só falha em prod): cair no início do
      // login evita mandar o browser para uma URL relativa sem dono.
      return redirect(env.kratosUiUrl ? `${env.kratosUiUrl}/recovery` : inicioDoLogin('/'))
    }
    if (isProtectedPagePath(path)) {
      const user = await loadCurrentUser(event.request.headers.get('cookie') ?? '')
      if (!user) return redirect(inicioDoLogin(path + url.search))
      // RBAC de ROTA com a mesma fonte do menu (root.view-model). Sem isto, esconder a área do menu
      // era cosmético: o worker abria /people por URL, listava as pessoas e criava uma nova.
      // Manda para a landing do próprio papel — não para /login, que sugeriria sessão expirada.
      const required = requiredGroupForPath(path)
      if (!rootViewModel.canAccess(user.groups, required)) {
        return redirect(rootViewModel.landingHref(user.groups))
      }
      event.locals.user = user
    }
  },
})
