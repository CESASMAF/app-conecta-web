# ACDG Web Constitution — `analysis-bi`

> Constituição do frontend web ACDG-BV (`web_02/` — front+BFF **SolidStart + Elysia + Bun**),
> aplicada à feature `003-analysis-bi-web`. Condensa em **VI princípios numerados** as
> invariantes de [`web_02/.specify/memory/constitution.md`](../../../.specify/memory/constitution.md)
> v1.0.0 e os ADRs aceitos do [`web_02/handbook/adr/`](../../adr/README.md) (0001–0012). É
> referenciada por [`domain.fe.md`](./domain.fe.md), [`spec.fe.md`](./spec.fe.md),
> [`plan.fe.md`](./plan.fe.md), [`adr.md`](./adr.md), [`adr.fe.md`](./adr.fe.md) e
> [`design-tokens.fe.md`](./design-tokens.fe.md). Cada princípio é uma invariante: ou o
> código respeita, ou não entra em `main`.

## Core Principles

### I. BFF-Orchestrated Boundary
O **BFF (Elysia)**, montado em `src/routes/api/[...path].ts`, é o cérebro e a **única
ponte** com os backends: fan-out paralelo aos microserviços (`analysis-bi`, `social-care`,
`people-context`), orquestração, composição do ViewModel pronto e fallback gracioso quando
um serviço tolerável falha (campo `| null`, nunca 500 por falha parcial tolerável). O BFF
tem domínio próprio de orquestração e **nunca duplica regra de negócio canônica do backend**
— a fonte de verdade dos indicadores agregados (anonimização na ingestão, K-anonymity K=5
na query, supressão contabilizada em `meta.suppressed_groups`) é o `analysis-bi` (ver
[`domain.md`](./domain.md)). Rotas de leitura são `*.query.fn.ts`; rotas de escrita/efeito
são `*.service.fn.ts` — o client **nunca compõe, agrega nem faz fan-out**, e não conhece a
topologia de backends. Toda escrita devolve o estado resultante, não só `ok`.
*(ADR-[0004](../../adr/0004-client-server-split-mvvm-ddd.md), ADR-[0005](../../adr/0005-auth-session-refresh-decisions.md), ADR-[0010](../../adr/0010-bff-orchestration-fn-naming.md))*

### II. Errors as Values
Erros são **valores** (`Result<T,E>`), nunca exceções de fluxo. `throw` é proibido nas
camadas de domínio e aplicação — essas camadas retornam `Result`. Erros são unions de
**string literais** (ex.: `'rate-limited'`, `'invalid-period-format'`), nunca subclasses
de `Error`. Swallowing é antipadrão: todo erro propaga como `Result` ou é logado com
contexto estruturado. O `analysis-bi` **não tem códigos estruturados** (`ANA-XXX` não
existe) — o mapeamento HTTP status (400/401/429/503…) → `AppError.kind`/i18n é decisão
desta feature: [`adr.fe.md`](./adr.fe.md). O Eden devolve `{ data, error }`; a **única**
travessia valor→exceção é a derivação do `createAsync` do Solid (para o
`<ErrorBoundary>`). A UI decide por **semântica** (tag i18n), nunca por status HTTP.
*(ADR-[0002](../../adr/0002-errors-as-values.md))*

### III. Vertical-Modular · Client (MVVM) × Server (DDD)
1 rota SolidStart = 1 `createAsync`/`query` = 1 rota Elysia (`*.query.fn`) = 1 ViewModel.
Sem fan-out no client, sem agregar N primitivas numa view, sem `createEffect` orquestrando
fetches. O componente recebe o ViewModel pronto (série de indicador já com gaps preenchidos
e aviso de supressão derivado) e dispara mutations via `action` do `@solidjs/router`
(consumindo rotas Elysia `*.service.fn` via Eden treaty).

Módulos verticais (`modules/<f>/{server,client,public-api}`), import cross-módulo **só via
`public-api`** (`index.ts`). A fronteira client↔server é o **Eden treaty → rota Elysia**.
O **server** é DDD (domínio puro, ports, use-cases); o **client** é MVVM:

- **ViewModel puro** (`*.view-model.ts`) — objeto testável em `bun:test` sem montar o Solid:
  commands, derivações (`hasSuppression`, séries com gaps preenchidos), `toErrorTag`.
- **Binding Solid** (`*.binding.ts`) — único ponto que toca a reatividade:
  `createAsync`/`action`/`useSubmission` do `@solidjs/router`.
- **Command** — `{ running, errorTag, result, execute }` padronizando loading/erro na View.
- **View burra** — só renderiza e despacha commands; `derived` carrega o que é calculado do
  dado bruto (`hasSuppression`, séries com gaps), nunca recalculado no JSX.

O núcleo (`data/`, `domain/`, `*.view-model.ts`, `*.query.ts`/`*.mutation.ts`) **não importa
`solid-js` nem `@solidjs/*`** — enforcement por governance test em `bun:test` (substitui o
`eslint-plugin-boundaries` do stack React/pnpm anterior). Cache **client-only** (server-state
em `createAsync` / `@solidjs/router` — sem TanStack Query, regra Bun-native, ADR-[0003](../../adr/0003-bun-supply-chain.md)):
zero cache server-side com PII — e mesmo agregados K-anônimos seguem a mesma política, sem
exceção de conveniência.
*(ADR-[0001](../../adr/0001-vertical-modular-architecture.md), ADR-[0004](../../adr/0004-client-server-split-mvvm-ddd.md), ADR-[0009](../../adr/0009-framework-agnostic-client.md), ADR-[0012](../../adr/0012-shell-as-root-screen-mvvm.md))*

### IV. Bun-Native / Zero-NPM-Utility (NON-NEGOTIABLE)
**Proibido adicionar dependência npm que duplique algo que o Bun/Solid/Elysia já entregam
nativamente.** O stack-base (SolidStart, Elysia, vanilla-extract, GSAP, jose, Eden) é a
fundação permitida (via `bun add`); tudo utilitário usa o built-in.

Substituições obrigatórias nesta feature:

| Saiu (stack web/React/pnpm) | Entrou (web_02 Bun-native) |
|---|---|
| pnpm + hooks que bloqueiam npm | **Bun** (`bun install`, `bun.lock`, `trustedDependencies`, `bun audit`, `--linker isolated` + `globalStore`) |
| TanStack Query / `useQuery` / loader | **Solid nativo** (`createAsync` / `query` / `action` / `useSubmission` do `@solidjs/router`) |
| Zod / `z.infer` / `inputSchema`/`outputSchema` Zod | **TypeBox** (`Elysia.t`) — vem com o Elysia; tipo flui ao client via Eden sem redeclarar |
| `node:test` / Vitest / jsdom | **`bun:test`** + happy-dom |
| MSW | fakes/in-memory + `bun:test` |
| ESLint / `eslint-plugin-boundaries` / `no-restricted-imports` | **governance tests em `bun:test`** (varrem `src/`) |
| `@fontsource` | `.woff2` self-host manual em `public/fonts/` |
| React / `useState` / `useEffect` / `useReducer` | **Solid** (`createSignal` / `createStore` / `createEffect` / `onMount`) |
| `*.server-fn.ts` (Server Functions TanStack Start) | `*.query.fn.ts` / `*.service.fn.ts` (handler Elysia consumido via Eden treaty) |
| "Presenter Hook" / `use-<feat>.presenter.ts` | **ViewModel puro** (`*.view-model.ts`) + **binding Solid** (`*.binding.ts`) + Command |

Só se traz npm quando **não há** nativo (ex.: `jose` para OIDC/JWKS).
*(ADR-[0003](../../adr/0003-bun-supply-chain.md), ADR-[0007](../../adr/0007-design-system-vanilla-extract.md), ADR-[0008](../../adr/0008-self-host-webfonts.md); [`handbook/adr/README.md`](../../adr/README.md))*

### V. TypeScript Strict e Type Safety Ponta a Ponta
`strict: true`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`; `any` proibido
(`unknown` + narrowing); `as` exige justificativa. `tsc --noEmit` limpo é gate de CI.

Todo valor validado da consulta analítica (`PeriodYearMonth` `YYYY-MM`, `MesoregionCode`,
`TopN`) é branded com smart constructor retornando `Result<T, E>`. Estados finitos são
discriminated unions com `switch` exaustivo (`never`) — ex.:
`granularity: 'monthly' | 'quarterly' | 'yearly'`,
`axis: 'demographics' | 'epidemiological' | 'socioeconomic' | 'protection' | 'care'`.
Imutabilidade por padrão (`Readonly<{}>`, `readonly T[]`, `as const`). **Sem `class`, sem
`this`** — funções puras + factory closures `(deps) => (input) => Promise<Result>`.

A validação de contrato é **TypeBox (`Elysia.t`)** no BFF; o **Eden** propaga o tipo ao
client — o schema do TypeBox é a fonte única, sem redeclarar Model. Toda response do
`analysis-bi` é validada pelo schema TypeBox do BFF antes de compor o ViewModel (defesa em
profundidade). Validações espelhadas do backend (`period_start`/`period_end` em `YYYY-MM`
obrigatórios, `mesoregion` existente, `top ≥ 0`) são aplicadas nos filtros do dashboard e
**revalidadas pelo backend** (400 vira estado de formulário, nunca surpresa). Referenciar
token de design inexistente é **erro de compilação** (vanilla-extract).
*(ADR-[0002](../../adr/0002-errors-as-values.md), ADR-[0004](../../adr/0004-client-server-split-mvvm-ddd.md), ADR-[0007](../../adr/0007-design-system-vanilla-extract.md))*

### VI. Honesty in Production (No Mocks)
**Nada de mock em `src/`.** Operação sem rota no backend retorna o valor `'not-implemented'`,
nunca dado fabricado. Fixtures e fakes de teste só em `tests/`. A UI nunca mostra dado
falso; falhas reais aparecem como tais. Integração de client usa fakes/in-memory (nunca MSW
nem mock de `fetch` global), incluindo handlers de `suppressed_groups > 0`, 429 e 503.
*(ADR-[0011](../../adr/0011-no-mocks-in-production.md))*

## Restrições Adicionais: Segurança e LGPD (Iron Frontier)

- **O browser NUNCA vê**: JWT/access token, refresh token, client secret OIDC, URLs dos
  backends. Os payloads do `analysis-bi` **não contêm PII por construção** (supressão →
  generalização → K-anonymity K=5 na ingestão e na query; `PATIENT_HASH_SALT` jamais sai do
  serviço) — ainda assim os princípios da Iron Frontier se aplicam integralmente.
- **BFF é a única ponte**: toda chamada do browser vai para `/api/*` via Eden treaty; o
  server injeta `Authorization: Bearer <jwt>` ao proxar. Enquanto os findings **HIGH-001**
  (issuer/audience não validados no serviço) e **HIGH-002** (skip silencioso de auth sem
  `JWKS_URL`) não forem corrigidos no `analysis-bi`, o BFF Elysia é a camada que garante
  sessão OIDC válida antes de qualquer chamada outbound — o serviço nunca é exposto
  publicamente (rede interna, ADR-009 da orquestração BV).
- **Sessão**: cookie `__Host-session`, `HttpOnly`, `Secure`, `SameSite=Strict`,
  `Max-Age=8h`; CSRF via `Sec-Fetch-Site` + `X-Requested-With` em mutations; CSP com nonce
  por request (nonce per-request p/ a hidratação do Solid), HSTS, `X-Frame-Options: DENY`
  — implementado via middleware Elysia + SolidStart + Caddy.
  *(ADR-[0005](../../adr/0005-auth-session-refresh-decisions.md), ADR-[0006](../../adr/0006-security-headers-csp.md))*
- **Cache hardening (ADR-[0004](../../adr/0004-client-server-split-mvvm-ddd.md))**:
  `Cache-Control: no-store, no-cache, must-revalidate, private` em toda response de rota
  Elysia; `createAsync` (server-state do Solid) é limpo no logout (audit em CI); query-key
  com escopo de usuário; **nunca** localStorage/sessionStorage/IndexedDB com PII (grep de
  CI: `cpf`, `nis`, `rg`, `patient`, `family`) — agregados K-anônimos não dão isenção da
  política.
- **LGPD — dados agregados de pacientes raros (Art. 12)**: dashboards são **read-only e
  exclusivamente sobre agregados K-anônimos** — nenhuma tela pede, exibe ou tenta
  reconstituir dado individual (decisão em [`adr.md`](./adr.md)); quando
  `suppressed_groups > 0`, a UI **deve** exibir o aviso de supressão por privacidade
  ("X grupos suprimidos — K=5"), nunca ocultá-lo; exports (8 formatos) passam pelo BFF com
  o mesmo filtro K=5 aplicado pelo serviço; o BFF nunca loga payloads de export;
  minimização vale também aqui: só os eixos e filtros que o design exige.
- **RBAC na UI**: papéis do claim `groups` do token OIDC (Authentik) controlam exibição de
  ações; enquanto o **HIGH-003** (RBAC não enforced no `analysis-bi` — `role_guard.go` é
  placeholder) não for corrigido, o BFF Elysia aplica a checagem de papel **antes** de
  proxar — é autorização efetiva, não cosmética, e está documentada como mitigação
  temporária em [`adr.fe.md`](./adr.fe.md).

## Design System

UI = **vanilla-extract** (CSS-in-TS zero-runtime, Atomic Design com so-tokens)
*(ADR-[0007](../../adr/0007-design-system-vanilla-extract.md))*. Tokens derivados do Figma
(cores OKLCH, Atkinson Hyperlegible, espaçamento base 4/8, elevações, state-layer
opacities) centralizados e consumidos via [`design-tokens.fe.md`](./design-tokens.fe.md) —
nenhuma cor/medida hardcoded em componente (inclusive paletas de gráfico). Referenciar
token inexistente é **erro de compilação** (garantia do vanilla-extract). WCAG 2.2 AA
obrigatório (axe em unit e E2E); gráficos exigem alternativa textual/tabular acessível;
bundle ≤ 200 KB gzip. Webfonts self-hosted em `public/fonts/` (`.woff2` manual, sem
`@fontsource` — zero IP a terceiros, LGPD).
*(ADR-[0008](../../adr/0008-self-host-webfonts.md))*

Lib de gráficos só entra com Inquiry ou ADR aprovado + análise de impacto de bundle e a11y
— SVG próprio é a primeira hipótese. Animações via **GSAP** (já na fundação do stack).
i18n é camada própria de dicionários TS tipados, PT-BR primário, pronta para EN/ES
(vocabulário dos 5 eixos: "faixa etária", "mesorregião", "supressão por privacidade",
"K-anonimato"). Nativo primeiro: `Intl`/`Temporal`, `crypto.randomUUID()`.

## Comunicação entre ViewModels (Event Bus do Client)

Comunicação entre ViewModels acontece por eventos nomeados em EN-passado
(`DashboardFiltersApplied`, `ExportCompleted`, `SessionExpired`) sobre `EventTarget` +
`CustomEvent` nativos — nunca import direto entre ViewModels de módulos diferentes (fronteira
enforçada por governance test em `bun:test`). Cada evento declara emissor, payload tipado e
assinantes no [`domain.fe.md`](./domain.fe.md) da feature. Eventos de **domínio** (backend)
seguem no Transactional Outbox do `social-care` e chegam ao `analysis-bi` via NATS
JetStream — o Event Bus do client é exclusivamente reativo de UI e jamais participa do
pipeline analítico.

## Workflow de Desenvolvimento e Quality Gates

- **Spec-Driven**: sem código sem spec aprovada — [`spec.fe.md`](./spec.fe.md) e
  [`plan.fe.md`](./plan.fe.md) desta feature precedem qualquer ticket; decisões
  arquiteturais viram ADR ([`adr.md`](./adr.md), [`adr.fe.md`](./adr.fe.md)); ADRs não são
  editados, são substituídos (`supersedes`).
- **Handbook é fonte da verdade**: conflito entre código e `web_02/handbook/` → handbook
  ganha.
- **Pipeline W0–W3**: W0 RED (testes falhando) → W1 GREEN (implementação mínima) →
  W2 REVIEW (read-only, máx. 3 rounds) → W3 QUALITY (todos os gates verdes).
- **TDD**: RED → GREEN → REFACTOR obrigatório em `domain/` e `application/` (cobertura
  mínima 90%/80%). Testes de domain são puros (clock e UUID injetados — gap filling de
  séries é testado sem relógio real); application usa fakes in-memory; integração de client
  com fakes/in-memory (nunca MSW — regra Bun-native), incluindo handlers de
  `suppressed_groups > 0`, 429 e 503; cada feature tem ≥ 1 golden path E2E (Playwright).
- **Gates de CI (tudo Bun-native, sem ESLint)**:
  - `bunx tsc --noEmit` limpo (type-safety ponta a ponta).
  - **Governance tests** (`tests/architecture/*` em `bun:test`): boundaries de módulo,
    núcleo client sem `@solidjs/*`, "só-tokens" no design system, `no-mocks-in-src`.
    *(ADR-[0001](../../adr/0001-vertical-modular-architecture.md), ADR-[0007](../../adr/0007-design-system-vanilla-extract.md), ADR-[0009](../../adr/0009-framework-agnostic-client.md), ADR-[0011](../../adr/0011-no-mocks-in-production.md))*
  - Format, typecheck, tests, build, axe, bundle.
- **Tooling**: Bun obrigatório (`npm`/`yarn`/`pnpm`/`npx` não são usados — supply-chain
  hardening nativo: `trustedDependencies`, `[install.security] scanner`, `--linker isolated`
  + `globalStore`, `bun audit` no CI, `bun.lock` + `--frozen-lockfile`). Runtime de
  produção sem `node_modules` (bundle `.output` do Nitro preset `bun`).
  *(ADR-[0003](../../adr/0003-bun-supply-chain.md))*
- **Idioma**: código em EN; UI strings em PT-BR via i18n (vocabulário dos 5 eixos:
  "faixa etária", "mesorregião", "supressão por privacidade", "K-anonimato"); commits
  Conventional Commits em PT-BR com acentuação correta (`feat:` → minor, `fix:` → patch);
  merge em `main` gera tag SemVer anotada.

## Governance

Esta constituição supera qualquer outra prática da feature; em caso de conflito com
documentos irmãos ([`spec.fe.md`](./spec.fe.md), [`plan.fe.md`](./plan.fe.md)), a
constituição prevalece e o documento é corrigido. Emendas exigem PR dedicado citando ADR
justificativo, revisão arquitetural explícita (sem rubber stamp) e bump de versão (`1.x.y`
para adições compatíveis; `2.0.0` para remoção/inversão de princípio). Todo PR e review
verificam conformidade com os princípios I–VI; complexidade adicional deve ser justificada
por escrito. A fonte expandida permanece em
[`web_02/.specify/memory/constitution.md`](../../../.specify/memory/constitution.md);
divergências entre os dois documentos são resolvidas a favor da fonte expandida, com
correção imediata daqui.

**Version**: 2.0.0 | **Ratified**: 2026-06-12 | **Last Amended**: 2026-06-12

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — fonte expandida (princípios I–VI)
- [ADRs — Índice](../../adr/README.md) — tabela de substituições e decisões
- [ADR-0001](../../adr/0001-vertical-modular-architecture.md) — arquitetura vertical-modular
- [ADR-0002](../../adr/0002-errors-as-values.md) — erros como valores (`Result`)
- [ADR-0003](../../adr/0003-bun-supply-chain.md) — Bun como PM + supply-chain hardening
- [ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md) — split client (MVVM) × server (DDD); Eden como fronteira
- [ADR-0005](../../adr/0005-auth-session-refresh-decisions.md) — auth OIDC+PKCE, sessão opaca, `jose`
- [ADR-0006](../../adr/0006-security-headers-csp.md) — security headers & CSP (Elysia + SolidStart + Caddy)
- [ADR-0007](../../adr/0007-design-system-vanilla-extract.md) — vanilla-extract como engine do design system
- [ADR-0008](../../adr/0008-self-host-webfonts.md) — self-host de webfonts `.woff2` manual
- [ADR-0009](../../adr/0009-framework-agnostic-client.md) — ViewModel puro + binding Solid + Command
- [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md) — BFF Elysia orquestrador; `*.query.fn` / `*.service.fn`
- [ADR-0011](../../adr/0011-no-mocks-in-production.md) — sem mocks em produção; `not-implemented` como valor
- [ADR-0012](../../adr/0012-shell-as-root-screen-mvvm.md) — shell autenticado como tela MVVM (`root`)
- [Docs offline — Bun runtime](../../reference/runtime/bun/)
- [Docs offline — Elysia BFF](../../reference/framework/elysia/)
- [Docs offline — SolidStart](../../reference/framework/solidstart/)
- [Docs offline — vanilla-extract](../../reference/ui/vanilla-extract/)
- [Docs offline — GSAP](../../reference/ui/gsap/)
- [Integração cross-serviço (3 apps)](../README.md)
- [domain.fe.md](./domain.fe.md) — eixos analíticos, eventos NATS, Event Bus do client
- [spec.fe.md](./spec.fe.md) — especificação funcional da feature
- [plan.fe.md](./plan.fe.md) — plano de implementação
- [api-readiness.fe.md](./api-readiness.fe.md) — prontidão de contrato do `analysis-bi`
- [design-tokens.fe.md](./design-tokens.fe.md) — tokens OKLCH, tipografia, paletas de gráfico
- [adr.md](./adr.md) — decisões de domínio e LGPD desta feature
- [adr.fe.md](./adr.fe.md) — decisões de frontend específicas desta feature
