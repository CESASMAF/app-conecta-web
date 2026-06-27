// Rota "/patients/new" — cadastro de paciente (área protegida — guard da feature 001).
// Inc 2: wizard de 2 passos + rota de cadastro orquestrado (cria pessoa + paciente nos bastidores).
import { PatientCreatePage } from '~/modules/patients/public-api'

export default function NewPatientRoute() {
  return <PatientCreatePage />
}
