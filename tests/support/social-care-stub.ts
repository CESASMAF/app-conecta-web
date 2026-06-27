// Stub HTTP do social-care (FIXTURE em tests/ — Princ. VI). Usado pelo smoke SSR e por testes de
// adapter. Devolve os envelopes documentados; exige Bearer. Rodável direto: `bun tests/support/social-care-stub.ts`.
const PATIENTS = Array.from({ length: 47 }, (_, i) => ({
  patientId: `p-${i}`,
  fullName: `Paciente Sintético ${i}`,
  primaryDiagnosis: i % 3 === 0 ? null : 'CID-Q00',
  memberCount: i % 4,
  status: i % 5 === 0 ? 'WAITLISTED' : 'ACTIVE',
}))

function paginate(url: URL) {
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') ?? 20), 1), 100)
  const cursor = Number(url.searchParams.get('cursor') ?? 0)
  const search = url.searchParams.get('search')?.toLowerCase()
  const status = url.searchParams.get('status')
  let rows = PATIENTS
  if (search) rows = rows.filter((p) => p.fullName.toLowerCase().includes(search))
  if (status) rows = rows.filter((p) => p.status === status)
  const slice = rows.slice(cursor, cursor + limit)
  const next = cursor + limit
  const hasMore = next < rows.length
  return {
    data: slice,
    meta: {
      pageSize: slice.length,
      totalCount: rows.length,
      hasMore,
      nextCursor: hasMore ? String(next) : null,
      timestamp: new Date().toISOString(),
    },
  }
}

export function handleStub(req: Request): Response {
  const url = new URL(req.url)
  if (!req.headers.get('authorization')?.startsWith('Bearer ')) {
    return Response.json({ error: { code: 'AUTH-401', message: 'unauthorized' } }, { status: 401 })
  }
  if (url.pathname === '/api/v1/patients') return Response.json(paginate(url))
  const pm = url.pathname.match(/^\/api\/v1\/patients\/(.+)$/)
  if (pm) {
    const id = decodeURIComponent(pm[1]!)
    if (id === 'inexistente') return Response.json({ error: { code: 'REGP-404', message: 'not found' } }, { status: 404 })
    return Response.json({
      data: { patientId: id, fullName: `Paciente ${id}`, status: 'ACTIVE' },
      meta: { timestamp: new Date().toISOString() },
    })
  }
  const dm = url.pathname.match(/^\/api\/v1\/dominios\/(.+)$/)
  if (dm) {
    return Response.json({
      data: [
        { id: '1', codigo: 'AUX_GAS', descricao: 'Auxílio Gás' },
        { id: '2', codigo: 'BPC', descricao: 'Benefício de Prestação Continuada' },
      ],
      meta: { timestamp: new Date().toISOString() },
    })
  }
  return Response.json({ error: { code: 'NF', message: 'not found' } }, { status: 404 })
}

if (import.meta.main) {
  const port = Number(process.env.STUB_PORT ?? 4001)
  Bun.serve({ port, fetch: handleStub })
  console.log(`[social-care-stub] :${port}`)
}
