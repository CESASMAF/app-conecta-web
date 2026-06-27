// ViewModel da área de Pessoas (puro) — validação de criar/editar/atribuir papel e montagem dos corpos.
import { test, expect, describe } from 'bun:test'
import {
  emptyPerson,
  validatePersonCreate,
  validatePersonEdit,
  toCreateBody,
  toUpdateBody,
  hasErrors,
  personFromOverview,
  emptyAssignRole,
  validateAssignRole,
  toAssignRoleBody,
  type PersonForm,
} from '~/modules/people/client/person-form.view-model'

const TODAY = '2026-06-26'
const validBase = (over: Partial<PersonForm> = {}): PersonForm => ({
  ...emptyPerson(),
  fullName: 'Ana Souza',
  birthDate: '1990-05-01',
  ...over,
})

describe('pessoas · criar', () => {
  test('vazio → obrigatórios; nome sem sobrenome / nascimento futuro / cpf inválido', () => {
    const e = validatePersonCreate(emptyPerson(), TODAY)
    expect(e.fullName).toBe('people.field.required')
    expect(e.birthDate).toBe('people.field.required')
    expect(validatePersonCreate(validBase({ fullName: 'Ana' }), TODAY).fullName).toBe('people.field.fullName')
    expect(validatePersonCreate(validBase({ birthDate: '2099-01-01' }), TODAY).birthDate).toBe('people.field.dateFuture')
    expect(validatePersonCreate(validBase({ cpf: '11111111111' }), TODAY).cpf).toBe('people.field.cpf')
  })

  test('createLogin exige e-mail; senha < 8 inválida; válido → sem erros', () => {
    expect(validatePersonCreate(validBase({ createLogin: true }), TODAY).email).toBe('people.field.emailRequired')
    expect(validatePersonCreate(validBase({ createLogin: true, email: 'a@b.co', initialPassword: '123' }), TODAY).initialPassword).toBe('people.field.password')
    expect(hasErrors(validatePersonCreate(validBase({ createLogin: true, email: 'a@b.co', initialPassword: '12345678' }), TODAY))).toBe(false)
    expect(validatePersonCreate(validBase({ email: 'invalido' }), TODAY).email).toBe('people.field.email')
  })

  test('toCreateBody: cpf só-dígitos, omite vazios, createLogin só quando marcado', () => {
    const body = toCreateBody(validBase({ cpf: '111.444.777-35', email: 'a@b.co', createLogin: true, initialPassword: '12345678' }))
    expect(body).toEqual({ fullName: 'Ana Souza', birthDate: '1990-05-01', cpf: '11144477735', email: 'a@b.co', createLogin: true, initialPassword: '12345678' })
    const minimal = toCreateBody(validBase())
    expect(minimal).toEqual({ fullName: 'Ana Souza', birthDate: '1990-05-01' })
  })
})

describe('pessoas · editar', () => {
  test('prefill só nome+nascimento; toUpdateBody preserva (omite vazios)', () => {
    const f = personFromOverview({ fullName: 'Ana Souza', birthDate: '1990-05-01' })
    expect(f.cpf).toBe('')
    expect(hasErrors(validatePersonEdit(f, TODAY))).toBe(false)
    expect(toUpdateBody(f)).toEqual({ fullName: 'Ana Souza', birthDate: '1990-05-01' })
  })
})

describe('pessoas · atribuir papel', () => {
  test('exige system e role; toAssignRoleBody monta', () => {
    expect(validateAssignRole(emptyAssignRole()).system).toBe('people.field.required')
    expect(toAssignRoleBody({ system: 'social-care', role: 'worker' })).toEqual({ system: 'social-care', role: 'worker' })
  })
})
