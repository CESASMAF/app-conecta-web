// ViewModel PURO do Cuidado Clínico + Proteção + Histórico (US5) — sem Solid; testável em bun:test.
// Forms, validação e montagem dos 5 comandos de escrita + helpers de exibição (data, rótulo de evento).
import type { PatientsTag } from '~/shared/i18n/patients'
import type { IntakeData, PlacementData } from '~/shared/domain/patient-care'
export { formatDate } from '~/shared/date' // re-export p/ compatibilidade (tabs/testes do care)

// ================= Atendimentos =================
export type AppointmentForm = { type: string; date: string; summary: string; actionPlan: string }
export const emptyAppointment = (): AppointmentForm => ({ type: '', date: '', summary: '', actionPlan: '' })
export type AppointmentBody = Readonly<{ type?: string; date?: string; summary?: string; actionPlan?: string }>

// ≥1 narrativa (summary OU actionPlan) — espelha REGA-006.
export function validateAppointment(f: AppointmentForm): PatientsTag | null {
  return f.summary.trim() === '' && f.actionPlan.trim() === '' ? 'care.appointment.narrative' : null
}
export function toAppointmentInput(f: AppointmentForm): AppointmentBody {
  return {
    ...(f.type.trim() ? { type: f.type.trim() } : {}),
    ...(f.date ? { date: f.date } : {}),
    ...(f.summary.trim() ? { summary: f.summary.trim() } : {}),
    ...(f.actionPlan.trim() ? { actionPlan: f.actionPlan.trim() } : {}),
  }
}

// ================= Ingresso (intake) =================
export type ProgramRow = { programId: string; observation: string }
export const emptyProgram = (): ProgramRow => ({ programId: '', observation: '' })
export type IntakeForm = { ingressTypeId: string; originName: string; originContact: string; serviceReason: string; linkedSocialPrograms: ProgramRow[] }
export const emptyIntake = (): IntakeForm => ({ ingressTypeId: '', originName: '', originContact: '', serviceReason: '', linkedSocialPrograms: [] })
export const intakeFromData = (d: IntakeData): IntakeForm => ({
  ingressTypeId: d.ingressTypeId,
  originName: d.originName ?? '',
  originContact: d.originContact ?? '',
  serviceReason: d.serviceReason,
  linkedSocialPrograms: d.linkedSocialPrograms.map((p) => ({ programId: p.programId, observation: p.observation ?? '' })),
})
export type IntakeBody = Readonly<{
  ingressTypeId: string
  originName?: string
  originContact?: string
  serviceReason: string
  linkedSocialPrograms: readonly Readonly<{ programId: string; observation?: string }>[]
}>
export type IntakeErrors = Readonly<{ ingressTypeId?: PatientsTag; serviceReason?: PatientsTag; programs: readonly (PatientsTag | null)[] }>
export function validateIntake(f: IntakeForm): IntakeErrors {
  return {
    ...(f.ingressTypeId.trim() === '' ? { ingressTypeId: 'register.field.required' as const } : {}),
    ...(f.serviceReason.trim() === '' ? { serviceReason: 'register.field.required' as const } : {}),
    programs: f.linkedSocialPrograms.map((p) => (p.programId.trim() === '' ? ('register.field.required' as PatientsTag) : null)),
  }
}
export const intakeHasErrors = (e: IntakeErrors): boolean =>
  Boolean(e.ingressTypeId || e.serviceReason) || e.programs.some((p) => p !== null)
export function toIntakeInput(f: IntakeForm): IntakeBody {
  return {
    ingressTypeId: f.ingressTypeId,
    ...(f.originName.trim() ? { originName: f.originName.trim() } : {}),
    ...(f.originContact.trim() ? { originContact: f.originContact.trim() } : {}),
    serviceReason: f.serviceReason.trim(),
    linkedSocialPrograms: f.linkedSocialPrograms.map((p) => ({ programId: p.programId, ...(p.observation.trim() ? { observation: p.observation.trim() } : {}) })),
  }
}

// ================= Acolhimento (placement) =================
export type RegistryRow = { memberId: string; startDate: string; endDate: string; reason: string }
export const emptyRegistry = (): RegistryRow => ({ memberId: '', startDate: '', endDate: '', reason: '' })
export type PlacementForm = {
  registries: RegistryRow[]
  homeLossReport: string
  thirdPartyGuardReport: string
  adultInPrison: boolean
  adolescentInInternment: boolean
}
export const emptyPlacement = (): PlacementForm => ({ registries: [], homeLossReport: '', thirdPartyGuardReport: '', adultInPrison: false, adolescentInInternment: false })
export const placementFromData = (d: PlacementData): PlacementForm => ({
  registries: d.individualPlacements.map((r) => ({ memberId: r.memberId, startDate: formatToInputDate(r.startDate), endDate: formatToInputDate(r.endDate), reason: r.reason })),
  homeLossReport: d.homeLossReport ?? '',
  thirdPartyGuardReport: d.thirdPartyGuardReport ?? '',
  adultInPrison: d.adultInPrison,
  adolescentInInternment: d.adolescentInInternment,
})
// data de leitura (ISO/datetime) → 'yyyy-mm-dd' p/ <input type=date>
function formatToInputDate(s: string | null): string {
  if (!s) return ''
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(s)
  return m ? m[1]! : ''
}
export type RegistryErr = Partial<Record<'memberId' | 'startDate' | 'reason', PatientsTag>>
export type PlacementErrors = Readonly<{ registries: readonly RegistryErr[] }>
export function validatePlacement(f: PlacementForm): PlacementErrors {
  return {
    registries: f.registries.map((r) => {
      const e: RegistryErr = {}
      if (r.memberId.trim() === '') e.memberId = 'register.field.required'
      if (r.startDate.trim() === '') e.startDate = 'register.field.required'
      if (r.reason.trim() === '') e.reason = 'register.field.required'
      return e
    }),
  }
}
export const placementHasErrors = (e: PlacementErrors): boolean => e.registries.some((r) => Object.keys(r).length > 0)
export type PlacementBody = Readonly<{
  registries: readonly Readonly<{ memberId: string; startDate: string; endDate?: string; reason: string }>[]
  collectiveSituations: Readonly<{ homeLossReport?: string; thirdPartyGuardReport?: string }>
  separationChecklist: Readonly<{ adultInPrison: boolean; adolescentInInternment: boolean }>
}>
export function toPlacementInput(f: PlacementForm): PlacementBody {
  return {
    registries: f.registries.map((r) => ({ memberId: r.memberId, startDate: r.startDate, ...(r.endDate ? { endDate: r.endDate } : {}), reason: r.reason.trim() })),
    collectiveSituations: {
      ...(f.homeLossReport.trim() ? { homeLossReport: f.homeLossReport.trim() } : {}),
      ...(f.thirdPartyGuardReport.trim() ? { thirdPartyGuardReport: f.thirdPartyGuardReport.trim() } : {}),
    },
    separationChecklist: { adultInPrison: f.adultInPrison, adolescentInInternment: f.adolescentInInternment },
  }
}

// ================= Violação de direitos =================
export type ViolationForm = { victimId: string; violationTypeId: string; incidentDate: string; descriptionOfFact: string; actionsTaken: string }
export const emptyViolation = (): ViolationForm => ({ victimId: '', violationTypeId: '', incidentDate: '', descriptionOfFact: '', actionsTaken: '' })
export type ViolationErrors = Partial<Record<'victimId' | 'violationTypeId' | 'descriptionOfFact', PatientsTag>>
export function validateViolation(f: ViolationForm): ViolationErrors {
  const e: ViolationErrors = {}
  if (f.victimId.trim() === '') e.victimId = 'register.field.required'
  if (f.violationTypeId.trim() === '') e.violationTypeId = 'register.field.required'
  if (f.descriptionOfFact.trim() === '') e.descriptionOfFact = 'register.field.required'
  return e
}
export type ViolationBody = Readonly<{
  victimId: string
  violationType: string
  violationTypeId?: string
  incidentDate?: string
  descriptionOfFact: string
  actionsTaken?: string
}>
// `violationType` (código do enum) vem do `codigo` do item de catálogo selecionado; `violationTypeId` = id.
export function toViolationInput(f: ViolationForm, violationTypeCode: string): ViolationBody {
  return {
    victimId: f.victimId,
    violationType: violationTypeCode || f.violationTypeId,
    violationTypeId: f.violationTypeId,
    ...(f.incidentDate ? { incidentDate: f.incidentDate } : {}),
    descriptionOfFact: f.descriptionOfFact.trim(),
    ...(f.actionsTaken.trim() ? { actionsTaken: f.actionsTaken.trim() } : {}),
  }
}

// ================= Encaminhamento (referral) =================
export type ReferralForm = { referredPersonId: string; destinationService: string; reason: string; date: string }
export const emptyReferral = (): ReferralForm => ({ referredPersonId: '', destinationService: '', reason: '', date: '' })
export type ReferralErrors = Partial<Record<'referredPersonId' | 'destinationService' | 'reason', PatientsTag>>
export function validateReferral(f: ReferralForm): ReferralErrors {
  const e: ReferralErrors = {}
  if (f.referredPersonId.trim() === '') e.referredPersonId = 'register.field.required'
  if (f.destinationService.trim() === '') e.destinationService = 'register.field.required'
  if (f.reason.trim() === '') e.reason = 'register.field.required'
  return e
}
export type ReferralBody = Readonly<{ referredPersonId: string; destinationService: string; reason: string; date?: string }>
export function toReferralInput(f: ReferralForm): ReferralBody {
  return {
    referredPersonId: f.referredPersonId,
    destinationService: f.destinationService.trim(),
    reason: f.reason.trim(),
    ...(f.date ? { date: f.date } : {}),
  }
}

// ================= Histórico (auditoria) =================
const EVENT_LABELS: Readonly<Record<string, string>> = {
  PatientCreated: 'Paciente criado',
  PatientAdmitted: 'Admitido',
  PatientDischarged: 'Alta',
  PatientReadmitted: 'Readmitido',
  PatientWithdrawnFromWaitlist: 'Retirado da fila',
  FamilyMemberAdded: 'Membro adicionado',
  FamilyMemberRemoved: 'Membro removido',
  PrimaryCaregiverAssigned: 'Cuidador principal definido',
  SocialIdentityUpdated: 'Identidade social atualizada',
  HousingConditionUpdated: 'Moradia atualizada',
  SocioEconomicSituationUpdated: 'Situação socioeconômica atualizada',
  WorkAndIncomeUpdated: 'Trabalho e renda atualizado',
  EducationalStatusUpdated: 'Educação atualizada',
  HealthStatusUpdated: 'Saúde atualizada',
  CommunitySupportNetworkUpdated: 'Rede de apoio atualizada',
  SocialHealthSummaryUpdated: 'Resumo social-sanitário atualizado',
  AppointmentRegistered: 'Atendimento registrado',
  IntakeInfoUpdated: 'Ingresso atualizado',
  PlacementHistoryUpdated: 'Acolhimento atualizado',
  RightsViolationReported: 'Violação reportada',
  ReferralCreated: 'Encaminhamento criado',
}
// Rótulo amigável do evento (tolerante ao sufixo "Event").
export function auditEventLabel(eventType: string): string {
  const key = eventType.replace(/Event$/, '')
  return EVENT_LABELS[key] ?? key
}
