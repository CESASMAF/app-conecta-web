# Relatório de Prontidão da API (core-api): Dashboards Web Analysis-BI

**Feature**: `web_02/handbook/doc/analysis-bi/` (003-analysis-bi-web) · **Emissor**: Arquitetura Frontend v2 · **Destinatário**: Time analysis-bi (svc-analysis-bi)

> Documento `-fe` específico do BFF. Como o browser **nunca** fala com o `analysis-bi` direto
> ([Princípio I — BFF-Orchestrated Boundary](../../../.specify/memory/constitution.md)),
> toda capacidade depende de um endpoint atrás do handler Elysia. Este relatório mapeia, por
> sub-domínio/capacidade, **o que a API já entrega** vs. **o que falta**, e define a **estratégia de
> integração progressiva**. Alimenta o `plan.fe.md` (seção "Integração core-api") e os ADRs.

## 1. Resumo Executivo

A API do `analysis-bi` está **funcionalmente pronta para integração real desde a Fase 1**: os 5 eixos de indicadores (`GET /api/v1/indicators/{axis}`), o export em 8 formatos (`GET /api/v1/export/{format}`) e a metadata de datasets/formats cobrem todos os dashboards da feature sob o prefixo **`/api/v1`**, com envelope `{ data, meta }` estendido com a meta de privacidade (`k_threshold: 5`, `suppressed_groups`, `total_records`) e K-anonymity aplicado na query (`HAVING COUNT(*) >= 5`) — o front nunca precisa (nem pode) reforçar privacidade. Não há OpenAPI publicado; a fonte de verdade do contrato é o código Go (`internal/api/router.go` + `handlers/`), coberta por **schemas TypeBox (`Elysia.t`) no BFF Elysia** — o Eden Treaty propaga o tipo ao client sem redeclarar Model ([ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md), [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md)). As lacunas são de **segurança e acabamento de contrato**, não de capacidade: **erros sem códigos estruturados** (só HTTP status + `message`), **RBAC ausente** (HIGH-003 — `role_guard.go` é placeholder; mitigação: gate de role no BFF Elysia), **`iss`/`aud` do JWT não validados** (HIGH-001), **`metadata/regions` vazio/501** (o filtro de mesorregião fica sem fonte de opções — o front embarca lookup própria do IBGE), **sem paginação** (aceitável: payloads < 1000 rows por design) e **rate limit global, não per-IP** (MED-002 — um cliente pesado causa 429 para todos). Nenhum mock é necessário nem permitido ([ADR-0011](../../adr/0011-no-mocks-in-production.md), [Princípio VI](../../../.specify/memory/constitution.md)); operações sem rota retornam o valor `'not-implemented'`.

## 2. Matriz de Prontidão

| Sub-domínio / Capacidade | Endpoint (método rota) | Existe? | Contrato OK? | RBAC | Veredito |
|---|---|---|---|---|---|
| Indicadores — demográfico (pirâmide etária, sexo, geografia) | `GET /api/v1/indicators/demographics` | ✅ | ✅ (labels `age_band`/`sex`/`mesoregion_name`; params period_start/period_end/mesoregion/granularity) | ❌ (HIGH-003 — gate no BFF) | 🟡 PARCIAL |
| Indicadores — epidemiológico (top N CID-10, novos vs total) | `GET /api/v1/indicators/epidemiological` | ✅ | ✅ (labels `icd_code`/`icd_label`; suporta `top=N`) | ❌ (HIGH-003) | 🟡 PARCIAL |
| Indicadores — socioeconômico (renda 6 faixas SM, benefícios) | `GET /api/v1/indicators/socioeconomic` | ✅ | ✅ (labels `income_band`/`mesoregion_name`; suporta `top=N`) | ❌ (HIGH-003) | 🟡 PARCIAL |
| Indicadores — proteção (encaminhamentos, violações) | `GET /api/v1/indicators/protection` | ✅ | ✅ (labels `violation_type`/`destination`/`mesoregion_name`) | ❌ (HIGH-003) | 🟡 PARCIAL |
| Indicadores — cuidado (atendimentos, completude) | `GET /api/v1/indicators/care` | ✅ | ✅ (labels `appointment_type`/`mesoregion_name`) | ❌ (HIGH-003) | 🟡 PARCIAL |
| Export — CSV | `GET /api/v1/export/csv` | ✅ | ✅ (`Content-Disposition: attachment; filename="acdg-{dataset}-{period}.csv"`; K=5 aplicado) | ❌ (HIGH-003) | 🟢 PRONTO |
| Export — JSON | `GET /api/v1/export/json` | ✅ | ✅ (ExportMetadata: period, k_threshold, suppressed, total_records, generated_at) | ❌ (HIGH-003) | 🟢 PRONTO |
| Export — XML | `GET /api/v1/export/xml` | ✅ | ✅ | ❌ (HIGH-003) | 🟢 PRONTO |
| Export — Parquet | `GET /api/v1/export/parquet` | ✅ | ✅ (binário — exige proxy streaming no BFF Elysia) | ❌ (HIGH-003) | 🟢 PRONTO |
| Export — DBF (TABWIN) | `GET /api/v1/export/dbf` | ✅ | ✅ | ❌ (HIGH-003) | 🟢 PRONTO |
| Export — DBC (DataSUS) | `GET /api/v1/export/dbc` | ✅ | ✅ | ❌ (HIGH-003) | 🟢 PRONTO |
| Export — ODS (LibreOffice) | `GET /api/v1/export/ods` | ✅ | ✅ | ❌ (HIGH-003) | 🟢 PRONTO |
| Export — FHIR Bundle R4 BR Core (RNDS) | `GET /api/v1/export/fhir` | ✅ | ✅ (`internal/export/fhir/` — patient/observation/condition) | ❌ (HIGH-003) | 🟢 PRONTO |
| Metadata — datasets | `GET /api/v1/metadata/datasets` | ✅ | ✅ (5 datasets com descrição) | ❌ (HIGH-003) | 🟢 PRONTO |
| Metadata — formats | `GET /api/v1/metadata/formats` | ✅ | ✅ (8 formatos: name, content_type, extension) | ❌ (HIGH-003) | 🟢 PRONTO |
| Metadata — regions (opções do filtro de mesorregião) | `GET /api/v1/metadata/regions` | ❌ | — (PLANEJADO — array vazio / 501 na v1) | — | 🔴 AUSENTE |
| Health — liveness | `GET /health` | ✅ | ✅ (200 sempre, `{ data: { status: "ok" } }`, sem auth) | — | 🟢 PRONTO (uso: healthcheck Compose, não BFF) |
| Health — readiness | `GET /ready` | ✅ | ✅ (200/503, `{ data: { status, database, nats } }`) | — | 🟢 PRONTO |
| Códigos de erro estruturados (`ANA-XXX`) | — (transversal) | ❌ | — (só HTTP status + `{ data: { error, status, message } }`) | — | 🔴 AUSENTE |
| Validação de `iss`/`aud` no JWT | — (transversal, `jwks_validator.go`) | ❌ | — (HIGH-001 — só assinatura + `exp`; `AUTH_ISSUER`/`AUTH_AUDIENCE` no env mas não aplicados) | — | 🔴 AUSENTE |
| RBAC enforced no serviço | — (transversal, `role_guard.go`) | ❌ | — (HIGH-003 — placeholder; qualquer JWT válido acessa tudo) | — | 🔴 AUSENTE |
| Paginação HTTP | — (transversal) | ❌ | — (por design: K=5 + filtros mantêm < 1000 rows/query) | — | 🟡 ACEITÁVEL |
| Rate limiting per-client | — (transversal, `rate_limit.go`) | ✅ | parcial (token bucket **global**, não per-IP — MED-002; 429 indiscriminado) | — | 🟡 PARCIAL |

## 3. Gaps por Sub-domínio

### Indicadores (5 eixos) — 🟡 PARCIAL

- **Endpoints**: 5 rotas em `analysis-bi/internal/api/handlers/indicators.go` (router em `internal/api/router.go`).
- **Contrato (request/response)**: query params consistentes (`period_start`/`period_end` `YYYY-MM` obrigatórios → 400 se malformados; `mesoregion` opcional → 400 se inexistente; `granularity=monthly|quarterly|yearly` default monthly; `top=N` em epidemiological/socioeconomic → 400 se `< 0`); item `{ labels, value, period }` com labels específicos por eixo; envelope `{ data: [...], meta: { timestamp, period: "2025-01/2026-03", k_threshold: 5, suppressed_groups, total_records } }`; agregações COUNT/SUM/AVG/TOP N sobre o star schema (7 tabelas de fatos + materialized views `mv_demographics`/`mv_epidemiological`).
- **Agregado/tabela**: `internal/store/indicators.go` com `HAVING COUNT(*) >= 5` — K-anonymity garantido no serviço, células < 5 omitidas e contadas em `meta.suppressed_groups`.
- **GAP**: (1) **sem códigos de erro estruturados** — impossível distinguir programaticamente "period malformado" de "mesoregion inexistente" sem parsear `message` em inglês; (2) **RBAC ausente** (HIGH-003) — qualquer usuário autenticado lê todos os eixos (purpose limitation LGPD parcial); (3) **séries esparsas** — períodos sem dados não vêm na resposta (documentado, mas obriga gap filling no client); (4) sem paginação (aceitável dado o teto natural de cardinalidade).
- **Estratégia front**: integrar direto; gap filling puro em `client/domain/series.ts` (3 granularidades, pontos sintéticos marcados); banner de supressão obrigatório quando `suppressed_groups > 0`; gate de role no BFF Elysia antes de toda chamada; erros mapeados por status (400 → `validation` com mensagem genérica pt-BR; `message` original só em log do BFF). Schema TypeBox (`Elysia.t`) como contrato executável — falha ruidosa em divergência.

### Export (8 formatos) — 🟢 PRONTO

- **Endpoints**: 1 rota parametrizada em `internal/api/handlers/export.go` + encoders em `internal/export/` (csv, json, xml, parquet, dbf, dbc, ods, fhir_encoder + `fhir/`).
- **Contrato (request/response)**: `format ∈ csv|json|xml|parquet|dbf|dbc|ods|fhir`; query `dataset` (default `demographics`), `period_start`/`period_end` obrigatórios, `mesoregion?`; response com `Content-Disposition: attachment; filename="acdg-{dataset}-{period}.{ext}"` e Content-Type por formato; mesmo filtro K=5 dos indicadores; `ExportMetadata` embutida (period, k_threshold, suppressed count, total_records, generated_at).
- **Agregado/tabela**: mesmas queries do eixo correspondente — paridade dashboard ↔ export garantida.
- **GAP**: nenhum bloqueante. Notas: (1) download autenticado por Bearer impede `<a href>` direto do browser para o serviço — exige **proxy streaming no BFF Elysia** (já planejado: `export.route.ts` como rota Elysia, não handler JSON); (2) formatos binários (Parquet, DBC, ODS) sem tamanho previsível — o proxy não deve bufferizar; (3) sem RBAC (HIGH-003), o export é a superfície mais sensível a exfiltração em massa, mesmo sendo K-anônimo — reforça o pedido P1.
- **Estratégia front**: integrar direto via rota Elysia com stream pass-through (preserva Content-Type/Content-Disposition); nomes amigáveis PT-BR mapeados no client (CSV, JSON, XML, Parquet, DBF/TABWIN, DBC/DataSUS, ODS, FHIR/RNDS).

### Metadata — 🟡 PARCIAL (regions 🔴)

- **Endpoints**: 3 rotas em `internal/api/handlers/metadata.go`.
- **Contrato (request/response)**: `datasets` (5 itens com descrição — alimenta a central de exports) e `formats` (8 itens: name, content_type, extension) prontos e estáveis; `regions` **PLANEJADO** — retorna array vazio (e o serviço documenta 501 para não implementado).
- **Agregado/tabela**: a fonte real das mesorregiões existe no serviço (`configs/ibge_mesoregions.csv`, ~137 mesorregiões IBGE, lookup CEP→mesorregião em `internal/domain/geography_csv.go`) — só não é exposta via API.
- **GAP**: **o filtro de mesorregião dos 5 dashboards e do export não tem fonte de opções** — o front não consegue popular o `MesoregionSelect` pela API; qualquer divergência entre a lookup local do front e o CSV do serviço gera 400 "mesoregion inexistente".
- **Estratégia front**: lookup própria hardcoded (subset do `ibge_mesoregions.csv`, foco Roraima/Norte) atrás da porta `client/data/mesoregion-lookup.ts`; trocar pelo endpoint real quando implementado — UI/ViewModel intocados; pedido P1 abaixo.

### Transversal (segurança/contrato) — 🔴 AUSENTE

- **Endpoints**: middleware chain em `internal/api/middleware/`: Recovery → Security Headers → Rate Limit (token bucket **global** — MED-002) → JWT Auth (skip silencioso se `JWKS_URL` vazio com `AUTH_REQUIRED=false` — HIGH-002) → Role Guard (**placeholder** — HIGH-003).
- **GAP**: (1) **HIGH-001** — `jwks_validator.go` valida assinatura RSA-SHA256 e `exp`, mas **não verifica `iss` nem `aud`**: um token válido de outro app do mesmo Authentik é aceito; (2) **HIGH-003** — RBAC não enforced: 403 está documentado mas nunca é emitido; (3) **sem códigos estruturados** (`ANA-XXX`) — fora do padrão do ecossistema (`PEO-XXX`/`ROL-XXX`); (4) **MED-002** — rate limit global: um dashboard com muitos usuários simultâneos (ou um export pesado) gera 429 para todos os clientes, sem distinção; (5) sem audit trail de acesso aos indicadores (LOW-001 — ROPA parcial). Pontos positivos a registrar: privacidade exemplar (K=5 na query, DLQ sanitizada, hash irreversível, zero PII em payload), fail-closed no boot com `AUTH_REQUIRED=true` + JWKS vazio.
- **Estratégia front**: schemas TypeBox (`Elysia.t`) versionados no BFF como contrato executável (falha ruidosa em divergência); gate de role no BFF Elysia (claim `groups` da sessão Authentik) como defesa em profundidade enquanto HIGH-003 não é corrigido; na VPS BV o serviço fica em rede interna Docker (única borda = web/Caddy), o que reduz — mas não elimina — a exposição do HIGH-001; 429 tratado com mensagem de retry e `createAsync` com staleTime agressivo para reduzir pressão no bucket global.

## 4. Estratégia de Integração Progressiva

| Sub-domínio | Fase 1 (agora) | Quando o backend evoluir |
|---|---|---|
| Indicadores (5 eixos) | integra real; gap filling no client; banner de supressão; gate RBAC no BFF Elysia | remover o gate do BFF quando o RBAC real chegar (HIGH-003); trocar o mapeamento por status por `ANA-XXX` em `analysis-bi.client.ts` — UI/ViewModel intocados |
| Export (8 formatos) | integra real via proxy streaming (rota Elysia `export.route.ts`) | nenhuma mudança prevista; se surgir export assíncrono (job + polling) para datasets grandes, adaptar só a rota Elysia |
| Metadata datasets/formats | integra real; nomes amigáveis no client | diffar os schemas TypeBox contra contrato publicado quando existir OpenAPI |
| Metadata regions | lookup local IBGE atrás de porta (`mesoregion-lookup.ts`) | trocar pela chamada a `GET /api/v1/metadata/regions` quando sair do 501 — troca só no repository |
| Erros | mapeamento por HTTP status; `message` só em log | adotar a taxonomia `ANA-XXX` preservando os kinds existentes |
| Rate limit | `createAsync` com staleTime agressivo + mensagem de retry no 429 via `action` do `@solidjs/router` | reavaliar caching quando o limit virar per-IP/per-client (MED-002) |

> Decisão registrada como ADR ("integração real + contrato executável em TypeBox/Eden; RBAC no BFF Elysia como mitigação temporária do HIGH-003; lookup local de mesorregiões; export via proxy streaming como rota Elysia"). O ponto de troca é o **repository** (`client/data`) ou o **client analysis-bi** (`server/adapters/analysis-bi.client.ts`) — a UI e o ViewModel não mudam.

## 5. Pedidos ao Time core-api (priorizados)

- **P1**: **Validar `iss` e `aud` no JWT** (`internal/api/middleware/jwks_validator.go`) usando os `AUTH_ISSUER`/`AUTH_AUDIENCE` que já existem no env (**HIGH-001**, FINAL-REPORT 74/100) — hoje qualquer token assinado pela chave do JWKS é aceito, de qualquer issuer/audience do Authentik.
- **P1**: **Implementar o RBAC real** em `internal/api/middleware/role_guard.go` (**HIGH-003**) — roles via claim `groups` do Authentik, alinhado ao padrão do ecossistema (people-context); enquanto não sai, o BFF Elysia duplica o gate (defesa em profundidade), o que não protege chamadas que não passem pela web. É também requisito de purpose limitation LGPD para dados de saúde agregados.
- **P1**: **Implementar `GET /api/v1/metadata/regions`** servindo as mesorregiões de `configs/ibge_mesoregions.csv` (code + name, opcionalmente filtráveis por UF) — sem ele o filtro de mesorregião dos 5 dashboards depende de uma lookup duplicada no front que pode divergir do CSV e gerar 400.
- **P2**: **Códigos de erro estruturados** `ANA-XXX` no envelope de erro (padrão do ecossistema `{ success: false, error: { code, message } }` ou ao menos `code` dentro do body atual) — hoje o BFF distingue erros só por HTTP status e o 400 é ambíguo (period malformado vs mesoregion inexistente vs top inválido).
- **P2**: **Rate limit per-IP/per-client** em vez do token bucket global (**MED-002**) — com o BFF como único caller, todos os usuários compartilham um bucket e um export pesado degrada os dashboards de todo mundo.
- **P2**: Remover ou logar ruidosamente o **skip silencioso de auth** com `AUTH_REQUIRED=false` + `JWKS_URL` vazio (**HIGH-002**) — em produção BV isso é um foot-gun de configuração; sugerir warning de boot + métrica.
- **P3**: Publicar **OpenAPI** do `/api/v1` (5 eixos + export + metadata + health) — hoje a fonte de verdade é o código Go e o BFF mantém o contrato executável em TypeBox (`Elysia.t`).
- **P3**: **Audit trail de acesso** aos indicadores/exports (LOW-001) — completa o ROPA LGPD; relevante porque o export é a superfície de extração em massa.

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípio I (BFF-Orchestrated), Princípio V (TypeBox/Eden), Princípio VI (Honesty)
- [ADR-0001 (vertical-modular)](../../adr/0001-vertical-modular-architecture.md) — boundaries de módulo
- [ADR-0004 (Client/Server MVVM×DDD)](../../adr/0004-client-server-split-mvvm-ddd.md) — Eden Treaty propaga tipos sem redeclarar Model
- [ADR-0005 (auth/session)](../../adr/0005-auth-session-refresh-decisions.md) — OIDC+PKCE, sessão opaca, gate de role no BFF
- [ADR-0010 (BFF orchestration / fn naming)](../../adr/0010-bff-orchestration-fn-naming.md) — `*.query.fn.ts`, rota Elysia de export
- [ADR-0011 (no mocks)](../../adr/0011-no-mocks-in-production.md) — `'not-implemented'` como valor, sem mock em `src/`
- [adr.md](./adr.md) — proibição de drill-down individual
- [adr.fe.md](./adr.fe.md) — estratégia de erros e supressão K=5
- [domain.fe.md](./domain.fe.md) — Model TypeBox/Eden, eventos
- [domain.md](./domain.md) — domínio CORE Go (invariantes K=5)
- [metrics.md](./metrics.md) — NFRs e métricas do contrato
- [metrics.fe.md](./metrics.fe.md) — NFRs do browser
- [ADR index](../../adr/README.md) — todos os ADRs web_02
- [Doc integração](../README.md) — mapa cross-service
- Docs offline: `../../reference/framework/elysia/` · `../../reference/framework/solidstart/` · `../../reference/runtime/bun/`
