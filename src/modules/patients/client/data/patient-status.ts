// Situação do paciente: tipo/guard vêm do shared (compartilhado c/ o BFF); o RÓTULO i18n (apresentação)
// vive aqui no módulo. Redação final é da P.O.
import type { PatientStatus } from '~/shared/domain/patient'
export { PATIENT_STATUSES, isPatientStatus, type PatientStatus } from '~/shared/domain/patient'

const LABELS: Readonly<Record<PatientStatus, string>> = {
  ACTIVE: 'Em atendimento',
  WAITLISTED: 'Em fila',
  ADMITTED: 'Admitido',
  DISCHARGED: 'Desligado',
  WITHDRAWN: 'Retirado',
}

export const patientStatusLabel = (s: PatientStatus): string => LABELS[s]

// Variante de chip (cor = significado; ver kit `chipStatus`). Só situações ativas ganham cor;
// desligado/retirado ficam neutros (Modo Enxuto). Nomes batem com as chaves de `chipStatus`.
export type PatientStatusVariant = 'acolhido' | 'fila' | 'alta' | 'neutral'
const VARIANTS: Readonly<Record<PatientStatus, PatientStatusVariant>> = {
  ACTIVE: 'acolhido',
  WAITLISTED: 'fila',
  ADMITTED: 'alta',
  DISCHARGED: 'neutral',
  WITHDRAWN: 'neutral',
}
export const patientStatusVariant = (s: PatientStatus): PatientStatusVariant => VARIANTS[s]
