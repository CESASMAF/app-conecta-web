// Tela de recuperação de senha (ADR-0009) — recovery flow do Kratos (2 fases: e-mail → código).
// Reusa a identidade e o CSS da tela de login. O form posta direto no Kratos (flow.action).
import { Show, Switch, Match, For, type JSX } from 'solid-js'
import type { RecoveryFlowResult, RecoveryFlowView } from '~/shared/domain/login-flow'
import { Icon, P, BrandPanel } from '../auth-visuals'
import { useSubmitLock } from '~/shared/ui/use-submit-lock'
import { btnSpinner } from '~/shared/ui/kit.css'
import * as s from '../login/login-card.css'

export type RecoverCardProps = Readonly<{ result: RecoveryFlowResult | undefined }>

function RecoverForm(props: { view: RecoveryFlowView }): JSX.Element {
  const errors = () => props.view.messages.filter((m) => m.type === 'error')
  const infos = () => props.view.messages.filter((m) => m.type !== 'error')

  // O form posta nativamente no Kratos e a resposta é uma navegação. Aqui o envio ainda
  // dispara um e-mail pelo courier, então demora mais que um POST comum — é exatamente
  // onde a pessoa reclica achando que não foi, e cada reclique manda outro código.
  // A trava se desfaz sozinha quando a navegação não acontece — senão o erro do Kratos deixaria
  // a pessoa presa na tela, sem conseguir tentar de novo (ver use-submit-lock).
  const envio = useSubmitLock()
  const sending = (): boolean => envio.emEnvio() !== null
  return (
    <>
      <a class={s.backLink} href="/login"><Icon d={P.back} size={16} /> Voltar ao login</a>
      <h1 class={s.title}>Recuperar acesso</h1>
      <Show
        when={props.view.phase === 'code'}
        fallback={<p class={s.subtitle}>Informe seu e-mail institucional e enviaremos um código para redefinir a senha.</p>}
      >
        <p class={s.subtitle}>Enviamos um código para o seu e-mail. Informe-o abaixo para continuar.</p>
      </Show>

      <For each={errors()}>{(m) => <div class={s.errorBox} role="alert">{m.text}</div>}</For>

      <form action={props.view.action} method="post" onSubmit={() => envio.travar(true)}>
        <input type="hidden" name="csrf_token" value={props.view.csrfToken} />
        <input type="hidden" name="method" value="code" />

        <Switch>
          {/* fase 1 — informar o e-mail */}
          <Match when={props.view.phase === 'email'}>
            <div class={s.field}>
              <label class={s.label} for="recover-email">E-mail institucional</label>
              <div class={s.inputWrap}>
                <span class={s.inputIcon}><Icon d={P.mail} /></span>
                <input class={s.input} id="recover-email" name="email" type="email" placeholder="nome@cesasmaf.app.br" autocomplete="email" required />
              </div>
            </div>
            <button class={s.submit} type="submit" disabled={sending()}>
              <Show when={sending()}><span class={btnSpinner} aria-hidden="true" /></Show>
              {sending() ? 'Enviando código…' : 'Enviar código'} <Show when={!sending()}><Icon d={P.arrow} size={16} /></Show>
            </button>
          </Match>

          {/* fase 2 — informar o código recebido */}
          <Match when={props.view.phase === 'code'}>
            <div class={s.field}>
              <label class={s.label} for="recover-code">Código de verificação</label>
              <input class={s.codeInput} id="recover-code" name="code" inputmode="numeric" autocomplete="one-time-code" placeholder="000000" required />
              <For each={infos()}>{(m) => <p class={s.hint}>{m.text}</p>}</For>
            </div>
            <button class={s.submit} type="submit" disabled={sending()}>
              <Show when={sending()}><span class={btnSpinner} aria-hidden="true" /></Show>
              {sending() ? 'Confirmando…' : 'Confirmar'} <Show when={!sending()}><Icon d={P.arrow} size={16} /></Show>
            </button>
          </Match>
        </Switch>
      </form>

      <div class={s.powered}><Icon d={P.lock} size={13} /> Autenticação protegida · Ory</div>
    </>
  )
}

function ExpiredState(): JSX.Element {
  return (
    <div class={s.status}>
      <div class={`${s.statusBadge} ${s.statusBadgeWarn}`}><Icon d={P.clock} size={26} /></div>
      <h1 class={s.statusTitle}>Link expirado</h1>
      <p class={s.statusText}>O pedido de recuperação expirou. Comece novamente.</p>
      <a class={s.submit} href="/recover">Recomeçar <Icon d={P.arrow} size={16} /></a>
    </div>
  )
}

function LoadingState(): JSX.Element {
  return (
    <div class={s.status}>
      <div class={`${s.statusBadge} ${s.statusBadgeLoad}`}><span class={s.spinner} /></div>
      <h1 class={s.statusTitle}>Um instante…</h1>
      <p class={s.statusText}>Preparando a recuperação de acesso.</p>
    </div>
  )
}

export function RecoverCard(props: RecoverCardProps) {
  return (
    <main class={s.screen}>
      <BrandPanel />
      <main class={s.pane}>
        <div class={s.card}>
          <div class={s.mobileLogo}>
            <img class={s.mobileLogoImg} src="/brand/raros.webp" alt="Raros Boa Vista" />
          </div>
          <Switch fallback={<LoadingState />}>
            <Match when={props.result?.kind === 'flow' ? props.result.view : undefined}>
              {(view) => <RecoverForm view={view()} />}
            </Match>
            <Match when={props.result?.kind === 'expired'}>
              <ExpiredState />
            </Match>
          </Switch>
        </div>
      </main>
    </main>
  )
}
