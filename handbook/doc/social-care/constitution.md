# ACDG Web Constitution — `social-care`

> Constituição do frontend web ACDG-BV (`web_02` — front+BFF **SolidStart + Elysia + Bun**),
> aplicada à feature `001-social-care-web`. Condensa em **VI princípios** as invariantes de
> [`web_02/.specify/memory/constitution.md`](../../../.specify/memory/constitution.md) v1.0.0
> e os [ADRs aceitos](../../adr/README.md) do `web_02/handbook/adr/` (0001–0012).
> É referenciada por [`domain.fe.md`](./domain.fe.md), [`spec.fe.md`](./spec.fe.md),
> [`plan.fe.md`](./plan.fe.md), [`adr.md`](./adr.md), [`adr.fe.md`](./adr.fe.md) e
> [`design-tokens.fe.md`](./design-tokens.fe.md). Cada princípio é uma invariante: ou o código
> respeita, ou não entra em `main`.

## Core Principles

### I. BFF-Orchestrated Boundary
O **BFF (Elysia)**, montado em `src/routes/api/[...path].ts`, é o único ponto que fala com os
backends (`social-care`, `people-context`, `analysis-bi`). Ele autentica (OIDC+PKCE, sessão
server-side, cookie opaco `HttpOnly`), injeta `Authorization: Bearer <jwt>` e **orquestra** —
fan-out paralelo aos microserviços, composição do ViewModel pronto e fallback gracioso quando um
serviço tolerável falha (campo `| null`, nunca 500 por falha parcial tolerável). O client
**nunca** compõe, agrega, faz fan-out, nem conhece a topologia de backends. Toda escrita devolve
o estado resultante, não só `ok`. O BFF tem domínio próprio de orquestração e **nunca duplica
regra de negócio canônica do backend** — a fonte de verdade do atendimento é o `social-care`
(ver [`domain.fe.md`](./domain.fe.md) e o [`domain.md`](./domain.md) do serviço). Rotas BFF para
esta feature: [`adr.fe.md`](./adr.fe.md) e [`api-readiness.fe.md`](./api-readiness.fe.md).
*(ADR-0004, ADR-0005, ADR-0010)*

### II. Errors as Values
`Result<T, E>` em `server/domain/` e `server/application/` — `throw` é proibido nessas camadas,
sem exceções. Erros são unions de **string literais** (ex.: `'patient-not-found'`), nunca
subclasses de `Error`. `throw` só em adapters, com conversão para `Result` no boundary. O Eden
devolve `{ data, error }`; a **única** travessia valor→exceção é a derivação do `createAsync` do
Solid (para o `<ErrorBoundary>`). A UI decide por **semântica** (tag i18n), nunca por status
HTTP. Swallowing é antipadrão: todo erro propaga como `Result` ou é logado com contexto
estruturado. Mapeamento dos códigos `PAT-XXX`/`AppError` do `social-care`:
[`adr.fe.md`](./adr.fe.md). *(ADR-0002)*

### III. Vertical-Modular · Client (MVVM) × Server (DDD)
Módulos verticais (`modules/<f>/{server,client,public-api}`), import cross-módulo **só via
`public-api`**. A fronteira client↔server é o **Eden treaty → rota Elysia**. O **server** é DDD
(domínio puro, ports, use-cases); o **client** é MVVM:

- **ViewModel puro** (`*.view-model.ts`) — objeto testável sem montar Solid; commands +
  derivações (`toErrorTag`) + efeitos (`onSuccess`). Zero `solid-js`.
- **Binding** (`*.binding.ts`) — único ponto que toca a reatividade Solid
  (`action`/`useSubmission`/`createAsync` do `@solidjs/router`).
- **Command** — `{ running, errorTag, result, execute }` — mapeado do primitivo Solid.
- **View burra** (`*.page.tsx`, `*.component.tsx`) — só recebe props e renderiza JSX Solid.

1 rota SolidStart (`src/routes/`) = idealmente 1 `createAsync` = 1 rota Elysia = 1 ViewModel.
Sem fan-out no client, sem agregar N `createAsync` numa view, sem `createEffect` orquestrando
fetches. ViewModels são **types-of-the-screen** (`PatientCaseFileModel`, `DashboardKpisData`),
nunca DTOs de backend. Design-driven: a tela dirige o produto, o microserviço não define o que
a tela oferece. O núcleo (`data/` + `domain/` + `*.view-model.ts`) **não importa**
`solid-js`/`@solidjs/*` — testável em `bun:test` puro. *(ADR-0001, ADR-0004, ADR-0009, ADR-0012)*

### IV. Bun-Native / Zero-NPM-Utility (NON-NEGOTIABLE)
**Proibido adicionar dependência npm que duplique algo que o Bun/Solid/Elysia já entregam
nativamente.** O stack-base é a fundação permitida (via `bun add`); tudo utilitário usa o
built-in. Substituições obrigatórias aplicadas a esta feature:

| Saiu (web/React) | Entrou (web_02) |
|---|---|
| pnpm | **Bun** (`bun install`, `bun.lock`, `bun audit`, `--linker isolated`) |
| TanStack Query / TanStack Router / `useQuery` / `useMutation` / `loader` | **Solid nativo** (`createAsync` / `query` / `action` / `useSubmission` do `@solidjs/router`) |
| Zod / `z.infer` / `inputSchema`/`outputSchema` Zod | **TypeBox** (`Elysia.t`) — vem com o Elysia; tipo flui ao client via Eden |
| `node:test` / Vitest / jsdom / MSW | **`bun:test`** + `happy-dom` + fakes/in-memory |
| `eslint-plugin-boundaries` / `no-restricted-imports` | **governance tests** em `bun:test` |
| React / `useState` / `useEffect` / `useReducer` | **Solid** (`createSignal` / `createStore` / `createEffect` / `onMount`) |
| "Presenter Hook" / `use-<feat>.presenter.ts` | **ViewModel puro** (`*.view-model.ts`) + **binding** (`*.binding.ts`) + Command |
| `*.server-fn.ts` (TanStack Start) | `*.query.fn.ts` / `*.service.fn.ts` (handler Elysia) |
| @fontsource | **`.woff2` self-host manual** em `public/fonts/` |
| React Aria Components + Tailwind v4 (M3) | **vanilla-extract** (CSS-in-TS zero-runtime, Atomic Design, so-tokens) |

*(ADR-0003, ADR-0007, ADR-0008; [`handbook/adr/README.md`](../../adr/README.md))*

### V. Strict TypeScript & End-to-End Type Safety
TS **estrito** (`strict: true`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`; `any`
proibido — `unknown` + narrowing; `as` exige justificativa). A validação de contrato é **TypeBox
(`Elysia.t`)** no `server/adapters` do BFF; o **Eden** propaga o tipo ao client — o tipo do
schema é a fonte única, sem redeclarar Model. Toda identidade (`PatientId`, `PersonId`) e todo
valor validado (`Cpf`, `Nis`, `Cep`, `Cns`, `Money`) é branded com smart constructor retornando
`Result<T, E>`. Estados finitos são discriminated unions com `switch` exaustivo (`never`).
Imutabilidade por padrão (`Readonly<{}>`, `readonly T[]`, `as const`). **Sem `class`, sem
`this`** — funções puras + factory closures `(deps) => (input) => Promise<Result>`. Referenciar
token de design inexistente é **erro de compilação** (vanilla-extract). `tsc --noEmit` limpo é
gate obrigatório. *(ADR-0002, ADR-0004, ADR-0007)*

### VI. Honesty in Production (No Mocks)
**Nada de mock em `src/`.** Operação sem rota no backend retorna o valor `'not-implemented'`,
nunca dado fabricado. Fixtures de teste só em `tests/`. A UI nunca mostra dado falso; falhas
reais aparecem como tais. Governance test (`bun:test`) verifica ausência de mocks em `src/`
automaticamente. *(ADR-0011)*

## Restrições Adicionais: Segurança e LGPD (Iron Frontier)

- **O browser NUNCA vê**: JWT/access token, refresh token, client secret OIDC, URLs dos
  backends, nem PII sensível (CPF/NIS/RG) em JSON de estado JS — PII só em SSR HTML.
- **BFF é a única ponte**: toda chamada do browser vai para `/api/*` (rota Elysia via Eden);
  o server injeta `Authorization: Bearer <jwt>` ao proxar (ADR-023 do `social-care`); o
  backend deriva `actorId` do `JWT.sub` validado — nunca header customizado.
- **Sessão**: cookie `__Host-session`, `HttpOnly`, `Secure`, `SameSite=Strict`,
  `Max-Age=8h`; CSRF via `Sec-Fetch-Site` + `X-Requested-With` em mutations; CSP com nonce
  por request via **Elysia + SolidStart middleware + Caddy**, HSTS, `X-Frame-Options: DENY`.
  *(ADR-0005, ADR-0006)*
- **Cache hardening**: `Cache-Control: no-store, no-cache, must-revalidate, private` em toda
  response com PII; cache do `createAsync` (Solid, client-only) limpo no logout; cache key com
  escopo de usuário; **nunca** localStorage/sessionStorage/IndexedDB com PII (grep de CI:
  `cpf`, `nis`, `rg`, `patient`, `family`).
- **LGPD — dados de saúde de pacientes raros**: minimização por tela (só campos que o design
  exige); prontuário anonimizado (`PatientPIIAnonymizedEvent`, ADR-039 do `social-care`) exibe
  aviso "Dados pessoais removidos por solicitação LGPD", mantém histórico clínico sem PII e
  bloqueia edição de assessments; audit trail é responsabilidade exclusiva do backend Swift via
  Outbox — o BFF não tem audit próprio e nunca loga body com PII; self-host de webfonts (zero
  IP a terceiros, ADR-0008); retenção conforme ADR-008/ADR-009 do `social-care` (5 anos audit,
  10 anos Protection BC). *(ADR-0005, ADR-0008)*
- **RBAC na UI**: papéis `worker`/`owner`/`admin` do token OIDC (Authentik) controlam apenas
  exibição de ações; a autorização real é do backend (`RoleGuardMiddleware`).

## Design System e Tokens

UI visual construída com **vanilla-extract** (CSS-in-TS zero-runtime, Atomic Design, so-tokens).
Tokens derivados do Figma (cores OKLCH, Atkinson Hyperlegible, espaçamento base 4/8, elevações,
state-layer opacities) centralizados e consumidos via [`design-tokens.fe.md`](./design-tokens.fe.md)
— nenhuma cor/medida hardcoded em componente. WCAG 2.2 AA obrigatório (axe em unit e E2E); bundle
≤ 200 KB gzip. Webfonts self-hosted em `public/fonts/` (`.woff2` manual, sem npm). Animações via
**GSAP** onde o design exige movimento. *(ADR-0007, ADR-0008)*

## Event Bus do Client

Comunicação entre view-models acontece por eventos nomeados em EN-passado
(`PatientRegistered`, `VersionConflictDetected`, `SessionExpired`) sobre `EventTarget` +
`CustomEvent` nativos — nunca import direto entre view-models de módulos diferentes. Cada evento
declara emissor, payload tipado e assinantes no [`domain.fe.md`](./domain.fe.md) da feature.
Eventos de **domínio** (backend) seguem no Transactional Outbox do `social-care`; o Event Bus do
client é exclusivamente reativo de UI.

## Workflow de Desenvolvimento e Quality Gates

- **Spec-Driven**: sem código sem spec aprovada — [`spec.fe.md`](./spec.fe.md) e
  [`plan.fe.md`](./plan.fe.md) desta feature precedem qualquer ticket; decisões arquiteturais
  viram ADR ([`adr.md`](./adr.md), [`adr.fe.md`](./adr.fe.md)); ADRs não são editados, são
  substituídos (`supersedes`).
- **Handbook é fonte da verdade**: conflito entre código e `web_02/handbook/` → handbook ganha.
- **Pipeline W0–W3**: W0 RED (testes falhando) → W1 GREEN (implementação mínima) → W2 REVIEW
  (read-only, máx. 3 rounds) → W3 QUALITY (todos os gates verdes).
- **Gates (rodam via `bun test` / CI), tudo Bun-native (sem ESLint):**
  - `bunx tsc --noEmit` limpo (type-safety ponta a ponta).
  - **Governance tests** (`tests/architecture/*`): boundaries de módulo, núcleo client sem
    `@solidjs/*`, "só-tokens" no design system, `no-mocks-in-src`.
    *(ADR-0001, ADR-0007, ADR-0009, ADR-0011)*
  - Cobertura de `bun:test` ≥ 90% em `server/domain/`, ≥ 80% em `server/application/`;
    in-memory adapters para testes de aplicação; ≥ 1 golden path E2E (Playwright) por feature.
  - `security-headers.test.ts` (valida CSP/HSTS/nosniff em `bun:test`).
- **Tooling**: Bun obrigatório (`npm`/`yarn`/`npx`/`pnpm` não usados — supply-chain via
  `trustedDependencies` + scanner + isolated linker + globalStore + `bun audit`); Prettier;
  `tsc --strict` máximo; TSDoc/TypeDoc em API pública.
- **Idioma**: código em EN; UI strings em PT-BR via i18n (dicionários TS tipados); commits
  Conventional Commits (`feat:` → minor, `fix:` → patch); merge em `main` gera tag SemVer
  anotada.

## Governance

Esta constituição supera qualquer outra prática da feature; em caso de conflito com documentos
irmãos ([`spec.fe.md`](./spec.fe.md), [`plan.fe.md`](./plan.fe.md)), a constituição prevalece e
o documento é corrigido. Emendas exigem PR dedicado citando ADR justificativo, revisão
arquitetural explícita (sem rubber stamp) e bump de versão (`1.x.y` para adições compatíveis;
`2.0.0` para remoção/inversão de princípio). Todo PR e review verificam conformidade com os
princípios I–VI, com destaque para o **Princípio IV** (não-negociável). A fonte expandida
permanece em [`web_02/.specify/memory/constitution.md`](../../../.specify/memory/constitution.md);
divergências entre os dois documentos são resolvidas a favor da fonte expandida, com correção
imediata daqui.

## Referências

- [`../../../.specify/memory/constitution.md`](../../../.specify/memory/constitution.md) — constituição expandida `web_02`
- [`../../adr/README.md`](../../adr/README.md) — índice de ADRs `web_02`
- [`../../adr/0001-vertical-modular-architecture.md`](../../adr/0001-vertical-modular-architecture.md) — arquitetura vertical-modular
- [`../../adr/0002-errors-as-values.md`](../../adr/0002-errors-as-values.md) — erros como valores / Result
- [`../../adr/0003-bun-supply-chain.md`](../../adr/0003-bun-supply-chain.md) — Bun como PM + supply-chain hardening
- [`../../adr/0004-client-server-split-mvvm-ddd.md`](../../adr/0004-client-server-split-mvvm-ddd.md) — split client (MVVM) × server (DDD)
- [`../../adr/0005-auth-session-refresh-decisions.md`](../../adr/0005-auth-session-refresh-decisions.md) — OIDC+PKCE, sessão opaca, refresh
- [`../../adr/0006-security-headers-csp.md`](../../adr/0006-security-headers-csp.md) — security headers & CSP
- [`../../adr/0007-design-system-vanilla-extract.md`](../../adr/0007-design-system-vanilla-extract.md) — vanilla-extract como engine do design system
- [`../../adr/0008-self-host-webfonts.md`](../../adr/0008-self-host-webfonts.md) — self-host de webfonts `.woff2`
- [`../../adr/0009-framework-agnostic-client.md`](../../adr/0009-framework-agnostic-client.md) — ViewModel puro + binding Solid + Command
- [`../../adr/0010-bff-orchestration-fn-naming.md`](../../adr/0010-bff-orchestration-fn-naming.md) — BFF Elysia orquestrador; `*.query.fn` / `*.service.fn`
- [`../../adr/0011-no-mocks-in-production.md`](../../adr/0011-no-mocks-in-production.md) — sem mocks em produção
- [`../../adr/0012-shell-as-root-screen-mvvm.md`](../../adr/0012-shell-as-root-screen-mvvm.md) — shell autenticado como tela MVVM
- [`../../reference/framework/solidstart/`](../../reference/framework/solidstart/) — docs offline SolidStart (`action`, `useSubmission`, `createAsync`, `query`)
- [`../../reference/framework/elysia/`](../../reference/framework/elysia/) — docs offline Elysia (TypeBox, Eden treaty, group/plugin)
- [`../../reference/ui/vanilla-extract/`](../../reference/ui/vanilla-extract/) — docs offline vanilla-extract
- [`../../reference/ui/gsap/`](../../reference/ui/gsap/) — docs offline GSAP
- [`../../reference/runtime/bun/`](../../reference/runtime/bun/) — docs offline Bun
- Docs irmãos desta feature: [`./plan.fe.md`](./plan.fe.md) · [`./spec.fe.md`](./spec.fe.md) · [`./domain.fe.md`](./domain.fe.md) · [`./adr.fe.md`](./adr.fe.md) · [`./api-readiness.fe.md`](./api-readiness.fe.md) · [`./design-tokens.fe.md`](./design-tokens.fe.md)
- Integração cross-serviço: [`../people-context/constitution.md`](../people-context/constitution.md) · [`../analysis-bi/constitution.md`](../analysis-bi/constitution.md)
- Doc de integração (3 apps→1): [`../README.md`](../README.md)

**Version**: 2.0.0 | **Ratified**: 2026-06-12 | **Last Amended**: 2026-06-12
