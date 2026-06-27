// Rota "/people/new" — cadastro de pessoa (Admin/RH). Protegida (guard 001); RBAC real no BFF.
import { PersonCreatePage } from '~/modules/people/public-api'

export default function NewPersonRoute() {
  return <PersonCreatePage />
}
