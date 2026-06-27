// Tipagem do request-scope do SolidStart: nonce CSP per-request (ADR-0006) + usuário do guard.
import '@solidjs/start/server'
import type { CurrentUser } from '~/modules/auth/public-api'

declare module '@solidjs/start/server' {
  interface RequestEventLocals {
    nonce?: string
    // Populado pelo guard de página no middleware (SSR de documento) p/ evitar dupla leitura de sessão.
    user?: CurrentUser
  }
}
