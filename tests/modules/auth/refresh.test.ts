// Refresh single-flight (T047, US4): N concorrentes compartilham 1 refresh; falha → signOut.
import { test, expect } from 'bun:test'
import { requireSession } from '~/modules/auth/server/guard'
import { createInMemorySessionStore, type Session, type SessionId } from '~/external/session-store'
import type { OidcClient, TokenSet } from '~/server/oidc'
import { fakeDeps } from './_fakes'

const expiredSession = (): Session => {
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
    accessExpiresAt: iso(now - 1000), // access JÁ vencido
    absoluteExpiresAt: iso(now + 8 * 3600_000),
    persistent: false,
  }
}

const countingOidc = (refresh: () => Promise<TokenSet>) => {
  let calls = 0
  const oidc: OidcClient = {
    exchangeCode: async () => ({ accessToken: '', refreshToken: '', idToken: '', expiresIn: 3600 }),
    verifyIdToken: async () => ({ sub: '', name: null, groups: [] }),
    refreshTokens: async () => {
      calls++
      return refresh()
    },
    revokeToken: async () => {},
  }
  return { oidc, calls: () => calls }
}

test('5 requisições concorrentes da mesma sessão → 1 único refresh', async () => {
  const sessions = createInMemorySessionStore()
  const s = expiredSession()
  await sessions.create(s, 3600)
  const { oidc, calls } = countingOidc(async () => ({ accessToken: 'at2', refreshToken: 'rt2', idToken: '', expiresIn: 3600 }))

  const results = await Promise.all([0, 1, 2, 3, 4].map(() => requireSession(fakeDeps({ oidc, sessions }), s.sessionId)))

  expect(calls()).toBe(1)
  expect(results.every((r) => r?.accessToken === 'at2')).toBe(true)
})

test('refresh falha (reuse-detection) → signOut: null + sessão revogada', async () => {
  const sessions = createInMemorySessionStore()
  const s = expiredSession()
  await sessions.create(s, 3600)
  const { oidc } = countingOidc(async () => {
    throw new Error('refresh-rotated')
  })

  const got = await requireSession(fakeDeps({ oidc, sessions }), s.sessionId)
  expect(got).toBeNull()
  expect(await sessions.get(s.sessionId)).toBeNull()
})
