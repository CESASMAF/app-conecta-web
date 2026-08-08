// Binding Solid do shell (ADR-0012) — liga a VM pura ao router + ações. Inclui logout (T046).
import { useLocation } from '@solidjs/router'
import { rootViewModel } from './root.view-model'
import type { CurrentUser } from '~/modules/auth/public-api'

export function useRootBinding(user: () => CurrentUser) {
  const location = useLocation()
  return {
    menu: () => rootViewModel.visibleMenu(user().groups),
    pageTitle: () => rootViewModel.pageTitle(location.pathname),
    isActive: (href: string) => rootViewModel.isActive(location.pathname, href),
    userLabel: () => user().displayName ?? user().userId,
    userRole: () => rootViewModel.roleLabel(user().groups),
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
      //
      // Best-effort: se a rede falhar, ainda assim tiramos o usuário da área logada.
      void fetch('/api/auth/logout', { method: 'POST', headers: { 'x-requested-with': 'fetch' } })
        .then((r) => (r.ok ? (r.json() as Promise<{ data?: { redirectTo?: string } }>) : null))
        .then((body) => {
          window.location.href = body?.data?.redirectTo ?? '/'
        })
        .catch(() => {
          window.location.href = '/'
        })
    },
  }
}
