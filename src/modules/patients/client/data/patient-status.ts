// Situação do paciente: tipo/guard vêm do shared (compartilhado c/ o BFF); o RÓTULO i18n (apresentação)
// vive aqui no módulo. Redação final é da P.O.
import type { PatientStatus } from '~/shared/domain/patient'
export { PATIENT_STATUSES, isPatientStatus, type PatientStatus } from '~/shared/domain/patient'

// Só as três situações que o domínio conhece. `Admitido`/`Retirado` eram nomes de AÇÃO
// aqui dentro: admitir leva a `active`, retirar-da-fila leva a `discharged`. Ver
// `shared/domain/patient.ts`.
const LABELS: Readonly<Record<PatientStatus, string>> = {
  WAITLISTED: 'Em fila',
  ACTIVE: 'Em atendimento',
  DISCHARGED: 'Desligado',
}

export const patientStatusLabel = (s: PatientStatus): string => LABELS[s]

// Variante de chip (cor = significado; ver kit `chipStatus`). Só situações ativas ganham cor;
// desligado/retirado ficam neutros (Modo Enxuto). Nomes batem com as chaves de `chipStatus`.
export type PatientStatusVariant = 'acolhido' | 'fila' | 'alta' | 'neutral'
const VARIANTS: Readonly<Record<PatientStatus, PatientStatusVariant>> = {
  WAITLISTED: 'fila',
  ACTIVE: 'acolhido',
  DISCHARGED: 'neutral',
}
export const patientStatusVariant = (s: PatientStatus): PatientStatusVariant => VARIANTS[s]
