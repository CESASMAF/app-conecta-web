[← Voltar para ADRs](./README.md)

# ADR-0009: Cliente — ViewModel puro + Command, UI Solid como adaptador plugável, use-case opcional

- **Status:** Accepted
- **Date:** 2026-05-31 · **Atualizado:** 2026-06-12 (binding Solid; Command sobre `action`/`useSubmission`; `bun:test`)
- **Deciders:** Gabriel Aderaldo (Tech Lead) + assistente

---

## Contexto

O [ADR-0004](./0004-client-server-split-mvvm-ddd.md) (§III) definiu o lado client como MVVM com camadas
`data · usecase · view-model · ui`. Ao detalhar o login (spec 006), três tensões apareceram:

1. **Nomes confusos.** Havia dois `LoginView`: o componente de UI e o `type LoginView` do view-model. A 1ª
   versão deste ADR tentou reservar "View" para o view-state — mas as docs oficiais mostram que isso também
   está **errado** (o nome certo é **UI state**).
2. **Acoplamento ao framework.** O `use-login.view-model.ts` misturava **lógica agnóstica**
   (`deriveLoginView`) com **binding do framework**. O **norte do Tech Lead**: o núcleo do cliente deve ser
   **puro e testável** — *"do `data` até a ViewModel deve ser o MESMO, independente da camada reativa; só as
   views/bindings mudam."*
3. **`client/usecase` jogado.** O nosso só **emite um evento no bus** após o login — não é lógica complexa
   nem compartilhada entre VMs.

**Pesquisa (docs oficiais — função das camadas, não nomes):** Android/Jetpack ("UI state" = data class
imutável produzida pela ViewModel; fluxo unidirecional), Flutter (VM expõe o necessário p/ render + **Commands**
com `running/error/completed/result`; domain/use-case **opcional**), Apple/SwiftUI (VM `@Observable` publica
o state; View observa). **Fio comum:** dado→estado-de-tela é da **ViewModel**; a saída é **"UI state"**;
ações são **Commands**; o domain/use-case é opcional.

## Decisão

O **núcleo do cliente é puro e portável**; a camada reativa do framework (**Solid**) é um **adaptador
plugável** na ponta. Organização **por comportamento** (feature-first) + o padrão **Command**.

> No web_02 o framework é o **Solid** (não há mais "React hoje, Solid amanhã"). O valor do núcleo agnóstico
> permanece: a VM é **objeto puro testável em `bun:test`** sem montar nada do Solid; o **binding** é o único
> ponto que toca a reatividade (`createAsync`/`action`/`useSubmission` do `@solidjs/router`). Trocar a
> primitiva reativa = reescrever só o binding.

### 1. Organização: por COMPORTAMENTO (feature-first); a camada é o SUFIXO

O `client/` se organiza por **comportamento** (a tela/ação), não por camada. Cada comportamento (`login/`,
`current-user/`…) é uma pasta **flat** sob `client/`, ao lado de **dois nomes reservados compartilhados**:

- **`data/`** *(compartilhado)* — `repository` (porta → Eden treaty), `model` (tipos do retorno do BFF),
  `events`, `gateways`, `helpers`: a infra usada por VÁRIOS comportamentos.
- **`domain/`** *(compartilhado, OPCIONAL)* — `use-cases` só quando a lógica é compartilhada entre VMs ou
  complexa. **Não criar por padrão.**

Dentro da pasta do comportamento, **a camada é o SUFIXO do arquivo** (não uma subpasta):

| Sufixo | Camada | Puro / testável em `bun:test`? |
| --- | --- | --- |
| `*.mutation.ts` / `*.query.ts` | data **específica** do comportamento (define `action`/`query` + chave) | ✅ |
| `*.view-model.ts` | **ViewModel** — objeto puro: commands + derivações (`toErrorTag`) + efeitos (`onSuccess`) | ✅ |
| `*.binding.ts` | **binding/adapter** Solid (`useXxxBinding` → Command) | ❌ Solid |
| `*.page.tsx` / `*.component.tsx` | **View** burra | ❌ Solid (JSX) |
| `*.controller.ts` | **Controller** (form local) | ❌ Solid |

A **linha pura** (testável) = `data/` + `domain/` + os `*.mutation.ts`/`*.view-model.ts` de cada
comportamento. Zero Solid, testável em **`bun:test`**.

### 2. O binding (adapter) — onde o framework entra

O `*.binding.ts` (`useXxxBinding()`) é o **único** ponto que liga o `xxxViewModel` puro às primitivas
reativas do **Solid** (`useSubmission(action)` / `createAsync(query)` → **Command**). É **fino e burro**:
não decide nada, só assina a reatividade e expõe `{ commands }`. A Page e os Components consomem o binding;
o Controller (`useXxxController`) cuida de estado de form local. **Trocar a primitiva reativa = reescrever
os `*.binding.ts`**; o núcleo puro fica intacto.

### 3. Command — abstração de 1ª classe

```ts
export type Command<Input, Result> = Readonly<{
  running: boolean
  errorTag: string | null     // erro já mapeado p/ tag i18n (derivação da VM)
  result: Result | null
  execute: (input: Input) => void
}>
```

O **binding** mapeia o primitivo do **Solid** para `Command`. Com o `action` + `useSubmission` do
`@solidjs/router`:
`useSubmission(loginAction)` → `{ pending→running, error→errorTag (via VM), result→result, ... }` e
`useAction(loginAction)` → `execute`. A View liga **declarativamente**: `command.running` → spinner do
Button; `command.errorTag` → bloco de alerta. **Não é lib nova** (§VIII): o `@solidjs/router` (que já vem
com o SolidStart) **é** a implementação do Command — sem TanStack Query (regra Bun-native). O tipo só
padroniza a forma (no Flutter o equivalente é o pacote `flutter_command`).

### 4. Vocabulário fixo (fecha a confusão de nomes)

| Conceito (função) | O que é | Nome |
| --- | --- | --- |
| **View** | UI burra (props → JSX) | `LoginForm` (component) · `LoginPage` (raiz) |
| **ViewModel** | definição **pura**: commands + derivações + efeitos | `loginViewModel` (objeto **puro**) |
| **Binding / Adapter** | função Solid que liga a VM ↔ reatividade, expõe os commands | `useLoginBinding()` |
| **Command** | ação + `{ running, errorTag, result, execute }` | `loginCommand` |
| **UI state** | dado pronto p/ render (saída da VM) | `LoginUiState` (quando precisar de um tipo) |
| **Controller** | estado de **form local** | `useLoginFormController` |

- **"View" = só a UI.** A saída da VM é **UI state**, nunca "view".
- **Puro vs binding distinguem-se pela forma:** `xxxViewModel` (objeto puro) vs `useXxx()` (função Solid).
- **Nome do binding:** `useLoginBinding()` — padrão `useXxxBinding()`. **NÃO** `useXxxViewModel` (a VM é o
  objeto puro, não a função).

### 5. Enforcement (governance test, não ESLint)

Como tudo vive junto na pasta do comportamento, a regra "núcleo puro" casa por **SUFIXO**: **`data/`,
`domain/` e qualquer `*.view-model.ts`/`*.mutation.ts`/`*.query.ts` NÃO podem importar `solid-js` nem
`@solidjs/*`**. Vazar framework no núcleo = **teste vermelho** em `bun test` (governance test que varre os
imports por sufixo — substitui o `eslint-plugin-boundaries` do web/React, regra Bun-native). As regras
direcionais de camada (View → VM → data) também são verificadas pelo mesmo teste.

## Árvore de pastas (login de referência)

```
modules/auth/client/
├── data/                         # COMPARTILHADO entre comportamentos
│   └── model/ · repository/ · gateways/ · events/ · helpers/   (porta → Eden + tipos + infra)
├── domain/                       # COMPARTILHADO, OPCIONAL (use-cases; vazio por ora)
├── login/                        # COMPORTAMENTO — tudo que a tela de login FAZ
│   ├── login.mutation.ts         # loginAction (action do @solidjs/router)              — PURO (data do login)
│   ├── login.view-model.ts       # loginViewModel { onSuccess, toErrorTag }              — PURO (bun:test)
│   ├── login.binding.ts          # useLoginBinding() — useSubmission → loginCommand      — ADAPTER (Solid)
│   ├── login.page.tsx            # LoginPage — compõe (resolve i18n, chama o binding)     — ADAPTER
│   └── components/forms/
│       ├── login-form.component.tsx   # LoginForm — View burra (props → JSX)
│       └── login-form.controller.ts   # useLoginFormController — estado de form local
└── current-user/                 # COMPORTAMENTO (usado pelo guard; pode não ter page)
    ├── current-user.view-model.ts
    └── current-user.binding.ts
```

### Login de referência (pseudocódigo Solid)

```ts
// login/login.mutation.ts — PURO (data específica; action do @solidjs/router)
export const loginAction = action(
  (input: LoginInput) => authRepository.login(input),   // porta → Eden treaty (BFF Elysia)
  'auth:login',
)

// login/login.view-model.ts — PURO (zero Solid; testável em bun:test)
export const loginViewModel = {
  action: loginAction,
  onSuccess: (user: CurrentUser, deps: { bus: AuthBus }) => deps.bus.emit(usuarioAutenticado(user)),
  toErrorTag: (e: AuthError): string => authErrorTag(e),   // derivação pura → tag i18n
}

// login/login.binding.ts — BINDING Solid (trocar primitiva reativa = reescrever SÓ este arquivo)
export function useLoginBinding(): { loginCommand: Command<LoginInput, CurrentUser> } {
  const bus = useAuthBus()
  const submission = useSubmission(loginViewModel.action)
  const run = useAction(loginViewModel.action)
  // efeito onSuccess: createEffect observando submission.result
  return {
    loginCommand: {
      running: submission.pending,
      errorTag: submission.error ? loginViewModel.toErrorTag(submission.error) : null,
      result: submission.result ?? null,
      execute: run,
    },
  }
}

// login/components/forms/login-form.component.tsx — VIEW BURRA (liga ao command)
// <Button loading={loginCommand.running}>Entrar</Button>
// <Show when={loginCommand.errorTag}>{tag => <Alert>{t(tag())}</Alert>}</Show>
```

O `deriveLoginView`/`{status, errorTag}` **encolhe**: `status` vira `command.running`; sobra só `toErrorTag`.
O `client/usecase` **some** (vira `onSuccess` do command).

## Consequências

**Positivas**
- **Núcleo puro/testável** (`bun:test`) sem montar Solid; o `Command` padroniza loading/erro — entrega o
  **spinner da spec 006** de graça (`command.running`).
- **Sem TanStack Query**: o `@solidjs/router` (já no SolidStart) é a implementação do Command — uma dep npm
  a menos (regra Bun-native).
- Nomes sem colisão; "View" = só UI; a saída da VM é UI state.

**Negativas / custos**
- Uma indireção a mais (VM pura + binding). Refactor do login + **remover** `client/usecase`.
- **Mexe na constituição §III/§XI/§XII e no ADR-0004** → sync feito junto.
- Enforcement por governance test é código a manter (vs lint) — aceito pela regra Bun-native.

## Alternativas consideradas

- **VM como função reativa única** — rejeitado: acopla Solid no núcleo; não testável puro.
- **TanStack Query (solid-query) para o server-state/Command** — rejeitado pela regra **Bun-native**: o
  `@solidjs/router` (createAsync/action/useSubmission) já entrega; dep npm extra desnecessária.
- **Store agnóstico (XState) para a VM** — **adiado**: as primitivas do Solid bastam; revisitar se precisar
  de VM stateful fora de server-state.
- **Manter `usecase` sempre** — rejeitado: domain é opcional; o nosso só emitia evento (efeito do command).
- **"View" para o view-state** (v1 deste ADR) — rejeitado: as docs chamam de **UI state**.

## Referências

- Refina/emenda [ADR-0004](./0004-client-server-split-mvvm-ddd.md) e a constituição §III/§XI/§XII.
- Android: [UI layer](https://developer.android.com/topic/architecture/ui-layer). Flutter:
  [guide](https://docs.flutter.dev/app-architecture/guide) · [Command](https://docs.flutter.dev/app-architecture/case-study/ui-layer).
  Apple: [Managing model data](https://developer.apple.com/documentation/SwiftUI/Managing-model-data-in-your-app).
- `handbook/reference/framework/solidstart/` (`action`, `useSubmission`, `createAsync`, `query`).
- `specs/006-login-view-styling/`. [ADR-0002](./0002-errors-as-values.md) (Result), [ADR-0003](./0003-bun-supply-chain.md) (enforcement Bun-native).
