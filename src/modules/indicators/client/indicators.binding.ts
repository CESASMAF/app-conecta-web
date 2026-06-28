// Binding Solid do painel de Indicadores. Estado dos filtros (eixo + período) + consulta aplicada via
// createAsync. "Aplicar" valida o período antes de refazer a consulta. Erro por tag (inclui 403 → restrito).
import { createMemo, createSignal } from 'solid-js'
import { createAsync, query } from '@solidjs/router'
import { getIndicatorsFn, type IndicatorsQuery } from '../server/indicators.fn'
import { isOk } from '~/shared/http/result'
import { INDICATOR_AXES, type IndicatorAxis, type IndicatorResult } from '~/shared/domain/indicators'
import { validatePeriod } from './indicators.view-model'
import { indicatorsErrorTag, type IndicatorsTag } from '~/shared/i18n/indicators'

const indicatorsQ = query((q: IndicatorsQuery) => getIndicatorsFn(q), 'bi:indicators')
const currentMonth = (): string => new Date().toISOString().slice(0, 7) // AAAA-MM

export function useIndicatorsBinding() {
  const [axis, setAxis] = createSignal<IndicatorAxis>('demographics')
  const [periodStart, setPeriodStart] = createSignal(currentMonth())
  const [periodEnd, setPeriodEnd] = createSignal(currentMonth())
  const [applied, setApplied] = createSignal<IndicatorsQuery>({ axis: 'demographics', periodStart: currentMonth(), periodEnd: currentMonth() })
  const [formErr, setFormErr] = createSignal<IndicatorsTag | null>(null)

  const result = createAsync(() => indicatorsQ(applied()))
  const pending = createMemo(() => result() === undefined)
  const data = createMemo<IndicatorResult | null>(() => {
    const r = result()
    return r && isOk(r) ? r.value : null
  })
  const loadErrorTag = createMemo<IndicatorsTag | null>(() => {
    const r = result()
    return r && !isOk(r) ? indicatorsErrorTag(r.error?.kind ?? 'unknown') : null
  })

  function apply(): void {
    const tag = validatePeriod(periodStart(), periodEnd())
    if (tag) {
      setFormErr(tag)
      return
    }
    setFormErr(null)
    setApplied({ axis: axis(), periodStart: periodStart(), periodEnd: periodEnd() })
  }

  return {
    axes: INDICATOR_AXES,
    axis,
    setAxis,
    periodStart,
    setPeriodStart,
    periodEnd,
    setPeriodEnd,
    apply,
    formErr,
    pending,
    data,
    loadErrorTag,
  }
}
