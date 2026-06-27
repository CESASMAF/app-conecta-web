// Contract/security test do setor Indicadores & BI (analysis-bi). Prova a DEFESA do BFF (é a autoridade
// de acesso — HIGH-003): sem o papel, 403 SEM tocar o upstream; com o papel, encaminha com Bearer. Mais
// allowlists (axis/format/resource) e validação de período antes de encaminhar. Sem mock em src/ (Princ. VI).
import { test, expect, describe, afterAll } from 'bun:test'
import { createApp } from '~/server/app'
import { fakeDeps, driveSession, oidcWithGroups } from '../modules/auth/_fakes'
import { makeFakeAnalysisBi } from '../support/analysis-bi-fake'
import { createAnalysisBiClient } from '~/external/analysis-bi-client'

type BiApp = ReturnType<typeof createApp>

// app com `groups` específicos na sessão + fake do analysis-bi (captura chamadas).
function biApp(groups: string[], fake = makeFakeAnalysisBi()) {
  const app = createApp(fakeDeps({ oidc: oidcWithGroups(groups), analysisBi: fake }))
  return { app, fake }
}

const GET = (app: BiApp, path: string, cookie: string) =>
  app.handle(new Request(`http://localhost${path}`, { headers: cookie ? { cookie } : {} }))

const PERIOD = 'period_start=2025-01&period_end=2025-03'

describe('BI · indicators — defesa `analyst`', () => {
  test('sem o papel analyst → 403 e NÃO encaminha ao upstream', async () => {
    const { app, fake } = biApp(['worker'])
    const cookie = await driveSession(app)
    const res = await GET(app, `/api/bi/indicators/demographics?${PERIOD}`, cookie)
    expect(res.status).toBe(403)
    expect(fake.calls.axes.length).toBe(0)
  })

  test('com analyst → 200 + Bearer da sessão encaminhado + envelope (kThreshold)', async () => {
    const { app, fake } = biApp(['analysis-bi:analyst'])
    const cookie = await driveSession(app)
    const res = await GET(app, `/api/bi/indicators/demographics?${PERIOD}`, cookie)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.meta.kThreshold).toBe(5)
    expect(fake.calls.axes[0]).toBe('demographics')
    expect(fake.calls.tokens[0]).toBe('at') // accessToken da sessão (fakeOidc.exchangeCode)
  })

  test('superadmin tem acesso', async () => {
    const { app } = biApp(['superadmin'])
    const cookie = await driveSession(app)
    expect((await GET(app, `/api/bi/indicators/care?period_start=2025-01&period_end=2025-01`, cookie)).status).toBe(200)
  })

  test('axis fora da allowlist → 400 sem tocar o upstream', async () => {
    const { app, fake } = biApp(['analysis-bi:analyst'])
    const cookie = await driveSession(app)
    const res = await GET(app, `/api/bi/indicators/inexistente?${PERIOD}`, cookie)
    expect(res.status).toBe(400)
    expect(fake.calls.axes.length).toBe(0)
  })

  test('período ausente ou malformado → 400', async () => {
    const { app } = biApp(['analysis-bi:analyst'])
    const cookie = await driveSession(app)
    expect((await GET(app, `/api/bi/indicators/demographics`, cookie)).status).toBe(400)
    expect((await GET(app, `/api/bi/indicators/demographics?period_start=2025&period_end=2025-03`, cookie)).status).toBe(400)
  })

  test('sem sessão → 401 e nenhum Bearer ao upstream', async () => {
    const { app, fake } = biApp(['analysis-bi:analyst'])
    const res = await GET(app, `/api/bi/indicators/demographics?${PERIOD}`, '')
    expect(res.status).toBe(401)
    expect(fake.calls.tokens.length).toBe(0)
  })
})

describe('BI · export — defesa `exporter`', () => {
  test('analyst NÃO basta para export → 403 sem encaminhar', async () => {
    const { app, fake } = biApp(['analysis-bi:analyst'])
    const cookie = await driveSession(app)
    const res = await GET(app, `/api/bi/export/csv?${PERIOD}`, cookie)
    expect(res.status).toBe(403)
    expect(fake.calls.formats.length).toBe(0)
  })

  test('exporter → 200 + Content-Disposition (attachment) + binário', async () => {
    const { app, fake } = biApp(['analysis-bi:exporter'])
    const cookie = await driveSession(app)
    const res = await GET(app, `/api/bi/export/csv?dataset=demographics&${PERIOD}`, cookie)
    expect(res.status).toBe(200)
    expect(res.headers.get('content-disposition')).toContain('attachment')
    expect(res.headers.get('content-type')).toContain('text/csv')
    expect(fake.calls.formats[0]).toBe('csv')
  })

  test('format fora da allowlist → 400', async () => {
    const { app } = biApp(['analysis-bi:exporter'])
    const cookie = await driveSession(app)
    expect((await GET(app, `/api/bi/export/pdf?${PERIOD}`, cookie)).status).toBe(400)
  })
})

describe('BI · metadata — qualquer autenticado', () => {
  test('worker (sem analyst/exporter) → 200', async () => {
    const { app } = biApp(['worker'])
    const cookie = await driveSession(app)
    const res = await GET(app, `/api/bi/metadata/datasets`, cookie)
    expect(res.status).toBe(200)
    expect((await res.json()).data).toBeDefined()
  })

  test('resource fora da allowlist → 400', async () => {
    const { app } = biApp(['worker'])
    const cookie = await driveSession(app)
    expect((await GET(app, `/api/bi/metadata/inexistente`, cookie)).status).toBe(400)
  })

  test('sem sessão → 401', async () => {
    const { app } = biApp(['worker'])
    expect((await GET(app, `/api/bi/metadata/datasets`, '')).status).toBe(401)
  })
})

// Regressão do achado da validação (2026-06-25): o backend Go serializa as linhas de indicador em
// PascalCase (struct `IndicatorRow` sem JSON tags); o `meta` vem snake_case. O client deve normalizar.
describe('BI · desserialização tolerante ao casing real do backend (PascalCase)', () => {
  const server = Bun.serve({
    port: 0,
    fetch(req) {
      const url = new URL(req.url)
      if (url.pathname.includes('/indicators/')) {
        // shape REAL do analysis-bi: rows PascalCase, meta snake_case
        return Response.json({
          data: [{ Labels: { age_band: '0-4', sex: 'F' }, Value: 7, Period: '2025-01' }],
          meta: { suppressed_groups: 2, k_threshold: 5 },
        })
      }
      return new Response(null, { status: 404 })
    },
  })
  afterAll(() => server.stop(true))

  test('PascalCase do backend → linhas normalizadas (labels/value/period preenchidos)', async () => {
    const client = createAnalysisBiClient(`http://localhost:${server.port}`)
    const r = await client.getIndicators('tok', 'demographics', { periodStart: '2025-01', periodEnd: '2025-01' })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.value.rows[0]!.labels.age_band).toBe('0-4')
      expect(r.value.rows[0]!.value).toBe(7)
      expect(r.value.rows[0]!.period).toBe('2025-01')
      expect(r.value.meta.kThreshold).toBe(5)
      expect(r.value.meta.suppressedGroups).toBe(2)
    }
  })
})
