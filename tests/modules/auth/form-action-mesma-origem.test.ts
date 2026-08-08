// A CSP da aplicação traz `form-action 'self'`. Um formulário que aponte para outra origem
// é ABORTADO pelo navegador — sem erro na tela, sem requisição, sem nada.
//
// Foi o que impediu login e recuperação de senha em produção desde sempre: o `ui.action` do
// Kratos aponta para https://id.<domínio>, e o POST nunca saía. Em dev não aparecia porque
// lá quem serve o login é o container `kratos-ui`, que não passa pela CSP do app.
import { test, expect } from 'bun:test'
import { parseLoginFlow, parseRecoveryFlow } from '~/server/kratos'
import { CSP_BASELINE } from '~/shared/http/security-headers'

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
test("a CSP ainda restringe form-action a 'self'", () => {
  expect(CSP_BASELINE['form-action']).toEqual(["'self'"])
})
