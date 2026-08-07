// Contract test do callback (T022): troca code→token (fake), verifica id_token, cria sessão,
// set __Host-session, redireciona ao destino saneado.
import { test, expect } from 'bun:test'
import { makeApp, driveLogin } from './_fakes'

test('GET /api/auth/callback → cria sessão, __Host-session, 302 p/ destino saneado', async () => {
  const app = makeApp()
  const { pkceCookie, state } = await driveLogin(app, '/dashboard')
  const res = await app.handle(
    new Request(`http://localhost/api/auth/callback?code=abc&state=${state}`, {
      headers: { cookie: pkceCookie },
    }),
  )
  expect(res.status).toBe(302)
  // Location absoluto: `redirect` usa Response.redirect, que rejeita path relativo. O que importa
  // e o destino saneado preservado na MESMA origem (PUBLIC_BASE_URL).
  const loc = new URL(res.headers.get('location') ?? '')
  expect(loc.origin).toBe('http://localhost:3000')
  expect(loc.pathname).toBe('/dashboard')
  expect(res.headers.getSetCookie().join('; ')).toContain('__Host-session=')
})

test('callback com state divergente → 400 AUTH-STATE', async () => {
  const app = makeApp()
  const { pkceCookie } = await driveLogin(app)
  const res = await app.handle(
    new Request('http://localhost/api/auth/callback?code=abc&state=WRONG', {
      headers: { cookie: pkceCookie },
    }),
  )
  expect(res.status).toBe(400)
  const body = (await res.json()) as { error: { code: string } }
  expect(body.error.code).toBe('AUTH-STATE')
})
