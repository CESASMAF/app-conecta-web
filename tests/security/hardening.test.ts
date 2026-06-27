// Testes dos 6 fixes de hardening do security-review (L1–L6).
import { test, expect, describe } from 'bun:test'
import { createApp } from '~/server/app'
import { createInMemorySessionStore } from '~/external/session-store'
import type { OidcClient } from '~/server/oidc'
import { buildSecurityHeaders } from '~/shared/http/security-headers'
import { withTimeout } from '~/shared/with-timeout'
import { makeApp, driveSession, fakeOidc, stubSocialCare, stubPeopleContext, stubAnalysisBi } from '../modules/auth/_fakes'

const post = (app: ReturnType<typeof makeApp>, headers: Record<string, string>) =>
  app.handle(new Request('http://localhost/api/auth/logout', { method: 'POST', headers }))

describe('L1 — logout revoga o refresh no IdP (back-channel)', () => {
  test('logout chama revokeToken com o refresh da sessão', async () => {
    let revokedWith = ''
    const spyOidc: OidcClient = { ...fakeOidc, revokeToken: async (rt) => { revokedWith = rt } }
    const app = createApp({ oidc: spyOidc, sessions: createInMemorySessionStore(), socialCare: stubSocialCare, peopleContext: stubPeopleContext, analysisBi: stubAnalysisBi })
    const sc = await driveSession(app)
    await post(app, { 'x-requested-with': 'fetch', cookie: sc })
    expect(revokedWith).toBe('rt') // refresh token da sessão (fakeOidc.exchangeCode)
  })
})

describe('L2 — requestId / logging', () => {
  test('respostas carregam X-Request-Id; envelope de erro tem requestId não-vazio', async () => {
    const res = await makeApp().handle(new Request('http://localhost/api/me'))
    expect(res.headers.get('x-request-id')).toMatch(/[0-9a-f-]{36}/i)
    const body = (await res.json()) as { error: { requestId: string } }
    expect(body.error.requestId.length).toBeGreaterThan(0)
  })
})

describe('L3 — CSRF por Origin (allowlist)', () => {
  test('mutação com Origin externo → 403 AUTH-ORIGIN', async () => {
    const res = await post(makeApp(), { 'x-requested-with': 'fetch', origin: 'https://evil.com' })
    expect(res.status).toBe(403)
    expect(((await res.json()) as { error: { code: string } }).error.code).toBe('AUTH-ORIGIN')
  })
  test('mutação com Origin same-origin → passa (200)', async () => {
    const app = makeApp()
    const sc = await driveSession(app)
    const res = await post(app, { 'x-requested-with': 'fetch', origin: 'http://localhost:3000', cookie: sc })
    expect(res.status).toBe(200)
  })
})

describe('L5 — style-src sem unsafe-inline em prod', () => {
  test('dev mantém unsafe-inline; prod (styleUnsafeInline:false) remove', () => {
    expect(buildSecurityHeaders({ isHttps: true })['Content-Security-Policy']).toContain(
      "style-src 'self' 'unsafe-inline'",
    )
    const prod = buildSecurityHeaders({ isHttps: true, styleUnsafeInline: false })['Content-Security-Policy']!
    expect(prod).toContain("style-src 'self'")
    expect(prod).not.toContain("'unsafe-inline'")
  })
})

describe('L6 — withTimeout (single-flight não vaza em refresh travado)', () => {
  test('resolve rápido → valor; promise travada → rejeita por timeout', async () => {
    expect(await withTimeout(Promise.resolve('ok'), 1000)).toBe('ok')
    const never = new Promise<string>(() => {})
    await expect(withTimeout(never, 20)).rejects.toThrow('timeout')
  })
})
