# ADRs — `web_02` (SolidStart + Elysia + Bun)

Architecture Decision Records do experimento **web_02**. Stack atual (validada no spike de 2026-06-12):

| Camada | Tecnologia |
|--------|-----------|
| Front + SSR | **SolidStart** (Solid · Vinxi · Nitro preset `bun`) |
| BFF | **Elysia** montado em `src/routes/api/[...path].ts` (catch-all → `app.fetch`) |
| Runtime + PM | **Bun** (`bun install` / `bun.lock` / `bun test` / `bun build`) |
| Client ↔ BFF | **Eden Treaty** (type-safe, isomorphic no SSR) |
| Auth | **OIDC + PKCE** (Authentik) · **jose** (verify) · sessão server-side · cookie opaco `HttpOnly` |
| Estilo | **vanilla-extract** (CSS-in-TS zero-runtime) |
| Animação | **GSAP** |
| Validação | **TypeBox** (`Elysia.t`, vem com Elysia) |

## 🧭 Regra-mãe: **Bun-native first / zero-npm-utility** (decidida 2026-06-12)

> **É proibido adicionar dependência npm que duplique algo que o Bun/Solid/Elysia já entregam nativamente.**
> O stack-base acima é a fundação permitida (instalado via `bun add`). Tudo que for *utilitário* usa o
> built-in. Tabela de substituições aplicada a TODOS os ADRs:

| Saiu (npm) | Entrou (nativo) |
|------------|-----------------|
| pnpm | **Bun** (`bun install`, `bun.lock`, `trustedDependencies`, `bun audit`, `--linker isolated` + `globalStore`; runtime sem `node_modules` via bundle Nitro) |
| TanStack Query | **Solid nativo** (`createAsync` / `query` / `action` / `useSubmission` do `@solidjs/router`) |
| Zod | **TypeBox** (`Elysia.t`) — vem com o Elysia |
| `node:test` | **`bun:test`** |
| @fontsource | **`.woff2` self-host manual** em `public/fonts/` |
| eslint-plugin-boundaries | **governance tests** em `bun:test` (varrem `src/`) |
| TanStack Start middleware | **Elysia** (`onRequest`/`onAfterHandle`) + **SolidStart middleware** |
| SessionStore Redis-like | **`Bun.redis`** |
| React | **Solid** |

## Índice

| ADR | Decisão |
|-----|---------|
| [0001](./0001-vertical-modular-architecture.md) | Arquitetura vertical-modular (`modules`/`shared`/`external` + `public-api`) |
| [0002](./0002-errors-as-values.md) | Erros como valores (`Result`) — Eden devolve `{ data, error }`; ponte p/ ErrorBoundary do Solid |
| [0003](./0003-bun-supply-chain.md) | **Bun** como package manager + supply-chain hardening (default-secure scripts); `globalStore` + runtime sem `node_modules` |
| [0004](./0004-client-server-split-mvvm-ddd.md) | Split client (MVVM) × server (BFF/DDD); a fronteira é o Eden treaty → Elysia |
| [0005](./0005-auth-session-refresh-decisions.md) | Auth — OIDC+PKCE (Authentik), sessão opaca, refresh single-flight, `jose` verify |
| [0006](./0006-security-headers-csp.md) | Security headers & CSP (Elysia middleware + SolidStart + Caddy; nonce p/ hidratação Solid) |
| [0007](./0007-design-system-vanilla-extract.md) | vanilla-extract como engine do design system |
| [0008](./0008-self-host-webfonts.md) | Self-host de webfonts via `.woff2` manual (sem npm) |
| [0009](./0009-framework-agnostic-client.md) | Cliente: ViewModel puro + binding Solid + Command (sobre `action`/`createAsync`) |
| [0010](./0010-bff-orchestration-fn-naming.md) | BFF Elysia orquestrador; rota completa por caso de uso; `*.query.fn` / `*.service.fn` |
| [0011](./0011-no-mocks-in-production.md) | Sem mocks em produção — `not-implemented` como valor (governance test em `bun:test`) |
| [0012](./0012-shell-as-root-screen-mvvm.md) | Shell autenticado é uma TELA MVVM (`root`) em `modules/shell/client`, client-only |

> **Nota:** dois arquivos foram **renomeados** ao atualizar o stack: `0003-pnpm-v11-supply-chain.md` → `0003-bun-supply-chain.md` e `0008-self-host-webfonts-fontsource.md` → `0008-self-host-webfonts.md` (o tooling npm saiu do título). Todos os ADRs foram atualizados em **2026-06-12** para o stack web_02 sob a regra Bun-native.
