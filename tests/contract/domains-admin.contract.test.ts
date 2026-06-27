// Contract test do setor Domínios & Governança (social-care, admin). Prova: ALLOWLIST de tabelas enforçada
// no BFF (fora da lista → 400 sem tocar upstream), fluxo de solicitação/aprovação, validação TypeBox, CSRF.
import { test, expect, describe } from 'bun:test'
import { makeApp, driveSession } from '../modules/auth/_fakes'
import { makeFakeSocialCare } from '../support/social-care-fake'

type ScApp = ReturnType<typeof makeApp>

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

describe('Domínios · CRUD de itens (allowlist no BFF)', () => {
  test('criar item em tabela permitida → 201 {id}', async () => {
    const fake = makeFakeSocialCare()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    const res = await MUT(app, 'POST', '/api/domains/dominio_parentesco', cookie, true, { codigo: 'MAE', descricao: 'Mãe' })
    expect(res.status).toBe(201)
    expect((await res.json()).data.id).toBe('lkp-1')
    expect(fake.calls.commands).toContain('lookup-create')
  })

  test('tabela fora da allowlist → 400 (LKP-001) sem tocar upstream', async () => {
    const fake = makeFakeSocialCare()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    const res = await MUT(app, 'POST', '/api/domains/tabela_invalida', cookie, true, { codigo: 'X', descricao: 'Y' })
    expect(res.status).toBe(400)
    expect(fake.calls.commands.length).toBe(0)
  })

  test('atualizar descrição → 200; toggle → 200', async () => {
    const fake = makeFakeSocialCare()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    expect((await MUT(app, 'PUT', '/api/domains/dominio_parentesco/item-1', cookie, true, { descricao: 'Genitora' })).status).toBe(200)
    expect((await MUT(app, 'PATCH', '/api/domains/dominio_parentesco/item-1/toggle', cookie)).status).toBe(200)
    expect(fake.calls.commands).toEqual(['lookup-update', 'lookup-toggle'])
  })
})

describe('Domínios · governança (solicitação/aprovação)', () => {
  test('GET /domains/requests → 200 (não colide com /domains/:tableName)', async () => {
    const fake = makeFakeSocialCare()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    expect((await GET(app, '/api/domains/requests', cookie)).status).toBe(200)
  })

  test('POST request → 201; approve → 200; reject → 200', async () => {
    const fake = makeFakeSocialCare()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    const c = await MUT(app, 'POST', '/api/domains/requests', cookie, true, { tableName: 'dominio_parentesco', codigo: 'X', descricao: 'Y', justificativa: 'porque' })
    expect(c.status).toBe(201)
    expect((await c.json()).data.id).toBe('lkr-1')
    expect((await MUT(app, 'PUT', '/api/domains/requests/req-1/approve', cookie)).status).toBe(200)
    expect((await MUT(app, 'PUT', '/api/domains/requests/req-1/reject', cookie, true, { reviewNote: 'duplicado' })).status).toBe(200)
    expect(fake.calls.commands).toEqual(['request-create', 'request-approve', 'request-reject'])
  })

  test('reject sem reviewNote → 4xx sem tocar upstream', async () => {
    const fake = makeFakeSocialCare()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    const res = await MUT(app, 'PUT', '/api/domains/requests/req-1/reject', cookie, true, {})
    expect([400, 422]).toContain(res.status)
    expect(fake.calls.commands.length).toBe(0)
  })

  test('CSRF sem X-Requested-With → 403; sem sessão → 401', async () => {
    const fake = makeFakeSocialCare()
    const app = makeApp(fake)
    const cookie = await driveSession(app)
    expect((await MUT(app, 'POST', '/api/domains/dominio_parentesco', cookie, false, { codigo: 'X', descricao: 'Y' })).status).toBe(403)
    expect((await GET(app, '/api/domains/requests', '')).status).toBe(401)
  })
})
