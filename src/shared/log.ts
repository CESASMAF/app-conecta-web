// Log estruturado (JSON) de eventos de auth (L2 / A09) — correlação por requestId.
// NUNCA loga PII de paciente nem tokens (Princ. Segurança/LGPD). O audit trail "rico" (clínico)
// é centralizado no `social-care` via Outbox/NATS (ADR-008) — aqui é só telemetria de acesso.
export type AuthEvent =
  | 'login.start'
  | 'login.success'
  | 'login.failed'
  | 'logout'
  | 'unauthorized'
  | 'csrf.blocked'

export function logAuthEvent(event: AuthEvent, fields: Readonly<Record<string, string>>): void {
  console.log(JSON.stringify({ ts: new Date().toISOString(), kind: 'auth', event, ...fields }))
}
