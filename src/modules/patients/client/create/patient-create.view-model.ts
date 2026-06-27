// ViewModel PURO do wizard de cadastro (ADR-0009/0012) — sem Solid; testável em bun:test.
// Valida cada passo ANTES de avançar/enviar (FR-007) e monta o corpo do cadastro orquestrado
// (pessoa + paciente) que o BFF recebe em POST /api/patients. Erros são VALOR (tags i18n), sem throw.
import type { PatientsTag } from '~/shared/i18n/patients'
import { isValidCpf } from '~/shared/domain/cpf'
export { isValidCpf } from '~/shared/domain/cpf' // re-export p/ compatibilidade (resumo-actions, testes)

// Estado do formulário (2 passos num único objeto plano — simples de serializar p/ rascunho).
export type WizardForm = Readonly<{
  // Passo 1 — Identificação (pessoa)
  fullName: string
  cpf: string
  birthDate: string // <input type=date> → 'yyyy-mm-dd'
  motherName: string
  sex: string // '' | 'M' | 'F' | 'O'
  nationality: string
  // Passo 2 — Diagnóstico inicial + responsável
  icdCode: string
  diagnosisDate: string
  description: string
  prRelationshipId: string
}>

export type WizardField = keyof WizardForm
export type FieldErrors = Partial<Record<WizardField, PatientsTag>>

export const emptyForm = (): WizardForm => ({
  fullName: '',
  cpf: '',
  birthDate: '',
  motherName: '',
  sex: '',
  nationality: '',
  icdCode: '',
  diagnosisDate: '',
  description: '',
  prRelationshipId: '',
})

// Corpo do cadastro orquestrado enviado ao BFF (caminho `person`: cria identidade nos bastidores).
export type RegisterPatientBody = Readonly<{
  person: Readonly<{
    fullName: string
    birthDate: string
    cpf?: string
    sex: string
    motherName: string
    nationality: string
  }>
  initialDiagnoses: readonly Readonly<{ icdCode: string; date: string; description: string }>[]
  prRelationshipId: string
}>

const digits = (s: string): string => s.replace(/\D/g, '')

const isIsoDate = (s: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(s)
const isFuture = (s: string, today: string): boolean => s > today // ISO ordena lexicograficamente

// Passo 1 — Identificação. `today` (yyyy-mm-dd) injetado p/ determinismo nos testes.
export function validateStep1(f: WizardForm, today: string): FieldErrors {
  const e: FieldErrors = {}
  if (f.fullName.trim() === '') e.fullName = 'register.field.required'
  else if (f.fullName.trim().split(/\s+/).length < 2) e.fullName = 'register.field.fullName'
  if (f.cpf.trim() !== '' && !isValidCpf(f.cpf)) e.cpf = 'register.field.cpf'
  if (f.birthDate === '') e.birthDate = 'register.field.required'
  else if (!isIsoDate(f.birthDate)) e.birthDate = 'register.field.date'
  else if (isFuture(f.birthDate, today)) e.birthDate = 'register.field.dateFuture'
  if (f.motherName.trim() === '') e.motherName = 'register.field.required'
  if (f.sex !== 'M' && f.sex !== 'F' && f.sex !== 'O') e.sex = 'register.field.required'
  if (f.nationality.trim() === '') e.nationality = 'register.field.required'
  return e
}

// Passo 2 — Diagnóstico inicial + parentesco do responsável.
export function validateStep2(f: WizardForm, today: string): FieldErrors {
  const e: FieldErrors = {}
  if (f.icdCode.trim() === '') e.icdCode = 'register.field.required'
  if (f.diagnosisDate === '') e.diagnosisDate = 'register.field.required'
  else if (!isIsoDate(f.diagnosisDate)) e.diagnosisDate = 'register.field.date'
  else if (isFuture(f.diagnosisDate, today)) e.diagnosisDate = 'register.field.dateFuture'
  if (f.description.trim() === '') e.description = 'register.field.required'
  if (f.prRelationshipId.trim() === '') e.prRelationshipId = 'register.field.required'
  return e
}

export const hasErrors = (e: FieldErrors): boolean => Object.keys(e).length > 0

// Monta o corpo do BFF. CPF vira só-dígitos; omitido quando vazio (CPF é opcional).
export function toRegisterInput(f: WizardForm): RegisterPatientBody {
  const cpf = digits(f.cpf)
  return {
    person: {
      fullName: f.fullName.trim(),
      birthDate: f.birthDate,
      ...(cpf ? { cpf } : {}),
      sex: f.sex,
      motherName: f.motherName.trim(),
      nationality: f.nationality.trim(),
    },
    initialDiagnoses: [{ icdCode: f.icdCode.trim(), date: f.diagnosisDate, description: f.description.trim() }],
    prRelationshipId: f.prRelationshipId,
  }
}
