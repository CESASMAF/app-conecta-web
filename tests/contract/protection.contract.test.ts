// Contract test do setor Proteção de Direitos (social-care). Prova: validação estrutural no BFF antes do
// upstream, encaminhamento (ator do JWT.sub), CSRF/sessão, e mapeamento de erro de fronteira do upstream.
import { test, expect, describe } from 'bun:test'
import { makeApp, driveSession } from '../modules/auth/_fakes'
import { makeFakeSocialCare } from '../support/social-care-fake'
import { err } from '~/shared/http/result'
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

const PLACEMENT = {
  registries: [{ memberId: 'm-1', startDate: '2024-01-01', reason: 'acolhimento' }],
  collectiveSituations: {},
  separationChecklist: { adultInPrison: false, adolescentInInternment: false },
}
const VIOLATION = { victimId: 'm-1', violationType: 'NEGLIGENCIA', descriptionOfFact: 'fato' }
const REFERRAL = { referredPersonId: 'm-1', destinationService: 'CRAS', reason: 'apoio' }

describe('Proteção de Direitos · placement + violation + referral', () => {
  test('placement-history válido → 200 ack', async () => {
    const fake = makeFakeSocialCare()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    expect((await MUT(app, 'PUT', '/api/patients/p1/placement-history', cookie, true, PLACEMENT)).status).toBe(200)
    expect(fake.calls.commands).toContain('placement')
  })

  test('violation-report válido → 201 {id}; referral válido → 201 {id}', async () => {
    const fake = makeFakeSocialCare()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    const v = await MUT(app, 'POST', '/api/patients/p1/violation-reports', cookie, true, VIOLATION)
    const f = await MUT(app, 'POST', '/api/patients/p1/referrals', cookie, true, REFERRAL)
    expect(v.status).toBe(201)
    expect((await v.json()).data.id).toBe('vr-1')
    expect(f.status).toBe(201)
    expect((await f.json()).data.id).toBe('ref-1')
    expect(fake.calls.commands).toEqual(['violation', 'referral'])
  })

  test('violation sem descriptionOfFact → 4xx sem tocar upstream', async () => {
    const fake = makeFakeSocialCare()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    const res = await MUT(app, 'POST', '/api/patients/p1/violation-reports', cookie, true, { victimId: 'm', violationType: 'X' })
    expect([400, 422]).toContain(res.status)
    expect(fake.calls.commands.length).toBe(0)
  })

  test('CSRF sem X-Requested-With → 403; sem sessão → 401', async () => {
    const fake = makeFakeSocialCare()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    expect((await MUT(app, 'POST', '/api/patients/p1/referrals', cookie, false, REFERRAL)).status).toBe(403)
    expect((await MUT(app, 'PUT', '/api/patients/p1/placement-history', '', true, PLACEMENT)).status).toBe(401)
    expect(fake.calls.commands.length).toBe(0)
  })

  test('vítima fora do núcleo no upstream (RRV-008) → 422 mapeado', async () => {
    const fake = makeFakeSocialCare({ onMutate: () => err(appError('validation', 'RRV-008')) })
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    expect((await MUT(app, 'POST', '/api/patients/p1/violation-reports', cookie, true, VIOLATION)).status).toBe(422)
  })
})
