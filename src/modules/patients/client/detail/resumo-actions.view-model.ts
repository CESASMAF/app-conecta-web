// ViewModel PURO das ações do Resumo (US3) — sem Solid; testável em bun:test. Valida e monta os corpos
// das mutações (ciclo de vida, adicionar membro orquestrado, identidade social). Erros como VALOR (tags).
import type { PatientsTag } from '~/shared/i18n/patients'
import { isValidCpf } from '../create/patient-create.view-model'

// --- Ciclo de vida: motivos (enums do CONTRATO, não catálogo de domínio → labels no código é OK) ---
export const DISCHARGE_REASONS = [
  { value: 'improved', label: 'Melhora clínica' },
  { value: 'deceased', label: 'Óbito' },
  { value: 'transferred', label: 'Transferência' },
  { value: 'abandoned', label: 'Abandono' },
  { value: 'other', label: 'Outro motivo' },
] as const

export const WITHDRAW_REASONS = [
  { value: 'refused_service', label: 'Recusou o serviço' },
  { value: 'moved_location', label: 'Mudou de localidade' },
  { value: 'other', label: 'Outro motivo' },
] as const

export type ReasonForm = Readonly<{ reason: string; notes: string }>
export const emptyReason = (): ReasonForm => ({ reason: '', notes: '' })

// reason obrigatório; notes obrigatório quando reason==='other' (espelha BFF/backend, FR-008).
export function validateReason(f: ReasonForm): PatientsTag | null {
  if (f.reason.trim() === '') return 'actions.reason.required'
  if (f.reason === 'other' && f.notes.trim() === '') return 'actions.notes.required'
  return null
}

export function toReasonInput(f: ReasonForm): Readonly<{ reason: string; notes?: string }> {
  const notes = f.notes.trim()
  return { reason: f.reason, ...(notes ? { notes } : {}) }
}

// --- Adicionar membro (caminho orquestrado: cria a pessoa-membro nos bastidores) ---
export type AddMemberForm = Readonly<{
  fullName: string
  birthDate: string
  cpf: string
  prRelationshipId: string
  isResiding: boolean
  isCaregiver: boolean
}>

export const emptyAddMember = (): AddMemberForm => ({
  fullName: '',
  birthDate: '',
  cpf: '',
  prRelationshipId: '',
  isResiding: false,
  isCaregiver: false,
})

export type AddMemberField = 'fullName' | 'birthDate' | 'cpf' | 'prRelationshipId'
export type AddMemberErrors = Partial<Record<AddMemberField, PatientsTag>>

export type AddMemberBody = Readonly<{
  member: Readonly<{ fullName: string; birthDate: string; cpf?: string }>
  prRelationshipId: string
  isResiding: boolean
  isCaregiver: boolean
}>

export function validateAddMember(f: AddMemberForm, today: string): AddMemberErrors {
  const e: AddMemberErrors = {}
  if (f.fullName.trim() === '') e.fullName = 'register.field.required'
  else if (f.fullName.trim().split(/\s+/).length < 2) e.fullName = 'register.field.fullName'
  if (f.birthDate === '') e.birthDate = 'register.field.required'
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(f.birthDate)) e.birthDate = 'register.field.date'
  else if (f.birthDate > today) e.birthDate = 'register.field.dateFuture'
  if (f.cpf.trim() !== '' && !isValidCpf(f.cpf)) e.cpf = 'register.field.cpf'
  if (f.prRelationshipId.trim() === '') e.prRelationshipId = 'register.field.required'
  return e
}

export function toAddMemberInput(f: AddMemberForm): AddMemberBody {
  const cpf = f.cpf.replace(/\D/g, '')
  return {
    member: { fullName: f.fullName.trim(), birthDate: f.birthDate, ...(cpf ? { cpf } : {}) },
    prRelationshipId: f.prRelationshipId,
    isResiding: f.isResiding,
    isCaregiver: f.isCaregiver,
  }
}

// --- Identidade social ---
export type SocialIdentityForm = Readonly<{ typeId: string; description: string }>
export const emptySocialIdentity = (): SocialIdentityForm => ({ typeId: '', description: '' })

export type SocialIdentityBody = Readonly<{ typeId: string; description?: string }>

// typeId obrigatório. A regra de "descrição exigida" (indígena) é do backend (autoridade) — tratada como
// erro gracioso no envio; não hardcodamos a regra de domínio no client.
export function validateSocialIdentity(f: SocialIdentityForm): PatientsTag | null {
  return f.typeId.trim() === '' ? 'register.field.required' : null
}

export function toSocialIdentityInput(f: SocialIdentityForm): SocialIdentityBody {
  const description = f.description.trim()
  return { typeId: f.typeId, ...(description ? { description } : {}) }
}

export const hasAnyError = (e: Record<string, unknown>): boolean => Object.keys(e).length > 0
