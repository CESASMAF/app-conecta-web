// BFF Elysia (ADR-0010). Factory injetavel (testavel com fakes) + singleton de producao.
// Montado em src/routes/api/[...path].ts via app.fetch. Prefix /api + cookie `pkce` assinado.
import { Elysia } from 'elysia'
import { env, allowedOrigin } from '~/server/env'
import type { AppDeps } from '~/server/deps'
import { sessionStore } from '~/external/session-store'
import { createSocialCareClient } from '~/external/social-care-client'
import { createPeopleContextClient } from '~/external/people-context-client'
import { createAnalysisBiClient } from '~/external/analysis-bi-client'
import { createAuthentikClient } from '~/server/oidc'
import { logAuthEvent } from '~/shared/log'
import { loginRoute } from '~/server/routes/login.service.fn'
import { callbackRoute } from '~/server/routes/callback.service.fn'
import { meRoute } from '~/server/routes/me.query.fn'
import { logoutRoute } from '~/server/routes/logout.service.fn'
import { patientsListRoute } from '~/server/routes/patients-list.query.fn'
import { patientGetRoute } from '~/server/routes/patient-get.query.fn'
import { domainsGetRoute } from '~/server/routes/domains-get.query.fn'
import { biIndicatorsRoute } from '~/server/routes/bi-indicators.query.fn'
import { biExportRoute } from '~/server/routes/bi-export.query.fn'
import { biMetadataRoute } from '~/server/routes/bi-metadata.query.fn'
import { peopleRoutes } from '~/server/routes/people.routes'
import { rolesRoutes } from '~/server/routes/roles.routes'
import { patientManageRoutes } from '~/server/routes/patient-manage.routes'
import { assessmentRoutes } from '~/server/routes/assessment.routes'
import { careRoutes } from '~/server/routes/care.routes'
import { protectionRoutes } from '~/server/routes/protection.routes'
import { domainsAdminRoutes } from '~/server/routes/domains-admin.routes'
import { auditRoutes } from '~/server/routes/audit.routes'

// Health: minimal em prod (sem fingerprint de runtime/stack — L4); detalhado em dev.
const healthBody = () =>
  env.isProd
    ? { data: { ok: true }, meta: { timestamp: new Date().toISOString() } }
    : {
        data: { ok: true, runtime: 'bun', stack: 'solidstart+elysia' },
        meta: { timestamp: new Date().toISOString() },
      }

export function createApp(deps: AppDeps) {
  return new Elysia({
    prefix: '/api',
    cookie: { secrets: env.sessionSecret || 'dev-only-secret', sign: ['pkce'] },
  })
    // CSRF (ADR-0005 §7): mutacoes exigem X-Requested-With E Origin same-origin (L3). Curto-circuita.
    .onRequest(({ request, set }) => {
      const m = request.method
      if (m === 'GET' || m === 'HEAD' || m === 'OPTIONS') return
      if (!request.headers.get('x-requested-with')) {
        set.status = 403
        logAuthEvent('csrf.blocked', { reason: 'x-requested-with' })
        return { error: { code: 'AUTH-CSRF', message: 'csrf', requestId: crypto.randomUUID() } }
      }
      const origin = request.headers.get('origin')
      if (origin && origin !== allowedOrigin) {
        set.status = 403
        logAuthEvent('csrf.blocked', { reason: 'origin', origin })
        return { error: { code: 'AUTH-ORIGIN', message: 'origin', requestId: crypto.randomUUID() } }
      }
    })
    .get('/health', healthBody)
    .use(loginRoute(deps))
    .use(callbackRoute(deps))
    .use(meRoute(deps))
    .use(logoutRoute(deps))
    .use(patientsListRoute(deps))
    .use(patientGetRoute(deps))
    .use(domainsGetRoute(deps))
    .use(biIndicatorsRoute(deps))
    .use(biExportRoute(deps))
    .use(biMetadataRoute(deps))
    .use(peopleRoutes(deps))
    .use(rolesRoutes(deps))
    .use(patientManageRoutes(deps))
    .use(assessmentRoutes(deps))
    .use(careRoutes(deps))
    .use(protectionRoutes(deps))
    .use(domainsAdminRoutes(deps))
    .use(auditRoutes(deps))
}

// Singleton de producao: cliente real do Authentik (JWKS lazy) + store de sessao + os 3 backends.
export const app = createApp({
  oidc: createAuthentikClient(),
  sessions: sessionStore,
  socialCare: createSocialCareClient(),
  peopleContext: createPeopleContextClient(),
  analysisBi: createAnalysisBiClient(),
})

export type App = typeof app
