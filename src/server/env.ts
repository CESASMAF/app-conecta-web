// Configuração de ambiente + padrão _FILE (segredos montados em /run/secrets em prod).
// Fail-fast em produção: sem as envs OIDC/Kratos, o boot NÃO sobe (research D9).
// IdP = Ory (migração Authentik → Ory): Hydra emite o JWT (OIDC), Kratos guarda a identidade (login).
import { readFileSync } from 'node:fs'
import { formActionOriginsFrom } from '~/shared/http/security-headers'

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
  flowError: `${env.kratosPublicUrl}/self-service/errors`, // detalhe do erro que o Kratos só expõe por id
  // Submissão dos flows. O `ui.action` do Kratos aponta para a face PÚBLICA; o BFF chama a
  // INTERNA, porque quem faz esta requisição é o servidor, não o navegador.
  loginSubmit: `${env.kratosPublicUrl}/self-service/login`,
  recoverySubmit: `${env.kratosPublicUrl}/self-service/recovery`,
  logoutBrowser: `${env.kratosBrowserUrl}/self-service/logout/browser`,
  whoami: `${env.kratosPublicUrl}/sessions/whoami`,
} as const

// Origens para onde os formulários de AUTENTICAÇÃO navegam legitimamente — via os redirects
// que o Kratos devolve. Alimentam `form-action` da CSP, que é reavaliada a cada salto: sem
// elas o navegador aborta o submit em silêncio e o login não completa (ver security-headers).
export const authFormActionOrigins: readonly string[] = formActionOriginsFrom({
  kratosBrowserUrl: env.kratosBrowserUrl,
  oidcIssuer: env.oidcIssuer,
  publicBaseUrl: env.publicBaseUrl,
  consentBaseUrl: process.env.CONSENT_BASE_URL,
})

// Origem permitida para checagem de CSRF por Origin nas mutações (L3).
export const allowedOrigin: string = (() => {
  try {
    return new URL(env.publicBaseUrl).origin
  } catch {
    return 'http://localhost:3000'
  }
})()
