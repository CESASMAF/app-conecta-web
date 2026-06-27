// Setor Pacientes (gestão do existente) — social-care. Ciclo de vida + núcleo familiar + identidade social.
// POLÍTICA DE ATOR: social-care deriva o ator do JWT.sub — o BFF injeta SÓ o Bearer (sem header de ator).
// FACADE: toda mutação RECOMPÕE e devolve o overview view-ready (ADR-0010 §3, não 204). CSRF vem do guard
// global. Validação (reason/notes) no BFF ANTES de encaminhar. Erros como valor.
import { Elysia, t } from 'elysia'
import type { AppDeps } from '~/server/deps'
import { requireSession } from '~/modules/auth/server/guard'
import { SESSION_COOKIE } from '~/server/session'
import { isErr } from '~/shared/http/result'
import { statusForKind, errorBody } from '~/server/routes/error-response'
import { composePatientOverview } from '~/server/composition/patient-overview.compose'
import { composePatientRegister, type RegisterPatientCommand } from '~/server/composition/patient-register.compose'
import { composeAddFamilyMember, type AddFamilyMemberCommand } from '~/server/composition/family-member-add.compose'

const readSid = (raw: unknown): string | undefined => (typeof raw === 'string' ? raw : undefined)
const now = () => new Date().toISOString()
const DISCHARGE_REASONS = ['improved', 'deceased', 'transferred', 'abandoned', 'other']
const WITHDRAW_REASONS = ['refused_service', 'moved_location', 'other']

// Identidade da pessoa criada nos bastidores no cadastro orquestrado (caminho `person`). O passo 1 do
// wizard preenche estes campos; o BFF cria a pessoa (people-context) e deriva o personalData do paciente.
const PERSON_INPUT = t.Object({
  fullName: t.String({ minLength: 1 }),
  birthDate: t.String({ minLength: 1 }),
  cpf: t.Optional(t.String()),
  sex: t.String({ minLength: 1 }),
  motherName: t.String({ minLength: 1 }),
  nationality: t.String({ minLength: 1 }),
})

// Schema do cadastro (POST /patients). Validação no BFF ANTES de tocar o upstream (REGP-*).
// Aceita OU `personId` (pessoa existente) OU `person` (criar identidade nos bastidores) — xor no handler.
const PATIENT_BODY = t.Object({
  personId: t.Optional(t.String({ minLength: 1 })),
  person: t.Optional(PERSON_INPUT),
  initialDiagnoses: t.Array(t.Object({ icdCode: t.String({ minLength: 1 }), date: t.String(), description: t.String({ minLength: 1 }) }), { minItems: 1 }),
  personalData: t.Optional(
    t.Object({
      firstName: t.String({ minLength: 1 }),
      lastName: t.String({ minLength: 1 }),
      motherName: t.String({ minLength: 1 }),
      nationality: t.String({ minLength: 1 }),
      sex: t.String(),
      socialName: t.Optional(t.String()),
      birthDate: t.String(),
      phone: t.Optional(t.String()),
    }),
  ),
  civilDocuments: t.Optional(
    t.Object({
      cpf: t.Optional(t.String()),
      nis: t.Optional(t.String()),
      rgDocument: t.Optional(t.Object({ number: t.String(), issuingState: t.String(), issuingAgency: t.String(), issueDate: t.String() })),
      cns: t.Optional(t.Object({ number: t.String(), cpf: t.String(), qrCode: t.Optional(t.String()) })),
    }),
  ),
  address: t.Optional(
    t.Object({
      cep: t.Optional(t.String()),
      isShelter: t.Boolean(),
      isHomeless: t.Optional(t.Boolean()),
      residenceLocation: t.String({ minLength: 1 }),
      street: t.Optional(t.String()),
      neighborhood: t.Optional(t.String()),
      number: t.Optional(t.String()),
      complement: t.Optional(t.String()),
      state: t.String({ minLength: 1 }),
      city: t.String({ minLength: 1 }),
    }),
  ),
  socialIdentity: t.Optional(t.Object({ typeId: t.String({ minLength: 1 }), description: t.Optional(t.String()) })),
  prRelationshipId: t.String({ minLength: 1 }),
})

// Adicionar membro (POST /patients/:id/family-members). Aceita OU `memberPersonId` (pessoa existente) OU
// `member` (criar identidade do membro nos bastidores) — xor no handler. Os campos do vínculo (parentesco,
// reside, cuidador) são comuns; o caminho legacy também traz relationship/hasDisability/requiredDocuments/birthDate.
const ADD_MEMBER_BODY = t.Object({
  memberPersonId: t.Optional(t.String({ minLength: 1 })),
  member: t.Optional(
    t.Object({ fullName: t.String({ minLength: 1 }), birthDate: t.String({ minLength: 1 }), cpf: t.Optional(t.String()) }),
  ),
  prRelationshipId: t.String({ minLength: 1 }),
  isResiding: t.Boolean(),
  isCaregiver: t.Boolean(),
  relationship: t.Optional(t.String({ minLength: 1 })),
  hasDisability: t.Optional(t.Boolean()),
  requiredDocuments: t.Optional(t.Array(t.String())),
  birthDate: t.Optional(t.String()),
})

export function patientManageRoutes(deps: AppDeps) {
  // Recompõe o overview view-ready e devolve {data, meta} — usado após cada mutação (sem refetch no client).
  const overview = async (token: string, id: string, set: { status?: number | string }, requestId: string) => {
    const ov = await composePatientOverview(deps, token, id)
    if (isErr(ov)) {
      set.status = statusForKind(ov.error.kind)
      return errorBody(ov.error, requestId)
    }
    return { data: ov.value, meta: { timestamp: now(), partial: ov.value.partial } }
  }

  return (
    new Elysia()
      // POST /api/patients — cadastro orquestrado. Valida no BFF; cria pessoa (se `person`) + paciente
      // (WAITLISTED) e RECOMPÕE o overview (201). Exatamente um entre `person` e `personId` (xor).
      .post(
        '/patients',
        async ({ cookie, body, set }) => {
          const requestId = crypto.randomUUID()
          set.headers['x-request-id'] = requestId
          const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
          if (!session) {
            set.status = 401
            return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
          }
          const hasPerson = body.person !== undefined
          const hasPersonId = typeof body.personId === 'string' && body.personId.length > 0
          if (hasPerson === hasPersonId) {
            // ambos ou nenhum → ambíguo. Recusa ANTES de tocar qualquer upstream.
            set.status = 422
            return { error: { code: 'REGP-IDENT', message: 'validation', requestId } }
          }
          const r = await composePatientRegister(deps, session.accessToken, session.idpSub, body as RegisterPatientCommand)
          if (isErr(r)) {
            set.status = statusForKind(r.error.kind)
            return errorBody(r.error, requestId)
          }
          set.status = 201
          return overview(session.accessToken, r.value.patientId, set, requestId)
        },
        { body: PATIENT_BODY },
      )

      // GET /api/patients/new/form-context — catálogos que o formulário de cadastro precisa (view-ready)
      .get('/patients/new/form-context', async ({ cookie, set }) => {
        const requestId = crypto.randomUUID()
        set.headers['x-request-id'] = requestId
        const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
        if (!session) {
          set.status = 401
          return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
        }
        const [relR, identR] = await Promise.all([
          deps.socialCare.listDomain(session.accessToken, 'dominio_parentesco'),
          deps.socialCare.listDomain(session.accessToken, 'dominio_tipo_identidade'),
        ])
        if (isErr(relR)) {
          set.status = statusForKind(relR.error.kind)
          return errorBody(relR.error, requestId)
        }
        if (isErr(identR)) {
          set.status = statusForKind(identR.error.kind)
          return errorBody(identR.error, requestId)
        }
        return { data: { relationships: relR.value, identityTypes: identR.value }, meta: { timestamp: now() } }
      })

      // GET /api/patients/:id/overview — visão composta view-ready
      .get('/patients/:patientId/overview', async ({ cookie, params, set }) => {
        const requestId = crypto.randomUUID()
        set.headers['x-request-id'] = requestId
        const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
        if (!session) {
          set.status = 401
          return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
        }
        return overview(session.accessToken, params.patientId, set, requestId)
      })

      // POST /api/patients/:id/admit (sem corpo)
      .post('/patients/:patientId/admit', async ({ cookie, params, set }) => {
        const requestId = crypto.randomUUID()
        set.headers['x-request-id'] = requestId
        const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
        if (!session) {
          set.status = 401
          return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
        }
        const r = await deps.socialCare.admitPatient(session.accessToken, params.patientId)
        if (isErr(r)) {
          set.status = statusForKind(r.error.kind)
          return errorBody(r.error, requestId)
        }
        return overview(session.accessToken, params.patientId, set, requestId)
      })

      // POST /api/patients/:id/discharge {reason, notes?} — notes obrigatório se reason='other'
      .post(
        '/patients/:patientId/discharge',
        async ({ cookie, params, body, set }) => {
          const requestId = crypto.randomUUID()
          set.headers['x-request-id'] = requestId
          const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
          if (!session) {
            set.status = 401
            return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
          }
          if (!DISCHARGE_REASONS.includes(body.reason)) {
            set.status = 400
            return { error: { code: 'DISC-002', message: 'validation', requestId } }
          }
          if (body.reason === 'other' && !body.notes?.trim()) {
            set.status = 400
            return { error: { code: 'DISC-003', message: 'validation', requestId } }
          }
          const r = await deps.socialCare.dischargePatient(session.accessToken, params.patientId, body)
          if (isErr(r)) {
            set.status = statusForKind(r.error.kind)
            return errorBody(r.error, requestId)
          }
          return overview(session.accessToken, params.patientId, set, requestId)
        },
        { body: t.Object({ reason: t.String(), notes: t.Optional(t.String()) }) },
      )

      // POST /api/patients/:id/readmit {notes?}
      .post(
        '/patients/:patientId/readmit',
        async ({ cookie, params, body, set }) => {
          const requestId = crypto.randomUUID()
          set.headers['x-request-id'] = requestId
          const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
          if (!session) {
            set.status = 401
            return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
          }
          const r = await deps.socialCare.readmitPatient(session.accessToken, params.patientId, body)
          if (isErr(r)) {
            set.status = statusForKind(r.error.kind)
            return errorBody(r.error, requestId)
          }
          return overview(session.accessToken, params.patientId, set, requestId)
        },
        { body: t.Object({ notes: t.Optional(t.String()) }) },
      )

      // POST /api/patients/:id/withdraw {reason, notes?} — notes obrigatório se reason='other'
      .post(
        '/patients/:patientId/withdraw',
        async ({ cookie, params, body, set }) => {
          const requestId = crypto.randomUUID()
          set.headers['x-request-id'] = requestId
          const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
          if (!session) {
            set.status = 401
            return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
          }
          if (!WITHDRAW_REASONS.includes(body.reason)) {
            set.status = 400
            return { error: { code: 'WDR-004', message: 'validation', requestId } }
          }
          if (body.reason === 'other' && !body.notes?.trim()) {
            set.status = 400
            return { error: { code: 'WDR-005', message: 'validation', requestId } }
          }
          const r = await deps.socialCare.withdrawPatient(session.accessToken, params.patientId, body)
          if (isErr(r)) {
            set.status = statusForKind(r.error.kind)
            return errorBody(r.error, requestId)
          }
          return overview(session.accessToken, params.patientId, set, requestId)
        },
        { body: t.Object({ reason: t.String(), notes: t.Optional(t.String()) }) },
      )

      // POST /api/patients/:id/family-members — adicionar membro (orquestrado: cria a pessoa-membro nos
      // bastidores se `member`, ou usa `memberPersonId`). Recompõe e devolve o overview view-ready.
      .post(
        '/patients/:patientId/family-members',
        async ({ cookie, params, body, set }) => {
          const requestId = crypto.randomUUID()
          set.headers['x-request-id'] = requestId
          const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
          if (!session) {
            set.status = 401
            return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
          }
          const hasMember = body.member !== undefined
          const hasMemberId = typeof body.memberPersonId === 'string' && body.memberPersonId.length > 0
          if (hasMember === hasMemberId) {
            set.status = 422
            return { error: { code: 'APP-IDENT', message: 'validation', requestId } }
          }
          const r = await composeAddFamilyMember(
            deps,
            session.accessToken,
            session.idpSub,
            params.patientId,
            body as AddFamilyMemberCommand,
          )
          if (isErr(r)) {
            set.status = statusForKind(r.error.kind)
            return errorBody(r.error, requestId)
          }
          return overview(session.accessToken, params.patientId, set, requestId)
        },
        { body: ADD_MEMBER_BODY },
      )

      // DELETE /api/patients/:id/family-members/:memberId — remover membro
      .delete('/patients/:patientId/family-members/:memberId', async ({ cookie, params, set }) => {
        const requestId = crypto.randomUUID()
        set.headers['x-request-id'] = requestId
        const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
        if (!session) {
          set.status = 401
          return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
        }
        const r = await deps.socialCare.removeFamilyMember(session.accessToken, params.patientId, params.memberId)
        if (isErr(r)) {
          set.status = statusForKind(r.error.kind)
          return errorBody(r.error, requestId)
        }
        return overview(session.accessToken, params.patientId, set, requestId)
      })

      // PUT /api/patients/:id/primary-caregiver {memberPersonId}
      .put(
        '/patients/:patientId/primary-caregiver',
        async ({ cookie, params, body, set }) => {
          const requestId = crypto.randomUUID()
          set.headers['x-request-id'] = requestId
          const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
          if (!session) {
            set.status = 401
            return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
          }
          const r = await deps.socialCare.setPrimaryCaregiver(session.accessToken, params.patientId, body.memberPersonId)
          if (isErr(r)) {
            set.status = statusForKind(r.error.kind)
            return errorBody(r.error, requestId)
          }
          return overview(session.accessToken, params.patientId, set, requestId)
        },
        { body: t.Object({ memberPersonId: t.String({ minLength: 1 }) }) },
      )

      // PUT /api/patients/:id/social-identity {typeId, description?}
      .put(
        '/patients/:patientId/social-identity',
        async ({ cookie, params, body, set }) => {
          const requestId = crypto.randomUUID()
          set.headers['x-request-id'] = requestId
          const session = await requireSession(deps, readSid(cookie[SESSION_COOKIE]!.value))
          if (!session) {
            set.status = 401
            return { error: { code: 'AUTH-001', message: 'unauthorized', requestId } }
          }
          const r = await deps.socialCare.updateSocialIdentity(session.accessToken, params.patientId, body)
          if (isErr(r)) {
            set.status = statusForKind(r.error.kind)
            return errorBody(r.error, requestId)
          }
          return overview(session.accessToken, params.patientId, set, requestId)
        },
        { body: t.Object({ typeId: t.String({ minLength: 1 }), description: t.Optional(t.String()) }) },
      )
  )
}
