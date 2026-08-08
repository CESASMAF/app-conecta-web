// /login não é mais uma tela deste app — quem renderiza autenticação é a UI do Ory (kratos-ui).
// A rota continua existindo como REDIRECT para não quebrar bookmarks nem o histórico do usuário.
// O middleware faz o 302 no SSR do documento; este componente só é alcançado por navegação SPA,
// onde o middleware não roda — daí a navegação dura, que reentra no servidor.
import { onMount } from 'solid-js'

export default function Login() {
  onMount(() => {
    window.location.href = '/api/auth/login'
  })
  return null
}
