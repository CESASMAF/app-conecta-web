// Tela-mãe do wizard de cadastro (composition — ADR-0012). Casca de 2 passos: stepper + passo corrente +
// navegação. Toda a lógica vive no binding; aqui só montamos a tela (mobile-first, FR-014).
import { Show } from 'solid-js'
import { A } from '@solidjs/router'
import { usePatientCreateBinding } from './patient-create.binding'
import { IdentificationStep } from './steps/identification.step'
import { DiagnosisStep } from './steps/diagnosis.step'
import { tp } from '~/shared/i18n/patients'
import * as s from './wizard.css'

export function PatientCreatePage() {
  const b = usePatientCreateBinding()

  return (
    <section class={s.wrap}>
      <A class={s.back} href="/patients">
        ← Pacientes
      </A>
      <header class={s.header}>
        <h1 class={s.title}>Novo paciente</h1>
        <div class={s.stepper} aria-label={`Passo ${b.step()} de 2`}>
          <span class={b.step() === 1 ? s.dotActive : s.dot} />
          <span class={s.stepLine} />
          <span class={b.step() === 2 ? s.dotActive : s.dot} />
        </div>
      </header>

      <Show when={b.submitErrorTag()}>
        {(tag) => (
          <div class={s.errorBox} role="alert">
            {tp(tag())}
          </div>
        )}
      </Show>

      <Show when={b.step() === 1} fallback={<DiagnosisStep b={b} />}>
        <IdentificationStep b={b} />
      </Show>

      <div class={s.actions}>
        <Show when={b.step() === 2}>
          <button type="button" class={s.btnGhost} onClick={b.back}>
            ← Voltar
          </button>
        </Show>
        <Show
          when={b.step() === 1}
          fallback={
            <button type="button" class={s.btnPrimary} disabled={b.pending()} onClick={() => void b.submitForm()}>
              {b.pending() ? 'Criando…' : 'Criar paciente'}
            </button>
          }
        >
          <button type="button" class={s.btnPrimary} onClick={b.next}>
            Próximo →
          </button>
        </Show>
      </div>
    </section>
  )
}
