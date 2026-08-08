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

// --- Erro de fluxo — o Kratos redireciona para ui_url do `error` com ?id=<uuid> ---
//
// O detalhe fica na API dele (`GET /self-service/errors?id=`), NÃO na URL. Sem uma tela
// que o busque, a explicação que o Kratos produziu é jogada fora e o usuário volta ao
// login sem saber de nada — foi o que escondeu o loop de redirect de 2026-08-08.
//
// `reason` NÃO entra aqui: o texto do Kratos embute a URL rejeitada, que carrega
// login_challenge/return_to. Isso é material sensível e não vai para a tela; fica no log
// do servidor. Para a pessoa, o `kind` vira mensagem em português; para o suporte, o `id`.
export type FlowErrorView = Readonly<{
  id: string // id do erro no Kratos — o que o suporte usa para correlacionar
  kind: FlowErrorKind // causa normalizada (o `error.id` do Kratos, mapeado)
  status: number // código HTTP do erro (400, 403, 410…)
}>

// As causas que o Kratos nomeia e que sabemos explicar. Qualquer outra vira 'unknown'.
export type FlowErrorKind =
  | 'returnToForbidden' // return_to fora de allowed_return_urls — derruba o login em loop
  | 'flowExpired' // o fluxo passou do lifespan
  | 'csrf' // token de CSRF ausente/divergente
  | 'identityMismatch' // o fluxo pertence a outra identidade
  | 'alreadyLoggedIn' // já há sessão ativa
  | 'unknown'

export type FlowErrorResult =
  | Readonly<{ kind: 'error'; view: FlowErrorView }>
  | Readonly<{ kind: 'notFound' }> // id inexistente ou já expirado no Kratos (ele guarda por tempo limitado)
  | Readonly<{ kind: 'missing' }> // chegou em /error sem ?id — acesso direto à URL
