// A submissão de flow do Kratos é a ÚNICA rota do BFF isenta de `X-Requested-With` —
// porque quem posta é um formulário nativo, que não consegue mandar header customizado.
//
// A isenção não afrouxa: em troca, `Origin` deixa de ser "se vier, confira" e passa a ser
// obrigatório e igual. O navegador sempre manda Origin em POST, inclusive same-origin
// (MDN), então ausência aqui é anomalia — não um cliente legítimo.
//
// Estes testes existem para que a isenção não escape do lugar dela.
import { test, expect } from 'bun:test'
import { makeApp } from '../modules/auth/_fakes'

const app = makeApp()
const ORIGIN = 'http://localhost:3000' // = allowedOrigin nos testes (PUBLIC_BASE_URL)

const post = (path: string, headers: Record<string, string>): Promise<Response> =>
  app.handle(new Request(`http://internal${path}`, { method: 'POST', headers, body: 'a=1' }))

test('submissão de flow passa SEM X-Requested-With, com Origin correto', () => {
  return post('/api/auth/kratos/recovery?flow=x', {
    origin: ORIGIN,
    'content-type': 'application/x-www-form-urlencoded',
  }).then(async (r) => {
    // Não checamos sucesso — o Kratos não existe no teste. Só que NÃO foi barrado no guard.
    expect(r.status).not.toBe(403)
    const body = await r.text()
    expect(body).not.toContain('AUTH-CSRF')
  })
})

test('submissão de flow é BARRADA sem Origin', async () => {
  const r = await post('/api/auth/kratos/recovery?flow=x', {
    'content-type': 'application/x-www-form-urlencoded',
  })
  expect(r.status).toBe(403)
  expect(await r.text()).toContain('AUTH-ORIGIN')
})

test('submissão de flow é BARRADA com Origin de outro site', async () => {
  const r = await post('/api/auth/kratos/recovery?flow=x', {
    origin: 'https://evil.com',
    'content-type': 'application/x-www-form-urlencoded',
  })
  expect(r.status).toBe(403)
  expect(await r.text()).toContain('AUTH-ORIGIN')
})

// O ponto que a isenção não pode contaminar: o resto do BFF segue exigindo os dois sinais.
test('o resto do BFF continua exigindo X-Requested-With', async () => {
  const r = await post('/api/patients', { origin: ORIGIN })
  expect(r.status).toBe(403)
  expect(await r.text()).toContain('AUTH-CSRF')
})

test('a isenção não vale para caminho parecido fora do prefixo', async () => {
  // `/api/auth/kratosX` ou `/api/auth/kratos` sem barra não podem herdar a isenção.
  for (const p of ['/api/auth/kratosinho', '/api/auth/kratos']) {
    const r = await post(p, { origin: ORIGIN })
    expect(await r.text()).toContain('AUTH-CSRF')
  }
})
