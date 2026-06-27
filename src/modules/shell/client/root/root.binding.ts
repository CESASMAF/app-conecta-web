// Binding Solid do shell (ADR-0012) — liga a VM pura ao router + ações. Inclui logout (T046).
import { useLocation, useNavigate } from '@solidjs/router'
import { rootViewModel } from './root.view-model'
import type { CurrentUser } from '~/modules/auth/public-api'

export function useRootBinding(user: () => CurrentUser) {
  const location = useLocation()
  const navigate = useNavigate()
  return {
    menu: () => rootViewModel.visibleMenu(user().groups),
    pageTitle: () => rootViewModel.pageTitle(location.pathname),
    isActive: (href: string) => rootViewModel.isActive(location.pathname, href),
    userLabel: () => user().displayName ?? user().userId,
    logout: () => {
      // CSRF: X-Requested-With (ADR-0005). Best-effort: navega ao login mesmo se a rede falhar.
      void fetch('/api/auth/logout', { method: 'POST', headers: { 'x-requested-with': 'fetch' } }).finally(() =>
        navigate('/login'),
      )
    },
  }
}
