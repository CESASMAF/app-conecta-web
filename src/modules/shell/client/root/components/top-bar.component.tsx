// Top app bar (view burra — ADR-0012). Título por rota + usuário + sair.
import * as s from '../root.css'

export type TopBarProps = Readonly<{
  title: string
  userLabel: string
  onLogout: () => void
}>

export function TopBar(props: TopBarProps) {
  return (
    <header class={s.topbar}>
      <span class={s.topbarTitle}>{props.title}</span>
      <span class={s.topbarUser}>{props.userLabel}</span>
      <button class={s.logoutBtn} type="button" onClick={() => props.onLogout()} data-testid="logout-button">
        Sair
      </button>
    </header>
  )
}
