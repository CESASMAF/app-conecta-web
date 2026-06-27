// Binding Solid do cadastro de pessoa (Admin/RH). action/useSubmission (anti-duplo-submit); ao concluir,
// abre o detalhe. Trata o 207 (login pendente) como aviso — ainda navega (pessoa foi criada).
import { createSignal, createMemo } from 'solid-js'
import { createStore } from 'solid-js/store'
import { action, useAction, useSubmission, useNavigate } from '@solidjs/router'
import { createPersonFn } from '../../server/people.fn'
import { emptyPerson, validatePersonCreate, toCreateBody, hasErrors, type PersonForm, type PersonField } from '../person-form.view-model'
import { isOk } from '~/shared/http/result'
import { peopleActionErrorTag, type PeopleTag } from '~/shared/i18n/people'

const createAction = action(createPersonFn, 'people:create')
const todayIso = (): string => new Date().toISOString().slice(0, 10)

export function usePersonCreateBinding() {
  const navigate = useNavigate()
  const [form, setForm] = createStore<PersonForm>(emptyPerson())
  const [showErr, setShowErr] = createSignal(false)
  const submit = useAction(createAction)
  const submission = useSubmission(createAction)

  const set = (patch: Partial<PersonForm>): void => setForm(patch)
  const errors = createMemo(() => validatePersonCreate(form, todayIso()))
  const errorFor = (f: PersonField): PeopleTag | null => (showErr() ? (errors()[f] ?? null) : null)

  async function save(): Promise<void> {
    if (hasErrors(errors())) {
      setShowErr(true)
      return
    }
    const r = await submit(toCreateBody(form))
    if (isOk(r)) navigate(`/people/${r.value.id}`)
  }

  const submitErrorTag = createMemo<PeopleTag | null>(() => {
    const res = submission.result
    return res && !isOk(res) ? peopleActionErrorTag(res.error.kind) : null
  })

  return { form, set, errorFor, save, pending: () => submission.pending, submitErrorTag }
}

export type PersonCreateBinding = ReturnType<typeof usePersonCreateBinding>
