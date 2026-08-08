// Configuração de ambiente + padrão _FILE (segredos montados em /run/secrets em prod).
// Fail-fast em produção: sem as envs OIDC/Kratos, o boot NÃO sobe (research D9).
// IdP = Ory (migração Authentik → Ory): Hydra emite o JWT (OIDC), Kratos guarda a identidade (login).
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
  oidcIssuer: string // Hydra issuer público (= 'iss' dos tokens; é para onde o BROWSER vai)
  oidcJwksUrl: string // JWKS p/ validar o JWT (pode ser interno; iss continua público)
  oidcTokenUrl: string // token endpoint — quem chama é o SERVIDOR, então tem que ser alcançável dele
  oidcClientId: string
  oidcClientSecret: string
  oidcAudiences: readonly string[] // audiences pedidas no /authorize → viram o `aud` do access_token
  kratosPublicUrl: string // Kratos Public API (self-service flows: login/recovery/…) — browser-facing
  kratosAdminUrl: string // Kratos Admin API (server-only; nunca vai ao browser — Princ. I)
  sessionSecret: string
  redisUrl: string
  publicBaseUrl: string
  socialCareUrl: string // URL do serviço social-care (server-only; nunca vai ao browser — Princ. I)
  peopleContextUrl: string // URL do people-context (server-only — Princ. I)
  analysisBiUrl: string // URL do analysis-bi (server-only — Princ. I)
}>

// OIDC_ISSUER = raiz pública do Hydra (ex.: https://auth.cesasmaf.app.br). Aceita HYDRA_ISSUER como alias.
const oidcIssuerRaw = process.env.OIDC_ISSUER ?? process.env.HYDRA_ISSUER

export const env: Env = {
  isProd,
  oidcIssuer: required(oidcIssuerRaw, 'OIDC_ISSUER'),
  oidcJwksUrl: process.env.OIDC_JWKS_URL ?? `${oidcIssuerRaw ?? ''}/.well-known/jwks.json`,
  // Mesmo par do JWKS, pela mesma razão: a `app-net` é `internal: true` (sem egress), então o
  // container NÃO alcança o endereço público do Hydra. Sem OIDC_TOKEN_URL a troca code→token
  // ia para https://auth.<domínio> e morria em "Unable to connect" — o login autenticava, voltava
  // com o `code` e quebrava no último passo, cuspindo AUTH-IDP na tela. Verificado em produção.
  oidcTokenUrl: process.env.OIDC_TOKEN_URL ?? `${oidcIssuerRaw ?? ''}/oauth2/token`,
  oidcClientId: required(process.env.OIDC_CLIENT_ID, 'OIDC_CLIENT_ID'),
  oidcClientSecret: required(readSecret('OIDC_CLIENT_SECRET'), 'OIDC_CLIENT_SECRET'),
  oidcAudiences: (process.env.OIDC_AUDIENCES ?? 'social-care people-context analysis-bi')
    .split(/[\s,]+/)
    .filter(Boolean),
  kratosPublicUrl: required(process.env.KRATOS_PUBLIC_URL, 'KRATOS_PUBLIC_URL'),
  kratosAdminUrl: process.env.KRATOS_ADMIN_URL ?? '',
  sessionSecret: required(readSecret('SESSION_SECRET'), 'SESSION_SECRET'),
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  publicBaseUrl: process.env.PUBLIC_BASE_URL ?? 'http://localhost:3000',
  socialCareUrl: required(process.env.SOCIAL_CARE_URL, 'SOCIAL_CARE_URL'),
  peopleContextUrl: required(process.env.PEOPLE_CONTEXT_URL, 'PEOPLE_CONTEXT_URL'),
  analysisBiUrl: required(process.env.ANALYSIS_BI_URL, 'ANALYSIS_BI_URL'),
}

// Endpoints OIDC do Hydra. A divisão é a MESMA do Kratos logo abaixo, e pela mesma razão —
// quem faz a requisição decide o endereço:
//   • browser  → público (`authorize`, `endSession`): é o usuário que navega até lá;
//   • servidor → alcançável de dentro da malha (`jwks`, `token`, `revoke`): a app-net não
//     tem egress, então o endereço público simplesmente não responde.
// O `issuer` fica público sempre: ele é o `iss` que validamos, não um destino de rede.
export const oidcEndpoints = {
  issuer: env.oidcIssuer,
  jwks: env.oidcJwksUrl,
  authorize: `${env.oidcIssuer}/oauth2/auth`,
  token: env.oidcTokenUrl,
  // Deriva do token endpoint (mesma face do Hydra), não do issuer: também é back-channel (L1).
  revoke: env.oidcTokenUrl.replace(/\/oauth2\/token$/, '/oauth2/revoke'),
  endSession: `${env.oidcIssuer}/oauth2/sessions/logout`, // RP-initiated logout
  redirectUri: `${env.publicBaseUrl}/api/auth/callback`,
} as const

// Endpoints do Kratos (self-service flows via Public API; provisionamento via Admin API).
export const kratosEndpoints = {
  public: env.kratosPublicUrl,
  admin: env.kratosAdminUrl,
  // Browser flows (o app age como UI do Kratos): inicia o flow no browser e lê/submete via Public API.
  loginBrowser: `${env.kratosPublicUrl}/self-service/login/browser`,
  loginFlow: `${env.kratosPublicUrl}/self-service/login/flows`,
  recoveryBrowser: `${env.kratosPublicUrl}/self-service/recovery/browser`,
  recoveryFlow: `${env.kratosPublicUrl}/self-service/recovery/flows`,
  logoutBrowser: `${env.kratosPublicUrl}/self-service/logout/browser`,
  whoami: `${env.kratosPublicUrl}/sessions/whoami`,
} as const

// Origem permitida para checagem de CSRF por Origin nas mutações (L3).
export const allowedOrigin: string = (() => {
  try {
    return new URL(env.publicBaseUrl).origin
  } catch {
    return 'http://localhost:3000'
  }
})()
