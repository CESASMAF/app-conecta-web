// Public API do módulo `auth` — ÚNICO ponto de import externo (ADR-0001).
export { LoginPage } from '../client/login/login.page'
export { useLoginBinding } from '../client/login/login.binding'
// Server function (vira stub RPC no client) — leitura de sessão server-only, sem leak do servidor.
export { getCurrentUserFn } from '../server/current-user.fn'
export type { CurrentUser } from '../client/data/current-user.model'
