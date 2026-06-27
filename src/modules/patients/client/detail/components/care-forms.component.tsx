// Formulários do Cuidado Clínico + Proteção (US5): Atendimento, Ingresso, Acolhimento, Violação, Encaminhamento.
// Views com estado de UI próprio + validação antes de salvar. Selects de domínio via cache (002); enums de
// contrato (destino do encaminhamento) e narrativas como texto. O profissional do atendimento é o usuário logado.
import { Show, For, createSignal, createMemo } from 'solid-js'
import { createStore } from 'solid-js/store'
import { tp } from '~/shared/i18n/patients'
import { TextField, SelectField, CheckboxField } from '~/shared/ui/field.component'
import { useCatalogOptions, useCatalogItems } from '../../components/use-catalog'
import type { IntakeData, PlacementData } from '~/shared/domain/patient-care'
import {
  type AppointmentForm,
  type AppointmentBody,
  emptyAppointment,
  validateAppointment,
  toAppointmentInput,
  type IntakeForm,
  type IntakeBody,
  emptyIntake,
  intakeFromData,
  validateIntake,
  intakeHasErrors,
  toIntakeInput,
  emptyProgram,
  type PlacementForm,
  type PlacementBody,
  emptyPlacement,
  placementFromData,
  validatePlacement,
  placementHasErrors,
  toPlacementInput,
  emptyRegistry,
  type ViolationForm,
  type ViolationBody,
  emptyViolation,
  validateViolation,
  toViolationInput,
  type ReferralForm,
  type ReferralBody,
  emptyReferral,
  validateReferral,
  toReferralInput,
} from '../care.view-model'
import * as s from '../prontuario.css'

export type Picker = Readonly<{ value: string; label: string }>
const opt = (arr: readonly Picker[]) => arr.map((o) => ({ id: o.value, label: o.label }))
const hasKeys = (e: Record<string, unknown>): boolean => Object.keys(e).length > 0

function Actions(props: { busy: boolean; onCancel: () => void; onSave: () => void; label?: string }) {
  return (
    <div class={s.reasonActions}>
      <button type="button" class={s.ghostBtn} onClick={props.onCancel}>
        Cancelar
      </button>
      <button type="button" class={s.actionBtn} disabled={props.busy} onClick={props.onSave}>
        {props.busy ? 'Salvando…' : (props.label ?? 'Salvar')}
      </button>
    </div>
  )
}

// ===================== Atendimento (novo) =====================
export function AppointmentForm_(props: { busy: boolean; onSave: (p: AppointmentBody) => Promise<boolean>; onCancel: () => void }) {
  const [form, setForm] = createStore<AppointmentForm>(emptyAppointment())
  const [err, setErr] = createSignal<string | null>(null)
  const submit = async (): Promise<void> => {
    const tag = validateAppointment(form)
    if (tag) {
      setErr(tp(tag))
      return
    }
    await props.onSave(toAppointmentInput(form))
  }
  return (
    <div class={s.editPanel}>
      <TextField label="Tipo (opcional)" value={form.type} onInput={(v) => setForm({ type: v })} placeholder="Ex.: clínico, psicossocial" />
      <TextField label="Data (opcional)" type="date" value={form.date} onInput={(v) => setForm({ date: v })} />
      <TextField label="Resumo" value={form.summary} onInput={(v) => setForm({ summary: v })} placeholder="O que foi atendido" />
      <TextField label="Plano de ação" value={form.actionPlan} onInput={(v) => setForm({ actionPlan: v })} placeholder="Encaminhamentos/condutas" />
      <Show when={err()}>{(m) => <p class={s.fieldError}>{m()}</p>}</Show>
      <Actions busy={props.busy} onCancel={props.onCancel} onSave={() => void submit()} label="Registrar" />
    </div>
  )
}

// ===================== Ingresso (intake) =====================
export function IntakeForm_(props: { initial: IntakeData | null; busy: boolean; onSave: (p: IntakeBody) => Promise<boolean>; onCancel: () => void }) {
  const [form, setForm] = createStore<IntakeForm>(props.initial ? intakeFromData(props.initial) : emptyIntake())
  const [showErr, setShowErr] = createSignal(false)
  const ingressTypes = useCatalogOptions('dominio_tipo_ingresso')
  const programs = useCatalogOptions('dominio_programa_social')
  const errors = createMemo(() => validateIntake(form))
  const errFor = (k: 'ingressTypeId' | 'serviceReason'): string | undefined => {
    if (!showErr()) return undefined
    const tag = errors()[k]
    return tag ? tp(tag) : undefined
  }
  const progErr = (i: number): string | undefined => {
    if (!showErr()) return undefined
    const tag = errors().programs[i]
    return tag ? tp(tag) : undefined
  }
  const submit = async (): Promise<void> => {
    if (intakeHasErrors(errors())) {
      setShowErr(true)
      return
    }
    await props.onSave(toIntakeInput(form))
  }
  return (
    <div class={s.editPanel}>
      <SelectField label="Tipo de ingresso" value={form.ingressTypeId} onChange={(v) => setForm({ ingressTypeId: v })} placeholder="Selecionar…" options={ingressTypes()} error={errFor('ingressTypeId')} />
      <TextField label="Motivo do atendimento" value={form.serviceReason} onInput={(v) => setForm({ serviceReason: v })} error={errFor('serviceReason')} />
      <TextField label="Origem (nome, opcional)" value={form.originName} onInput={(v) => setForm({ originName: v })} />
      <TextField label="Origem (contato, opcional)" value={form.originContact} onInput={(v) => setForm({ originContact: v })} />
      <div class={s.sectionHead}>
        <span class={s.caption2}>Programas sociais ({form.linkedSocialPrograms.length})</span>
        <button type="button" class={s.linkBtn} onClick={() => setForm('linkedSocialPrograms', (a) => [...a, emptyProgram()])}>
          + programa
        </button>
      </div>
      <For each={form.linkedSocialPrograms}>
        {(p, i) => (
          <div class={s.subRow}>
            <SelectField label="Programa" value={p.programId} onChange={(v) => setForm('linkedSocialPrograms', i(), { programId: v })} placeholder="Selecionar…" options={programs()} error={progErr(i())} />
            <TextField label="Observação (opcional)" value={p.observation} onInput={(v) => setForm('linkedSocialPrograms', i(), { observation: v })} />
            <button type="button" class={s.dangerLink} onClick={() => setForm('linkedSocialPrograms', (a) => a.filter((_, idx) => idx !== i()))}>
              remover programa
            </button>
          </div>
        )}
      </For>
      <Actions busy={props.busy} onCancel={props.onCancel} onSave={() => void submit()} />
    </div>
  )
}

// ===================== Acolhimento (placement) =====================
export function PlacementForm_(props: {
  initial: PlacementData | null
  members: readonly Picker[]
  busy: boolean
  onSave: (p: PlacementBody) => Promise<boolean>
  onCancel: () => void
}) {
  const [form, setForm] = createStore<PlacementForm>(props.initial ? placementFromData(props.initial) : emptyPlacement())
  const [showErr, setShowErr] = createSignal(false)
  const memberOpts = createMemo(() => opt(props.members))
  const errors = createMemo(() => validatePlacement(form))
  const regErr = (i: number, k: 'memberId' | 'startDate' | 'reason'): string | undefined => {
    if (!showErr()) return undefined
    const tag = errors().registries[i]?.[k]
    return tag ? tp(tag) : undefined
  }
  const submit = async (): Promise<void> => {
    if (placementHasErrors(errors())) {
      setShowErr(true)
      return
    }
    await props.onSave(toPlacementInput(form))
  }
  return (
    <div class={s.editPanel}>
      <div class={s.sectionHead}>
        <span class={s.caption2}>Acolhimentos por membro ({form.registries.length})</span>
        <button type="button" class={s.linkBtn} onClick={() => setForm('registries', (a) => [...a, emptyRegistry()])}>
          + acolhimento
        </button>
      </div>
      <For each={form.registries}>
        {(r, i) => (
          <div class={s.subRow}>
            <SelectField label="Membro" value={r.memberId} onChange={(v) => setForm('registries', i(), { memberId: v })} placeholder="Selecionar…" options={memberOpts()} error={regErr(i(), 'memberId')} />
            <TextField label="Início" type="date" value={r.startDate} onInput={(v) => setForm('registries', i(), { startDate: v })} error={regErr(i(), 'startDate')} />
            <TextField label="Fim (opcional)" type="date" value={r.endDate} onInput={(v) => setForm('registries', i(), { endDate: v })} />
            <TextField label="Motivo" value={r.reason} onInput={(v) => setForm('registries', i(), { reason: v })} error={regErr(i(), 'reason')} />
            <button type="button" class={s.dangerLink} onClick={() => setForm('registries', (a) => a.filter((_, idx) => idx !== i()))}>
              remover acolhimento
            </button>
          </div>
        )}
      </For>
      <TextField label="Relato de perda de moradia (opcional)" value={form.homeLossReport} onInput={(v) => setForm({ homeLossReport: v })} />
      <TextField label="Relato de guarda por terceiros (opcional)" value={form.thirdPartyGuardReport} onInput={(v) => setForm({ thirdPartyGuardReport: v })} />
      <div class={s.checkRow}>
        <CheckboxField label="Adulto preso" checked={form.adultInPrison} onChange={(v) => setForm({ adultInPrison: v })} />
        <CheckboxField label="Adolescente em internação" checked={form.adolescentInInternment} onChange={(v) => setForm({ adolescentInInternment: v })} />
      </div>
      <Actions busy={props.busy} onCancel={props.onCancel} onSave={() => void submit()} />
    </div>
  )
}

// ===================== Violação de direitos (nova) =====================
export function ViolationForm_(props: { persons: readonly Picker[]; busy: boolean; onSave: (p: ViolationBody) => Promise<boolean>; onCancel: () => void }) {
  const [form, setForm] = createStore<ViolationForm>(emptyViolation())
  const [showErr, setShowErr] = createSignal(false)
  const violationTypes = useCatalogItems('dominio_tipo_violacao')
  const typeOptions = createMemo(() => violationTypes().map((i) => ({ id: i.id, label: i.descricao })))
  const personOpts = createMemo(() => opt(props.persons))
  const errors = createMemo(() => validateViolation(form))
  const errFor = (k: 'victimId' | 'violationTypeId' | 'descriptionOfFact'): string | undefined => {
    if (!showErr()) return undefined
    const tag = errors()[k]
    return tag ? tp(tag) : undefined
  }
  const submit = async (): Promise<void> => {
    if (hasKeys(errors())) {
      setShowErr(true)
      return
    }
    const code = violationTypes().find((i) => i.id === form.violationTypeId)?.codigo ?? ''
    await props.onSave(toViolationInput(form, code))
  }
  return (
    <div class={s.editPanel}>
      <SelectField label="Vítima" value={form.victimId} onChange={(v) => setForm({ victimId: v })} placeholder="Selecionar…" options={personOpts()} error={errFor('victimId')} />
      <SelectField label="Tipo de violação" value={form.violationTypeId} onChange={(v) => setForm({ violationTypeId: v })} placeholder="Selecionar…" options={typeOptions()} error={errFor('violationTypeId')} />
      <TextField label="Data do fato (opcional)" type="date" value={form.incidentDate} onInput={(v) => setForm({ incidentDate: v })} />
      <TextField label="Descrição do fato" value={form.descriptionOfFact} onInput={(v) => setForm({ descriptionOfFact: v })} error={errFor('descriptionOfFact')} />
      <TextField label="Providências tomadas (opcional)" value={form.actionsTaken} onInput={(v) => setForm({ actionsTaken: v })} />
      <Actions busy={props.busy} onCancel={props.onCancel} onSave={() => void submit()} label="Relatar" />
    </div>
  )
}

// ===================== Encaminhamento (novo) =====================
export function ReferralForm_(props: { persons: readonly Picker[]; busy: boolean; onSave: (p: ReferralBody) => Promise<boolean>; onCancel: () => void }) {
  const [form, setForm] = createStore<ReferralForm>(emptyReferral())
  const [showErr, setShowErr] = createSignal(false)
  const personOpts = createMemo(() => opt(props.persons))
  const errors = createMemo(() => validateReferral(form))
  const errFor = (k: 'referredPersonId' | 'destinationService' | 'reason'): string | undefined => {
    if (!showErr()) return undefined
    const tag = errors()[k]
    return tag ? tp(tag) : undefined
  }
  const submit = async (): Promise<void> => {
    if (hasKeys(errors())) {
      setShowErr(true)
      return
    }
    await props.onSave(toReferralInput(form))
  }
  return (
    <div class={s.editPanel}>
      <SelectField label="Pessoa encaminhada" value={form.referredPersonId} onChange={(v) => setForm({ referredPersonId: v })} placeholder="Selecionar…" options={personOpts()} error={errFor('referredPersonId')} />
      <TextField label="Serviço de destino" value={form.destinationService} onInput={(v) => setForm({ destinationService: v })} error={errFor('destinationService')} placeholder="Ex.: CRAS, CAPS" />
      <TextField label="Motivo" value={form.reason} onInput={(v) => setForm({ reason: v })} error={errFor('reason')} />
      <TextField label="Data (opcional)" type="date" value={form.date} onInput={(v) => setForm({ date: v })} />
      <Actions busy={props.busy} onCancel={props.onCancel} onSave={() => void submit()} label="Encaminhar" />
    </div>
  )
}
