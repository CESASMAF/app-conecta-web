// Tela de recuperação (composition): liga o binding à view.
import { useRecoverBinding } from './recover.binding'
import { RecoverCard } from './recover-card.component'

export function RecoverPage() {
  const b = useRecoverBinding()
  return <RecoverCard result={b.flow()} />
}
