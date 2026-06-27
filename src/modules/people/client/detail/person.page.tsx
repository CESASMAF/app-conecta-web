// Tela de detalhe da pessoa (Admin/RH): dados + status + ações de acesso (ativar/desativar, redefinir
// senha) + papéis (atribuir / ativar / desativar) + editar dados. Toda mutação re-lê o estado (binding).
import { Show, For, createSignal, createMemo } from 'solid-js'
import { A } from '@solidjs/router'
import { createStore } from 'solid-js/store'
import { usePersonBinding } from './person.binding'
import { TextField, SelectField } from '~/shared/ui/field.component'
import { formatDate } from '~/shared/date'
import { tpe, type PeopleTag } from '~/shared/i18n/people'
import {
  personFromOverview,
  validatePersonEdit,
  toUpdateBody,
  hasErrors,
  emptyAssignRole,
  validateAssignRole,
  toAssignRoleBody,
  ROLE_SYSTEMS,
  COMMON_ROLES,
  type PersonForm,
  type PersonField,
  type AssignRoleForm,
} from '../person-form.view-model'
import * as s from '../people.css'

const todayIso = (): string => new Date().toISOString().slice(0, 10)

export function PersonDetailPage() {
  const b = usePersonBinding()
  const [editing, setEditing] = createSignal(false)
  const [assigning, setAssigning] = createSignal(false)

  return (
    <Show when={!b.pending()} fallback={<div class={s.panel}>Carregando…</div>}>
      <Show
        when={!b.notFound()}
        fallback={
          <section class={s.wrap}>
            <div class={s.panel} role="alert">
              <p>{tpe('people.error.notFound')}</p>
              <A class={s.back} href="/people">
                Voltar à lista
              </A>
            </div>
          </section>
        }
      >
        <Show
          when={b.data()}
          fallback={
            <section class={s.wrap}>
              <div class={s.panel} role="alert">
                <p>{tpe(b.loadErrorTag() ?? 'people.error.generic')}</p>
                <A class={s.back} href="/people">
                  Voltar à lista
                </A>
              </div>
            </section>
          }
        >
          {(d) => (
            <section class={s.wrap}>
              <A class={s.back} href="/people">
                ← Pessoas
              </A>
              <header class={s.detailHeader}>
                <h1 class={s.title}>{d().fullName || 'Pessoa'}</h1>
                <span class={d().active ? s.badge : s.badgeOff}>{d().active ? tpe('people.active') : tpe('people.inactive')}</span>
              </header>
              <p class={s.sub}>Nascimento: {formatDate(d().birthDate) || '—'}</p>

              <Show when={b.errTag()}>{(t) => <div class={s.errorBanner} role="alert">{tpe(t())}</div>}</Show>
              <Show when={b.info()}>{(m) => <div class={s.warnBanner}>{m()}</div>}</Show>

              {/* Ações de acesso */}
              <div class={s.rowActions}>
                <Show when={d().active} fallback={
                  <button type="button" class={s.btnPrimary} disabled={b.busy()} onClick={() => void b.setActive(true)}>Reativar</button>
                }>
                  <button type="button" class={s.btnGhost} disabled={b.busy()} onClick={() => void b.setActive(false)}>Desativar</button>
                </Show>
                <button type="button" class={s.btnGhost} disabled={b.busy()} onClick={() => void b.requestPasswordReset()}>Redefinir senha</button>
                <Show when={!editing()}>
                  <button type="button" class={s.linkBtn} onClick={() => setEditing(true)}>Editar dados</button>
                </Show>
              </div>

              {/* Edição de dados */}
              <Show when={editing()}>
                <EditPanel b={b} initial={d()} onClose={() => setEditing(false)} />
              </Show>

              {/* Papéis */}
              <div class={s.sectionHead}>
                <h2 class={s.sectionTitle}>Papéis ({b.roleList().length})</h2>
                <Show when={!assigning()} fallback={<button type="button" class={s.linkBtn} onClick={() => setAssigning(false)}>fechar</button>}>
                  <button type="button" class={s.linkBtn} onClick={() => setAssigning(true)}>+ atribuir papel</button>
                </Show>
              </div>
              <Show when={assigning()}>
                <AssignPanel b={b} onClose={() => setAssigning(false)} />
              </Show>
              <Show when={b.roleList().length > 0} fallback={<p class={s.muted}>Nenhum papel atribuído.</p>}>
                <ul class={s.list}>
                  <For each={b.roleList()}>
                    {(r) => (
                      <li class={s.roleRow}>
                        <span>
                          <span class={s.name}>{r.role}</span>
                          <span class={s.sub}> · {r.system}</span>
                          <Show when={!r.active}><span class={s.sub}> · inativo</span></Show>
                        </span>
                        <Show when={r.active} fallback={
                          <button type="button" class={s.linkBtn} disabled={b.busy()} onClick={() => void b.setRoleActive(r.id, true)}>reativar</button>
                        }>
                          <button type="button" class={s.linkBtn} disabled={b.busy()} onClick={() => void b.setRoleActive(r.id, false)}>desativar</button>
                        </Show>
                      </li>
                    )}
                  </For>
                </ul>
              </Show>
            </section>
          )}
        </Show>
      </Show>
    </Show>
  )
}

function EditPanel(props: { b: ReturnType<typeof usePersonBinding>; initial: { fullName: string; birthDate: string }; onClose: () => void }) {
  const [form, setForm] = createStore<PersonForm>(personFromOverview(props.initial))
  const [showErr, setShowErr] = createSignal(false)
  const errors = createMemo(() => validatePersonEdit(form, todayIso()))
  const err = (f: PersonField): string | undefined => {
    if (!showErr()) return undefined
    const tag = errors()[f]
    return tag ? tpe(tag as PeopleTag) : undefined
  }
  const save = async (): Promise<void> => {
    if (hasErrors(errors())) {
      setShowErr(true)
      return
    }
    const okDone = await props.b.update(toUpdateBody(form))
    if (okDone) props.onClose()
  }
  return (
    <div class={s.panel}>
      <p class={s.muted}>Campos em branco preservam o valor atual.</p>
      <TextField label="Nome completo" value={form.fullName} onInput={(v) => setForm({ fullName: v })} error={err('fullName')} />
      <TextField label="Data de nascimento" type="date" value={form.birthDate} onInput={(v) => setForm({ birthDate: v })} error={err('birthDate')} />
      <TextField label="CPF (opcional)" value={form.cpf} onInput={(v) => setForm({ cpf: v })} error={err('cpf')} inputMode="numeric" placeholder="Somente números" />
      <TextField label="E-mail (opcional)" type="email" value={form.email} onInput={(v) => setForm({ email: v })} error={err('email')} />
      <div class={s.actions}>
        <button type="button" class={s.btnGhost} onClick={props.onClose}>Cancelar</button>
        <button type="button" class={s.btnPrimary} disabled={props.b.busy()} onClick={() => void save()}>Salvar</button>
      </div>
    </div>
  )
}

function AssignPanel(props: { b: ReturnType<typeof usePersonBinding>; onClose: () => void }) {
  const [form, setForm] = createStore<AssignRoleForm>(emptyAssignRole())
  const [showErr, setShowErr] = createSignal(false)
  const errors = createMemo(() => validateAssignRole(form))
  const err = (f: 'system' | 'role'): string | undefined => {
    if (!showErr()) return undefined
    const tag = errors()[f]
    return tag ? tpe(tag as PeopleTag) : undefined
  }
  const save = async (): Promise<void> => {
    if (errors().system || errors().role) {
      setShowErr(true)
      return
    }
    const okDone = await props.b.assignRole(toAssignRoleBody(form))
    if (okDone) {
      setForm(emptyAssignRole())
      props.onClose()
    }
  }
  return (
    <div class={s.panel}>
      <SelectField label="Sistema" value={form.system} onChange={(v) => setForm({ system: v })} placeholder="Selecionar…" options={ROLE_SYSTEMS.map((o) => ({ id: o.value, label: o.label }))} error={err('system')} />
      <SelectField label="Papel" value={form.role} onChange={(v) => setForm({ role: v })} placeholder="Selecionar…" options={COMMON_ROLES.map((o) => ({ id: o.value, label: o.label }))} error={err('role')} />
      <div class={s.actions}>
        <button type="button" class={s.btnGhost} onClick={props.onClose}>Cancelar</button>
        <button type="button" class={s.btnPrimary} disabled={props.b.busy()} onClick={() => void save()}>Atribuir</button>
      </div>
    </div>
  )
}
