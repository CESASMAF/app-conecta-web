// Tela de erro (composition): liga o binding à view.
import { useErrorBinding } from './error.binding'
import { ErrorCard } from './error-card.component'

export function ErrorPage() {
  const b = useErrorBinding()
  return <ErrorCard result={b.result()} errorId={b.errorId()} />
}
