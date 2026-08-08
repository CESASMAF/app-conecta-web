// As telas de auth são as únicas em que o Kratos fala direto com o usuário. Sem tradução, uma
// assistente social lê "The recovery code is invalid or has already been used. Please try again."
import { test, expect } from 'bun:test'
import { traduzirMensagem, traduzirMensagens, MENSAGENS_KRATOS } from '~/shared/domain/kratos-messages'
import { parseRecoveryFlow, parseLoginFlow } from '~/server/kratos'

const msg = (id: number, text: string) => ({ id, type: 'error', text })

test('o código de recuperação inválido vira português', () => {
  // 4060006 = ErrorValidationRecoveryCodeInvalidOrAlreadyUsed (text/id.go, Kratos v1.3.1)
  const t = traduzirMensagem(msg(4060006, 'The recovery code is invalid or has already been used.'))
  expect(t.text).toBe('Código de recuperação inválido ou já utilizado. Confira o código do e-mail mais recente.')
  expect(t.id).toBe(4060006) // o id é o contrato — não pode ser perdido na tradução
  expect(t.type).toBe('error')
})

test('credenciais inválidas no login também', () => {
  expect(traduzirMensagem(msg(4000006, 'The provided credentials are invalid…')).text).toBe(
    'E-mail ou senha incorretos.',
  )
})

// Preferimos inglês a mensagem engolida: falha silenciosa é o pior desfecho deste produto.
test('id desconhecido mantém o texto original', () => {
  const original = msg(9999999, 'Something the Kratos gained in a new version')
  expect(traduzirMensagem(original).text).toBe(original.text)
})

test('traduz a lista inteira preservando a ordem', () => {
  const ts = traduzirMensagens([msg(4060005, 'expired'), msg(4060006, 'invalid')])
  expect(ts.map((m) => m.id)).toEqual([4060005, 4060006])
  expect(ts[0]!.text).toContain('expirou')
})

// A tradução vive no servidor (ADR-0010: o BFF devolve dado pronto para a tela), então o
// texto em inglês não pode sequer chegar ao client.
test('o flow parseado já sai traduzido do servidor', () => {
  const view = parseRecoveryFlow({
    id: 'f1',
    ui: {
      action: 'https://id.test.local/self-service/recovery?flow=f1',
      nodes: [
        { attributes: { name: 'csrf_token', value: 'tok' } },
        { attributes: { name: 'code' }, messages: [msg(4060006, 'The recovery code is invalid…')] },
      ],
    },
  })
  expect(view!.messages[0]!.text).not.toContain('recovery code')
  expect(view!.messages[0]!.text).toContain('Código de recuperação')
})

test('o login também sai traduzido', () => {
  const view = parseLoginFlow({
    id: 'f2',
    ui: {
      action: 'https://id.test.local/self-service/login?flow=f2',
      method: 'POST',
      messages: [msg(4000006, 'The provided credentials are invalid…')],
      nodes: [{ attributes: { name: 'csrf_token', value: 'tok' } }],
    },
  })
  expect(view!.messages[0]!.text).toBe('E-mail ou senha incorretos.')
})

// Um mapa por id só serve se os ids forem os do Kratos: 4 famílias, todas de 7 dígitos.
test('todo id mapeado é um id de mensagem do Kratos', () => {
  for (const id of Object.keys(MENSAGENS_KRATOS).map(Number)) {
    expect(id).toBeGreaterThanOrEqual(1000000)
    expect(id).toBeLessThan(5000000)
  }
})
