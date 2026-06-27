// Rota "/people" — área de Pessoas (Admin/RH · people-context). Protegida (guard 001); RBAC real no BFF.
import { PeopleListPage } from '~/modules/people/public-api'

export default function PeopleRoute() {
  return <PeopleListPage />
}
