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

const escapar = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Conta autenticada, porém sem papel em nenhuma área. Acontece de verdade: o people-context
// provisiona a identidade no Kratos ANTES de atribuir o papel, e quem entrar nessa janela não
// tem para onde ir. HTML mínimo e inline de propósito — é fora da árvore do app (o shell
// precisa de um usuário com papel para montar) e não pode depender de JS nem de rota nova.
function semAcesso(nome: string | null): Response {
  const quem = nome ? escapar(nome) : 'Sua conta'
  return new Response(
    `<!doctype html><html lang="pt-BR"><meta charset="utf-8">` +
      `<meta name="viewport" content="width=device-width,initial-scale=1">` +
      `<title>Sem acesso — RAROS Boa Vista</title>` +
      `<body style="margin:0;min-height:100dvh;display:grid;place-items:center;background:#f4f4f5;` +
      `font-family:system-ui,sans-serif;color:#18181b;padding:24px">` +
      `<main style="max-width:32rem;background:#fff;border:1px solid #e4e4e7;border-radius:14px;padding:32px">` +
      `<h1 style="margin:0 0 12px;font-size:1.25rem">Sem acesso liberado</h1>` +
      `<p style="margin:0 0 8px;color:#52525b;line-height:1.5">${quem} entrou, mas ainda não tem ` +
      `permissão em nenhuma área do sistema.</p>` +
      `<p style="margin:0 0 20px;color:#52525b;line-height:1.5">Peça a um administrador para ` +
      `atribuir seu papel e entre de novo.</p>` +
      `<a href="/login" style="display:inline-block;background:#703cc0;color:#fff;text-decoration:none;` +
      `padding:10px 18px;border-radius:12px;font-weight:600">Entrar com outra conta</a>` +
      `</main></body></html>`,
    { status: 403, headers: { 'content-type': 'text/html; charset=utf-8' } },
  )
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
        const destino = rootViewModel.landingHref(user.groups)
        // Sem NENHUMA área acessível não há para onde mandar: redirecionar para a landing
        // seria redirecionar para uma rota que este mesmo guard nega — o browser aborta com
        // ERR_TOO_MANY_REDIRECTS e nada explica que faltam papéis. Diz o que houve, com saída.
        if (destino === null) return semAcesso(user.displayName)
        return redirect(destino)
      }
      event.locals.user = user
    }
  },
  // Content-Type explícito na resposta das server functions (RPC do SolidStart).
  //
  // ⚠️ ANDA JUNTO COM `serialization: { mode: 'json' }` do app.config.ts. Quem remover um
  // quebra o outro — e a quebra é silenciosa.
  //
  // No `server-handler` do SolidStart só o modo `js` carimba Content-Type (`text/javascript`);
  // o modo `json` marca a resposta APENAS com `x-serialized: true`, sem Content-Type nenhum.
  // Estamos em `json` porque o modo `js` exigiria `unsafe-eval` na CSP (ADR-0006) — ou seja,
  // foi uma decisão de SEGURANÇA que colocou o app no caminho exposto.
  //
  // O cliente RPC decide o que fazer NESTA ordem:
  //
  //     if (ct?.startsWith('text/plain'))        → await res.text()
  //     else if (ct?.startsWith('application/json')) → await res.json()
  //     else if (res.headers.get('x-serialized')) → deserializa (seroval)
  //
  // Content-Type vem ANTES de `x-serialized`. E resposta sem Content-Type que atravessa um
  // servidor escrito em Go sofre sniffing automático (`http.DetectContentType`, disparado
  // justamente pela ausência do header) — o Caddy é Go e carimba `text/plain; charset=utf-8`.
  // Confirmado em produção: a resposta chega ao browser com os DOIS headers.
  //
  // Resultado: o cliente cai no primeiro ramo, faz `.text()` e entrega ao binding a STRING
  // crua `;0x000000f0;{…}` em vez do objeto. Sem erro, sem exceção — `f.ok` é `undefined`,
  // todo `isOk()` reprova e TODA tela abre em "não foi possível carregar". SSR não sofre:
  // ali a função roda in-process e nunca passa por esta fronteira. Foi o que fez o bug ter a
  // cara de "SPA quebrada, F5 funciona" e mandou a investigação para o payload, que estava
  // íntegro o tempo todo.
  //
  // `application/octet-stream` porque só precisa NÃO casar com os dois prefixos acima —
  // `application/json` seria pior que o problema: o cliente faria `.json()` sobre um corpo
  // que começa com `;0x…;` e estouraria SyntaxError.
  //
  // Corrigido aqui, na origem, e não no Caddy: assim vale para qualquer proxy no caminho.
  onBeforeResponse: (event) => {
    if (!new URL(event.request.url).pathname.startsWith('/_server')) return
    if (event.response.headers.has('content-type')) return
    event.response.headers.set('content-type', 'application/octet-stream')
  },
})
