// Layout da ÁREA PROTEGIDA (guard + shell). Padrão canônico SolidStart (advanced/auth):
// `query` chama a server function que lê a sessão; sem usuário → `throw redirect('/login')`.
// `deferStream: true` é OBRIGATÓRIO: garante o resolve ANTES do streaming (redirect SSR não pode
// ocorrer depois que o stream começa).
import { createAsync, query, redirect, type RouteSectionProps } from '@solidjs/router'
import { Show } from 'solid-js'
import { getCurrentUserFn } from '~/modules/auth/public-api'
import { RootPage } from '~/modules/shell/public-api'

const requireUser = query(async () => {
  const user = await getCurrentUserFn()
  if (!user) throw redirect('/login')
  return user
}, 'auth:me')

export default function AppLayout(props: RouteSectionProps) {
  const user = createAsync(() => requireUser(), { deferStream: true })
  return <Show when={user()}>{(u) => <RootPage user={u()}>{props.children}</RootPage>}</Show>
}
