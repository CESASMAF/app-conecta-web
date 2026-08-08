// Top app bar (view burra — ADR-0012). Breadcrumb + título por rota + sair.
// Identidade do usuário vive no card do rail (side-bar); aqui fica só o contexto da página.
import { Show } from 'solid-js'
import * as s from '../root.css'

export type TopBarProps = Readonly<{
  title: string
  onLogout: () => void
  // Verdadeiro quando o POST de logout não completou. A sessão continua de pé: quem clicou
  // precisa saber, senão sai da frente do computador achando que saiu do sistema.
  logoutFalhou?: boolean
}>

export function TopBar(props: TopBarProps) {
  return (
    <header class={s.topbar}>
      <div class={s.topbarTitleWrap}>
        <span class={s.topbarCrumb}>Raros Boa Vista</span>
        <span class={s.topbarTitle}>{props.title}</span>
      </div>
      <Show when={props.logoutFalhou}>
        <span class={s.logoutErro} role="alert">
          Não foi possível sair — você continua conectado. Tente de novo.
        </span>
      </Show>
      <button class={s.logoutBtn} type="button" onClick={() => props.onLogout()} data-testid="logout-button">
        Sair
      </button>
    </header>
  )
}
