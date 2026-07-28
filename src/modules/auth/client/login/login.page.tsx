// Tela de login (composition): liga o binding Solid à view. Carrega o login flow do Kratos.
import { useLoginBinding } from './login.binding'
import { LoginCard } from './login-card.component'

export function LoginPage() {
  const binding = useLoginBinding()
  return <LoginCard result={binding.flow()} errorMessage={binding.errorMessage()} />
}
