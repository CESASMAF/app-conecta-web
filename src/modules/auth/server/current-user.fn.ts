'use server'
// Server function (ADR-0009/SolidStart): roda SÓ no servidor — o client recebe um stub RPC, então
// `~/server/app` (jose/sessão/segredos) NUNCA entra no bundle do browser (Princ. I, sem leak).
// SSR de documento: usa locals.user já validado pelo middleware (sem reler). Navegação SPA (RPC):
// relê a sessão via loadCurrentUser.
import { getRequestEvent } from 'solid-js/web'
import { loadCurrentUser } from './page-guard'
import type { CurrentUser } from '../client/data/current-user.model'

export async function getCurrentUserFn(): Promise<CurrentUser | null> {
  const event = getRequestEvent()
  if (event?.locals.user) return event.locals.user
  return loadCurrentUser(event?.request.headers.get('cookie') ?? '')
}
