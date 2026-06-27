// Fake configurável da porta SocialCareClient + fixtures (FIXTURE em tests/ — Princ. VI permite).
// Os contract tests injetam isto em makeApp(fake) e afirmam orquestração/Bearer/envelope/erros.
// `calls.commands` registra as mutações disparadas (admit/discharge/family/…) para asserções.
import { ok, type Result } from '~/shared/http/result'
import type { AppError } from '~/shared/http/app-error'
import type { SocialCareClient, PatientListParams, PatientDetail, RegisterPatientInput } from '~/external/social-care-client'
import type { PatientPage, PatientSummary, PatientHeader } from '~/shared/domain/patient'
import type { DomainCatalogItem, DomainTable } from '~/shared/domain/domain-catalog'
import type { PatientAssessment } from '~/shared/domain/patient-assessment'
import type { PatientCare } from '~/shared/domain/patient-care'

const emptyCare = (): PatientCare => ({ appointments: [], intakeInfo: null, placementHistory: null, violationReports: [], referrals: [] })

const emptyAssessment = (): PatientAssessment => ({
  housingCondition: null,
  socioeconomicSituation: null,
  workAndIncome: null,
  educationalStatus: null,
  healthStatus: null,
  communitySupportNetwork: null,
  socialHealthSummary: null,
})

export type SocialCareCalls = Readonly<{
  tokens: string[]
  listParams: PatientListParams[]
  domainTables: DomainTable[]
  commands: string[]
}>

export type FakeConfig = Partial<{
  patients: (token: string, params: PatientListParams) => Promise<Result<PatientPage, AppError>>
  header: (token: string, id: string) => Promise<Result<PatientHeader, AppError>>
  detail: (token: string, id: string) => Promise<Result<PatientDetail, AppError>>
  assessment: (token: string, id: string) => Promise<Result<PatientAssessment, AppError>>
  care: (token: string, id: string) => Promise<Result<PatientCare, AppError>>
  domain: (token: string, table: DomainTable) => Promise<Result<readonly DomainCatalogItem[], AppError>>
  create: (token: string, input: RegisterPatientInput) => Promise<Result<{ id: string }, AppError>>
  // resultado das mutações (default ok); recebe o nome do comando para simular erro de estado por comando.
  onMutate: (command: string) => Result<void, AppError>
}>

export function makeFakeSocialCare(cfg: FakeConfig = {}): SocialCareClient & { calls: SocialCareCalls } {
  const calls = {
    tokens: [] as string[],
    listParams: [] as PatientListParams[],
    domainTables: [] as DomainTable[],
    commands: [] as string[],
  }
  const command = (token: string, name: string): Result<void, AppError> => {
    calls.tokens.push(token)
    calls.commands.push(name)
    return cfg.onMutate ? cfg.onMutate(name) : ok(undefined)
  }
  return {
    calls,
    async listPatients(token, params) {
      calls.tokens.push(token)
      calls.listParams.push(params)
      return cfg.patients ? cfg.patients(token, params) : ok(pageOf(fakePatients(params.limit), params.limit, null))
    },
    async getPatientHeader(token, id) {
      calls.tokens.push(token)
      return cfg.header ? cfg.header(token, id) : ok({ patientId: id, fullName: 'Paciente Teste', status: 'ACTIVE' })
    },
    async getPatientDetail(token, id) {
      calls.tokens.push(token)
      return cfg.detail
        ? cfg.detail(token, id)
        : ok({
            patientId: id,
            personId: 'person-1',
            fullName: 'Maria Teste',
            status: 'WAITLISTED',
            socialIdentity: { typeId: 'ti-1', otherDescription: null },
            familyMembers: [
              { personId: 'm-1', relationshipId: 'rel-1', isPrimaryCaregiver: true, residesWithPatient: true, hasDisability: false, birthDate: '1980-01-01' },
            ],
          })
    },
    async getPatientAssessment(token, id) {
      calls.tokens.push(token)
      return cfg.assessment ? cfg.assessment(token, id) : ok(emptyAssessment())
    },
    async getPatientCare(token, id) {
      calls.tokens.push(token)
      return cfg.care ? cfg.care(token, id) : ok(emptyCare())
    },
    async listDomain(token, table) {
      calls.tokens.push(token)
      calls.domainTables.push(table)
      return cfg.domain ? cfg.domain(token, table) : ok([])
    },
    async createPatient(token, input) {
      calls.tokens.push(token)
      calls.commands.push('create')
      return cfg.create ? cfg.create(token, input) : ok({ id: 'patient-1' })
    },
    async admitPatient(token) {
      return command(token, 'admit')
    },
    async dischargePatient(token) {
      return command(token, 'discharge')
    },
    async readmitPatient(token) {
      return command(token, 'readmit')
    },
    async withdrawPatient(token) {
      return command(token, 'withdraw')
    },
    async addFamilyMember(token) {
      return command(token, 'family-add')
    },
    async removeFamilyMember(token) {
      return command(token, 'family-remove')
    },
    async setPrimaryCaregiver(token) {
      return command(token, 'caregiver')
    },
    async updateSocialIdentity(token) {
      return command(token, 'social-identity')
    },
    async updateAssessment(token, _id, section) {
      return command(token, `assessment:${section}`)
    },
    async registerAppointment(token) {
      calls.tokens.push(token)
      calls.commands.push('appointment')
      const m = cfg.onMutate ? cfg.onMutate('appointment') : ok(undefined)
      return m.ok ? ok({ id: 'appt-1' }) : m
    },
    async updateIntakeInfo(token) {
      return command(token, 'intake-info')
    },
    async updatePlacementHistory(token) {
      return command(token, 'placement')
    },
    async reportViolation(token) {
      calls.tokens.push(token)
      calls.commands.push('violation')
      const m = cfg.onMutate ? cfg.onMutate('violation') : ok(undefined)
      return m.ok ? ok({ id: 'vr-1' }) : m
    },
    async createReferral(token) {
      calls.tokens.push(token)
      calls.commands.push('referral')
      const m = cfg.onMutate ? cfg.onMutate('referral') : ok(undefined)
      return m.ok ? ok({ id: 'ref-1' }) : m
    },
    async createLookupItem(token) {
      calls.tokens.push(token)
      calls.commands.push('lookup-create')
      const m = cfg.onMutate ? cfg.onMutate('lookup-create') : ok(undefined)
      return m.ok ? ok({ id: 'lkp-1' }) : m
    },
    async updateLookupItem(token) {
      return command(token, 'lookup-update')
    },
    async toggleLookupItem(token) {
      return command(token, 'lookup-toggle')
    },
    async createLookupRequest(token) {
      calls.tokens.push(token)
      calls.commands.push('request-create')
      const m = cfg.onMutate ? cfg.onMutate('request-create') : ok(undefined)
      return m.ok ? ok({ id: 'lkr-1' }) : m
    },
    async listLookupRequests(token) {
      calls.tokens.push(token)
      return ok([])
    },
    async approveLookupRequest(token) {
      return command(token, 'request-approve')
    },
    async rejectLookupRequest(token) {
      return command(token, 'request-reject')
    },
    async getAuditTrail(token) {
      calls.tokens.push(token)
      return ok([
        { id: 'a-1', aggregateId: 'p1', eventType: 'PatientCreatedEvent', actorId: 'user-1', payload: {}, occurredAt: '2025-01-01T00:00:00Z', recordedAt: '2025-01-01T00:00:01Z' },
      ])
    },
  }
}

// Fixtures (sem PII real — nomes sintéticos).
export function fakePatients(n: number, startIndex = 0): PatientSummary[] {
  return Array.from({ length: n }, (_, i) => {
    const idx = startIndex + i
    return {
      patientId: `p-${idx}`,
      fullName: `Paciente ${idx}`,
      primaryDiagnosis: 'CID-Q00',
      memberCount: idx % 4,
      status: 'ACTIVE' as const,
    }
  })
}

export function pageOf(items: PatientSummary[], totalCount: number, nextCursor: string | null): PatientPage {
  return { items, meta: { pageSize: items.length, totalCount, hasMore: nextCursor !== null, nextCursor } }
}
