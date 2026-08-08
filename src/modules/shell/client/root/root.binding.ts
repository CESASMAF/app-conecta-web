// Binding Solid do shell (ADR-0012) — liga a VM pura ao router + ações. Inclui logout (T046).
import { useLocation } from '@solidjs/router'
import { createSignal } from 'solid-js'
import { rootViewModel } from './root.view-model'
import type { CurrentUser } from '~/modules/auth/public-api'

export function useRootBinding(user: () => CurrentUser) {
  const location = useLocation()
  const [logoutFalhou, setLogoutFalhou] = createSignal(false)
  return {
    menu: () => rootViewModel.visibleMenu(user().groups),
    pageTitle: () => rootViewModel.pageTitle(location.pathname),
    isActive: (href: string) => rootViewModel.isActive(location.pathname, href),
    userLabel: () => user().displayName ?? user().userId,
    userRole: () => rootViewModel.roleLabel(user().groups),
    logoutFalhou,
    logout: () => {
      // CSRF: X-Requested-With (ADR-0005).
      //
      // O destino vem do BFF (`redirectTo`): é o RP-initiated logout do Hydra, com o
      // `id_token_hint` que só o servidor tem. Navegação DURA — é outra origem, e um
      // `navigate` do router só trocaria de rota dentro do app.
      //
      // Era exatamente esse o bug: `navigate('/login')` reentrava em /api/auth/login,
      // o Hydra fazia `skip` porque a sessão dele continuava viva, e o usuário voltava
      // logado. Sair virou um ciclo de re-login.
      setLogoutFalhou(false)
      void fetch('/api/auth/logout', { method: 'POST', headers: { 'x-requested-with': 'fetch' } })
        .then(async (r) => {
          if (!r.ok) return null
          const body = (await r.json()) as { data?: { redirectTo?: string } }
          return body.data?.redirectTo ?? null
        })
        .catch(() => null)
        .then((destino) => {
          // Sem destino, a sessão do BFF provavelmente NÃO foi revogada (403 de CSRF por um
          // proxy que corta o header, 5xx, rede fora). Mandar o browser para `/` aqui seria o
          // pior desfecho: a área logada renderiza de novo, a tela pisca e o usuário acha que
          // saiu sem ter saído. Falha de logout é a última que pode ser silenciosa.
          if (destino === null) {
            setLogoutFalhou(true)
            return
          }
          window.location.href = destino
        })
    },
  }
}
