// Tipos de LEITURA do Cuidado Clínico + Proteção (US5) — COMPARTILHADOS BFF↔client. PUROS.
// Extraídos do agregado do social-care (`GET /patients/:id`). Datas como string (formatadas na view).
export type AppointmentData = Readonly<{
  id: string
  date: string
  professionalId: string
  type: string
  summary: string
  actionPlan: string
}>

export type ProgramLinkData = Readonly<{ programId: string; observation: string | null }>
export type IntakeData = Readonly<{
  ingressTypeId: string
  originName: string | null
  originContact: string | null
  serviceReason: string
  linkedSocialPrograms: readonly ProgramLinkData[]
}>

export type PlacementRegistryData = Readonly<{ id: string; memberId: string; startDate: string; endDate: string | null; reason: string }>
export type PlacementData = Readonly<{
  individualPlacements: readonly PlacementRegistryData[]
  homeLossReport: string | null
  thirdPartyGuardReport: string | null
  adultInPrison: boolean
  adolescentInInternment: boolean
}>

export type ViolationData = Readonly<{
  id: string
  reportDate: string
  incidentDate: string | null
  victimId: string
  violationType: string
  descriptionOfFact: string
  actionsTaken: string
}>

export type ReferralData = Readonly<{
  id: string
  date: string
  professionalId: string
  referredPersonId: string
  destinationService: string
  reason: string
  status: string
}>

export type PatientCare = Readonly<{
  appointments: readonly AppointmentData[]
  intakeInfo: IntakeData | null
  placementHistory: PlacementData | null
  violationReports: readonly ViolationData[]
  referrals: readonly ReferralData[]
}>

// Trilha de auditoria (read-only). Sem `payload` — pode conter PII (LGPD); o client não o exibe.
export type AuditEntry = Readonly<{
  id: string
  eventType: string
  actorId: string | null
  occurredAt: string
  recordedAt: string
}>
