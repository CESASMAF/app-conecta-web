// Contract test do ADICIONAR MEMBRO orquestrado (Inc 3): o BFF cria a pessoa-membro nos bastidores
// (people-context, createLogin=false, X-Actor-Id=sub) e vincula no social-care, recompondo o overview.
// Prova: orquestração, xor member|memberPersonId, fail-secure (people fora → sem vínculo), retrocompat.
import { test, expect, describe } from 'bun:test'
import { makeApp, driveSession } from '../modules/auth/_fakes'
import { makeFakeSocialCare, type FakeConfig } from '../support/social-care-fake'
import { makeFakePeople } from '../support/people-context-fake'
import { ok, err } from '~/shared/http/result'
import { appError } from '~/shared/http/app-error'
import type { CreatePersonInput } from '~/external/people-context-client'

type ScApp = ReturnType<typeof makeApp>

const catalogCfg: FakeConfig = {
  domain: async (_t, table) => ok(table === 'dominio_parentesco' ? [{ id: 'rel-1', codigo: 'MAE', descricao: 'Mãe' }] : []),
}

const MUT = (app: ScApp, method: string, path: string, cookie: string, body?: unknown, csrf = true) =>
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

const MEMBER_BODY = {
  member: { fullName: 'Ana Souza', birthDate: '1980-03-02', cpf: '11144477735' },
  prRelationshipId: 'rel-1',
  isResiding: true,
  isCaregiver: false,
}

describe('Família · adicionar membro orquestrado (cria pessoa + vincula)', () => {
  test('member → cria pessoa (createLogin=false, ator=sub) e vincula; 200 + overview', async () => {
    const captured: { person?: CreatePersonInput } = {}
    const sc = makeFakeSocialCare(catalogCfg)
    const people = makeFakePeople({
      create: async (_t, _actor, input) => {
        captured.person = input
        return ok({ id: 'member-9', idpProvisioned: true })
      },
    })
    const app = makeApp(sc, { peopleContext: people })
    const cookie = await driveSession(app)

    const res = await MUT(app, 'POST', '/api/patients/p1/family-members', cookie, MEMBER_BODY)
    expect(res.status).toBe(200)
    expect(captured.person?.createLogin).toBe(false)
    expect(captured.person?.cpf).toBe('11144477735')
    expect(people.calls.actors).toContain('user-1')
    expect(sc.calls.commands).toContain('family-add')
    expect((await res.json()).data.family).toBeDefined()
  })

  test('xor: nem member nem memberPersonId → 422; ambos → 422 (sem tocar upstream)', async () => {
    const sc = makeFakeSocialCare(catalogCfg)
    const people = makeFakePeople()
    const app = makeApp(sc, { peopleContext: people })
    const cookie = await driveSession(app)

    const base = { prRelationshipId: 'rel-1', isResiding: true, isCaregiver: false }
    expect((await MUT(app, 'POST', '/api/patients/p1/family-members', cookie, base)).status).toBe(422)
    expect((await MUT(app, 'POST', '/api/patients/p1/family-members', cookie, { ...MEMBER_BODY, memberPersonId: 'm-x' })).status).toBe(422)
    expect(sc.calls.commands).not.toContain('family-add')
    expect(people.calls.actors.length).toBe(0)
  })

  test('people-context fora → 503 e o vínculo NÃO é criado (fail-secure)', async () => {
    const sc = makeFakeSocialCare(catalogCfg)
    const people = makeFakePeople({ create: async () => err(appError('dependencyUnavailable', 'PEO-503')) })
    const app = makeApp(sc, { peopleContext: people })
    const cookie = await driveSession(app)

    expect((await MUT(app, 'POST', '/api/patients/p1/family-members', cookie, MEMBER_BODY)).status).toBe(503)
    expect(sc.calls.commands).not.toContain('family-add')
  })

  test('retrocompat: memberPersonId continua válido e NÃO toca o people-context', async () => {
    let personCalled = false
    const sc = makeFakeSocialCare(catalogCfg)
    const people = makeFakePeople({
      create: async () => {
        personCalled = true
        return ok({ id: 'x', idpProvisioned: true })
      },
    })
    const app = makeApp(sc, { peopleContext: people })
    const cookie = await driveSession(app)

    const legacy = {
      memberPersonId: 'm-2',
      relationship: 'rel-1',
      isResiding: true,
      isCaregiver: false,
      hasDisability: false,
      requiredDocuments: ['CPF'],
      birthDate: '2000-01-01',
      prRelationshipId: 'rel-1',
    }
    expect((await MUT(app, 'POST', '/api/patients/p1/family-members', cookie, legacy)).status).toBe(200)
    expect(personCalled).toBe(false)
    expect(sc.calls.commands).toContain('family-add')
  })

  test('CSRF sem X-Requested-With → 403; sem sessão → 401 (nenhum toca upstream)', async () => {
    const sc = makeFakeSocialCare(catalogCfg)
    const people = makeFakePeople()
    const app = makeApp(sc, { peopleContext: people })
    const cookie = await driveSession(app)

    expect((await MUT(app, 'POST', '/api/patients/p1/family-members', cookie, MEMBER_BODY, false)).status).toBe(403)
    expect((await MUT(app, 'POST', '/api/patients/p1/family-members', '', MEMBER_BODY)).status).toBe(401)
    expect(sc.calls.commands).not.toContain('family-add')
    expect(people.calls.actors.length).toBe(0)
  })
})
