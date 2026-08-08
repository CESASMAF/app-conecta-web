// Builder PURO de security headers (ADR-0006). Testável em bun:test (T020), sem efeito colateral.
// A aplicação fica nos middlewares (SolidStart `src/middleware.ts` + Elysia `onAfterHandle`).

export type CspDirectives = Readonly<Record<string, readonly string[]>>

// Baseline sem nonce em script-src (o nonce per-request da hidratação do Solid é ligado em T050/Polish).
export const CSP_BASELINE: CspDirectives = {
  'default-src': ["'self'"],
  'script-src': ["'self'"],
  'style-src': ["'self'", "'unsafe-inline'"], // vanilla-extract injeta <style> por JS em dev (ADR-0007)
  'img-src': ["'self'", 'data:'],
  'font-src': ["'self'"],
  'connect-src': ["'self'"],
  'frame-src': ["'self'", 'blob:'], // preview de PDF same-origin (ADR-0006 §6)
  'frame-ancestors': ["'none'"], // anti-clickjacking
  'base-uri': ["'self'"],
  // Só `'self'` no baseline. As origens do IdP entram por `formActionOrigins` (build), porque
  // dependem do ambiente — ver a nota em buildSecurityHeaders.
  'form-action': ["'self'"],
}

// As origens para onde os formulários de AUTENTICAÇÃO navegam por redirect. Pura, para ser
// exercitável com qualquer ambiente — a derivação do consent é convenção da stack e precisa
// de teste, não de fé (o app não recebe essa URL por env).
export type FormActionInput = Readonly<{
  kratosBrowserUrl?: string
  oidcIssuer?: string
  publicBaseUrl?: string
  consentBaseUrl?: string | undefined // CONSENT_BASE_URL — sobrescreve a convenção quando não valer
}>

function origemDe(url: string | undefined): string | undefined {
  if (!url) return undefined
  try {
    return new URL(url).origin
  } catch {
    return undefined
  }
}

export function formActionOriginsFrom(input: FormActionInput): readonly string[] {
  // A stack publica o consent-bridge em `consent.<domínio>` (hydra.yml: URLS_LOGIN =
  // https://consent.${DOMAIN}/login). Em dev ele sobe numa porta do localhost, não em
  // subdomínio — lá não há o que derivar.
  const consentDerivado = (): string | undefined => {
    const base = origemDe(input.publicBaseUrl)
    if (!base) return undefined
    const u = new URL(base)
    if (u.hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(u.hostname)) return undefined
    return `${u.protocol}//consent.${u.hostname}`
  }
  const origens = [
    origemDe(input.kratosBrowserUrl),
    origemDe(input.oidcIssuer),
    origemDe(input.consentBaseUrl) ?? consentDerivado(),
  ]
  return [...new Set(origens.filter((o): o is string => Boolean(o)))]
}

export function serializeCsp(directives: CspDirectives): string {
  return Object.entries(directives)
    .map(([k, v]) => (v.length ? `${k} ${v.join(' ')}` : k))
    .join('; ')
}

export function isHttpsFromForwardedProto(xForwardedProto: string | null): boolean {
  return xForwardedProto?.split(',')[0]?.trim() === 'https'
}

export type BuildHeadersInput = Readonly<{
  nonce?: string // quando presente, vai p/ script-src (T050)
  isHttps: boolean
  styleUnsafeInline?: boolean // default true (dev: vanilla-extract injeta <style> via JS); false em prod (L5)
  formActionOrigins?: readonly string[] // origens do IdP p/ onde o submit navega por REDIRECT
}>

export function buildSecurityHeaders(input: BuildHeadersInput): Record<string, string> {
  const directives: Record<string, readonly string[]> = { ...CSP_BASELINE }
  if (input.nonce) {
    // strict CSP: nonce + strict-dynamic (scripts carregados pelo bootstrap nonce'd são confiáveis).
    directives['script-src'] = ["'self'", `'nonce-${input.nonce}'`, "'strict-dynamic'"]
  }
  if (input.styleUnsafeInline === false) {
    // prod: o vanilla-extract emite CSS estático (link), então style-src dispensa 'unsafe-inline' (L5).
    directives['style-src'] = ["'self'"]
  }
  // `form-action` NÃO governa só a URL do form: ela é reavaliada a CADA REDIRECT da navegação
  // que o submit inicia. Nosso form posta em `/api/auth/kratos/*` (mesma origem, ok), mas o
  // 303 do Kratos manda o browser para o consent-bridge em consent.<domínio> — o `return_to`
  // que acontece em TODO login (ver kratos.yml, allowed_return_urls). Sem essa origem listada,
  // o Chrome ABORTA a navegação em silêncio: o botão fica preso em "Entrando…" e o login nunca
  // completa. Reproduzido isoladamente em 2026-08-08 (violação `directive=form-action`).
  //
  // Listamos as origens do próprio IdP — não é afrouxar a política, é descrevê-la corretamente:
  // é para lá que os formulários de autenticação legitimamente navegam.
  if (input.formActionOrigins?.length) {
    directives['form-action'] = ["'self'", ...input.formActionOrigins]
  }

  const headers: Record<string, string> = {
    'Content-Security-Policy': serializeCsp(directives),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  }
  // HSTS só atrás do proxy (https). Em dev http puro é omitido (ADR-0006 §4).
  if (input.isHttps) {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
  }
  return headers
}
