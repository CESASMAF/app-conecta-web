# Implementation Plan: Fundação — Acesso autenticado

**Branch**: `001-foundation` | **Date**: 2026-06-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-foundation/spec.md`

## Summary

Entregar a **fatia-fundação** do `web_02`: um app **front + BFF unificado** onde o usuário
autentica pela conta única da organização (OIDC + PKCE no Authentik) e aterrissa num **shell
autenticado**, com rotas protegidas e sessão server-side. O token nunca toca o browser. Esta fatia
estabelece o esqueleto (runtime, BFF, módulos verticais, design system base, governance tests) sobre
o qual as features de produto serão montadas — exatamente a tríade **SolidStart + Elysia + Bun**
validada no spike de 2026-06-12.

Abordagem técnica (resumo; detalhes em [research.md](./research.md)): SolidStart (Vinxi/Nitro preset
`bun`) serve o SSR e monta o **Elysia** como BFF num catch-all `src/routes/api/[...path].ts` (→
`app.fetch`); o client consome o BFF via **Eden treaty** (isomorphic no SSR). A auth roda inteira no
servidor: `jose` valida o `id_token` (JWKS do Authentik), a sessão vive em **`Bun.redis`** referida
por um cookie opaco `__Host-session`, e o BFF injeta `Authorization: Bearer` nas chamadas outbound.

## Technical Context

**Language/Version**: TypeScript estrito (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`; sem `class`/`enum`/`namespace`) sobre **Bun 1.4** (runtime · PM · test · bundle)

**Primary Dependencies**: SolidStart (`@solidjs/start`, `@solidjs/router`, `solid-js`, `vinxi`) · **Elysia** (BFF) · `@elysiajs/eden` (Eden Treaty) · `jose` (OIDC/JWKS — permitido pelo Princ. IV: sem equivalente nativo). **Validação**: TypeBox (`Elysia.t`, vem com Elysia). **Estilo**: vanilla-extract (não exercitado a fundo nesta fatia além do shell). **Animação**: GSAP (não usado nesta feature).

**Storage**: Sessão **server-side em `Bun.redis`** (ADR-0005) referida por cookie opaco; **sem DB próprio do front**; tokens/refresh server-only (nunca no browser). Segredos via padrão `_FILE` (`OIDC_CLIENT_SECRET_FILE`, `SESSION_SECRET_FILE`).

**Testing**: **`bun:test`** — puro (domain/application/view-model/data, sem montar Solid) + **happy-dom** (page/component/binding) + **governance tests** (`tests/architecture/`: boundaries de módulo, núcleo client sem `@solidjs/*`, no-mocks). `bunx tsc --noEmit` como gate.

**Target Platform**: navegador moderno + **BFF Bun** (Nitro preset `bun`, `.output/server/index.mjs`) atrás do **Caddy** na VPS ACDG-BV.

**Project Type**: web app — **front (SolidStart) + BFF (Elysia) unificado**, arquitetura vertical-modular (ADR-0001/0004).

**Performance Goals**: login→shell **< 30 s** (SC-001); renovação de sessão **invisível** (single-flight, SC-005); SSR da 1ª pintura sem FOUC em produção (CSS estático do vanilla-extract).

**Constraints**: token/refresh/segredo/URL de backend **nunca** no browser (Princ. I — verificável, SC-004); **zero npm-utility** (Princ. IV); CSP com **nonce per-request** p/ o script de hidratação do Solid (ADR-0006); **PII de paciente fora** do fluxo de acesso (Princ. Segurança/LGPD, SC-006); mensagens genéricas anti-enumeração (FR-009).

**Scale/Scope**: 1 módulo `auth` + 1 módulo `shell`; **~5 rotas Elysia** (`login`, `callback`, `me`, `logout`, `refresh`/guard); 1 tela de login + 1 shell autenticado (placeholder); 0 telas de produto (fora de escopo).

## Constitution Check

*GATE: passar antes da Fase 0; re-checar após a Fase 1.* Princípios I–VI de [constitution.md](../../.specify/memory/constitution.md) v1.0.0.

| Princípio | Aderência | Nota |
|---|---|---|
| **I. BFF-Orchestrated Boundary** | ✅ | OIDC/sessão/Bearer só em `src/server/*`; cookie `__Host-session` opaco; browser nunca vê token. Fronteira = Eden treaty → Elysia. Gate de bundle (SC-004) garante. *(ADR-0004/0005/0010)* |
| **II. Errors as Values** | ✅ | `Result<T,E>` em `domain`/`application`; Eden devolve `{ data, error }`; ÚNICA ponte valor→exceção no `createAsync`→`<ErrorBoundary>`. Sem `throw` fora da borda. *(ADR-0002)* |
| **III. Vertical-Modular · Client(MVVM)×Server(DDD)** | ✅ | `modules/auth/{server,client,public-api}` + `modules/shell/client`; cross-módulo só via `public-api`; client puro (VM+binding+Command) sobre `action`/`createAsync`. *(ADR-0004/0009/0012)* |
| **IV. Bun-Native / Zero-NPM-Utility (NON-NEG.)** | ✅ | Bun PM/test/bundle; `Bun.redis` (sessão), Web Crypto (PKCE/nonce), `bun:test`. `jose` permitido (OIDC/JWKS — sem nativo). **Sem** TanStack/Zod/node:test/@fontsource/ESLint. *(ADR-0003/0007/0008)* |
| **V. Strict TS & End-to-End Type Safety** | ✅ | `tsc --noEmit` limpo é gate; TypeBox (`Elysia.t`) → tipo flui ao client via Eden, sem redeclarar Model. *(ADR-0004)* |
| **VI. Honesty / No Mocks** | ✅ | `'not-implemented'` (Result) onde faltar backend; **sem** `*-mock.*` em `src/`; governance test `no-mocks-in-src` (`bun:test`). *(ADR-0011)* |

**Restrições de Segurança/LGPD (constituição):** OIDC+PKCE, refresh single-flight, `id_token` verificado com `jose`; CSP/HSTS/nosniff/frame-deny via Elysia+SolidStart middleware+Caddy (nonce); CSRF por `X-Requested-With`; minimização (`/me` só o essencial); zero PII de paciente no fluxo. **Todos os gates passam — sem violações a justificar.**

## Project Structure

### Documentation (this feature)

```text
specs/001-foundation/
├── plan.md              # este arquivo
├── research.md          # Fase 0 — decisões (stack, OIDC, sessão)
├── data-model.md        # Fase 1 — Session, AuthenticatedUser, AppShell
├── quickstart.md        # Fase 1 — validação runnable (bun install/build/smoke)
├── contracts/           # Fase 1 — contratos das rotas do BFF (auth) + guard
│   └── auth-bff.md
└── checklists/
    └── requirements.md  # qualidade do spec (já ✓)
```

### Source Code (repository root = `web_02/`)

```text
web_02/
├── app.config.ts                         # defineConfig({ server: { preset: "bun" } }) + vite plugins (vanillaExtract antes do SolidStart)
├── bunfig.toml                           # [install] linker=isolated, globalStore=true; [install.security] scanner (ADR-0003)
├── package.json                          # trustedDependencies: ["esbuild"]; deps do stack-base
├── src/
│   ├── entry-server.tsx · entry-client.tsx · app.tsx   # boilerplate SolidStart (composition root)
│   ├── middleware.ts                     # SolidStart middleware (security headers SSR, ADR-0006)
│   ├── routes/
│   │   ├── index.tsx                     # redireciona p/ shell ou login
│   │   ├── login.tsx                     # tela de login (US1)
│   │   ├── (app)/…                        # área protegida (shell + Outlet) — guard no load
│   │   └── api/[...path].ts              # ★ catch-all → app.fetch(request) (monta o Elysia)
│   ├── server/                           # BFF (Elysia) — token vive aqui
│   │   ├── env.ts                        # envs + padrão _FILE (fail-fast em prod)
│   │   ├── app.ts                        # app Elysia: onRequest (headers/CSRF), grupos de rota
│   │   ├── oidc.ts                       # PKCE (Web Crypto), troca de code, jwtVerify (jose/JWKS)
│   │   ├── session.ts                    # SessionStore em Bun.redis (create/get/refresh/revoke); cookie __Host-session
│   │   └── routes/                       # *.query.fn.ts / *.service.fn.ts (login, callback, me, logout)
│   ├── lib/eden.ts                       # treaty<App>() — client isomorphic
│   ├── modules/
│   │   ├── auth/{server,client,public-api}   # feature-modelo (login VM+binding, guard, current-user)
│   │   └── shell/client + public-api         # tela root MVVM (ADR-0012) — shell vazio nesta fatia
│   ├── shared/                           # http (security-headers, result, app-error), ui (tokens), ports
│   └── external/                         # config, session-store impl (Bun.redis), csp-nonce
├── public/fonts/                         # .woff2 self-host (ADR-0008)
└── tests/
    ├── architecture/                     # governance: boundaries, no-mocks (bun:test)
    ├── shared/http/security-headers.test.ts
    └── modules/auth/…                    # puro (bun:test) + DOM (happy-dom)
```

**Structure Decision**: app web SolidStart com o **BFF Elysia montado dentro** (catch-all `routes/api/[...path].ts`), arquitetura **vertical-modular** espelhando o core-api (ADR-0001). A auth é a **feature-modelo**; o shell é uma **tela MVVM** (ADR-0012). `routes/`, `app.tsx`, `entry-*`, `app.config.ts` são composition root (fora da matriz de camadas). Boundaries enforçados por **governance test** (`bun:test`), não ESLint (Princ. IV).

## Complexity Tracking

> Sem violações de constituição — todos os 6 princípios passam sem exceção. Nada a justificar.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — nenhuma | — | — |
