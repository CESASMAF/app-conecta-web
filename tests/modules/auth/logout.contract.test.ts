// Contract test do logout (T043, US3): CSRF + revogação de sessão.
import { test, expect } from 'bun:test'
import { makeApp, driveSession } from './_fakes'

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
