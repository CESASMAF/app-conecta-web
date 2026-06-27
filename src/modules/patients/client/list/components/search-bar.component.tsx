// Busca por nome (view com estado LOCAL de input p/ digitação imediata; o debounce vive no binding).
import { createSignal } from 'solid-js'
import * as s from '../patient-list.css'

export function SearchBar(props: { value: string; placeholder: string; onSearch: (v: string) => void }) {
  const [local, setLocal] = createSignal(props.value)
  return (
    <input
      class={s.searchInput}
      type="search"
      value={local()}
      placeholder={props.placeholder}
      aria-label={props.placeholder}
      data-testid="patients-search"
      onInput={(e) => {
        setLocal(e.currentTarget.value)
        props.onSearch(e.currentTarget.value)
      }}
    />
  )
}
