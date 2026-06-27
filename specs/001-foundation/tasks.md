# Tasks: Fundação — Acesso autenticado

**Input**: Design documents from `specs/001-foundation/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/auth-bff.md](./contracts/auth-bff.md), [quickstart.md](./quickstart.md)
**Constituição**: [.specify/memory/constitution.md](../../.specify/memory/constitution.md) (Princ. I–VI; IV = Bun-Native NON-NEGOTIABLE)

**Tests**: INCLUÍDOS — a constituição (Quality Gates) e o plano são **TDD-first**. Testes em `bun:test` (puro) + happy-dom (DOM) + governance tests; escritos **antes** e devem **FALHAR** primeiro.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: paralelizável (arquivos diferentes, sem dependência pendente)
- **[Story]**: US1–US4 (mapeia as user stories do spec)
- Caminhos relativos a `web_02/` (repo root da feature)

## Path Conventions (do [plan.md](./plan.md))
- Front+BFF unificado: `src/` (routes/server/modules/shared/external/lib), `tests/` no root. Sem `backend/`/`frontend/` separados.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Esqueleto SolidStart + Elysia + Bun (receita validada no spike de 2026-06-12).

- [X] T001 Criar `package.json` com o stack-base (`@solidjs/start`, `solid-js`, `@solidjs/router`, `vinxi`, `elysia`, `@elysiajs/eden`, `jose`; dev: `@types/node`) + `trustedDependencies: ["esbuild"]` em `package.json`
- [X] T002 [P] Criar `bunfig.toml` com `[install] linker="isolated"`, `globalStore=true` e placeholder `[install.security] scanner` em `bunfig.toml` (ADR-0003)
- [X] T003 [P] Criar `app.config.ts` — `defineConfig({ server: { preset: "bun" }, vite: { plugins: [vanillaExtractPlugin()] } })` em `app.config.ts`
- [X] T004 [P] Criar `tsconfig.json` estrito (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `types: ["vinxi/types/client","node"]`) em `tsconfig.json`
- [X] T005 Boilerplate SolidStart: `src/entry-server.tsx`, `src/entry-client.tsx`, `src/app.tsx`
- [X] T006 [P] Criar `.env.example` (envs OIDC + padrão `_FILE`) em `.env.example` (`.gitignore` já existe)
- [X] T007 [P] Harness de testes de arquitetura: pasta `tests/architecture/` + convenção de `bun:test`

**Checkpoint**: `bun install` ✅ e `bun run build` (Nitro preset bun → `.output/`) ✅ — esqueleto sobe.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infra que TODAS as user stories precisam. **⚠️ Nenhuma US começa antes desta fase.**

- [X] T008 Montar o BFF Elysia: catch-all `src/routes/api/[...path].ts` → `app.fetch(request)` + app base em `src/server/app.ts` (Elysia + `onRequest`)
- [X] T009 [P] `src/server/env.ts` — envs + padrão `_FILE` (`OIDC_CLIENT_SECRET_FILE`/`SESSION_SECRET_FILE`) + **fail-fast em produção** (research D9)
- [X] T010 [P] `Result<T,E>` + `AppError` (erros como valores) em `src/shared/http/result.ts` e `src/shared/http/app-error.ts` (ADR-0002)
- [X] T010b [P] Catálogo i18n (PT-BR) + mensagens de auth **genéricas** (anti-enumeração de usuários) em `src/shared/i18n/auth.ts` — fonte das tags consumidas por `errorTag` (FR-009, SC-007)
- [X] T011 [P] Builder puro de security headers (`buildSecurityHeaders`, `serializeCsp`, `CSP_BASELINE`) em `src/shared/http/security-headers.ts` (ADR-0006)
- [X] T012 `SessionStore` em `Bun.redis` (create/get/refresh/revoke) em `src/external/session-store.ts` (ADR-0005, data-model `Session`)
- [X] T013 [P] Nonce per-request (Web Crypto) em `src/external/csp-nonce.ts` (ADR-0006)
- [X] T014 SolidStart middleware aplicando security headers ao SSR em `src/middleware.ts` (depende T011, T013)
- [X] T015 [P] Eden client isomorphic `treaty<App>()` em `src/lib/eden.ts` (contrato em contracts/auth-bff.md)
- [X] T016 Esqueleto vertical-modular: `src/modules/auth/{server,client,public-api}/`, `src/modules/shell/client/` + `public-api/`, `src/shared/`, `src/external/`

### Governance & contract tests da fundação (escrever PRIMEIRO — devem FALHAR)

- [X] T017 [P] Governance test: boundaries de módulo (só `public-api`/`shared`/`external`) em `tests/architecture/boundaries.test.ts` (ADR-0001)
- [X] T018 [P] Governance test: núcleo client sem `solid-js`/`@solidjs/*` (`*.view-model.ts`/`data`/`domain`) em `tests/architecture/agnostic-core.test.ts` (ADR-0009)
- [X] T019 [P] Governance test: `no-mocks-in-src` (sem `*-mock.*`/`MOCK_*`) em `tests/architecture/no-mocks-in-src.test.ts` (ADR-0011)
- [X] T020 [P] Test do builder de headers (CSP nonce, HSTS condicional, `frame-src 'self' blob:`) em `tests/shared/http/security-headers.test.ts` (ADR-0006)
- [X] T020b [P] Governance/bundle test: **nenhum token/segredo/URL de backend** no bundle client (`bearer|accessToken|refreshToken|client_secret|AUTHENTIK_URL`) em `tests/architecture/no-secret-leak.test.ts` (**SC-004 — gate de segurança automatizado**; Princ. I)

**Checkpoint**: BFF montado, sessão/headers/Eden prontos; governance tests vermelhos (sem impl ainda).

---

## Phase 3: User Story 1 - Entrar com a conta da organização (Priority: P1) 🎯 MVP

**Goal**: Login OIDC+PKCE no Authentik → sessão server-side → aterrissar no shell autenticado; `/me` identifica quem está logado.
**Independent Test**: com conta válida, `login` → `callback` → `/me` 200 `{userId,groups}` e shell renderiza (US1 do spec).

### Tests for User Story 1 (escrever PRIMEIRO — devem FALHAR)

- [X] T021 [P] [US1] Contract test `login` (302 + `code_challenge` S256 + cookie `pkce` assinado) em `tests/modules/auth/login.contract.test.ts`
- [X] T022 [P] [US1] Contract test `callback` (troca code→token, `jwtVerify` id_token, cria sessão, set `__Host-session`) em `tests/modules/auth/callback.contract.test.ts`
- [X] T023 [P] [US1] Contract test `GET /me` (200 `{userId,groups}` / 401 sem sessão) em `tests/modules/auth/me.contract.test.ts`
- [X] T024 [P] [US1] Test puro: geração PKCE (S256) + parse de claims em `tests/modules/auth/oidc.test.ts`
- [X] T025 [P] [US1] ~~DOM test happy-dom~~ → **inviável** com vanilla-extract (os `.css.ts` exigem o transform de build; `bun:test` quebra em `getFileScope`) e Playwright é proibido (Princ. IV). Coberto por: VM puro `tests/modules/auth/login.view-model.test.ts` + `tests/modules/shell/root.view-model.test.ts` + **smoke SSR** no build (render real do card e do shell). Ver ADR-0011.

### Implementation for User Story 1

- [X] T026 [P] [US1] OIDC helper (PKCE S256 via Web Crypto, code exchange, `jwtVerify` jose/JWKS do Authentik) em `src/server/oidc.ts` (research D3)
- [X] T027 [US1] Ciclo de sessão (create/get; cookie opaco `__Host-session`) em `src/server/session.ts` (depende T012, T026)
- [X] T028 [P] [US1] Rota `login` (302 + cookie `pkce`) em `src/server/routes/login.service.fn.ts`
- [X] T029 [US1] Rota `callback` (exchange + verify + cria sessão + redirect) em `src/server/routes/callback.service.fn.ts` (depende T026, T027)
- [X] T030 [P] [US1] Rota `GET /me` (200/401, envelope `{data,meta}`) em `src/server/routes/me.query.fn.ts`
- [X] T031 [US1] Registrar grupo de rotas de auth no `src/server/app.ts` (depende T028, T029, T030)
- [X] T032 [P] [US1] Client data: `current-user.repository.ts` (porta → Eden) + `current-user.model.ts` (tipo do Eden) em `src/modules/auth/client/data/`
- [X] T033 [P] [US1] ViewModel puro `login.view-model.ts` + binding Solid `login.binding.ts` (`action`/`useSubmission` → Command) em `src/modules/auth/client/login/`
- [X] T034 [US1] Tela `login.page.tsx` (view burra) + rota `src/routes/login.tsx` (depende T033)
- [X] T035 [US1] Tela `root` do shell (placeholder): `root.view-model.ts` + `root.binding.ts` + `root.page.tsx` em `src/modules/shell/client/root/` + `src/modules/shell/public-api/index.ts` (ADR-0012)
- [X] T036 [US1] Área protegida: rota `src/routes/(app)/` montando `RootPage` + `<Outlet/>`; redirect inicial em `src/routes/index.tsx` (depende T035)
- [X] T037 [US1] `auth/public-api/index.ts` exportando `current-user` + guard placeholder em `src/modules/auth/public-api/index.ts`

**Checkpoint**: MVP — usuário entra via Authentik e chega ao shell; `/me` funciona; testes US1 verdes.

---

## Phase 4: User Story 2 - Áreas protegidas exigem autenticação (Priority: P2)

**Goal**: sem sessão → redirect ao login preservando destino (saneado anti open-redirect).
**Independent Test**: abrir área protegida sem sessão → redirect → após login, cair no destino pedido; destino externo é descartado.

### Tests for User Story 2 (PRIMEIRO — devem FALHAR)

- [X] T038 [P] [US2] Test puro `safe-redirect` (mesma origem, começa com `/`, não `//`) em `tests/modules/auth/safe-redirect.test.ts`
- [X] T039 [P] [US2] Integração: não-autenticado → redirect a login com `redirectTo` preservado em `tests/modules/auth/guard.test.ts`

### Implementation for User Story 2

- [X] T040 [US2] Helper `sanitizeRedirectPath` (sanea `?redirect=`, bloqueia `//`, abs e CRLF) em `src/shared/http/safe-redirect.ts` (compartilhado server+client; usado pelo `login.view-model.ts`). Testes em `tests/modules/auth/safe-redirect.test.ts`.
- [X] T041 [US2] Guard de sessão (401/redirect) em `src/modules/auth/server/guard.ts` + aplicar no `load` da área protegida `src/routes/(app)/`
- [X] T042 [US2] Propagar `redirectTo` saneado por todo o fluxo `login → pkce cookie → callback` (depende T028, T029, T040)

**Checkpoint**: US1 + US2 funcionam independentemente; deep-link protegido respeitado.

---

## Phase 5: User Story 3 - Sair com segurança (Priority: P2)

**Goal**: logout revoga a sessão (Bun.redis) e exige CSRF; sessão antiga deixa de valer.
**Independent Test**: autenticar → logout → reuso da sessão antiga → 401.

### Tests for User Story 3 (PRIMEIRO — devem FALHAR)

- [X] T043 [P] [US3] Contract test `logout` (sem `X-Requested-With` → 403; com → 200; sessão revogada) em `tests/modules/auth/logout.contract.test.ts`

### Implementation for User Story 3

- [X] T044 [US3] Checagem CSRF (`X-Requested-With`) no `onRequest` do `src/server/app.ts` (ADR-0005 §7)
- [X] T045 [US3] Rota `logout` (revoga sessão no Bun.redis + limpa `__Host-session` + opcional `end_session` IdP) em `src/server/routes/logout.service.fn.ts` (depende T012, T044)
- [X] T046 [US3] Ação de logout no shell (top-bar) via binding Solid em `src/modules/shell/client/root/components/top-bar/`

**Checkpoint**: ciclo de sessão completo (entrar/sair) seguro.

---

## Phase 6: User Story 4 - Permanecer logado sem relogin constante (Priority: P3)

**Goal**: renovação invisível single-flight; expiração/inatividade → reautenticar.
**Independent Test**: manter sessão além do TTL do access → segue usando; exceder expiração absoluta/inatividade → pede re-login.

### Tests for User Story 4 (PRIMEIRO — devem FALHAR)

- [X] T047 [P] [US4] Test single-flight (N requests concorrentes → 1 refresh; reuse → signOut; expirada → re-login) em `tests/modules/auth/refresh.test.ts`

### Implementation for User Story 4

- [X] T048 [US4] Refresh transparente **single-flight** (promise compartilhada) no `src/server/session.ts` + guard (depende T027, T041)
- [X] T049 [US4] Expiração/inatividade (`absoluteExpiresAt`, `lastSeenAt`) em `src/server/session.ts` (data-model state machine)

**Checkpoint**: sessão robusta; todas as 4 user stories independentes e verdes.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T050 [P] Ligar o **nonce CSP** ao `<script>` de hidratação do Solid (entry-server + middleware) em `src/entry-server.tsx`/`src/middleware.ts` (ADR-0006)
- [X] T051 [P] Self-host de webfonts: `scripts/fetch-fonts.ts` (via `bun run`) → `public/fonts/*.woff2` + `@font-face` em `src/shared/ui/tokens/fonts.css.ts` (ADR-0008) — Atkinson Hyperlegible Next/Mono variable (bate com `theme.css.ts`; ADR-0008 cita famílias antigas — emendar); provenance origem+SHA-256; `bun run fonts:fetch` verde
- [X] T052 [P] Tokens base do design system (mínimo p/ o shell) em `src/shared/ui/tokens/` (vanilla-extract, ADR-0007)
- [X] T053 [P] Documentar segredos `_FILE` + montagem `/run/secrets` no `README` da feature — `specs/001-foundation/README.md` (contrato `readSecret`, dev vs prod, exemplo Compose `secrets:`)
- [X] T054 Rodar validação do [quickstart.md](./quickstart.md) (smoke US1–US4 + SC-004 "nada vaza" + **SC-006 "nenhuma PII de paciente no fluxo/logs/estado"** — asserção de que `cpf`/dados clínicos não aparecem no fluxo de auth) e gates: `bunx tsc --noEmit`, `bun test`, `bun audit --audit-level=high` — gates verdes (tsc OK · 89/89 · audit limpo · build OK); SC-004 `.output/public` sem segredo/backend; SC-006 fluxo auth sem `patient`/`cpf` e `cpf`=0 no bundle. Pendência conhecida do quickstart: callback completo code→token exige IdP real
- [X] T055 [P] `Dockerfile` multi-stage (`oven/bun` build → runtime só com `.output/`, **sem node_modules**) (ADR-0003 item 7) — `oven/bun:1.3.14` (build) → `:1.3.14-slim` (runtime), `--frozen-lockfile`, HEALTHCHECK `/api/health`, `USER bun`; `oven/bun:1.3.14`→`-slim`, `--frozen-lockfile`, HEALTHCHECK `/api/health`, `USER bun`. **Imagem validada end-to-end em VM Incus espelho da VPS (Ubuntu 24.04 · Docker Compose v5.2.0):** `docker build` OK → container sobe `(healthy)` → `/api/health` responde `{data:{ok:true}}`. (O build SSR falhava no Linux por `@rolldown/binding` 1.0.3 desatualizado no lock — corrigido atualizando `bun.lock` p/ 1.1.3; 100% Bun, sem Node.)

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (P1)**: sem dependências.
- **Foundational (P2)**: depende do Setup — **BLOQUEIA todas as US**.
- **User Stories (P3–P6)**: dependem da Foundational. US1 (MVP) primeiro; US2/US3/US4 podem seguir em paralelo após a fundação, mas há acoplamentos abaixo.
- **Polish (P7)**: depois das US desejadas.

### User Story Dependencies
- **US1 (P1)**: só depende da Foundational. Entrega o MVP.
- **US2 (P2)**: usa o guard (T041) e o fluxo de login da US1 (reaproveita `pkce`/`redirectTo`). Testável isolada.
- **US3 (P2)**: usa a sessão da US1 (T027) + CSRF. Testável isolada.
- **US4 (P3)**: estende a sessão/guard da US1+US2 (refresh). Testável isolada.

### Within Each User Story
- Testes (governance/contract/puro/DOM) **escritos e FALHANDO** antes da implementação.
- server (oidc/session/rotas) antes do client (data/VM/binding/page).
- registrar rota no app Elysia antes da tela consumir via Eden.

### Parallel Opportunities
- Setup: T002, T003, T004, T006, T007 em paralelo.
- Foundational: T009, T010, T011, T013, T015 + os testes T017–T020 em paralelo.
- US1: testes T021–T025 em paralelo; impl T026/T028/T030/T032/T033 em paralelo (arquivos distintos).

---

## Parallel Example: User Story 1

```bash
# Testes da US1 juntos (devem falhar primeiro):
bun test tests/modules/auth/login.contract.test.ts \
         tests/modules/auth/callback.contract.test.ts \
         tests/modules/auth/me.contract.test.ts \
         tests/modules/auth/oidc.test.ts \
         tests/modules/auth/login.page.test.ts
```

---

## Implementation Strategy

### MVP First (só US1)
1. Phase 1 (Setup) → 2. Phase 2 (Foundational, CRÍTICA) → 3. Phase 3 (US1) → 4. **PARAR e VALIDAR**: login→shell + `/me` (quickstart) → 5. demo.

### Incremental Delivery
Setup+Foundational → US1 (MVP) → US2 (rotas protegidas) → US3 (logout) → US4 (refresh) → Polish. Cada US agrega valor sem quebrar as anteriores.

---

## Notes
- `[P]` = arquivos diferentes, sem dependência pendente. `[US#]` = rastreabilidade.
- **TDD**: confirme o teste **vermelho** antes de implementar (Quality Gates da constituição).
- **Gate sempre verde antes de fechar**: `bunx tsc --noEmit` + `bun test` (incl. governance) — Princ. IV/V.
- Commit após cada task ou grupo lógico (Conventional Commits).
- Próximo: **`/speckit-implement`** (executa estas tasks) — opcional antes: `/speckit-analyze` (consistência) e `/speckit-checklist`.

**Total**: 57 tasks · Setup 7 · Foundational 15 (5 testes) · US1 17 (5 testes) · US2 5 (2) · US3 4 (1) · US4 3 (1) · Polish 6.
*(Remediação do `/speckit-analyze`: +T010b i18n/mensagens genéricas [G1/FR-009/SC-007], +T020b bundle-leak test [G2/SC-004], T054 reforçado com PII [G3/SC-006].)*
