// Painel de Indicadores (Donos · analysis-bi): seletor de eixo + período → tabela de indicadores
// anonimizados + nota de K-anonimato. Read-only. A defesa de papel (analyst) é do BFF (403 → restrito).
import { Show, For, createMemo } from 'solid-js'
import { useIndicatorsBinding } from './indicators.binding'
import { labelKeys } from './indicators.view-model'
import { AXIS_LABELS, type IndicatorAxis } from '~/shared/domain/indicators'
import { tpi } from '~/shared/i18n/indicators'
import * as s from './indicators.css'

export function IndicatorsPage() {
  const b = useIndicatorsBinding()
  const cols = createMemo(() => labelKeys(b.data()?.rows ?? []))

  return (
    <section class={s.wrap}>
      <h1 class={s.title}>{tpi('indicators.title')}</h1>

      <div class={s.controls}>
        <label class={s.field}>
          <span class={s.label}>{tpi('indicators.axis')}</span>
          <select class={s.select} value={b.axis()} onChange={(e) => b.setAxis(e.currentTarget.value as IndicatorAxis)}>
            <For each={b.axes}>{(a) => <option value={a}>{AXIS_LABELS[a]}</option>}</For>
          </select>
        </label>
        <label class={s.field}>
          <span class={s.label}>{tpi('indicators.periodStart')}</span>
          <input class={s.input} type="month" value={b.periodStart()} onInput={(e) => b.setPeriodStart(e.currentTarget.value)} />
        </label>
        <label class={s.field}>
          <span class={s.label}>{tpi('indicators.periodEnd')}</span>
          <input class={s.input} type="month" value={b.periodEnd()} onInput={(e) => b.setPeriodEnd(e.currentTarget.value)} />
        </label>
        <button type="button" class={s.applyBtn} onClick={b.apply}>
          {tpi('indicators.apply')}
        </button>
      </div>
      <Show when={b.formErr()}>{(t) => <p class={s.fieldError}>{tpi(t())}</p>}</Show>

      <Show
        when={!b.loadErrorTag()}
        fallback={<div class={s.errorBanner} role="alert">{tpi(b.loadErrorTag()!)}</div>}
      >
        <Show when={!b.pending()} fallback={<p class={s.muted}>Carregando…</p>}>
          <Show when={b.data()}>
            {(d) => (
              <>
                <p class={s.kanon}>
                  <strong>{tpi('indicators.kanon')}:</strong>{' '}
                  {tpi('indicators.kanon.note').replace('{k}', String(d().kThreshold)).replace('{n}', String(d().suppressedGroups))}
                </p>
                <Show when={d().rows.length > 0} fallback={<p class={s.muted}>{tpi('indicators.empty')}</p>}>
                  <div class={s.tableWrap}>
                    <table class={s.table}>
                      <thead>
                        <tr>
                          <For each={cols()}>{(c) => <th class={s.th}>{c}</th>}</For>
                          <th class={`${s.th} ${s.num}`}>{tpi('indicators.col.value')}</th>
                          <th class={s.th}>{tpi('indicators.col.period')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <For each={d().rows}>
                          {(row) => (
                            <tr>
                              <For each={cols()}>{(c) => <td class={s.td}>{row.labels[c] ?? '—'}</td>}</For>
                              <td class={`${s.td} ${s.num}`}>{row.value}</td>
                              <td class={s.td}>{row.period}</td>
                            </tr>
                          )}
                        </For>
                      </tbody>
                    </table>
                  </div>
                </Show>
              </>
            )}
          </Show>
        </Show>
      </Show>
    </section>
  )
}
