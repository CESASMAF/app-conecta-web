// Rota pública /login → tela de login (importa via public-api do módulo auth, ADR-0001).
import { LoginPage } from '~/modules/auth/public-api'

export default function Login() {
  return <LoginPage />
}
