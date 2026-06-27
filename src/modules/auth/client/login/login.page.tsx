// Tela de login (composition): liga o binding Solid à view burra. Reativa via os search params.
import { useLoginBinding } from './login.binding'
import { LoginCard } from './login-card.component'

export function LoginPage() {
  const binding = useLoginBinding()
  return <LoginCard loginHref={binding.loginHref()} errorMessage={binding.errorMessage()} />
}
