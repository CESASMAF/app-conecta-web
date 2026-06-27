// ViewModel PURO do painel de Indicadores — sem Solid; testável em bun:test. Validação de período +
// derivação de colunas dinâmicas (chaves de rótulo).
import type { IndicatorsTag } from '~/shared/i18n/indicators'
import type { IndicatorRow } from '~/shared/domain/indicators'

const PERIOD = /^\d{4}-\d{2}$/ // AAAA-MM

export function validatePeriod(start: string, end: string): IndicatorsTag | null {
  if (!PERIOD.test(start) || !PERIOD.test(end) || start > end) return 'indicators.period.invalid'
  return null
}

// Colunas dinâmicas = união das chaves de `labels` (na ordem de aparição).
export function labelKeys(rows: readonly IndicatorRow[]): readonly string[] {
  const keys: string[] = []
  for (const r of rows) for (const k of Object.keys(r.labels)) if (!keys.includes(k)) keys.push(k)
  return keys
}
