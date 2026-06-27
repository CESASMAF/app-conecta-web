// Setor Auditoria (social-care) — trilha de auditoria centralizada do paciente (leitura). O audit é
// mantido no social-care (via Outbox); o BFF lê via REST (não consome NATS). `limit` 1–200 validado no
// BFF. Erros como valor. NB: o payload de evento pode conter dados — não é logado pelo BFF (LGPD).
import { Elysia, t } from 'elysia'
import type { AppDeps } from '~/server/deps'
import { requireSession } from '~/modules/auth/server/guard'
import { SESSION_COOKIE } from '~/server/session'
import { isErr } from '~/shared/http/result'
import { statusForKind, errorBody } from '~/server/routes/error-response'
import type { AuditTrailParams } from '~/external/social-care-client'

const readSid = (raw: unknown): string | undefined => (typeof raw === 'string' ? raw : undefined)

export function auditRoutes(deps: AppDeps) {
  return new Elysia().get(
    '/patients/:patientId/audit-trail',
    async ({ cookie, params, query, set }) => {
      const requestId = crypto.randomUUID()
      set.headers['x-request-id'] = requestId
      const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
      if (!session) {
        set.status = 401
        return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
      }
      const limit = query.limit ?? 50
      if (!Number.isInteger(limit) || limit < 1 || limit > 200) {
        set.status = 400
        return { error: { code: 'PAG-001', message: 'limit', requestId } }
      }
      const p: AuditTrailParams = {
        limit,
        ...(query.eventType !== undefined ? { eventType: query.eventType } : {}),
        ...(query.offset !== undefined ? { offset: query.offset } : {}),
      }
      const r = await deps.socialCare.getAuditTrail(session.accessToken, params.patientId, p)
      if (isErr(r)) {
        set.status = statusForKind(r.error.kind)
        return errorBody(r.error, requestId)
      }
      return { data: r.value, meta: { timestamp: new Date().toISOString() } }
    },
    {
      query: t.Object({
        eventType: t.Optional(t.String()),
        limit: t.Optional(t.Numeric()),
        offset: t.Optional(t.Numeric()),
      }),
    },
  )
}
