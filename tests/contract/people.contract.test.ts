// Contract/security test do setor Pessoas & Identidade (people-context). Prova: política de ator
// (X-Actor-Id = sub nas mutações), composição view-ready do overview (dados + papéis, com degradação
// parcial), tratamento de 207 (IdP não provisionado), CSRF e a defesa de superadmin no erasure.
import { test, expect, describe } from 'bun:test'
import { createApp } from '~/server/app'
import { fakeDeps, driveSession, oidcWithGroups } from '../modules/auth/_fakes'
import { makeFakePeople } from '../support/people-context-fake'
import { ok, err } from '~/shared/http/result'
import { appError } from '~/shared/http/app-error'

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

const VALID = { fullName: 'Maria', birthDate: '1990-01-01' }

describe('Pessoas · leitura', () => {
  test('GET /people → 200 + Bearer da sessão + envelope', async () => {
    const { app, fake } = pplApp(['worker'])
    const cookie = await driveSession(app)
    const res = await GET(app, '/api/people', cookie)
    expect(res.status).toBe(200)
    expect(Array.isArray((await res.json()).data)).toBe(true)
    expect(fake.calls.tokens[0]).toBe('at')
  })

  test('GET /people sem sessão → 401 e nenhum Bearer ao upstream', async () => {
    const { app, fake } = pplApp(['worker'])
    expect((await GET(app, '/api/people', '')).status).toBe(401)
    expect(fake.calls.tokens.length).toBe(0)
  })

  test('GET /people/:id → overview COMPOSTO (dados + papéis resolvidos no servidor)', async () => {
    const { app } = pplApp(['worker'])
    const cookie = await driveSession(app)
    const body = await (await GET(app, '/api/people/p1', cookie)).json()
    expect(body.data.id).toBe('p1')
    expect(body.data.roles[0].system).toBe('social-care')
    expect(body.data.partial).toBe(false)
  })

  test('overview DEGRADA (partial) se os papéis falham — tela não quebra', async () => {
    const fake = makeFakePeople({ roles: async () => err(appError('dependencyUnavailable', 'X')) })
    const { app } = pplApp(['worker'], fake)
    const cookie = await driveSession(app)
    const body = await (await GET(app, '/api/people/p1', cookie)).json()
    expect(body.data.partial).toBe(true)
    expect(body.data.roles.length).toBe(0)
  })

  test('overview de pessoa inexistente → 404 (origem primária)', async () => {
    const fake = makeFakePeople({ person: async () => err(appError('notFound', 'PEO-002')) })
    const { app } = pplApp(['worker'], fake)
    const cookie = await driveSession(app)
    expect((await GET(app, '/api/people/zzz', cookie)).status).toBe(404)
  })
})

describe('Pessoas · escrita — política X-Actor-Id + CSRF', () => {
  test('POST /people → 201 e X-Actor-Id = sub da sessão (não header de cliente)', async () => {
    const { app, fake } = pplApp(['worker'])
    const cookie = await driveSession(app)
    const res = await MUT(app, 'POST', '/api/people', cookie, true, VALID)
    expect(res.status).toBe(201)
    expect(fake.calls.actors[0]).toBe('user-1') // sub do oidcWithGroups → X-Actor-Id
  })

  test('POST /people sem X-Requested-With → 403 (CSRF) sem tocar upstream', async () => {
    const { app, fake } = pplApp(['worker'])
    const cookie = await driveSession(app)
    expect((await MUT(app, 'POST', '/api/people', cookie, false, VALID)).status).toBe(403)
    expect(fake.calls.actors.length).toBe(0)
  })

  test('POST /people body inválido (fullName vazio) → 4xx sem tocar upstream', async () => {
    const { app, fake } = pplApp(['worker'])
    const cookie = await driveSession(app)
    const res = await MUT(app, 'POST', '/api/people', cookie, true, { fullName: '', birthDate: '1990-01-01' })
    expect([400, 422]).toContain(res.status)
    expect(fake.calls.actors.length).toBe(0)
  })

  test('POST /people com IdP não provisionado (207) → meta.warning honesto', async () => {
    const fake = makeFakePeople({ create: async () => ok({ id: 'person-9', idpProvisioned: false }) })
    const { app } = pplApp(['worker'], fake)
    const cookie = await driveSession(app)
    const body = await (await MUT(app, 'POST', '/api/people', cookie, true, VALID)).json()
    expect(body.meta.warning).toBe('idp-not-provisioned')
  })

  test('PUT /people/:id → X-Actor-Id enviado', async () => {
    const { app, fake } = pplApp(['admin'])
    const cookie = await driveSession(app)
    const res = await MUT(app, 'PUT', '/api/people/p1', cookie, true, VALID)
    expect(res.status).toBe(200)
    expect(fake.calls.actors[0]).toBe('user-1')
  })
})

describe('Pessoas · erasure LGPD — defesa superadmin no BFF', () => {
  test('DELETE /people/:id sem superadmin (admin não basta) → 403 sem tocar upstream', async () => {
    const { app, fake } = pplApp(['admin'])
    const cookie = await driveSession(app)
    expect((await MUT(app, 'DELETE', '/api/people/p1', cookie)).status).toBe(403)
    expect(fake.calls.actors.length).toBe(0)
  })

  test('DELETE /people/:id com superadmin → 200', async () => {
    const { app, fake } = pplApp(['superadmin'])
    const cookie = await driveSession(app)
    expect((await MUT(app, 'DELETE', '/api/people/p1', cookie)).status).toBe(200)
    expect(fake.calls.actors[0]).toBe('user-1')
  })
})
