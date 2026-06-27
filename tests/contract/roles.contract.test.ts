// Contract/security test do setor Papéis & Acesso + admin + as rotas restantes de Pessoas (by-cpf,
// reset de senha, provisão de login). Prova: X-Actor-Id nas mutações, CSRF, system obrigatório em /roles,
// defesa superadmin no reconcile-idp, e que o reset de senha NÃO devolve link (viaja por NATS).
import { test, expect, describe } from 'bun:test'
import { createApp } from '~/server/app'
import { fakeDeps, driveSession, oidcWithGroups } from '../modules/auth/_fakes'
import { makeFakePeople } from '../support/people-context-fake'

type PplApp = ReturnType<typeof createApp>

function pplApp(groups: string[], fake = makeFakePeople()) {
  const app = createApp(fakeDeps({ oidc: oidcWithGroups(groups), peopleContext: fake }))
  return { app, fake }
}

const GET = (app: PplApp, path: string, cookie: string) =>
  app.handle(new Request(`http://localhost${path}`, { headers: cookie ? { cookie } : {} }))

const MUT = (app: PplApp, method: string, path: string, cookie: string, csrf = true, body?: unknown) =>
  app.handle(
    new Request(`http://localhost${path}`, {
      method,
      headers: {
        ...(cookie ? { cookie } : {}),
        ...(csrf ? { 'x-requested-with': 'fetch' } : {}),
        ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    }),
  )

describe('Papéis · leitura', () => {
  test('GET /people/:id/roles → 200 + lista (não colide com /people/:id)', async () => {
    const { app } = pplApp(['worker'])
    const cookie = await driveSession(app)
    const res = await GET(app, '/api/people/p1/roles', cookie)
    expect(res.status).toBe(200)
    expect(Array.isArray((await res.json()).data)).toBe(true)
  })

  test('GET /roles sem system → 400 (ROL-004)', async () => {
    const { app } = pplApp(['worker'])
    const cookie = await driveSession(app)
    expect((await GET(app, '/api/roles', cookie)).status).toBe(400)
  })

  test('GET /roles com system → 200', async () => {
    const { app } = pplApp(['worker'])
    const cookie = await driveSession(app)
    expect((await GET(app, '/api/roles?system=social-care', cookie)).status).toBe(200)
  })
})

describe('Papéis · escrita — X-Actor-Id + CSRF', () => {
  test('POST /people/:id/roles → 201 + X-Actor-Id = sub', async () => {
    const { app, fake } = pplApp(['admin'])
    const cookie = await driveSession(app)
    const res = await MUT(app, 'POST', '/api/people/p1/roles', cookie, true, { system: 'social-care', role: 'worker' })
    expect(res.status).toBe(201)
    expect(fake.calls.actors[0]).toBe('user-1')
  })

  test('POST /people/:id/roles sem CSRF → 403 sem tocar upstream', async () => {
    const { app, fake } = pplApp(['admin'])
    const cookie = await driveSession(app)
    const res = await MUT(app, 'POST', '/api/people/p1/roles', cookie, false, { system: 'social-care', role: 'worker' })
    expect(res.status).toBe(403)
    expect(fake.calls.actors.length).toBe(0)
  })

  test('PUT roles/:roleId/deactivate e reactivate → X-Actor-Id enviado', async () => {
    const { app, fake } = pplApp(['admin'])
    const cookie = await driveSession(app)
    expect((await MUT(app, 'PUT', '/api/people/p1/roles/r1/deactivate', cookie)).status).toBe(200)
    expect((await MUT(app, 'PUT', '/api/people/p1/roles/r1/reactivate', cookie)).status).toBe(200)
    expect(fake.calls.actors).toEqual(['user-1', 'user-1'])
  })
})

describe('Admin · reconcile-idp — defesa superadmin', () => {
  test('sem superadmin (admin não basta) → 403 sem tocar upstream', async () => {
    const { app, fake } = pplApp(['admin'])
    const cookie = await driveSession(app)
    expect((await MUT(app, 'POST', '/api/admin/reconcile-idp', cookie)).status).toBe(403)
    expect(fake.calls.actors.length).toBe(0)
  })

  test('superadmin → 200 + relatório', async () => {
    const { app, fake } = pplApp(['superadmin'])
    const cookie = await driveSession(app)
    const res = await MUT(app, 'POST', '/api/admin/reconcile-idp', cookie)
    expect(res.status).toBe(200)
    expect((await res.json()).data.checked).toBeDefined()
    expect(fake.calls.actors[0]).toBe('user-1')
  })
})

describe('Pessoas · rotas restantes', () => {
  test('GET /people/by-cpf/:cpf → 200 (não confunde com :id/roles)', async () => {
    const { app } = pplApp(['worker'])
    const cookie = await driveSession(app)
    const res = await GET(app, '/api/people/by-cpf/12345678901', cookie)
    expect(res.status).toBe(200)
    expect((await res.json()).data.id).toBeDefined()
  })

  test('POST request-password-reset → 202, X-Actor-Id, e NENHUM link no corpo', async () => {
    const { app, fake } = pplApp(['admin'])
    const cookie = await driveSession(app)
    const res = await MUT(app, 'POST', '/api/people/p1/request-password-reset', cookie)
    expect(res.status).toBe(202)
    expect(fake.calls.actors[0]).toBe('user-1')
    const text = await res.text()
    expect(text.toLowerCase()).not.toContain('http') // link viaja por NATS, nunca no HTTP
    expect(text.toLowerCase()).not.toContain('recovery')
  })

  test('POST /people/:id/login (provisão) → 201 + X-Actor-Id', async () => {
    const { app, fake } = pplApp(['admin'])
    const cookie = await driveSession(app)
    const res = await MUT(app, 'POST', '/api/people/p1/login', cookie, true, { email: 'a@b.com' })
    expect(res.status).toBe(201)
    expect(fake.calls.actors[0]).toBe('user-1')
  })
})
