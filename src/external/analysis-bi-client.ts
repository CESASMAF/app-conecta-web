// Adapter HTTP outbound ao analysis-bi (server-only — Princ. I). SÓ leitura; Bearer SEMPRE + timeout.
// A AUTORIZAÇÃO é do BFF (ver `server/guards/analysis-bi-access`): o backend pode rodar sem RBAC e sem
// validar iss/aud (HIGH-001/002/003). Aqui o client assume que a defesa já passou. Erros como VALOR.
import { env } from '~/server/env'
import { ok, err, type Result } from '~/shared/http/result'
import type { AppError } from '~/shared/http/app-error'
import { toUpstreamError, toTransportError } from '~/shared/http/upstream-error'
import { withTimeout } from '~/shared/with-timeout'

const TIMEOUT_MS = 8_000

// Allowlists (validadas no BFF antes de encaminhar — entrada inválida não consome o upstream).
export const INDICATOR_AXES = ['demographics', 'epidemiological', 'socioeconomic', 'protection', 'care'] as const
export type IndicatorAxis = (typeof INDICATOR_AXES)[number]
export const EXPORT_FORMATS = ['csv', 'json', 'xml', 'parquet', 'dbf', 'dbc', 'ods', 'fhir'] as const
export type ExportFormat = (typeof EXPORT_FORMATS)[number]
export const METADATA_RESOURCES = ['datasets', 'formats', 'regions'] as const
export type MetadataResource = (typeof METADATA_RESOURCES)[number]

export const isIndicatorAxis = (v: string): v is IndicatorAxis => (INDICATOR_AXES as readonly string[]).includes(v)
export const isExportFormat = (v: string): v is ExportFormat => (EXPORT_FORMATS as readonly string[]).includes(v)
export const isMetadataResource = (v: string): v is MetadataResource =>
  (METADATA_RESOURCES as readonly string[]).includes(v)

export type IndicatorParams = Readonly<{
  periodStart: string
  periodEnd: string
  mesoregion?: string
  granularity?: string
  top?: number
}>
export type IndicatorRow = Readonly<{ labels: Readonly<Record<string, string>>; value: number; period: string }>
export type IndicatorResult = Readonly<{
  rows: readonly IndicatorRow[]
  meta: Readonly<{ suppressedGroups: number; kThreshold: number }>
}>

export type ExportParams = IndicatorParams & Readonly<{ dataset: string }>
export type ExportResult = Readonly<{ body: Uint8Array; contentType: string; filename: string }>

export interface AnalysisBiClient {
  getIndicators(token: string, axis: string, params: IndicatorParams): Promise<Result<IndicatorResult, AppError>>
  getExport(token: string, format: string, params: ExportParams): Promise<Result<ExportResult, AppError>>
  getMetadata(token: string, resource: string): Promise<Result<unknown, AppError>>
}

// Filtros comuns a indicators/export.
function filterQuery(params: IndicatorParams): URLSearchParams {
  const qs = new URLSearchParams()
  qs.set('period_start', params.periodStart)
  qs.set('period_end', params.periodEnd)
  if (params.mesoregion) qs.set('mesoregion', params.mesoregion)
  if (params.granularity) qs.set('granularity', params.granularity)
  if (params.top !== undefined) qs.set('top', String(params.top))
  return qs
}

async function getJson(baseUrl: string, token: string, path: string): Promise<Result<unknown, AppError>> {
  let res: Response
  try {
    res = await withTimeout(
      fetch(`${baseUrl}${path}`, { headers: { authorization: `Bearer ${token}`, accept: 'application/json' } }),
      TIMEOUT_MS,
    )
  } catch {
    return err(toTransportError())
  }
  let body: unknown = null
  try {
    body = await res.json()
  } catch {
    /* corpo vazio */
  }
  if (!res.ok) return err(toUpstreamError(res.status, body))
  return ok(body)
}

// Extrai o filename do Content-Disposition (só o nome de arquivo gerado — sem PII).
function filenameFrom(header: string | null, fallback: string): string {
  if (!header) return fallback
  return /filename="?([^"]+)"?/.exec(header)?.[1] ?? fallback
}

export function createAnalysisBiClient(baseUrl: string = env.analysisBiUrl): AnalysisBiClient {
  return {
    async getIndicators(token, axis, params) {
      const r = await getJson(baseUrl, token, `/api/v1/indicators/${encodeURIComponent(axis)}?${filterQuery(params)}`)
      if (!r.ok) return r
      // ⚠️ O backend Go serializa as linhas em PascalCase (`Labels`/`Value`/`Period`) porque a struct
      // `IndicatorRow` não tem JSON tags (o `meta` tem → snake_case). Toleramos ambos os casings aqui,
      // na camada de adaptação, para o front receber sempre o shape normalizado. Ver validação 2026-06-25.
      type RawRow = Readonly<{
        Labels?: Readonly<Record<string, string>>
        Value?: number
        Period?: string
        labels?: Readonly<Record<string, string>>
        value?: number
        period?: string
      }>
      const body = r.value as { data: readonly RawRow[]; meta: { suppressed_groups: number; k_threshold: number } }
      const rows: readonly IndicatorRow[] = (body.data ?? []).map((row) => ({
        labels: row.labels ?? row.Labels ?? {},
        value: row.value ?? row.Value ?? 0,
        period: row.period ?? row.Period ?? '',
      }))
      return ok({
        rows,
        meta: { suppressedGroups: body.meta.suppressed_groups, kThreshold: body.meta.k_threshold },
      })
    },

    async getExport(token, format, params) {
      const qs = filterQuery(params)
      qs.set('dataset', params.dataset)
      let res: Response
      try {
        res = await withTimeout(
          fetch(`${baseUrl}/api/v1/export/${encodeURIComponent(format)}?${qs}`, {
            headers: { authorization: `Bearer ${token}` },
          }),
          TIMEOUT_MS,
        )
      } catch {
        return err(toTransportError())
      }
      if (!res.ok) {
        let body: unknown = null
        try {
          body = await res.json()
        } catch {
          /* corpo vazio */
        }
        return err(toUpstreamError(res.status, body))
      }
      const buf = new Uint8Array(await res.arrayBuffer())
      const contentType = res.headers.get('content-type') ?? 'application/octet-stream'
      const filename = filenameFrom(res.headers.get('content-disposition'), `acdg-${params.dataset}.${format}`)
      return ok({ body: buf, contentType, filename })
    },

    async getMetadata(token, resource) {
      return getJson(baseUrl, token, `/api/v1/metadata/${encodeURIComponent(resource)}`)
    },
  }
}
