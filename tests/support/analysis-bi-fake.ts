// Fake configurável da porta AnalysisBiClient + captura de chamadas (FIXTURE em tests/ — Princ. VI).
// Os contract tests injetam isto em fakeDeps({ analysisBi }) e afirmam defesa/Bearer/encaminhamento.
import { ok, type Result } from '~/shared/http/result'
import type { AppError } from '~/shared/http/app-error'
import type {
  AnalysisBiClient,
  IndicatorParams,
  IndicatorResult,
  ExportParams,
  ExportResult,
} from '~/external/analysis-bi-client'

export type AnalysisBiCalls = Readonly<{ tokens: string[]; axes: string[]; formats: string[]; resources: string[] }>

export type AnalysisBiFakeConfig = Partial<{
  indicators: (token: string, axis: string, params: IndicatorParams) => Promise<Result<IndicatorResult, AppError>>
  export: (token: string, format: string, params: ExportParams) => Promise<Result<ExportResult, AppError>>
  metadata: (token: string, resource: string) => Promise<Result<unknown, AppError>>
}>

export function makeFakeAnalysisBi(cfg: AnalysisBiFakeConfig = {}): AnalysisBiClient & { calls: AnalysisBiCalls } {
  const calls = { tokens: [] as string[], axes: [] as string[], formats: [] as string[], resources: [] as string[] }
  return {
    calls,
    async getIndicators(token, axis, params) {
      calls.tokens.push(token)
      calls.axes.push(axis)
      return cfg.indicators
        ? cfg.indicators(token, axis, params)
        : ok({
            rows: [{ labels: { age_band: '0-4' }, value: 7, period: params.periodStart }],
            meta: { suppressedGroups: 2, kThreshold: 5 },
          })
    },
    async getExport(token, format, params) {
      calls.tokens.push(token)
      calls.formats.push(format)
      return cfg.export
        ? cfg.export(token, format, params)
        : ok({ body: new TextEncoder().encode('a,b\n1,2'), contentType: 'text/csv', filename: `acdg-${params.dataset}.${format}` })
    },
    async getMetadata(token, resource) {
      calls.tokens.push(token)
      calls.resources.push(resource)
      return cfg.metadata ? cfg.metadata(token, resource) : ok({ data: [{ name: 'demographics' }] })
    },
  }
}
