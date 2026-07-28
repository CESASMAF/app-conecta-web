// Cliente Ory Kratos (self-service, server-only — Princ. I: nunca vai ao bundle do browser).
// O app age como UI do Kratos: lê o flow (repassando os cookies do browser) e renderiza NOSSO form,
// que posta direto no Kratos (ui.action). CSRF é o token do próprio flow + cookie do Kratos — por isso
// app e Kratos precisam compartilhar domínio registrável em prod (gateway/Caddy sob ${DOMAIN}).
import { kratosEndpoints } from '~/server/env'
import type { KratosMessage, LoginFlowView, RecoveryFlowView } from '~/shared/domain/login-flow'

// ---- shape mínimo do JSON do Kratos que consumimos (parcial, tolerante) ----
type KratosNode = Readonly<{
  group?: string
  attributes?: Readonly<{ name?: string; value?: unknown }>
  messages?: readonly KratosMessage[]
}>
type KratosUi = Readonly<{ action?: string; method?: string; nodes?: readonly KratosNode[]; messages?: readonly KratosMessage[] }>
type KratosLoginFlow = Readonly<{ id?: string; ui?: KratosUi; refresh?: boolean; requested_aal?: string }>

const asString = (v: unknown): string => (typeof v === 'string' ? v : '')

export function parseLoginFlow(flow: KratosLoginFlow): LoginFlowView | null {
  const ui = flow.ui
  if (!flow.id || !ui?.action) return null
  const nodes = ui.nodes ?? []
  const csrf = nodes.find((n) => n.attributes?.name === 'csrf_token')
  const groups = new Set(nodes.map((n) => n.group).filter((g): g is string => !!g))
  const nodeMessages = nodes.flatMap((n) => n.messages ?? [])
  return {
    id: flow.id,
    action: ui.action,
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
    action: ui.action,
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
