// SessionStore (ADR-0005, data-model `Session`). Tokens vivem aqui (server-side); ao browser vai
// só o `sessionId` opaco. Port + impl Bun.redis (prod) + in-memory (dev/testes — sem MSW, ADR-0011).
// Usa o global `Bun.redis` (não `import from "bun"`) — o import do módulo `bun` não resolve no
// bundle SSR do Rollup; o global é deixado intacto e existe no runtime Bun.
import { env } from '~/server/env'

export type SessionId = string & { readonly __brand: 'SessionId' }

export type Session = Readonly<{
  sessionId: SessionId
  idpSub: string
  // Nome do claim `name` do id_token. Sem guardar aqui, `toAuthenticatedUser` devolvia sempre null e
  // a shell caia no fallback `userId` — o usuario logado aparecia como UUID no rodape do menu.
  displayName: string | null
  accessToken: string
  refreshToken: string
  // `id_token_hint` do RP-initiated logout. Sem ele o Hydra RECUSA um logout que traga
  // `post_logout_redirect_uri` ("Logout failed because query parameter
  // post_logout_redirect_uri is set but id_token_hint is missing" — verificado em produção),
  // e sem encerrar a sessão do Hydra o `/authorize` seguinte faz `skip` e reloga o usuário.
  // Opcional no tipo porque sessões criadas antes desta versão não têm o campo no Redis.
  idToken?: string
  groups: readonly string[]
  createdAt: string
  lastSeenAt: string
  accessExpiresAt: string
  absoluteExpiresAt: string
  persistent: boolean
}>

export type SessionPatch = Partial<
  Pick<Session, 'lastSeenAt' | 'accessToken' | 'refreshToken' | 'accessExpiresAt' | 'idToken'>
>

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

// O Map vive no globalThis, nao no escopo do modulo: em dev o Vinxi carrega este modulo em mais de
// um contexto (SSR do documento vs server functions) e cada copia teria seu proprio Map — a sessao
// criada no login sumiria nas mutacoes, devolvendo 401 e deslogando o usuario a cada escrita.
// Mesmo processo ⇒ mesmo globalThis ⇒ um unico store.
const globalStore = globalThis as typeof globalThis & { __cesasmafSessionStore?: Map<string, Session> }

export function createInMemorySessionStore(): SessionStore {
  const store = (globalStore.__cesasmafSessionStore ??= new Map<string, Session>())
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
// Em dev NAO da p/ usar Bun.redis: o SSR do Vinxi roda em Node, onde `Bun` nao existe.
export const sessionStore: SessionStore = env.isProd ? createRedisSessionStore() : createInMemorySessionStore()
