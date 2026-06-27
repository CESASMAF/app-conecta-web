// GET /api/bi/indicators/:axis — indicadores anonimizados (K-anonymity K=5 no upstream).
// DEFESA no BFF (o backend pode não enforçar — HIGH-003): exige papel `analyst` ANTES de validar/encaminhar;
// sem o papel → 403 SEM tocar o upstream. Bearer sempre injetado. Erros como valor.
import { Elysia, t } from 'elysia'
import type { AppDeps } from '~/server/deps'
import { requireSession } from '~/modules/auth/server/guard'
import { SESSION_COOKIE } from '~/server/session'
import { isErr } from '~/shared/http/result'
import { statusForKind, errorBody } from '~/server/routes/error-response'
import { authorizeAnalysisBi } from '~/server/guards/analysis-bi-access'
import { isIndicatorAxis, type IndicatorParams } from '~/external/analysis-bi-client'

const PERIOD = /^\d{4}-\d{2}$/ // YYYY-MM

export function biIndicatorsRoute(deps: AppDeps) {
  return new Elysia().get(
    '/bi/indicators/:axis',
    async ({ cookie, params, query, set }) => {
      const requestId = crypto.randomUUID()
      set.headers['x-request-id'] = requestId
      const sid = cookie[SESSION_COOKIE]!.value
      const session = await requireSession(deps, typeof sid === 'string' ? sid : undefined)
      if (!session) {
        set.status = 401
        return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
      }
      // DEFESA primeiro (skill bff-guard-analysis-bi): papel ANTES de validar params ou encaminhar.
      const guard = authorizeAnalysisBi(session.groups, 'indicators')
      if (isErr(guard)) {
        set.status = statusForKind(guard.error.kind)
        return errorBody(guard.error, requestId)
      }
      if (!isIndicatorAxis(params.axis)) {
        set.status = 400
        return { error: { code: 'ABI-AXIS', message: 'validation', requestId } }
      }
      if (!query.period_start || !query.period_end || !PERIOD.test(query.period_start) || !PERIOD.test(query.period_end)) {
        set.status = 400
        return { error: { code: 'ABI-PERIOD', message: 'validation', requestId } }
      }
      const p: IndicatorParams = {
        periodStart: query.period_start,
        periodEnd: query.period_end,
        ...(query.mesoregion !== undefined ? { mesoregion: query.mesoregion } : {}),
        ...(query.granularity !== undefined ? { granularity: query.granularity } : {}),
        ...(query.top !== undefined ? { top: query.top } : {}),
      }
      const r = await deps.analysisBi.getIndicators(session.accessToken, params.axis, p)
      if (isErr(r)) {
        set.status = statusForKind(r.error.kind)
        return errorBody(r.error, requestId)
      }
      return { data: r.value.rows, meta: { ...r.value.meta, timestamp: new Date().toISOString() } }
    },
    {
      query: t.Object({
        period_start: t.Optional(t.String()),
        period_end: t.Optional(t.String()),
        mesoregion: t.Optional(t.String()),
        granularity: t.Optional(t.String()),
        top: t.Optional(t.Numeric()),
      }),
    },
  )
}
