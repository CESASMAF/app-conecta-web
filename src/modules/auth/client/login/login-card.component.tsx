// View do login (ADR-0009). Layout de 2 colunas do design RORAIMA_DESIGN. O painel direito muda por
// estado do login flow do Kratos: carregando · form (e-mail/senha, postando direto no Kratos) · expirado.
// O app é a UI do Kratos: o form posta em `flow.action` com o `csrf_token` do flow (Authorization Code
// segue no Hydra por trás). Estado local só de UI (mostrar senha).
import { Show, Switch, Match, For, createSignal, type JSX } from 'solid-js'
import type { LoginFlowResult, LoginFlowView } from '~/shared/domain/login-flow'
import { Icon, P, BrandPanel } from '../auth-visuals'
import * as s from './login-card.css'

export type LoginCardProps = Readonly<{
  result: LoginFlowResult | undefined
  errorMessage: string | null
}>

// Form de login — posta direto no Kratos (flow.action) com o csrf_token do flow. O flow decide o modo:
// senha (padrão) · código por e-mail (2ª fase) · TOTP (2º fator/aal2). O botão carrega o `method`.
function LoginForm(props: { view: LoginFlowView; errorMessage: string | null }): JSX.Element {
  const [showPw, setShowPw] = createSignal(false)
  const errors = () => props.view.messages.filter((m) => m.type === 'error')
  const infos = () => props.view.messages.filter((m) => m.type !== 'error')
  const mode = (): 'totp' | 'code' | 'password' => (props.view.aal2 ? 'totp' : props.view.codePhase ? 'code' : 'password')

  return (
    <>
      <Switch>
        <Match when={mode() === 'totp'}>
          <h1 class={s.title}>Verificação em duas etapas</h1>
          <p class={s.subtitle}>Informe o código de 6 dígitos do seu app autenticador.</p>
        </Match>
        <Match when={mode() === 'code'}>
          <a class={s.backLink} href="/login"><Icon d={P.back} size={16} /> Voltar</a>
          <h1 class={s.title}>Código de acesso</h1>
          <p class={s.subtitle}>Enviamos um código de 6 dígitos para o seu e-mail institucional.</p>
        </Match>
        <Match when={mode() === 'password'}>
          <h1 class={s.title}>Entrar</h1>
          <p class={s.subtitle}>
            Acesse com sua conta institucional <span class={s.subtitleStrong}>@cesasmaf.app.br</span>
          </p>
        </Match>
      </Switch>

      <Show when={props.errorMessage}>{(msg) => <div class={s.errorBox} role="alert">{msg()}</div>}</Show>
      <For each={errors()}>{(m) => <div class={s.errorBox} role="alert">{m.text}</div>}</For>

      <form action={props.view.action} method="post">
        <input type="hidden" name="csrf_token" value={props.view.csrfToken} />

        <Switch>
          {/* TOTP (2º fator) */}
          <Match when={mode() === 'totp'}>
            <div class={s.field}>
              <label class={s.label} for="login-totp">Código do autenticador</label>
              <input class={s.codeInput} id="login-totp" name="totp_code" inputmode="numeric" autocomplete="one-time-code" placeholder="000000" required />
            </div>
            <button class={s.submit} type="submit" name="method" value="totp">Verificar <Icon d={P.arrow} size={16} /></button>
          </Match>

          {/* código por e-mail (2ª fase: informar o código recebido) */}
          <Match when={mode() === 'code'}>
            <div class={s.field}>
              <label class={s.label} for="login-code">Código de verificação</label>
              <input class={s.codeInput} id="login-code" name="code" inputmode="numeric" autocomplete="one-time-code" placeholder="000000" required />
              <For each={infos()}>{(m) => <p class={s.hint}>{m.text}</p>}</For>
            </div>
            <button class={s.submit} type="submit" name="method" value="code">Confirmar <Icon d={P.arrow} size={16} /></button>
          </Match>

          {/* senha (padrão) */}
          <Match when={mode() === 'password'}>
            <div class={s.field}>
              <label class={s.label} for="login-email">E-mail institucional</label>
              <div class={s.inputWrap}>
                <span class={s.inputIcon}><Icon d={P.mail} /></span>
                <input class={s.input} id="login-email" name="identifier" type="email" placeholder="nome@cesasmaf.app.br" autocomplete="username" required />
              </div>
            </div>
            <div class={s.field}>
              <label class={s.label} for="login-password">Senha</label>
              <div class={s.inputWrap}>
                <span class={s.inputIcon}><Icon d={P.lock} /></span>
                <input class={s.input} id="login-password" name="password" type={showPw() ? 'text' : 'password'} placeholder="••••••••" autocomplete="current-password" required />
                <button class={s.eyeBtn} type="button" aria-label={showPw() ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={showPw()} onClick={() => setShowPw((v) => !v)}>
                  <Icon d={P.eye} />
                </button>
              </div>
            </div>
            <div class={s.rowBetween}>
              <span />
              <a class={s.link} href="/recover">Esqueci minha senha</a>
            </div>
            <button class={s.submit} type="submit" name="method" value="password" data-testid="login-button">
              Entrar <Icon d={P.arrow} size={16} />
            </button>
            <Show when={props.view.methods.code}>
              <button class={s.ssoBtn} type="submit" name="method" value="code" formnovalidate>
                <Icon d={P.mail} size={18} /> Entrar com código por e-mail
              </button>
            </Show>
          </Match>
        </Switch>
      </form>

      <div class={s.lgpd}>
        <span class={s.lgpdIcon}><Icon d={P.shield} size={16} /></span>
        <div>
          O acesso é registrado para fins de auditoria. Dados dos beneficiários são protegidos conforme a{' '}
          <span class={s.lgpdStrong}>LGPD</span> e o sigilo profissional.
        </div>
      </div>

      <div class={s.support}>Sem acesso? Fale com o administrador da unidade.</div>
      <div class={s.powered}>
        <Icon d={P.lock} size={13} />
        Autenticação protegida · Ory
      </div>
    </>
  )
}

// Estado: carregando (redirecionando/criando flow).
function LoadingState(): JSX.Element {
  return (
    <div class={s.status}>
      <div class={`${s.statusBadge} ${s.statusBadgeLoad}`}><span class={s.spinner} /></div>
      <h1 class={s.statusTitle}>Um instante…</h1>
      <p class={s.statusText}>Preparando o acesso seguro.</p>
    </div>
  )
}

// Estado: flow expirado/inválido → recomeçar.
function ExpiredState(): JSX.Element {
  return (
    <div class={s.status}>
      <div class={`${s.statusBadge} ${s.statusBadgeWarn}`}><Icon d={P.clock} size={26} /></div>
      <h1 class={s.statusTitle}>Sessão expirada</h1>
      <p class={s.statusText}>Por segurança, o formulário de acesso expirou. Entre novamente para continuar.</p>
      <a class={s.submit} href="/login">Entrar novamente <Icon d={P.arrow} size={16} /></a>
    </div>
  )
}

// Estado: logout confirmado.
function LogoutState(): JSX.Element {
  return (
    <div class={s.status}>
      <div class={`${s.statusBadge} ${s.statusBadgeOk}`}><Icon d={P.check} size={26} /></div>
      <h1 class={s.statusTitle}>Você saiu com segurança</h1>
      <p class={s.statusText}>Sua sessão foi encerrada. Obrigado por manter os dados das famílias protegidos.</p>
      <a class={s.submit} href="/login">Entrar novamente <Icon d={P.arrow} size={16} /></a>
    </div>
  )
}

// Estado: acesso negado (autenticou, mas sem papéis para este sistema — 403).
function DeniedState(): JSX.Element {
  return (
    <div class={s.status}>
      <div class={`${s.statusBadge} ${s.statusBadgeDeny}`}><Icon d={P.x} size={26} /></div>
      <h1 class={s.statusTitle}>Acesso negado</h1>
      <p class={s.statusText}>Sua conta autenticou, mas ainda não tem papéis atribuídos para este sistema. Solicite acesso ao administrador da unidade.</p>
      <a class={s.submit} href="/login">Tentar novamente <Icon d={P.arrow} size={16} /></a>
    </div>
  )
}

export function LoginCard(props: LoginCardProps) {
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
              {(view) => <LoginForm view={view()} errorMessage={props.errorMessage} />}
            </Match>
            <Match when={props.result?.kind === 'logout'}>
              <LogoutState />
            </Match>
            <Match when={props.result?.kind === 'denied'}>
              <DeniedState />
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
