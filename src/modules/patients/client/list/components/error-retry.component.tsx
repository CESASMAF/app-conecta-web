// Erro + "tentar novamente" (view burra — G2).
import * as s from '../patient-list.css'

export function ErrorRetry(props: { message: string; retryLabel: string; onRetry: () => void }) {
  return (
    <div class={s.centered} role="alert">
      <span>{props.message}</span>
      <button class={s.retryBtn} type="button" onClick={() => props.onRetry()} data-testid="patients-retry">
        {props.retryLabel}
      </button>
    </div>
  )
}
