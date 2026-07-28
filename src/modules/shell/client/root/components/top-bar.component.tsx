// Top app bar (view burra — ADR-0012). Breadcrumb + título por rota + sair.
// Identidade do usuário vive no card do rail (side-bar); aqui fica só o contexto da página.
import * as s from '../root.css'

export type TopBarProps = Readonly<{
  title: string
  onLogout: () => void
}>

export function TopBar(props: TopBarProps) {
  return (
    <header class={s.topbar}>
      <div class={s.topbarTitleWrap}>
        <span class={s.topbarCrumb}>Raros Boa Vista</span>
        <span class={s.topbarTitle}>{props.title}</span>
      </div>
      <button class={s.logoutBtn} type="button" onClick={() => props.onLogout()} data-testid="logout-button">
        Sair
      </button>
    </header>
  )
}
