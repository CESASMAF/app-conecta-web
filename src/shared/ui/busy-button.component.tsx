// Botão de ação com estado ocupado (ADR-0009: props → JSX, sem reatividade própria).
//
// Existe porque `disabled` sozinho não é feedback. O botão apaga e nada explica que a
// gravação está acontecendo — quem clicou não sabe se o clique pegou, e a reação natural
// é clicar de novo. Em mutação isso vira registro duplicado.
//
// Três coisas mudam juntas quando `busy` é verdadeiro, de propósito: o texto (diz o que
// está acontecendo), o spinner (mostra que não travou) e `disabled` (impede o 2º clique).
// Nenhuma delas sozinha resolve — texto sem bloqueio ainda duplica, bloqueio sem texto
// ainda parece quebrado.
import { Show, type JSX } from 'solid-js'
import * as s from './kit.css'

export type BusyButtonProps = Readonly<{
  /** Rótulo em repouso. Ex.: "Salvar". */
  label: string
  /** Rótulo enquanto grava. Ex.: "Salvando…". Verbo no gerúndio: descreve, não promete. */
  busyLabel: string
  busy: boolean
  onClick?: () => void
  /** `submit` quando o form posta nativamente; `button` quando a ação é no onClick. */
  type?: 'button' | 'submit'
  /** Desabilita por outro motivo (formulário inválido, por exemplo). */
  disabled?: boolean
  variant?: 'primary' | 'ghost' | 'tonal' | 'gradient'
  small?: boolean
  class?: string
}>

export function BusyButton(props: BusyButtonProps): JSX.Element {
  return (
    <button
      type={props.type ?? 'button'}
      class={`${s.btn[props.variant ?? 'primary']} ${s.btnBusy} ${props.small ? s.btnSm : ''} ${props.class ?? ''}`}
      // `busy` sempre bloqueia: é o que impede o duplo-submit.
      disabled={props.busy || props.disabled === true}
      // Para leitor de tela o botão continua existindo, mas anunciado como ocupado —
      // `disabled` sozinho apenas o tira da navegação, sem dizer por quê.
      aria-busy={props.busy}
      onClick={() => props.onClick?.()}
    >
      <Show when={props.busy}>
        <span class={s.btnSpinner} aria-hidden="true" />
      </Show>
      {props.busy ? props.busyLabel : props.label}
    </button>
  )
}
