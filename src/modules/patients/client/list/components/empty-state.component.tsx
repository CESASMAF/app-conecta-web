// Estado vazio (view burra).
import * as s from '../patient-list.css'

export function EmptyState(props: { message: string }) {
  return (
    <div class={s.centered} role="status" data-testid="patients-empty">
      {props.message}
    </div>
  )
}
