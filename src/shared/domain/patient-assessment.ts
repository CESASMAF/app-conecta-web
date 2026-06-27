// Tipos de LEITURA das seções de Avaliação Social — COMPARTILHADOS entre o BFF (extrai do agregado) e o
// client (pré-preenche o formulário). PUROS. Cada seção presente = preenchida; `null` = pendente.
export type HousingConditionData = Readonly<{
  type: string
  wallMaterial: string
  waterSupply: string
  electricityAccess: string
  sewageDisposal: string
  wasteCollection: string
  accessibilityLevel: string
  numberOfRooms: number
  numberOfBedrooms: number
  numberOfBathrooms: number
  hasPipedWater: boolean
  isInGeographicRiskArea: boolean
  hasDifficultAccess: boolean
  isInSocialConflictArea: boolean
  hasDiagnosticObservations: boolean
}>

export type BenefitData = Readonly<{ benefitName: string; amount: number; beneficiaryId: string; benefitTypeId?: string }>

export type SocioEconomicData = Readonly<{
  totalFamilyIncome: number
  incomePerCapita: number
  receivesSocialBenefit: boolean
  socialBenefits: readonly BenefitData[]
  mainSourceOfIncome: string
  hasUnemployed: boolean
}>

export type CommunitySupportData = Readonly<{
  hasRelativeSupport: boolean
  hasNeighborSupport: boolean
  familyConflicts: string
  patientParticipatesInGroups: boolean
  familyParticipatesInGroups: boolean
  patientHasAccessToLeisure: boolean
  facesDiscrimination: boolean
}>

export type SocialHealthSummaryData = Readonly<{
  requiresConstantCare: boolean
  hasMobilityImpairment: boolean
  functionalDependencies: readonly string[]
  hasRelevantDrugTherapy: boolean
}>

// Seções por-membro (listas indexadas por membro da família).
export type IncomeData = Readonly<{ memberId: string; occupationId: string; hasWorkCard: boolean; monthlyAmount: number }>
export type WorkAndIncomeData = Readonly<{
  hasRetiredMembers: boolean
  individualIncomes: readonly IncomeData[]
  socialBenefits: readonly BenefitData[]
}>

export type EduProfileData = Readonly<{ memberId: string; canReadWrite: boolean; attendsSchool: boolean; educationLevelId: string }>
export type ProgramOccurrenceData = Readonly<{ memberId: string; date: string; effectId: string; isSuspensionRequested: boolean }>
export type EducationalStatusData = Readonly<{
  memberProfiles: readonly EduProfileData[]
  programOccurrences: readonly ProgramOccurrenceData[]
}>

export type DeficiencyData = Readonly<{ memberId: string; deficiencyTypeId: string; needsConstantCare: boolean; responsibleCaregiverName: string | null }>
export type GestatingData = Readonly<{ memberId: string; monthsGestation: number; startedPrenatalCare: boolean }>
export type HealthStatusData = Readonly<{
  foodInsecurity: boolean
  deficiencies: readonly DeficiencyData[]
  gestatingMembers: readonly GestatingData[]
  constantCareNeeds: readonly string[]
}>

export type PatientAssessment = Readonly<{
  housingCondition: HousingConditionData | null
  socioeconomicSituation: SocioEconomicData | null
  workAndIncome: WorkAndIncomeData | null
  educationalStatus: EducationalStatusData | null
  healthStatus: HealthStatusData | null
  communitySupportNetwork: CommunitySupportData | null
  socialHealthSummary: SocialHealthSummaryData | null
}>

export type AssessmentSectionKey = keyof PatientAssessment
