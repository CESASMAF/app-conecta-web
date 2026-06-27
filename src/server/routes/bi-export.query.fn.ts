// GET /api/bi/export/:format — export anonimizado (8 formatos). DEFESA no BFF: exige papel `exporter`
// ANTES de encaminhar; sem o papel → 403 SEM tocar o upstream. Repassa o binário do upstream com
// Content-Type + Content-Disposition. Bearer sempre injetado. Erros como valor.
import { Elysia, t } from 'elysia'
import type { AppDeps } from '~/server/deps'
import { requireSession } from '~/modules/auth/server/guard'
import { SESSION_COOKIE } from '~/server/session'
import { isErr } from '~/shared/http/result'
import { statusForKind, errorBody } from '~/server/routes/error-response'
import { authorizeAnalysisBi } from '~/server/guards/analysis-bi-access'
import { isExportFormat, type ExportParams } from '~/external/analysis-bi-client'

const PERIOD = /^\d{4}-\d{2}$/

export function biExportRoute(deps: AppDeps) {
  return new Elysia().get(
    '/bi/export/:format',
    async ({ cookie, params, query, set }) => {
      const requestId = crypto.randomUUID()
      set.headers['x-request-id'] = requestId
      const sid = cookie[SESSION_COOKIE]!.value
      const session = await requireSession(deps, typeof sid === 'string' ? sid : undefined)
      if (!session) {
        set.status = 401
        return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
      }
      const guard = authorizeAnalysisBi(session.groups, 'export')
      if (isErr(guard)) {
        set.status = statusForKind(guard.error.kind)
        return errorBody(guard.error, requestId)
      }
      if (!isExportFormat(params.format)) {
        set.status = 400
        return { error: { code: 'ABI-FORMAT', message: 'validation', requestId } }
      }
      if (!query.period_start || !query.period_end || !PERIOD.test(query.period_start) || !PERIOD.test(query.period_end)) {
        set.status = 400
        return { error: { code: 'ABI-PERIOD', message: 'validation', requestId } }
      }
      const p: ExportParams = {
        dataset: query.dataset ?? 'demographics',
        periodStart: query.period_start,
        periodEnd: query.period_end,
        ...(query.mesoregion !== undefined ? { mesoregion: query.mesoregion } : {}),
        ...(query.granularity !== undefined ? { granularity: query.granularity } : {}),
        ...(query.top !== undefined ? { top: query.top } : {}),
      }
      const r = await deps.analysisBi.getExport(session.accessToken, params.format, p)
      if (isErr(r)) {
        set.status = statusForKind(r.error.kind)
        return errorBody(r.error, requestId)
      }
      set.headers['content-type'] = r.value.contentType
      set.headers['content-disposition'] = `attachment; filename="${r.value.filename}"`
      return r.value.body
    },
    {
      query: t.Object({
        dataset: t.Optional(t.String()),
        period_start: t.Optional(t.String()),
        period_end: t.Optional(t.String()),
        mesoregion: t.Optional(t.String()),
        granularity: t.Optional(t.String()),
        top: t.Optional(t.Numeric()),
      }),
    },
  )
}
