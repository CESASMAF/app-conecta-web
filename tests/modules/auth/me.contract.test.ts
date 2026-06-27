// Contract test do /me (T023): 401 sem sessão; 200 {userId, groups} com sessão.
import { test, expect } from 'bun:test'
import { makeApp, driveLogin } from './_fakes'

test('GET /api/me sem sessão → 401 AUTH-001', async () => {
  const res = await makeApp().handle(new Request('http://localhost/api/me'))
  expect(res.status).toBe(401)
  const body = (await res.json()) as { error: { code: string } }
  expect(body.error.code).toBe('AUTH-001')
})

test('GET /api/me com sessão → 200 {userId, groups}', async () => {
  const app = makeApp()
  const { pkceCookie, state } = await driveLogin(app)
  const cb = await app.handle(
    new Request(`http://localhost/api/auth/callback?code=x&state=${state}`, { headers: { cookie: pkceCookie } }),
  )
  const sessionCookie = (cb.headers.getSetCookie().find((c) => c.startsWith('__Host-session=')) ?? '').split(';')[0] as string
  const res = await app.handle(new Request('http://localhost/api/me', { headers: { cookie: sessionCookie } }))
  expect(res.status).toBe(200)
  const body = (await res.json()) as { data: { userId: string; groups: string[] } }
  expect(body.data.userId).toBe('user-1')
  expect(body.data.groups).toContain('worker')
})
