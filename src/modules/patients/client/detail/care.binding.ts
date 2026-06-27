// Binding Solid do Cuidado Clínico + Proteção (US5) — único ponto reativo. Lê o agregado (createAsync) e
// executa as 5 escritas; como esses endpoints NÃO recompõem o estado, após sucesso RE-LÊ (revalidate) p/
// refletir a lista/seção atualizada. Anti-duplo-submit global (busy); erro mapeado por tag.
import { createMemo, createSignal } from 'solid-js'
import { createAsync, query, revalidate, useParams } from '@solidjs/router'
import {
  getCareFn,
  registerAppointmentFn,
  updateIntakeFn,
  updatePlacementFn,
  reportViolationFn,
  createReferralFn,
} from '../../server/patient-care.fn'
import { isOk, type Result } from '~/shared/http/result'
import type { AppError } from '~/shared/http/app-error'
import type { PatientCare } from '~/shared/domain/patient-care'
import { actionErrorTag, type PatientsTag } from '~/shared/i18n/patients'
import type { AppointmentBody, IntakeBody, PlacementBody, ViolationBody, ReferralBody } from './care.view-model'

const careQuery = query((id: string) => getCareFn(id), 'patient:care')

export function useCareBinding() {
  const params = useParams()
  const id = () => params.id ?? ''
  const care = createAsync(() => careQuery(id()))
  const [busy, setBusy] = createSignal(false)
  const [errTag, setErrTag] = createSignal<PatientsTag | null>(null)

  const pending = createMemo(() => care() === undefined)
  const loadError = createMemo(() => {
    const r = care()
    return Boolean(r) && !isOk(r!)
  })
  const data = createMemo<PatientCare | null>(() => {
    const r = care()
    return r && isOk(r) ? r.value : null
  })

  async function run(fn: () => Promise<Result<void, AppError>>): Promise<boolean> {
    if (busy()) return false
    setBusy(true)
    setErrTag(null)
    const r = await fn()
    if (isOk(r)) {
      await revalidate(careQuery.key) // re-lê o agregado (o endpoint não recompõe)
      setBusy(false)
      return true
    }
    setBusy(false)
    setErrTag(actionErrorTag(r.error.kind))
    return false
  }

  return {
    pending,
    loadError,
    data,
    busy,
    errTag,
    clearError: () => setErrTag(null),
    registerAppointment: (b: AppointmentBody) => run(() => registerAppointmentFn(id(), b)),
    updateIntake: (b: IntakeBody) => run(() => updateIntakeFn(id(), b)),
    updatePlacement: (b: PlacementBody) => run(() => updatePlacementFn(id(), b)),
    reportViolation: (b: ViolationBody) => run(() => reportViolationFn(id(), b)),
    createReferral: (b: ReferralBody) => run(() => createReferralFn(id(), b)),
  }
}

export type CareBinding = ReturnType<typeof useCareBinding>
