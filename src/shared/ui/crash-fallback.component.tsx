// Fallback da ErrorBoundary da área logada.
//
// Por que existe: até 2026-08-08 nenhuma tela do app tinha rede de proteção — um throw no
// render de QUALQUER componente derrubava o documento inteiro e o usuário via a tela crua do
// SolidStart ("Error | Uncaught Client Exception"), sem marca, sem saída e sem pista do que
// fazer. Foi assim que um 403 numa mutação apareceu como "o app quebrou": o erro real nunca
// chegou ao formulário.
//
// A boundary não conserta o bug — ela impede que um bug de uma tela vire uma sessão perdida.
import { Show } from 'solid-js'
import { revalidate } from '@solidjs/router'
import * as s from './crash-fallback.css'
import { btn } from './kit.css'

export type CrashFallbackProps = Readonly<{
  error: unknown
  // `reset` do ErrorBoundary: limpa o erro e re-renderiza a subárvore.
  reset: () => void
}>

const mensagem = (error: unknown): string =>
  error instanceof Error ? error.message : typeof error === 'string' ? error : String(error)

export function CrashFallback(props: CrashFallbackProps) {
  return (
    <div class={s.wrap}>
      <div class={s.card} role="alert">
        <h1 class={s.title}>Algo quebrou nesta tela</h1>
        <p class={s.body}>
          O erro foi contido aqui — sua sessão continua ativa e nada do que você já salvou se perdeu.
        </p>
        <div class={s.actions}>
          {/* `reset()` sozinho só limpa o erro e re-renderiza: se o que lançou foi a LEITURA de
              um recurso que já está em estado de erro, ele lança de novo no mesmo instante e a
              tela de crash volta — quantas vezes se clique. Revalidar primeiro dá ao recurso a
              chance de buscar de novo, e é o que faz o botão significar o que promete. */}
          <button
            type="button"
            class={btn.primary}
            onClick={() => {
              void revalidate(undefined).finally(() => props.reset())
            }}
          >
            Tentar novamente
          </button>
          <button type="button" class={btn.ghost} onClick={() => window.location.reload()}>
            Recarregar a página
          </button>
        </div>
        <Show when={mensagem(props.error)}>
          {(msg) => (
            <details class={s.details}>
              <summary>Detalhe técnico</summary>
              <pre class={s.pre}>{msg()}</pre>
            </details>
          )}
        </Show>
      </div>
    </div>
  )
}
