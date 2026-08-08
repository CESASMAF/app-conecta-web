// Cliente Ory Kratos (self-service, server-only — Princ. I: nunca vai ao bundle do browser).
// O app age como UI do Kratos: lê o flow (repassando os cookies do browser) e renderiza NOSSO form,
// que posta direto no Kratos (ui.action). CSRF é o token do próprio flow + cookie do Kratos — por isso
// app e Kratos precisam compartilhar domínio registrável em prod (gateway/Caddy sob ${DOMAIN}).
import { kratosEndpoints } from '~/server/env'
import { logAuthEvent } from '~/shared/log'
import type {
  KratosMessage,
  LoginFlowView,
  RecoveryFlowView,
  FlowErrorKind,
  FlowErrorResult,
} from '~/shared/domain/login-flow'

// ---- shape mínimo do JSON do Kratos que consumimos (parcial, tolerante) ----
type KratosNode = Readonly<{
  group?: string
  attributes?: Readonly<{ name?: string; value?: unknown }>
  messages?: readonly KratosMessage[]
}>
type KratosUi = Readonly<{ action?: string; method?: string; nodes?: readonly KratosNode[]; messages?: readonly KratosMessage[] }>
type KratosLoginFlow = Readonly<{ id?: string; ui?: KratosUi; refresh?: boolean; requested_aal?: string }>

const asString = (v: unknown): string => (typeof v === 'string' ? v : '')

// O `ui.action` do Kratos aponta para ele mesmo (https://id.<domínio>/self-service/...), e a
// CSP da aplicação (`form-action 'self'`) faz o navegador ABORTAR um POST para outra origem —
// silenciosamente, sem erro na tela. Reescrevemos para a rota de repasse do BFF, mesma origem,
// que devolve status, Location e Set-Cookie do Kratos sem reinterpretar nada.
// O `csrf_token` do flow continua indo no corpo, como o Kratos exige.
function acaoNoBff(kind: 'login' | 'recovery', flowId: string): string {
  return `/api/auth/kratos/${kind}?flow=${encodeURIComponent(flowId)}`
}


export function parseLoginFlow(flow: KratosLoginFlow): LoginFlowView | null {
  const ui = flow.ui
  if (!flow.id || !ui?.action) return null
  const nodes = ui.nodes ?? []
  const csrf = nodes.find((n) => n.attributes?.name === 'csrf_token')
  const groups = new Set(nodes.map((n) => n.group).filter((g): g is string => !!g))
  const nodeMessages = nodes.flatMap((n) => n.messages ?? [])
  return {
    id: flow.id,
    action: acaoNoBff('login', flow.id),
    method: ui.method ?? 'POST',
    csrfToken: asString(csrf?.attributes?.value),
    messages: [...(ui.messages ?? []), ...nodeMessages],
    refresh: Boolean(flow.refresh),
    aal2: flow.requested_aal === 'aal2',
    codePhase: nodes.some((n) => n.attributes?.name === 'code'),
    methods: { password: groups.has('password'), code: groups.has('code'), totp: groups.has('totp') },
  }
}

// Lê o login flow por id, repassando os cookies do browser (necessário p/ o Kratos casar o flow).
export async function fetchLoginFlow(flowId: string, cookie: string): Promise<LoginFlowView | null> {
  try {
    const res = await fetch(`${kratosEndpoints.loginFlow}?id=${encodeURIComponent(flowId)}`, {
      headers: { accept: 'application/json', ...(cookie ? { cookie } : {}) },
    })
    if (!res.ok) return null
    return parseLoginFlow((await res.json()) as KratosLoginFlow)
  } catch {
    return null
  }
}

// URL p/ (re)criar o browser login flow. O Kratos seta o cookie e redireciona à ui_url (nossa /login?flow=).
export function createLoginBrowserUrl(opts?: Readonly<{ returnTo?: string; refresh?: boolean; aal?: 'aal2' }>): string {
  const u = new URL(kratosEndpoints.loginBrowser)
  if (opts?.returnTo) u.searchParams.set('return_to', opts.returnTo)
  if (opts?.refresh) u.searchParams.set('refresh', 'true')
  if (opts?.aal) u.searchParams.set('aal', opts.aal)
  return u.toString()
}

// URL p/ (re)criar o browser recovery flow ("esqueci minha senha").
export function createRecoveryBrowserUrl(opts?: Readonly<{ returnTo?: string }>): string {
  const u = new URL(kratosEndpoints.recoveryBrowser)
  if (opts?.returnTo) u.searchParams.set('return_to', opts.returnTo)
  return u.toString()
}

export function parseRecoveryFlow(flow: KratosLoginFlow): RecoveryFlowView | null {
  const ui = flow.ui
  if (!flow.id || !ui?.action) return null
  const nodes = ui.nodes ?? []
  const csrf = nodes.find((n) => n.attributes?.name === 'csrf_token')
  // fase 2 quando o Kratos já pede o código (node `code`); senão fase 1 (pede o e-mail).
  const hasCode = nodes.some((n) => n.attributes?.name === 'code')
  return {
    id: flow.id,
    action: acaoNoBff('recovery', flow.id),
    csrfToken: asString(csrf?.attributes?.value),
    messages: [...(ui.messages ?? []), ...nodes.flatMap((n) => n.messages ?? [])],
    phase: hasCode ? 'code' : 'email',
  }
}

export async function fetchRecoveryFlow(flowId: string, cookie: string): Promise<RecoveryFlowView | null> {
  try {
    const res = await fetch(`${kratosEndpoints.recoveryFlow}?id=${encodeURIComponent(flowId)}`, {
      headers: { accept: 'application/json', ...(cookie ? { cookie } : {}) },
    })
    if (!res.ok) return null
    return parseRecoveryFlow((await res.json()) as KratosLoginFlow)
  } catch {
    return null
  }
}

// ─── Erro de fluxo ───────────────────────────────────────────────────────────
// O Kratos manda o browser para `ui_url` do flow `error` com só um `?id=`; o conteúdo
// vive na Public API. Traduzimos o `error.id` dele para um `kind` nosso, e o `reason`
// fica de fora do retorno DE PROPÓSITO: ele embute a URL rejeitada, com login_challenge
// e return_to. Isso é sensível e não pode chegar ao browser (Princ. I) — vai ao log.
type KratosFlowError = Readonly<{
  id?: string
  error?: Readonly<{ id?: string; code?: number; status?: string; reason?: string; message?: string }>
}>

// Os `error.id` que o Kratos nomeia. Fora desta lista, 'unknown' — a tela ainda mostra
// algo útil (o id, para o suporte), em vez de engolir o erro.
const FLOW_ERROR_KINDS: Readonly<Record<string, FlowErrorKind>> = {
  self_service_flow_return_to_forbidden: 'returnToForbidden',
  self_service_flow_expired: 'flowExpired',
  security_csrf_violation: 'csrf',
  security_identity_mismatch: 'identityMismatch',
  session_already_available: 'alreadyLoggedIn',
}

export async function fetchFlowError(errorId: string): Promise<FlowErrorResult> {
  try {
    const res = await fetch(`${kratosEndpoints.flowError}?id=${encodeURIComponent(errorId)}`, {
      headers: { accept: 'application/json' },
    })
    // 404 = id desconhecido ou já descartado pelo Kratos (ele não guarda para sempre).
    if (!res.ok) return { kind: 'notFound' }
    const body = (await res.json()) as KratosFlowError
    const inner = body.error
    if (!inner) return { kind: 'notFound' }

    // O `reason` é o texto mais útil para NÓS e o mais perigoso para a tela — só log.
    logAuthEvent('flow.error', {
      errorId,
      kratosId: inner.id ?? '(sem id)',
      status: String(inner.code ?? 0),
      reason: inner.reason ?? inner.message ?? '',
    })

    return {
      kind: 'error',
      view: {
        id: body.id ?? errorId,
        kind: FLOW_ERROR_KINDS[inner.id ?? ''] ?? 'unknown',
        status: inner.code ?? 0,
      },
    }
  } catch {
    return { kind: 'notFound' }
  }
}
