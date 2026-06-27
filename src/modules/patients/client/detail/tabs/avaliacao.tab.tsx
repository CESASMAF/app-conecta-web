// Aba AVALIAÇÃO (US4): lista as 7 seções com status preenchida/pendente (lê o agregado) e abre cada seção
// PLANA para edição (moradia, socioeconômico, rede de apoio, resumo social-sanitário). As 3 por-membro
// ficam "em construção" honesto (ADR-0011). Salvar marca preenchida sem recarregar a aba inteira (FR-009).
import { Show, For, createSignal, createMemo } from 'solid-js'
import { useAssessmentBinding } from '../assessment.binding'
import { SECTIONS, type Option } from '../assessment.view-model'
import {
  HousingSectionForm,
  SocioSectionForm,
  CommunitySectionForm,
  SummarySectionForm,
  WorkSectionForm,
  EducationSectionForm,
  HealthSectionForm,
} from '../components/assessment-forms.component'
import type { PatientOverview } from '~/shared/domain/patient-overview'
import type {
  AssessmentSectionKey,
  HousingConditionData,
  SocioEconomicData,
  CommunitySupportData,
  SocialHealthSummaryData,
  WorkAndIncomeData,
  EducationalStatusData,
  HealthStatusData,
} from '~/shared/domain/patient-assessment'
import { tp } from '~/shared/i18n/patients'
import * as s from '../prontuario.css'

export function AvaliacaoTab(props: { overview: PatientOverview }) {
  const b = useAssessmentBinding()
  const [editing, setEditing] = createSignal<AssessmentSectionKey | null>(null)
  const close = () => setEditing(null)

  // Membros da família (para os selects por-membro de trabalho/educação/saúde).
  const members = createMemo<Option[]>(() =>
    props.overview.family.members.map((m) => ({ value: m.memberPersonId, label: m.fullName || m.relationshipLabel })),
  )
  // Beneficiário de benefício social = paciente + membros da família.
  const beneficiaries = createMemo<Option[]>(() => [
    { value: props.overview.personId, label: `${props.overview.fullName || 'Paciente'} (paciente)` },
    ...members(),
  ])

  const saveAndClose = async (section: AssessmentSectionKey, payload: unknown): Promise<boolean> => {
    const okDone = await b.save(section, payload)
    if (okDone) close()
    return okDone
  }
  const busyFor = (key: AssessmentSectionKey) => b.busy() === key

  const renderForm = (key: AssessmentSectionKey) => {
    switch (key) {
      case 'housingCondition':
        return (
          <HousingSectionForm
            initial={b.sectionData('housingCondition') as HousingConditionData | null}
            busy={busyFor('housingCondition')}
            onSave={(p) => saveAndClose('housingCondition', p)}
            onCancel={close}
          />
        )
      case 'socioeconomicSituation':
        return (
          <SocioSectionForm
            initial={b.sectionData('socioeconomicSituation') as SocioEconomicData | null}
            beneficiaries={beneficiaries()}
            busy={busyFor('socioeconomicSituation')}
            onSave={(p) => saveAndClose('socioeconomicSituation', p)}
            onCancel={close}
          />
        )
      case 'communitySupportNetwork':
        return (
          <CommunitySectionForm
            initial={b.sectionData('communitySupportNetwork') as CommunitySupportData | null}
            busy={busyFor('communitySupportNetwork')}
            onSave={(p) => saveAndClose('communitySupportNetwork', p)}
            onCancel={close}
          />
        )
      case 'socialHealthSummary':
        return (
          <SummarySectionForm
            initial={b.sectionData('socialHealthSummary') as SocialHealthSummaryData | null}
            busy={busyFor('socialHealthSummary')}
            onSave={(p) => saveAndClose('socialHealthSummary', p)}
            onCancel={close}
          />
        )
      case 'workAndIncome':
        return (
          <WorkSectionForm
            initial={b.sectionData('workAndIncome') as WorkAndIncomeData | null}
            members={members()}
            beneficiaries={beneficiaries()}
            busy={busyFor('workAndIncome')}
            onSave={(p) => saveAndClose('workAndIncome', p)}
            onCancel={close}
          />
        )
      case 'educationalStatus':
        return (
          <EducationSectionForm
            initial={b.sectionData('educationalStatus') as EducationalStatusData | null}
            members={members()}
            busy={busyFor('educationalStatus')}
            onSave={(p) => saveAndClose('educationalStatus', p)}
            onCancel={close}
          />
        )
      case 'healthStatus':
        return (
          <HealthSectionForm
            initial={b.sectionData('healthStatus') as HealthStatusData | null}
            members={members()}
            busy={busyFor('healthStatus')}
            onSave={(p) => saveAndClose('healthStatus', p)}
            onCancel={close}
          />
        )
      default:
        return null
    }
  }

  return (
    <Show when={!b.pending()} fallback={<p class={s.muted}>Carregando avaliação…</p>}>
      <Show
        when={!b.loadError()}
        fallback={<p class={s.muted}>Não foi possível carregar a avaliação. Tente novamente.</p>}
      >
        <h2 class={s.sectionTitle}>Avaliação social</h2>
        <Show when={b.errTag()}>
          {(t) => (
            <div class={s.errorBanner} role="alert">
              {tp(t())}
            </div>
          )}
        </Show>
        <ul class={s.familyList}>
          <For each={SECTIONS}>
            {(sec) => (
              <li>
                <div class={s.assessmentRow}>
                  <span>
                    <span class={s.statusIcon}>{b.isFilled(sec.key) ? '✅' : '⬜'}</span> {sec.label}
                  </span>
                  <Show when={sec.tier === 'now'} fallback={<span class={s.muted}>em construção</span>}>
                    <Show
                      when={editing() !== sec.key}
                      fallback={
                        <button type="button" class={s.linkBtn} onClick={close}>
                          fechar
                        </button>
                      }
                    >
                      <button type="button" class={s.linkBtn} onClick={() => setEditing(sec.key)}>
                        {b.isFilled(sec.key) ? 'editar' : 'preencher'}
                      </button>
                    </Show>
                  </Show>
                </div>
                <Show when={editing() === sec.key ? sec.key : undefined} keyed>
                  {(key) => renderForm(key)}
                </Show>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </Show>
  )
}
