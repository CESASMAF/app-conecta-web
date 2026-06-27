// Contract test do setor Auditoria (social-care). Prova: leitura da trilha com Bearer, validação de limit
// no BFF (1–200) antes do upstream, sem sessão → 401.
import { test, expect, describe } from 'bun:test'
import { makeApp, driveSession } from '../modules/auth/_fakes'
import { makeFakeSocialCare } from '../support/social-care-fake'

type ScApp = ReturnType<typeof makeApp>

const GET = (app: ScApp, path: string, cookie: string) =>
  app.handle(new Request(`http://localhost${path}`, { headers: cookie ? { cookie } : {} }))

describe('Auditoria · audit-trail', () => {
  test('GET audit-trail → 200 + entradas + Bearer encaminhado', async () => {
    const fake = makeFakeSocialCare()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    const res = await GET(app, '/api/patients/p1/audit-trail', cookie)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data[0].eventType).toBe('PatientCreatedEvent')
    expect(fake.calls.tokens[0]).toBe('at')
  })

  test('limit fora de 1–200 → 400 sem tocar upstream', async () => {
    const fake = makeFakeSocialCare()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    expect((await GET(app, '/api/patients/p1/audit-trail?limit=0', cookie)).status).toBe(400)
    expect((await GET(app, '/api/patients/p1/audit-trail?limit=201', cookie)).status).toBe(400)
    expect(fake.calls.tokens.length).toBe(0)
  })

  test('sem sessão → 401 e nenhum Bearer ao upstream', async () => {
    const fake = makeFakeSocialCare()
    const app = makeApp(fake)
    const res = await GET(app, '/api/patients/p1/audit-trail', '')
    expect(res.status).toBe(401)
    expect(fake.calls.tokens.length).toBe(0)
  })
})
