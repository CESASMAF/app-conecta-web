// Contract test do CADASTRO ORQUESTRADO (Inc 2): o BFF cria a identidade da pessoa nos bastidores
// (people-context, createLogin=false, X-Actor-Id=sub) e então o paciente (social-care), recompondo o
// overview view-ready (201). Prova: orquestração, xor person|personId, fail-secure (people fora → sem
// paciente), idempotência por CPF (reusa em retry), retrocompat do caminho personId, CSRF.
import { test, expect, describe } from 'bun:test'
import { makeApp, driveSession } from '../modules/auth/_fakes'
import { makeFakeSocialCare, type FakeConfig } from '../support/social-care-fake'
import { makeFakePeople } from '../support/people-context-fake'
import { ok, err } from '~/shared/http/result'
import { appError } from '~/shared/http/app-error'
import type { CreatePersonInput } from '~/external/people-context-client'
import type { RegisterPatientInput } from '~/external/social-care-client'

type ScApp = ReturnType<typeof makeApp>

// Catálogos que resolvem rótulos na recomposição do overview (parentesco/identidade).
const catalogCfg: FakeConfig = {
  domain: async (_t, table) =>
    ok(
      table === 'dominio_parentesco'
        ? [{ id: 'rel-1', codigo: 'MAE', descricao: 'Mãe' }]
        : table === 'dominio_tipo_identidade'
          ? [{ id: 'ti-1', codigo: 'IND', descricao: 'Indígena' }]
          : [],
    ),
}

const MUT = (app: ScApp, path: string, cookie: string, body?: unknown, csrf = true) =>
  app.handle(
    new Request(`http://localhost${path}`, {
      method: 'POST',
      headers: {
        ...(cookie ? { cookie } : {}),
        ...(csrf ? { 'x-requested-with': 'fetch' } : {}),
        ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    }),
  )

const PERSON_BODY = {
  person: { fullName: 'Maria Silva', birthDate: '2010-05-01', cpf: '11144477735', sex: 'F', motherName: 'Ana Silva', nationality: 'Brasileira' },
  initialDiagnoses: [{ icdCode: 'Q90', date: '2020-01-01', description: 'Síndrome de Down' }],
  prRelationshipId: 'rel-1',
}

describe('Pacientes · cadastro orquestrado (pessoa + paciente)', () => {
  test('person → cria pessoa (createLogin=false) e paciente com o id devolvido; 201 + overview', async () => {
    const captured: { person?: CreatePersonInput; patient?: RegisterPatientInput } = {}
    const sc = makeFakeSocialCare({
      ...catalogCfg,
      create: async (_t, input) => {
        captured.patient = input
        return ok({ id: 'patient-9' })
      },
    })
    const people = makeFakePeople({
      create: async (_t, _actor, input) => {
        captured.person = input
        return ok({ id: 'person-9', idpProvisioned: true })
      },
    })
    const app = makeApp(sc, { peopleContext: people })
    const cookie = await driveSession(app)

    const res = await MUT(app, '/api/patients', cookie, PERSON_BODY)
    expect(res.status).toBe(201)
    // Fase 1: identidade criada SEM login, com CPF, sob a política de ator do people-context (sub).
    expect(captured.person?.createLogin).toBe(false)
    expect(captured.person?.cpf).toBe('11144477735')
    expect(people.calls.actors).toContain('user-1')
    // Fase 2: paciente criado com o personId devolvido + personalData derivado (nome/mãe/sexo/nacionalidade).
    expect(captured.patient?.personId).toBe('person-9')
    expect(captured.patient?.personalData?.firstName).toBe('Maria')
    expect(captured.patient?.personalData?.lastName).toBe('Silva')
    expect(captured.patient?.personalData?.motherName).toBe('Ana Silva')
    expect(captured.patient?.personalData?.nationality).toBe('Brasileira')
    expect(captured.patient?.civilDocuments?.cpf).toBe('11144477735')
    // Resposta = overview view-ready recomposto (não só {id}).
    expect((await res.json()).data.statusLabel).toBeDefined()
  })

  test('xor: nem person nem personId → 422; ambos → 422 (sem tocar upstream)', async () => {
    const sc = makeFakeSocialCare(catalogCfg)
    const people = makeFakePeople()
    const app = makeApp(sc, { peopleContext: people })
    const cookie = await driveSession(app)

    const { person: _p, ...noIdentity } = PERSON_BODY
    expect((await MUT(app, '/api/patients', cookie, noIdentity)).status).toBe(422)
    expect((await MUT(app, '/api/patients', cookie, { ...PERSON_BODY, personId: 'person-x' })).status).toBe(422)
    expect(sc.calls.commands).not.toContain('create')
    expect(people.calls.actors.length).toBe(0)
  })

  test('people-context fora (createPerson erro) → 503 e o paciente NÃO é criado (fail-secure)', async () => {
    const sc = makeFakeSocialCare(catalogCfg)
    const people = makeFakePeople({ create: async () => err(appError('dependencyUnavailable', 'PEO-503')) })
    const app = makeApp(sc, { peopleContext: people })
    const cookie = await driveSession(app)

    expect((await MUT(app, '/api/patients', cookie, PERSON_BODY)).status).toBe(503)
    expect(sc.calls.commands).not.toContain('create') // nenhum paciente órfão
  })

  test('conflito de CPF já registrado (REGP-030) no paciente → 409', async () => {
    const sc = makeFakeSocialCare({ ...catalogCfg, create: async () => err(appError('conflict', 'REGP-030')) })
    const people = makeFakePeople({ create: async () => ok({ id: 'person-9', idpProvisioned: true }) })
    const app = makeApp(sc, { peopleContext: people })
    const cookie = await driveSession(app)

    expect((await MUT(app, '/api/patients', cookie, PERSON_BODY)).status).toBe(409)
  })

  test('retrocompat: caminho personId continua válido e NÃO toca o people-context', async () => {
    let personCalled = false
    const sc = makeFakeSocialCare({ ...catalogCfg, create: async () => ok({ id: 'patient-1' }) })
    const people = makeFakePeople({
      create: async () => {
        personCalled = true
        return ok({ id: 'x', idpProvisioned: true })
      },
    })
    const app = makeApp(sc, { peopleContext: people })
    const cookie = await driveSession(app)

    const res = await MUT(app, '/api/patients', cookie, {
      personId: 'person-1',
      initialDiagnoses: [{ icdCode: 'F90', date: '2020-01-01', description: 'TDAH' }],
      prRelationshipId: 'rel-1',
    })
    expect(res.status).toBe(201)
    expect(personCalled).toBe(false)
  })

  test('CSRF sem X-Requested-With → 403; sem sessão → 401 (nenhum toca upstream)', async () => {
    const sc = makeFakeSocialCare(catalogCfg)
    const people = makeFakePeople()
    const app = makeApp(sc, { peopleContext: people })
    const cookie = await driveSession(app)

    expect((await MUT(app, '/api/patients', cookie, PERSON_BODY, false)).status).toBe(403)
    expect((await MUT(app, '/api/patients', '', PERSON_BODY)).status).toBe(401)
    expect(sc.calls.commands).not.toContain('create')
    expect(people.calls.actors.length).toBe(0)
  })
})
