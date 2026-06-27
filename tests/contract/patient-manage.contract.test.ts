// Contract/security test do setor Pacientes (gestão — social-care). Prova: composição view-ready (rótulos
// de domínio resolvidos NO SERVIDOR + transições por situação + degradação parcial), mutação devolve
// view-state recomposto (não 204), validação de reason/notes antes do upstream, CSRF, erro de estado, e a
// POLÍTICA DE ATOR (social-care NUNCA recebe header de ator — ≠ people-context).
import { test, expect, describe, afterAll } from 'bun:test'
import { makeApp, driveSession } from '../modules/auth/_fakes'
import { makeFakeSocialCare } from '../support/social-care-fake'
import { createSocialCareClient } from '~/external/social-care-client'
import { ok, err } from '~/shared/http/result'
import { appError } from '~/shared/http/app-error'

type ScApp = ReturnType<typeof makeApp>

// fake com catálogos que resolvem rótulos (parentesco rel-1→Mãe, identidade ti-1→Indígena).
const catalogFake = () =>
  makeFakeSocialCare({
    domain: async (_t, table) =>
      ok(
        table === 'dominio_parentesco'
          ? [{ id: 'rel-1', codigo: 'MAE', descricao: 'Mãe' }]
          : table === 'dominio_tipo_identidade'
            ? [{ id: 'ti-1', codigo: 'IND', descricao: 'Indígena' }]
            : [],
      ),
  })

const GET = (app: ScApp, path: string, cookie: string) =>
  app.handle(new Request(`http://localhost${path}`, { headers: cookie ? { cookie } : {} }))

const MUT = (app: ScApp, method: string, path: string, cookie: string, csrf = true, body?: unknown) =>
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

describe('Pacientes · overview composto (view-ready)', () => {
  test('rótulos de domínio resolvidos NO SERVIDOR + transições por situação', async () => {
    const fake = catalogFake()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    const body = await (await GET(app, '/api/patients/p1/overview', cookie)).json()
    expect(body.data.statusLabel).toBe('Em fila de espera') // WAITLISTED
    expect(body.data.availableTransitions.some((t: { action: string }) => t.action === 'admit')).toBe(true)
    expect(body.data.family.members[0].relationshipLabel).toBe('Mãe') // código→rótulo no BFF
    expect(body.data.socialIdentity.typeLabel).toBe('Indígena')
    expect(body.data.partial).toBe(false)
  })

  test('degrada (partial) se os catálogos falham — rótulo cai pro id, tela não quebra', async () => {
    const fake = makeFakeSocialCare({ domain: async () => err(appError('dependencyUnavailable', 'X')) })
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    const body = await (await GET(app, '/api/patients/p1/overview', cookie)).json()
    expect(body.data.partial).toBe(true)
    expect(body.data.family.members[0].relationshipLabel).toBe('rel-1')
  })
})

describe('Pacientes · ciclo de vida (mutação devolve view-state)', () => {
  test('admit → 200 + overview recomposto (NÃO 204)', async () => {
    const fake = catalogFake()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    const res = await MUT(app, 'POST', '/api/patients/p1/admit', cookie)
    expect(res.status).toBe(200)
    expect(fake.calls.commands).toContain('admit')
    expect((await res.json()).data.statusLabel).toBeDefined()
  })

  test('admit sem CSRF → 403 sem tocar upstream', async () => {
    const fake = makeFakeSocialCare()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    expect((await MUT(app, 'POST', '/api/patients/p1/admit', cookie, false)).status).toBe(403)
    expect(fake.calls.commands.length).toBe(0)
  })

  test('admit em estado inválido → conflito do upstream (409) tratado', async () => {
    const fake = makeFakeSocialCare({ onMutate: () => err(appError('conflict', 'ADM-002')) })
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    expect((await MUT(app, 'POST', '/api/patients/p1/admit', cookie)).status).toBe(409)
  })

  test('discharge: reason inválido → 400 sem tocar upstream', async () => {
    const fake = makeFakeSocialCare()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    expect((await MUT(app, 'POST', '/api/patients/p1/discharge', cookie, true, { reason: 'xpto' })).status).toBe(400)
    expect(fake.calls.commands.length).toBe(0)
  })

  test('discharge: reason=other sem notes → 400', async () => {
    const fake = makeFakeSocialCare()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    expect((await MUT(app, 'POST', '/api/patients/p1/discharge', cookie, true, { reason: 'other' })).status).toBe(400)
    expect(fake.calls.commands.length).toBe(0)
  })

  test('discharge válido → 200 + overview', async () => {
    const fake = catalogFake()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    const res = await MUT(app, 'POST', '/api/patients/p1/discharge', cookie, true, { reason: 'improved' })
    expect(res.status).toBe(200)
    expect(fake.calls.commands).toContain('discharge')
  })

  test('withdraw: reason=other sem notes → 400; readmit → 200', async () => {
    const fake = catalogFake()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    expect((await MUT(app, 'POST', '/api/patients/p1/withdraw', cookie, true, { reason: 'other' })).status).toBe(400)
    expect((await MUT(app, 'POST', '/api/patients/p1/readmit', cookie, true, {})).status).toBe(200)
    expect(fake.calls.commands).toContain('readmit')
  })
})

describe('Pacientes · família + identidade (recompõem o overview)', () => {
  const VALID_MEMBER = {
    memberPersonId: 'm-2',
    relationship: 'rel-1',
    isResiding: true,
    isCaregiver: false,
    hasDisability: false,
    requiredDocuments: ['CPF'],
    birthDate: '2000-01-01',
    prRelationshipId: 'rel-1',
  }

  test('add member → 200 + overview; remove → 200; caregiver → 200; identity → 200', async () => {
    const fake = catalogFake()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    expect((await MUT(app, 'POST', '/api/patients/p1/family-members', cookie, true, VALID_MEMBER)).status).toBe(200)
    expect((await MUT(app, 'DELETE', '/api/patients/p1/family-members/m-1', cookie)).status).toBe(200)
    expect((await MUT(app, 'PUT', '/api/patients/p1/primary-caregiver', cookie, true, { memberPersonId: 'm-1' })).status).toBe(200)
    expect((await MUT(app, 'PUT', '/api/patients/p1/social-identity', cookie, true, { typeId: 'ti-1' })).status).toBe(200)
    expect(fake.calls.commands).toEqual(['family-add', 'family-remove', 'caregiver', 'social-identity'])
  })

  test('add member com body inválido → 4xx sem tocar upstream', async () => {
    const fake = makeFakeSocialCare()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    const res = await MUT(app, 'POST', '/api/patients/p1/family-members', cookie, true, { memberPersonId: '' })
    expect([400, 422]).toContain(res.status)
    expect(fake.calls.commands.length).toBe(0)
  })
})

describe('Pacientes · cadastro (POST /patients) + form-context', () => {
  const VALID = {
    personId: 'person-1',
    initialDiagnoses: [{ icdCode: 'F90', date: '2020-01-01', description: 'TDAH' }],
    prRelationshipId: 'rel-1',
  }

  test('cadastro válido → 201 + overview recomposto (view-state, não só {id})', async () => {
    const fake = catalogFake()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    const res = await MUT(app, 'POST', '/api/patients', cookie, true, VALID)
    expect(res.status).toBe(201)
    expect(fake.calls.commands).toContain('create')
    expect((await res.json()).data.statusLabel).toBeDefined()
  })

  test('body inválido (sem diagnoses) → 4xx sem tocar upstream', async () => {
    const fake = makeFakeSocialCare()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    const res = await MUT(app, 'POST', '/api/patients', cookie, true, { personId: 'p', initialDiagnoses: [], prRelationshipId: 'r' })
    expect([400, 422]).toContain(res.status)
    expect(fake.calls.commands.length).toBe(0)
  })

  test('conflito pessoa-já-tem-paciente (REGP-001) → 409', async () => {
    const fake = makeFakeSocialCare({ create: async () => err(appError('conflict', 'REGP-001')) })
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    expect((await MUT(app, 'POST', '/api/patients', cookie, true, VALID)).status).toBe(409)
  })

  test('people-context fora no cadastro (REGP-031) → 503 (fail-secure)', async () => {
    const fake = makeFakeSocialCare({ create: async () => err(appError('dependencyUnavailable', 'REGP-031')) })
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    expect((await MUT(app, 'POST', '/api/patients', cookie, true, VALID)).status).toBe(503)
  })

  test('CSRF sem X-Requested-With → 403; sem sessão → 401 (nenhum toca upstream)', async () => {
    const fake = makeFakeSocialCare()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    expect((await MUT(app, 'POST', '/api/patients', cookie, false, VALID)).status).toBe(403)
    expect((await MUT(app, 'POST', '/api/patients', '', true, VALID)).status).toBe(401)
    expect(fake.calls.commands.length).toBe(0)
  })

  test('GET /patients/new/form-context → 200 + catálogos do formulário (servidos pelo BFF)', async () => {
    const fake = catalogFake()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    const body = await (await GET(app, '/api/patients/new/form-context', cookie)).json()
    expect(Array.isArray(body.data.relationships)).toBe(true)
    expect(Array.isArray(body.data.identityTypes)).toBe(true)
  })
})

describe('Pacientes · política de ator (social-care NÃO recebe header de ator)', () => {
  const received: { method: string; auth: string | null; actor: string | null }[] = []
  const server = Bun.serve({
    port: 0,
    fetch(req) {
      received.push({
        method: req.method,
        auth: req.headers.get('authorization'),
        actor: req.headers.get('x-actor-id'),
      })
      return new Response(null, { status: 204 })
    },
  })
  afterAll(() => server.stop(true))

  test('admitPatient envia Bearer mas NUNCA X-Actor-Id (ator do JWT.sub)', async () => {
    const client = createSocialCareClient(`http://localhost:${server.port}`)
    await client.admitPatient('tok-1', 'p1')
    const call = received.find((r) => r.method === 'POST')
    expect(call?.auth).toBe('Bearer tok-1')
    expect(call?.actor).toBeNull()
  })
})
