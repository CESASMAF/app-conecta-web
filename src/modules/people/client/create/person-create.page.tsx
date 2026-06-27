// Tela de cadastro de pessoa (Admin/RH). Dados + seção opcional "Criar acesso" (login): ao marcar, e-mail
// passa a obrigatório (espelha PEO-009). Validação na própria tela antes do envio.
import { Show } from 'solid-js'
import { A } from '@solidjs/router'
import { usePersonCreateBinding } from './person-create.binding'
import { TextField, CheckboxField } from '~/shared/ui/field.component'
import { tpe, type PeopleTag } from '~/shared/i18n/people'
import * as s from '../people.css'

export function PersonCreatePage() {
  const b = usePersonCreateBinding()
  const err = (f: Parameters<typeof b.errorFor>[0]): string | undefined => {
    const tag = b.errorFor(f)
    return tag ? tpe(tag as PeopleTag) : undefined
  }

  return (
    <section class={s.wrap}>
      <A class={s.back} href="/people">
        ← Pessoas
      </A>
      <h1 class={s.title}>Nova pessoa</h1>

      <Show when={b.submitErrorTag()}>{(tag) => <div class={s.errorBanner} role="alert">{tpe(tag())}</div>}</Show>

      <div class={s.form}>
        <TextField label="Nome completo" value={b.form.fullName} onInput={(v) => b.set({ fullName: v })} error={err('fullName')} autocomplete="name" />
        <TextField label="Data de nascimento" type="date" value={b.form.birthDate} onInput={(v) => b.set({ birthDate: v })} error={err('birthDate')} />
        <TextField label="CPF (opcional)" value={b.form.cpf} onInput={(v) => b.set({ cpf: v })} error={err('cpf')} inputMode="numeric" placeholder="Somente números" />
        <TextField label="E-mail (opcional)" type="email" value={b.form.email} onInput={(v) => b.set({ email: v })} error={err('email')} placeholder="nome@org.br" />

        <div class={s.panel}>
          <CheckboxField label="Criar acesso ao sistema (login)" checked={b.form.createLogin} onChange={(v) => b.set({ createLogin: v })} />
          <Show when={b.form.createLogin}>
            <p class={s.muted}>Para criar acesso, o e-mail é obrigatório. A senha inicial é opcional (mín. 8).</p>
            <TextField label="Senha inicial (opcional)" type="password" value={b.form.initialPassword} onInput={(v) => b.set({ initialPassword: v })} error={err('initialPassword')} />
          </Show>
        </div>

        <div class={s.actions}>
          <A class={s.btnGhost} href="/people">
            Cancelar
          </A>
          <button type="button" class={s.btnPrimary} disabled={b.pending()} onClick={() => void b.save()}>
            {b.pending() ? 'Criando…' : 'Criar pessoa'}
          </button>
        </div>
      </div>
    </section>
  )
}
