# Implementation Plan: Consumo e estabilização do contrato analysis-bi (core-api)

**Branch**: `003-analysis-bi-web` | **Date**: 2026-06-12 | **Spec**: [spec.fe.md](./spec.fe.md)

**Input**: Feature specification em `web_02/handbook/doc/analysis-bi/spec.fe.md`

## Summary

A feature `003-analysis-bi-web` consome a API HTTP do serviço `analysis-bi` (Go 1.25 · chi · pgx · NATS JetStream), o pipeline analítico da plataforma ACDG que materializa indicadores agregados e anonimizados (HMAC-SHA256 salgado, K-anonymity K=5, sem nenhuma PII armazenada) a partir de 18 tipos de evento do `social-care`. Este plano cobre o lado **core-api** do contrato: os 5 eixos de indicadores (`GET /api/v1/indicators/{demographics|epidemiological|socioeconomic|protection|care}`), o export em 8 formatos (`GET /api/v1/export/{format}`), os 3 endpoints de metadata e os 2 de health, com o envelope `{ data, meta: { timestamp, period, k_threshold, suppressed_groups, total_records } }`. O plano frontend correspondente (dashboards web via BFF Elysia em SolidStart) está em [plan.fe.md](./plan.fe.md); a prontidão endpoint a endpoint está em [api-readiness.fe.md](./api-readiness.fe.md).

## Technical Context

**Language/Version**: Go 1.25 — serviço `analysis-bi` (repo `svc-analysis-bi`), ~90% implementado e compilável (`go build ./cmd/server/`, testes verdes)

**Primary Dependencies**: chi v5.2.5 (router + middleware) · pgx v5.9.1 (PostgreSQL) · nats.go v1.50.0 (pull-based durable consumer `analysis-bi` do stream `SOCIAL_CARE_EVENTS`) · encoders próprios de export (csv, json, xml, parquet, dbf, dbc, ods, fhir R4 BR Core)

**Storage**: PostgreSQL (database `analysis_bi`), star schema com 10 dimensões + 7 tabelas de fatos (UPSERT por UNIQUE composto), 5 migrations em `analysis-bi/internal/store/schema.go`, materialized views `mv_demographics`/`mv_epidemiological` (refresh CONCURRENTLY no job mensal de carry-forward)

**Testing**: `go test ./...` (filtro: `go test -run TestName ./path/`) + `go test -race ./...`

**Target Platform**: container Docker na VPS ACDG-BV, atrás de Caddy; nunca exposto publicamente — só o BFF `web_02` o acessa pela rede interna

**Project Type**: web-service (API REST read-only de analytics: chi router → queries agregadas com `HAVING COUNT(*) >= 5` → envelope com meta de privacidade; ingestão assíncrona via NATS fora do escopo do front)

**Performance Goals**: respostas de indicadores sem paginação com payloads tipicamente < 1000 rows por query (K-anonymity + filtros reduzem cardinalidade); export gerado sob demanda com `Content-Disposition: attachment`

**Constraints**: envelope `{ data, meta }` com meta de privacidade obrigatória (`k_threshold: 5`, `suppressed_groups`, `total_records`); K=5 aplicado NA QUERY (grupos < 5 omitidos — LGPD Art. 12); nenhuma PII em nenhum payload (sem drill-down individual — só agregados); erros **sem códigos estruturados** (HTTP status + `{ data: { error, status, message } }`); `period_start`/`period_end` obrigatórios em `YYYY-MM`; séries temporais esparsas (períodos sem dados não aparecem); rate limit token bucket **global** (MED-002)

**Scale/Scope**: 11 rotas HTTP relevantes ao front (5 eixos de indicadores + 1 export parametrizado por 8 formatos + 3 metadata + 2 health) · 18 tipos de evento NATS consumidos (read-side apenas) · ~137 mesorregiões IBGE como dimensão geográfica

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Gates derivados de [constitution.md](./constitution.md) e das convenções cross-service do root (CLAUDE.md):

| Gate | Status | Evidência |
|---|---|---|
| Envelope padronizado `{ data, meta }` em todo sucesso | ✅ | todos os handlers em `analysis-bi/internal/api/handlers/`; meta estendida com `period`, `k_threshold`, `suppressed_groups`, `total_records` |
| K-anonymity K=5 garantido **no serviço**, não no front | ✅ | `internal/domain/k_anonymity.go` (`KThreshold = 5`) + `internal/store/indicators.go` (`HAVING COUNT(*) >= 5`); mesmo filtro no export; `meta.suppressed_groups` informa células omitidas |
| Anonimização e minimização LGPD (sem PII em payload) | ✅ | supressão na ingestão (actorId/memberId/endereço descartados), `patientId` → HMAC-SHA256 salgado irreversível, generalização AgeBand × Sex × Mesorregião, DLQ sanitizada |
| Erros com código estruturado (`ANA-XXX`, padrão `PEO-XXX`/`ROL-XXX` do ecossistema) | 🔴 | **não existe** — só HTTP status + `{ data: { error, status, message } }`; o BFF mapeia por status + parsing de `message` — pedido P2 em [api-readiness.fe.md](./api-readiness.fe.md) |
| `iss`/`aud` do JWT validados | 🔴 | **HIGH-001** — `internal/api/middleware/jwks_validator.go` valida assinatura RSA-SHA256 e `exp`, mas NÃO verifica issuer nem audience; `AUTH_ISSUER`/`AUTH_AUDIENCE` existem no env mas não são aplicados — pedido P1 |
| RBAC enforced no serviço | 🔴 | **HIGH-003** — `role_guard.go` é placeholder; qualquer usuário autenticado acessa tudo (purpose limitation LGPD parcial); mitigação temporária: gate de role no BFF — pedido P1 |
| Auth fail-closed | 🟡 | **HIGH-002** — `AUTH_REQUIRED=true` (default) + `JWKS_URL` vazio impede o boot (ok), mas `AUTH_REQUIRED=false` + JWKS vazio vira API pública com skip silencioso — exige disciplina de env no deploy BV |
| Fonte de opções para o filtro de mesorregião | 🟡 | `GET /api/v1/metadata/regions` é PLANEJADO (array vazio / 501 na v1); o front precisa de lookup própria derivada de `configs/ibge_mesoregions.csv` até o fix — pedido P1 |
| Paginação em listas | 🟡 | **sem paginação HTTP por design** — K-anonymity + filtros mantêm payloads < 1000 rows; aceitável para dashboards, registrado como risco se a cardinalidade crescer |
| Idempotência/at-least-once na ingestão (consistência dos indicadores) | ✅ | `event_processing_log(event_id UUID PK)` + ACK manual + DLQ — fora do alcance do front, mas garante que o dashboard não conta evento duplicado |

## Project Structure

### Documentation (this feature)

```text
web_02/handbook/doc/analysis-bi/
├── plan.md                 # este arquivo — visão core-api do contrato analytics
├── plan.fe.md              # plano frontend (módulo vertical de dashboards)
├── tasks.md                # tasks por user story (US1 Demográfico+Epidemiológico · US2 demais eixos · US3 Exports)
├── api-readiness.fe.md     # prontidão endpoint a endpoint (5 eixos + 8 formatos + 3 metadata + 2 health)
├── spec.fe.md              # o quê (user stories, critérios)
├── domain.fe.md            # indicadores/eixos vistos pelo front (vocabulário PT-BR dos KPIs)
├── design-tokens.fe.md     # tokens do design system (vanilla-extract)
└── constitution.md         # constituição da feature (alinhada à web_02)
```

### Source Code (repository root)

```text
# Backend consumido (read-only para esta feature — nenhuma mudança de schema)
analysis-bi/
├── cmd/server/main.go                   # entrypoint, wiring completo
├── internal/
│   ├── api/                             # router.go (chi) + handlers/{indicators,export,metadata,health}.go
│   │   └── middleware/                  # recovery, security_headers, rate_limit, jwt_auth, jwks_validator, role_guard (placeholder)
│   ├── domain/                          # anonymizer.go, k_anonymity.go (K=5), events.go (18 tipos), domain_types.go
│   ├── store/                           # schema.go (5 migrations), indicators.go (HAVING COUNT>=5), carryforward.go
│   ├── ingestion/                       # pipeline NATS (fora do escopo do front)
│   └── export/                          # csv, json, xml, parquet, dbf, dbc, ods, fhir_encoder + fhir/
└── configs/config.go + ibge_mesoregions.csv

# Consumidor (implementado por plan.fe.md / tasks.md)
web_02/src/modules/analysis-bi/
├── server/                              # BFF — client HTTP do analysis-bi + handlers Elysia (*.query.fn.ts) + TypeBox
├── client/                              # MVVM — data, view-models, dashboards
└── public-api/index.ts
```

**Structure Decision**: a feature **não altera** o serviço `analysis-bi` — ela consome o contrato existente de `/api/v1` documentado em `internal/api/router.go` e `internal/api/handlers/`. Todo código novo vive no módulo vertical `web_02/src/modules/analysis-bi/` (detalhado em [plan.fe.md](./plan.fe.md)). Mudanças no serviço (validação iss/aud, RBAC, metadata/regions, códigos de erro) entram como pedidos priorizados na seção 5 de [api-readiness.fe.md](./api-readiness.fe.md).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| RBAC ausente no serviço (gate 🔴 — HIGH-003) | `role_guard.go` é placeholder; qualquer JWT válido lê todos os indicadores | Esperar o fix do serviço bloquearia a feature inteira; mitigação: o BFF aplica gate de role (claim `groups` da sessão Authentik) ANTES de chamar o serviço — defesa em profundidade temporária, removida quando o RBAC real chegar |
| `iss`/`aud` não validados (gate 🔴 — HIGH-001) | O serviço aceita qualquer JWT assinado pela chave do JWKS, de qualquer issuer/audience | O front não tem como corrigir; mitigação parcial: na VPS BV o serviço só é alcançável pela rede interna Docker e o único caller é o BFF (que injeta tokens do Authentik certo); pedido P1 ao time do serviço |
| Erros sem códigos estruturados (gate 🔴) | Não existe taxonomia `ANA-XXX`; só HTTP status + `message` em inglês | Inventar códigos no BFF criaria contrato fictício; o BFF mapeia por **status** (400→validation, 401→unauthorized, 404→notFound, 429→rateLimited, 5xx→serviceUnavailable) e preserva `message` para log — troca trivial quando `ANA-XXX` existir |
| Filtro de mesorregião sem fonte de opções (gate 🟡) | `metadata/regions` retorna vazio (PLANEJADO/501) | Esconder o filtro empobreceria os 5 dashboards; o front embarca lookup própria (subset de `configs/ibge_mesoregions.csv`) atrás de uma porta — troca para o endpoint real sem tocar UI/ViewModel |

## Migrations Drizzle (core-api)

- **Mudanças de schema**: [ ] tabelas novas · [ ] colunas · [ ] índices · [ ] FKs · [x] nenhuma
- **Prefixo de isolamento correto?** — N/A — o serviço consumido é o `analysis-bi` (Go + pgx, não Drizzle); suas migrations são versionadas em `internal/store/schema.go` (5 migrations + `schema_migrations`) e esta feature não as altera.
- **Outbox**: novo evento exige `INSERT` em `core.outbox`? Não — a web é consumidora HTTP read-only; o `analysis-bi` nem publica eventos (é consumidor durable do Outbox do `social-care` via NATS).
- **Comando**: N/A — não há `schema.ts` nesta feature; nenhuma migration a gerar.
- **Restrições**: N/A — o `analysis-bi` usa PostgreSQL (star schema + materialized views com refresh CONCURRENTLY).

## Contrato HTTP (Fase 2+ — pular se CLI-only)

- **Endpoints novos/alterados**: nenhum endpoint novo no `analysis-bi`. A web consome o contrato existente em `/api/v1` (11 rotas relevantes):
  - **Indicadores** — `GET /api/v1/indicators/{axis}` com `axis ∈ demographics | epidemiological | socioeconomic | protection | care`. Query params: `period_start=YYYY-MM` (obrigatório), `period_end=YYYY-MM` (obrigatório), `mesoregion=<code>` (opcional), `granularity=monthly|quarterly|yearly` (default `monthly`), `top=<N>` (apenas `epidemiological`/`socioeconomic`). Item de resposta: `{ "labels": { …dimensões… }, "value": <int>, "period": "2025-03" }` — labels por eixo: demographics → `age_band`, `sex`, `mesoregion_name`; epidemiological → `icd_code`, `icd_label`; socioeconomic → `income_band`, `mesoregion_name`; protection → `violation_type`/`destination`, `mesoregion_name`; care → `appointment_type`, `mesoregion_name`. Envelope: `{ data: [...], meta: { timestamp, period: "2025-01/2026-03", k_threshold: 5, suppressed_groups, total_records } }`.
  - **Export** — `GET /api/v1/export/{format}` com `format ∈ csv | json | xml | parquet | dbf | dbc | ods | fhir` (DBF/DBC = TABWIN/DataSUS; FHIR Bundle R4 BR Core; ODS = LibreOffice). Query: `dataset=demographics|epidemiological|socioeconomic|protection|care` (default `demographics`), `period_start`/`period_end` (obrigatórios), `mesoregion?`. Response: `Content-Disposition: attachment; filename="acdg-{dataset}-{period}.{ext}"`, Content-Type por formato, K=5 aplicado igualmente, `ExportMetadata` com period/k_threshold/suppressed/total_records/generated_at.
  - **Metadata** — `GET /api/v1/metadata/datasets` (5 datasets com descrição), `GET /api/v1/metadata/formats` (8 formatos: name, content_type, extension), `GET /api/v1/metadata/regions` (**PLANEJADO** — array vazio/501 na v1).
  - **Health** — `GET /health` (liveness, 200 sempre) e `GET /ready` (readiness, 200/503 com `{ status, database, nats }`) — usados pelo healthcheck do Compose, não pelo BFF.
  - **Erros**: sem códigos estruturados — `{ data: { error, status, message }, meta }` com 400 (params inválidos: `YYYY-MM` malformado, mesoregion inexistente, `top < 0`), 401 (JWT inválido/expirado/ausente), 403 (PLANEJADO — RBAC não enforced), 404 (eixo/endpoint desconhecido), 429 (rate limit global), 500, 501 (metadata/regions), 503 (`/ready`). Schemas TypeBox (`Elysia.t`) de request/response vivem no BFF (`web_02/src/modules/analysis-bi/server/adapters/*.schema.ts`) e validam na borda (Princípio V — [ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md)).
- **Backward-compat / versionamento**: prefixo `/api/v1` estável; SemVer no serviço (`feat:` → minor). Evolução **apenas aditiva** (ex.: labels novos por eixo, `meta` estendida); os schemas TypeBox do BFF usam parsing tolerante a campos extras; breaking change exige `/api/v2` + ADR. A futura introdução de códigos `ANA-XXX` e do RBAC real deve ser aditiva (status codes preservados) — tratada como pedidos P1/P2 em [api-readiness.fe.md](./api-readiness.fe.md).

## Estimativa de Pipeline (W0 size)

- **Tamanho**: [ ] **S** (trivial, 1-3 linhas/config) · [ ] **M** (VO/use case/refactor localizado) · [x] **L** (BC novo, múltiplos agregados, outbox, API)
- **Justificativa**: a feature introduz um módulo vertical inteiro no `web_02` (8 handlers Elysia cobrindo 5 eixos + export + 2 metadata, proxy de download streaming, repositórios, view-models de 5 dashboards com gap filling de séries esparsas, central de exports com 8 formatos), estabelece a cadeia de erro por status HTTP (sem códigos estruturados), o gate RBAC no BFF (mitigação do HIGH-003) e a biblioteca de gráficos do design system.
- **Plano de testes W0 (RED)**: as primeiras suites a falhar, descrevendo a API esperada:
  1. `server/adapters/envelope.schema.test.ts` — TypeBox aceita `{ data: IndicatorItem[], meta }` com a meta de privacidade completa (`k_threshold`, `suppressed_groups`, `total_records`, `period`) e o envelope de erro `{ data: { error, status, message } }`;
  2. `server/adapters/analysis-bi.client.test.ts` — client injeta `Authorization: Bearer <jwt>` da sessão, monta query string (`period_start`/`period_end` `YYYY-MM`, `granularity`, `mesoregion?`, `top?`), desembrulha `{ data, meta }` e mapeia status HTTP → `AppError.kind` (inclusive 429 → `rateLimited`);
  3. `client/data/indicators.repository.test.ts` — repositório expõe `Result<T, E>` (nunca `throw`) para os 5 eixos, propagando `meta.suppressed_groups` para a UI;
  4. `client/domain/series.test.ts` — gap filling puro de séries esparsas nas 3 granularidades (`monthly` "2025-03", `quarterly` "2025-Q1", `yearly` "2025"), preenchendo períodos ausentes com zero/null explícito.

## Referências

- [plan.fe.md](./plan.fe.md) — plano frontend (módulo vertical de dashboards web)
- [spec.md](./spec.md) — especificação do contrato core-api (`svc-analysis-bi`)
- [spec.fe.md](./spec.fe.md) — especificação frontend desta feature
- [api-readiness.fe.md](./api-readiness.fe.md) — prontidão endpoint a endpoint
- [domain.fe.md](./domain.fe.md) — modelo de domínio client
- [../README.md](../README.md) — doc de integração cross-serviço
- [../../adr/README.md](../../adr/README.md) — índice de ADRs web_02
- [../../adr/0002-errors-as-values.md](../../adr/0002-errors-as-values.md) — erros como valores
- [../../adr/0004-client-server-split-mvvm-ddd.md](../../adr/0004-client-server-split-mvvm-ddd.md) — split client (MVVM) × server (DDD)
- [../../adr/0010-bff-orchestration-fn-naming.md](../../adr/0010-bff-orchestration-fn-naming.md) — nomenclatura `*.query.fn.ts`
- [../../../.specify/memory/constitution.md](../../../.specify/memory/constitution.md) — constituição web_02
- [../../reference/runtime/bun/](../../reference/runtime/bun/) — docs offline Bun
- [../../reference/framework/elysia/](../../reference/framework/elysia/) — docs offline Elysia
- [../../reference/framework/solidstart/](../../reference/framework/solidstart/) — docs offline SolidStart
