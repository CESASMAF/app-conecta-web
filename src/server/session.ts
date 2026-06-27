// Ciclo de sessão (ADR-0005, data-model). Cria/lê a sessão server-side; o cookie carrega só o
// sessionId opaco. Refresh transparente single-flight (US4) + expiração absoluta/inatividade.
import type { AppDeps } from '~/server/deps'
import type { IdTokenClaims, TokenSet } from '~/server/oidc'
import type { Session, SessionId, SessionStore } from '~/external/session-store'
import { withTimeout } from '~/shared/with-timeout'

const REFRESH_TIMEOUT_MS = 10_000

export const SESSION_COOKIE = '__Host-session'
export const PKCE_COOKIE = 'pkce'

const ABSOLUTE_TTL_SECONDS = 8 * 3600 // limite absoluto (FR-011)
const INACTIVITY_TTL_SECONDS = 30 * 60 // janela de inatividade

export type AuthenticatedUser = Readonly<{
  userId: string
  displayName: string | null
  groups: readonly string[]
}>

export type PkceCookie = Readonly<{
  verifier: string
  state: string
  nonce: string
  redirectTo: string
}>

const iso = (ms: number): string => new Date(ms).toISOString()

export async function createSession(
  store: SessionStore,
  tokens: TokenSet,
  claims: IdTokenClaims,
  persistent: boolean,
): Promise<Session> {
  const now = Date.now()
  const session: Session = {
    sessionId: crypto.randomUUID() as SessionId,
    idpSub: claims.sub,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    groups: claims.groups,
    createdAt: iso(now),
    lastSeenAt: iso(now),
    accessExpiresAt: iso(now + tokens.expiresIn * 1000),
    absoluteExpiresAt: iso(now + ABSOLUTE_TTL_SECONDS * 1000),
    persistent,
  }
  await store.create(session, ABSOLUTE_TTL_SECONDS)
  return session
}

// Lê a sessão; expira por TTL absoluto OU inatividade (T049).
export async function getSession(store: SessionStore, sessionId: string | undefined): Promise<Session | null> {
  if (!sessionId) return null
  const session = await store.get(sessionId as SessionId)
  if (!session) return null
  const now = Date.now()
  const expired =
    now > Date.parse(session.absoluteExpiresAt) ||
    now > Date.parse(session.lastSeenAt) + INACTIVITY_TTL_SECONDS * 1000
  if (expired) {
    await store.revoke(session.sessionId)
    return null
  }
  return session
}

export function toAuthenticatedUser(session: Session): AuthenticatedUser {
  return { userId: session.idpSub, displayName: null, groups: session.groups }
}

// Janela de inatividade DESLIZANTE: cada atividade renova `lastSeenAt` (throttle de 60s p/ evitar
// um write por request). SEM isto, um usuário ATIVO seria deslogado ao fim da janela (bug de review).
const ACTIVITY_THROTTLE_MS = 60_000
export async function touchActivity(store: SessionStore, session: Session): Promise<Session> {
  if (Date.now() - Date.parse(session.lastSeenAt) <= ACTIVITY_THROTTLE_MS) return session
  const lastSeenAt = iso(Date.now())
  await store.touch(session.sessionId, { lastSeenAt }, ABSOLUTE_TTL_SECONDS)
  return { ...session, lastSeenAt }
}

// --- Refresh transparente SINGLE-FLIGHT (US4, ADR-0005) ---
// Requisições concorrentes da mesma sessão compartilham UMA chamada de refresh.
const inFlight = new Map<string, Promise<Session | null>>()

export async function refreshIfNeeded(deps: AppDeps, session: Session): Promise<Session | null> {
  if (Date.now() < Date.parse(session.accessExpiresAt)) return session // access ainda válido
  const existing = inFlight.get(session.sessionId)
  if (existing) return existing
  const p = doRefresh(deps, session).finally(() => inFlight.delete(session.sessionId))
  inFlight.set(session.sessionId, p)
  return p
}

async function doRefresh(deps: AppDeps, session: Session): Promise<Session | null> {
  try {
    // timeout (L6): refresh travado nao pode segurar o single-flight indefinidamente.
    const tokens = await withTimeout(deps.oidc.refreshTokens(session.refreshToken), REFRESH_TIMEOUT_MS)
    const now = Date.now()
    const patch = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessExpiresAt: iso(now + tokens.expiresIn * 1000),
      lastSeenAt: iso(now),
    }
    await deps.sessions.touch(session.sessionId, patch, ABSOLUTE_TTL_SECONDS)
    return { ...session, ...patch }
  } catch {
    // reuse-detection / refresh falhou → signOut (fail-safe)
    await deps.sessions.revoke(session.sessionId)
    return null
  }
}
