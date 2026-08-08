// Governance: as telas de autenticação são da UI do Ory (`kratos-ui`), não deste app.
//
// O app hospedava login e recuperação renderizando os self-service flows do Kratos. O Kratos
// anuncia SEIS fluxos e o app implementava DOIS — as outras quatro URLs que ele mandava o
// usuário visitar respondiam 404. Manter esse desenho custou uma cadeia de regressões em
// produção num único dia (a CSP abortando o submit, o guard de CSRF barrando o próprio
// formulário, `allowed_return_urls` derrubando o login inteiro).
//
// O que este gate trava: /login e /recover continuam existindo — como REDIRECT, para não
// quebrar bookmarks e links antigos — e nenhum caminho de página volta a apontar para uma tela
// de auth deste app.
import { test, expect } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const raiz = join(import.meta.dir, '../..')
const ler = (rel: string): string => readFileSync(join(raiz, rel), 'utf8')

const middleware = ler('src/middleware.ts')

test('o guard de página protegida inicia o OIDC, não manda para uma tela nossa', () => {
  // O destino é /api/auth/login (PKCE + authorize do Hydra), que devolve o browser à UI do Ory.
  expect(middleware).toContain('/api/auth/login')
  // `redirect('/login')` era o desvio para a tela própria — não pode voltar.
  expect(middleware).not.toContain("redirect('/login')")
})

test('/login e /recover seguem existindo, como redirect', () => {
  for (const rota of ['src/routes/login.tsx', 'src/routes/recover.tsx']) {
    const src = ler(rota)
    // Sem render de formulário: o que sobra é navegação dura para quem de fato hospeda a tela.
    expect(src).toContain('window.location')
    expect(src).not.toContain('Page />')
  }
})

test('o destino da recuperação é a UI do Ory, e vem de env — não hardcoded', () => {
  expect(middleware).toContain('env.kratosUiUrl')
  expect(middleware).not.toContain('login.cesasmaf.app.br')
})
