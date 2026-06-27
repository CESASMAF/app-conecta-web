// Tipos do painel de Indicadores (Donos · analysis-bi) — COMPARTILHADOS BFF↔client. PUROS.
// Os eixos são parte do CONTRATO (allowlist do BFF) — rótulos PT-BR fixos (não catálogo de domínio).
export const INDICATOR_AXES = ['demographics', 'epidemiological', 'socioeconomic', 'protection', 'care'] as const
export type IndicatorAxis = (typeof INDICATOR_AXES)[number]
export const isIndicatorAxis = (v: string): v is IndicatorAxis => (INDICATOR_AXES as readonly string[]).includes(v)

export const AXIS_LABELS: Readonly<Record<IndicatorAxis, string>> = {
  demographics: 'Demografia',
  epidemiological: 'Epidemiologia',
  socioeconomic: 'Socioeconômico',
  protection: 'Proteção',
  care: 'Cuidado',
}

export type IndicatorRow = Readonly<{ labels: Readonly<Record<string, string>>; value: number; period: string }>
export type IndicatorResult = Readonly<{
  rows: readonly IndicatorRow[]
  suppressedGroups: number
  kThreshold: number
}>
