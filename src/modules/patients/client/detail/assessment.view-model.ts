// ViewModel PURO da Avaliação (US4) — sem Solid; testável em bun:test. Metadados das 7 seções, opções de
// enums de moradia (CONTRATO, não catálogo → opções fixas, como os motivos do Inc 3), e form/validação/
// montagem das 4 seções planas. As 3 por-membro entram depois (tier 'soon').
import type { PatientsTag } from '~/shared/i18n/patients'
import type {
  AssessmentSectionKey,
  HousingConditionData,
  SocioEconomicData,
  CommunitySupportData,
  SocialHealthSummaryData,
  WorkAndIncomeData,
  EducationalStatusData,
  HealthStatusData,
} from '~/shared/domain/patient-assessment'

export type Option = Readonly<{ value: string; label: string }>

export type SectionMeta = Readonly<{ key: AssessmentSectionKey; label: string; tier: 'now' | 'soon' }>
export const SECTIONS: readonly SectionMeta[] = [
  { key: 'housingCondition', label: 'Moradia', tier: 'now' },
  { key: 'socioeconomicSituation', label: 'Socioeconômico', tier: 'now' },
  { key: 'workAndIncome', label: 'Trabalho e renda', tier: 'now' },
  { key: 'educationalStatus', label: 'Educação', tier: 'now' },
  { key: 'healthStatus', label: 'Saúde', tier: 'now' },
  { key: 'communitySupportNetwork', label: 'Rede de apoio', tier: 'now' },
  { key: 'socialHealthSummary', label: 'Resumo social-sanitário', tier: 'now' },
]

// --- helpers de número (form guarda string; converte na montagem) ---
const numInvalid = (s: string, int = false): boolean => {
  const n = Number(s)
  if (s.trim() === '' || !Number.isFinite(n) || n < 0) return true
  return int ? !Number.isInteger(n) : false
}

// ================= Moradia =================
export const HOUSING_OPTIONS = {
  type: [
    { value: 'OWNED', label: 'Própria' },
    { value: 'RENTED', label: 'Alugada' },
    { value: 'CEDED', label: 'Cedida' },
    { value: 'SQUATTED', label: 'Ocupação' },
  ],
  wallMaterial: [
    { value: 'MASONRY', label: 'Alvenaria' },
    { value: 'FINISHED_WOOD', label: 'Madeira acabada' },
    { value: 'MAKESHIFT_MATERIALS', label: 'Material improvisado' },
  ],
  waterSupply: [
    { value: 'PUBLIC_NETWORK', label: 'Rede pública' },
    { value: 'WELL_OR_SPRING', label: 'Poço ou nascente' },
    { value: 'RAINWATER_HARVEST', label: 'Captação de chuva' },
    { value: 'WATER_TRUCK', label: 'Caminhão-pipa' },
    { value: 'OTHER', label: 'Outro' },
  ],
  electricityAccess: [
    { value: 'METERED_CONNECTION', label: 'Ligação com medidor' },
    { value: 'IRREGULAR_CONNECTION', label: 'Ligação irregular' },
    { value: 'NO_ACCESS', label: 'Sem acesso' },
  ],
  sewageDisposal: [
    { value: 'PUBLIC_SEWER', label: 'Rede pública de esgoto' },
    { value: 'SEPTIC_TANK', label: 'Fossa séptica' },
    { value: 'RUDIMENTARY_PIT', label: 'Fossa rudimentar' },
    { value: 'OPEN_SEWAGE', label: 'Esgoto a céu aberto' },
    { value: 'NO_BATHROOM', label: 'Sem banheiro' },
  ],
  wasteCollection: [
    { value: 'DIRECT_COLLECTION', label: 'Coleta direta' },
    { value: 'INDIRECT_COLLECTION', label: 'Coleta indireta' },
    { value: 'NO_COLLECTION', label: 'Sem coleta' },
  ],
  accessibilityLevel: [
    { value: 'FULLY_ACCESSIBLE', label: 'Totalmente acessível' },
    { value: 'PARTIALLY_ACCESSIBLE', label: 'Parcialmente acessível' },
    { value: 'NOT_ACCESSIBLE', label: 'Não acessível' },
  ],
} as const

// Tipos de FORM (estado mutável p/ createStore) — sem Readonly p/ evitar atrito do setter de store.
export type HousingForm = {
  type: string
  wallMaterial: string
  waterSupply: string
  electricityAccess: string
  sewageDisposal: string
  wasteCollection: string
  accessibilityLevel: string
  numberOfRooms: string
  numberOfBedrooms: string
  numberOfBathrooms: string
  hasPipedWater: boolean
  isInGeographicRiskArea: boolean
  hasDifficultAccess: boolean
  isInSocialConflictArea: boolean
  hasDiagnosticObservations: boolean
}

export const emptyHousing = (): HousingForm => ({
  type: '',
  wallMaterial: '',
  waterSupply: '',
  electricityAccess: '',
  sewageDisposal: '',
  wasteCollection: '',
  accessibilityLevel: '',
  numberOfRooms: '0',
  numberOfBedrooms: '0',
  numberOfBathrooms: '0',
  hasPipedWater: false,
  isInGeographicRiskArea: false,
  hasDifficultAccess: false,
  isInSocialConflictArea: false,
  hasDiagnosticObservations: false,
})

export const housingFromData = (d: HousingConditionData): HousingForm => ({
  type: d.type,
  wallMaterial: d.wallMaterial,
  waterSupply: d.waterSupply,
  electricityAccess: d.electricityAccess,
  sewageDisposal: d.sewageDisposal,
  wasteCollection: d.wasteCollection,
  accessibilityLevel: d.accessibilityLevel,
  numberOfRooms: String(d.numberOfRooms),
  numberOfBedrooms: String(d.numberOfBedrooms),
  numberOfBathrooms: String(d.numberOfBathrooms),
  hasPipedWater: d.hasPipedWater,
  isInGeographicRiskArea: d.isInGeographicRiskArea,
  hasDifficultAccess: d.hasDifficultAccess,
  isInSocialConflictArea: d.isInSocialConflictArea,
  hasDiagnosticObservations: d.hasDiagnosticObservations,
})

export type HousingErrors = Partial<Record<keyof HousingForm, PatientsTag>>
export function validateHousing(f: HousingForm): HousingErrors {
  const e: HousingErrors = {}
  for (const k of ['type', 'wallMaterial', 'waterSupply', 'electricityAccess', 'sewageDisposal', 'wasteCollection', 'accessibilityLevel'] as const) {
    if (f[k].trim() === '') e[k] = 'register.field.required'
  }
  for (const k of ['numberOfRooms', 'numberOfBedrooms', 'numberOfBathrooms'] as const) {
    if (numInvalid(f[k], true)) e[k] = 'assessment.field.number'
  }
  return e
}

export function toHousingInput(f: HousingForm) {
  return {
    type: f.type,
    wallMaterial: f.wallMaterial,
    waterSupply: f.waterSupply,
    electricityAccess: f.electricityAccess,
    sewageDisposal: f.sewageDisposal,
    wasteCollection: f.wasteCollection,
    accessibilityLevel: f.accessibilityLevel,
    numberOfRooms: Number(f.numberOfRooms),
    numberOfBedrooms: Number(f.numberOfBedrooms),
    numberOfBathrooms: Number(f.numberOfBathrooms),
    hasPipedWater: f.hasPipedWater,
    isInGeographicRiskArea: f.isInGeographicRiskArea,
    hasDifficultAccess: f.hasDifficultAccess,
    isInSocialConflictArea: f.isInSocialConflictArea,
    hasDiagnosticObservations: f.hasDiagnosticObservations,
  }
}

// ================= Socioeconômico =================
export type BenefitRow = { benefitName: string; amount: string; beneficiaryId: string; benefitTypeId: string }
export const emptyBenefit = (): BenefitRow => ({ benefitName: '', amount: '0', beneficiaryId: '', benefitTypeId: '' })

// Helpers de benefício reusados por Socioeconômico e Trabalho/Renda.
export type BenefitErr = Partial<Record<'benefitName' | 'amount' | 'beneficiaryId', PatientsTag>>
export function benefitRowError(b: BenefitRow): BenefitErr {
  const e: BenefitErr = {}
  if (b.benefitName.trim() === '') e.benefitName = 'register.field.required'
  if (numInvalid(b.amount)) e.amount = 'assessment.field.number'
  if (b.beneficiaryId.trim() === '') e.beneficiaryId = 'register.field.required'
  return e
}
export function benefitToInput(b: BenefitRow) {
  return {
    benefitName: b.benefitName.trim(),
    amount: Number(b.amount),
    beneficiaryId: b.beneficiaryId,
    ...(b.benefitTypeId.trim() ? { benefitTypeId: b.benefitTypeId } : {}),
  }
}

export type SocioForm = {
  totalFamilyIncome: string
  incomePerCapita: string
  mainSourceOfIncome: string
  receivesSocialBenefit: boolean
  hasUnemployed: boolean
  socialBenefits: BenefitRow[]
}

export const emptySocio = (): SocioForm => ({
  totalFamilyIncome: '0',
  incomePerCapita: '0',
  mainSourceOfIncome: '',
  receivesSocialBenefit: false,
  hasUnemployed: false,
  socialBenefits: [],
})

export const socioFromData = (d: SocioEconomicData): SocioForm => ({
  totalFamilyIncome: String(d.totalFamilyIncome),
  incomePerCapita: String(d.incomePerCapita),
  mainSourceOfIncome: d.mainSourceOfIncome,
  receivesSocialBenefit: d.receivesSocialBenefit,
  hasUnemployed: d.hasUnemployed,
  socialBenefits: d.socialBenefits.map((b) => ({
    benefitName: b.benefitName,
    amount: String(b.amount),
    beneficiaryId: b.beneficiaryId,
    benefitTypeId: b.benefitTypeId ?? '',
  })),
})

export type SocioErrors = Readonly<{
  totalFamilyIncome?: PatientsTag
  incomePerCapita?: PatientsTag
  mainSourceOfIncome?: PatientsTag
  benefits: readonly Partial<Record<'benefitName' | 'amount' | 'beneficiaryId', PatientsTag>>[]
}>

export function validateSocio(f: SocioForm): SocioErrors {
  return {
    ...(numInvalid(f.totalFamilyIncome) ? { totalFamilyIncome: 'assessment.field.number' as const } : {}),
    ...(numInvalid(f.incomePerCapita) ? { incomePerCapita: 'assessment.field.number' as const } : {}),
    ...(f.mainSourceOfIncome.trim() === '' ? { mainSourceOfIncome: 'register.field.required' as const } : {}),
    benefits: f.socialBenefits.map(benefitRowError),
  }
}

export const socioHasErrors = (e: SocioErrors): boolean =>
  Boolean(e.totalFamilyIncome || e.incomePerCapita || e.mainSourceOfIncome) || e.benefits.some((b) => Object.keys(b).length > 0)

export function toSocioInput(f: SocioForm) {
  return {
    totalFamilyIncome: Number(f.totalFamilyIncome),
    incomePerCapita: Number(f.incomePerCapita),
    mainSourceOfIncome: f.mainSourceOfIncome.trim(),
    receivesSocialBenefit: f.receivesSocialBenefit,
    hasUnemployed: f.hasUnemployed,
    socialBenefits: f.socialBenefits.map(benefitToInput),
  }
}

// ================= Rede de apoio =================
export type CommunityForm = {
  hasRelativeSupport: boolean
  hasNeighborSupport: boolean
  familyConflicts: string
  patientParticipatesInGroups: boolean
  familyParticipatesInGroups: boolean
  patientHasAccessToLeisure: boolean
  facesDiscrimination: boolean
}

export const emptyCommunity = (): CommunityForm => ({
  hasRelativeSupport: false,
  hasNeighborSupport: false,
  familyConflicts: '',
  patientParticipatesInGroups: false,
  familyParticipatesInGroups: false,
  patientHasAccessToLeisure: false,
  facesDiscrimination: false,
})

export const communityFromData = (d: CommunitySupportData): CommunityForm => ({ ...emptyCommunity(), ...d })

export function toCommunityInput(f: CommunityForm) {
  return { ...f, familyConflicts: f.familyConflicts.trim() }
}

// ================= Resumo social-sanitário =================
export type SummaryForm = {
  requiresConstantCare: boolean
  hasMobilityImpairment: boolean
  hasRelevantDrugTherapy: boolean
  functionalDependencies: string[]
}

export const emptySummary = (): SummaryForm => ({
  requiresConstantCare: false,
  hasMobilityImpairment: false,
  hasRelevantDrugTherapy: false,
  functionalDependencies: [],
})

export const summaryFromData = (d: SocialHealthSummaryData): SummaryForm => ({
  requiresConstantCare: d.requiresConstantCare,
  hasMobilityImpairment: d.hasMobilityImpairment,
  hasRelevantDrugTherapy: d.hasRelevantDrugTherapy,
  functionalDependencies: [...d.functionalDependencies],
})

export function toSummaryInput(f: SummaryForm) {
  return {
    requiresConstantCare: f.requiresConstantCare,
    hasMobilityImpairment: f.hasMobilityImpairment,
    hasRelevantDrugTherapy: f.hasRelevantDrugTherapy,
    functionalDependencies: f.functionalDependencies.map((s) => s.trim()).filter((s) => s !== ''),
  }
}

// ================= Trabalho e renda (por membro) =================
export type IncomeRow = { memberId: string; occupationId: string; hasWorkCard: boolean; monthlyAmount: string }
export const emptyIncome = (): IncomeRow => ({ memberId: '', occupationId: '', hasWorkCard: false, monthlyAmount: '0' })

export type WorkForm = { hasRetiredMembers: boolean; individualIncomes: IncomeRow[]; socialBenefits: BenefitRow[] }
export const emptyWork = (): WorkForm => ({ hasRetiredMembers: false, individualIncomes: [], socialBenefits: [] })
export const workFromData = (d: WorkAndIncomeData): WorkForm => ({
  hasRetiredMembers: d.hasRetiredMembers,
  individualIncomes: d.individualIncomes.map((i) => ({
    memberId: i.memberId,
    occupationId: i.occupationId,
    hasWorkCard: i.hasWorkCard,
    monthlyAmount: String(i.monthlyAmount),
  })),
  socialBenefits: d.socialBenefits.map((b) => ({ benefitName: b.benefitName, amount: String(b.amount), beneficiaryId: b.beneficiaryId, benefitTypeId: b.benefitTypeId ?? '' })),
})

export type IncomeErr = Partial<Record<'memberId' | 'occupationId' | 'monthlyAmount', PatientsTag>>
export type WorkErrors = Readonly<{ incomes: readonly IncomeErr[]; benefits: readonly BenefitErr[] }>
export function validateWork(f: WorkForm): WorkErrors {
  return {
    incomes: f.individualIncomes.map((i) => {
      const e: IncomeErr = {}
      if (i.memberId.trim() === '') e.memberId = 'register.field.required'
      if (i.occupationId.trim() === '') e.occupationId = 'register.field.required'
      if (numInvalid(i.monthlyAmount)) e.monthlyAmount = 'assessment.field.number'
      return e
    }),
    benefits: f.socialBenefits.map(benefitRowError),
  }
}
export const workHasErrors = (e: WorkErrors): boolean =>
  e.incomes.some((i) => Object.keys(i).length > 0) || e.benefits.some((b) => Object.keys(b).length > 0)
export function toWorkInput(f: WorkForm) {
  return {
    hasRetiredMembers: f.hasRetiredMembers,
    individualIncomes: f.individualIncomes.map((i) => ({
      memberId: i.memberId,
      occupationId: i.occupationId,
      hasWorkCard: i.hasWorkCard,
      monthlyAmount: Number(i.monthlyAmount),
    })),
    socialBenefits: f.socialBenefits.map(benefitToInput),
  }
}

// ================= Educação (por membro) =================
export type EduProfileRow = { memberId: string; canReadWrite: boolean; attendsSchool: boolean; educationLevelId: string }
export const emptyEduProfile = (): EduProfileRow => ({ memberId: '', canReadWrite: false, attendsSchool: false, educationLevelId: '' })
export type ProgramOccRow = { memberId: string; date: string; effectId: string; isSuspensionRequested: boolean }
export const emptyProgramOcc = (): ProgramOccRow => ({ memberId: '', date: '', effectId: '', isSuspensionRequested: false })

export type EduForm = { memberProfiles: EduProfileRow[]; programOccurrences: ProgramOccRow[] }
export const emptyEdu = (): EduForm => ({ memberProfiles: [], programOccurrences: [] })
export const eduFromData = (d: EducationalStatusData): EduForm => ({
  memberProfiles: d.memberProfiles.map((p) => ({ memberId: p.memberId, canReadWrite: p.canReadWrite, attendsSchool: p.attendsSchool, educationLevelId: p.educationLevelId })),
  programOccurrences: d.programOccurrences.map((o) => ({
    memberId: o.memberId,
    date: typeof o.date === 'string' ? o.date.slice(0, 10) : '',
    effectId: o.effectId,
    isSuspensionRequested: o.isSuspensionRequested,
  })),
})

export type EduProfileErr = Partial<Record<'memberId' | 'educationLevelId', PatientsTag>>
export type ProgramOccErr = Partial<Record<'memberId' | 'date' | 'effectId', PatientsTag>>
export type EduErrors = Readonly<{ profiles: readonly EduProfileErr[]; occurrences: readonly ProgramOccErr[] }>
export function validateEdu(f: EduForm): EduErrors {
  return {
    profiles: f.memberProfiles.map((p) => {
      const e: EduProfileErr = {}
      if (p.memberId.trim() === '') e.memberId = 'register.field.required'
      if (p.educationLevelId.trim() === '') e.educationLevelId = 'register.field.required'
      return e
    }),
    occurrences: f.programOccurrences.map((o) => {
      const e: ProgramOccErr = {}
      if (o.memberId.trim() === '') e.memberId = 'register.field.required'
      if (o.date.trim() === '') e.date = 'register.field.required'
      if (o.effectId.trim() === '') e.effectId = 'register.field.required'
      return e
    }),
  }
}
export const eduHasErrors = (e: EduErrors): boolean =>
  e.profiles.some((p) => Object.keys(p).length > 0) || e.occurrences.some((o) => Object.keys(o).length > 0)
export function toEduInput(f: EduForm) {
  return {
    memberProfiles: f.memberProfiles.map((p) => ({ memberId: p.memberId, canReadWrite: p.canReadWrite, attendsSchool: p.attendsSchool, educationLevelId: p.educationLevelId })),
    programOccurrences: f.programOccurrences.map((o) => ({ memberId: o.memberId, date: o.date, effectId: o.effectId, isSuspensionRequested: o.isSuspensionRequested })),
  }
}

// ================= Saúde (por membro) =================
export type DeficiencyRow = { memberId: string; deficiencyTypeId: string; needsConstantCare: boolean; responsibleCaregiverName: string }
export const emptyDeficiency = (): DeficiencyRow => ({ memberId: '', deficiencyTypeId: '', needsConstantCare: false, responsibleCaregiverName: '' })
export type GestatingRow = { memberId: string; monthsGestation: string; startedPrenatalCare: boolean }
export const emptyGestating = (): GestatingRow => ({ memberId: '', monthsGestation: '0', startedPrenatalCare: false })

export type HealthForm = { foodInsecurity: boolean; deficiencies: DeficiencyRow[]; gestatingMembers: GestatingRow[]; constantCareNeeds: string[] }
export const emptyHealth = (): HealthForm => ({ foodInsecurity: false, deficiencies: [], gestatingMembers: [], constantCareNeeds: [] })
export const healthFromData = (d: HealthStatusData): HealthForm => ({
  foodInsecurity: d.foodInsecurity,
  deficiencies: d.deficiencies.map((x) => ({ memberId: x.memberId, deficiencyTypeId: x.deficiencyTypeId, needsConstantCare: x.needsConstantCare, responsibleCaregiverName: x.responsibleCaregiverName ?? '' })),
  gestatingMembers: d.gestatingMembers.map((g) => ({ memberId: g.memberId, monthsGestation: String(g.monthsGestation), startedPrenatalCare: g.startedPrenatalCare })),
  constantCareNeeds: [...d.constantCareNeeds],
})

export type DeficiencyErr = Partial<Record<'memberId' | 'deficiencyTypeId', PatientsTag>>
export type GestatingErr = Partial<Record<'memberId' | 'monthsGestation', PatientsTag>>
export type HealthErrors = Readonly<{ deficiencies: readonly DeficiencyErr[]; gestating: readonly GestatingErr[] }>
const monthsInvalid = (s: string): boolean => {
  const n = Number(s)
  return s.trim() === '' || !Number.isInteger(n) || n < 0 || n > 12
}
export function validateHealth(f: HealthForm): HealthErrors {
  return {
    deficiencies: f.deficiencies.map((x) => {
      const e: DeficiencyErr = {}
      if (x.memberId.trim() === '') e.memberId = 'register.field.required'
      if (x.deficiencyTypeId.trim() === '') e.deficiencyTypeId = 'register.field.required'
      return e
    }),
    gestating: f.gestatingMembers.map((g) => {
      const e: GestatingErr = {}
      if (g.memberId.trim() === '') e.memberId = 'register.field.required'
      if (monthsInvalid(g.monthsGestation)) e.monthsGestation = 'assessment.field.number'
      return e
    }),
  }
}
export const healthHasErrors = (e: HealthErrors): boolean =>
  e.deficiencies.some((x) => Object.keys(x).length > 0) || e.gestating.some((g) => Object.keys(g).length > 0)
export function toHealthInput(f: HealthForm) {
  return {
    foodInsecurity: f.foodInsecurity,
    deficiencies: f.deficiencies.map((x) => ({
      memberId: x.memberId,
      deficiencyTypeId: x.deficiencyTypeId,
      needsConstantCare: x.needsConstantCare,
      ...(x.responsibleCaregiverName.trim() ? { responsibleCaregiverName: x.responsibleCaregiverName.trim() } : {}),
    })),
    gestatingMembers: f.gestatingMembers.map((g) => ({ memberId: g.memberId, monthsGestation: Number(g.monthsGestation), startedPrenatalCare: g.startedPrenatalCare })),
    constantCareNeeds: f.constantCareNeeds.map((s) => s.trim()).filter((s) => s !== ''),
  }
}

export const hasErrors = (e: Record<string, unknown>): boolean => Object.keys(e).length > 0
