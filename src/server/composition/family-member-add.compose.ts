// Composição de ESCRITA: adicionar membro ao núcleo familiar criando a pessoa-membro nos bastidores
// (people-context, createLogin=false) e então vinculando-a ao paciente (social-care). Simétrico ao
// cadastro de paciente (Inc 2). Fail-secure: se o people-context cair, NÃO vincula (sem vínculo órfão);
// `createPerson` é idempotente por CPF → retry com o mesmo CPF reaproveita a pessoa (sem duplicar).
import type { AppDeps } from '~/server/deps'
import { ok, isErr, type Result } from '~/shared/http/result'
import type { AppError } from '~/shared/http/app-error'

type MemberPerson = Readonly<{ fullName: string; birthDate: string; cpf?: string }>

// Comando validado pela rota (TypeBox). Aceita OU `member` (criar identidade) OU `memberPersonId` (reusar).
export type AddFamilyMemberCommand = Readonly<{
  memberPersonId?: string
  member?: MemberPerson
  prRelationshipId: string
  isResiding: boolean
  isCaregiver: boolean
  // caminho legacy (memberPersonId) fornece estes; o caminho `member` deriva
  relationship?: string
  hasDisability?: boolean
  requiredDocuments?: readonly string[]
  birthDate?: string
}>

export async function composeAddFamilyMember(
  deps: AppDeps,
  token: string,
  actorId: string,
  patientId: string,
  cmd: AddFamilyMemberCommand,
): Promise<Result<void, AppError>> {
  let memberPersonId: string
  let birthDate: string

  if (cmd.member) {
    const created = await deps.peopleContext.createPerson(token, actorId, {
      fullName: cmd.member.fullName,
      birthDate: cmd.member.birthDate,
      ...(cmd.member.cpf ? { cpf: cmd.member.cpf } : {}),
      createLogin: false, // familiar não acessa o sistema
    })
    if (isErr(created)) return created // people-context fora/inválido → não vincula (fail-secure)
    memberPersonId = created.value.id
    birthDate = cmd.member.birthDate
  } else {
    memberPersonId = cmd.memberPersonId! // a rota garante o xor
    birthDate = cmd.birthDate ?? ''
  }

  const r = await deps.socialCare.addFamilyMember(token, patientId, {
    memberPersonId,
    relationship: cmd.relationship ?? cmd.prRelationshipId, // o select de parentesco preenche ambos
    isResiding: cmd.isResiding,
    isCaregiver: cmd.isCaregiver,
    hasDisability: cmd.hasDisability ?? false,
    requiredDocuments: cmd.requiredDocuments ?? [],
    birthDate,
    prRelationshipId: cmd.prRelationshipId,
  })
  if (isErr(r)) return r
  return ok(undefined)
}
