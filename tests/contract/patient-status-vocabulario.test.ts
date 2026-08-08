// Vocabulário da situação do paciente: as DUAS pontas da tradução, e só os estados que existem.
//
// O social-care fala minúsculo e conhece TRÊS situações — `Domain/Registry/ValueObjects/
// PatientStatus.swift`: `waitlisted`, `active`, `discharged`. O app fala MAIÚSCULO.
//
// Dois defeitos viviam aqui, e os dois eram invisíveis para o compilador:
//
// 1. **A tradução só existia na volta.** O adapter normalizava `active` → `ACTIVE` ao ler, mas
//    ao filtrar mandava `status=ACTIVE` cru na query string. O upstream respondia 422
//    `QLP-003` ("Valores aceitos: waitlisted, active, discharged") e a tela dizia só "não foi
//    possível carregar". O select de situação NUNCA funcionou — nem por SPA, nem por documento.
//
// 2. **Duas situações não existiam.** `ADMITTED` e `WITHDRAWN` eram nomes das AÇÕES de ciclo de
//    vida. Em `PatientLifecycle.swift`, `admit` leva de `waitlisted` a `active` e `withdraw`
//    leva de `waitlisted` a `discharged`: nenhuma transição produz esses estados. Eram dois
//    filtros que nenhum paciente jamais teria.
//
// É o padrão de bug mais recorrente deste produto (enum, caixa, data, semântica). Este arquivo
// existe para que ele não volte pela terceira vez no mesmo campo.
import { test, expect, afterAll } from 'bun:test'
import { createApp } from '~/server/app'
import { fakeDeps } from '../modules/auth/_fakes'
import { driveSession } from '../modules/auth/_fakes'
import { PATIENT_STATUSES, isPatientStatus } from '~/shared/domain/patient'
import { ok } from '~/shared/http/result'
import { createSocialCareClient, type SocialCareClient } from '~/external/social-care-client'
import { stubSocialCare } from '../modules/auth/_fakes'

// O domínio do upstream, verbatim. Mudou lá, tem que mudar aqui — e o teste avisa.
const DOMINIO_DO_UPSTREAM = ['waitlisted', 'active', 'discharged'] as const

test('o app conhece exatamente as situações que o social-care conhece', () => {
  const doApp = [...PATIENT_STATUSES].map((s) => s.toLowerCase()).sort()
  expect(doApp).toEqual([...DOMINIO_DO_UPSTREAM].sort())
})

test('`ADMITTED` e `WITHDRAWN` não voltam — são AÇÕES, não situações', () => {
  for (const inexistente of ['ADMITTED', 'WITHDRAWN']) {
    expect(PATIENT_STATUSES as readonly string[]).not.toContain(inexistente)
    expect(isPatientStatus(inexistente)).toBe(false)
  }
})

// A prova que importa: contra um servidor HTTP de verdade, olhando a query string que sai.
// É o único ponto onde o defeito era observável — tudo antes dele parecia correto.
const recebidas: string[] = []
const upstream = Bun.serve({
  port: 0,
  fetch(req) {
    const u = new URL(req.url)
    recebidas.push(u.searchParams.get('status') ?? '(sem status)')
    return Response.json({ data: [], meta: { pageSize: 20, totalCount: 0, hasMore: false, nextCursor: null } })
  },
})
afterAll(() => upstream.stop(true))

test('o adapter baixa a caixa na IDA — o upstream recebe minúsculo', async () => {
  const client = createSocialCareClient(`http://localhost:${upstream.port}`)
  recebidas.length = 0

  await client.listPatients('tok', { status: 'ACTIVE', limit: 20 })
  await client.listPatients('tok', { status: 'WAITLISTED', limit: 20 })
  await client.listPatients('tok', { status: 'DISCHARGED', limit: 20 })

  // Era `ACTIVE|WAITLISTED|DISCHARGED` aqui, e o upstream respondia 422 QLP-003.
  expect(recebidas).toEqual(['active', 'waitlisted', 'discharged'])
  for (const s of recebidas) expect(DOMINIO_DO_UPSTREAM).toContain(s as never)
})

test('sem filtro, nenhum status vai na query string', async () => {
  const client = createSocialCareClient(`http://localhost:${upstream.port}`)
  recebidas.length = 0
  await client.listPatients('tok', { limit: 20 })
  expect(recebidas).toEqual(['(sem status)'])
})

test('a rota do BFF aceita a situação válida e chega ao adapter', async () => {
  const recebido: string[] = []
  const social: SocialCareClient = {
    ...stubSocialCare,
    listPatients: async (_t, p) => {
      if (p.status) recebido.push(p.status)
      return ok({ items: [], meta: { pageSize: p.limit, totalCount: 0, hasMore: false, nextCursor: null } })
    },
  }
  const app = createApp(fakeDeps({ socialCare: social }))
  const cookie = await driveSession(app)

  const res = await app.handle(
    new Request('http://localhost/api/patients?status=ACTIVE&limit=20', { headers: { cookie } }),
  )

  expect(res.status).toBe(200)
  expect(recebido).toEqual(['ACTIVE'])
})

test('situação inválida morre na borda do BFF, sem gastar uma ida ao upstream', async () => {
  let chamou = false
  const social: SocialCareClient = {
    ...stubSocialCare,
    listPatients: async (_t, p) => {
      chamou = true
      return ok({ items: [], meta: { pageSize: p.limit, totalCount: 0, hasMore: false, nextCursor: null } })
    },
  }
  const app = createApp(fakeDeps({ socialCare: social }))
  const cookie = await driveSession(app)

  // `ADMITTED` era oferecido pelo select e produzia 422 no upstream.
  const res = await app.handle(
    new Request('http://localhost/api/patients?status=ADMITTED&limit=20', { headers: { cookie } }),
  )

  expect(res.status).toBe(400)
  expect(chamou).toBe(false)
})
