// Tipos da visão composta do paciente (overview view-ready) — COMPARTILHADOS entre o BFF (composição em
// server/composition/patient-overview.compose.ts) e o client (prontuário). PUROS (sem Solid). O servidor
// resolve código→rótulo e calcula as ações; o client só exibe.
import type { PatientStatus } from './patient'

export type LifecycleAction = 'admit' | 'discharge' | 'readmit' | 'withdraw'
export type AvailableTransition = Readonly<{ action: LifecycleAction; label: string; requiresReason: boolean }>
export type FamilyMemberView = Readonly<{
  memberPersonId: string
  fullName: string // nome resolvido no people-context (vazio se a origem secundária estiver fora → partial)
  relationshipLabel: string
  isResiding: boolean
  isPrimaryCaregiver: boolean
}>
export type PatientOverview = Readonly<{
  patientId: string
  personId: string
  fullName: string
  status: PatientStatus
  statusLabel: string
  availableTransitions: readonly AvailableTransition[]
  socialIdentity: Readonly<{ typeId: string; typeLabel: string; description: string | null }> | null
  family: Readonly<{ members: readonly FamilyMemberView[]; primaryCaregiverId: string | null }>
  partial: boolean
}>
