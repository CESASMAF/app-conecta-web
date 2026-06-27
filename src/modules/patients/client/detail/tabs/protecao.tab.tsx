// Aba PROTEÇÃO (US5): acolhimento (ler+editar), violações de direitos (listar + relatar), encaminhamentos
// (listar + criar). Pessoas/membros para os pickers vêm do overview já carregado.
import { Show, For, createSignal, createMemo } from 'solid-js'
import { useCareBinding } from '../care.binding'
import { PlacementForm_, ViolationForm_, ReferralForm_, type Picker } from '../components/care-forms.component'
import { formatDate } from '../care.view-model'
import type { PatientOverview } from '~/shared/domain/patient-overview'
import { tp } from '~/shared/i18n/patients'
import * as s from '../prontuario.css'

export function ProtecaoTab(props: { overview: PatientOverview }) {
  const b = useCareBinding()
  const [open, setOpen] = createSignal<'none' | 'placement' | 'violation' | 'referral'>('none')
  const close = () => setOpen('none')
  const saveClose = async <T,>(p: T, fn: (x: T) => Promise<boolean>): Promise<boolean> => {
    const okDone = await fn(p)
    if (okDone) close()
    return okDone
  }

  const members = createMemo<Picker[]>(() => props.overview.family.members.map((m) => ({ value: m.memberPersonId, label: m.fullName || m.relationshipLabel })))
  const persons = createMemo<Picker[]>(() => [
    { value: props.overview.personId, label: `${props.overview.fullName || 'Paciente'} (paciente)` },
    ...members(),
  ])

  return (
    <Show when={!b.pending()} fallback={<p class={s.muted}>Carregando…</p>}>
      <Show when={!b.loadError()} fallback={<p class={s.muted}>{tp('care.error.load')}</p>}>
        <Show when={b.errTag()}>{(t) => <div class={s.errorBanner} role="alert">{tp(t())}</div>}</Show>

        {/* Acolhimento */}
        <div class={s.sectionHead}>
          <h2 class={s.sectionTitle}>Acolhimento</h2>
          <Show when={open() !== 'placement'} fallback={<button type="button" class={s.linkBtn} onClick={close}>fechar</button>}>
            <button type="button" class={s.linkBtn} onClick={() => setOpen('placement')}>{b.data()?.placementHistory ? 'editar' : 'preencher'}</button>
          </Show>
        </div>
        <Show
          when={open() === 'placement'}
          fallback={
            <Show when={b.data()?.placementHistory} fallback={<p class={s.muted}>{tp('care.empty')}</p>}>
              {(pl) => <p>Acolhimento registrado · {pl().individualPlacements.length} registro(s)</p>}
            </Show>
          }
        >
          <PlacementForm_ initial={b.data()?.placementHistory ?? null} members={members()} busy={b.busy()} onSave={(p) => saveClose(p, b.updatePlacement)} onCancel={close} />
        </Show>

        {/* Violações */}
        <div class={s.sectionHead}>
          <h2 class={s.sectionTitle}>Violações de direitos ({b.data()?.violationReports.length ?? 0})</h2>
          <Show when={open() !== 'violation'} fallback={<button type="button" class={s.linkBtn} onClick={close}>fechar</button>}>
            <button type="button" class={s.linkBtn} onClick={() => setOpen('violation')}>+ relatar</button>
          </Show>
        </div>
        <Show when={open() === 'violation'}>
          <ViolationForm_ persons={persons()} busy={b.busy()} onSave={(p) => saveClose(p, b.reportViolation)} onCancel={close} />
        </Show>
        <Show when={(b.data()?.violationReports.length ?? 0) > 0} fallback={<p class={s.muted}>{tp('care.empty')}</p>}>
          <ul class={s.familyList}>
            <For each={b.data()!.violationReports}>
              {(v) => (
                <li class={s.familyRow}>
                  <span>
                    <strong>{formatDate(v.reportDate)}</strong>
                    <Show when={v.descriptionOfFact}><span class={s.muted}> · {v.descriptionOfFact}</span></Show>
                  </span>
                </li>
              )}
            </For>
          </ul>
        </Show>

        {/* Encaminhamentos */}
        <div class={s.sectionHead}>
          <h2 class={s.sectionTitle}>Encaminhamentos ({b.data()?.referrals.length ?? 0})</h2>
          <Show when={open() !== 'referral'} fallback={<button type="button" class={s.linkBtn} onClick={close}>fechar</button>}>
            <button type="button" class={s.linkBtn} onClick={() => setOpen('referral')}>+ encaminhar</button>
          </Show>
        </div>
        <Show when={open() === 'referral'}>
          <ReferralForm_ persons={persons()} busy={b.busy()} onSave={(p) => saveClose(p, b.createReferral)} onCancel={close} />
        </Show>
        <Show when={(b.data()?.referrals.length ?? 0) > 0} fallback={<p class={s.muted}>{tp('care.empty')}</p>}>
          <ul class={s.familyList}>
            <For each={b.data()!.referrals}>
              {(r) => (
                <li class={s.familyRow}>
                  <span>
                    <strong>{formatDate(r.date)}</strong>
                    <Show when={r.destinationService}><span class={s.muted}> · {r.destinationService}</span></Show>
                    <Show when={r.reason}><span class={s.muted}> · {r.reason}</span></Show>
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
