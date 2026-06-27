// Binding Solid do prontuário: carrega a visão composta (overview) e discrimina pending/ok/notFound/erro.
// Único ponto reativo (ADR-0009). Inc 3: AÇÕES do Resumo (ciclo de vida + família + identidade) — cada
// mutação devolve o overview RECOMPOSTO e o aplicamos via `override` (troca de estado SEM refetch — FR-009).
import { createMemo, createSignal } from 'solid-js'
import { createAsync, query, useParams } from '@solidjs/router'
import { getPatientOverviewFn } from '../../server/patient-overview.fn'
import {
  admitPatientFn,
  dischargePatientFn,
  readmitPatientFn,
  withdrawPatientFn,
  addFamilyMemberFn,
  removeFamilyMemberFn,
  setPrimaryCaregiverFn,
  updateSocialIdentityFn,
} from '../../server/patient-actions.fn'
import { isOk, type Result } from '~/shared/http/result'
import type { AppError } from '~/shared/http/app-error'
import type { LifecycleAction, PatientOverview } from '~/shared/domain/patient-overview'
import { actionErrorTag, type PatientsTag } from '~/shared/i18n/patients'
import type { AddMemberBody, SocialIdentityBody } from './resumo-actions.view-model'

const overviewQuery = query((id: string) => getPatientOverviewFn(id), 'patient:overview')

export function usePatientOverviewBinding() {
  const params = useParams() // rota (app)/patients/[id].tsx → param `id`
  const id = () => params.id ?? ''
  const overview = createAsync(() => overviewQuery(id()))

  // Estado vivo: a mutação devolve o overview recomposto → sobrepõe o do createAsync (sem novo GET).
  const [override, setOverride] = createSignal<PatientOverview | null>(null)
  const [busy, setBusy] = createSignal(false)
  const [errTag, setErrTag] = createSignal<PatientsTag | null>(null)

  const pending = createMemo(() => override() === null && overview() === undefined)
  const data = createMemo<PatientOverview | null>(() => {
    const o = override()
    if (o) return o
    const a = overview()
    return a && isOk(a) ? a.value : null
  })
  const notFound = createMemo(() => {
    if (override()) return false
    const o = overview()
    return Boolean(o) && !isOk(o!) && o!.error.kind === 'notFound'
  })
  const errorOther = createMemo(() => {
    if (override()) return false
    const o = overview()
    return Boolean(o) && !isOk(o!) && o!.error.kind !== 'notFound'
  })

  // Executa uma mutação: anti-duplo-submit (busy global), aplica o overview recomposto ou mapeia erro→tag.
  async function run(fn: () => Promise<Result<PatientOverview, AppError>>): Promise<boolean> {
    if (busy()) return false
    setBusy(true)
    setErrTag(null)
    const r = await fn()
    setBusy(false)
    if (isOk(r)) {
      setOverride(r.value)
      return true
    }
    setErrTag(actionErrorTag(r.error.kind))
    return false
  }

  function runLifecycle(action: LifecycleAction, reason?: { reason: string; notes?: string }): Promise<boolean> {
    switch (action) {
      case 'admit':
        return run(() => admitPatientFn(id()))
      case 'readmit':
        return run(() => readmitPatientFn(id(), reason?.notes ? { notes: reason.notes } : {}))
      case 'discharge':
        return run(() => dischargePatientFn(id(), reason ?? { reason: '' }))
      case 'withdraw':
        return run(() => withdrawPatientFn(id(), reason ?? { reason: '' }))
    }
  }

  return {
    pending,
    data,
    notFound,
    errorOther,
    busy,
    actionErrorTag: errTag,
    clearActionError: () => setErrTag(null),
    runLifecycle,
    addFamilyMember: (input: AddMemberBody) => run(() => addFamilyMemberFn(id(), input)),
    removeFamilyMember: (memberId: string) => run(() => removeFamilyMemberFn(id(), memberId)),
    setPrimaryCaregiver: (memberPersonId: string) => run(() => setPrimaryCaregiverFn(id(), memberPersonId)),
    updateSocialIdentity: (input: SocialIdentityBody) => run(() => updateSocialIdentityFn(id(), input)),
  }
}

export type PatientOverviewBinding = ReturnType<typeof usePatientOverviewBinding>
