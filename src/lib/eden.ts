// Eden Treaty — client type-safe do BFF (ADR-0004). `import type` do App evita bundlar o servidor
// no client (Princ. I). Base via HTTP same-origin; a otimização SSR-direto (treaty(app)) fica para depois.
import { treaty } from '@elysiajs/eden'
import type { App } from '~/server/app'

const base =
  typeof window === 'undefined'
    ? (process.env.PUBLIC_BASE_URL ?? 'http://localhost:3000')
    : window.location.origin

export const api = treaty<App>(base)
