// Componentes de campo BURROS compartilhados (ADR-0009: props → JSX). Sem reatividade própria; recebem
// valor + erro já resolvido (string PT-BR) e emitem mudanças. Reusados por todas as áreas.
import { Show, For } from 'solid-js'
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
  return (
    <label class={s.field}>
      <span class={s.label}>{props.label}</span>
      <select
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
