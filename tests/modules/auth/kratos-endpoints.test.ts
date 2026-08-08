// Regressão do infra#14 — o /login travou em produção por confundir QUEM faz a requisição.
//
// A Public API do Kratos tem dois endereços para o mesmo serviço: o nome de serviço da app-net
// (que só existe dentro do Docker) e a face pública no gateway. Quem busca decide qual vale:
// um redirect é seguido pelo NAVEGADOR, um fetch parte do NOSSO servidor. Trocar os dois manda
// o usuário para um host que não existe para ele — e o sintoma aparece longe da causa.
//
// Os valores vêm do ambiente (tests/setup/env.ts, ou o `.env` local, que tem precedência no Bun),
// então o teste afirma a RELAÇÃO entre eles, nunca hosts literais.
import { test, expect } from 'bun:test'
import { kratosEndpoints } from '~/server/env'
import { createLoginBrowserUrl, createRecoveryBrowserUrl } from '~/server/kratos'

const BROWSER_FACING = [
  kratosEndpoints.loginBrowser,
  kratosEndpoints.recoveryBrowser,
  kratosEndpoints.logoutBrowser,
]
const SERVER_SIDE = [kratosEndpoints.loginFlow, kratosEndpoints.recoveryFlow, kratosEndpoints.whoami]

test('o que o browser SEGUE deriva da base pública', () => {
  for (const url of BROWSER_FACING) expect(url.startsWith(kratosEndpoints.browser)).toBe(true)
})

test('o que o SERVIDOR busca deriva da base interna', () => {
  for (const url of SERVER_SIDE) expect(url.startsWith(kratosEndpoints.public)).toBe(true)
})

// O coração da regressão: as duas listas não podem sair da mesma base. Se um refactor voltar a
// derivar tudo de `kratosPublicUrl`, os dois testes acima continuam passando — este não.
test('as duas faces não colapsam numa só quando o ambiente as distingue', () => {
  if (kratosEndpoints.public === kratosEndpoints.browser) return // dev/local: uma instância só
  for (const url of BROWSER_FACING) expect(url.startsWith(kratosEndpoints.public)).toBe(false)
  for (const url of SERVER_SIDE) expect(url.startsWith(kratosEndpoints.browser)).toBe(false)
})

// Os construtores são o caminho real: é o retorno deles que vira `throw redirect(...)`.
test('as URLs de flow entregues ao browser são públicas e absolutas', () => {
  for (const url of [createLoginBrowserUrl({ returnTo: 'https://app.test.local/' }), createRecoveryBrowserUrl()]) {
    // `new URL` sem base lança se for relativa — a absolutez é afirmada aqui.
    expect(new URL(url).origin).toBe(new URL(kratosEndpoints.browser).origin)
  }
})
