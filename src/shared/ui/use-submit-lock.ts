// Trava de envio para formulários de NAVEGAÇÃO (post nativo, sem fetch) — login e recuperação.
//
// Nesses forms a resposta é uma navegação: a página some. Travar o botão evita o reclique que
// dispara um segundo código por e-mail. O problema é o caminho em que a navegação NÃO acontece:
// aí o botão travado vira um beco sem saída — a pessoa não consegue tentar de novo sem recarregar.
//
// Três formas de o submit morrer sem sair da página, todas já vistas neste app:
//   1. `pageshow` — o navegador restaura a página (bfcache), com o botão como ficou;
//   2. `form-action` da CSP — a diretiva é reavaliada a cada REDIRECT do submit, então um 303
//      para outra origem é abortado em silêncio (foi o que travou o login em produção);
//   3. qualquer falha de rede/servidor que não produza navegação.
//
// (1) e (2) têm evento próprio. (3) não tem — daí o prazo: se a navegação não começou, o envio
// morreu e o controle volta para a pessoa. O prazo é generoso de propósito, porque o envio de
// e-mail passa pelo courier e é legitimamente lento.
import { createSignal, onMount, onCleanup, type Accessor } from 'solid-js'

const PRAZO_ATE_DESISTIR_MS = 15_000

export type SubmitLock<T> = Readonly<{
  emEnvio: Accessor<T | null>
  travar: (marca: T) => void
  destravar: () => void
}>

export function useSubmitLock<T = true>(): SubmitLock<T> {
  const [emEnvio, setEmEnvio] = createSignal<T | null>(null)
  let prazo: ReturnType<typeof setTimeout> | undefined

  const destravar = (): void => {
    clearTimeout(prazo)
    setEmEnvio(() => null)
  }

  const travar = (marca: T): void => {
    setEmEnvio(() => marca)
    clearTimeout(prazo)
    prazo = setTimeout(destravar, PRAZO_ATE_DESISTIR_MS)
  }

  onMount(() => {
    const aoRestaurar = (): void => destravar()
    const aoViolarCsp = (e: SecurityPolicyViolationEvent): void => {
      if (e.violatedDirective.startsWith('form-action')) destravar()
    }
    window.addEventListener('pageshow', aoRestaurar)
    document.addEventListener('securitypolicyviolation', aoViolarCsp)
    onCleanup(() => {
      window.removeEventListener('pageshow', aoRestaurar)
      document.removeEventListener('securitypolicyviolation', aoViolarCsp)
      clearTimeout(prazo)
    })
  })

  return { emEnvio, travar, destravar }
}
