// Fakes para os testes de contrato do BFF (sem MSW, ADR-0011).
import { createApp } from '~/server/app'
import type { AppDeps } from '~/server/deps'
import { createInMemorySessionStore } from '~/external/session-store'
import { ok } from '~/shared/http/result'
import type { OidcClient } from '~/server/oidc'
import type { SocialCareClient } from '~/external/social-care-client'
import type { PeopleContextClient } from '~/external/people-context-client'
import type { AnalysisBiClient } from '~/external/analysis-bi-client'

export const fakeOidc: OidcClient = {
  exchangeCode: async () => ({ accessToken: 'at', refreshToken: 'rt', idToken: 'id-token', expiresIn: 3600 }),
  verifyIdToken: async () => ({ sub: 'user-1', name: 'Fulano de Tal', groups: ['worker'] }),
  refreshTokens: async () => ({ accessToken: 'at2', refreshToken: 'rt2', idToken: '', expiresIn: 3600 }),
  revokeToken: async () => {},
}

// Stub neutro da porta social-care (os testes de auth não a usam; os de patients passam um fake configurado).
export const stubSocialCare: SocialCareClient = {
  listPatients: async (_t, p) => ok({ items: [], meta: { pageSize: p.limit, totalCount: 0, hasMore: false, nextCursor: null } }),
  getPatientHeader: async (_t, id) => ok({ patientId: id, fullName: '', status: 'ACTIVE' }),
  getPatientDetail: async (_t, id) => ok({ patientId: id, personId: 'person-1', fullName: '', status: 'WAITLISTED', socialIdentity: null, familyMembers: [] }),
  getPatientAssessment: async () => ok({ housingCondition: null, socioeconomicSituation: null, workAndIncome: null, educationalStatus: null, healthStatus: null, communitySupportNetwork: null, socialHealthSummary: null }),
  getPatientCare: async () => ok({ appointments: [], intakeInfo: null, placementHistory: null, violationReports: [], referrals: [] }),
  listDomain: async () => ok([]),
  createPatient: async () => ok({ id: 'patient-1' }),
  admitPatient: async () => ok(undefined),
  dischargePatient: async () => ok(undefined),
  readmitPatient: async () => ok(undefined),
  withdrawPatient: async () => ok(undefined),
  addFamilyMember: async () => ok(undefined),
  removeFamilyMember: async () => ok(undefined),
  setPrimaryCaregiver: async () => ok(undefined),
  updateSocialIdentity: async () => ok(undefined),
  updateAssessment: async () => ok(undefined),
  registerAppointment: async () => ok({ id: 'appt-1' }),
  updateIntakeInfo: async () => ok(undefined),
  updatePlacementHistory: async () => ok(undefined),
  reportViolation: async () => ok({ id: 'vr-1' }),
  createReferral: async () => ok({ id: 'ref-1' }),
  createLookupItem: async () => ok({ id: 'lkp-1' }),
  updateLookupItem: async () => ok(undefined),
  toggleLookupItem: async () => ok(undefined),
  createLookupRequest: async () => ok({ id: 'lkr-1' }),
  listLookupRequests: async () => ok([]),
  approveLookupRequest: async () => ok(undefined),
  rejectLookupRequest: async () => ok(undefined),
  getAuditTrail: async () => ok([]),
}

// Stubs neutros dos demais backends (a maioria dos testes não os usa; quem testa injeta um fake configurado).
export const stubPeopleContext: PeopleContextClient = {
  listPeople: async (_t, p) => ok({ items: [], meta: { pageSize: p.limit, totalCount: 0, hasMore: false, nextCursor: null } }),
  getPerson: async (_t, id) => ok({ id, fullName: '', birthDate: '2000-01-01', active: true }),
  getByCpf: async () => ok({ id: 'p1', fullName: '', birthDate: '2000-01-01', active: true }),
  getRoles: async () => ok([]),
  listRoles: async () => ok([]),
  createPerson: async () => ok({ id: 'person-1', idpProvisioned: true }),
  updatePerson: async () => ok(undefined),
  deactivatePerson: async () => ok(undefined),
  reactivatePerson: async () => ok(undefined),
  requestPasswordReset: async () => ok(undefined),
  provisionLogin: async () => ok({ id: 'login-1' }),
  deletePerson: async () => ok(undefined),
  assignRole: async () => ok({ id: 'role-1', created: true }),
  deactivateRole: async () => ok(undefined),
  reactivateRole: async () => ok(undefined),
  reconcileIdp: async () => ok({ checked: 0, inSync: 0, fixed: [], errors: [] }),
}

export const stubAnalysisBi: AnalysisBiClient = {
  getIndicators: async () => ok({ rows: [], meta: { suppressedGroups: 0, kThreshold: 5 } }),
  getExport: async () => ok({ body: new Uint8Array(), contentType: 'text/csv', filename: 'export.csv' }),
  getMetadata: async () => ok({ data: [] }),
}

// OIDC fake cujo id_token traz `groups` específicos — para testar a defesa por papel (analyst/exporter).
export const oidcWithGroups = (groups: readonly string[]): OidcClient => ({
  ...fakeOidc,
  verifyIdToken: async () => ({ sub: 'user-1', name: 'Fulano de Tal', groups: [...groups] }),
})

// Monta um AppDeps completo com defaults neutros; sobrescreva só o que o teste precisa.
// Centraliza os deps do BFF — ao somar um backend novo, só este helper muda.
export const fakeDeps = (over: Partial<AppDeps> = {}): AppDeps => ({
  oidc: fakeOidc,
  sessions: createInMemorySessionStore(),
  socialCare: stubSocialCare,
  peopleContext: stubPeopleContext,
  analysisBi: stubAnalysisBi,
  ...over,
})

export const makeApp = (
  socialCare: SocialCareClient = stubSocialCare,
  extra: Partial<Pick<AppDeps, 'peopleContext' | 'analysisBi'>> = {},
) => createApp(fakeDeps({ socialCare, ...extra }))

// Dirige login → extrai o cookie pkce + o state do redirect (para então chamar o callback).
export async function driveLogin(app: ReturnType<typeof makeApp>, redirect?: string) {
  const url = `http://localhost/api/auth/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`
  const res = await app.handle(new Request(url))
  const setCookies = res.headers.getSetCookie()
  const pkceCookie = (setCookies.find((c) => c.startsWith('pkce=')) ?? '').split(';')[0] as string
  const state = new URL(res.headers.get('location') ?? 'http://x/').searchParams.get('state') ?? ''
  return { res, pkceCookie, state }
}

// Login + callback completos → devolve o cookie de sessão (__Host-session=...).
export async function driveSession(app: ReturnType<typeof makeApp>): Promise<string> {
  const { pkceCookie, state } = await driveLogin(app)
  const cb = await app.handle(
    new Request(`http://localhost/api/auth/callback?code=x&state=${state}`, { headers: { cookie: pkceCookie } }),
  )
  return (cb.headers.getSetCookie().find((c) => c.startsWith('__Host-session=')) ?? '').split(';')[0] as string
}
