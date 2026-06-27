// Passo 2 — Diagnóstico inicial + responsável (US2). CID, data, descrição e parentesco do responsável
// (select do catálogo de domínio — nada fixo, SC-005). Degrada com aviso se o catálogo não carregar.
import { Show } from 'solid-js'
import { TextField, SelectField } from '~/shared/ui/field.component'
import type { PatientCreateBinding } from '../patient-create.binding'
import { tp } from '~/shared/i18n/patients'
import type { WizardField } from '../patient-create.view-model'
import * as s from '../wizard.css'

export function DiagnosisStep(props: { b: PatientCreateBinding }) {
  const b = props.b
  const err = (field: WizardField): string | undefined => {
    const tag = b.errorFor(field)
    return tag ? tp(tag) : undefined
  }
  return (
    <div class={s.form}>
      <p class={s.caption}>Passo 2 de 2 · Diagnóstico inicial</p>
      <TextField
        label="CID (código)"
        value={b.form.icdCode}
        onInput={(v) => b.setField('icdCode', v)}
        error={err('icdCode')}
        placeholder="Ex.: Q90"
      />
      <TextField
        label="Data do diagnóstico"
        type="date"
        value={b.form.diagnosisDate}
        onInput={(v) => b.setField('diagnosisDate', v)}
        error={err('diagnosisDate')}
      />
      <TextField
        label="Descrição"
        value={b.form.description}
        onInput={(v) => b.setField('description', v)}
        error={err('description')}
      />
      <Show
        when={!b.relationshipsUnavailable()}
        fallback={<p class={s.muted}>{tp('register.relationships.unavailable')}</p>}
      >
        <SelectField
          label="Parentesco do responsável"
          value={b.form.prRelationshipId}
          onChange={(v) => b.setField('prRelationshipId', v)}
          error={err('prRelationshipId')}
          placeholder="Selecionar…"
          options={b.relationshipOptions()}
        />
      </Show>
    </div>
  )
}
