// Contract test da rota login (T021): 302 + code_challenge S256 + cookie pkce assinado.
import { test, expect } from 'bun:test'
import { makeApp } from './_fakes'

test('GET /api/auth/login → 302 p/ o IdP com S256 + cookie pkce HttpOnly', async () => {
  const res = await makeApp().handle(new Request('http://localhost/api/auth/login'))
  expect(res.status).toBe(302)
  const loc = res.headers.get('location') ?? ''
  expect(loc).toContain('code_challenge_method=S256')
  expect(loc).toContain('code_challenge=')
  const setCookie = res.headers.getSetCookie().join('; ').toLowerCase()
  expect(setCookie).toContain('pkce=')
  expect(setCookie).toContain('httponly')
})
