// Rota "/people/:id" — detalhe da pessoa (Admin/RH). Protegida (guard 001); RBAC real no BFF.
import { PersonDetailPage } from '~/modules/people/public-api'

export default function PersonRoute() {
  return <PersonDetailPage />
}
