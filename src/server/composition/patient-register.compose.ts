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
import { toIso8601 } from '~/shared/date'

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

// --- Tradução do vocabulário do formulário → contrato do social-care (ADR-0010: o BFF traduz) ---
// `toIso8601` (shared/date) resolve o 'yyyy-mm-dd' do <input type=date> → ISO8601 completo, que é o
// que o social-care exige. Mora no shared porque a MESMA traducao vale para outras rotas que mandam
// data ao servico (ex.: registrar atendimento em care.routes) — duas copias divergiriam.
const atMidnightUTC = (isoDate: string): string => toIso8601(isoDate)

// O wizard usa as iniciais do rótulo em pt-BR; o domínio do social-care usa o enum por extenso
// (PersonalData.Sex: masculino|feminino|outro) e rejeita o resto com REGP-013.
const SEX_BY_INITIAL: Readonly<Record<string, string>> = { M: 'masculino', F: 'feminino', O: 'outro' }
const toDomainSex = (sex: string): string => SEX_BY_INITIAL[sex] ?? sex

const toDomainDiagnoses = (list: readonly DiagnosisInput[]): readonly DiagnosisInput[] =>
  list.map((d) => ({ ...d, date: atMidnightUTC(d.date) }))

// Vale p/ os DOIS caminhos (person e personId): quem manda personalData pronto tambem vem do formulario.
const toDomainPersonalData = (pd: RegisterPatientInput['personalData']): RegisterPatientInput['personalData'] =>
  pd ? { ...pd, sex: toDomainSex(pd.sex), birthDate: atMidnightUTC(pd.birthDate) } : pd

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
    personalData = toDomainPersonalData({
      firstName,
      lastName,
      motherName: p.motherName,
      nationality: p.nationality,
      sex: p.sex,
      birthDate: p.birthDate,
    })
    if (p.cpf) civilDocuments = { cpf: p.cpf }
  } else {
    personId = cmd.personId! // a rota garante o xor (exatamente um entre person|personId)
    personalData = toDomainPersonalData(cmd.personalData)
    civilDocuments = cmd.civilDocuments
  }

  // Fase 2 — cria o paciente (WAITLISTED). Ator do JWT.sub no social-care (sem header de ator).
  const input: RegisterPatientInput = {
    personId,
    initialDiagnoses: toDomainDiagnoses(cmd.initialDiagnoses),
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
