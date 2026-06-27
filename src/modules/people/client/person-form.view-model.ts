// ViewModel PURO da área de Pessoas (Admin/RH) — sem Solid; testável em bun:test. Forms de criar/editar
// pessoa + atribuir papel, validação e montagem dos corpos do BFF. Erros como VALOR (tags i18n).
import type { PeopleTag } from '~/shared/i18n/people'
import { isValidCpf } from '~/shared/domain/cpf'

// Sistemas e papéis (RBAC = CONTRATO, não catálogo de domínio → opções fixas).
export const ROLE_SYSTEMS = [
  { value: 'social-care', label: 'Cuidado (social-care)' },
  { value: 'people-context', label: 'Pessoas (people-context)' },
  { value: 'analysis-bi', label: 'Indicadores (analysis-bi)' },
] as const
export const COMMON_ROLES = [
  { value: 'worker', label: 'Assistente social (worker)' },
  { value: 'admin', label: 'Administrador (admin)' },
  { value: 'analyst', label: 'Analista (analyst)' },
  { value: 'exporter', label: 'Exportador (exporter)' },
  { value: 'owner', label: 'Dono (owner)' },
  { value: 'superadmin', label: 'Superadmin' },
] as const

const isIsoDate = (s: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(s)
const isEmail = (s: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)

export type PersonForm = {
  fullName: string
  birthDate: string
  cpf: string
  email: string
  createLogin: boolean
  initialPassword: string
}
export const emptyPerson = (): PersonForm => ({ fullName: '', birthDate: '', cpf: '', email: '', createLogin: false, initialPassword: '' })

// Edição pré-preenche só nome+nascimento (a visão composta não traz CPF/e-mail; PUT é COALESCE → vazio preserva).
export const personFromOverview = (o: { fullName: string; birthDate: string }): PersonForm => ({
  ...emptyPerson(),
  fullName: o.fullName,
  birthDate: o.birthDate,
})

export type PersonField = 'fullName' | 'birthDate' | 'cpf' | 'email' | 'initialPassword'
export type PersonErrors = Partial<Record<PersonField, PeopleTag>>

// Regras comuns (nome+nascimento+cpf?+email?). `today` injetado p/ determinismo nos testes.
function baseErrors(f: PersonForm, today: string): PersonErrors {
  const e: PersonErrors = {}
  if (f.fullName.trim() === '') e.fullName = 'people.field.required'
  else if (f.fullName.trim().split(/\s+/).length < 2) e.fullName = 'people.field.fullName'
  if (f.birthDate === '') e.birthDate = 'people.field.required'
  else if (!isIsoDate(f.birthDate)) e.birthDate = 'people.field.date'
  else if (f.birthDate > today) e.birthDate = 'people.field.dateFuture'
  if (f.cpf.trim() !== '' && !isValidCpf(f.cpf)) e.cpf = 'people.field.cpf'
  if (f.email.trim() !== '' && !isEmail(f.email)) e.email = 'people.field.email'
  return e
}

// Criar: + regra de acesso (createLogin ⇒ e-mail; senha ≥ 8 se informada — espelha PEO-009).
export function validatePersonCreate(f: PersonForm, today: string): PersonErrors {
  const e = baseErrors(f, today)
  if (f.createLogin && f.email.trim() === '') e.email = 'people.field.emailRequired'
  if (f.initialPassword.trim() !== '' && f.initialPassword.length < 8) e.initialPassword = 'people.field.password'
  return e
}

export function validatePersonEdit(f: PersonForm, today: string): PersonErrors {
  return baseErrors(f, today)
}

export const hasErrors = (e: PersonErrors): boolean => Object.keys(e).length > 0

const digits = (s: string): string => s.replace(/\D/g, '')

export type PersonCreateBody = Readonly<{
  fullName: string
  birthDate: string
  cpf?: string
  email?: string
  createLogin?: boolean
  initialPassword?: string
}>
export function toCreateBody(f: PersonForm): PersonCreateBody {
  const cpf = digits(f.cpf)
  return {
    fullName: f.fullName.trim(),
    birthDate: f.birthDate,
    ...(cpf ? { cpf } : {}),
    ...(f.email.trim() ? { email: f.email.trim() } : {}),
    ...(f.createLogin ? { createLogin: true } : {}),
    ...(f.createLogin && f.initialPassword.trim() ? { initialPassword: f.initialPassword } : {}),
  }
}

export type PersonUpdateBody = Readonly<{ fullName: string; birthDate: string; cpf?: string; email?: string }>
export function toUpdateBody(f: PersonForm): PersonUpdateBody {
  const cpf = digits(f.cpf)
  return {
    fullName: f.fullName.trim(),
    birthDate: f.birthDate,
    ...(cpf ? { cpf } : {}),
    ...(f.email.trim() ? { email: f.email.trim() } : {}),
  }
}

// Atribuir papel
export type AssignRoleForm = { system: string; role: string }
export const emptyAssignRole = (): AssignRoleForm => ({ system: '', role: '' })
export type AssignRoleErrors = Partial<Record<'system' | 'role', PeopleTag>>
export function validateAssignRole(f: AssignRoleForm): AssignRoleErrors {
  const e: AssignRoleErrors = {}
  if (f.system.trim() === '') e.system = 'people.field.required'
  if (f.role.trim() === '') e.role = 'people.field.required'
  return e
}
export type AssignRoleBody = Readonly<{ system: string; role: string }>
export function toAssignRoleBody(f: AssignRoleForm): AssignRoleBody {
  return { system: f.system, role: f.role }
}
