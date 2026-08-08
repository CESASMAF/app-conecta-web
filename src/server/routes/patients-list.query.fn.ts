// GET /api/patients — lista paginada por cursor (US1). requireSession + Bearer + social-care + envelope.
// `limit` fora de 1–100 → 400 (entrada inválida, sem tocar o upstream — REG-012). Erros como valor.
import { Elysia, t } from 'elysia'
import type { AppDeps } from '~/server/deps'
import { requireSession } from '~/modules/auth/server/guard'
import { SESSION_COOKIE } from '~/server/session'
import { isErr } from '~/shared/http/result'
import { statusForKind, errorBody } from '~/server/routes/error-response'
import type { PatientListParams } from '~/external/social-care-client'
import { isPatientStatus } from '~/shared/domain/patient'

export function patientsListRoute(deps: AppDeps) {
  return new Elysia().get(
    '/patients',
    async ({ cookie, query, set }) => {
      const requestId = crypto.randomUUID()
      set.headers['x-request-id'] = requestId
      const sid = cookie[SESSION_COOKIE]!.value
      const session = await requireSession(deps, typeof sid === 'string' ? sid : undefined)
      if (!session) {
        set.status = 401
        return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
      }
      const limit = query.limit ?? 20
      if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        set.status = 400
        return { error: { code: 'PAG-001', message: 'limit', requestId } }
      }
      // `status` vem da query string, então é string livre até prova em contrário. Aceitar
      // qualquer coisa aqui foi o que deixou `ACTIVE` (a caixa do app) atravessar até o
      // upstream, que fala minúsculo e responde 422 QLP-003. O filtro inválido agora morre na
      // borda, com erro que diz o que houve — e o adapter traduz a caixa na saída.
      if (query.status !== undefined && !isPatientStatus(query.status)) {
        set.status = 400
        return { error: { code: 'PAT-STATUS', message: 'status', requestId } }
      }
      const params: PatientListParams = {
        limit,
        ...(query.search !== undefined ? { search: query.search } : {}),
        ...(query.status !== undefined ? { status: query.status } : {}),
        ...(query.cursor !== undefined ? { cursor: query.cursor } : {}),
      }
      const r = await deps.socialCare.listPatients(session.accessToken, params)
      if (isErr(r)) {
        set.status = statusForKind(r.error.kind)
        return errorBody(r.error, requestId)
      }
      return { data: r.value.items, meta: { ...r.value.meta, timestamp: new Date().toISOString() } }
    },
    {
      query: t.Object({
        search: t.Optional(t.String()),
        status: t.Optional(t.String()),
        limit: t.Optional(t.Numeric()),
        cursor: t.Optional(t.String()),
      }),
    },
  )
}
