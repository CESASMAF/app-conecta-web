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
  oidcIssuer: string // Hydra issuer público (= 'iss' dos tokens; discovery + authorize/token aqui)
  oidcJwksUrl: string // JWKS p/ validar o JWT (pode ser interno; iss continua público)
  oidcClientId: string
  oidcClientSecret: string
  oidcAudiences: readonly string[] // audiences pedidas no /authorize → viram o `aud` do access_token
  kratosPublicUrl: string // Kratos Public API por DENTRO da malha (server-to-server: ler flow, whoami)
  kratosBrowserUrl: string // MESMA API, endereço PÚBLICO — só p/ URLs que o browser vai seguir
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
  oidcClientId: required(process.env.OIDC_CLIENT_ID, 'OIDC_CLIENT_ID'),
  oidcClientSecret: required(readSecret('OIDC_CLIENT_SECRET'), 'OIDC_CLIENT_SECRET'),
  oidcAudiences: (process.env.OIDC_AUDIENCES ?? 'social-care people-context analysis-bi')
    .split(/[\s,]+/)
    .filter(Boolean),
  kratosPublicUrl: required(process.env.KRATOS_PUBLIC_URL, 'KRATOS_PUBLIC_URL'),
  // Sem KRATOS_BROWSER_URL o default é a interna — que é o que o browser NÃO alcança. Em produção
  // isso é erro de config, não fallback: falha no boot em vez de servir um host inalcançável.
  kratosBrowserUrl: isProd
    ? required(process.env.KRATOS_BROWSER_URL, 'KRATOS_BROWSER_URL')
    : (process.env.KRATOS_BROWSER_URL ?? process.env.KRATOS_PUBLIC_URL ?? ''),
  kratosAdminUrl: process.env.KRATOS_ADMIN_URL ?? '',
  sessionSecret: required(readSecret('SESSION_SECRET'), 'SESSION_SECRET'),
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  publicBaseUrl: process.env.PUBLIC_BASE_URL ?? 'http://localhost:3000',
  socialCareUrl: required(process.env.SOCIAL_CARE_URL, 'SOCIAL_CARE_URL'),
  peopleContextUrl: required(process.env.PEOPLE_CONTEXT_URL, 'PEOPLE_CONTEXT_URL'),
  analysisBiUrl: required(process.env.ANALYSIS_BI_URL, 'ANALYSIS_BI_URL'),
}

// Endpoints OIDC do Hydra — derivados da raiz do issuer (paths padrão OAuth2/OIDC).
export const oidcEndpoints = {
  issuer: env.oidcIssuer,
  jwks: env.oidcJwksUrl,
  authorize: `${env.oidcIssuer}/oauth2/auth`,
  token: `${env.oidcIssuer}/oauth2/token`,
  revoke: `${env.oidcIssuer}/oauth2/revoke`, // revogação back-channel do refresh (L1)
  endSession: `${env.oidcIssuer}/oauth2/sessions/logout`, // RP-initiated logout
  redirectUri: `${env.publicBaseUrl}/api/auth/callback`,
} as const

// Endpoints do Kratos (self-service flows via Public API; provisionamento via Admin API).
// DUAS bases para a MESMA API, e a distinção é quem faz a requisição:
//   • `*Browser` = URL que devolvemos num redirect — quem busca é o NAVEGADOR, então tem que ser o
//     endereço público (id.${DOMAIN} pelo gateway). Usar a interna aqui manda o usuário para um host
//     que só existe dentro do Docker: foi o que travou /login e /recover em produção.
//   • as demais = fetch do nosso servidor, por dentro da app-net (`internal: true`, sem egress) —
//     têm que ser a interna, porque o container não alcança o IP público.
// Mesmo par que `oidcIssuer` (público) e `oidcJwksUrl` (interno) logo acima.
export const kratosEndpoints = {
  public: env.kratosPublicUrl,
  browser: env.kratosBrowserUrl,
  admin: env.kratosAdminUrl,
  loginBrowser: `${env.kratosBrowserUrl}/self-service/login/browser`,
  loginFlow: `${env.kratosPublicUrl}/self-service/login/flows`,
  recoveryBrowser: `${env.kratosBrowserUrl}/self-service/recovery/browser`,
  recoveryFlow: `${env.kratosPublicUrl}/self-service/recovery/flows`,
  logoutBrowser: `${env.kratosBrowserUrl}/self-service/logout/browser`,
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
