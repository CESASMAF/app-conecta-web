// Repasse dos self-service flows do Kratos (login e recuperação de senha).
//
// POR QUE ISSO EXISTE
// O formulário postava direto em `ui.action`, que aponta para o Kratos em
// https://id.<domínio>. A CSP da aplicação traz `form-action 'self'`, então o navegador
// ABORTAVA o envio — silenciosamente, sem erro na tela. Verificado em produção pelo
// relatório de violação: `directive=form-action, blockedURI=https://id.…/self-service/login`.
// Resultado: nunca foi possível entrar nem recuperar senha pela tela do app.
//
// Em dev o defeito não aparecia porque lá quem serve o login é o container `kratos-ui`
// (`ui_url: http://localhost:4455/login`), que não passa pela CSP do app — a tela do app
// só é exercitada em produção.
//
// A saída é a mesma que o resto do app já usa (ADR-0010): o formulário posta em `/api/…`,
// mesma origem, e o SERVIDOR conversa com o serviço. Aqui isso é um repasse fiel: quem
// decide continua sendo o Kratos.
//
// O QUE TORNA O REPASSE POSSÍVEL
// O anti-CSRF do Kratos depende do cookie chegar junto. Esta instância emite os cookies no
// domínio-PAI (`COOKIES_DOMAIN=cesasmaf.app.br`), então o navegador já os manda para o app,
// e o POST para `/api/…` é same-site — `SameSite=Lax` não atrapalha. Sem isso o repasse
// seria impossível e a alternativa seria afrouxar a CSP.
//
// NÃO reinterpretamos a resposta: com `Accept: text/html` o Kratos responde no modo browser
// (303 + Set-Cookie) e nós copiamos status, Location e cookies. Traduzir para JSON aqui
// significaria reimplementar as regras dele — e divergir na primeira mudança de versão.
import { Elysia, t } from 'elysia'
import type { AppDeps } from '~/server/deps'
import { kratosEndpoints } from '~/server/env'
import { logAuthEvent } from '~/shared/log'

// Só estes dois fluxos. Uma lista fechada impede que a rota vire um proxy aberto para
// qualquer caminho do Kratos — inclusive a Admin API.
const FLOWS = { login: kratosEndpoints.loginSubmit, recovery: kratosEndpoints.recoverySubmit } as const
type FlowKind = keyof typeof FLOWS

// Cabeçalhos que o Kratos usa para decidir o que responder e para casar o CSRF. `cookie` é
// o essencial; sem ele o Kratos recusa com "CSRF token mismatch".
const PASSAR_ADIANTE = ['cookie', 'content-type', 'accept-language'] as const

export function kratosSubmitRoute(_deps: AppDeps) {
  return new Elysia().post(
    '/auth/kratos/:flow',
    async ({ params, query, request, set }) => {
      const kind = params.flow as FlowKind
      const base = FLOWS[kind]
      if (!base) {
        set.status = 404
        return 'fluxo desconhecido'
      }

      const headers: Record<string, string> = {
        // text/html = modo browser: o Kratos responde 303 + Set-Cookie em vez de JSON.
        accept: 'text/html',
      }
      for (const h of PASSAR_ADIANTE) {
        const v = request.headers.get(h)
        if (v) headers[h] = v
      }

      const upstream = await fetch(`${base}?flow=${encodeURIComponent(query.flow)}`, {
        method: 'POST',
        headers,
        body: await request.arrayBuffer(),
        // `manual`: o 303 do Kratos É a resposta que interessa. Seguir aqui faria o servidor
        // consumir o redirect e o browser jamais receberia o Set-Cookie da sessão.
        redirect: 'manual',
      })

      // Os Set-Cookie do Kratos carregam a sessão recém-criada e o novo anti-CSRF. Perder
      // qualquer um deles = login que "dá certo" e não loga.
      const cookies = upstream.headers.getSetCookie?.() ?? []
      if (cookies.length) set.headers['set-cookie'] = cookies as unknown as string

      const location = upstream.headers.get('location')
      logAuthEvent(kind === 'login' ? 'login.start' : 'recovery.submit', {
        status: String(upstream.status),
        temRedirect: String(Boolean(location)),
        cookiesRepassados: String(cookies.length),
      })

      if (location) {
        set.status = upstream.status === 200 ? 303 : upstream.status
        set.headers['location'] = location
        return null
      }

      // Sem Location: o Kratos devolveu a página do flow com erros (credencial inválida,
      // código errado). Mandamos de volta para a MESMA tela, que relê o flow e mostra as
      // mensagens dele — em vez de renderizar aqui um HTML que duplicaria a UI.
      set.status = 303
      set.headers['location'] = `${kind === 'login' ? '/login' : '/recover'}?flow=${encodeURIComponent(query.flow)}`
      return null
    },
    {
      params: t.Object({ flow: t.Union([t.Literal('login'), t.Literal('recovery')]) }),
      query: t.Object({ flow: t.String({ minLength: 1 }) }),
    },
  )
}
