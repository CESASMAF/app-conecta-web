// Binding Solid do wizard (ADR-0009) — único ponto reativo. Liga a VM pura (validação/montagem) ao
// router + ações. Anti-duplo-submit via `useSubmission().pending` (Princ. IV). Rascunho em sessionStorage
// (FR-013: sessão cai → preserva o que foi digitado). Ao concluir, abre o prontuário do paciente criado.
import { createSignal, createMemo, onMount } from 'solid-js'
import { createStore } from 'solid-js/store'
import { action, createAsync, useAction, useSubmission, useNavigate } from '@solidjs/router'
import { registerPatientFn } from '../../server/patient-register.fn'
import { domainCatalog } from '~/modules/domains/public-api'
import {
  emptyForm,
  validateStep1,
  validateStep2,
  hasErrors,
  toRegisterInput,
  type WizardForm,
  type WizardField,
  type FieldErrors,
} from './patient-create.view-model'
import { isOk } from '~/shared/http/result'
import { registerErrorTag, type PatientsTag } from '~/shared/i18n/patients'

const registerAction = action(registerPatientFn, 'patient:register')
const DRAFT_KEY = 'acdg.patient-create.draft'
const todayIso = (): string => new Date().toISOString().slice(0, 10)

// Lê o rascunho do sessionStorage (só no client). Mescla sobre o vazio p/ tolerar formas antigas.
// Devolve null quando não há rascunho. Falhas de storage são silenciosas — rascunho é conveniência.
function loadDraft(): WizardForm | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (raw) return { ...emptyForm(), ...(JSON.parse(raw) as Partial<WizardForm>) }
  } catch {
    /* sem storage / JSON inválido → sem rascunho */
  }
  return null
}

export function usePatientCreateBinding() {
  const navigate = useNavigate()
  // Inicia VAZIO (igual ao SSR) e restaura o rascunho só pós-hidratação — evita hydration mismatch.
  const [form, setForm] = createStore<WizardForm>(emptyForm())
  const [step, setStep] = createSignal<1 | 2>(1)
  const [showErrors, setShowErrors] = createSignal(false)

  onMount(() => {
    const draft = loadDraft()
    if (draft) setForm(draft)
  })

  // Catálogo de parentesco (passo 2) — cache de sessão da 002 (selects nunca fixos no código, SC-005).
  const relationships = createAsync(() => domainCatalog('dominio_parentesco'))

  const submit = useAction(registerAction)
  const submission = useSubmission(registerAction)

  const setField = (field: WizardField, value: string): void => {
    setForm({ [field]: value } as Partial<WizardForm>) // forma de merge: evita o `never` da chave dinâmica
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...form, [field]: value }))
    } catch {
      /* sem storage → segue sem rascunho */
    }
  }

  const step1Errors = createMemo<FieldErrors>(() => validateStep1(form, todayIso()))
  const step2Errors = createMemo<FieldErrors>(() => validateStep2(form, todayIso()))

  // Erro de campo visível só após uma tentativa de avançar/enviar (não "grita" enquanto digita).
  const errorFor = (field: WizardField): PatientsTag | null => {
    if (!showErrors()) return null
    const errs = step() === 1 ? step1Errors() : step2Errors()
    return errs[field] ?? null
  }

  function next(): void {
    if (hasErrors(step1Errors())) {
      setShowErrors(true)
      return
    }
    setShowErrors(false)
    setStep(2)
  }

  function back(): void {
    setShowErrors(false)
    setStep(1)
  }

  async function submitForm(): Promise<void> {
    if (hasErrors(step1Errors()) || hasErrors(step2Errors())) {
      setShowErrors(true)
      if (hasErrors(step1Errors())) setStep(1) // volta ao passo do problema
      return
    }
    const r = await submit(toRegisterInput(form))
    if (isOk(r)) {
      try {
        sessionStorage.removeItem(DRAFT_KEY)
      } catch {
        /* ok */
      }
      navigate(`/patients/${r.value.patientId}`)
    }
    // Falha: a view mostra `submitErrorTag()` (reativo via submission.result) e o rascunho é preservado.
  }

  const submitErrorTag = createMemo<PatientsTag | null>(() => {
    const res = submission.result
    return res && !isOk(res) ? registerErrorTag(res.error.kind) : null
  })

  const relationshipOptions = createMemo(() => {
    const r = relationships()
    return r && isOk(r) ? r.value.map((item) => ({ id: item.id, label: item.descricao })) : []
  })
  const relationshipsUnavailable = createMemo(() => {
    const r = relationships()
    return Boolean(r) && !isOk(r!)
  })

  return {
    form,
    step,
    setField,
    errorFor,
    next,
    back,
    submitForm,
    pending: () => submission.pending,
    submitErrorTag,
    relationshipOptions,
    relationshipsUnavailable,
  }
}

export type PatientCreateBinding = ReturnType<typeof usePatientCreateBinding>
