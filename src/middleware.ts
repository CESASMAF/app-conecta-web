// Middleware do SolidStart — security headers + CSP com nonce per-request (ADR-0006, T050).
// onRequest (ANTES do render): gera o nonce, publica em locals (entry-server o usa nos scripts de
// hidratação) e carimba a CSP estrita (nonce + strict-dynamic) + demais headers.
import { createMiddleware } from '@solidjs/start/middleware'
import { redirect } from '@solidjs/router'
import { buildSecurityHeaders, isHttpsFromForwardedProto } from '~/shared/http/security-headers'
import { newNonce } from '~/external/csp-nonce'
import { isProtectedPagePath, loadCurrentUser } from '~/modules/auth/server/page-guard'
import { env } from '~/server/env'

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
    const path = new URL(event.request.url).pathname
    if (isProtectedPagePath(path)) {
      const user = await loadCurrentUser(event.request.headers.get('cookie') ?? '')
      if (!user) return redirect('/login')
      event.locals.user = user
    }
  },
})
