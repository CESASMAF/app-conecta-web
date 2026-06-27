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
  'form-action': ["'self'"],
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
