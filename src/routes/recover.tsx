// /recover não é mais uma tela deste app — a recuperação de senha é da UI do Ory (kratos-ui).
// A rota continua existindo como REDIRECT porque este caminho ainda aparece em links antigos.
// Igual a /login: o middleware resolve no SSR e este componente cobre a navegação SPA. O destino
// (`KRATOS_UI_URL`) é server-only, então recarregamos como documento e deixamos o middleware decidir.
import { onMount } from 'solid-js'

export default function Recover() {
  onMount(() => {
    window.location.replace('/recover')
  })
  return null
}
