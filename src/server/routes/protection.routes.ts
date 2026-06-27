// Setor Proteção de Direitos (social-care) — histórico de acolhimento + violações + encaminhamentos.
// Ator do JWT.sub (sem header). Validação estrutural no BFF (TypeBox) antes do upstream; as regras de
// fronteira (vítima/pessoa no núcleo — RRV-008/CREF-007, data não-futura) ficam no backend e o BFF mapeia
// o erro por tag. CSRF vem do guard global. Erros como valor.
import { Elysia, t } from 'elysia'
import type { AppDeps } from '~/server/deps'
import { requireSession } from '~/modules/auth/server/guard'
import { SESSION_COOKIE } from '~/server/session'
import { isErr } from '~/shared/http/result'
import { statusForKind, errorBody } from '~/server/routes/error-response'

const readSid = (raw: unknown): string | undefined => (typeof raw === 'string' ? raw : undefined)
const now = () => new Date().toISOString()

const PLACEMENT = t.Object({
  registries: t.Array(
    t.Object({ memberId: t.String({ minLength: 1 }), startDate: t.String(), endDate: t.Optional(t.String()), reason: t.String({ minLength: 1 }) }),
  ),
  collectiveSituations: t.Object({ homeLossReport: t.Optional(t.String()), thirdPartyGuardReport: t.Optional(t.String()) }),
  separationChecklist: t.Object({ adultInPrison: t.Boolean(), adolescentInInternment: t.Boolean() }),
})
const VIOLATION = t.Object({
  victimId: t.String({ minLength: 1 }),
  violationType: t.String({ minLength: 1 }),
  violationTypeId: t.Optional(t.String()),
  reportDate: t.Optional(t.String()),
  incidentDate: t.Optional(t.String()),
  descriptionOfFact: t.String({ minLength: 1 }),
  actionsTaken: t.Optional(t.String()),
})
const REFERRAL = t.Object({
  referredPersonId: t.String({ minLength: 1 }),
  professionalId: t.Optional(t.String()),
  destinationService: t.String({ minLength: 1 }),
  reason: t.String({ minLength: 1 }),
  date: t.Optional(t.String()),
})

export function protectionRoutes(deps: AppDeps) {
  return new Elysia()
    // PUT /api/patients/:patientId/placement-history — histórico de acolhimento
    .put(
      '/patients/:patientId/placement-history',
      async ({ cookie, params, body, set }) => {
        const requestId = crypto.randomUUID()
        set.headers['x-request-id'] = requestId
        const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
        if (!session) {
          set.status = 401
          return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
        }
        const r = await deps.socialCare.updatePlacementHistory(session.accessToken, params.patientId, body)
        if (isErr(r)) {
          set.status = statusForKind(r.error.kind)
          return errorBody(r.error, requestId)
        }
        return { data: { patientId: params.patientId, updated: true }, meta: { timestamp: now() } }
      },
      { body: PLACEMENT },
    )

    // POST /api/patients/:patientId/violation-reports — registrar violação de direitos
    .post(
      '/patients/:patientId/violation-reports',
      async ({ cookie, params, body, set }) => {
        const requestId = crypto.randomUUID()
        set.headers['x-request-id'] = requestId
        const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
        if (!session) {
          set.status = 401
          return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
        }
        const r = await deps.socialCare.reportViolation(session.accessToken, params.patientId, body)
        if (isErr(r)) {
          set.status = statusForKind(r.error.kind)
          return errorBody(r.error, requestId)
        }
        set.status = 201
        return { data: { id: r.value.id }, meta: { timestamp: now() } }
      },
      { body: VIOLATION },
    )

    // POST /api/patients/:patientId/referrals — criar encaminhamento
    .post(
      '/patients/:patientId/referrals',
      async ({ cookie, params, body, set }) => {
        const requestId = crypto.randomUUID()
        set.headers['x-request-id'] = requestId
        const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
        if (!session) {
          set.status = 401
          return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
        }
        const r = await deps.socialCare.createReferral(session.accessToken, params.patientId, body)
        if (isErr(r)) {
          set.status = statusForKind(r.error.kind)
          return errorBody(r.error, requestId)
        }
        set.status = 201
        return { data: { id: r.value.id }, meta: { timestamp: now() } }
      },
      { body: REFERRAL },
    )
}
