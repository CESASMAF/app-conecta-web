// Setor Avaliação Social (social-care) — 7 PUTs por seção. POLÍTICA DE ATOR: ator do JWT.sub (sem header).
// A VALIDAÇÃO ESTRUTURAL de cada payload é o schema TypeBox da rota (no BFF, antes do upstream); as regras
// cruzadas de domínio (ex.: bedrooms ≤ rooms — UHC-013) ficam no backend e o BFF mapeia o erro por tag.
// Cada PUT devolve um ack de seção (o backend responde 204). CSRF vem do guard global. Erros como valor.
import { Elysia, t } from 'elysia'
import type { AppDeps } from '~/server/deps'
import { requireSession } from '~/modules/auth/server/guard'
import { SESSION_COOKIE } from '~/server/session'
import { isErr } from '~/shared/http/result'
import { statusForKind, errorBody } from '~/server/routes/error-response'
import type { AssessmentSection } from '~/external/social-care-client'

const readSid = (raw: unknown): string | undefined => (typeof raw === 'string' ? raw : undefined)
const now = () => new Date().toISOString()

const benefit = t.Object({
  benefitName: t.String({ minLength: 1 }),
  amount: t.Number({ minimum: 0 }),
  beneficiaryId: t.String({ minLength: 1 }),
  benefitTypeId: t.Optional(t.String()),
  birthCertificateNumber: t.Optional(t.String()),
  deceasedCpf: t.Optional(t.String()),
})

const SCHEMAS = {
  'housing-condition': t.Object({
    type: t.String({ minLength: 1 }),
    wallMaterial: t.String({ minLength: 1 }),
    numberOfRooms: t.Integer({ minimum: 0 }),
    numberOfBedrooms: t.Integer({ minimum: 0 }),
    numberOfBathrooms: t.Integer({ minimum: 0 }),
    waterSupply: t.String({ minLength: 1 }),
    hasPipedWater: t.Boolean(),
    electricityAccess: t.String({ minLength: 1 }),
    sewageDisposal: t.String({ minLength: 1 }),
    wasteCollection: t.String({ minLength: 1 }),
    accessibilityLevel: t.String({ minLength: 1 }),
    isInGeographicRiskArea: t.Boolean(),
    hasDifficultAccess: t.Boolean(),
    isInSocialConflictArea: t.Boolean(),
    hasDiagnosticObservations: t.Boolean(),
  }),
  'socioeconomic-situation': t.Object({
    totalFamilyIncome: t.Number({ minimum: 0 }),
    incomePerCapita: t.Number({ minimum: 0 }),
    receivesSocialBenefit: t.Boolean(),
    socialBenefits: t.Array(benefit),
    mainSourceOfIncome: t.String({ minLength: 1 }),
    hasUnemployed: t.Boolean(),
  }),
  'work-and-income': t.Object({
    individualIncomes: t.Array(
      t.Object({
        memberId: t.String({ minLength: 1 }),
        occupationId: t.String({ minLength: 1 }),
        hasWorkCard: t.Boolean(),
        monthlyAmount: t.Number({ minimum: 0 }),
      }),
    ),
    socialBenefits: t.Array(benefit),
    hasRetiredMembers: t.Boolean(),
  }),
  'educational-status': t.Object({
    memberProfiles: t.Array(
      t.Object({
        memberId: t.String({ minLength: 1 }),
        canReadWrite: t.Boolean(),
        attendsSchool: t.Boolean(),
        educationLevelId: t.String({ minLength: 1 }),
      }),
    ),
    programOccurrences: t.Array(
      t.Object({
        memberId: t.String({ minLength: 1 }),
        date: t.String(),
        effectId: t.String({ minLength: 1 }),
        isSuspensionRequested: t.Boolean(),
      }),
    ),
  }),
  'health-status': t.Object({
    deficiencies: t.Array(
      t.Object({
        memberId: t.String({ minLength: 1 }),
        deficiencyTypeId: t.String({ minLength: 1 }),
        needsConstantCare: t.Boolean(),
        responsibleCaregiverName: t.Optional(t.String()),
      }),
    ),
    gestatingMembers: t.Array(
      t.Object({
        memberId: t.String({ minLength: 1 }),
        monthsGestation: t.Integer({ minimum: 0, maximum: 12 }),
        startedPrenatalCare: t.Boolean(),
      }),
    ),
    constantCareNeeds: t.Array(t.String()),
    foodInsecurity: t.Boolean(),
  }),
  'community-support-network': t.Object({
    hasRelativeSupport: t.Boolean(),
    hasNeighborSupport: t.Boolean(),
    familyConflicts: t.String(),
    patientParticipatesInGroups: t.Boolean(),
    familyParticipatesInGroups: t.Boolean(),
    patientHasAccessToLeisure: t.Boolean(),
    facesDiscrimination: t.Boolean(),
  }),
  'social-health-summary': t.Object({
    requiresConstantCare: t.Boolean(),
    hasMobilityImpairment: t.Boolean(),
    functionalDependencies: t.Array(t.String()),
    hasRelevantDrugTherapy: t.Boolean(),
  }),
} as const

export function assessmentRoutes(deps: AppDeps) {
  const forward = async (
    token: string,
    patientId: string,
    section: AssessmentSection,
    body: unknown,
    set: { status?: number | string },
    requestId: string,
  ) => {
    const r = await deps.socialCare.updateAssessment(token, patientId, section, body)
    if (isErr(r)) {
      set.status = statusForKind(r.error.kind)
      return errorBody(r.error, requestId)
    }
    return { data: { patientId, section, updated: true }, meta: { timestamp: now() } }
  }

  return new Elysia()
    // GET — lê o estado das 7 seções (do agregado): cada uma presente=preenchida, null=pendente.
    .get('/patients/:patientId/assessment', async ({ cookie, params, set }) => {
      const requestId = crypto.randomUUID()
      set.headers['x-request-id'] = requestId
      const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
      if (!session) {
        set.status = 401
        return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
      }
      const r = await deps.socialCare.getPatientAssessment(session.accessToken, params.patientId)
      if (isErr(r)) {
        set.status = statusForKind(r.error.kind)
        return errorBody(r.error, requestId)
      }
      return { data: r.value, meta: { timestamp: now() } }
    })
    .put(
      '/patients/:patientId/housing-condition',
      async ({ cookie, params, body, set }) => {
        const requestId = crypto.randomUUID()
        set.headers['x-request-id'] = requestId
        const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
        if (!session) {
          set.status = 401
          return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
        }
        return forward(session.accessToken, params.patientId, 'housing-condition', body, set, requestId)
      },
      { body: SCHEMAS['housing-condition'] },
    )
    .put(
      '/patients/:patientId/socioeconomic-situation',
      async ({ cookie, params, body, set }) => {
        const requestId = crypto.randomUUID()
        set.headers['x-request-id'] = requestId
        const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
        if (!session) {
          set.status = 401
          return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
        }
        return forward(session.accessToken, params.patientId, 'socioeconomic-situation', body, set, requestId)
      },
      { body: SCHEMAS['socioeconomic-situation'] },
    )
    .put(
      '/patients/:patientId/work-and-income',
      async ({ cookie, params, body, set }) => {
        const requestId = crypto.randomUUID()
        set.headers['x-request-id'] = requestId
        const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
        if (!session) {
          set.status = 401
          return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
        }
        return forward(session.accessToken, params.patientId, 'work-and-income', body, set, requestId)
      },
      { body: SCHEMAS['work-and-income'] },
    )
    .put(
      '/patients/:patientId/educational-status',
      async ({ cookie, params, body, set }) => {
        const requestId = crypto.randomUUID()
        set.headers['x-request-id'] = requestId
        const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
        if (!session) {
          set.status = 401
          return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
        }
        return forward(session.accessToken, params.patientId, 'educational-status', body, set, requestId)
      },
      { body: SCHEMAS['educational-status'] },
    )
    .put(
      '/patients/:patientId/health-status',
      async ({ cookie, params, body, set }) => {
        const requestId = crypto.randomUUID()
        set.headers['x-request-id'] = requestId
        const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
        if (!session) {
          set.status = 401
          return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
        }
        return forward(session.accessToken, params.patientId, 'health-status', body, set, requestId)
      },
      { body: SCHEMAS['health-status'] },
    )
    .put(
      '/patients/:patientId/community-support-network',
      async ({ cookie, params, body, set }) => {
        const requestId = crypto.randomUUID()
        set.headers['x-request-id'] = requestId
        const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
        if (!session) {
          set.status = 401
          return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
        }
        return forward(session.accessToken, params.patientId, 'community-support-network', body, set, requestId)
      },
      { body: SCHEMAS['community-support-network'] },
    )
    .put(
      '/patients/:patientId/social-health-summary',
      async ({ cookie, params, body, set }) => {
        const requestId = crypto.randomUUID()
        set.headers['x-request-id'] = requestId
        const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
        if (!session) {
          set.status = 401
          return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
        }
        return forward(session.accessToken, params.patientId, 'social-health-summary', body, set, requestId)
      },
      { body: SCHEMAS['social-health-summary'] },
    )
}
