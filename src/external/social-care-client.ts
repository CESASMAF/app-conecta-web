// Adapter HTTP outbound ao social-care (server-only — Princ. I). `fetch` nativo + Bearer da sessão +
// timeout (`withTimeout`). Erros como VALOR (Princ. II): devolve `Result<T, AppError>`, nunca lança.
// POLÍTICA DE ATOR: social-care deriva o ator do JWT.sub (ADR-023) — o BFF injeta SÓ o Bearer, NUNCA
// header de ator (≠ people-context). Porta injetável em `AppDeps` → fakeada nos contract tests.
import { env } from '~/server/env'
import { ok, err, type Result } from '~/shared/http/result'
import type { AppError } from '~/shared/http/app-error'
import { toUpstreamError, toTransportError } from '~/shared/http/upstream-error'
import type { PaginatedResponse, StandardResponse } from '~/shared/http/envelope'
import { withTimeout } from '~/shared/with-timeout'
import type { PatientPage, PatientHeader, PatientSummary, PatientStatus } from '~/shared/domain/patient'
import type { DomainCatalogItem, DomainTable } from '~/shared/domain/domain-catalog'
import type { PatientAssessment } from '~/shared/domain/patient-assessment'
import type { PatientCare } from '~/shared/domain/patient-care'

const TIMEOUT_MS = 8_000

export type PatientListParams = Readonly<{
  search?: string
  status?: string
  limit: number
  cursor?: string
}>

// Subconjunto do agregado de leitura (PatientResponse) que a composição do overview consome.
export type FamilyMemberDetail = Readonly<{
  personId: string
  relationshipId: string
  isPrimaryCaregiver: boolean
  residesWithPatient: boolean
  hasDisability: boolean
  birthDate: string
}>
export type PatientDetail = Readonly<{
  patientId: string
  personId: string
  fullName: string
  status: PatientStatus
  socialIdentity: Readonly<{ typeId: string; otherDescription: string | null }> | null
  familyMembers: readonly FamilyMemberDetail[]
}>

// Payloads de escrita (validados no BFF via TypeBox antes de chegar aqui).
export type DischargeInput = Readonly<{ reason: string; notes?: string }>
export type WithdrawInput = Readonly<{ reason: string; notes?: string }>
export type ReadmitInput = Readonly<{ notes?: string }>
export type AddFamilyMemberInput = Readonly<{
  memberPersonId: string
  relationship: string
  isResiding: boolean
  isCaregiver: boolean
  hasDisability: boolean
  requiredDocuments: readonly string[]
  birthDate: string
  prRelationshipId: string
}>
export type UpdateSocialIdentityInput = Readonly<{ typeId: string; description?: string }>

// Cadastro de paciente (POST /patients) — payload grande. Validado no BFF (TypeBox) antes de chegar aqui.
export type DiagnosisInput = Readonly<{ icdCode: string; date: string; description: string }>
export type PersonalDataInput = Readonly<{
  firstName: string
  lastName: string
  motherName: string
  nationality: string
  sex: string
  socialName?: string
  birthDate: string
  phone?: string
}>
export type CivilDocumentsInput = Readonly<{
  cpf?: string
  nis?: string
  rgDocument?: Readonly<{ number: string; issuingState: string; issuingAgency: string; issueDate: string }>
  cns?: Readonly<{ number: string; cpf: string; qrCode?: string }>
}>
export type AddressInput = Readonly<{
  cep?: string
  isShelter: boolean
  isHomeless?: boolean
  residenceLocation: string
  street?: string
  neighborhood?: string
  number?: string
  complement?: string
  state: string
  city: string
}>
export type RegisterPatientInput = Readonly<{
  personId: string
  initialDiagnoses: readonly DiagnosisInput[]
  personalData?: PersonalDataInput
  civilDocuments?: CivilDocumentsInput
  address?: AddressInput
  socialIdentity?: Readonly<{ typeId: string; description?: string }>
  prRelationshipId: string
}>

// Seções de Avaliação Social (7 PUTs). O corpo é validado no BFF (TypeBox por seção); o adapter só
// transporta (passthrough) — a fonte de verdade do contrato é o schema da rota (ADR-0010).
export type AssessmentSection =
  | 'housing-condition'
  | 'socioeconomic-situation'
  | 'work-and-income'
  | 'educational-status'
  | 'health-status'
  | 'community-support-network'
  | 'social-health-summary'

// Cuidado Clínico
export type AppointmentInput = Readonly<{ professionalId: string; summary?: string; actionPlan?: string; type?: string; date?: string }>
export type ProgramLinkInput = Readonly<{ programId: string; observation?: string }>
export type IntakeInfoInput = Readonly<{
  ingressTypeId: string
  originName?: string
  originContact?: string
  serviceReason: string
  linkedSocialPrograms: readonly ProgramLinkInput[]
}>

// Proteção de Direitos
export type PlacementHistoryInput = Readonly<{
  registries: readonly Readonly<{ memberId: string; startDate: string; endDate?: string; reason: string }>[]
  collectiveSituations: Readonly<{ homeLossReport?: string; thirdPartyGuardReport?: string }>
  separationChecklist: Readonly<{ adultInPrison: boolean; adolescentInInternment: boolean }>
}>
export type ViolationReportInput = Readonly<{
  victimId: string
  violationType: string
  violationTypeId?: string
  reportDate?: string
  incidentDate?: string
  descriptionOfFact: string
  actionsTaken?: string
}>
export type ReferralInput = Readonly<{
  referredPersonId: string
  professionalId?: string
  destinationService: string
  reason: string
  date?: string
}>

// Domínios & Governança (admin)
export type CreateLookupItemInput = Readonly<{
  codigo: string
  descricao: string
  exigeRegistroNascimento?: boolean
  exigeCpfFalecido?: boolean
  exigeDescricao?: boolean
}>
export type LookupRequestInput = Readonly<{ tableName: string; codigo: string; descricao: string; justificativa: string }>
export type LookupRequest = Readonly<{
  id: string
  tableName: string
  codigo: string
  descricao: string
  justificativa: string
  status: string
  requestedBy: string
  requestedAt: string
  reviewedBy: string | null
  reviewedAt: string | null
  reviewNote: string | null
}>

// Auditoria
export type AuditTrailEntry = Readonly<{
  id: string
  aggregateId: string
  eventType: string
  actorId: string | null
  payload: unknown
  occurredAt: string
  recordedAt: string
}>
export type AuditTrailParams = Readonly<{ eventType?: string; limit?: number; offset?: number }>

export interface SocialCareClient {
  // leitura (002 + agregado)
  listPatients(token: string, params: PatientListParams): Promise<Result<PatientPage, AppError>>
  getPatientHeader(token: string, patientId: string): Promise<Result<PatientHeader, AppError>>
  getPatientDetail(token: string, patientId: string): Promise<Result<PatientDetail, AppError>>
  getPatientAssessment(token: string, patientId: string): Promise<Result<PatientAssessment, AppError>>
  getPatientCare(token: string, patientId: string): Promise<Result<PatientCare, AppError>>
  listDomain(token: string, table: DomainTable): Promise<Result<readonly DomainCatalogItem[], AppError>>
  // cadastro (cria o paciente em WAITLISTED; ator do JWT.sub — sem header)
  createPatient(token: string, input: RegisterPatientInput): Promise<Result<{ id: string }, AppError>>
  // ciclo de vida (sem corpo / com motivo). Ator do JWT.sub — sem header de ator.
  admitPatient(token: string, patientId: string): Promise<Result<void, AppError>>
  dischargePatient(token: string, patientId: string, input: DischargeInput): Promise<Result<void, AppError>>
  readmitPatient(token: string, patientId: string, input: ReadmitInput): Promise<Result<void, AppError>>
  withdrawPatient(token: string, patientId: string, input: WithdrawInput): Promise<Result<void, AppError>>
  // núcleo familiar + identidade social
  addFamilyMember(token: string, patientId: string, input: AddFamilyMemberInput): Promise<Result<void, AppError>>
  removeFamilyMember(token: string, patientId: string, memberId: string): Promise<Result<void, AppError>>
  setPrimaryCaregiver(token: string, patientId: string, memberPersonId: string): Promise<Result<void, AppError>>
  updateSocialIdentity(token: string, patientId: string, input: UpdateSocialIdentityInput): Promise<Result<void, AppError>>
  // avaliação social (7 seções) — corpo validado no BFF; passthrough no adapter
  updateAssessment(token: string, patientId: string, section: AssessmentSection, body: unknown): Promise<Result<void, AppError>>
  // cuidado clínico
  registerAppointment(token: string, patientId: string, input: AppointmentInput): Promise<Result<{ id: string }, AppError>>
  updateIntakeInfo(token: string, patientId: string, input: IntakeInfoInput): Promise<Result<void, AppError>>
  // proteção de direitos
  updatePlacementHistory(token: string, patientId: string, input: PlacementHistoryInput): Promise<Result<void, AppError>>
  reportViolation(token: string, patientId: string, input: ViolationReportInput): Promise<Result<{ id: string }, AppError>>
  createReferral(token: string, patientId: string, input: ReferralInput): Promise<Result<{ id: string }, AppError>>
  // domínios & governança (admin)
  createLookupItem(token: string, table: DomainTable, input: CreateLookupItemInput): Promise<Result<{ id: string }, AppError>>
  updateLookupItem(token: string, table: DomainTable, itemId: string, descricao: string): Promise<Result<void, AppError>>
  toggleLookupItem(token: string, table: DomainTable, itemId: string): Promise<Result<void, AppError>>
  createLookupRequest(token: string, input: LookupRequestInput): Promise<Result<{ id: string }, AppError>>
  listLookupRequests(token: string, status?: string): Promise<Result<readonly LookupRequest[], AppError>>
  approveLookupRequest(token: string, requestId: string): Promise<Result<void, AppError>>
  rejectLookupRequest(token: string, requestId: string, reviewNote: string): Promise<Result<void, AppError>>
  // auditoria
  getAuditTrail(token: string, patientId: string, params: AuditTrailParams): Promise<Result<readonly AuditTrailEntry[], AppError>>
}

// GET autenticado genérico. Devolve o corpo cru (unknown) em sucesso, ou AppError mapeado.
async function get(baseUrl: string, token: string, path: string): Promise<Result<unknown, AppError>> {
  let res: Response
  try {
    res = await withTimeout(
      fetch(`${baseUrl}${path}`, {
        headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
      }),
      TIMEOUT_MS,
    )
  } catch {
    return err(toTransportError()) // fetch rejeitou / timeout → dependência fora
  }
  let body: unknown = null
  try {
    body = await res.json()
  } catch {
    /* corpo vazio/não-JSON: body permanece null */
  }
  if (!res.ok) return err(toUpstreamError(res.status, body))
  return ok(body)
}

// Mutação autenticada (POST/PUT/DELETE). Bearer só — SEM header de ator (ADR-023). Devolve void em sucesso.
async function mutate(
  baseUrl: string,
  token: string,
  method: string,
  path: string,
  body?: unknown,
): Promise<Result<void, AppError>> {
  const headers: Record<string, string> = { authorization: `Bearer ${token}`, accept: 'application/json' }
  if (body !== undefined) headers['content-type'] = 'application/json'
  let res: Response
  try {
    res = await withTimeout(
      fetch(`${baseUrl}${path}`, { method, headers, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) }),
      TIMEOUT_MS,
    )
  } catch {
    return err(toTransportError())
  }
  if (!res.ok) {
    let b: unknown = null
    try {
      b = await res.json()
    } catch {
      /* corpo vazio */
    }
    return err(toUpstreamError(res.status, b))
  }
  return ok(undefined)
}

// POST que CRIA e devolve {id} (envelope {data:{id}}). Bearer só — sem header de ator. Reusável.
async function createVia(baseUrl: string, token: string, path: string, body: unknown): Promise<Result<{ id: string }, AppError>> {
  let res: Response
  try {
    res = await withTimeout(
      fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, accept: 'application/json', 'content-type': 'application/json' },
        body: JSON.stringify(body),
      }),
      TIMEOUT_MS,
    )
  } catch {
    return err(toTransportError())
  }
  let b: unknown = null
  try {
    b = await res.json()
  } catch {
    /* corpo vazio */
  }
  if (!res.ok) return err(toUpstreamError(res.status, b))
  return ok({ id: (b as StandardResponse<{ id: string }>).data.id })
}

// Normaliza o status do agregado (lowercase no backend) para o enum do app (UPPERCASE).
function normStatus(raw: string): PatientStatus {
  return raw.toUpperCase() as PatientStatus
}

// baseUrl injetável (default = env) — permite testar o adapter contra um stub HTTP em `tests/`.
export function createSocialCareClient(baseUrl: string = env.socialCareUrl): SocialCareClient {
  const fetchJson = (token: string, path: string) => get(baseUrl, token, path)
  const pid = (id: string) => encodeURIComponent(id)

  return {
    async listPatients(token, params) {
      const qs = new URLSearchParams()
      if (params.search) qs.set('search', params.search)
      if (params.status) qs.set('status', params.status)
      qs.set('limit', String(params.limit))
      if (params.cursor) qs.set('cursor', params.cursor)
      const r = await fetchJson(token, `/api/v1/patients?${qs.toString()}`)
      if (!r.ok) return r
      const body = r.value as PaginatedResponse<PatientSummary>
      return ok({
        items: body.data,
        meta: {
          pageSize: body.meta.pageSize,
          totalCount: body.meta.totalCount,
          hasMore: body.meta.hasMore,
          nextCursor: body.meta.nextCursor,
        },
      })
    },

    async getPatientHeader(token, patientId) {
      const r = await fetchJson(token, `/api/v1/patients/${pid(patientId)}`)
      if (!r.ok) return r
      const data = (r.value as StandardResponse<PatientHeader>).data
      return ok({ patientId: data.patientId, fullName: data.fullName, status: data.status })
    },

    async getPatientDetail(token, patientId) {
      const r = await fetchJson(token, `/api/v1/patients/${pid(patientId)}`)
      if (!r.ok) return r
      const d = (r.value as StandardResponse<{
        patientId: string
        personId: string
        status: string
        personalData: { firstName: string; lastName: string } | null
        socialIdentity: { typeId: string; otherDescription: string | null } | null
        familyMembers: readonly FamilyMemberDetail[]
      }>).data
      const pd = d.personalData
      return ok({
        patientId: d.patientId,
        personId: d.personId,
        fullName: pd ? `${pd.firstName} ${pd.lastName}`.trim() : '',
        status: normStatus(d.status),
        socialIdentity: d.socialIdentity ?? null,
        familyMembers: d.familyMembers ?? [],
      })
    },

    // Lê as 7 seções de avaliação do MESMO agregado (GET /patients/:id): presente = preenchida, null = pendente.
    async getPatientAssessment(token, patientId) {
      const r = await fetchJson(token, `/api/v1/patients/${pid(patientId)}`)
      if (!r.ok) return r
      const d = (r.value as StandardResponse<Record<string, unknown>>).data
      return ok({
        housingCondition: (d.housingCondition ?? null) as PatientAssessment['housingCondition'],
        socioeconomicSituation: (d.socioeconomicSituation ?? null) as PatientAssessment['socioeconomicSituation'],
        workAndIncome: (d.workAndIncome ?? null) as PatientAssessment['workAndIncome'],
        educationalStatus: (d.educationalStatus ?? null) as PatientAssessment['educationalStatus'],
        healthStatus: (d.healthStatus ?? null) as PatientAssessment['healthStatus'],
        communitySupportNetwork: (d.communitySupportNetwork ?? null) as PatientAssessment['communitySupportNetwork'],
        socialHealthSummary: (d.socialHealthSummary ?? null) as PatientAssessment['socialHealthSummary'],
      })
    },

    // Lê Cuidado Clínico + Proteção do MESMO agregado (GET /patients/:id). Listas vazias / null quando ausentes.
    async getPatientCare(token, patientId) {
      const r = await fetchJson(token, `/api/v1/patients/${pid(patientId)}`)
      if (!r.ok) return r
      const d = (r.value as StandardResponse<Record<string, unknown>>).data
      const arr = <T>(v: unknown): readonly T[] => (Array.isArray(v) ? (v as T[]) : [])
      return ok({
        appointments: arr<PatientCare['appointments'][number]>(d.appointments),
        intakeInfo: (d.intakeInfo ?? null) as PatientCare['intakeInfo'],
        placementHistory: (d.placementHistory ?? null) as PatientCare['placementHistory'],
        violationReports: arr<PatientCare['violationReports'][number]>(d.violationReports),
        referrals: arr<PatientCare['referrals'][number]>(d.referrals),
      })
    },

    async listDomain(token, table) {
      const r = await fetchJson(token, `/api/v1/dominios/${table}`)
      if (!r.ok) return r
      const items = (r.value as StandardResponse<readonly DomainCatalogItem[]>).data
      return ok(items)
    },

    createPatient: (token, input) => createVia(baseUrl, token, '/api/v1/patients', input),

    admitPatient: (token, patientId) => mutate(baseUrl, token, 'POST', `/api/v1/patients/${pid(patientId)}/admit`),
    dischargePatient: (token, patientId, input) =>
      mutate(baseUrl, token, 'POST', `/api/v1/patients/${pid(patientId)}/discharge`, input),
    readmitPatient: (token, patientId, input) =>
      mutate(baseUrl, token, 'POST', `/api/v1/patients/${pid(patientId)}/readmit`, input),
    withdrawPatient: (token, patientId, input) =>
      mutate(baseUrl, token, 'POST', `/api/v1/patients/${pid(patientId)}/withdraw`, input),
    addFamilyMember: (token, patientId, input) =>
      mutate(baseUrl, token, 'POST', `/api/v1/patients/${pid(patientId)}/family-members`, input),
    removeFamilyMember: (token, patientId, memberId) =>
      mutate(baseUrl, token, 'DELETE', `/api/v1/patients/${pid(patientId)}/family-members/${pid(memberId)}`),
    setPrimaryCaregiver: (token, patientId, memberPersonId) =>
      mutate(baseUrl, token, 'PUT', `/api/v1/patients/${pid(patientId)}/primary-caregiver`, { memberPersonId }),
    updateSocialIdentity: (token, patientId, input) =>
      mutate(baseUrl, token, 'PUT', `/api/v1/patients/${pid(patientId)}/social-identity`, input),
    updateAssessment: (token, patientId, section, body) =>
      mutate(baseUrl, token, 'PUT', `/api/v1/patients/${pid(patientId)}/${section}`, body),
    registerAppointment: (token, patientId, input) =>
      createVia(baseUrl, token, `/api/v1/patients/${pid(patientId)}/appointments`, input),
    updateIntakeInfo: (token, patientId, input) =>
      mutate(baseUrl, token, 'PUT', `/api/v1/patients/${pid(patientId)}/intake-info`, input),
    updatePlacementHistory: (token, patientId, input) =>
      mutate(baseUrl, token, 'PUT', `/api/v1/patients/${pid(patientId)}/placement-history`, input),
    reportViolation: (token, patientId, input) =>
      createVia(baseUrl, token, `/api/v1/patients/${pid(patientId)}/violation-reports`, input),
    createReferral: (token, patientId, input) =>
      createVia(baseUrl, token, `/api/v1/patients/${pid(patientId)}/referrals`, input),
    createLookupItem: (token, table, input) => createVia(baseUrl, token, `/api/v1/dominios/${table}`, input),
    updateLookupItem: (token, table, itemId, descricao) =>
      mutate(baseUrl, token, 'PUT', `/api/v1/dominios/${table}/${pid(itemId)}`, { descricao }),
    toggleLookupItem: (token, table, itemId) =>
      mutate(baseUrl, token, 'PATCH', `/api/v1/dominios/${table}/${pid(itemId)}/toggle`),
    createLookupRequest: (token, input) => createVia(baseUrl, token, '/api/v1/dominios/requests', input),
    async listLookupRequests(token, status) {
      const r = await fetchJson(token, `/api/v1/dominios/requests${status ? `?status=${encodeURIComponent(status)}` : ''}`)
      if (!r.ok) return r
      return ok((r.value as StandardResponse<readonly LookupRequest[]>).data)
    },
    approveLookupRequest: (token, requestId) =>
      mutate(baseUrl, token, 'PUT', `/api/v1/dominios/requests/${pid(requestId)}/approve`),
    rejectLookupRequest: (token, requestId, reviewNote) =>
      mutate(baseUrl, token, 'PUT', `/api/v1/dominios/requests/${pid(requestId)}/reject`, { reviewNote }),
    async getAuditTrail(token, patientId, params) {
      const qs = new URLSearchParams()
      if (params.eventType) qs.set('eventType', params.eventType)
      if (params.limit !== undefined) qs.set('limit', String(params.limit))
      if (params.offset !== undefined) qs.set('offset', String(params.offset))
      const r = await fetchJson(token, `/api/v1/patients/${pid(patientId)}/audit-trail?${qs}`)
      if (!r.ok) return r
      return ok((r.value as StandardResponse<readonly AuditTrailEntry[]>).data)
    },
  }
}
