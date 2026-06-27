// Formulários das 4 seções planas da Avaliação (US4): Moradia, Socioeconômico, Rede de apoio e Resumo
// social-sanitário. Views com estado de UI próprio (form local) e validação por seção ANTES de salvar.
// Os selects de moradia usam enums de CONTRATO (opções fixas); benefício usa catálogo de domínio.
import { Show, For, createSignal, createMemo } from 'solid-js'
import { createStore } from 'solid-js/store'
import { tp } from '~/shared/i18n/patients'
import { TextField, SelectField, CheckboxField } from '~/shared/ui/field.component'
import { useCatalogOptions } from '../../components/use-catalog'
import type {
  HousingConditionData,
  SocioEconomicData,
  CommunitySupportData,
  SocialHealthSummaryData,
  WorkAndIncomeData,
  EducationalStatusData,
  HealthStatusData,
} from '~/shared/domain/patient-assessment'
import {
  HOUSING_OPTIONS,
  type Option,
  type HousingForm,
  emptyHousing,
  housingFromData,
  validateHousing,
  toHousingInput,
  type SocioForm,
  emptySocio,
  socioFromData,
  validateSocio,
  socioHasErrors,
  toSocioInput,
  emptyBenefit,
  type CommunityForm,
  emptyCommunity,
  communityFromData,
  toCommunityInput,
  type SummaryForm,
  emptySummary,
  summaryFromData,
  toSummaryInput,
  hasErrors,
  type WorkForm,
  emptyWork,
  workFromData,
  validateWork,
  workHasErrors,
  toWorkInput,
  emptyIncome,
  type EduForm,
  emptyEdu,
  eduFromData,
  validateEdu,
  eduHasErrors,
  toEduInput,
  emptyEduProfile,
  emptyProgramOcc,
  type HealthForm,
  emptyHealth,
  healthFromData,
  validateHealth,
  healthHasErrors,
  toHealthInput,
  emptyDeficiency,
  emptyGestating,
} from '../assessment.view-model'
import * as s from '../prontuario.css'

const opt = (arr: readonly Option[]) => arr.map((o) => ({ id: o.value, label: o.label }))

function FormActions(props: { busy: boolean; onCancel: () => void; onSave: () => void; saveLabel?: string }) {
  return (
    <div class={s.reasonActions}>
      <button type="button" class={s.ghostBtn} onClick={props.onCancel}>
        Cancelar
      </button>
      <button type="button" class={s.actionBtn} disabled={props.busy} onClick={props.onSave}>
        {props.busy ? 'Salvando…' : (props.saveLabel ?? 'Salvar')}
      </button>
    </div>
  )
}

// ===================== Moradia =====================
export function HousingSectionForm(props: {
  initial: HousingConditionData | null
  busy: boolean
  onSave: (payload: unknown) => Promise<boolean>
  onCancel: () => void
}) {
  const [form, setForm] = createStore<HousingForm>(props.initial ? housingFromData(props.initial) : emptyHousing())
  const [showErr, setShowErr] = createSignal(false)
  const set = (patch: Partial<HousingForm>) => setForm(patch)
  const errors = createMemo(() => validateHousing(form))
  const errFor = (k: keyof HousingForm): string | undefined => {
    if (!showErr()) return undefined
    const tag = errors()[k]
    return tag ? tp(tag) : undefined
  }
  const submit = async (): Promise<void> => {
    if (hasErrors(errors())) {
      setShowErr(true)
      return
    }
    await props.onSave(toHousingInput(form))
  }
  return (
    <div class={s.editPanel}>
      <SelectField label="Tipo de moradia" value={form.type} onChange={(v) => set({ type: v })} placeholder="Selecionar…" options={opt(HOUSING_OPTIONS.type)} error={errFor('type')} />
      <SelectField label="Material das paredes" value={form.wallMaterial} onChange={(v) => set({ wallMaterial: v })} placeholder="Selecionar…" options={opt(HOUSING_OPTIONS.wallMaterial)} error={errFor('wallMaterial')} />
      <SelectField label="Abastecimento de água" value={form.waterSupply} onChange={(v) => set({ waterSupply: v })} placeholder="Selecionar…" options={opt(HOUSING_OPTIONS.waterSupply)} error={errFor('waterSupply')} />
      <SelectField label="Acesso à eletricidade" value={form.electricityAccess} onChange={(v) => set({ electricityAccess: v })} placeholder="Selecionar…" options={opt(HOUSING_OPTIONS.electricityAccess)} error={errFor('electricityAccess')} />
      <SelectField label="Esgotamento sanitário" value={form.sewageDisposal} onChange={(v) => set({ sewageDisposal: v })} placeholder="Selecionar…" options={opt(HOUSING_OPTIONS.sewageDisposal)} error={errFor('sewageDisposal')} />
      <SelectField label="Coleta de lixo" value={form.wasteCollection} onChange={(v) => set({ wasteCollection: v })} placeholder="Selecionar…" options={opt(HOUSING_OPTIONS.wasteCollection)} error={errFor('wasteCollection')} />
      <SelectField label="Nível de acessibilidade" value={form.accessibilityLevel} onChange={(v) => set({ accessibilityLevel: v })} placeholder="Selecionar…" options={opt(HOUSING_OPTIONS.accessibilityLevel)} error={errFor('accessibilityLevel')} />
      <TextField label="Nº de cômodos" type="number" inputMode="numeric" value={form.numberOfRooms} onInput={(v) => set({ numberOfRooms: v })} error={errFor('numberOfRooms')} />
      <TextField label="Nº de quartos" type="number" inputMode="numeric" value={form.numberOfBedrooms} onInput={(v) => set({ numberOfBedrooms: v })} error={errFor('numberOfBedrooms')} />
      <TextField label="Nº de banheiros" type="number" inputMode="numeric" value={form.numberOfBathrooms} onInput={(v) => set({ numberOfBathrooms: v })} error={errFor('numberOfBathrooms')} />
      <div class={s.checkRow}>
        <CheckboxField label="Água encanada" checked={form.hasPipedWater} onChange={(v) => set({ hasPipedWater: v })} />
        <CheckboxField label="Área de risco geográfico" checked={form.isInGeographicRiskArea} onChange={(v) => set({ isInGeographicRiskArea: v })} />
        <CheckboxField label="Acesso difícil" checked={form.hasDifficultAccess} onChange={(v) => set({ hasDifficultAccess: v })} />
        <CheckboxField label="Área de conflito social" checked={form.isInSocialConflictArea} onChange={(v) => set({ isInSocialConflictArea: v })} />
        <CheckboxField label="Observações diagnósticas" checked={form.hasDiagnosticObservations} onChange={(v) => set({ hasDiagnosticObservations: v })} />
      </div>
      <FormActions busy={props.busy} onCancel={props.onCancel} onSave={() => void submit()} />
    </div>
  )
}

// ===================== Socioeconômico =====================
export function SocioSectionForm(props: {
  initial: SocioEconomicData | null
  beneficiaries: readonly Option[]
  busy: boolean
  onSave: (payload: unknown) => Promise<boolean>
  onCancel: () => void
}) {
  const [form, setForm] = createStore<SocioForm>(props.initial ? socioFromData(props.initial) : emptySocio())
  const [showErr, setShowErr] = createSignal(false)
  const benefitTypeOptions = useCatalogOptions('dominio_tipo_beneficio')
  const errors = createMemo(() => validateSocio(form))
  const errScalar = (k: 'totalFamilyIncome' | 'incomePerCapita' | 'mainSourceOfIncome'): string | undefined => {
    if (!showErr()) return undefined
    const tag = errors()[k]
    return tag ? tp(tag) : undefined
  }
  const errBenefit = (i: number, k: 'benefitName' | 'amount' | 'beneficiaryId'): string | undefined => {
    if (!showErr()) return undefined
    const tag = errors().benefits[i]?.[k]
    return tag ? tp(tag) : undefined
  }
  const submit = async (): Promise<void> => {
    if (socioHasErrors(errors())) {
      setShowErr(true)
      return
    }
    await props.onSave(toSocioInput(form))
  }
  return (
    <div class={s.editPanel}>
      <TextField label="Renda familiar total (R$)" type="number" inputMode="numeric" value={form.totalFamilyIncome} onInput={(v) => setForm({ totalFamilyIncome: v })} error={errScalar('totalFamilyIncome')} />
      <TextField label="Renda per capita (R$)" type="number" inputMode="numeric" value={form.incomePerCapita} onInput={(v) => setForm({ incomePerCapita: v })} error={errScalar('incomePerCapita')} />
      <TextField label="Principal fonte de renda" value={form.mainSourceOfIncome} onInput={(v) => setForm({ mainSourceOfIncome: v })} error={errScalar('mainSourceOfIncome')} placeholder="Ex.: trabalho informal" />
      <div class={s.checkRow}>
        <CheckboxField label="Recebe benefício social" checked={form.receivesSocialBenefit} onChange={(v) => setForm({ receivesSocialBenefit: v })} />
        <CheckboxField label="Há desempregados" checked={form.hasUnemployed} onChange={(v) => setForm({ hasUnemployed: v })} />
      </div>

      <div class={s.sectionHead}>
        <span class={s.caption2}>Benefícios sociais ({form.socialBenefits.length})</span>
        <button type="button" class={s.linkBtn} onClick={() => setForm('socialBenefits', (b) => [...b, emptyBenefit()])}>
          + benefício
        </button>
      </div>
      <For each={form.socialBenefits}>
        {(b, i) => (
          <div class={s.subRow}>
            <TextField label="Nome do benefício" value={b.benefitName} onInput={(v) => setForm('socialBenefits', i(), { benefitName: v })} error={errBenefit(i(), 'benefitName')} />
            <TextField label="Valor (R$)" type="number" inputMode="numeric" value={b.amount} onInput={(v) => setForm('socialBenefits', i(), { amount: v })} error={errBenefit(i(), 'amount')} />
            <SelectField label="Beneficiário" value={b.beneficiaryId} onChange={(v) => setForm('socialBenefits', i(), { beneficiaryId: v })} placeholder="Selecionar…" options={props.beneficiaries.map((o) => ({ id: o.value, label: o.label }))} error={errBenefit(i(), 'beneficiaryId')} />
            <SelectField label="Tipo de benefício (opcional)" value={b.benefitTypeId} onChange={(v) => setForm('socialBenefits', i(), { benefitTypeId: v })} placeholder="Selecionar…" options={benefitTypeOptions()} />
            <button type="button" class={s.dangerLink} onClick={() => setForm('socialBenefits', (arr) => arr.filter((_, idx) => idx !== i()))}>
              remover benefício
            </button>
          </div>
        )}
      </For>

      <FormActions busy={props.busy} onCancel={props.onCancel} onSave={() => void submit()} />
    </div>
  )
}

// ===================== Rede de apoio =====================
export function CommunitySectionForm(props: {
  initial: CommunitySupportData | null
  busy: boolean
  onSave: (payload: unknown) => Promise<boolean>
  onCancel: () => void
}) {
  const [form, setForm] = createStore<CommunityForm>(props.initial ? communityFromData(props.initial) : emptyCommunity())
  return (
    <div class={s.editPanel}>
      <div class={s.checkRow}>
        <CheckboxField label="Apoio de familiares" checked={form.hasRelativeSupport} onChange={(v) => setForm({ hasRelativeSupport: v })} />
        <CheckboxField label="Apoio de vizinhos" checked={form.hasNeighborSupport} onChange={(v) => setForm({ hasNeighborSupport: v })} />
        <CheckboxField label="Paciente participa de grupos" checked={form.patientParticipatesInGroups} onChange={(v) => setForm({ patientParticipatesInGroups: v })} />
        <CheckboxField label="Família participa de grupos" checked={form.familyParticipatesInGroups} onChange={(v) => setForm({ familyParticipatesInGroups: v })} />
        <CheckboxField label="Paciente tem acesso a lazer" checked={form.patientHasAccessToLeisure} onChange={(v) => setForm({ patientHasAccessToLeisure: v })} />
        <CheckboxField label="Enfrenta discriminação" checked={form.facesDiscrimination} onChange={(v) => setForm({ facesDiscrimination: v })} />
      </div>
      <TextField label="Conflitos familiares (se houver)" value={form.familyConflicts} onInput={(v) => setForm({ familyConflicts: v })} placeholder="Descreva, se aplicável" />
      <FormActions busy={props.busy} onCancel={props.onCancel} onSave={() => void props.onSave(toCommunityInput(form))} />
    </div>
  )
}

// ===================== Resumo social-sanitário =====================
export function SummarySectionForm(props: {
  initial: SocialHealthSummaryData | null
  busy: boolean
  onSave: (payload: unknown) => Promise<boolean>
  onCancel: () => void
}) {
  const [form, setForm] = createStore<SummaryForm>(props.initial ? summaryFromData(props.initial) : emptySummary())
  return (
    <div class={s.editPanel}>
      <div class={s.checkRow}>
        <CheckboxField label="Requer cuidado constante" checked={form.requiresConstantCare} onChange={(v) => setForm({ requiresConstantCare: v })} />
        <CheckboxField label="Tem limitação de mobilidade" checked={form.hasMobilityImpairment} onChange={(v) => setForm({ hasMobilityImpairment: v })} />
        <CheckboxField label="Terapia medicamentosa relevante" checked={form.hasRelevantDrugTherapy} onChange={(v) => setForm({ hasRelevantDrugTherapy: v })} />
      </div>
      <div class={s.sectionHead}>
        <span class={s.caption2}>Dependências funcionais ({form.functionalDependencies.length})</span>
        <button type="button" class={s.linkBtn} onClick={() => setForm('functionalDependencies', (d) => [...d, ''])}>
          + item
        </button>
      </div>
      <For each={form.functionalDependencies}>
        {(dep, i) => (
          <div class={s.subRow}>
            <TextField label={`Dependência ${i() + 1}`} value={dep} onInput={(v) => setForm('functionalDependencies', i(), v)} placeholder="Ex.: locomoção" />
            <button type="button" class={s.dangerLink} onClick={() => setForm('functionalDependencies', (arr) => arr.filter((_, idx) => idx !== i()))}>
              remover
            </button>
          </div>
        )}
      </For>
      <FormActions busy={props.busy} onCancel={props.onCancel} onSave={() => void props.onSave(toSummaryInput(form))} />
    </div>
  )
}

// ===================== Trabalho e renda (por membro) =====================
export function WorkSectionForm(props: {
  initial: WorkAndIncomeData | null
  members: readonly Option[]
  beneficiaries: readonly Option[]
  busy: boolean
  onSave: (payload: unknown) => Promise<boolean>
  onCancel: () => void
}) {
  const [form, setForm] = createStore<WorkForm>(props.initial ? workFromData(props.initial) : emptyWork())
  const [showErr, setShowErr] = createSignal(false)
  const occupations = useCatalogOptions('dominio_condicao_ocupacao')
  const benefitTypes = useCatalogOptions('dominio_tipo_beneficio')
  const errors = createMemo(() => validateWork(form))
  const memberOpts = createMemo(() => opt(props.members))
  const beneficiaryOpts = createMemo(() => opt(props.beneficiaries))
  const incErr = (i: number, k: 'memberId' | 'occupationId' | 'monthlyAmount'): string | undefined => {
    if (!showErr()) return undefined
    const tag = errors().incomes[i]?.[k]
    return tag ? tp(tag) : undefined
  }
  const benErr = (i: number, k: 'benefitName' | 'amount' | 'beneficiaryId'): string | undefined => {
    if (!showErr()) return undefined
    const tag = errors().benefits[i]?.[k]
    return tag ? tp(tag) : undefined
  }
  const submit = async (): Promise<void> => {
    if (workHasErrors(errors())) {
      setShowErr(true)
      return
    }
    await props.onSave(toWorkInput(form))
  }
  return (
    <div class={s.editPanel}>
      <CheckboxField label="Há aposentados na família" checked={form.hasRetiredMembers} onChange={(v) => setForm({ hasRetiredMembers: v })} />
      <div class={s.sectionHead}>
        <span class={s.caption2}>Renda por membro ({form.individualIncomes.length})</span>
        <button type="button" class={s.linkBtn} onClick={() => setForm('individualIncomes', (a) => [...a, emptyIncome()])}>
          + renda
        </button>
      </div>
      <For each={form.individualIncomes}>
        {(row, i) => (
          <div class={s.subRow}>
            <SelectField label="Membro" value={row.memberId} onChange={(v) => setForm('individualIncomes', i(), { memberId: v })} placeholder="Selecionar…" options={memberOpts()} error={incErr(i(), 'memberId')} />
            <SelectField label="Ocupação" value={row.occupationId} onChange={(v) => setForm('individualIncomes', i(), { occupationId: v })} placeholder="Selecionar…" options={occupations()} error={incErr(i(), 'occupationId')} />
            <TextField label="Renda mensal (R$)" type="number" inputMode="numeric" value={row.monthlyAmount} onInput={(v) => setForm('individualIncomes', i(), { monthlyAmount: v })} error={incErr(i(), 'monthlyAmount')} />
            <CheckboxField label="Tem carteira assinada" checked={row.hasWorkCard} onChange={(v) => setForm('individualIncomes', i(), { hasWorkCard: v })} />
            <button type="button" class={s.dangerLink} onClick={() => setForm('individualIncomes', (a) => a.filter((_, idx) => idx !== i()))}>
              remover renda
            </button>
          </div>
        )}
      </For>
      <div class={s.sectionHead}>
        <span class={s.caption2}>Benefícios sociais ({form.socialBenefits.length})</span>
        <button type="button" class={s.linkBtn} onClick={() => setForm('socialBenefits', (a) => [...a, emptyBenefit()])}>
          + benefício
        </button>
      </div>
      <For each={form.socialBenefits}>
        {(b, i) => (
          <div class={s.subRow}>
            <TextField label="Nome do benefício" value={b.benefitName} onInput={(v) => setForm('socialBenefits', i(), { benefitName: v })} error={benErr(i(), 'benefitName')} />
            <TextField label="Valor (R$)" type="number" inputMode="numeric" value={b.amount} onInput={(v) => setForm('socialBenefits', i(), { amount: v })} error={benErr(i(), 'amount')} />
            <SelectField label="Beneficiário" value={b.beneficiaryId} onChange={(v) => setForm('socialBenefits', i(), { beneficiaryId: v })} placeholder="Selecionar…" options={beneficiaryOpts()} error={benErr(i(), 'beneficiaryId')} />
            <SelectField label="Tipo de benefício (opcional)" value={b.benefitTypeId} onChange={(v) => setForm('socialBenefits', i(), { benefitTypeId: v })} placeholder="Selecionar…" options={benefitTypes()} />
            <button type="button" class={s.dangerLink} onClick={() => setForm('socialBenefits', (a) => a.filter((_, idx) => idx !== i()))}>
              remover benefício
            </button>
          </div>
        )}
      </For>
      <FormActions busy={props.busy} onCancel={props.onCancel} onSave={() => void submit()} />
    </div>
  )
}

// ===================== Educação (por membro) =====================
export function EducationSectionForm(props: {
  initial: EducationalStatusData | null
  members: readonly Option[]
  busy: boolean
  onSave: (payload: unknown) => Promise<boolean>
  onCancel: () => void
}) {
  const [form, setForm] = createStore<EduForm>(props.initial ? eduFromData(props.initial) : emptyEdu())
  const [showErr, setShowErr] = createSignal(false)
  const eduLevels = useCatalogOptions('dominio_escolaridade')
  const effects = useCatalogOptions('dominio_efeito_condicionalidade')
  const errors = createMemo(() => validateEdu(form))
  const memberOpts = createMemo(() => opt(props.members))
  const profErr = (i: number, k: 'memberId' | 'educationLevelId'): string | undefined => {
    if (!showErr()) return undefined
    const tag = errors().profiles[i]?.[k]
    return tag ? tp(tag) : undefined
  }
  const occErr = (i: number, k: 'memberId' | 'date' | 'effectId'): string | undefined => {
    if (!showErr()) return undefined
    const tag = errors().occurrences[i]?.[k]
    return tag ? tp(tag) : undefined
  }
  const submit = async (): Promise<void> => {
    if (eduHasErrors(errors())) {
      setShowErr(true)
      return
    }
    await props.onSave(toEduInput(form))
  }
  return (
    <div class={s.editPanel}>
      <div class={s.sectionHead}>
        <span class={s.caption2}>Perfis por membro ({form.memberProfiles.length})</span>
        <button type="button" class={s.linkBtn} onClick={() => setForm('memberProfiles', (a) => [...a, emptyEduProfile()])}>
          + perfil
        </button>
      </div>
      <For each={form.memberProfiles}>
        {(p, i) => (
          <div class={s.subRow}>
            <SelectField label="Membro" value={p.memberId} onChange={(v) => setForm('memberProfiles', i(), { memberId: v })} placeholder="Selecionar…" options={memberOpts()} error={profErr(i(), 'memberId')} />
            <SelectField label="Escolaridade" value={p.educationLevelId} onChange={(v) => setForm('memberProfiles', i(), { educationLevelId: v })} placeholder="Selecionar…" options={eduLevels()} error={profErr(i(), 'educationLevelId')} />
            <CheckboxField label="Sabe ler e escrever" checked={p.canReadWrite} onChange={(v) => setForm('memberProfiles', i(), { canReadWrite: v })} />
            <CheckboxField label="Frequenta escola" checked={p.attendsSchool} onChange={(v) => setForm('memberProfiles', i(), { attendsSchool: v })} />
            <button type="button" class={s.dangerLink} onClick={() => setForm('memberProfiles', (a) => a.filter((_, idx) => idx !== i()))}>
              remover perfil
            </button>
          </div>
        )}
      </For>
      <div class={s.sectionHead}>
        <span class={s.caption2}>Ocorrências de programa ({form.programOccurrences.length})</span>
        <button type="button" class={s.linkBtn} onClick={() => setForm('programOccurrences', (a) => [...a, emptyProgramOcc()])}>
          + ocorrência
        </button>
      </div>
      <For each={form.programOccurrences}>
        {(o, i) => (
          <div class={s.subRow}>
            <SelectField label="Membro" value={o.memberId} onChange={(v) => setForm('programOccurrences', i(), { memberId: v })} placeholder="Selecionar…" options={memberOpts()} error={occErr(i(), 'memberId')} />
            <TextField label="Data" type="date" value={o.date} onInput={(v) => setForm('programOccurrences', i(), { date: v })} error={occErr(i(), 'date')} />
            <SelectField label="Efeito da condicionalidade" value={o.effectId} onChange={(v) => setForm('programOccurrences', i(), { effectId: v })} placeholder="Selecionar…" options={effects()} error={occErr(i(), 'effectId')} />
            <CheckboxField label="Suspensão solicitada" checked={o.isSuspensionRequested} onChange={(v) => setForm('programOccurrences', i(), { isSuspensionRequested: v })} />
            <button type="button" class={s.dangerLink} onClick={() => setForm('programOccurrences', (a) => a.filter((_, idx) => idx !== i()))}>
              remover ocorrência
            </button>
          </div>
        )}
      </For>
      <FormActions busy={props.busy} onCancel={props.onCancel} onSave={() => void submit()} />
    </div>
  )
}

// ===================== Saúde (por membro) =====================
export function HealthSectionForm(props: {
  initial: HealthStatusData | null
  members: readonly Option[]
  busy: boolean
  onSave: (payload: unknown) => Promise<boolean>
  onCancel: () => void
}) {
  const [form, setForm] = createStore<HealthForm>(props.initial ? healthFromData(props.initial) : emptyHealth())
  const [showErr, setShowErr] = createSignal(false)
  const deficiencyTypes = useCatalogOptions('dominio_tipo_deficiencia')
  const errors = createMemo(() => validateHealth(form))
  const memberOpts = createMemo(() => opt(props.members))
  const defErr = (i: number, k: 'memberId' | 'deficiencyTypeId'): string | undefined => {
    if (!showErr()) return undefined
    const tag = errors().deficiencies[i]?.[k]
    return tag ? tp(tag) : undefined
  }
  const gestErr = (i: number, k: 'memberId' | 'monthsGestation'): string | undefined => {
    if (!showErr()) return undefined
    const tag = errors().gestating[i]?.[k]
    return tag ? tp(tag) : undefined
  }
  const submit = async (): Promise<void> => {
    if (healthHasErrors(errors())) {
      setShowErr(true)
      return
    }
    await props.onSave(toHealthInput(form))
  }
  return (
    <div class={s.editPanel}>
      <CheckboxField label="Insegurança alimentar" checked={form.foodInsecurity} onChange={(v) => setForm({ foodInsecurity: v })} />
      <div class={s.sectionHead}>
        <span class={s.caption2}>Deficiências ({form.deficiencies.length})</span>
        <button type="button" class={s.linkBtn} onClick={() => setForm('deficiencies', (a) => [...a, emptyDeficiency()])}>
          + deficiência
        </button>
      </div>
      <For each={form.deficiencies}>
        {(x, i) => (
          <div class={s.subRow}>
            <SelectField label="Membro" value={x.memberId} onChange={(v) => setForm('deficiencies', i(), { memberId: v })} placeholder="Selecionar…" options={memberOpts()} error={defErr(i(), 'memberId')} />
            <SelectField label="Tipo de deficiência" value={x.deficiencyTypeId} onChange={(v) => setForm('deficiencies', i(), { deficiencyTypeId: v })} placeholder="Selecionar…" options={deficiencyTypes()} error={defErr(i(), 'deficiencyTypeId')} />
            <CheckboxField label="Precisa de cuidado constante" checked={x.needsConstantCare} onChange={(v) => setForm('deficiencies', i(), { needsConstantCare: v })} />
            <TextField label="Cuidador responsável (opcional)" value={x.responsibleCaregiverName} onInput={(v) => setForm('deficiencies', i(), { responsibleCaregiverName: v })} />
            <button type="button" class={s.dangerLink} onClick={() => setForm('deficiencies', (a) => a.filter((_, idx) => idx !== i()))}>
              remover deficiência
            </button>
          </div>
        )}
      </For>
      <div class={s.sectionHead}>
        <span class={s.caption2}>Gestantes ({form.gestatingMembers.length})</span>
        <button type="button" class={s.linkBtn} onClick={() => setForm('gestatingMembers', (a) => [...a, emptyGestating()])}>
          + gestante
        </button>
      </div>
      <For each={form.gestatingMembers}>
        {(g, i) => (
          <div class={s.subRow}>
            <SelectField label="Membro" value={g.memberId} onChange={(v) => setForm('gestatingMembers', i(), { memberId: v })} placeholder="Selecionar…" options={memberOpts()} error={gestErr(i(), 'memberId')} />
            <TextField label="Meses de gestação (0–12)" type="number" inputMode="numeric" value={g.monthsGestation} onInput={(v) => setForm('gestatingMembers', i(), { monthsGestation: v })} error={gestErr(i(), 'monthsGestation')} />
            <CheckboxField label="Iniciou pré-natal" checked={g.startedPrenatalCare} onChange={(v) => setForm('gestatingMembers', i(), { startedPrenatalCare: v })} />
            <button type="button" class={s.dangerLink} onClick={() => setForm('gestatingMembers', (a) => a.filter((_, idx) => idx !== i()))}>
              remover gestante
            </button>
          </div>
        )}
      </For>
      <div class={s.sectionHead}>
        <span class={s.caption2}>Necessidades de cuidado constante ({form.constantCareNeeds.length})</span>
        <button type="button" class={s.linkBtn} onClick={() => setForm('constantCareNeeds', (a) => [...a, ''])}>
          + item
        </button>
      </div>
      <For each={form.constantCareNeeds}>
        {(need, i) => (
          <div class={s.subRow}>
            <TextField label={`Item ${i() + 1}`} value={need} onInput={(v) => setForm('constantCareNeeds', i(), v)} placeholder="Ex.: medicação contínua" />
            <button type="button" class={s.dangerLink} onClick={() => setForm('constantCareNeeds', (a) => a.filter((_, idx) => idx !== i()))}>
              remover
            </button>
          </div>
        )}
      </For>
      <FormActions busy={props.busy} onCancel={props.onCancel} onSave={() => void submit()} />
    </div>
  )
}
