// Componentes de campo BURROS compartilhados (ADR-0009: props → JSX). Sem reatividade própria; recebem
// valor + erro já resolvido (string PT-BR) e emitem mudanças. Reusados por todas as áreas.
import { Show, For, createEffect } from 'solid-js'
import * as s from './field.css'

export function TextField(props: {
  label: string
  value: string
  onInput: (v: string) => void
  error?: string | undefined
  type?: string
  placeholder?: string
  inputMode?: 'text' | 'numeric'
  autocomplete?: string
}) {
  return (
    <label class={s.field}>
      <span class={s.label}>{props.label}</span>
      <input
        class={s.input}
        type={props.type ?? 'text'}
        value={props.value}
        placeholder={props.placeholder}
        inputmode={props.inputMode}
        autocomplete={props.autocomplete as never}
        aria-invalid={props.error ? 'true' : undefined}
        onInput={(e) => props.onInput(e.currentTarget.value)}
      />
      <Show when={props.error}>{(msg) => <span class={s.error}>{msg()}</span>}</Show>
    </label>
  )
}

export function SelectField(props: {
  label: string
  value: string
  onChange: (v: string) => void
  error?: string | undefined
  placeholder: string
  options: readonly { id: string; label: string }[]
}) {
  // As opcoes de catalogo chegam ASSINCRONAS (dominio_*). Ao abrir uma secao ja preenchida, o `value`
  // e aplicado enquanto o <select> ainda so tem o placeholder: o browser DESCARTA valor que nao casa
  // com nenhuma <option>, e quando as opcoes chegam nada reaplica — o campo ficava na primeira opcao
  // e mostrava ao profissional um dado que nao era o registrado. Este efeito depende de options E de
  // value, entao reaplica na chegada do catalogo.
  let ref!: HTMLSelectElement
  createEffect(() => {
    const desired = props.value
    props.options.length
    if (ref.value !== desired) ref.value = desired
  })
  return (
    <label class={s.field}>
      <span class={s.label}>{props.label}</span>
      <select
        ref={ref}
        class={s.select}
        value={props.value}
        aria-invalid={props.error ? 'true' : undefined}
        onChange={(e) => props.onChange(e.currentTarget.value)}
      >
        <option value="" disabled>
          {props.placeholder}
        </option>
        <For each={props.options}>{(o) => <option value={o.id}>{o.label}</option>}</For>
      </select>
      <Show when={props.error}>{(msg) => <span class={s.error}>{msg()}</span>}</Show>
    </label>
  )
}

export function RadioGroup(props: {
  label: string
  name: string
  value: string
  onChange: (v: string) => void
  error?: string | undefined
  options: readonly { value: string; label: string }[]
}) {
  return (
    <fieldset class={s.field}>
      <legend class={s.label}>{props.label}</legend>
      <div class={s.radioGroup}>
        <For each={props.options}>
          {(o) => (
            <label class={s.radio}>
              <input type="radio" name={props.name} value={o.value} checked={props.value === o.value} onChange={() => props.onChange(o.value)} />
              {o.label}
            </label>
          )}
        </For>
      </div>
      <Show when={props.error}>{(msg) => <span class={s.error}>{msg()}</span>}</Show>
    </fieldset>
  )
}

export function CheckboxField(props: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label class={s.radio}>
      <input type="checkbox" checked={props.checked} onChange={(e) => props.onChange(e.currentTarget.checked)} />
      {props.label}
    </label>
  )
}
