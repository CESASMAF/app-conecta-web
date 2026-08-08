// Governance: o endereço de um endpoint do IdP é escolhido por QUEM FAZ A REQUISIÇÃO.
//
// A `app-net` é `internal: true` — sem egress. O container NÃO alcança o endereço público do
// Hydra/Kratos. Então:
//   • browser  → público  (authorize, endSession, *Browser): é o usuário que navega até lá;
//   • servidor → interno  (jwks, token, revoke, *Flow, whoami, admin).
//
// Trocar os dois lados é o bug recorrente desta cadeia, nos dois sentidos: endereço interno
// vazando para o browser derrubou /login e /recover; endereço público usado pelo servidor
// quebrou a troca code→token e cuspiu AUTH-IDP na tela depois de autenticar. O gate é textual
// porque o que precisa ser travado é a ESCOLHA da fonte, e ela mora nesta declaração.
import { test, expect } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const env = readFileSync(join(import.meta.dir, '../../src/server/env.ts'), 'utf8')

// Recorta `export const <nome> = { … }` para não casar com comentários do arquivo.
function bloco(nome: string): string {
  const i = env.indexOf(`export const ${nome} = {`)
  expect(i).toBeGreaterThan(-1)
  return env.slice(i, env.indexOf('} as const', i))
}

// A linha `chave: <valor>` sem o comentário de fim de linha.
function valorDe(src: string, chave: string): string {
  const linha = src.split('\n').find((l) => l.trim().startsWith(`${chave}:`))
  expect(linha).toBeDefined()
  return linha!.split('//')[0]!
}

const CHAMA_O_SERVIDOR = ['jwks', 'token', 'revoke'] as const
const CHAMA_O_BROWSER = ['authorize', 'endSession'] as const

test('endpoints OIDC chamados pelo SERVIDOR não derivam do issuer público', () => {
  const src = bloco('oidcEndpoints')
  for (const chave of CHAMA_O_SERVIDOR) {
    expect(valorDe(src, chave)).not.toContain('env.oidcIssuer')
  }
})

test('endpoints OIDC que o BROWSER segue continuam públicos', () => {
  const src = bloco('oidcEndpoints')
  for (const chave of CHAMA_O_BROWSER) {
    expect(valorDe(src, chave)).toContain('env.oidcIssuer')
  }
})

// O `iss` é identidade, não destino de rede: precisa continuar sendo o público, ou a
// verificação do id_token passa a comparar com um host interno e reprova todo token válido.
test('o issuer permanece o público', () => {
  expect(valorDe(bloco('oidcEndpoints'), 'issuer')).toContain('env.oidcIssuer')
})

// Do lado do Kratos a regra ficou mais simples: o app NÃO leva mais o browser ao Kratos. Quem
// renderiza login/recuperação é a UI do Ory (`kratos-ui`, em `KRATOS_UI_URL`), então toda URL do
// Kratos declarada aqui é chamada pelo SERVIDOR e usa a Public API por dentro da malha.
//
// O gate é contra a REGRESSÃO de voltar a hospedar as telas: um `kratosBrowserUrl` reaparecendo
// nesta declaração significa que o app voltou a mandar o usuário ao Kratos por conta própria —
// o desenho que produziu a cadeia de quebras de 08/08 (CSP, CSRF, allowed_return_urls).
test('o app não leva o browser ao Kratos — quem faz isso é a UI do Ory', () => {
  const src = bloco('kratosEndpoints')
  expect(src).not.toContain('kratosBrowserUrl')
  for (const chave of ['loginFlow', 'recoveryFlow', 'whoami']) {
    expect(valorDe(src, chave)).toContain('kratosPublicUrl') // "public" = a API, não a face pública
  }
})

// O único endereço do IdP que chega ao browser é a UI do Ory — e ele não pode ser o da malha.
test('a UI do Ory é entregue ao browser por uma env própria', () => {
  expect(env).toContain('kratosUiUrl: required(process.env.KRATOS_UI_URL')
})
