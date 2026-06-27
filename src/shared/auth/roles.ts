// Modelo de papéis do ecossistema. people-context/analysis-bi usam grupos no formato `<system>:<role>`
// (ex.: `analysis-bi:analyst`) + `superadmin` (bypass global); social-care usa papéis simples
// (`worker`/`owner`/`admin`). Este helper unifica a leitura dos `groups` da sessão para o BFF decidir
// o que oferecer/encaminhar. Server-only (decisão de acesso nunca vai ao client).
const SUPERADMIN = 'superadmin'

// Tem `role` no `system`? Aceita: superadmin; papel simples (`role`); composto (`system:role`); e admin
// do sistema (`admin`/`system:admin`). Espelha o RoleGuard system-scoped do analysis-bi/people-context.
export function hasRole(groups: readonly string[], system: string, role: string): boolean {
  if (groups.includes(SUPERADMIN)) return true
  if (groups.includes(role) || groups.includes(`${system}:${role}`)) return true
  if (groups.includes('admin') || groups.includes(`${system}:admin`)) return true
  return false
}

// Superadmin? Exigido por ações irreversíveis (erasure LGPD, reconcile-idp do people-context).
export function isSuperadmin(groups: readonly string[]): boolean {
  return groups.includes(SUPERADMIN)
}
