// View BURRA do login (ADR-0009: props -> JSX). Sem reatividade própria; testável com props diretas.
import { Show } from 'solid-js'
import * as s from './login-card.css'

export type LoginCardProps = Readonly<{
  loginHref: string
  errorMessage: string | null
}>

export function LoginCard(props: LoginCardProps) {
  return (
    <main class={s.screen}>
      <section class={s.card} aria-labelledby="login-title">
        <div class={s.brand}>
          <img class={s.logo} src="/brand/raros.webp" alt="RAROS Boa Vista" width="120" height="36" />
          <h1 id="login-title" class={s.title}>Acessar a plataforma</h1>
          <p class={s.subtitle}>Entre com a conta única da organização para continuar.</p>
        </div>

        <Show when={props.errorMessage}>{(msg) => <div class={s.errorBox} role="alert">{msg()}</div>}</Show>

        <a class={s.button} href={props.loginHref} data-testid="login-button">
          Entrar com a conta da organização
        </a>
      </section>
    </main>
  )
}
