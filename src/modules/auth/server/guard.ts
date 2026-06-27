// Guard de sessão reutilizável (US2). Rotas protegidas do BFF derivam a sessão por aqui:
// valida + renova (single-flight) ou retorna null (→ 401/redirect a login).
import type { AppDeps } from '~/server/deps'
import type { Session } from '~/external/session-store'
import { getSession, refreshIfNeeded, touchActivity } from '~/server/session'

export async function requireSession(deps: AppDeps, sessionId: string | undefined): Promise<Session | null> {
  const session = await getSession(deps.sessions, sessionId)
  if (!session) return null
  const refreshed = await refreshIfNeeded(deps, session)
  if (!refreshed) return null
  return touchActivity(deps.sessions, refreshed) // janela de inatividade deslizante
}
