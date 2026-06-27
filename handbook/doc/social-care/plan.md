# Implementation Plan: Consumo e estabilização do contrato social-care (core-api)

**Branch**: `001-social-care-web` | **Date**: 2026-06-12 | **Spec**: [spec.fe.md](./spec.fe.md)

**Input**: Feature specification em `web_02/handbook/doc/social-care/spec.fe.md`

## Summary

A feature `001-social-care-web` consome a API HTTP do serviço `social-care` (Swift 6.3 · Vapor 4 · CQRS + Event Sourcing + Transactional Outbox), fonte de verdade do atendimento socioassistencial a pacientes de doenças raras. Este plano cobre o lado **core-api** do contrato: quais rotas de `/api/v1` a web consome, como o contrato é estabilizado (envelope `StandardResponse`, códigos de erro `{BC}-{SEQ}`, optimistic locking via `Patient.version`, RBAC por rota) e quais evoluções o serviço precisa entregar (ETag/If-Match, OpenAPI publicado, idempotência). O plano frontend correspondente está em [plan.fe.md](./plan.fe.md); a prontidão endpoint a endpoint está em [api-readiness.fe.md](./api-readiness.fe.md).

## Technical Context

**Language/Version**: Swift 6.3 (strict concurrency) — serviço `social-care` (repo `svc-social-care`)

**Primary Dependencies**: Vapor 4 · SQLKit · JWTKit (OIDC multi-issuer Authentik/Zitadel — ADR-027/ADR-031) · NATS JetStream (Outbox relay)

**Storage**: PostgreSQL (database `social_care`), migrations versionadas em `social-care/Sources/social-care-s/IO/Persistence/SQLKit/Migrations/` (Migration001…007, incluindo `audit_trail`)

**Testing**: `swift-testing` (`@Test`/`#expect`), fakes `InMemory*` em `Tests/social-care-sTests/TestDoubles/`, cobertura 30% local / 95% CI

**Target Platform**: Linux server (container Docker na VPS ACDG-BV, atrás de Caddy; nunca exposto publicamente — só o BFF Elysia do `web_02` o acessa pela rede interna)

**Project Type**: web-service (API REST CQRS, write-side por commands em `actor` handlers, read-side por queries em `struct` handlers)

**Performance Goals**: `GET /api/v1/patients` paginado (cursor base64, limit 1–100, default 20) com p95 < 500 ms; `GET /api/v1/patients/:patientId` (agregado completo + `computedAnalytics`) com p95 < 800 ms

**Constraints**: envelope `{ data, meta: { timestamp } }` em toda resposta; erros estruturados (`PAT-001`, `HOUSING-001`, …); `actorId` derivado exclusivamente de `JWT.sub` validado (ADR-023 — nunca header customizado); audit trail centralizado com before/after (ADR-008); LGPD — anonimização de PII preserva histórico clínico (ADR-039)

**Scale/Scope**: 6 bounded contexts (Kernel, Registry, Assessment, Protection, Care, Configuration) · ~30 rotas HTTP · 27 commands · 4 queries · ~26 tipos de evento de domínio via Outbox → NATS

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Gates derivados da [constituição web_02](../../../.specify/memory/constitution.md) e das convenções cross-service do root (CLAUDE.md):

| Gate | Status | Evidência |
|---|---|---|
| Envelope padronizado `{ data, meta: { timestamp } }` em todos os endpoints | ✅ | `StandardResponse` em todos os controllers (`IO/HTTP/Controllers/`) |
| Códigos de erro estruturados `{BC}-{SEQ}` com envelope `{ error: { code, message, details } }` | ✅ | `AppError` + `AppErrorMiddleware` (PAT, FAM, ADM, DISC, WDR, READM, HOUSING, SOCIO, WORK, EDU, HEALTH, REF, VIO, PLACE, LOOKUP, LREQ) |
| `actorId` somente via `JWT.sub` validado (ADR-023) | ✅ | `Request+ActorId.swift` + `JWTAuthMiddleware` |
| OIDC multi-issuer Authentik + Zitadel durante a migração (ADR-027/ADR-031) | ✅ | `OIDCJWTPayload` com `OIDC_JWKS_URLS`/`OIDC_ISSUERS`/`OIDC_AUDIENCES` em CSV |
| RBAC por rota (`worker`, `owner`, `admin`) | ✅ | `RoleGuardMiddleware` — precedência de claims `roles` → `groups` → Zitadel `projectRoles` → deny |
| Audit trail com before/after para toda mutação (ADR-008) | ✅ | tabela `audit_trail` + `GET /patients/:patientId/audit-trail?eventType=…` |
| Eventos via Transactional Outbox, at-least-once (ADR-013/ADR-014) | ✅ | `OutboxEventBus` + `SQLKitOutboxRelay` → NATS subjects `patients.*`, `assessment.*`, `protection.*`, `care.*`, `configuration.*` |
| Optimistic locking exposto ao cliente | 🟡 | `Patient.version` existe (ADR-005) e conflito vira 409; faltam headers `ETag`/`If-Match` — ver [api-readiness.fe.md](./api-readiness.fe.md) |
| Contrato publicado (OpenAPI) | 🔴 | não há `GET /docs/json`; fonte de verdade hoje é o código (`IO/HTTP/DTOs/`) — pedido P1 ao time core-api |

## Project Structure

### Documentation (this feature)

```text
web_02/handbook/doc/social-care/
├── plan.md                 # este arquivo — visão core-api do contrato
├── plan.fe.md              # plano frontend (módulo vertical SolidStart + BFF Elysia)
├── tasks.md                # tasks por user story (US1 Registry · US2 Assessment · US3 Care+Protection)
├── api-readiness.fe.md     # prontidão endpoint a endpoint
├── spec.fe.md              # o quê (user stories, critérios)
├── domain.fe.md            # bounded contexts + agregados vistos pelo front
├── design-tokens.fe.md     # tokens do design system (vanilla-extract)
└── constitution.md         # ver constituição em ../../../.specify/memory/constitution.md
```

### Source Code (repository root)

```text
# Backend consumido (read-only para esta feature — nenhuma mudança de schema)
social-care/Sources/social-care-s/
├── Domain/                          # Kernel, Registry, Assessment, Protection, Care, Configuration
├── Application/                     # 27 commands (actor handlers) + Query/ (4 query handlers)
└── IO/
    ├── HTTP/
    │   ├── Controllers/             # PatientController, AssessmentController, ProtectionController,
    │   │                            # CareController, LookupController, HealthController
    │   ├── DTOs/                    # RequestDTOs.swift / ResponseDTOs.swift — contrato real
    │   ├── Middleware/              # JWTAuthMiddleware, RoleGuardMiddleware, AppErrorMiddleware
    │   └── Auth/                    # OIDCJWTPayload (multi-issuer)
    ├── Persistence/SQLKit/          # repositórios + Migrations/ + SQLKitAuditTrailRepository
    └── EventBus/                    # OutboxEventBus, SQLKitOutboxRelay, NATSEventPublisher

# Consumidor (implementado por plan.fe.md / tasks.md)
web_02/src/modules/social-care/
├── server/                          # BFF Elysia — client HTTP do social-care + handlers (*.query.fn / *.service.fn) + TypeBox
├── client/                          # MVVM Solid — data (Eden types), view-models puros, pages (Solid JSX)
└── public-api/index.ts
```

**Structure Decision**: a feature **não altera** o serviço `social-care` — ela consome o contrato existente de `/api/v1` documentado em `IO/HTTP/DTOs/` e nos controllers. Todo código novo vive no módulo vertical `web_02/src/modules/social-care/` (detalhado em [plan.fe.md](./plan.fe.md)). Mudanças no serviço entram como pedidos priorizados na seção 5 de [api-readiness.fe.md](./api-readiness.fe.md).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Ausência de OpenAPI publicado (gate 🔴) | Contrato consumido direto do código Swift (`DTOs/`) até o time core-api publicar spec | Gerar OpenAPI manualmente no front duplicaria a fonte de verdade e divergiria; mitigado com schemas TypeBox (`Elysia.t`) versionados no BFF que validam o response em runtime (Princ. V) |
| `ETag`/`If-Match` ausentes (gate 🟡) | Conflito de edição concorrente já retorna 409 via `Patient.version` | Implementar lock pessimista no front foi rejeitado; o front trata 409 com recarga + reconciliação (fluxo previsto na seção 10.5 do mapa do serviço) |

## Migrations Drizzle (core-api)

- **Mudanças de schema**: [ ] tabelas novas · [ ] colunas · [ ] índices · [ ] FKs · [x] nenhuma
- **Prefixo de isolamento correto?** (`ctr_*` / `fin_*` / …) — ADR-0014: N/A — o serviço consumido é o `social-care` (Swift/SQLKit, não Drizzle); suas migrations são versionadas em `IO/Persistence/SQLKit/Migrations/` (Migration001…007) e esta feature não as altera.
- **Outbox**: novo evento exige `INSERT` em `core.outbox`? Não — nenhum evento novo; a web é consumidora HTTP e não publica no Outbox do `social-care`.
- **Comando**: N/A — não há `schema.ts` nesta feature; nenhuma migration a gerar.
- **Restrições MySQL 8** (ADR-0020): N/A — o `social-care` usa PostgreSQL (JSONB em `audit_trail.before_state/after_state`).

## Contrato HTTP (Fase 2+ — pular se CLI-only)

- **Endpoints novos/alterados**: nenhum endpoint novo no `social-care`. A web consome o contrato existente em `/api/v1`:
  - **Registry** — `GET /patients` (query params `search`, `status`, `cursor`, `limit`), `GET /patients/:patientId`, `GET /patients/by-person/:personId`, `GET /patients/:patientId/audit-trail?eventType=…`, `POST /patients` (`RegisterPatientRequest`), `POST /patients/:patientId/family-members` (`AddFamilyMemberRequest`), `DELETE /patients/:patientId/family-members/:memberId`, `PUT /patients/:patientId/primary-caregiver`, `PUT /patients/:patientId/social-identity`, `POST /patients/:patientId/{admit|discharge|readmit|withdraw}` (`DischargePatientRequest` / `WithdrawPatientRequest`).
  - **Assessment** — `PUT /patients/:patientId/{housing-condition|socioeconomic-situation|work-and-income|educational-status|health-status|community-support-network|social-health-summary}` (DTOs `Update*Request`, resposta `204 No Content`).
  - **Protection** — `PUT /patients/:patientId/placement-history`, `POST /patients/:patientId/violation-reports` (`ReportRightsViolationRequest`), `POST /patients/:patientId/referrals` (`CreateReferralRequest`).
  - **Care** — `POST /patients/:patientId/appointments` (`RegisterAppointmentRequest`), `PUT /patients/:patientId/intake-info` (`RegisterIntakeInfoRequest`).
  - **Configuration** — `GET|POST /dominios/:tableName`, `PUT /dominios/:tableName/:itemId`, `PATCH /dominios/:tableName/:itemId/toggle`, `GET|POST /dominios/requests`, `PUT /dominios/requests/:requestId/{approve|reject}`.
  - **Health** — `GET /health`, `GET /ready` (usados pelo healthcheck do Compose, não pelo BFF).
  - Schemas TypeBox (`Elysia.t`) request/response espelhando esses DTOs vivem no BFF Elysia (`web_02/src/modules/social-care/server/adapters/*.schema.ts`) e validam na borda (Princ. V). Status codes: 200/201/204 sucesso; 400 validação; 401/403 auth; 404 not found; 409 conflito (lifecycle/version).
- **Backward-compat / versionamento**: prefixo `/api/v1` estável; evolução **apenas aditiva** (campos opcionais novos em `PatientResponse`, como os blocos v2.0 `workAndIncome`/`educationalStatus`/`healthStatus`). Os schemas TypeBox do BFF usam parsing tolerante a campos extras para não quebrar com adições; breaking change exige `/api/v2` + ADR.

## Estimativa de Pipeline (W0 size)

- **Tamanho**: [ ] **S** (trivial, 1-3 linhas/config) · [ ] **M** (VO/use case/refactor localizado) · [x] **L** (BC novo, múltiplos agregados, outbox, API)
- **Justificativa**: a feature consome 5 bounded contexts do `social-care` (~30 rotas), introduz um módulo vertical inteiro no `web_02` (handlers Elysia `*.query.fn`/`*.service.fn`, repositórios Eden, view-models puros Solid, ~8 fluxos de tela) e estabelece a cadeia de erro completa (`{BC}-{SEQ}` → `AppError.kind` → i18n). É o maior incremento da web até aqui.
- **Plano de testes W0 (RED)**: as primeiras suites a falhar, descrevendo a API esperada:
  1. `server/adapters/registry.schema.test.ts` — `RegisterPatientRequest`/`PatientResponse` TypeBox rejeitam payloads inválidos e aceitam os exemplos reais do contrato;
  2. `server/adapters/social-care.client.test.ts` — client injeta `Authorization: Bearer <jwt>`, desembrulha `{ data, meta }` e mapeia `{ error: { code } }` → `AppError`;
  3. `client/data/patient.repository.test.ts` — repositório expõe `Result<T, E>` (nunca `throw`) para list/get/register;
  4. `client/patient-list/patient-list.view-model.test.ts` — derivações de filtro `status`, busca e cursor de paginação.
  - Todos os testes rodam com **`bun:test`** (sem `node:test`, sem Vitest — Princ. IV).

## Referências

- **Constituição web_02**: [../../../.specify/memory/constitution.md](../../../.specify/memory/constitution.md)
- **ADRs**: [../../adr/README.md](../../adr/README.md)
  - [ADR-0002](../../adr/0002-errors-as-values.md) (erros como valores — `Result<T,E>`)
  - [ADR-0003](../../adr/0003-bun-supply-chain.md) (Bun: `bun:test`, supply-chain hardening)
  - [ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md) (split client×server; Eden como fronteira)
  - [ADR-0005](../../adr/0005-auth-session-refresh-decisions.md) (OIDC+PKCE, sessão server-side)
  - [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md) (BFF Elysia: `*.query.fn` / `*.service.fn`)
  - [ADR-0011](../../adr/0011-no-mocks-in-production.md) (sem mocks em produção)
- **Plan frontend**: [plan.fe.md](./plan.fe.md)
- **Spec**: [spec.md](./spec.md) · [spec.fe.md](./spec.fe.md)
- **Prontidão**: [api-readiness.fe.md](./api-readiness.fe.md)
- **Domínio**: [domain.fe.md](./domain.fe.md)
- **Integração cross-service**: [../README.md](../README.md)
- **Outros serviços**: [../people-context/spec.md](../people-context/spec.md) · [../analysis-bi/spec.md](../analysis-bi/spec.md)
- **Docs offline (backend)**:
  - `../../reference/framework/elysia/` (TypeBox `Elysia.t`, Eden treaty, BFF Elysia)
  - `../../reference/runtime/bun/` (Bun: `bun:test`, runtime)
