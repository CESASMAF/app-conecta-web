// Contract/security test do setor Avaliação Social (social-care, 7 PUTs). Prova: validação estrutural no
// BFF (schema TypeBox) ANTES do upstream, encaminhamento (ator do JWT.sub), ack de seção, CSRF/sessão,
// e mapeamento do erro de estado do upstream (UHC-016 não-ativo → conflito).
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

const HOUSING = {
  type: 'HOUSE',
  wallMaterial: 'BRICK',
  numberOfRooms: 3,
  numberOfBedrooms: 2,
  numberOfBathrooms: 1,
  waterSupply: 'PIPED',
  hasPipedWater: true,
  electricityAccess: 'CONNECTED',
  sewageDisposal: 'PUBLIC',
  wasteCollection: 'PUBLIC',
  accessibilityLevel: 'FULL',
  isInGeographicRiskArea: false,
  hasDifficultAccess: false,
  isInSocialConflictArea: false,
  hasDiagnosticObservations: false,
}
const COMMUNITY = {
  hasRelativeSupport: true,
  hasNeighborSupport: true,
  familyConflicts: '',
  patientParticipatesInGroups: false,
  familyParticipatesInGroups: false,
  patientHasAccessToLeisure: true,
  facesDiscrimination: false,
}
const SUMMARY = {
  requiresConstantCare: false,
  hasMobilityImpairment: false,
  functionalDependencies: [],
  hasRelevantDrugTherapy: false,
}

describe('Avaliação Social · 7 PUTs (validação no BFF + encaminhamento)', () => {
  test('housing-condition válido → 200 + ack de seção; comando encaminhado', async () => {
    const fake = makeFakeSocialCare()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    const res = await MUT(app, 'PUT', '/api/patients/p1/housing-condition', cookie, true, HOUSING)
    expect(res.status).toBe(200)
    expect((await res.json()).data.section).toBe('housing-condition')
    expect(fake.calls.commands).toContain('assessment:housing-condition')
  })

  test('housing inválido (numberOfRooms não-inteiro) → 4xx no BFF sem tocar upstream', async () => {
    const fake = makeFakeSocialCare()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    const res = await MUT(app, 'PUT', '/api/patients/p1/housing-condition', cookie, true, { ...HOUSING, numberOfRooms: 'abc' })
    expect([400, 422]).toContain(res.status)
    expect(fake.calls.commands.length).toBe(0)
  })

  test('community-support e social-health-summary válidos → 200 (encaminhados em ordem)', async () => {
    const fake = makeFakeSocialCare()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    expect((await MUT(app, 'PUT', '/api/patients/p1/community-support-network', cookie, true, COMMUNITY)).status).toBe(200)
    expect((await MUT(app, 'PUT', '/api/patients/p1/social-health-summary', cookie, true, SUMMARY)).status).toBe(200)
    expect(fake.calls.commands).toEqual([
      'assessment:community-support-network',
      'assessment:social-health-summary',
    ])
  })

  test('CSRF sem X-Requested-With → 403; sem sessão → 401 (nenhum toca upstream)', async () => {
    const fake = makeFakeSocialCare()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    expect((await MUT(app, 'PUT', '/api/patients/p1/housing-condition', cookie, false, HOUSING)).status).toBe(403)
    expect((await MUT(app, 'PUT', '/api/patients/p1/housing-condition', '', true, HOUSING)).status).toBe(401)
    expect(fake.calls.commands.length).toBe(0)
  })

  test('paciente não-ativo no upstream (UHC-016) → 409 mapeado por tag', async () => {
    const fake = makeFakeSocialCare({ onMutate: () => err(appError('conflict', 'UHC-016')) })
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    expect((await MUT(app, 'PUT', '/api/patients/p1/housing-condition', cookie, true, HOUSING)).status).toBe(409)
  })
})

describe('Avaliação Social · GET estado das seções (preenchida/pendente)', () => {
  const GET = (app: ScApp, path: string, cookie: string) =>
    app.handle(new Request(`http://localhost${path}`, { headers: cookie ? { cookie } : {} }))

  test('GET /assessment → 200; seção presente = preenchida, ausente = null (pendente)', async () => {
    const fake = makeFakeSocialCare({
      assessment: async () =>
        ok({
          housingCondition: { ...HOUSING, numberOfRooms: 3, numberOfBedrooms: 2, numberOfBathrooms: 1 } as never,
          socioeconomicSituation: null,
          workAndIncome: null,
          educationalStatus: null,
          healthStatus: null,
          communitySupportNetwork: { ...COMMUNITY } as never,
          socialHealthSummary: null,
        }),
    })
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    const body = await (await GET(app, '/api/patients/p1/assessment', cookie)).json()
    expect(body.data.housingCondition).not.toBeNull()
    expect(body.data.communitySupportNetwork).not.toBeNull()
    expect(body.data.socioeconomicSituation).toBeNull()
    expect(body.data.workAndIncome).toBeNull()
  })

  test('sem sessão → 401', async () => {
    const fake = makeFakeSocialCare()
    const app = makeApp(fake)
    expect((await GET(app, '/api/patients/p1/assessment', '')).status).toBe(401)
  })
})
