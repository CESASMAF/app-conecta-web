# Implementation Plan: Consumo e estabilização do contrato people-context (core-api)

**Branch**: `002-people-context-web` | **Date**: 2026-06-12 | **Spec**: [spec.fe.md](./spec.fe.md)

**Input**: Feature specification em `web_02/handbook/doc/people-context/spec.fe.md`

## Summary

A feature `002-people-context-web` consome a API HTTP do serviço `people-context` (Bun 1.3 · Elysia · PostgreSQL · NATS · TS funcional no-class), o registro de identidade de pessoas do ecossistema ACDG: cadastro com deduplicação por CPF, vínculos `system:role` (SystemRole), provisão de login no Authentik (IdP-first), password reset via evento NATS e erasure LGPD (Art. 18 V). Este plano cobre o lado **core-api** do contrato: as 17 rotas de `/api/v1` que o BFF Elysia consome, o envelope de sucesso `{ data, meta: { timestamp } }`, o envelope de erro `{ success: false, error: { code, message } }`, a paginação cursor-based de `GET /people`, o RBAC via claim `groups` e o header `X-Actor-Id` obrigatório em mutações. O plano frontend correspondente está em [plan.fe.md](./plan.fe.md); a prontidão endpoint a endpoint está em [api-readiness.fe.md](./api-readiness.fe.md).

## Technical Context

**Language/Version**: TypeScript estrito funcional (no-class, no-throw em domain/application) sobre Bun 1.3 — serviço `people-context` (repo `svc-people-context`)

**Primary Dependencies**: Elysia 1.4 (HTTP + validação TypeBox) · `jose` (JWT RS256 via JWKS do Authentik, fallback introspection RFC 7662) · `nats.js` (relay do Outbox) · Authentik Management API (client Result-based em `src/idp/`)

**Storage**: PostgreSQL (database `people`), pool nativo `Bun.sql` (max 10 conexões), migrations versionadas em `people-context/src/repository/migrations.ts` (tabela `schema_migrations`; tabelas `people`, `system_roles`, `outbox_events`)

**Testing**: `bun test` (Jest-compatible), cobertura ≥ 95% no CI (`bun run verify` = typecheck + format + lint + test + coverage)

**Target Platform**: container Docker na VPS ACDG-BV, atrás de Caddy; nunca exposto publicamente — só o BFF `web_02` o acessa pela rede interna

**Project Type**: web-service (API REST funcional: routes Elysia magras → repository `Bun.sql` parametrizado → Transactional Outbox → NATS)

**Performance Goals**: `GET /api/v1/people` paginado (cursor por `id`, limit 1–100, default 20, `totalCount`/`hasMore`/`nextCursor`) com p95 < 300 ms; mutações com IdP-first (`deactivate`/`reactivate`/`login`/`delete`) com p95 < 1,5 s (round-trip ao Authentik incluso)

**Constraints**: envelope `{ data, meta: { timestamp } }` em todo sucesso; erros estruturados `PEO-001..010` / `ROL-001..009` / `IDP-001..005` / `AUTH-001..003` / `ADM-001`; `actorId` = `JWT.sub` validado + header `X-Actor-Id` obrigatório em POST/PUT/DELETE (AUTH-003); IdP PRIMEIRO em mutações de acesso (AppSec HIGH-5, sem rollback compensatório); LGPD — CPF nunca em payload de evento NATS (HIGH-8) e link de password reset viaja só no evento `people.user.password_reset_requested` (ADR-030, AppSec CRITICAL-2)

**Scale/Scope**: 2 agregados (Person, SystemRole) · 17 rotas HTTP (2 health + 10 person + 5 role) · 10 tipos de evento NATS via Outbox (`people.person.*`, `people.role.*`, `people.user.*`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Gates derivados de [../../../.specify/memory/constitution.md](../../../.specify/memory/constitution.md) e das convenções cross-service do root (CLAUDE.md):

| Gate | Status | Evidência |
|---|---|---|
| Envelope padronizado `{ data, meta: { timestamp } }` em todo sucesso | ✅ | todos os handlers em `people-context/src/routes/people.ts` e `roles.ts`; list endpoints adicionam `pageSize`/`totalCount`/`hasMore`/`nextCursor` no `meta` |
| Envelope de erro `{ success: false, error: { code, message } }` com códigos estruturados | ✅ | `PEO-001..010`, `ROL-001..009`, `IDP-001..005`, `AUTH-001..003`, `ADM-001` |
| `actorId` derivado de `JWT.sub` validado + `X-Actor-Id` obrigatório em mutações | ✅ | `src/middleware/auth.ts` (AuthGuard com resultado discriminado; `missing-actor` → 400 AUTH-003) |
| RBAC via claim `groups` do Authentik (nomes homônimos a `system:role` + `superadmin`) | ✅ | `src/middleware/jwt.ts` + matching `r === required \|\| r.endsWith(":" + required)`; `admin` escopado via `adminSystems()`; `superadmin` bypassa |
| IdP-first em mutações de acesso (AppSec HIGH-5) | ✅ | `deactivate`/`reactivate`/`login`/`DELETE` chamam Authentik ANTES do DB; falha aborta com `IDP-00x` 502 sem tocar o banco |
| LGPD — CPF fora de eventos NATS (HIGH-8); reset link só no evento (CRITICAL-2/ADR-030) | ✅ | `events.personRegistered/personUpdated` sem CPF; `POST …/request-password-reset` → 202 sem link no body |
| Eventos via Transactional Outbox, at-least-once | ✅ | `src/events/publisher.ts` (INSERT em `outbox_events` na transação) + `outbox-relay.ts` (poll 1 s, batch 50 → NATS) |
| Paginação cursor-based em listas | ✅ | `PersonRepository.list` — cursor `id > cursor ORDER BY id`, fetch limit+1; **exceção:** `GET /roles` retorna tudo sem paginação (🟡 — ver [api-readiness.fe.md](./api-readiness.fe.md)) |
| Optimistic locking / controle de concorrência exposto ao cliente | 🔴 | sem `version`/`ETag`/`If-Match` em `people` (mapa do serviço §8: "sem optimistic locking"); só races internos viram 409 (`PEO-005/006`, `ROL-009`) — pedido P2 |
| Contrato publicado (OpenAPI 3.1 em `contracts/services/people/`) | 🟡 | existe, mas documenta **12 endpoints** vs **17 rotas reais** (faltam `login`, `request-password-reset`, `deactivate`/`reactivate` de role, `DELETE /people/:id`) — drift; fonte de verdade hoje é `src/routes/` |

## Project Structure

### Documentation (this feature)

```text
web_02/handbook/doc/people-context/
├── plan.md                 # este arquivo — visão core-api do contrato
├── plan.fe.md              # plano frontend (módulo vertical web_02)
├── tasks.md                # tasks por user story (US1 Pessoa · US2 Vínculos · US3 Acesso/IdP)
├── api-readiness.fe.md     # prontidão endpoint a endpoint (17 rotas)
├── spec.fe.md              # o quê (user stories, critérios)
├── domain.fe.md            # agregados Person/SystemRole vistos pelo front
├── design-tokens.fe.md     # tokens do design system (vanilla-extract)
└── constitution.md         # princípios do módulo
```

### Source Code (repository root)

```text
# Backend consumido (read-only para esta feature — nenhuma mudança de schema)
people-context/src/
├── domain/                          # person.ts, system-role.ts — branded types + validação pura
├── repository/                      # person-repository.ts, role-repository.ts, migrations.ts (Bun.sql)
├── middleware/                      # jwt.ts (JWKS Authentik + introspection), auth.ts (AuthGuard, RBAC, X-Actor-Id)
├── routes/                          # people.ts (10 rotas), roles.ts (5 rotas), health.ts (2 rotas) — contrato real
├── idp/                             # client.ts, types.ts — Authentik Management API (Result, no-throw)
├── application/                     # idp-sync.ts — provisionUserInIdp, syncRoleAssignment, syncPersonProfileToIdp
└── events/                          # publisher.ts (Outbox) + outbox-relay.ts (NATS)

# Consumidor (implementado por plan.fe.md / tasks.md)
web_02/src/modules/people-context/
├── server/                          # BFF Elysia — client HTTP do people-context + handlers (*.query.fn.ts / *.service.fn.ts) + TypeBox
├── client/                          # MVVM — data, view-models (*.view-model.ts), bindings Solid (*.binding.ts), pages
└── public-api/index.ts
```

**Structure Decision**: a feature **não altera** o serviço `people-context` — ela consome o contrato existente de `/api/v1` documentado em `src/routes/people.ts` e `src/routes/roles.ts`. Todo código novo vive no módulo vertical `web_02/src/modules/people-context/` (detalhado em [plan.fe.md](./plan.fe.md)). Mudanças no serviço entram como pedidos priorizados na seção 5 de [api-readiness.fe.md](./api-readiness.fe.md).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Sem optimistic locking/`ETag` (gate 🔴) | A tabela `people` não tem coluna `version`; edições concorrentes em `PUT /people/:personId` aplicam last-write-wins | Implementar lock pessimista ou versionamento no front foi rejeitado; o front mitiga com re-fetch pós-mutação e confirmação explícita em ações de acesso (que já retornam 409 `PEO-005/006`/`ROL-009` nos races detectáveis) |
| OpenAPI desatualizado — 12 vs 17 endpoints (gate 🟡) | O contrato dos 5 endpoints ausentes (login retroativo, password reset, deactivate/reactivate de role, erasure) só existe no código TS das rotas | Gerar OpenAPI manualmente no front duplicaria a fonte de verdade; mitigado com schemas TypeBox versionados no BFF que validam o response em runtime (Princípio V) e pedido P2 ao time do serviço |

## Migrations (core-api)

- **Mudanças de schema**: [ ] tabelas novas · [ ] colunas · [ ] índices · [ ] FKs · [x] nenhuma
- **Prefixo de isolamento correto?** — N/A — o serviço consumido é o `people-context` (Bun.sql, não Drizzle); suas migrations são versionadas em `src/repository/migrations.ts` (6 migrations, incluindo `rename_zitadel_to_idp_user_columns`) e esta feature não as altera.
- **Outbox**: novo evento exige `INSERT` em `outbox_events`? Não — nenhum evento novo; o BFF `web_02` é consumidor HTTP e não publica no Outbox do `people-context` (tabela `outbox_events`, alimentada só pelas rotas do serviço).
- **Comando**: N/A — não há `schema.ts` nesta feature; nenhuma migration a gerar.
- **Restrições**: N/A — o `people-context` usa PostgreSQL (payload JSONB em `outbox_events`).

## Contrato HTTP (Fase 2+ — pular se CLI-only)

- **Endpoints novos/alterados**: nenhum endpoint novo no `people-context`. O BFF `web_02` consome o contrato existente em `/api/v1` (17 rotas):
  - **Person — leitura** (roles `worker`, `owner`, `admin`): `GET /people` (query `search` — ILIKE fullName | prefixo de CPF, `cursor`, `limit` 1–100 default 20), `GET /people/:personId` (400 `PEO-003` UUID inválido · 404 `PEO-002`), `GET /people/by-cpf/:cpf` (400 `PEO-004` ≠ 11 dígitos · 404 `PEO-002`).
  - **Person — mutação** (roles `worker`/`admin`; `X-Actor-Id` obrigatório): `POST /people` (`fullName` 1–200, `cpf?` `^\d{11}$`, `birthDate` date, `email?`, `createLogin?`, `initialPassword?` min 8 → 201 `{ data: { id } }`, dedup por CPF retorna id existente; **207 Multi-Status** com `warnings: [{ code: "IDP-001" }]` se a pessoa foi criada mas a provisão IdP falhou; 400 `PEO-001`), `PUT /people/:personId` (204; `email` omitido preserva o atual via COALESCE; sync best-effort de name/email com Authentik se `idpUserPk` presente).
  - **Person — acesso/IdP**: `PUT /people/:personId/deactivate` e `…/reactivate` (role `admin`; 204 · 409 `PEO-005`/`PEO-006` · 502 `IDP-002`/`IDP-003` — IdP first), `POST /people/:personId/login` (roles `worker`/`admin`; provisão retroativa — 201 `{ data: { id, idpUserId } }` · 409 `PEO-008` · 422 `PEO-009` · 502 `IDP-001`), `POST /people/:personId/request-password-reset` (role `admin`; **202 Accepted sem link no body** · 422 `PEO-007` · 502 `IDP-004`), `DELETE /people/:personId` (APENAS `superadmin`; erasure LGPD — 204 · 403 `PEO-010` · 502 `IDP-005`).
  - **Roles**: `POST /people/:personId/roles` (role `admin` escopado; `{ system, role }` → 201 `{ data: { id } }` nova/reativada · **204 noop se já ativa** · 403 `ROL-006` superadmin-only / `ROL-007` cross-system / `ROL-008` auto-assign · 400 `ROL-001`), `GET /people/:personId/roles?active=` (roles `worker`/`owner`/`admin` → `SystemRole[]`), `PUT /people/:personId/roles/:roleId/deactivate` e `…/reactivate` (role `admin` escopado; 204 · 404 `ROL-002`/`ROL-003` · 400 `ROL-005` · 409 `ROL-009` race), `GET /roles?system=&role=&active=` (`system` obrigatório senão 400 `ROL-004` → `[{ person: PersonSummary, role: SystemRole }]` — ⚠️ `PersonSummary` expõe `cpf`).
  - **Health**: `GET /health` (liveness), `GET /ready` (readiness, 503 se DB fora) — usados pelo healthcheck do Compose, não pelo BFF.
  - Schemas TypeBox (`Elysia.t`) request/response espelhando os TypeBox das rotas vivem no BFF (`web_02/src/modules/people-context/server/adapters/*.schema.ts`) e validam na borda (Princípio V). Status codes: 200/201/202/204/207 sucesso; 400 validação; 401/403 auth; 404 not found; 409 conflito; 422 pré-condição; 502 falha no IdP.
- **Backward-compat / versionamento**: prefixo `/api/v1` estável; SemVer no serviço (`feat:` → minor). Evolução **apenas aditiva** (ex.: campos novos em `Person`); os schemas TypeBox do BFF usam parsing tolerante a campos extras; breaking change exige `/api/v2` + ADR. O drift do OpenAPI 3.1 em `contracts/services/people/` (12 vs 17 endpoints) é tratado como pedido P2 em [api-readiness.fe.md](./api-readiness.fe.md).

## Estimativa de Pipeline (W0 size)

- **Tamanho**: [ ] **S** (trivial, 1-3 linhas/config) · [ ] **M** (VO/use case/refactor localizado) · [x] **L** (BC novo, múltiplos agregados, outbox, API)
- **Justificativa**: a feature introduz um módulo vertical inteiro no `web_02` (15 handlers Elysia cobrindo as 15 rotas autenticadas, repositórios, view-models, ~5 fluxos de tela) e estabelece a cadeia de erro completa (`PEO/ROL/IDP/AUTH` → `AppError.kind` → i18n), incluindo a semântica de `207 Multi-Status` e o RBAC escopado (`admin` por sistema vs `superadmin`).
- **Plano de testes W0 (RED)**: as primeiras suites a falhar, descrevendo a API esperada:
  1. `server/adapters/envelope.schema.test.ts` — TypeBox aceita `{ data, meta }` (com meta paginada de `GET /people`), o envelope de erro `{ success: false, error: { code, message } }` e o envelope 207 com `warnings`;
  2. `server/adapters/people-context.client.test.ts` — client injeta `Authorization: Bearer <jwt>` e `X-Actor-Id` (= `JWT.sub` da sessão) em mutações, desembrulha `{ data, meta }` e mapeia `{ error: { code } }` → `AppError`;
  3. `client/data/person.repository.test.ts` — repositório expõe `Result<T, E>` (nunca `throw`) para list/get/create, incluindo o resultado discriminado `created | created-idp-pending` (207);
  4. `client/person-list/person-list.view-model.test.ts` — derivações de busca (nome/CPF), limit 1–100 e avanço por `nextCursor`.

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — lei máxima do projeto
- [ADR-0002 — Errors as Values](../../adr/0002-errors-as-values.md)
- [ADR-0004 — Client × Server Split (MVVM × DDD)](../../adr/0004-client-server-split-mvvm-ddd.md)
- [ADR-0010 — BFF Elysia Orquestrador / fn naming](../../adr/0010-bff-orchestration-fn-naming.md)
- [ADR-0011 — No Mocks in Production](../../adr/0011-no-mocks-in-production.md)
- [Índice de ADRs](../../adr/README.md)
- [plan.fe.md — plano frontend](./plan.fe.md)
- [spec.fe.md — especificação frontend](./spec.fe.md)
- [spec.md — especificação core-api](./spec.md)
- [api-readiness.fe.md — prontidão endpoint a endpoint](./api-readiness.fe.md)
- [Docs offline: runtime/bun](../../reference/runtime/bun/)
- [Docs offline: framework/elysia](../../reference/framework/elysia/)
