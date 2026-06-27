# Constituição Web — `people-context` (web_02)

> Constituição do frontend web ACDG-BV (`web_02/` — front+BFF SolidStart + Elysia + Bun),
> aplicada à feature `002-people-context-web`. Condensa em **VI princípios numerados** as
> invariantes da [constituição web_02](../../../.specify/memory/constitution.md) v1.0.0 e os
> [ADRs aceitos](../../adr/README.md) (0001–0012). É referenciada por
> [`domain.fe.md`](./domain.fe.md), [`spec.fe.md`](./spec.fe.md),
> [`plan.fe.md`](./plan.fe.md), [`adr.md`](./adr.md), [`adr.fe.md`](./adr.fe.md) e
> [`design-tokens.fe.md`](./design-tokens.fe.md). Cada princípio é uma invariante: ou o
> código respeita, ou não entra em `main`.

## Core Principles

### I. BFF-Orchestrated Boundary
O **BFF (Elysia)**, montado em `src/routes/api/[...path].ts`, é o único ponto que fala
com os backends (`people-context`, `social-care`, `analysis-bi`): autentica via OIDC+PKCE
(Authentik), mantém sessão server-side com cookie opaco `HttpOnly`, injeta
`Authorization: Bearer <jwt>` e **orquestra** — fan-out paralelo, composição do ViewModel
pronto, fallback gracioso quando um serviço tolerável falha (campo `| null`, nunca 500 por
falha parcial tolerável). O **browser nunca** vê token, refresh token, segredo ou URL de
backend. O client **nunca compõe, agrega, faz fan-out, nem conhece a topologia de backends**
— consome rotas Elysia via Eden treaty (uma rota por caso de uso) e cuida só de estado de UI.
O BFF não duplica regra de negócio canônica do backend — a fonte de verdade da identidade
(dedup por CPF, IdP-first, RBAC de vínculos) é o `people-context` (ver
[`domain.fe.md`](./domain.fe.md)). Decisão exemplar desta feature em [`adr.md`](./adr.md).
*(ADR-0004, ADR-0005, ADR-0010)*

### II. Errors as Values
Erros são **valores** (`Result<T, E>`), nunca exceções de fluxo. `throw` é proibido fora da
borda de framework; quando uma API nativa lança, o `catch` converte para `Result`
imediatamente. Erros são unions de **string literais** (ex.: `'person-not-found'`), nunca
subclasses de `Error`. Swallowing é antipadrão: todo erro propaga como `Result` ou é logado
com contexto estruturado. O **Eden treaty** devolve `{ data, error }` nativamente — a cadeia
de erro é fixa e tipada ponta a ponta:

```
backend 4xx/5xx
  → resultFetch → Result.err(HttpError)              [external, sem throw]
  → Elysia BFF: mapToServerResponse → envelope { error } (status preservado, schema TypeBox)
  → Eden treaty → { data, error }                    [valor — NÃO lança]
  → data layer: mapToAppError(error)                  [Result/valor]
  → createAsync(): lança AppError p/ <ErrorBoundary>  [ÚNICA ponte valor→exceção]
  → onError do boundary (auth:expired → signOut)      [um único lugar]
  → switch exaustivo em AppError.kind → label i18n    [ui]
```

A **única** travessia valor→exceção é a derivação do `createAsync` do Solid (para o
`<ErrorBoundary>`). A UI decide por **semântica** (tag i18n — ex.: `'person-not-found'`),
nunca por status HTTP. Mapeamento dos códigos `PEO/ROL/IDP/AUTH-XXX` do backend:
[`adr.fe.md`](./adr.fe.md). *(ADR-0002)*

### III. Vertical-Modular · Client (MVVM) × Server (DDD)
Módulos verticais (`modules/<f>/{server,client,public-api}`), import cross-módulo **somente
via `public-api`**. A fronteira client↔server é o **Eden treaty → rota Elysia**; `client/`
nunca importa `server/domain` nem `server/application` — comunica-se exclusivamente pelo
BFF.

**Server-side (DDD):** `server/domain/` puro (VOs, Result, regras,
`*.repository.port.ts`); `server/application/` (`*.use-case.ts`, orquestra serviços e
sessão); `server/adapters/` (handlers Elysia `*.query.fn.ts` / `*.service.fn.ts`, clientes
de serviços, schemas TypeBox, mappers).

**Client-side (MVVM):** o núcleo é puro e portável — testável em `bun:test` sem montar
nada do Solid. Organização por **comportamento** (feature-first); a camada é o **sufixo**
do arquivo:

| Sufixo | Camada | Puro / testável em `bun:test`? |
|--------|--------|-------------------------------|
| `*.mutation.ts` / `*.query.ts` | data específica do comportamento (`action`/`query` + chave) | Sim |
| `*.view-model.ts` | **ViewModel puro** — commands + derivações (`toErrorTag`) + efeitos (`onSuccess`) | Sim |
| `*.binding.ts` | **binding Solid** — único ponto que toca a reatividade (`action`/`useSubmission`/`createAsync`) | Não (Solid) |
| `*.page.tsx` / `*.component.tsx` | **View burra** (JSX Solid) | Não (Solid) |
| `*.controller.ts` | **Controller** (estado transiente de form) | Não (Solid) |

O `*.binding.ts` (`useXxxBinding()`) é **fino e burro**: não decide nada, só assina a
reatividade e expõe `{ commands }`. **Trocar a primitiva reativa = reescrever só os
`*.binding.ts`**; o núcleo puro permanece intacto.

**Server-state** no `createAsync`/`query` do `@solidjs/router` (sem TanStack Query —
Princípio IV); **UI-state** em signal/store/reducer do Solid. Fronteiras enforçadas por
**governance tests em `bun:test`** (não há `eslint-plugin-boundaries`). *(ADR-0001,
ADR-0004, ADR-0009, ADR-0012)*

### IV. Bun-Native / Zero-NPM-Utility (NON-NEGOTIABLE)
**Proibido adicionar dependência npm que duplique algo que o Bun/Solid/Elysia já entregam
nativamente.** O stack-base (SolidStart, Elysia, vanilla-extract, GSAP, jose, Eden) é a
fundação permitida (via `bun add`); tudo utilitário usa o built-in. Substituições
obrigatórias aplicadas nesta feature:

| Saiu | Entrou |
|------|--------|
| pnpm | **Bun** (`bun install`, `bun.lock`, `trustedDependencies`, `bun audit`, `--linker isolated`, `globalStore`) |
| TanStack Query | **Solid nativo** (`createAsync` / `query` / `action` / `useSubmission` do `@solidjs/router`) |
| Zod (`z.infer`, `inputSchema`/`outputSchema`) | **TypeBox** (`Elysia.t`) — vem com o Elysia; tipo flui via Eden, sem redeclarar Model |
| `node:test` / Vitest / jsdom | **`bun:test`** + happy-dom |
| MSW | fakes in-memory + `bun:test` |
| ESLint / `eslint-plugin-boundaries` | **governance tests em `bun:test`** (varrem `src/`) |
| @fontsource | **`.woff2` self-host manual** em `public/fonts/` |
| React / componentes `.tsx` React | **Solid** (JSX Solid; `createSignal`/`createStore` → `useState`; `createEffect`/`onMount` → `useEffect`) |
| `*.server-fn.ts` | `*.query.fn.ts` / `*.service.fn.ts` (handler Elysia) |
| Presenter Hook (`use-<feat>.presenter.ts`) | **ViewModel puro** (`*.view-model.ts`) + **binding Solid** (`*.binding.ts`) + Command |
| React Aria Components + Tailwind v4 | **vanilla-extract** (CSS-in-TS zero-runtime, Atomic Design, so-tokens) |
| Node 24 | **Bun** (Nitro preset `bun`) |

Package manager = **Bun** com supply-chain hardening nativo: lifecycle scripts bloqueados
por padrão (`trustedDependencies`), `[install.security] scanner`, `--linker isolated` +
`globalStore`, `bun audit` no CI, `bun.lock` + `--frozen-lockfile`. Runtime de produção
**sem `node_modules`** (bundle `.output` do Nitro). *(ADR-0003, ADR-0007, ADR-0008;
[`../../adr/README.md`](../../adr/README.md))*

### V. TypeScript Estrito & Type Safety Ponta a Ponta
TS **estrito** (`strict: true`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`);
`any` proibido (`unknown` + narrowing); `as` exige justificativa; `bunx tsc --noEmit` limpo
é gate. Toda identidade (`PersonId`, `RoleId`) e todo valor validado (`Cpf`, `Email`,
`IsoDate`) é branded com smart constructor retornando `Result<T, E>`. Estados finitos são
discriminated unions com `switch` exaustivo (`never`) — ex.:
`loginStatus: 'none' | 'provisioned' | 'provision-pending'`. Imutabilidade por padrão
(`Readonly<{}>`, `readonly T[]`, `as const`). **Sem `class`, sem `this`** — funções puras +
factory closures `(deps) => (input) => Promise<Result>`.

A validação de contrato é **TypeBox (`Elysia.t`)** no BFF; o **Eden** propaga o tipo ao
client — o tipo do schema é a **fonte única**, sem redeclarar Model. Referenciar token de
design inexistente é **erro de compilação** (vanilla-extract). *(ADR-0002, ADR-0004,
ADR-0007)*

### VI. Honesty in Production (No Mocks)
**Nada de mock em `src/`.** Operação sem rota no backend retorna o valor
`'not-implemented'`, nunca dado fabricado. Fixtures de teste **somente em `tests/`**.
A UI nunca mostra dado falso; falhas reais aparecem como tais. Enforcement por
**governance test em `bun:test`** (varre `src/` por padrões de mock — mesmo mecanismo
do ADR-0011). *(ADR-0011)*

## Restrições Adicionais: Segurança e LGPD (Iron Frontier)

- **O browser NUNCA vê**: JWT/access token, refresh token, client secret OIDC, URLs dos
  backends, token de service account do Authentik, nem PII sensível (CPF) em JSON de estado
  JS — a listagem e a ficha usam `cpfMasked`; CPF completo só em SSR HTML quando o design
  exige.
- **BFF é a única ponte**: toda chamada do browser vai para `/api/*` (rota Elysia via Eden
  treaty); o BFF injeta `Authorization: Bearer <jwt>` ao proxar e, nas mutações do
  `people-context`, o header `X-Actor-Id` (= `JWT.sub` da sessão — exigência `AUTH-003` do
  backend, que o correlaciona com o token validado). O Authentik Management API é assunto
  exclusivo do backend `people-context` ([`adr.md`](./adr.md)).
- **Sessão**: cookie `__Host-session`, `HttpOnly`, `Secure`, `SameSite=Strict`,
  `Max-Age=8h`; CSRF via `Sec-Fetch-Site` + `X-Requested-With` em mutations; CSP com nonce
  por request (nonce para a hidratação do Solid), HSTS, `X-Frame-Options: DENY`. Headers via
  **Elysia middleware + SolidStart middleware + Caddy**. *(ADR-0006)*
- **Cache hardening**: `Cache-Control: no-store, no-cache, must-revalidate, private` em
  toda response com PII; ao logout, o `query` cache do `@solidjs/router` é invalidado
  (auditado em CI); cache com escopo de usuário; **nunca** localStorage/sessionStorage/
  IndexedDB com PII (grep de CI: `cpf`, `nis`, `rg`, `patient`, `family`).
- **LGPD — registro de identidade de pacientes raros**: minimização por tela (só campos que
  o design exige); o link de password reset **nunca** trafega em response HTTP nem chega ao
  browser (viaja só no evento NATS para o `queue-manager`); erasure (Art. 18 V) é ação
  exclusiva de `superadmin`, irreversível, com confirmação destrutiva explícita na UI; CPF
  nunca em eventos, logs ou estado JS; audit do `people-context` é via eventos NATS e o
  audit trail clínico permanece no backend Swift via Outbox — o BFF não tem audit próprio e
  nunca loga body com PII.
- **RBAC na UI**: papéis `worker`/`owner`/`admin` (escopado `system:admin`) e `superadmin`
  do claim `groups` do token OIDC (Authentik) controlam apenas exibição de ações; a
  autorização real é do backend (`AuthGuard` — `ROL-006`/`ROL-007`/`ROL-008`, auto-assign
  proibido).

## Workflow de Desenvolvimento e Quality Gates

- **Spec-Driven**: sem código sem spec aprovada — [`spec.fe.md`](./spec.fe.md) e
  [`plan.fe.md`](./plan.fe.md) desta feature precedem qualquer ticket; decisões
  arquiteturais viram ADR ([`adr.md`](./adr.md), [`adr.fe.md`](./adr.fe.md)); ADRs não são
  editados, são substituídos (`supersedes`).
- **Handbook é fonte da verdade**: conflito entre código e `web_02/handbook/` → handbook
  ganha.
- **Pipeline W0–W3**: W0 RED (testes falhando) → W1 GREEN (implementação mínima) →
  W2 REVIEW (read-only, máx. 3 rounds) → W3 QUALITY (todos os gates verdes).
- **Gates (rodam em `bun test` / CI), tudo Bun-native (sem ESLint):**
  - `bunx tsc --noEmit` limpo (type-safety ponta a ponta).
  - **Governance tests** (`tests/architecture/*`): boundaries de módulo, núcleo client sem
    `@solidjs/*`, "só-tokens" no design system, `no-mocks-in-src`. *(ADR-0001, ADR-0007,
    ADR-0009, ADR-0011)*
  - Cobertura mínima: `domain/` pura 90%, `application/` 80%.
  - Testes de segurança (`security-headers.test.ts`) e axe (a11y WCAG 2.2 AA).
  - Bundle ≤ 200KB gzip auditado no CI.
- **Idioma**: código em EN; UI strings em PT-BR via i18n (dicionários TS tipados, PT-BR
  primário, pronto para EN/ES); commits Conventional Commits em PT-BR com acentuação correta
  (`feat:` → minor, `fix:` → patch); merge em `main` gera tag SemVer anotada.

## Governance

Esta constituição supera qualquer outra prática da feature; em caso de conflito com
documentos irmãos ([`spec.fe.md`](./spec.fe.md), [`plan.fe.md`](./plan.fe.md)), esta
constituição prevalece e o documento é corrigido. Emendas exigem PR dedicado citando ADR
justificativo, revisão arquitetural explícita (sem rubber stamp) e bump de versão (`1.x.y`
para adições compatíveis; `2.0.0` para remoção/inversão de princípio). Todo PR e review
verificam conformidade com os princípios I–VI; o **Princípio IV (Bun-Native)** é
não-negociável. Complexidade adicional deve ser justificada por escrito. A constituição
expandida permanece em
[`web_02/.specify/memory/constitution.md`](../../../.specify/memory/constitution.md);
divergências entre os dois documentos são resolvidas a favor da fonte expandida, com
correção imediata daqui.

## Referências

- [Constituição web_02 (fonte expandida)](../../../.specify/memory/constitution.md)
- [Índice de ADRs](../../adr/README.md)
- [ADR-0001 — Arquitetura vertical-modular](../../adr/0001-vertical-modular-architecture.md)
- [ADR-0002 — Erros como valores (Result)](../../adr/0002-errors-as-values.md)
- [ADR-0003 — Bun supply-chain](../../adr/0003-bun-supply-chain.md)
- [ADR-0004 — Split client (MVVM) × server (DDD)](../../adr/0004-client-server-split-mvvm-ddd.md)
- [ADR-0005 — Auth: OIDC+PKCE, sessão opaca, refresh single-flight](../../adr/0005-auth-session-refresh-decisions.md)
- [ADR-0006 — Security headers & CSP](../../adr/0006-security-headers-csp.md)
- [ADR-0007 — Design system: vanilla-extract](../../adr/0007-design-system-vanilla-extract.md)
- [ADR-0008 — Self-host de webfonts](../../adr/0008-self-host-webfonts.md)
- [ADR-0009 — ViewModel puro + binding Solid + Command](../../adr/0009-framework-agnostic-client.md)
- [ADR-0010 — BFF Elysia orquestrador; `*.query.fn` / `*.service.fn`](../../adr/0010-bff-orchestration-fn-naming.md)
- [ADR-0011 — No mocks in production](../../adr/0011-no-mocks-in-production.md)
- [ADR-0012 — Shell autenticado como tela MVVM raiz](../../adr/0012-shell-as-root-screen-mvvm.md)
- [Doc de integração cross-serviço (README)](../README.md)
- [domain.fe.md — Domínio frontend desta feature](./domain.fe.md)
- [spec.fe.md — Especificação frontend](./spec.fe.md)
- [plan.fe.md — Plano de implementação frontend](./plan.fe.md)
- [adr.md — ADRs desta feature (backend/integração)](./adr.md)
- [adr.fe.md — ADRs desta feature (frontend)](./adr.fe.md)
- [design-tokens.fe.md — Tokens de design desta feature](./design-tokens.fe.md)
- [api-readiness.fe.md — Prontidão dos contratos de API](./api-readiness.fe.md)
- [Referência offline: Bun runtime](../../reference/runtime/bun/)
- [Referência offline: Elysia (BFF)](../../reference/framework/elysia/)
- [Referência offline: SolidStart](../../reference/framework/solidstart/)
- [Referência offline: vanilla-extract](../../reference/ui/vanilla-extract/)
- [Referência offline: GSAP](../../reference/ui/gsap/)

**Version**: 2.0.0 | **Ratified**: 2026-06-12 | **Last Amended**: 2026-06-12
