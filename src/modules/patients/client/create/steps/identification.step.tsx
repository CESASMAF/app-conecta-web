// Passo 1 — Identificação da pessoa (US2). 6 campos: nome, CPF (opcional), nascimento, nome da mãe, sexo,
// nacionalidade. View burra: lê/escreve via o binding e resolve a tag de erro do passo corrente.
import { TextField, RadioGroup } from '~/shared/ui/field.component'
import type { PatientCreateBinding } from '../patient-create.binding'
import { tp } from '~/shared/i18n/patients'
import type { WizardField } from '../patient-create.view-model'
import * as s from '../wizard.css'

const SEX_OPTIONS = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Feminino' },
  { value: 'O', label: 'Outro' },
] as const

export function IdentificationStep(props: { b: PatientCreateBinding }) {
  const b = props.b
  const err = (field: WizardField): string | undefined => {
    const tag = b.errorFor(field)
    return tag ? tp(tag) : undefined
  }
  return (
    <div class={s.form}>
      <p class={s.caption}>Passo 1 de 2 · Identificação</p>
      <TextField
        label="Nome completo"
        value={b.form.fullName}
        onInput={(v) => b.setField('fullName', v)}
        error={err('fullName')}
        autocomplete="name"
      />
      <TextField
        label="CPF (opcional)"
        value={b.form.cpf}
        onInput={(v) => b.setField('cpf', v)}
        error={err('cpf')}
        inputMode="numeric"
        placeholder="Somente números"
      />
      <TextField
        label="Data de nascimento"
        type="date"
        value={b.form.birthDate}
        onInput={(v) => b.setField('birthDate', v)}
        error={err('birthDate')}
      />
      <TextField
        label="Nome da mãe"
        value={b.form.motherName}
        onInput={(v) => b.setField('motherName', v)}
        error={err('motherName')}
      />
      <RadioGroup
        label="Sexo"
        name="sex"
        value={b.form.sex}
        onChange={(v) => b.setField('sex', v)}
        error={err('sex')}
        options={SEX_OPTIONS}
      />
      <TextField
        label="Nacionalidade"
        value={b.form.nationality}
        onInput={(v) => b.setField('nationality', v)}
        error={err('nationality')}
        placeholder="Ex.: Brasileira"
      />
    </div>
  )
}
