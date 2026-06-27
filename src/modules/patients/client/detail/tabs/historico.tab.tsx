// Aba HISTÓRICO (US5): trilha de auditoria do paciente (read-only). Eventos com data + tipo (rótulo
// amigável). O `payload` do evento NÃO é exposto (pode conter PII — LGPD).
import { Show, For, createMemo } from 'solid-js'
import { createAsync, query, useParams } from '@solidjs/router'
import { getAuditTrailFn } from '../../../server/patient-care.fn'
import { auditEventLabel, formatDate } from '../care.view-model'
import { isOk } from '~/shared/http/result'
import { tp } from '~/shared/i18n/patients'
import * as s from '../prontuario.css'

const auditQuery = query((id: string) => getAuditTrailFn(id), 'patient:audit')

export function HistoricoTab() {
  const params = useParams()
  const trail = createAsync(() => auditQuery(params.id ?? ''))
  const pending = createMemo(() => trail() === undefined)
  const entries = createMemo(() => {
    const r = trail()
    return r && isOk(r) ? r.value : []
  })
  const loadError = createMemo(() => {
    const r = trail()
    return Boolean(r) && !isOk(r!)
  })

  return (
    <Show when={!pending()} fallback={<p class={s.muted}>Carregando…</p>}>
      <Show when={!loadError()} fallback={<p class={s.muted}>{tp('care.error.load')}</p>}>
        <h2 class={s.sectionTitle}>Trilha de auditoria</h2>
        <Show when={entries().length > 0} fallback={<p class={s.muted}>{tp('care.empty')}</p>}>
          <ul class={s.familyList}>
            <For each={entries()}>
              {(e) => (
                <li class={s.familyRow}>
                  <span>
                    <strong>{formatDate(e.occurredAt)}</strong>
                    <span class={s.muted}> · {auditEventLabel(e.eventType)}</span>
                  </span>
                </li>
              )}
            </For>
          </ul>
        </Show>
      </Show>
    </Show>
  )
}
