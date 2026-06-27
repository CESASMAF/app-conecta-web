// Contract test do BFF GET /api/patients/:id (US3) — cabeçalho mínimo / 404 / 403.
import { test, expect, describe } from 'bun:test'
import { makeApp, driveSession } from '../modules/auth/_fakes'
import { makeFakeSocialCare } from '../support/social-care-fake'
import { ok, err } from '~/shared/http/result'
import { appError } from '~/shared/http/app-error'

const get = (app: ReturnType<typeof makeApp>, path: string, cookie: string) =>
  app.handle(new Request(`http://localhost${path}`, { headers: { cookie } }))

describe('GET /api/patients/:id (contract)', () => {
  test('200: cabeçalho mínimo + Bearer da sessão', async () => {
    const fake = makeFakeSocialCare({ header: async (_t, id) => ok({ patientId: id, fullName: 'Ana Souza', status: 'ACTIVE' }) })
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    const res = await get(app, '/api/patients/p-1', cookie)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data).toMatchObject({ patientId: 'p-1', fullName: 'Ana Souza', status: 'ACTIVE' })
    expect(fake.calls.tokens[0]).toBe('at')
  })

  test('REG-014: paciente inexistente → 404', async () => {
    const fake = makeFakeSocialCare({ header: async () => err(appError('notFound', 'REGP-404')) })
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    expect((await get(app, '/api/patients/zzz', cookie)).status).toBe(404)
  })

  test('G1: upstream 403 → 403 forbidden', async () => {
    const fake = makeFakeSocialCare({ header: async () => err(appError('forbidden', 'RBAC-001')) })
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    expect((await get(app, '/api/patients/p-1', cookie)).status).toBe(403)
  })

  test('sem sessão → 401', async () => {
    const app = makeApp()
    expect((await get(app, '/api/patients/p-1', '')).status).toBe(401)
  })
})
