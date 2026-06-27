// Sanea destino de retorno pos-login (FR-004). PURO. Bloqueia open-redirect E header/response
// splitting (CRLF) - OWASP A01 (Broken Access Control) + A05 (Injection).

// True se houver qualquer caractere de controle (code < 0x20) ou DEL (0x7f).
// Bloqueia CR (0x0d), LF (0x0a), TAB (0x09), NUL (0x00)... -> previne injecao no header Location.
function hasControlChars(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i)
    if (code < 0x20 || code === 0x7f) return true
  }
  return false
}

export function sanitizeRedirectPath(input: string | null | undefined, fallback = '/'): string {
  if (!input) return fallback
  if (!input.startsWith('/')) return fallback // so caminho de mesma origem
  if (input.startsWith('//')) return fallback // protocol-relative -> externo
  // backslash (cru ou %-encoded) - navegadores tratam '\' como '/', virando '//evil'
  if (input.startsWith('/\\') || /^\/%5c/i.test(input)) return fallback
  if (hasControlChars(input)) return fallback // CRLF/TAB/NUL -> response splitting
  return input
}
