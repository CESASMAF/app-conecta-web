// Rota da lista de pacientes "/patients" (área protegida — guard da feature 001).
import { PatientListPage } from '~/modules/patients/public-api'

export default function PatientsRoute() {
  return <PatientListPage />
}
