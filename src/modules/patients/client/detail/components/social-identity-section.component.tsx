// Identidade social (US3): exibe o rótulo resolvido pelo servidor e permite editar (tipo do catálogo +
// descrição). O tipo vem de `dominio_tipo_identidade` (cache da 002 — nada fixo, SC-005). A regra de
// "descrição obrigatória" (indígena) é do backend (autoridade) → tratada como erro gracioso no envio.
import { Show, createSignal, createMemo } from 'solid-js'
import { createAsync } from '@solidjs/router'
import type { PatientOverview } from '~/shared/domain/patient-overview'
import type { PatientOverviewBinding } from '../patient-overview.binding'
import { domainCatalog } from '~/modules/domains/public-api'
import { emptySocialIdentity, validateSocialIdentity, toSocialIdentityInput, type SocialIdentityForm } from '../resumo-actions.view-model'
import { isOk } from '~/shared/http/result'
import { tp } from '~/shared/i18n/patients'
import { SelectField, TextField } from '~/shared/ui/field.component'
import * as s from '../prontuario.css'

export function SocialIdentitySection(props: { overview: PatientOverview; b: PatientOverviewBinding }) {
  const [editing, setEditing] = createSignal(false)
  const [form, setForm] = createSignal<SocialIdentityForm>(emptySocialIdentity())
  const [err, setErr] = createSignal<string | null>(null)
  const set = (patch: Partial<SocialIdentityForm>) => setForm((prev) => ({ ...prev, ...patch }))

  const types = createAsync(() => domainCatalog('dominio_tipo_identidade'))
  const typeOptions = createMemo(() => {
    const r = types()
    return r && isOk(r) ? r.value.map((i) => ({ id: i.id, label: i.descricao })) : []
  })

  const open = (): void => {
    const si = props.overview.socialIdentity
    setForm({ typeId: si?.typeId ?? '', description: si?.description ?? '' })
    setErr(null)
    setEditing(true)
  }

  const save = async (): Promise<void> => {
    const tag = validateSocialIdentity(form())
    if (tag) {
      setErr(tp(tag))
      return
    }
    const okDone = await props.b.updateSocialIdentity(toSocialIdentityInput(form()))
    if (okDone) setEditing(false)
  }

  return (
    <section>
      <div class={s.sectionHead}>
        <h2 class={s.sectionTitle}>Identidade social</h2>
        <Show when={!editing()}>
          <button type="button" class={s.linkBtn} onClick={open}>
            {props.overview.socialIdentity ? 'Editar' : 'Definir'}
          </button>
        </Show>
      </div>

      <Show
        when={editing()}
        fallback={
          <Show when={props.overview.socialIdentity} fallback={<p class={s.muted}>Não informada.</p>}>
            {(si) => (
              <p>
                {si().typeLabel}
                {si().description ? ` — ${si().description}` : ''}
              </p>
            )}
          </Show>
        }
      >
        <div class={s.editPanel}>
          <SelectField
            label="Tipo de identidade"
            value={form().typeId}
            onChange={(v) => set({ typeId: v })}
            placeholder="Selecionar…"
            options={typeOptions()}
            error={err() ?? undefined}
          />
          <TextField label="Descrição (se aplicável)" value={form().description} onInput={(v) => set({ description: v })} placeholder="Ex.: em aldeia" />
          <div class={s.reasonActions}>
            <button type="button" class={s.ghostBtn} onClick={() => setEditing(false)}>
              Cancelar
            </button>
            <button type="button" class={s.actionBtn} disabled={props.b.busy()} onClick={() => void save()}>
              Salvar
            </button>
          </div>
        </div>
      </Show>
    </section>
  )
}
