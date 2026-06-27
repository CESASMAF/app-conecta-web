// Suíte de segurança — tenta os maiores ataques web (OWASP Top 10 2025 + clássicos) contra o BFF
// e prova que estão BLOQUEADOS. Defensivo (testa o nosso próprio código). Sem MSW (ADR-0011).
import { test, expect, describe } from 'bun:test'
import { createApp } from '~/server/app'
import { createInMemorySessionStore } from '~/external/session-store'
import type { OidcClient } from '~/server/oidc'
import { buildSecurityHeaders, serializeCsp, CSP_BASELINE } from '~/shared/http/security-headers'
import { sanitizeRedirectPath } from '~/shared/http/safe-redirect'
import { authErrorTag } from '~/shared/i18n/auth'
import { makeApp, driveLogin, driveSession, stubSocialCare, stubPeopleContext, stubAnalysisBi } from '../modules/auth/_fakes'

// Tokens DISTINTIVOS p/ provar que nunca vazam ao browser.
const SECRET_AT = 'SECRET-ACCESS-aaa111'
const SECRET_RT = 'SECRET-REFRESH-bbb222'
const secOidc: OidcClient = {
  exchangeCode: async () => ({ accessToken: SECRET_AT, refreshToken: SECRET_RT, idToken: 'idtok', expiresIn: 3600 }),
  verifyIdToken: async () => ({ sub: 'user-1', name: 'X', groups: ['worker'] }),
  refreshTokens: async () => ({ accessToken: SECRET_AT, refreshToken: SECRET_RT, idToken: '', expiresIn: 3600 }),
  revokeToken: async () => {},
}
const secApp = () => createApp({ oidc: secOidc, sessions: createInMemorySessionStore(), socialCare: stubSocialCare, peopleContext: stubPeopleContext, analysisBi: stubAnalysisBi })
const get = (app: ReturnType<typeof makeApp>, path: string, init?: RequestInit) =>
  app.handle(new Request(`http://localhost${path}`, init))

// ───────────────────────── A01: Broken Access Control ─────────────────────────
describe('A01 Broken Access Control', () => {
  test('recurso protegido sem sessão → 401', async () => {
    expect((await get(makeApp(), '/api/me')).status).toBe(401)
  })
  test('sessionId forjado/aleatório → 401 (sem acesso a sessão inexistente)', async () => {
    const res = await get(makeApp(), '/api/me', { headers: { cookie: '__Host-session=forjado-123' } })
    expect(res.status).toBe(401)
  })
  test('CSRF: mutação sem X-Requested-With → 403', async () => {
    const res = await get(makeApp(), '/api/auth/logout', { method: 'POST' })
    expect(res.status).toBe(403)
  })
  test('open-redirect: login com destino externo → callback volta p/ "/" (não evil)', async () => {
    const app = makeApp()
    const { pkceCookie, state } = await driveLogin(app, 'https://evil.com/phish')
    const cb = await get(app, `/api/auth/callback?code=x&state=${state}`, { headers: { cookie: pkceCookie } })
    expect(cb.headers.get('location')).toBe('/') // destino externo descartado
  })
})

// ───────────────────────── A02: Security Misconfiguration ─────────────────────────
describe('A02 Security Misconfiguration', () => {
  test('CSP estrita + headers de hardening', () => {
    const h = buildSecurityHeaders({ isHttps: true, nonce: 'N' })
    expect(h['Content-Security-Policy']).toContain("script-src 'self' 'nonce-N' 'strict-dynamic'")
    expect(h['Content-Security-Policy']).toContain("frame-ancestors 'none'")
    expect(h['X-Content-Type-Options']).toBe('nosniff')
    expect(h['X-Frame-Options']).toBe('DENY')
  })
  test('erro NÃO vaza stack/caminho interno (envelope genérico)', async () => {
    const app = createApp({
      oidc: { ...secOidc, exchangeCode: async () => { throw new Error('boom em /Users/segredo/path.ts') } },
      sessions: createInMemorySessionStore(),
      socialCare: stubSocialCare,
      peopleContext: stubPeopleContext,
      analysisBi: stubAnalysisBi,
    })
    const { pkceCookie, state } = await driveLogin(app)
    const cb = await get(app, `/api/auth/callback?code=x&state=${state}`, { headers: { cookie: pkceCookie } })
    expect(cb.status).toBe(502)
    const body = await cb.text()
    expect(body).not.toContain('boom')
    expect(body).not.toContain('/Users/')
    expect(body.toLowerCase()).not.toContain('stack')
  })
  test('rota desconhecida → 404 sem vazar internals', async () => {
    const res = await get(makeApp(), '/api/naoexiste')
    expect(res.status).toBe(404)
    expect(await res.text()).not.toContain('/Users/')
  })
})

// ───────────────────────── A03: Software Supply Chain ─────────────────────────
describe('A03 Software Supply Chain (config; `bun audit` valida em separado)', () => {
  test('override de h3 (>=1.15.6) + lifecycle scripts em allowlist', async () => {
    const pkg = (await Bun.file(new URL('../../package.json', import.meta.url)).json()) as {
      overrides?: Record<string, string>
      trustedDependencies?: string[]
    }
    expect(pkg.overrides?.['h3']).toContain('1.15')
    expect(Array.isArray(pkg.trustedDependencies)).toBe(true) // postinstall bloqueado por padrão (allowlist)
  })
})

// ───────────────────────── A04: Cryptographic Failures ─────────────────────────
describe('A04 Cryptographic Failures', () => {
  test('NENHUM token de identidade vaza ao browser (Princ. I)', async () => {
    const app = secApp()
    const login = await get(app, '/api/auth/login')
    const pkceCookie = ((login.headers.getSetCookie().find((c) => c.startsWith('pkce=')) ?? '').split(';')[0] ?? '') as string
    const state = new URL(login.headers.get('location')!).searchParams.get('state')!
    const cb = await get(app, `/api/auth/callback?code=x&state=${state}`, { headers: { cookie: pkceCookie } })
    const sessionCookie = ((cb.headers.getSetCookie().find((c) => c.startsWith('__Host-session=')) ?? '').split(';')[0] ?? '') as string
    const me = await get(app, '/api/me', { headers: { cookie: sessionCookie } })

    const browserFacing = [
      login.headers.get('location') ?? '',
      login.headers.getSetCookie().join(' '),
      cb.headers.getSetCookie().join(' '),
      cb.headers.get('location') ?? '',
      await me.text(),
    ].join(' || ')
    expect(browserFacing).not.toContain(SECRET_AT)
    expect(browserFacing).not.toContain(SECRET_RT)
  })
  test('cookies: pkce HttpOnly+Secure+SameSite=Lax; session __Host-+HttpOnly+Secure+SameSite=Strict', async () => {
    const app = makeApp()
    const login = await get(app, '/api/auth/login')
    const pkceSc = (login.headers.getSetCookie().find((c) => c.startsWith('pkce=')) ?? '').toLowerCase()
    expect(pkceSc).toContain('httponly')
    expect(pkceSc).toContain('secure')
    expect(pkceSc).toContain('samesite=lax')
    const sessionCookie = await driveSession(app)
    expect(sessionCookie.startsWith('__Host-session=')).toBe(true) // prefixo __Host-
    // o set-cookie da sessão tem os atributos (reconstrói o callback p/ inspecionar)
    const { pkceCookie, state } = await driveLogin(app)
    const cb = await get(app, `/api/auth/callback?code=x&state=${state}`, { headers: { cookie: pkceCookie } })
    const sc = (cb.headers.getSetCookie().find((c) => c.startsWith('__Host-session=')) ?? '').toLowerCase()
    expect(sc).toContain('httponly')
    expect(sc).toContain('secure')
    expect(sc).toContain('samesite=strict')
  })
  test('PKCE usa S256 (não plain)', async () => {
    const login = await get(makeApp(), '/api/auth/login')
    expect(login.headers.get('location')).toContain('code_challenge_method=S256')
  })
  test('sessionId é UUID de alta entropia (não sequencial)', async () => {
    const sc = await driveSession(makeApp())
    const id = sc.replace('__Host-session=', '')
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  })
})

// ───────────────────────── A05: Injection ─────────────────────────
describe('A05 Injection (CRLF / response splitting / open-redirect)', () => {
  test('safe-redirect bloqueia CRLF/backslash/externo', () => {
    expect(sanitizeRedirectPath('/ok/path')).toBe('/ok/path')
    expect(sanitizeRedirectPath('/a' + String.fromCharCode(13, 10) + 'Set-Cookie: x=1')).toBe('/')
    expect(sanitizeRedirectPath('/a' + String.fromCharCode(10) + 'evil')).toBe('/')
    expect(sanitizeRedirectPath('/a' + String.fromCharCode(9) + 'b')).toBe('/')
    expect(sanitizeRedirectPath('//evil.com')).toBe('/')
    expect(sanitizeRedirectPath('/\\evil.com')).toBe('/')
    expect(sanitizeRedirectPath('https://evil.com')).toBe('/')
  })
  test('Location do callback nunca contém CR/LF', async () => {
    const app = makeApp()
    const { pkceCookie, state } = await driveLogin(app, '/a' + String.fromCharCode(13, 10) + 'X')
    const cb = await get(app, `/api/auth/callback?code=x&state=${state}`, { headers: { cookie: pkceCookie } })
    const loc = cb.headers.get('location') ?? ''
    expect(loc.includes('\r') || loc.includes('\n')).toBe(false)
    expect(loc).toBe('/') // saneado
  })
  test('cookie pkce malformado → 400 (fail closed, sem crash)', async () => {
    const res = await get(makeApp(), '/api/auth/callback?code=x&state=s', { headers: { cookie: 'pkce=lixo.invalido' } })
    expect(res.status).toBe(400)
  })
})

// ───────────────────────── A07: Identification & Authentication Failures ─────────────────────────
describe('A07 Identification & Authentication Failures', () => {
  test('sem fixação de sessão: cada login gera sessionId NOVO', async () => {
    const app = makeApp()
    const a = (await driveSession(app)).replace('__Host-session=', '')
    const b = (await driveSession(app)).replace('__Host-session=', '')
    expect(a).not.toBe(b)
  })
  test('validação de state (CSRF no fluxo OIDC): state divergente → 400', async () => {
    const app = makeApp()
    const { pkceCookie } = await driveLogin(app)
    const res = await get(app, '/api/auth/callback?code=x&state=ERRADO', { headers: { cookie: pkceCookie } })
    expect(res.status).toBe(400)
  })
  test('mensagens de erro genéricas (anti-enumeração)', () => {
    // credencial/validação cai no GENÉRICO, não revela existência de usuário
    expect(authErrorTag('validation')).toBe('auth.error.generic')
    expect(authErrorTag('notFound')).toBe('auth.error.generic')
  })
  test('logout invalida a sessão (não reaproveitável)', async () => {
    const app = makeApp()
    const sc = await driveSession(app)
    await get(app, '/api/auth/logout', { method: 'POST', headers: { 'x-requested-with': 'fetch', cookie: sc } })
    expect((await get(app, '/api/me', { headers: { cookie: sc } })).status).toBe(401)
  })
})

// ───────────────────────── A08: Software & Data Integrity Failures ─────────────────────────
describe('A08 Software & Data Integrity Failures', () => {
  test('cookie pkce ADULTERADO (assinatura inválida) → rejeitado (400)', async () => {
    const app = makeApp()
    const { pkceCookie, state } = await driveLogin(app)
    // adultera 1 caractere do valor assinado → HMAC não confere
    const tampered = pkceCookie.replace(/^(pkce=.)(.)/, (_m, a: string, b: string) => a + (b === 'A' ? 'B' : 'A'))
    const res = await get(app, `/api/auth/callback?code=x&state=${state}`, { headers: { cookie: tampered } })
    expect(res.status).toBe(400)
  })
  test('cookie de sessão forjado → 401 (sem confiança em dado adulterado)', async () => {
    const res = await get(makeApp(), '/api/me', { headers: { cookie: '__Host-session=' + crypto.randomUUID() } })
    expect(res.status).toBe(401)
  })
})

// ───────────────────────── A09: Security Logging & Alerting ─────────────────────────
describe('A09 Security Logging & Alerting', () => {
  test('envelope de erro carrega campo requestId (correlação)', async () => {
    const res = await get(makeApp(), '/api/me')
    const body = (await res.json()) as { error: { code: string; requestId?: string } }
    expect(body.error).toHaveProperty('requestId')
  })
})

// ───────────────────────── A10: Mishandling of Exceptional Conditions (novo 2025) ─────────────────────────
describe('A10 Mishandling of Exceptional Conditions', () => {
  test('FAIL CLOSED: erro no IdP → 502 e NENHUMA sessão criada', async () => {
    const app = createApp({
      oidc: { ...secOidc, exchangeCode: async () => { throw new Error('idp down') } },
      sessions: createInMemorySessionStore(),
      socialCare: stubSocialCare,
      peopleContext: stubPeopleContext,
      analysisBi: stubAnalysisBi,
    })
    const { pkceCookie, state } = await driveLogin(app)
    const cb = await get(app, `/api/auth/callback?code=x&state=${state}`, { headers: { cookie: pkceCookie } })
    expect(cb.status).toBe(502)
    expect(cb.headers.getSetCookie().some((c) => c.startsWith('__Host-session='))).toBe(false) // não logou
  })
  test('input malformado → 4xx (não 5xx, não 200): callback sem code/state', async () => {
    const res = await get(makeApp(), '/api/auth/callback')
    expect(res.status).toBeGreaterThanOrEqual(400)
    expect(res.status).toBeLessThan(500)
  })
})

// ───────────────────────── Clássicos (clickjacking / MIME / HSTS) ─────────────────────────
describe('Clássicos', () => {
  test('clickjacking: frame-ancestors none + X-Frame-Options DENY', () => {
    expect(serializeCsp(CSP_BASELINE)).toContain("frame-ancestors 'none'")
    expect(buildSecurityHeaders({ isHttps: true })['X-Frame-Options']).toBe('DENY')
  })
  test('MIME sniffing: nosniff', () => {
    expect(buildSecurityHeaders({ isHttps: true })['X-Content-Type-Options']).toBe('nosniff')
  })
  test('HSTS só atrás de https (não em http puro)', () => {
    expect(buildSecurityHeaders({ isHttps: true })['Strict-Transport-Security']).toContain('max-age')
    expect(buildSecurityHeaders({ isHttps: false })['Strict-Transport-Security']).toBeUndefined()
  })
})
