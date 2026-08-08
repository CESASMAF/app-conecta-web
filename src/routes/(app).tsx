// Layout da ÁREA PROTEGIDA (guard + shell). Padrão canônico SolidStart (advanced/auth):
// `query` chama a server function que lê a sessão; sem usuário → `throw redirect('/login')`.
// `deferStream: true` é OBRIGATÓRIO: garante o resolve ANTES do streaming (redirect SSR não pode
// ocorrer depois que o stream começa).
import { createAsync, query, redirect, type RouteSectionProps } from '@solidjs/router'
import { ErrorBoundary, Show } from 'solid-js'
import { getCurrentUserFn } from '~/modules/auth/public-api'
import { RootPage } from '~/modules/shell/public-api'
import { CrashFallback } from '~/shared/ui/crash-fallback.component'

const requireUser = query(async () => {
  const user = await getCurrentUserFn()
  if (!user) throw redirect('/login')
  return user
}, 'auth:me')

export default function AppLayout(props: RouteSectionProps) {
  const user = createAsync(() => requireUser(), { deferStream: true })
  // ErrorBoundary em volta de TODA a área logada: sem ela, um throw no render de qualquer
  // tela derruba o documento e o usuário cai na página crua do SolidStart. Aconteceu em
  // produção — uma mutação que respondeu 403 virou "Uncaught Client Exception", e o erro
  // real nunca chegou ao formulário (2026-08-08).
  return (
    <ErrorBoundary fallback={(err, reset) => <CrashFallback error={err} reset={reset} />}>
      <Show when={user()}>{(u) => <RootPage user={u()}>{props.children}</RootPage>}</Show>
    </ErrorBoundary>
  )
}
