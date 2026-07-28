// Linha de paciente (view burra). Navega ao detalhe `/patients/:id`.
import * as s from '../patient-list.css'
import { patientStatusLabel, patientStatusVariant } from '../../data/patient-status'
import { avatar, chipStatus } from '../../../../../shared/ui/kit.css'
import { initials } from '../../../../../shared/ui/initials'
import type { PatientSummary } from '~/shared/domain/patient'

export function PatientRow(props: { patient: PatientSummary }) {
  return (
    <a class={s.row} href={`/patients/${props.patient.patientId}`} data-testid="patient-row">
      <span class={avatar.md} aria-hidden="true">
        {initials(props.patient.fullName)}
      </span>
      <span class={s.rowMain}>
        <span class={s.name}>{props.patient.fullName}</span>
        <span class={s.sub}>
          {props.patient.primaryDiagnosis ?? 'Sem diagnóstico principal'} · {props.patient.memberCount} no núcleo familiar
        </span>
      </span>
      <span class={chipStatus[patientStatusVariant(props.patient.status)]}>{patientStatusLabel(props.patient.status)}</span>
    </a>
  )
}
