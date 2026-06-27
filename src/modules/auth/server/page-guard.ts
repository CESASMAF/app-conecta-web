// Guard de página protegida (server-only). Usado pelo middleware p/ um 302 HARD no SSR do documento
// (não vaza o shell, não depende de JS) e p/ popular locals.user (evita dupla leitura de sessão).
import { app } from '~/server/app'
import type { CurrentUser } from '../client/data/current-user.model'

const PUBLIC_PREFIXES = ['/api/', '/_'] as const

// Documento protegido = página de app: não /login, não /api/*, não rota interna (/_*), não asset (tem ".").
export function isProtectedPagePath(path: string): boolean {
  if (path === '/login') return false
  if (PUBLIC_PREFIXES.some((p) => path.startsWith(p))) return false
  if (path.includes('.')) return false // favicon.ico, *.js, *.css, *.webp…
  return true
}

// Lê a sessão chamando o BFF Elysia direto (app.handle, sem hop HTTP). null = não autenticado.
export async function loadCurrentUser(cookie: string): Promise<CurrentUser | null> {
  const res = await app.handle(new Request('http://internal/api/me', { headers: { cookie } }))
  if (!res.ok) return null
  return ((await res.json()) as { data: CurrentUser }).data
}
