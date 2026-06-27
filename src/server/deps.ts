// Dependências injetáveis do BFF — permite fakes nos testes (sem MSW, ADR-0011).
import type { OidcClient } from '~/server/oidc'
import type { SessionStore } from '~/external/session-store'
import type { SocialCareClient } from '~/external/social-care-client'
import type { PeopleContextClient } from '~/external/people-context-client'
import type { AnalysisBiClient } from '~/external/analysis-bi-client'

export type AppDeps = Readonly<{
  oidc: OidcClient
  sessions: SessionStore
  socialCare: SocialCareClient
  peopleContext: PeopleContextClient
  analysisBi: AnalysisBiClient
}>
