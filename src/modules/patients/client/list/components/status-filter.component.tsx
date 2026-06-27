// Filtro por situação (select controlado — view burra).
import { For } from 'solid-js'
import * as s from '../patient-list.css'
import { PATIENT_STATUSES, patientStatusLabel } from '../../data/patient-status'

export function StatusFilter(props: { value: string; allLabel: string; onStatus: (v: string | undefined) => void }) {
  return (
    <select
      class={s.select}
      value={props.value}
      aria-label="Filtrar por situação"
      data-testid="patients-status-filter"
      onChange={(e) => props.onStatus(e.currentTarget.value || undefined)}
    >
      <option value="">{props.allLabel}</option>
      <For each={PATIENT_STATUSES}>{(st) => <option value={st}>{patientStatusLabel(st)}</option>}</For>
    </select>
  )
}
