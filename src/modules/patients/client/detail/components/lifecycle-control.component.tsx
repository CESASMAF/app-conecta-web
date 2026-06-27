// Controle de ciclo de vida (US3): renderiza SÓ as transições cabíveis à situação (calculadas pelo
// servidor em `availableTransitions`). Transições que exigem motivo (alta/retirada) abrem um painel com
// motivo + observações, validados ANTES do envio (FR-008). A ação devolve o overview recomposto (binding).
import { Show, For, createSignal } from 'solid-js'
import type { AvailableTransition, LifecycleAction, PatientOverview } from '~/shared/domain/patient-overview'
import type { PatientOverviewBinding } from '../patient-overview.binding'
import { DISCHARGE_REASONS, WITHDRAW_REASONS, emptyReason, validateReason, toReasonInput } from '../resumo-actions.view-model'
import { tp } from '~/shared/i18n/patients'
import { SelectField, TextField } from '~/shared/ui/field.component'
import * as s from '../prontuario.css'

const REASONS: Partial<Record<LifecycleAction, readonly { value: string; label: string }[]>> = {
  discharge: DISCHARGE_REASONS,
  withdraw: WITHDRAW_REASONS,
}

export function LifecycleControl(props: { overview: PatientOverview; b: PatientOverviewBinding }) {
  const [openFor, setOpenFor] = createSignal<LifecycleAction | null>(null)
  const [form, setForm] = createSignal(emptyReason())
  const [err, setErr] = createSignal<string | null>(null)
  const set = (patch: Partial<{ reason: string; notes: string }>) => setForm((prev) => ({ ...prev, ...patch }))

  const start = (t: AvailableTransition): void => {
    if (t.requiresReason) {
      setForm(emptyReason())
      setErr(null)
      setOpenFor(t.action)
    } else {
      void props.b.runLifecycle(t.action)
    }
  }

  const confirm = async (): Promise<void> => {
    const tag = validateReason(form())
    if (tag) {
      setErr(tp(tag))
      return
    }
    const okDone = await props.b.runLifecycle(openFor()!, toReasonInput(form()))
    if (okDone) setOpenFor(null)
  }

  return (
    <Show when={props.overview.availableTransitions.length > 0}>
      <div class={s.lifecycle}>
        <For each={props.overview.availableTransitions}>
          {(t) => (
            <button type="button" class={s.actionBtn} disabled={props.b.busy()} onClick={() => start(t)}>
              {t.label}
            </button>
          )}
        </For>
        <Show when={openFor()}>
          {(action) => (
            <div class={s.editPanel} role="dialog" aria-label="Confirmar ação">
              <SelectField
                label="Motivo"
                value={form().reason}
                onChange={(v) => set({ reason: v })}
                placeholder="Selecionar motivo…"
                options={(REASONS[action()] ?? []).map((r) => ({ id: r.value, label: r.label }))}
              />
              <TextField label="Observações" value={form().notes} onInput={(v) => set({ notes: v })} placeholder="Detalhe se necessário" />
              <Show when={err()}>{(m) => <p class={s.fieldError}>{m()}</p>}</Show>
              <div class={s.reasonActions}>
                <button type="button" class={s.ghostBtn} onClick={() => setOpenFor(null)}>
                  Cancelar
                </button>
                <button type="button" class={s.actionBtn} disabled={props.b.busy()} onClick={() => void confirm()}>
                  Confirmar
                </button>
              </div>
            </div>
          )}
        </Show>
      </div>
    </Show>
  )
}
