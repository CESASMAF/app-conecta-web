// Skeleton de carregamento (view burra).
import { For } from 'solid-js'
import * as s from '../patient-list.css'

export function ListSkeleton(props: { rows?: number }) {
  return (
    <div class={s.list} aria-hidden="true" data-testid="patients-skeleton">
      <For each={Array.from({ length: props.rows ?? 6 })}>{() => <div class={s.skeleton} />}</For>
    </div>
  )
}
