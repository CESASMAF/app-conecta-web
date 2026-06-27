// Contract test do setor Cuidado Clínico (social-care). Prova: validação no BFF (≥1 narrativa REGA-006 +
// estrutura TypeBox) antes do upstream, encaminhamento (ator do JWT.sub), CSRF/sessão, erro de estado.
import { test, expect, describe } from 'bun:test'
import { makeApp, driveSession } from '../modules/auth/_fakes'
import { makeFakeSocialCare } from '../support/social-care-fake'
import { ok, err } from '~/shared/http/result'
import { appError } from '~/shared/http/app-error'

type ScApp = ReturnType<typeof makeApp>

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

describe('Cuidado Clínico · appointments + intake-info', () => {
  test('appointment com narrativa → 201 {id}', async () => {
    const fake = makeFakeSocialCare()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    const res = await MUT(app, 'POST', '/api/patients/p1/appointments', cookie, true, { professionalId: 'prof-1', summary: 'Sessão inicial' })
    expect(res.status).toBe(201)
    expect((await res.json()).data.id).toBe('appt-1')
    expect(fake.calls.commands).toContain('appointment')
  })

  test('appointment SEM summary nem actionPlan → 422 (REGA-006) sem tocar upstream', async () => {
    const fake = makeFakeSocialCare()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    const res = await MUT(app, 'POST', '/api/patients/p1/appointments', cookie, true, { professionalId: 'prof-1' })
    expect(res.status).toBe(422)
    expect(fake.calls.commands.length).toBe(0)
  })

  test('intake-info válido → 200 ack', async () => {
    const fake = makeFakeSocialCare()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    const res = await MUT(app, 'PUT', '/api/patients/p1/intake-info', cookie, true, {
      ingressTypeId: 'it-1',
      serviceReason: 'Encaminhamento CRAS',
      linkedSocialPrograms: [{ programId: 'pg-1' }],
    })
    expect(res.status).toBe(200)
    expect(fake.calls.commands).toContain('intake-info')
  })

  test('CSRF sem X-Requested-With → 403; sem sessão → 401 (nenhum toca upstream)', async () => {
    const fake = makeFakeSocialCare()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    expect((await MUT(app, 'POST', '/api/patients/p1/appointments', cookie, false, { professionalId: 'p', summary: 'x' })).status).toBe(403)
    expect((await MUT(app, 'PUT', '/api/patients/p1/intake-info', '', true, { ingressTypeId: 'i', serviceReason: 'r', linkedSocialPrograms: [] })).status).toBe(401)
    expect(fake.calls.commands.length).toBe(0)
  })

  test('paciente não-ativo no upstream (REGA-011) → 409', async () => {
    const fake = makeFakeSocialCare({ onMutate: () => err(appError('conflict', 'REGA-011')) })
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    expect((await MUT(app, 'POST', '/api/patients/p1/appointments', cookie, true, { professionalId: 'p', summary: 'x' })).status).toBe(409)
  })

  test('appointment SEM professionalId → 201 (default = usuário logado)', async () => {
    const fake = makeFakeSocialCare()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    const res = await MUT(app, 'POST', '/api/patients/p1/appointments', cookie, true, { summary: 'Sessão' })
    expect(res.status).toBe(201)
    expect(fake.calls.commands).toContain('appointment')
  })
})

describe('Cuidado/Proteção · GET estado (do agregado)', () => {
  const GET = (app: ScApp, path: string, cookie: string) =>
    app.handle(new Request(`http://localhost${path}`, { headers: cookie ? { cookie } : {} }))

  test('GET /care → 200 com listas/seções; auditoria via GET /audit-trail', async () => {
    const fake = makeFakeSocialCare({
      care: async () =>
        ok({
          appointments: [{ id: 'a-1', date: '2025-01-02', professionalId: 'u-1', type: 'clínico', summary: 's', actionPlan: '' }],
          intakeInfo: null,
          placementHistory: null,
          violationReports: [],
          referrals: [],
        }),
    })
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    const care = await (await GET(app, '/api/patients/p1/care', cookie)).json()
    expect(care.data.appointments).toHaveLength(1)
    expect(care.data.intakeInfo).toBeNull()
    const audit = await (await GET(app, '/api/patients/p1/audit-trail?limit=50', cookie)).json()
    expect(Array.isArray(audit.data)).toBe(true)
  })

  test('GET /care sem sessão → 401', async () => {
    const fake = makeFakeSocialCare()
    const app = makeApp(fake)
    expect((await GET(app, '/api/patients/p1/care', '')).status).toBe(401)
  })
})
