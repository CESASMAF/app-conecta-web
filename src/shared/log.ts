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
  // Erro de fluxo do Kratos. O `reason` dele é o texto mais útil do diagnóstico e o mais
  // sensível (embute a URL rejeitada, com login_challenge) — fica aqui, nunca na tela.
  | 'flow.error'
  | 'recovery.submit'

export function logAuthEvent(event: AuthEvent, fields: Readonly<Record<string, string>>): void {
  console.log(JSON.stringify({ ts: new Date().toISOString(), kind: 'auth', event, ...fields }))
}
