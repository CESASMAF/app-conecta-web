// Tela `root` do shell (composition — ADR-0012). NavRail + TopAppBar + container (Outlet via children).
import { ErrorBoundary, type JSX } from 'solid-js'
import { useRootBinding } from './root.binding'
import { SideBar } from './components/side-bar.component'
import { TopBar } from './components/top-bar.component'
import { CrashFallback } from '~/shared/ui/crash-fallback.component'
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
      <SideBar items={binding.menu()} isActive={binding.isActive} userName={binding.userLabel()} userRole={binding.userRole()} />
      <div class={s.main}>
        <TopBar title={binding.pageTitle()} onLogout={binding.logout} logoutFalhou={binding.logoutFalhou()} />
        {/* A boundary fica AQUI, em volta só do conteúdo da rota: um throw no render de uma
            tela mostra o fallback sem levar junto o menu e a barra — e, principalmente, sem
            reavaliar o layout inteiro. Envolver o `(app).tsx` recriava a subárvore da rota a
            cada avaliação e derrubou toda navegação SPA em produção (2026-08-08). */}
        <main class={s.content}>
          <ErrorBoundary fallback={(err, reset) => <CrashFallback error={err} reset={reset} />}>
            {props.children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
