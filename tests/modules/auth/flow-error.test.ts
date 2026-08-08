// Tela de erro de fluxo: a que traduz o que o Kratos recusou.
//
// O caso que motivou a tela é real: em 2026-08-08 um `return_to` fora da allowlist pôs o
// login em loop, o Kratos disse exatamente o que era, e ninguém leu — /error não existia.
import { test, expect } from 'bun:test'
import { errorViewModel } from '~/modules/auth/client/error/error.view-model'
import type { FlowErrorKind } from '~/shared/domain/login-flow'

const TODOS: readonly FlowErrorKind[] = [
  'returnToForbidden',
  'flowExpired',
  'csrf',
  'identityMismatch',
  'alreadyLoggedIn',
  'unknown',
]

test('toda causa tem texto e uma saída — nenhuma beco sem saída', () => {
  for (const kind of TODOS) {
    const c = errorViewModel.copy(kind)
    expect(c.title.length).toBeGreaterThan(0)
    expect(c.text.length).toBeGreaterThan(0)
    expect(c.actionHref.startsWith('/')).toBe(true) // sempre mesma origem
    expect(c.actionLabel.length).toBeGreaterThan(0)
  }
})

test('os estados sem erro do Kratos também oferecem saída', () => {
  for (const c of [errorViewModel.notFoundCopy(), errorViewModel.missingCopy()]) {
    expect(c.title.length).toBeGreaterThan(0)
    expect(c.actionHref.startsWith('/')).toBe(true)
    expect(c.systemic).toBe(false) // não são falha de sistema: não alarmar à toa
  }
})

// A distinção que decide o que a pessoa faz a seguir: insistir ou chamar o suporte.
test('só a falha de configuração é marcada como sistêmica', () => {
  expect(errorViewModel.copy('returnToForbidden').systemic).toBe(true)
  for (const kind of TODOS.filter((k) => k !== 'returnToForbidden')) {
    expect(errorViewModel.copy(kind).systemic).toBe(false)
  }
})

test('o texto de returnToForbidden avisa que repetir não adianta', () => {
  // Sem isso a pessoa fica num ciclo de tentar de novo contra um erro de allowlist,
  // que nenhuma quantidade de tentativas resolve.
  expect(errorViewModel.copy('returnToForbidden').text.toLowerCase()).toContain('não vai resolver')
})

// ⚠️ A regra de segurança desta tela. O `reason` do Kratos é o texto mais útil do
// diagnóstico E o mais perigoso: ele embute a URL recusada, com login_challenge e
// return_to. Ele vai para o log do servidor (evento `flow.error`), nunca para o browser.
test('nenhum texto da tela ecoa dado do fluxo', () => {
  const textos = [
    ...TODOS.map((k) => errorViewModel.copy(k)),
    errorViewModel.notFoundCopy(),
    errorViewModel.missingCopy(),
  ].flatMap((c) => [c.title, c.text])

  for (const t of textos) {
    expect(t).not.toContain('login_challenge')
    expect(t).not.toContain('return_to')
    expect(t).not.toMatch(/https?:\/\//) // nenhuma URL interpolada no texto
  }
})
