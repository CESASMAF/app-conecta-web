// A CSP da aplicação traz `form-action 'self'`. Um formulário que aponte para outra origem
// é ABORTADO pelo navegador — sem erro na tela, sem requisição, sem nada.
//
// Foi o que impediu login e recuperação de senha em produção desde sempre: o `ui.action` do
// Kratos aponta para https://id.<domínio>, e o POST nunca saía. Em dev não aparecia porque
// lá quem serve o login é o container `kratos-ui`, que não passa pela CSP do app.
import { test, expect } from 'bun:test'
import { parseLoginFlow, parseRecoveryFlow } from '~/server/kratos'
import { CSP_BASELINE, buildSecurityHeaders, formActionOriginsFrom } from '~/shared/http/security-headers'
import { authFormActionOrigins } from '~/server/env'

const KRATOS = 'https://id.test.local/self-service'

const flowLogin = {
  id: 'flow-1',
  ui: {
    action: `${KRATOS}/login?flow=flow-1`,
    method: 'POST',
    nodes: [{ attributes: { name: 'csrf_token', value: 'tok' } }, { group: 'password' }],
  },
}
const flowRecovery = {
  id: 'flow-2',
  ui: {
    action: `${KRATOS}/recovery?flow=flow-2`,
    nodes: [{ attributes: { name: 'csrf_token', value: 'tok' } }],
  },
}

test('o form de login posta na MESMA ORIGEM, não no Kratos', () => {
  const view = parseLoginFlow(flowLogin)
  expect(view).not.toBeNull()
  expect(view!.action.startsWith('/')).toBe(true) // relativo = mesma origem
  expect(view!.action).not.toContain('id.test.local')
  expect(view!.action).toContain('flow-1') // o flow tem que sobreviver à reescrita
})

test('o form de recuperação também', () => {
  const view = parseRecoveryFlow(flowRecovery)
  expect(view).not.toBeNull()
  expect(view!.action.startsWith('/')).toBe(true)
  expect(view!.action).not.toContain('id.test.local')
  expect(view!.action).toContain('flow-2')
})

test('o csrf_token do flow continua indo para a tela', () => {
  // Sem ele o Kratos recusa a submissão com "CSRF token mismatch" — o repasse não
  // dispensa o token, só muda por onde a requisição passa.
  expect(parseLoginFlow(flowLogin)!.csrfToken).toBe('tok')
  expect(parseRecoveryFlow(flowRecovery)!.csrfToken).toBe('tok')
})

// Guarda a premissa: se um dia `form-action` deixar de ser `'self'`, esta reescrita passa a
// ser opcional — e quem mexer merece ler isto antes de desfazer.
test("a CSP ainda restringe form-action a 'self' por baseline", () => {
  expect(CSP_BASELINE['form-action']).toEqual(["'self'"])
})

// A OUTRA metade do mesmo problema, e a que ficou de fora na primeira correção: `form-action`
// é reavaliada a CADA REDIRECT do submit. Postar na mesma origem não basta — o 303 do Kratos
// manda o browser ao consent-bridge (outra origem) em TODO login, e o Chrome aborta em
// silêncio: o botão fica preso em "Entrando…" e o login nunca completa.
test('form-action lista as origens do IdP para onde o submit é redirecionado', () => {
  const csp = buildSecurityHeaders({
    isHttps: true,
    formActionOrigins: ['https://id.test.local', 'https://consent.test.local'],
  })['Content-Security-Policy']!
  expect(csp).toContain("form-action 'self' https://id.test.local https://consent.test.local")
})

test('sem origens declaradas, form-action continua só com self', () => {
  const csp = buildSecurityHeaders({ isHttps: true })['Content-Security-Policy']!
  const diretiva = csp.split('; ').find((d) => d.startsWith('form-action'))!
  expect(diretiva).toBe("form-action 'self'")
})

// Com a configuração REAL de produção, a origem do consent-bridge precisa aparecer — é para
// ela que o 303 pós-login manda o browser. Foi o salto que ficou de fora e travou o login.
test('a configuração de produção cobre consent, Kratos e Hydra', () => {
  const origens = formActionOriginsFrom({
    kratosBrowserUrl: 'https://id.cesasmaf.app.br',
    oidcIssuer: 'https://auth.cesasmaf.app.br',
    publicBaseUrl: 'https://cesasmaf.app.br',
  })
  expect(origens).toContain('https://consent.cesasmaf.app.br')
  expect(origens).toContain('https://id.cesasmaf.app.br')
  expect(origens).toContain('https://auth.cesasmaf.app.br')
})

test('CONSENT_BASE_URL sobrescreve a convenção de subdomínio', () => {
  const origens = formActionOriginsFrom({
    publicBaseUrl: 'https://cesasmaf.app.br',
    consentBaseUrl: 'https://bridge.outro.app/login',
  })
  expect(origens).toContain('https://bridge.outro.app')
  expect(origens).not.toContain('https://consent.cesasmaf.app.br')
})

// Em dev o bridge sobe numa porta do localhost: derivar `consent.localhost` seria inventar
// um host que não existe e enfiá-lo na política.
test('em dev não inventa subdomínio de consent', () => {
  expect(formActionOriginsFrom({ publicBaseUrl: 'http://localhost:3000' })).toEqual([])
})

// As origens são um allowlist fechado: entram as do IdP, não um curinga de domínio.
test('form-action não aceita curinga', () => {
  const csp = buildSecurityHeaders({ isHttps: true, formActionOrigins: authFormActionOrigins })[
    'Content-Security-Policy'
  ]!
  const diretiva = csp.split('; ').find((d) => d.startsWith('form-action'))!
  expect(diretiva).not.toContain('*')
})
