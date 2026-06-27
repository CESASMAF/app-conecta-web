// Setor Cuidado Clínico (social-care) — atendimentos (appointments) + informações de ingresso (intake).
// Ator do JWT.sub (sem header). Validação estrutural no BFF; regra "≥1 de summary/actionPlan" (REGA-006)
// checada no handler antes do upstream. CSRF vem do guard global. Erros como valor.
import { Elysia, t } from 'elysia'
import type { AppDeps } from '~/server/deps'
import { requireSession } from '~/modules/auth/server/guard'
import { SESSION_COOKIE } from '~/server/session'
import { isErr } from '~/shared/http/result'
import { statusForKind, errorBody } from '~/server/routes/error-response'

const readSid = (raw: unknown): string | undefined => (typeof raw === 'string' ? raw : undefined)
const now = () => new Date().toISOString()

const APPOINTMENT = t.Object({
  professionalId: t.Optional(t.String()), // ausente → o profissional é o próprio usuário logado (sub)
  summary: t.Optional(t.String({ maxLength: 2000 })),
  actionPlan: t.Optional(t.String({ maxLength: 5000 })),
  type: t.Optional(t.String()),
  date: t.Optional(t.String()),
})

const INTAKE = t.Object({
  ingressTypeId: t.String({ minLength: 1 }),
  originName: t.Optional(t.String()),
  originContact: t.Optional(t.String()),
  serviceReason: t.String({ minLength: 1 }),
  linkedSocialPrograms: t.Array(t.Object({ programId: t.String({ minLength: 1 }), observation: t.Optional(t.String()) })),
})

export function careRoutes(deps: AppDeps) {
  return new Elysia()
    // GET — lê Cuidado Clínico + Proteção do agregado (atendimentos, ingresso, acolhimento, violações, encaminhamentos).
    .get('/patients/:patientId/care', async ({ cookie, params, set }) => {
      const requestId = crypto.randomUUID()
      set.headers['x-request-id'] = requestId
      const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
      if (!session) {
        set.status = 401
        return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
      }
      const r = await deps.socialCare.getPatientCare(session.accessToken, params.patientId)
      if (isErr(r)) {
        set.status = statusForKind(r.error.kind)
        return errorBody(r.error, requestId)
      }
      return { data: r.value, meta: { timestamp: now() } }
    })

    // POST /api/patients/:patientId/appointments — registrar atendimento
    .post(
      '/patients/:patientId/appointments',
      async ({ cookie, params, body, set }) => {
        const requestId = crypto.randomUUID()
        set.headers['x-request-id'] = requestId
        const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
        if (!session) {
          set.status = 401
          return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
        }
        if (!body.summary?.trim() && !body.actionPlan?.trim()) {
          set.status = 422
          return { error: { code: 'REGA-006', message: 'validation', requestId } } // ≥1 narrativa
        }
        const professionalId = body.professionalId?.trim() ? body.professionalId : session.idpSub
        const r = await deps.socialCare.registerAppointment(session.accessToken, params.patientId, { ...body, professionalId })
        if (isErr(r)) {
          set.status = statusForKind(r.error.kind)
          return errorBody(r.error, requestId)
        }
        set.status = 201
        return { data: { id: r.value.id }, meta: { timestamp: now() } }
      },
      { body: APPOINTMENT },
    )

    // PUT /api/patients/:patientId/intake-info — informações de ingresso/atendimento inicial
    .put(
      '/patients/:patientId/intake-info',
      async ({ cookie, params, body, set }) => {
        const requestId = crypto.randomUUID()
        set.headers['x-request-id'] = requestId
        const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
        if (!session) {
          set.status = 401
          return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
        }
        const r = await deps.socialCare.updateIntakeInfo(session.accessToken, params.patientId, body)
        if (isErr(r)) {
          set.status = statusForKind(r.error.kind)
          return errorBody(r.error, requestId)
        }
        return { data: { patientId: params.patientId, updated: true }, meta: { timestamp: now() } }
      },
      { body: INTAKE },
    )
}
