# ACDG-BV `web_02` Constitution

> Front + BFF da instância ACDG-Boa Vista (Roraima) em **SolidStart + Elysia + Bun**.
> Esta constituição é a lei de mais alto nível do `web_02`; os **ADRs** (`handbook/adr/`) são o
> registro detalhado de cada decisão e **refinam** estes princípios sem contrariá-los.

## Core Principles

### I. BFF-Orchestrated Boundary
O **browser nunca** vê token, refresh, segredo ou URL de backend. O **BFF (Elysia)** é o único ponto
que fala com os serviços (`social-care`, `people-context`, `analysis-bi`); ele autentica (OIDC+PKCE,
sessão server-side, cookie opaco `HttpOnly`), injeta `Authorization: Bearer` e **orquestra** — o client
nunca compõe, agrega nem faz fan-out, e não conhece a topologia de backends. Toda escrita devolve o estado
resultante, não só `ok`. *(ADR-0004, ADR-0005, ADR-0010)*

### II. Errors as Values
Erros são **valores** (`Result<T,E>`), nunca exceções de fluxo. `throw` é proibido fora da borda de
framework. O Eden devolve `{ data, error }`; a **única** travessia valor→exceção é a derivação do
`createAsync` do Solid (para o `<ErrorBoundary>`). A UI decide por **semântica** (tag i18n), nunca por
status HTTP. *(ADR-0002)*

### III. Vertical-Modular · Client (MVVM) × Server (DDD)
Módulos verticais (`modules/<f>/{server,client,public-api}`), import cross-módulo **só via `public-api`**.
A fronteira client↔server é o **Eden treaty → rota Elysia**. O **server** é DDD (domínio puro, ports,
use-cases); o **client** é MVVM: **ViewModel puro** (testável sem montar Solid) + **binding** (único ponto
que toca a reatividade: `action`/`useSubmission`/`createAsync`) + **Command** + view burra. O núcleo
(`data`/`domain`/`*.view-model.ts`) não importa `solid-js`/`@solidjs/*`. *(ADR-0001, ADR-0004, ADR-0009, ADR-0012)*

### IV. Bun-Native / Zero-NPM-Utility (NON-NEGOTIABLE)
**Proibido adicionar dependência npm que duplique algo que o Bun/Solid/Elysia já entregam nativamente.**
O stack-base (SolidStart, Elysia, vanilla-extract, GSAP, jose, Eden) é a fundação permitida (via `bun add`);
tudo utilitário usa o built-in. Substituições obrigatórias: pnpm→**Bun**, TanStack Query→**Solid nativo**
(`createAsync`/`action`), Zod→**TypeBox** (`Elysia.t`), `node:test`→**`bun:test`**, @fontsource→**`.woff2`
manual**, eslint-plugin-boundaries→**governance test (`bun:test`)**, SessionStore Redis→**`Bun.redis`**,
React→**Solid**. Só se traz npm quando **não há** nativo (ex.: `jose` para OIDC/JWKS). *(ADR-0003, ADR-0007, ADR-0008; `handbook/adr/README.md`)*

### V. Strict TypeScript & End-to-End Type Safety
TS **estrito** (sem `any` implícito; `tsc --noEmit` limpo é gate). A validação de contrato é **TypeBox
(`Elysia.t`)** no BFF; o **Eden** propaga o tipo ao client — o tipo do schema é a fonte única, sem
redeclarar Model. Referenciar token de design inexistente é **erro de compilação** (vanilla-extract). *(ADR-0002, ADR-0004, ADR-0007)*

### VI. Honesty in Production (No Mocks)
**Nada de mock em `src/`.** Operação sem rota no backend retorna o valor `'not-implemented'`, nunca dado
fabricado. Fixtures de teste só em `tests/`. A UI nunca mostra dado falso; falhas reais aparecem como tais. *(ADR-0011)*

## Technology Stack & Constraints

- **Stack:** SolidStart (Solid · Vinxi · Nitro preset `bun`) · Elysia (BFF em `routes/api/[...path].ts`) ·
  Bun (runtime/PM/test/bundle) · Eden Treaty · jose (OIDC) · vanilla-extract (CSS-in-TS zero-runtime) · GSAP.
- **Package manager = Bun**, com supply-chain hardening **nativo**: lifecycle scripts bloqueados por padrão
  (`trustedDependencies`), `[install.security] scanner`, `--linker isolated` + `globalStore`, `bun audit` no
  CI, `bun.lock` + `--frozen-lockfile`. **Runtime de produção sem `node_modules`** (bundle `.output` do Nitro;
  opcional `bun build --compile`). *(ADR-0003)*
- **Segurança:** OIDC+PKCE (Authentik), refresh single-flight, `id_token` verificado com `jose`; CSP/HSTS/
  nosniff/frame-deny via **Elysia + SolidStart middleware + Caddy** (nonce per-request p/ a hidratação do
  Solid); CSRF por `X-Requested-With` + origem. *(ADR-0005, ADR-0006)*
- **LGPD (dados de saúde de pacientes raros) é crítico:** minimização (`/me` devolve só o essencial),
  self-host de webfonts (zero IP a terceiros), audit centralizado no `social-care`, anonimização no
  `analysis-bi`. *(ADR-0005, ADR-0008)*
- **Idioma:** diálogo e docs em **PT-BR** (acentuação correta); código (vars, funções, types, paths) em **EN**.

## Development Workflow & Quality Gates

- **Spec-Driven Development (spec-kit):** `/speckit-constitution` → `/speckit-specify` → `/speckit-plan` →
  `/speckit-tasks` → `/speckit-implement` (opcionais: `clarify`/`analyze`/`checklist`). Specs vivem em `.specify/`.
- **Gates (rodam em `bun test` / CI), tudo Bun-native (sem ESLint):**
  - `bunx tsc --noEmit` limpo (type-safety ponta a ponta).
  - **Governance tests** (`tests/architecture/*`): boundaries de módulo, núcleo client sem `@solidjs/*`,
    "só-tokens" no design system, `no-mocks-in-src`. *(ADR-0001, ADR-0007, ADR-0009, ADR-0011)*
  - Cobertura e testes de segurança (`security-headers.test.ts`).
- **Docs offline canônicas** em `handbook/reference/` (lidas por inteiro, não resumos) — fonte de verdade
  das APIs do stack.
- **Commits:** Conventional Commits. Envelope de resposta padrão `{ data, meta }`; erros com código estruturado.

## Governance

Esta constituição **supersede** outras práticas. Os **ADRs** (`handbook/adr/`) são o registro detalhado e
refinam os princípios — divergência entre código e princípio é defeito a corrigir, não exceção. Emendas
exigem: ADR documentando a mudança + bump de versão abaixo + atualização dos artefatos afetados. Todo
PR/review verifica conformidade com os Core Principles (com destaque para o **Princípio IV**, não-negociável).

**Version**: 1.0.0 | **Ratified**: 2026-06-12 | **Last Amended**: 2026-06-12
