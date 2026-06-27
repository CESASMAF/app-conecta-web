// OIDC Authorization Code + PKCE (research D3). PKCE/URL são puros; a borda de rede (token + JWKS)
// fica atrás do port OidcClient — fakeável nos testes (sem MSW, ADR-0011).
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { env, oidcEndpoints } from '~/server/env'

export type Pkce = Readonly<{ verifier: string; challenge: string; state: string; nonce: string }>
export type TokenSet = Readonly<{ accessToken: string; refreshToken: string; idToken: string; expiresIn: number }>
export type IdTokenClaims = Readonly<{ sub: string; name: string | null; groups: readonly string[] }>

function b64url(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function randB64url(n: number): string {
  const a = new Uint8Array(n)
  crypto.getRandomValues(a)
  return b64url(a)
}

export async function generatePkce(): Promise<Pkce> {
  const verifier = randB64url(32)
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  return { verifier, challenge: b64url(new Uint8Array(digest)), state: randB64url(16), nonce: randB64url(16) }
}

export function buildAuthorizeUrl(p: Pick<Pkce, 'challenge' | 'state' | 'nonce'>): string {
  const u = new URL(oidcEndpoints.authorize)
  u.searchParams.set('response_type', 'code')
  u.searchParams.set('client_id', env.oidcClientId)
  u.searchParams.set('redirect_uri', oidcEndpoints.redirectUri)
  u.searchParams.set('scope', 'openid profile email')
  u.searchParams.set('code_challenge', p.challenge)
  u.searchParams.set('code_challenge_method', 'S256')
  u.searchParams.set('state', p.state)
  u.searchParams.set('nonce', p.nonce)
  return u.toString()
}

export interface OidcClient {
  exchangeCode(code: string, verifier: string): Promise<TokenSet>
  verifyIdToken(idToken: string, nonce: string): Promise<IdTokenClaims>
  refreshTokens(refreshToken: string): Promise<TokenSet>
  revokeToken(refreshToken: string): Promise<void> // revogação back-channel no IdP (L1)
}

type TokenResponse = Readonly<{
  access_token: string
  refresh_token?: string
  id_token: string
  expires_in?: number
}>

const asString = (v: unknown): string | null => (typeof v === 'string' ? v : null)

export function createAuthentikClient(): OidcClient {
  // JWKS lazy: não tocar a rede na construção (app sobe em dev/teste sem IdP real).
  let jwks: ReturnType<typeof createRemoteJWKSet> | null = null
  const getJwks = (): ReturnType<typeof createRemoteJWKSet> =>
    (jwks ??= createRemoteJWKSet(new URL(oidcEndpoints.jwks)))
  return {
    exchangeCode: async (code, verifier) => {
      const res = await fetch(oidcEndpoints.token, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: oidcEndpoints.redirectUri,
          client_id: env.oidcClientId,
          client_secret: env.oidcClientSecret,
          code_verifier: verifier,
        }),
      })
      if (!res.ok) throw new Error(`oidc-token-${res.status}`)
      const j = (await res.json()) as TokenResponse
      return {
        accessToken: j.access_token,
        refreshToken: j.refresh_token ?? '',
        idToken: j.id_token,
        expiresIn: j.expires_in ?? 3600,
      }
    },
    verifyIdToken: async (idToken, nonce) => {
      const { payload } = await jwtVerify(idToken, getJwks(), {
        issuer: oidcEndpoints.issuer,
        audience: env.oidcClientId,
      })
      if (payload['nonce'] !== nonce) throw new Error('oidc-nonce-mismatch')
      const groups = payload['groups']
      return {
        sub: String(payload.sub ?? ''),
        name: asString(payload['name']) ?? asString(payload['preferred_username']),
        groups: Array.isArray(groups) ? groups.filter((g): g is string => typeof g === 'string') : [],
      }
    },
    refreshTokens: async (refreshToken) => {
      const res = await fetch(oidcEndpoints.token, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: env.oidcClientId,
          client_secret: env.oidcClientSecret,
        }),
      })
      if (!res.ok) throw new Error(`oidc-refresh-${res.status}`)
      const j = (await res.json()) as TokenResponse
      return {
        accessToken: j.access_token,
        refreshToken: j.refresh_token ?? refreshToken,
        idToken: j.id_token ?? '',
        expiresIn: j.expires_in ?? 3600,
      }
    },
    revokeToken: async (refreshToken) => {
      await fetch(oidcEndpoints.revoke, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          token: refreshToken,
          token_type_hint: 'refresh_token',
          client_id: env.oidcClientId,
          client_secret: env.oidcClientSecret,
        }),
      })
      // best-effort: RFC 7009 retorna 200 mesmo p/ token já inválido; falha de rede não bloqueia logout.
    },
  }
}
