// ViewModel das ações do Resumo (puro) — validações de motivo (alta/retirada), adicionar membro e identidade.
import { test, expect, describe } from 'bun:test'
import {
  validateReason,
  toReasonInput,
  emptyAddMember,
  validateAddMember,
  toAddMemberInput,
  validateSocialIdentity,
  toSocialIdentityInput,
  hasAnyError,
  type AddMemberForm,
} from '~/modules/patients/client/detail/resumo-actions.view-model'

const TODAY = '2026-06-26'

describe('ações · motivo (alta/retirada)', () => {
  test('reason vazio → erro; reason=other sem notes → erro; válido → null', () => {
    expect(validateReason({ reason: '', notes: '' })).toBe('actions.reason.required')
    expect(validateReason({ reason: 'other', notes: '' })).toBe('actions.notes.required')
    expect(validateReason({ reason: 'other', notes: 'detalhe' })).toBeNull()
    expect(validateReason({ reason: 'improved', notes: '' })).toBeNull()
  })

  test('toReasonInput omite notes vazio e mantém quando presente', () => {
    expect(toReasonInput({ reason: 'improved', notes: '  ' })).toEqual({ reason: 'improved' })
    expect(toReasonInput({ reason: 'other', notes: ' x ' })).toEqual({ reason: 'other', notes: 'x' })
  })
})

describe('ações · adicionar membro', () => {
  const valid = (over: Partial<AddMemberForm> = {}): AddMemberForm => ({
    ...emptyAddMember(),
    fullName: 'Ana Souza',
    birthDate: '1980-03-02',
    prRelationshipId: 'rel-1',
    ...over,
  })

  test('vazio → obrigatórios (CPF opcional)', () => {
    const e = validateAddMember(emptyAddMember(), TODAY)
    expect(e.fullName).toBe('register.field.required')
    expect(e.birthDate).toBe('register.field.required')
    expect(e.prRelationshipId).toBe('register.field.required')
    expect(e.cpf).toBeUndefined()
  })

  test('válido → sem erros; nome sem sobrenome e nascimento futuro → erros', () => {
    expect(hasAnyError(validateAddMember(valid(), TODAY))).toBe(false)
    expect(validateAddMember(valid({ fullName: 'Ana' }), TODAY).fullName).toBe('register.field.fullName')
    expect(validateAddMember(valid({ birthDate: '2099-01-01' }), TODAY).birthDate).toBe('register.field.dateFuture')
    expect(validateAddMember(valid({ cpf: '11111111111' }), TODAY).cpf).toBe('register.field.cpf')
  })

  test('toAddMemberInput monta o caminho orquestrado (member) + flags; CPF só-dígitos/omitido', () => {
    const body = toAddMemberInput(valid({ cpf: '111.444.777-35', isResiding: true, isCaregiver: true }))
    expect(body.member).toEqual({ fullName: 'Ana Souza', birthDate: '1980-03-02', cpf: '11144477735' })
    expect(body.prRelationshipId).toBe('rel-1')
    expect(body.isResiding).toBe(true)
    expect(body.isCaregiver).toBe(true)
    expect('cpf' in toAddMemberInput(valid()).member).toBe(false)
  })
})

describe('ações · identidade social', () => {
  test('typeId vazio → erro; preenchido → null; toInput omite descrição vazia', () => {
    expect(validateSocialIdentity({ typeId: '', description: '' })).toBe('register.field.required')
    expect(validateSocialIdentity({ typeId: 'ti-1', description: '' })).toBeNull()
    expect(toSocialIdentityInput({ typeId: 'ti-1', description: '  ' })).toEqual({ typeId: 'ti-1' })
    expect(toSocialIdentityInput({ typeId: 'ti-1', description: ' Em aldeia ' })).toEqual({ typeId: 'ti-1', description: 'Em aldeia' })
  })
})
