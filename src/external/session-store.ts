// SessionStore (ADR-0005, data-model `Session`). Tokens vivem aqui (server-side); ao browser vai
// só o `sessionId` opaco. Port + impl Bun.redis (prod) + in-memory (dev/testes — sem MSW, ADR-0011).
// Usa o global `Bun.redis` (não `import from "bun"`) — o import do módulo `bun` não resolve no
// bundle SSR do Rollup; o global é deixado intacto e existe no runtime Bun.
import { env } from '~/server/env'

export type SessionId = string & { readonly __brand: 'SessionId' }

export type Session = Readonly<{
  sessionId: SessionId
  idpSub: string
  accessToken: string
  refreshToken: string
  groups: readonly string[]
  createdAt: string
  lastSeenAt: string
  accessExpiresAt: string
  absoluteExpiresAt: string
  persistent: boolean
}>

export type SessionPatch = Partial<Pick<Session, 'lastSeenAt' | 'accessToken' | 'refreshToken' | 'accessExpiresAt'>>

export interface SessionStore {
  create(session: Session, ttlSeconds: number): Promise<void>
  get(id: SessionId): Promise<Session | null>
  touch(id: SessionId, patch: SessionPatch, ttlSeconds: number): Promise<void>
  revoke(id: SessionId): Promise<void>
}

const key = (id: SessionId): string => `session:${id}`

export function createRedisSessionStore(): SessionStore {
  const get = async (id: SessionId): Promise<Session | null> => {
    const raw = await Bun.redis.get(key(id))
    return raw ? (JSON.parse(raw) as Session) : null
  }
  return {
    create: async (session, ttl) => {
      await Bun.redis.set(key(session.sessionId), JSON.stringify(session))
      await Bun.redis.expire(key(session.sessionId), ttl)
    },
    get,
    touch: async (id, patch, ttl) => {
      const cur = await get(id)
      if (!cur) return
      await Bun.redis.set(key(id), JSON.stringify({ ...cur, ...patch }))
      await Bun.redis.expire(key(id), ttl)
    },
    revoke: async (id) => {
      await Bun.redis.del(key(id))
    },
  }
}

export function createInMemorySessionStore(): SessionStore {
  const store = new Map<string, Session>()
  return {
    create: async (session) => {
      store.set(key(session.sessionId), session)
    },
    get: async (id) => store.get(key(id)) ?? null,
    touch: async (id, patch) => {
      const cur = store.get(key(id))
      if (cur) store.set(key(id), { ...cur, ...patch })
    },
    revoke: async (id) => {
      store.delete(key(id))
    },
  }
}

// Composition: prod usa Bun.redis; dev usa in-memory (smoke sem Redis real).
export const sessionStore: SessionStore = env.isProd ? createRedisSessionStore() : createInMemorySessionStore()
