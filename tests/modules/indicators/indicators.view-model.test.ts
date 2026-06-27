// ViewModel do painel de Indicadores (puro) — validação de período + colunas dinâmicas.
import { test, expect, describe } from 'bun:test'
import { validatePeriod, labelKeys } from '~/modules/indicators/client/indicators.view-model'
import type { IndicatorRow } from '~/shared/domain/indicators'

describe('indicadores · período', () => {
  test('formato AAAA-MM e início ≤ fim', () => {
    expect(validatePeriod('2026-01', '2026-06')).toBeNull()
    expect(validatePeriod('2026-06', '2026-06')).toBeNull()
    expect(validatePeriod('2026-07', '2026-06')).toBe('indicators.period.invalid')
    expect(validatePeriod('2026-1', '2026-06')).toBe('indicators.period.invalid')
    expect(validatePeriod('', '')).toBe('indicators.period.invalid')
  })
})

describe('indicadores · colunas dinâmicas', () => {
  test('união das chaves de labels na ordem de aparição', () => {
    const rows: IndicatorRow[] = [
      { labels: { sexo: 'F', faixa: '0-5' }, value: 7, period: '2026-01' },
      { labels: { sexo: 'M', regiao: 'norte' }, value: 9, period: '2026-01' },
    ]
    expect(labelKeys(rows)).toEqual(['sexo', 'faixa', 'regiao'])
    expect(labelKeys([])).toEqual([])
  })
})
