// Rota pública /recover → tela de recuperação de senha (importa via public-api do módulo auth, ADR-0001).
import { RecoverPage } from '~/modules/auth/public-api'

export default function Recover() {
  return <RecoverPage />
}
