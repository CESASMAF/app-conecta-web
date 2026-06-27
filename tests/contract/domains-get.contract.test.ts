// Contract test do BFF GET /api/domains/:tableName (US4) — allowlist + passthrough + 403/401.
import { test, expect, describe } from 'bun:test'
import { makeApp, driveSession } from '../modules/auth/_fakes'
import { makeFakeSocialCare } from '../support/social-care-fake'
import { ok, err } from '~/shared/http/result'
import { appError } from '~/shared/http/app-error'

const get = (app: ReturnType<typeof makeApp>, path: string, cookie: string) =>
  app.handle(new Request(`http://localhost${path}`, { headers: { cookie } }))

describe('GET /api/domains/:tableName (contract)', () => {
  test('LKP-T001: tabela permitida → 200 itens (ordem do upstream) + Bearer', async () => {
    const items = [
      { id: '1', codigo: 'AUX_GAS', descricao: 'Auxílio Gás' },
      { id: '2', codigo: 'BPC', descricao: 'Benefício de Prestação Continuada' },
    ]
    const fake = makeFakeSocialCare({ domain: async () => ok(items) })
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    const res = await get(app, '/api/domains/dominio_parentesco', cookie)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data).toEqual(items)
    expect(fake.calls.domainTables[0]).toBe('dominio_parentesco')
    expect(fake.calls.tokens[0]).toBe('at')
  })

  test('LKP-T002: tabela fora da allowlist → 400 LKP-001 SEM tocar o upstream', async () => {
    const fake = makeFakeSocialCare()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    const res = await get(app, '/api/domains/usuarios', cookie)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error.code).toBe('LKP-001')
    expect(fake.calls.domainTables.length).toBe(0)
  })

  test('G1: upstream 403 → 403 forbidden', async () => {
    const fake = makeFakeSocialCare({ domain: async () => err(appError('forbidden', 'RBAC-001')) })
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    expect((await get(app, '/api/domains/dominio_parentesco', cookie)).status).toBe(403)
  })

  test('sem sessão → 401', async () => {
    const app = makeApp()
    expect((await get(app, '/api/domains/dominio_parentesco', '')).status).toBe(401)
  })
})
