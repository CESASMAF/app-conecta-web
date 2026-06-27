// Contract test da FUNDAÇÃO do BFF (server-side completo). Prova, sem UI, as regras de negócio
// transversais: (1) defesa do analysis-bi (o BFF é a autoridade de acesso), (2) mapa de erro unificado
// dos 3 serviços, (3) política de ator por-serviço (people-context envia X-Actor-Id; leitura não).
import { test, expect, describe, afterAll } from 'bun:test'
import { authorizeAnalysisBi } from '~/server/guards/analysis-bi-access'
import { hasRole, isSuperadmin } from '~/shared/auth/roles'
import { toUpstreamError } from '~/shared/http/upstream-error'
import { createPeopleContextClient } from '~/external/people-context-client'
import { createAnalysisBiClient } from '~/external/analysis-bi-client'
import { isOk, isErr } from '~/shared/http/result'

describe('Foundation · roles helper (modelo <system>:<role> + superadmin)', () => {
  test('superadmin bypassa qualquer papel', () => {
    expect(hasRole(['superadmin'], 'analysis-bi', 'analyst')).toBe(true)
    expect(isSuperadmin(['superadmin'])).toBe(true)
  })
  test('papel composto é system-scoped', () => {
    expect(hasRole(['analysis-bi:analyst'], 'analysis-bi', 'analyst')).toBe(true)
    expect(hasRole(['social-care:analyst'], 'analysis-bi', 'analyst')).toBe(false) // sistema errado
  })
  test('papel simples e admin do sistema bypassam', () => {
    expect(hasRole(['analyst'], 'analysis-bi', 'analyst')).toBe(true)
    expect(hasRole(['analysis-bi:admin'], 'analysis-bi', 'exporter')).toBe(true)
    expect(hasRole(['worker'], 'analysis-bi', 'analyst')).toBe(false)
  })
})

describe('Foundation · defesa analysis-bi (BFF é a autoridade — HIGH-003)', () => {
  test('indicators exige analyst; sem o papel → forbidden, NÃO encaminha', () => {
    expect(isErr(authorizeAnalysisBi([], 'indicators'))).toBe(true)
    expect(isErr(authorizeAnalysisBi(['worker'], 'indicators'))).toBe(true)
    expect(isOk(authorizeAnalysisBi(['analysis-bi:analyst'], 'indicators'))).toBe(true)
  })
  test('export exige exporter (analyst não basta)', () => {
    expect(isErr(authorizeAnalysisBi(['analysis-bi:analyst'], 'export'))).toBe(true)
    expect(isOk(authorizeAnalysisBi(['analysis-bi:exporter'], 'export'))).toBe(true)
  })
  test('metadata: qualquer autenticado', () => {
    expect(isOk(authorizeAnalysisBi([], 'metadata'))).toBe(true)
  })
  test('a negação carrega kind=forbidden + code observável', () => {
    const r = authorizeAnalysisBi([], 'indicators')
    expect(isErr(r) && r.error.kind).toBe('forbidden')
    expect(isErr(r) && r.error.code).toBe('ABI-ANALYST-REQUIRED')
  })
})

describe('Foundation · mapa de erro unificado (3 serviços, kind por status, code preservado)', () => {
  test('social-care {error:{code}} → conflict + code', () => {
    const e = toUpstreamError(409, { error: { code: 'REGP-001', message: 'x' } })
    expect(e.kind).toBe('conflict')
    expect(e.code).toBe('REGP-001')
  })
  test('people-context {success:false,error:{code}} → validation + code', () => {
    const e = toUpstreamError(422, { success: false, error: { code: 'PEO-009', message: 'x' } })
    expect(e.kind).toBe('validation')
    expect(e.code).toBe('PEO-009')
  })
  test('formato {code} no topo (variação social-care) → notFound + code', () => {
    const e = toUpstreamError(404, { code: 'UHC-001', message: 'x' })
    expect(e.kind).toBe('notFound')
    expect(e.code).toBe('UHC-001')
  })
  test('503 upstream → dependencyUnavailable (ex.: REGP-031 people-context fora)', () => {
    const e = toUpstreamError(503, { error: { code: 'REGP-031' } })
    expect(e.kind).toBe('dependencyUnavailable')
    expect(e.code).toBe('REGP-031')
  })
})

describe('Foundation · política de ator por-serviço (clients reais vs servidor que captura headers)', () => {
  const received: { path: string; method: string; auth: string | null; actor: string | null }[] = []
  const server = Bun.serve({
    port: 0,
    fetch(req) {
      const url = new URL(req.url)
      received.push({
        path: url.pathname,
        method: req.method,
        auth: req.headers.get('authorization'),
        actor: req.headers.get('x-actor-id'),
      })
      if (req.method === 'POST') return Response.json({ data: { id: 'person-1' }, meta: {} }, { status: 201 })
      if (url.pathname.includes('/metadata/')) return Response.json({ data: [] })
      return Response.json({ data: { id: 'p1', fullName: 'X', birthDate: '2000-01-01', active: true }, meta: {} })
    },
  })
  const baseUrl = `http://localhost:${server.port}`
  afterAll(() => server.stop(true))

  test('people-context: MUTAÇÃO envia Bearer + X-Actor-Id; LEITURA não envia ator', async () => {
    const client = createPeopleContextClient(baseUrl)
    await client.createPerson('tok-1', 'actor-9', { fullName: 'Maria', birthDate: '1990-01-01' })
    await client.getPerson('tok-1', 'p1')
    const post = received.find((r) => r.method === 'POST')
    const get = received.find((r) => r.method === 'GET' && r.path.includes('/people/'))
    expect(post?.auth).toBe('Bearer tok-1')
    expect(post?.actor).toBe('actor-9') // ← política de ator (ADR-023 do people-context)
    expect(get?.auth).toBe('Bearer tok-1')
    expect(get?.actor).toBeNull() // leitura nunca envia ator
  })

  test('analysis-bi: Bearer sempre presente outbound', async () => {
    const client = createAnalysisBiClient(baseUrl)
    await client.getMetadata('tok-2', 'datasets')
    const meta = received.find((r) => r.path.includes('/metadata/'))
    expect(meta?.auth).toBe('Bearer tok-2')
  })
})
