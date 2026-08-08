// Tela de erro de fluxo (ADR-0009). Reusa a identidade e o CSS do login.
//
// Ela existe porque o Kratos redireciona para cá em toda falha de fluxo e, até
// 2026-08-08, a rota não existia: o middleware tratava /error como página protegida e
// jogava para /login. O diagnóstico que o Kratos tinha produzido era descartado, e todo
// defeito de auth chegava ao usuário como "voltei ao login e não sei por quê".
import { Show, type JSX } from 'solid-js'
import type { FlowErrorResult } from '~/shared/domain/login-flow'
import { errorViewModel, type ErrorCopy } from './error.view-model'
import { Icon, P, BrandPanel } from '../auth-visuals'
import * as s from '../login/login-card.css'

export type ErrorCardProps = Readonly<{ result: FlowErrorResult | undefined; errorId: string | null }>

function copyOf(result: FlowErrorResult): ErrorCopy {
  switch (result.kind) {
    case 'error':
      return errorViewModel.copy(result.view.kind)
    case 'notFound':
      return errorViewModel.notFoundCopy()
    case 'missing':
      return errorViewModel.missingCopy()
  }
}

function ErrorState(props: { result: FlowErrorResult; errorId: string | null }): JSX.Element {
  const copy = () => copyOf(props.result)
  const code = () => (props.result.kind === 'error' ? props.result.view.id : props.errorId)
  return (
    <div class={s.status}>
      {/* `deny` para falha de configuração, `warn` para o que a pessoa resolve tentando
          de novo — a cor já adianta se vale insistir ou se é caso de chamar o suporte. */}
      <div class={`${s.statusBadge} ${copy().systemic ? s.statusBadgeDeny : s.statusBadgeWarn}`}>
        <Icon d={copy().systemic ? P.shield : P.clock} size={26} />
      </div>
      <h1 class={s.statusTitle}>{copy().title}</h1>
      <p class={s.statusText}>{copy().text}</p>

      {/* O código é o elo entre o que a pessoa viu e o `flow.error` no log do servidor,
          onde está o `reason` completo do Kratos. Sem ele, o suporte fica no escuro. */}
      <Show when={code()}>
        {(id) => (
          <p class={s.hint}>
            Código do erro: <code>{id()}</code>
          </p>
        )}
      </Show>

      <a class={s.submit} href={copy().actionHref}>
        {copy().actionLabel} <Icon d={P.arrow} size={16} />
      </a>
    </div>
  )
}

function LoadingState(): JSX.Element {
  return (
    <div class={s.status}>
      <div class={`${s.statusBadge} ${s.statusBadgeLoad}`}>
        <span class={s.spinner} />
      </div>
      <h1 class={s.statusTitle}>Um instante…</h1>
      <p class={s.statusText}>Consultando o detalhe do erro.</p>
    </div>
  )
}

export function ErrorCard(props: ErrorCardProps) {
  return (
    <main class={s.screen}>
      <BrandPanel />
      <main class={s.pane}>
        <div class={s.card}>
          <div class={s.mobileLogo}>
            <img class={s.mobileLogoImg} src="/brand/raros.webp" alt="Raros Boa Vista" />
          </div>
          <Show when={props.result} fallback={<LoadingState />}>
            {(result) => <ErrorState result={result()} errorId={props.errorId} />}
          </Show>
        </div>
      </main>
    </main>
  )
}
