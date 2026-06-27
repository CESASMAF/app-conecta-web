// Composição view-ready da pessoa (skill bff-compose-view): junta dados + papéis numa só resposta, de
// modo que o client receba tudo pronto e só monte a tela. Fan-out no people-context. A pessoa é origem
// PRIMÁRIA (falha → erro); os papéis são SECUNDÁRIOS (falha → degrada com `partial: true`, tela não quebra).
import type { AppDeps } from '~/server/deps'
import { ok, isErr, type Result } from '~/shared/http/result'
import type { AppError } from '~/shared/http/app-error'

export type PersonRoleView = Readonly<{ system: string; role: string; active: boolean }>
export type PersonOverview = Readonly<{
  id: string
  fullName: string
  birthDate: string
  active: boolean
  roles: readonly PersonRoleView[]
  partial: boolean
}>

export async function composePersonOverview(
  deps: AppDeps,
  token: string,
  personId: string,
): Promise<Result<PersonOverview, AppError>> {
  const [personR, rolesR] = await Promise.all([
    deps.peopleContext.getPerson(token, personId),
    deps.peopleContext.getRoles(token, personId),
  ])
  if (isErr(personR)) return personR // pessoa não encontrada / dependência fora → erro real
  const p = personR.value
  const partial = isErr(rolesR)
  const roles: readonly PersonRoleView[] = partial
    ? []
    : rolesR.value.map((r) => ({ system: r.system, role: r.role, active: r.active }))
  return ok({ id: p.id, fullName: p.fullName, birthDate: p.birthDate, active: p.active, roles, partial })
}
