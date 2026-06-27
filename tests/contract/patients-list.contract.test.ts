// Contract test do BFF GET /api/patients (US1) — orquestração contra o fake da porta social-care.
import { test, expect, describe } from 'bun:test'
import { makeApp, driveSession } from '../modules/auth/_fakes'
import { makeFakeSocialCare, fakePatients, pageOf } from '../support/social-care-fake'
import { ok, err } from '~/shared/http/result'
import { appError } from '~/shared/http/app-error'

const get = (app: ReturnType<typeof makeApp>, path: string, cookie: string) =>
  app.handle(new Request(`http://localhost${path}`, { headers: { cookie } }))

describe('GET /api/patients (contract)', () => {
  test('REG-010: 1ª página ≤20 + meta completo + Bearer da sessão encaminhado', async () => {
    const fake = makeFakeSocialCare({ patients: async () => ok(pageOf(fakePatients(20), 25, 'cur-2')) })
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    const res = await get(app, '/api/patients', cookie)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.length).toBe(20)
    expect(body.meta).toMatchObject({ pageSize: 20, totalCount: 25, hasMore: true, nextCursor: 'cur-2' })
    expect(fake.calls.tokens[0]).toBe('at') // accessToken da sessão (fakeOidc.exchangeCode)
    expect(fake.calls.listParams[0]!.limit).toBe(20) // default
  })

  test('REG-011: cursor encaminhado → última página com hasMore=false', async () => {
    const fake = makeFakeSocialCare({ patients: async () => ok(pageOf(fakePatients(5, 20), 25, null)) })
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    const res = await get(app, '/api/patients?cursor=cur-2', cookie)
    const body = await res.json()
    expect(body.meta.hasMore).toBe(false)
    expect(fake.calls.listParams[0]!.cursor).toBe('cur-2')
  })

  test('REG-012: limit fora de 1–100 → 400 SEM tocar o upstream', async () => {
    const fake = makeFakeSocialCare()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    expect((await get(app, '/api/patients?limit=0', cookie)).status).toBe(400)
    expect((await get(app, '/api/patients?limit=101', cookie)).status).toBe(400)
    expect(fake.calls.listParams.length).toBe(0)
  })

  test('REG-013: search + status mapeados ao upstream', async () => {
    const fake = makeFakeSocialCare()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    await get(app, '/api/patients?search=Maria&status=ACTIVE', cookie)
    expect(fake.calls.listParams[0]).toMatchObject({ search: 'Maria', status: 'ACTIVE' })
  })

  test('G3: sem sessão → 401 e NENHUM Bearer ao upstream', async () => {
    const fake = makeFakeSocialCare()
    const app = makeApp(fake)
    const res = await get(app, '/api/patients', '')
    expect(res.status).toBe(401)
    expect(fake.calls.tokens.length).toBe(0)
  })

  test('G1: upstream 403 → 403 forbidden, sem dado vazado', async () => {
    const fake = makeFakeSocialCare({ patients: async () => err(appError('forbidden', 'RBAC-001')) })
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    const res = await get(app, '/api/patients', cookie)
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error.code).toBe('RBAC-001')
    expect(body.data).toBeUndefined()
  })

  test('upstream 503 (dependência fora) → 503', async () => {
    const fake = makeFakeSocialCare({ patients: async () => err(appError('dependencyUnavailable', 'REGP-031')) })
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    expect((await get(app, '/api/patients', cookie)).status).toBe(503)
  })
})
