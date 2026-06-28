// Binding Solid do detalhe da pessoa (Admin/RH). Lê visão composta + papéis (com id, p/ ações). Mutações
// (editar, ativar/desativar, redefinir senha, atribuir/ativar/desativar papel) RE-LEEM (revalidate) pois os
// endpoints não recompõem. Anti-duplo-submit global (busy); erro/aviso por tag.
import { createMemo, createSignal } from 'solid-js'
import { createAsync, query, revalidate, useParams } from '@solidjs/router'
import {
  getPersonFn,
  getPersonRolesFn,
  updatePersonFn,
  setPersonActiveFn,
  requestPasswordResetFn,
  assignRoleFn,
  setRoleActiveFn,
} from '../../server/people.fn'
import { isOk, type Result } from '~/shared/http/result'
import type { AppError } from '~/shared/http/app-error'
import type { PersonOverview, PersonRole } from '~/shared/domain/person'
import { peopleErrorTag, peopleActionErrorTag, type PeopleTag } from '~/shared/i18n/people'
import type { PersonUpdateBody, AssignRoleBody } from '../person-form.view-model'

const personQuery = query((id: string) => getPersonFn(id), 'person:overview')
const rolesQuery = query((id: string) => getPersonRolesFn(id), 'person:roles')

export function usePersonBinding() {
  const params = useParams()
  const id = () => params.id ?? ''
  const person = createAsync(() => personQuery(id()))
  const roles = createAsync(() => rolesQuery(id()))
  const [busy, setBusy] = createSignal(false)
  const [errTag, setErrTag] = createSignal<PeopleTag | null>(null)
  const [info, setInfo] = createSignal<string | null>(null)

  const pending = createMemo(() => person() === undefined)
  const data = createMemo<PersonOverview | null>(() => {
    const r = person()
    return r && isOk(r) ? r.value : null
  })
  const notFound = createMemo(() => {
    const r = person()
    return Boolean(r) && !isOk(r!) && r!.error?.kind === 'notFound'
  })
  const loadErrorTag = createMemo<PeopleTag | null>(() => {
    const r = person()
    return r && !isOk(r) ? peopleErrorTag(r.error?.kind ?? 'unknown') : null
  })
  const roleList = createMemo<readonly PersonRole[]>(() => {
    const r = roles()
    return r && isOk(r) ? r.value : []
  })

  async function run(fn: () => Promise<Result<void, AppError>>, opts?: { reloadRoles?: boolean; infoMsg?: string }): Promise<boolean> {
    if (busy()) return false
    setBusy(true)
    setErrTag(null)
    setInfo(null)
    const r = await fn()
    if (isOk(r)) {
      await revalidate(personQuery.key)
      if (opts?.reloadRoles) await revalidate(rolesQuery.key)
      if (opts?.infoMsg) setInfo(opts.infoMsg)
      setBusy(false)
      return true
    }
    setBusy(false)
    setErrTag(peopleActionErrorTag(r.error?.kind ?? 'unknown'))
    return false
  }

  return {
    id,
    pending,
    data,
    notFound,
    loadErrorTag,
    roleList,
    busy,
    errTag,
    info,
    clearMessages: () => {
      setErrTag(null)
      setInfo(null)
    },
    update: (b: PersonUpdateBody) => run(() => updatePersonFn(id(), b)),
    setActive: (active: boolean) => run(() => setPersonActiveFn(id(), active)),
    requestPasswordReset: () => run(() => requestPasswordResetFn(id()), { infoMsg: 'Solicitação de redefinição de senha enviada.' }),
    assignRole: (b: AssignRoleBody) => run(() => assignRoleFn(id(), b), { reloadRoles: true }),
    setRoleActive: (roleId: string, active: boolean) => run(() => setRoleActiveFn(id(), roleId, active), { reloadRoles: true }),
  }
}

export type PersonBinding = ReturnType<typeof usePersonBinding>
