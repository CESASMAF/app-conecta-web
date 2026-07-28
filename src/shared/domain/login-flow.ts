// Tipos view-ready do login flow do Ory Kratos — COMPARTILHADOS entre o server (kratos.ts / server fn)
// e o client (tela de login). PUROS (sem Solid, sem segredo). O server lê/normaliza o flow do Kratos;
// o client só renderiza nosso form apontando para `action` com o `csrfToken`.
export type KratosMessage = Readonly<{ id: number; text: string; type: string }>

// Métodos de login oferecidos pelo flow (derivados dos grupos de nodes do Kratos).
export type LoginMethods = Readonly<{ password: boolean; code: boolean; totp: boolean }>

export type LoginFlowView = Readonly<{
  id: string
  action: string // URL do Kratos onde NOSSO form posta
  method: string // normalmente 'POST'
  csrfToken: string // hidden `csrf_token` — obrigatório no POST
  messages: readonly KratosMessage[] // erros/infos (ex.: "credenciais inválidas")
  refresh: boolean // reautenticação de sessão existente
  aal2: boolean // flow pede 2º fator (MFA/TOTP)
  codePhase: boolean // flow já está pedindo o código enviado por e-mail (login via code)
  methods: LoginMethods
}>

// Resultado do loader do /login: form do flow, flow expirado, ou telas terminais (logout/negado).
export type LoginFlowResult =
  | Readonly<{ kind: 'flow'; view: LoginFlowView }>
  | Readonly<{ kind: 'expired' }>
  | Readonly<{ kind: 'logout' }>
  | Readonly<{ kind: 'denied' }>

// --- Recovery ("esqueci minha senha") — flow de 2 fases (informar e-mail → informar código) ---
export type RecoveryFlowView = Readonly<{
  id: string
  action: string // URL do Kratos onde NOSSO form posta
  csrfToken: string
  messages: readonly KratosMessage[]
  phase: 'email' | 'code' // fase 1 (pede e-mail) ou fase 2 (pede o código enviado)
}>

export type RecoveryFlowResult =
  | Readonly<{ kind: 'flow'; view: RecoveryFlowView }>
  | Readonly<{ kind: 'expired' }>
