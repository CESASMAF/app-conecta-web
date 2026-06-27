// Configuração de ambiente + padrão _FILE (segredos montados em /run/secrets em prod).
// Fail-fast em produção: sem as envs OIDC, o boot NÃO sobe (research D9).
import { readFileSync } from 'node:fs'

const isProd = process.env.NODE_ENV === 'production'

function readSecret(name: string): string | undefined {
  const filePath = process.env[`${name}_FILE`]
  if (filePath) {
    try {
      return readFileSync(filePath, 'utf8').trim()
    } catch {
      return undefined
    }
  }
  return process.env[name]
}

function required(value: string | undefined, key: string): string {
  if (!value) {
    if (isProd) throw new Error(`[env] variável obrigatória ausente em produção: ${key}`)
    return '' // dev: permite subir sem IdP real (smoke)
  }
  return value
}

export type Env = Readonly<{
  isProd: boolean
  authentikUrl: string
  authentikAppSlug: string
  oidcClientId: string
  oidcClientSecret: string
  sessionSecret: string
  redisUrl: string
  publicBaseUrl: string
  socialCareUrl: string // URL do serviço social-care (server-only; nunca vai ao browser — Princ. I)
  peopleContextUrl: string // URL do people-context (server-only — Princ. I)
  analysisBiUrl: string // URL do analysis-bi (server-only — Princ. I)
}>

export const env: Env = {
  isProd,
  authentikUrl: required(process.env.AUTHENTIK_URL, 'AUTHENTIK_URL'),
  authentikAppSlug: required(process.env.AUTHENTIK_APP_SLUG, 'AUTHENTIK_APP_SLUG'),
  oidcClientId: required(process.env.OIDC_CLIENT_ID, 'OIDC_CLIENT_ID'),
  oidcClientSecret: required(readSecret('OIDC_CLIENT_SECRET'), 'OIDC_CLIENT_SECRET'),
  sessionSecret: required(readSecret('SESSION_SECRET'), 'SESSION_SECRET'),
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  publicBaseUrl: process.env.PUBLIC_BASE_URL ?? 'http://localhost:3000',
  socialCareUrl: required(process.env.SOCIAL_CARE_URL, 'SOCIAL_CARE_URL'),
  peopleContextUrl: required(process.env.PEOPLE_CONTEXT_URL, 'PEOPLE_CONTEXT_URL'),
  analysisBiUrl: required(process.env.ANALYSIS_BI_URL, 'ANALYSIS_BI_URL'),
}

// Endpoints OIDC derivados (issuer/JWKS) — Authentik (people-context usa o mesmo padrão).
export const oidcEndpoints = {
  issuer: `${env.authentikUrl}/application/o/${env.authentikAppSlug}/`,
  jwks: `${env.authentikUrl}/application/o/${env.authentikAppSlug}/jwks/`,
  authorize: `${env.authentikUrl}/application/o/authorize/`,
  token: `${env.authentikUrl}/application/o/token/`,
  revoke: `${env.authentikUrl}/application/o/revoke/`, // revogação back-channel do refresh (L1)
  redirectUri: `${env.publicBaseUrl}/api/auth/callback`,
} as const

// Origem permitida para checagem de CSRF por Origin nas mutações (L3).
export const allowedOrigin: string = (() => {
  try {
    return new URL(env.publicBaseUrl).origin
  } catch {
    return 'http://localhost:3000'
  }
})()
