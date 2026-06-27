// Binding Solid da Avaliação (US4) — único ponto reativo. Lê o estado das 7 seções (createAsync) e salva
// uma seção por vez: aplica um override local (marca preenchida SEM refetch) ou mapeia o erro de estado
// (paciente não-ativo → conflito) por tag. Anti-duplo-submit por seção via `busy`.
import { createMemo, createSignal } from 'solid-js'
import { createStore } from 'solid-js/store'
import { createAsync, query, useParams } from '@solidjs/router'
import { getAssessmentFn, saveAssessmentSectionFn } from '../../server/patient-assessment.fn'
import { isOk } from '~/shared/http/result'
import type { PatientAssessment, AssessmentSectionKey } from '~/shared/domain/patient-assessment'
import { actionErrorTag, type PatientsTag } from '~/shared/i18n/patients'

const assessmentQuery = query((id: string) => getAssessmentFn(id), 'patient:assessment')

export function useAssessmentBinding() {
  const params = useParams()
  const id = () => params.id ?? ''
  const read = createAsync(() => assessmentQuery(id()))

  // Override local por seção: depois de salvar, o estado reflete sem novo GET.
  const [overrides, setOverrides] = createStore<Partial<Record<AssessmentSectionKey, unknown>>>({})
  const [busy, setBusy] = createSignal<AssessmentSectionKey | null>(null)
  const [errTag, setErrTag] = createSignal<PatientsTag | null>(null)

  const pending = createMemo(() => read() === undefined)
  const loadError = createMemo(() => {
    const r = read()
    return Boolean(r) && !isOk(r!)
  })

  const sectionData = (key: AssessmentSectionKey): unknown => {
    if (key in overrides) return overrides[key]
    const r = read()
    return r && isOk(r) ? (r.value as PatientAssessment)[key] : null
  }
  const isFilled = (key: AssessmentSectionKey): boolean => sectionData(key) != null

  async function save(section: AssessmentSectionKey, payload: unknown): Promise<boolean> {
    if (busy()) return false
    setBusy(section)
    setErrTag(null)
    const r = await saveAssessmentSectionFn(id(), section, payload)
    setBusy(null)
    if (isOk(r)) {
      setOverrides({ [section]: payload } as Partial<Record<AssessmentSectionKey, unknown>>)
      return true
    }
    setErrTag(actionErrorTag(r.error.kind))
    return false
  }

  return {
    pending,
    loadError,
    sectionData,
    isFilled,
    busy,
    errTag,
    clearError: () => setErrTag(null),
    save,
  }
}

export type AssessmentBinding = ReturnType<typeof useAssessmentBinding>
