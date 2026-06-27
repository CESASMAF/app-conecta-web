// Linha de paciente (view burra). Navega ao detalhe `/patients/:id`.
import * as s from '../patient-list.css'
import { patientStatusLabel } from '../../data/patient-status'
import type { PatientSummary } from '~/shared/domain/patient'

export function PatientRow(props: { patient: PatientSummary }) {
  return (
    <a class={s.row} href={`/patients/${props.patient.patientId}`} data-testid="patient-row">
      <span class={s.rowMain}>
        <span class={s.name}>{props.patient.fullName}</span>
        <span class={s.sub}>
          {props.patient.primaryDiagnosis ?? 'Sem diagnóstico principal'} · {props.patient.memberCount} no núcleo familiar
        </span>
      </span>
      <span class={s.badge}>{patientStatusLabel(props.patient.status)}</span>
    </a>
  )
}
