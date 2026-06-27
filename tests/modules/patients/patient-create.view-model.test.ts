// ViewModel do wizard (puro) — validação por passo (FR-007) + montagem do corpo do cadastro orquestrado.
import { test, expect, describe } from 'bun:test'
import {
  emptyForm,
  validateStep1,
  validateStep2,
  toRegisterInput,
  isValidCpf,
  hasErrors,
  type WizardForm,
} from '~/modules/patients/client/create/patient-create.view-model'

const TODAY = '2026-06-26'
const validStep1 = (over: Partial<WizardForm> = {}): WizardForm => ({
  ...emptyForm(),
  fullName: 'Maria Silva',
  birthDate: '2010-05-01',
  motherName: 'Ana Silva',
  sex: 'F',
  nationality: 'Brasileira',
  ...over,
})

describe('wizard · CPF (MOD-11)', () => {
  test('aceita CPF válido e rejeita inválidos/repetidos', () => {
    expect(isValidCpf('111.444.777-35')).toBe(true)
    expect(isValidCpf('11144477735')).toBe(true)
    expect(isValidCpf('11111111111')).toBe(false)
    expect(isValidCpf('12345678900')).toBe(false)
    expect(isValidCpf('123')).toBe(false)
  })
})

describe('wizard · passo 1 (Identificação)', () => {
  test('vazio → aponta obrigatórios (CPF é opcional, sem erro)', () => {
    const e = validateStep1(emptyForm(), TODAY)
    expect(e.fullName).toBe('register.field.required')
    expect(e.birthDate).toBe('register.field.required')
    expect(e.motherName).toBe('register.field.required')
    expect(e.sex).toBe('register.field.required')
    expect(e.nationality).toBe('register.field.required')
    expect(e.cpf).toBeUndefined()
  })

  test('válido → sem erros', () => {
    expect(hasErrors(validateStep1(validStep1(), TODAY))).toBe(false)
  })

  test('nome sem sobrenome → erro específico', () => {
    expect(validateStep1(validStep1({ fullName: 'Maria' }), TODAY).fullName).toBe('register.field.fullName')
  })

  test('CPF preenchido inválido → erro; válido → ok', () => {
    expect(validateStep1(validStep1({ cpf: '11111111111' }), TODAY).cpf).toBe('register.field.cpf')
    expect(validateStep1(validStep1({ cpf: '111.444.777-35' }), TODAY).cpf).toBeUndefined()
  })

  test('nascimento futuro → erro de data futura', () => {
    expect(validateStep1(validStep1({ birthDate: '2030-01-01' }), TODAY).birthDate).toBe('register.field.dateFuture')
  })

  test('sexo fora de M/F/O → obrigatório', () => {
    expect(validateStep1(validStep1({ sex: 'X' }), TODAY).sex).toBe('register.field.required')
  })
})

describe('wizard · passo 2 (Diagnóstico)', () => {
  const validStep2 = (over: Partial<WizardForm> = {}): WizardForm => ({
    ...validStep1(),
    icdCode: 'Q90',
    diagnosisDate: '2020-01-01',
    description: 'Síndrome de Down',
    prRelationshipId: 'rel-1',
    ...over,
  })

  test('vazio → obrigatórios', () => {
    const e = validateStep2(emptyForm(), TODAY)
    expect(e.icdCode).toBe('register.field.required')
    expect(e.diagnosisDate).toBe('register.field.required')
    expect(e.description).toBe('register.field.required')
    expect(e.prRelationshipId).toBe('register.field.required')
  })

  test('válido → sem erros', () => {
    expect(hasErrors(validateStep2(validStep2(), TODAY))).toBe(false)
  })

  test('data do diagnóstico futura → erro', () => {
    expect(validateStep2(validStep2({ diagnosisDate: '2099-01-01' }), TODAY).diagnosisDate).toBe('register.field.dateFuture')
  })
})

describe('wizard · toRegisterInput (corpo do BFF)', () => {
  test('mapeia pessoa + diagnóstico; trim; CPF só-dígitos quando presente', () => {
    const form: WizardForm = {
      fullName: '  Maria Silva Santos ',
      cpf: '111.444.777-35',
      birthDate: '2010-05-01',
      motherName: ' Ana Silva ',
      sex: 'F',
      nationality: ' Brasileira ',
      icdCode: ' Q90 ',
      diagnosisDate: '2020-01-01',
      description: ' Síndrome de Down ',
      prRelationshipId: 'rel-1',
    }
    const body = toRegisterInput(form)
    expect(body.person.fullName).toBe('Maria Silva Santos')
    expect(body.person.cpf).toBe('11144477735')
    expect(body.person.motherName).toBe('Ana Silva')
    expect(body.person.nationality).toBe('Brasileira')
    expect(body.person.sex).toBe('F')
    expect(body.initialDiagnoses).toEqual([{ icdCode: 'Q90', date: '2020-01-01', description: 'Síndrome de Down' }])
    expect(body.prRelationshipId).toBe('rel-1')
  })

  test('CPF vazio → omitido do corpo (opcional)', () => {
    const body = toRegisterInput(validStep1({ icdCode: 'Q90', diagnosisDate: '2020-01-01', description: 'x', prRelationshipId: 'rel-1' }))
    expect('cpf' in body.person).toBe(false)
  })
})
