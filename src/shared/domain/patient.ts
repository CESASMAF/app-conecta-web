// Tipos de domínio do paciente — COMPARTILHADOS entre BFF (server/external) e client. PUROS (sem Solid).
// Em `shared/` para o adapter outbound (external/) poder usá-los sem violar boundaries (external ∌ modules).
export const PATIENT_STATUSES = ['ACTIVE', 'WAITLISTED', 'ADMITTED', 'DISCHARGED', 'WITHDRAWN'] as const
export type PatientStatus = (typeof PATIENT_STATUSES)[number]

export const isPatientStatus = (v: string): v is PatientStatus =>
  (PATIENT_STATUSES as readonly string[]).includes(v)

export type PatientSummary = Readonly<{
  patientId: string
  fullName: string
  primaryDiagnosis: string | null
  memberCount: number
  status: PatientStatus
}>

export type PageMeta = Readonly<{
  pageSize: number
  totalCount: number
  hasMore: boolean
  nextCursor: string | null
}>

export type PatientPage = Readonly<{ items: readonly PatientSummary[]; meta: PageMeta }>

// Cabeçalho mínimo p/ o detalhe-stub. O agregado completo (computedAnalytics, avaliações…) = feature 003.
export type PatientHeader = Readonly<{ patientId: string; fullName: string; status: PatientStatus }>
