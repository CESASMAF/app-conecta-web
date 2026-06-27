// Guard reutilizável (T039, US2): valida sessão; sem sessão → null (→ 401/redirect).
import { test, expect } from 'bun:test'
import { requireSession } from '~/modules/auth/server/guard'
import { createInMemorySessionStore, type Session, type SessionId } from '~/external/session-store'
import { fakeDeps } from './_fakes'

const baseSession = (over: Partial<Session> = {}): Session => {
  const now = Date.now()
  const iso = (ms: number) => new Date(ms).toISOString()
  return {
    sessionId: crypto.randomUUID() as SessionId,
    idpSub: 'user-1',
    accessToken: 'at',
    refreshToken: 'rt',
    groups: ['worker'],
    createdAt: iso(now),
    lastSeenAt: iso(now),
    accessExpiresAt: iso(now + 3600_000),
    absoluteExpiresAt: iso(now + 8 * 3600_000),
    persistent: false,
    ...over,
  }
}

test('sem sessionId → null', async () => {
  const deps = fakeDeps()
  expect(await requireSession(deps, undefined)).toBeNull()
  expect(await requireSession(deps, 'inexistente')).toBeNull()
})

test('sessão válida → retorna a sessão', async () => {
  const sessions = createInMemorySessionStore()
  const s = baseSession()
  await sessions.create(s, 3600)
  const got = await requireSession(fakeDeps({ sessions }),s.sessionId)
  expect(got?.idpSub).toBe('user-1')
})

test('sessão além do TTL absoluto → null (revogada)', async () => {
  const sessions = createInMemorySessionStore()
  const expired = baseSession({ absoluteExpiresAt: new Date(Date.now() - 1000).toISOString() })
  await sessions.create(expired, 3600)
  expect(await requireSession(fakeDeps({ sessions }),expired.sessionId)).toBeNull()
  expect(await sessions.get(expired.sessionId)).toBeNull() // revogada
})

test('atividade DESLIZA a janela de inatividade (lastSeenAt renova) — fix do review', async () => {
  const sessions = createInMemorySessionStore()
  const stale = baseSession({ lastSeenAt: new Date(Date.now() - 5 * 60_000).toISOString() }) // 5 min atrás
  await sessions.create(stale, 3600)
  await requireSession(fakeDeps({ sessions }),stale.sessionId)
  const after = await sessions.get(stale.sessionId)
  expect(Date.now() - Date.parse(after!.lastSeenAt)).toBeLessThan(60_000) // renovado p/ ~agora
})
