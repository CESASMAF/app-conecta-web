// Composição de ESCRITA do cadastro orquestrado (skill bff-compose-view, lado mutação): para o assistente
// social criar um paciente SEM passar pelo RH, esta composição cria a identidade da pessoa nos bastidores
// (people-context) e então cria o paciente (social-care), devolvendo o id do paciente.
//
// SEGURANÇA EM 2 FASES (sem transação distribuída): o `createPerson` é IDEMPOTENTE POR CPF (o backend
// responde 201 com o id da pessoa JÁ existente — ver people-context). Logo, se o `createPatient` falhar
// depois de criar a pessoa, uma nova tentativa REAPROVEITA a mesma pessoa (não duplica) — fail-secure,
// sem pessoa órfã útil. O beneficiário NÃO recebe login (`createLogin: false`).
import type { AppDeps } from '~/server/deps'
import { ok, isErr, type Result } from '~/shared/http/result'
import type { AppError } from '~/shared/http/app-error'
import type { RegisterPatientInput } from '~/external/social-care-client'

type DiagnosisInput = Readonly<{ icdCode: string; date: string; description: string }>
type OrchestratedPerson = Readonly<{
  fullName: string
  birthDate: string
  cpf?: string
  sex: string
  motherName: string
  nationality: string
}>

// Comando validado pela rota (TypeBox). Aceita OU `person` (criar identidade) OU `personId` (reusar).
export type RegisterPatientCommand = Readonly<{
  personId?: string
  person?: OrchestratedPerson
  initialDiagnoses: readonly DiagnosisInput[]
  personalData?: RegisterPatientInput['personalData']
  civilDocuments?: RegisterPatientInput['civilDocuments']
  address?: RegisterPatientInput['address']
  socialIdentity?: RegisterPatientInput['socialIdentity']
  prRelationshipId: string
}>

// "Maria Silva Santos" → { firstName: 'Maria', lastName: 'Silva Santos' }. lastName pode vir vazio se o
// nome tiver uma só palavra — o client barra isso (validateStep1), e o social-care rejeita (REGP-009/010).
function splitName(full: string): Readonly<{ firstName: string; lastName: string }> {
  const parts = full.trim().split(/\s+/)
  return { firstName: parts[0] ?? '', lastName: parts.slice(1).join(' ') }
}

export async function composePatientRegister(
  deps: AppDeps,
  token: string,
  actorId: string,
  cmd: RegisterPatientCommand,
): Promise<Result<{ patientId: string }, AppError>> {
  let personId: string
  let personalData: RegisterPatientInput['personalData']
  let civilDocuments: RegisterPatientInput['civilDocuments']

  if (cmd.person) {
    const p = cmd.person
    // Fase 1 — identidade nos bastidores. X-Actor-Id = sub (política de ator do people-context).
    const created = await deps.peopleContext.createPerson(token, actorId, {
      fullName: p.fullName,
      birthDate: p.birthDate,
      ...(p.cpf ? { cpf: p.cpf } : {}),
      createLogin: false, // beneficiário não acessa o sistema
    })
    if (isErr(created)) return created // people-context fora/inválido → erro; paciente NÃO é criado (fail-secure)
    personId = created.value.id
    const { firstName, lastName } = splitName(p.fullName)
    personalData = { firstName, lastName, motherName: p.motherName, nationality: p.nationality, sex: p.sex, birthDate: p.birthDate }
    if (p.cpf) civilDocuments = { cpf: p.cpf }
  } else {
    personId = cmd.personId! // a rota garante o xor (exatamente um entre person|personId)
    personalData = cmd.personalData
    civilDocuments = cmd.civilDocuments
  }

  // Fase 2 — cria o paciente (WAITLISTED). Ator do JWT.sub no social-care (sem header de ator).
  const input: RegisterPatientInput = {
    personId,
    initialDiagnoses: cmd.initialDiagnoses,
    prRelationshipId: cmd.prRelationshipId,
    ...(personalData ? { personalData } : {}),
    ...(civilDocuments ? { civilDocuments } : {}),
    ...(cmd.address ? { address: cmd.address } : {}),
    ...(cmd.socialIdentity ? { socialIdentity: cmd.socialIdentity } : {}),
  }
  const created = await deps.socialCare.createPatient(token, input)
  if (isErr(created)) return created // em retry, o createPerson idempotente reaproveita a pessoa (sem órfão)
  return ok({ patientId: created.value.id })
}
