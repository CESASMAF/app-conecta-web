// Núcleo familiar (US3): lista membros (nome resolvido no servidor + parentesco + flags) com ações de
// remover e definir cuidador principal; e um form para ADICIONAR membro criando a pessoa nos bastidores
// (caminho orquestrado). Toda ação devolve o overview recomposto → a lista reflete sem recarregar (FR-009).
import { Show, For, createSignal, createMemo } from 'solid-js'
import { createAsync } from '@solidjs/router'
import type { PatientOverview } from '~/shared/domain/patient-overview'
import type { PatientOverviewBinding } from '../patient-overview.binding'
import { domainCatalog } from '~/modules/domains/public-api'
import {
  emptyAddMember,
  validateAddMember,
  toAddMemberInput,
  hasAnyError,
  type AddMemberForm,
  type AddMemberField,
} from '../resumo-actions.view-model'
import { isOk } from '~/shared/http/result'
import { tp } from '~/shared/i18n/patients'
import { TextField, SelectField, CheckboxField } from '~/shared/ui/field.component'
import * as s from '../prontuario.css'

const todayIso = (): string => new Date().toISOString().slice(0, 10)

export function FamilySection(props: { overview: PatientOverview; b: PatientOverviewBinding }) {
  const [adding, setAdding] = createSignal(false)
  const [form, setForm] = createSignal<AddMemberForm>(emptyAddMember())
  const [showErr, setShowErr] = createSignal(false)
  const set = (patch: Partial<AddMemberForm>) => setForm((prev) => ({ ...prev, ...patch }))

  const rel = createAsync(() => domainCatalog('dominio_parentesco'))
  const relOptions = createMemo(() => {
    const r = rel()
    return r && isOk(r) ? r.value.map((i) => ({ id: i.id, label: i.descricao })) : []
  })

  const errors = createMemo(() => validateAddMember(form(), todayIso()))
  const errFor = (f: AddMemberField): string | undefined => {
    if (!showErr()) return undefined
    const tag = errors()[f]
    return tag ? tp(tag) : undefined
  }

  const members = () => props.overview.family.members

  const submit = async (): Promise<void> => {
    if (hasAnyError(errors())) {
      setShowErr(true)
      return
    }
    const okDone = await props.b.addFamilyMember(toAddMemberInput(form()))
    if (okDone) {
      setForm(emptyAddMember())
      setShowErr(false)
      setAdding(false)
    }
  }

  return (
    <section>
      <div class={s.sectionHead}>
        <h2 class={s.sectionTitle}>Núcleo familiar ({members().length})</h2>
        <Show when={!adding()}>
          <button type="button" class={s.linkBtn} onClick={() => setAdding(true)}>
            + membro
          </button>
        </Show>
      </div>

      <Show when={members().length > 0} fallback={<p class={s.muted}>Sem membros cadastrados.</p>}>
        <ul class={s.familyList}>
          <For each={members()}>
            {(m) => (
              <li class={s.familyRow}>
                <span>
                  {m.fullName || m.relationshipLabel}
                  <Show when={m.fullName}>
                    <span class={s.muted}> · {m.relationshipLabel}</span>
                  </Show>
                  <Show when={m.isPrimaryCaregiver}>
                    <span class={s.star}> · cuidador principal ★</span>
                  </Show>
                  <Show when={m.isResiding}>
                    <span class={s.muted}> · reside junto</span>
                  </Show>
                </span>
                <span class={s.rowActions}>
                  <Show when={!m.isPrimaryCaregiver}>
                    <button type="button" class={s.linkBtn} disabled={props.b.busy()} onClick={() => void props.b.setPrimaryCaregiver(m.memberPersonId)}>
                      tornar cuidador
                    </button>
                  </Show>
                  <button type="button" class={s.dangerLink} disabled={props.b.busy()} onClick={() => void props.b.removeFamilyMember(m.memberPersonId)}>
                    remover
                  </button>
                </span>
              </li>
            )}
          </For>
        </ul>
      </Show>

      <Show when={adding()}>
        <div class={s.editPanel}>
          <p class={s.caption2}>Novo membro</p>
          <TextField label="Nome completo" value={form().fullName} onInput={(v) => set({ fullName: v })} error={errFor('fullName')} autocomplete="name" />
          <TextField label="Data de nascimento" type="date" value={form().birthDate} onInput={(v) => set({ birthDate: v })} error={errFor('birthDate')} />
          <TextField label="CPF (opcional)" value={form().cpf} onInput={(v) => set({ cpf: v })} error={errFor('cpf')} inputMode="numeric" placeholder="Somente números" />
          <SelectField label="Parentesco" value={form().prRelationshipId} onChange={(v) => set({ prRelationshipId: v })} error={errFor('prRelationshipId')} placeholder="Selecionar…" options={relOptions()} />
          <div class={s.checkRow}>
            <CheckboxField label="Reside junto" checked={form().isResiding} onChange={(v) => set({ isResiding: v })} />
            <CheckboxField label="É cuidador(a)" checked={form().isCaregiver} onChange={(v) => set({ isCaregiver: v })} />
          </div>
          <div class={s.reasonActions}>
            <button
              type="button"
              class={s.ghostBtn}
              onClick={() => {
                setAdding(false)
                setShowErr(false)
              }}
            >
              Cancelar
            </button>
            <button type="button" class={s.actionBtn} disabled={props.b.busy()} onClick={() => void submit()}>
              Adicionar
            </button>
          </div>
        </div>
      </Show>
    </section>
  )
}
