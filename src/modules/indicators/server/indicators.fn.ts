'use server'
// Server function do painel de Indicadores (Donos): lê indicadores anonimizados (K-anonymity) via app.handle.
// SSR-safe, sem leak. A DEFESA de papel (analyst) é do BFF (guard) — aqui só encaminhamos. Erros como VALOR.
import { getRequestEvent } from 'solid-js/web'
import { app } from '~/server/app'
import { ok, err, type Result } from '~/shared/http/result'
import type { AppError } from '~/shared/http/app-error'
import { toUpstreamError } from '~/shared/http/upstream-error'
import type { IndicatorAxis, IndicatorResult, IndicatorRow } from '~/shared/domain/indicators'

export type IndicatorsQuery = Readonly<{ axis: IndicatorAxis; periodStart: string; periodEnd: string }>

export async function getIndicatorsFn(input: IndicatorsQuery): Promise<Result<IndicatorResult, AppError>> {
  const cookie = getRequestEvent()?.request.headers.get('cookie') ?? ''
  const qs = new URLSearchParams({ period_start: input.periodStart, period_end: input.periodEnd })
  const res = await app.handle(
    new Request(`http://internal/api/bi/indicators/${encodeURIComponent(input.axis)}?${qs.toString()}`, { headers: { cookie } }),
  )
  let body: unknown = null
  try {
    body = await res.json()
  } catch {
    /* corpo vazio */
  }
  if (!res.ok) return err(toUpstreamError(res.status, body))
  const envp = body as { data: readonly IndicatorRow[]; meta: { suppressedGroups?: number; kThreshold?: number } }
  return ok({
    rows: envp.data ?? [],
    suppressedGroups: envp.meta?.suppressedGroups ?? 0,
    kThreshold: envp.meta?.kThreshold ?? 5,
  })
}
