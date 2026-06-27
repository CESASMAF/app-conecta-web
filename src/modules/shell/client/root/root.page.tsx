// Tela `root` do shell (composition — ADR-0012). NavRail + TopAppBar + container (Outlet via children).
import type { JSX } from 'solid-js'
import { useRootBinding } from './root.binding'
import { SideBar } from './components/side-bar.component'
import { TopBar } from './components/top-bar.component'
import type { CurrentUser } from '~/modules/auth/public-api'
import * as s from './root.css'

export type RootPageProps = Readonly<{
  user: CurrentUser
  children?: JSX.Element
}>

export function RootPage(props: RootPageProps) {
  const binding = useRootBinding(() => props.user)
  return (
    <div class={s.shell}>
      <SideBar items={binding.menu()} isActive={binding.isActive} />
      <div class={s.main}>
        <TopBar title={binding.pageTitle()} userLabel={binding.userLabel()} onLogout={binding.logout} />
        <main class={s.content}>{props.children}</main>
      </div>
    </div>
  )
}
