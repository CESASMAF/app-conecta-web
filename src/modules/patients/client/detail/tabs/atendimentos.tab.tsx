// Aba ATENDIMENTOS (US5): lista de atendimentos + registrar; informações de ingresso (ler + editar).
import { Show, For, createSignal } from 'solid-js'
import { useCareBinding } from '../care.binding'
import { AppointmentForm_, IntakeForm_ } from '../components/care-forms.component'
import { formatDate } from '../care.view-model'
import { tp } from '~/shared/i18n/patients'
import * as s from '../prontuario.css'

export function AtendimentosTab() {
  const b = useCareBinding()
  const [open, setOpen] = createSignal<'none' | 'appointment' | 'intake'>('none')
  const close = () => setOpen('none')
  const saveClose = async <T,>(p: T, fn: (x: T) => Promise<boolean>): Promise<boolean> => {
    const okDone = await fn(p)
    if (okDone) close()
    return okDone
  }

  return (
    <Show when={!b.pending()} fallback={<p class={s.muted}>Carregando…</p>}>
      <Show when={!b.loadError()} fallback={<p class={s.muted}>{tp('care.error.load')}</p>}>
        <Show when={b.errTag()}>{(t) => <div class={s.errorBanner} role="alert">{tp(t())}</div>}</Show>

        <div class={s.sectionHead}>
          <h2 class={s.sectionTitle}>Atendimentos ({b.data()?.appointments.length ?? 0})</h2>
          <Show when={open() !== 'appointment'} fallback={<button type="button" class={s.linkBtn} onClick={close}>fechar</button>}>
            <button type="button" class={s.linkBtn} onClick={() => setOpen('appointment')}>+ registrar</button>
          </Show>
        </div>
        <Show when={open() === 'appointment'}>
          <AppointmentForm_ busy={b.busy()} onSave={(p) => saveClose(p, b.registerAppointment)} onCancel={close} />
        </Show>
        <Show when={(b.data()?.appointments.length ?? 0) > 0} fallback={<p class={s.muted}>{tp('care.empty')}</p>}>
          <ul class={s.familyList}>
            <For each={b.data()!.appointments}>
              {(a) => (
                <li class={s.familyRow}>
                  <span>
                    <strong>{formatDate(a.date) || 'Atendimento'}</strong>
                    <Show when={a.type}><span class={s.muted}> · {a.type}</span></Show>
                    <Show when={a.summary}><span class={s.muted}> · {a.summary}</span></Show>
                  </span>
                </li>
              )}
            </For>
          </ul>
        </Show>

        <div class={s.sectionHead}>
          <h2 class={s.sectionTitle}>Ingresso</h2>
          <Show when={open() !== 'intake'} fallback={<button type="button" class={s.linkBtn} onClick={close}>fechar</button>}>
            <button type="button" class={s.linkBtn} onClick={() => setOpen('intake')}>{b.data()?.intakeInfo ? 'editar' : 'preencher'}</button>
          </Show>
        </div>
        <Show
          when={open() === 'intake'}
          fallback={
            <Show when={b.data()?.intakeInfo} fallback={<p class={s.muted}>{tp('care.empty')}</p>}>
              {(intake) => <p>Ingresso registrado · {intake().serviceReason}</p>}
            </Show>
          }
        >
          <IntakeForm_ initial={b.data()?.intakeInfo ?? null} busy={b.busy()} onSave={(p) => saveClose(p, b.updateIntake)} onCancel={close} />
        </Show>
      </Show>
    </Show>
  )
}
