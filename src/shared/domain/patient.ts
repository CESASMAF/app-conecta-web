// Tipos de domínio do paciente — COMPARTILHADOS entre BFF (server/external) e client. PUROS (sem Solid).
// Em `shared/` para o adapter outbound (external/) poder usá-los sem violar boundaries (external ∌ modules).
// As TRÊS situações que o domínio do social-care conhece — `Domain/Registry/ValueObjects/
// PatientStatus.swift`: `waitlisted`, `active`, `discharged`. Nada além disto existe.
//
// Havia `ADMITTED` e `WITHDRAWN` nesta lista, e eles NUNCA foram situações: são os nomes das
// AÇÕES de ciclo de vida (`admit`, `withdraw`). Olhando `PatientLifecycle.swift`, `admit` leva
// de `waitlisted` para `active` e `withdraw` leva de `waitlisted` para `discharged` — nenhuma
// transição produz um estado com esses nomes. O select de situação oferecia dois filtros que
// nenhum paciente jamais teria, e o upstream respondia `QLP-003` (422) a quem os escolhesse.
//
// A CAIXA é do app (MAIÚSCULO); o upstream fala minúsculo. A tradução é do adapter, nos dois
// sentidos — ver `toUpstreamStatus`/`fromUpstreamStatus` em `external/social-care-client.ts`.
export const PATIENT_STATUSES = ['WAITLISTED', 'ACTIVE', 'DISCHARGED'] as const
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
