// Rota do prontuário do paciente "/patients/:id" (área protegida — guard da feature 001).
import { ProntuarioPage } from '~/modules/patients/public-api'

export default function PatientDetailRoute() {
  return <ProntuarioPage />
}
