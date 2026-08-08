// Contract test do logout (T043, US3): CSRF + revogação de sessão + saída para o IdP.
import { test, expect } from 'bun:test'
import { makeApp, driveSession } from './_fakes'
import { buildLogoutRedirect } from '~/server/routes/logout.service.fn'
import { oidcEndpoints } from '~/server/env'

test('POST /api/auth/logout sem X-Requested-With → 403 (CSRF)', async () => {
  const res = await makeApp().handle(new Request('http://localhost/api/auth/logout', { method: 'POST' }))
  expect(res.status).toBe(403)
  const body = (await res.json()) as { error: { code: string } }
  expect(body.error.code).toBe('AUTH-CSRF')
})

test('POST /api/auth/logout com X-Requested-With → 200 e sessão revogada', async () => {
  const app = makeApp()
  const sessionCookie = await driveSession(app)
  // confirma que estava logado
  const me1 = await app.handle(new Request('http://localhost/api/me', { headers: { cookie: sessionCookie } }))
  expect(me1.status).toBe(200)

  const out = await app.handle(
    new Request('http://localhost/api/auth/logout', {
      method: 'POST',
      headers: { 'x-requested-with': 'fetch', cookie: sessionCookie },
    }),
  )
  expect(out.status).toBe(200)

  // sessão antiga não vale mais
  const me2 = await app.handle(new Request('http://localhost/api/me', { headers: { cookie: sessionCookie } }))
  expect(me2.status).toBe(401)
})

// ─── A saída para o IdP ─────────────────────────────────────────
//
// Revogar a sessão local NÃO desloga: são três (BFF, Hydra, Kratos). Sem mandar o browser
// ao RP-initiated logout, o /authorize seguinte acha a sessão do Hydra viva, faz `skip` e
// devolve o usuário autenticado — foi o que aconteceu em produção em 2026-08-08.

test('logout devolve o RP-initiated logout do Hydra, com id_token_hint', async () => {
  const app = makeApp()
  const sessionCookie = await driveSession(app)

  const out = await app.handle(
    new Request('http://localhost/api/auth/logout', {
      method: 'POST',
      headers: { 'x-requested-with': 'fetch', cookie: sessionCookie },
    }),
  )
  const body = (await out.json()) as { data: { ok: boolean; redirectTo: string } }
  const url = new URL(body.data.redirectTo)

  expect(`${url.origin}${url.pathname}`).toBe(oidcEndpoints.endSession)
  // o id_token do fakeOidc — sem ele o Hydra recusa o post_logout_redirect_uri
  expect(url.searchParams.get('id_token_hint')).toBe('id-token')
  expect(url.searchParams.get('post_logout_redirect_uri')).toBeTruthy()
})

test('sem id_token guardado (sessão legada) ainda vai ao IdP, só que sem o redirect', () => {
  // O Hydra responde `invalid_request` se vier post_logout_redirect_uri sem id_token_hint —
  // então esse par sai. Mas PULAR o IdP seria o pior desfecho: Hydra e Kratos ficam de pé, o
  // /authorize seguinte faz `skip` e o usuário volta logado. Atingiria toda sessão já viva no
  // Redis no momento do deploy, que é justamente quem mais precisa conseguir sair.
  const destino = buildLogoutRedirect(undefined)
  expect(destino).toBe(oidcEndpoints.endSession)
  expect(destino).not.toContain('post_logout_redirect_uri')
})

test('o id_token_hint sai encodado (é um JWT, tem . e pode ter -_)', () => {
  const jwt = 'aaa.bbb-cc_dd.eee'
  const url = new URL(buildLogoutRedirect(jwt))
  expect(url.searchParams.get('id_token_hint')).toBe(jwt)
})
