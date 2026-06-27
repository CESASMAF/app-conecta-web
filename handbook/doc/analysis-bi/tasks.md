---

description: "Task list — Dashboards Web Analysis-BI (003-analysis-bi-web)"
---

# Tasks: Dashboards Web Analysis-BI

**Input**: Design documents de `web_02/handbook/doc/analysis-bi/`

**Prerequisites**: `plan.fe.md` (required), `spec.fe.md` (required for user stories), `plan.md`, `api-readiness.fe.md`, `domain.fe.md`, `design-tokens.fe.md`

**Tests**: TDD obrigatório (Princípio VI da [constituição web_02](../../../.specify/memory/constitution.md) — Honesty/No Mocks) — toda task de teste precede a implementação correspondente e deve falhar primeiro (RED).

**Organization**: Tasks agrupadas por user story para permitir implementação e teste independentes de cada história.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: a qual user story a task pertence (US1, US2, US3)
- Paths exatos incluídos nas descrições

## Path Conventions

- Repo `web_02/` (Bun · SolidStart · Elysia). Módulo vertical em `src/modules/analysis-bi/` conforme `plan.fe.md` ([ADR-0001](../../adr/0001-vertical-modular-architecture.md)).
- `server/` = BFF Elysia (token e `ANALYSIS_BI_API_URL` vivem aqui — [ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md)) · `client/` = MVVM agnóstico · `public-api/index.ts` = único import externo.
- Rotas SolidStart file-based em `src/routes/analysis-bi/`.
- Handlers Elysia: `*.query.fn.ts` (leitura) / `*.service.fn.ts` (escrita/streaming); consumidos via **Eden treaty** ([ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md)).
- Testes puros co-locados `*.test.ts` (`bun:test`); testes DOM `*.test.tsx` (`bun:test` + `happy-dom`).

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: esqueleto do módulo vertical, dependência de gráficos e fiação de build/teste

- [ ] T001 Criar esqueleto do módulo em `src/modules/analysis-bi/{server/{domain,application,adapters},client/{data,domain},public-api}/` com `index.ts` vazio em `public-api`
- [ ] T002 Configurar governance tests de boundaries do módulo (import externo só via `src/modules/analysis-bi/public-api/index.ts`) em `bun:test` — sem ESLint/eslint-plugin-boundaries ([ADR-0001](../../adr/0001-vertical-modular-architecture.md), [ADR-README](../../adr/README.md))
- [ ] T003 [P] Instalar via `bun add` os pacotes de gráficos mínimos (e.g. `@visx/scale`, `@visx/shape`, `@visx/axis`, `@visx/group` — sem utilitários npm que dupliquem nativo) e registrar a decisão em `web_02/handbook/doc/analysis-bi/adr/` ([ADR-0003](../../adr/0003-bun-supply-chain.md))
- [ ] T004 [P] Criar stubs de rota SolidStart file-based em `src/routes/analysis-bi/` (index = visão geral; `demographics`, `epidemiological`, `socioeconomic`, `protection`, `care` = dashboards por eixo; `export` = central de exports) importando apenas de `public-api`
- [ ] T005 [P] Garantir scripts de teste do módulo (`bun:test` para `*.test.ts` puros e `*.test.tsx` com `happy-dom`) em `package.json`/`bunfig.toml`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: borda BFF↔analysis-bi (Bearer + gate RBAC), envelope com meta de privacidade, cadeia de erro por status HTTP, VOs de período/granularidade, gap filling, filtros compartilhados, banner de supressão e primitivas de gráfico — pré-requisitos de TODAS as user stories

**⚠️ CRITICAL**: nenhuma user story pode começar antes desta fase terminar

- [ ] T006 Configurar `ANALYSIS_BI_API_URL` server-only (env do BFF Elysia; nunca exposto ao client) e registrar em `src/modules/analysis-bi/server/adapters/config.ts`
- [ ] T007 [P] Teste RED do envelope: TypeBox (`Elysia.t`) de `{ data: IndicatorItem[], meta: { timestamp, period, k_threshold, suppressed_groups, total_records } }` e do envelope de erro `{ data: { error, status, message }, meta }` em `src/modules/analysis-bi/server/adapters/envelope.schema.test.ts` (`bun:test`)
- [ ] T008 [P] Implementar `src/modules/analysis-bi/server/adapters/envelope.schema.ts` (depende de T007)
- [ ] T009 [P] Teste RED da cadeia de erro por status HTTP (sem códigos estruturados — gap do serviço): 400 → `validation`, 401 → `unauthorized`, 403 → `forbidden`, 404 → `notFound`, 429 → `rateLimited`, 500/503 → `serviceUnavailable`, preservando `message` em `AppError.detail` (só log, nunca UI) em `src/modules/analysis-bi/server/domain/errors.test.ts` — [ADR-0002](../../adr/0002-errors-as-values.md)
- [ ] T010 Implementar `src/modules/analysis-bi/server/domain/errors.ts` com `Result<T,E>` e `AppError` (depende de T009)
- [ ] T011 [P] VOs branded puros com smart constructors retornando `Result`: `YearMonth` (`YYYY-MM`, mês 01–12), `PeriodRange` (start ≤ end), `Granularity`/`Axis`/`Dataset`/`ExportFormat` (unions + `as const`), `MesoregionCode`, `TopN` (int ≥ 1) — testes `bun:test` + implementação em `src/modules/analysis-bi/server/domain/indicators.ts`
- [ ] T012 Teste RED do client HTTP: injeta `Authorization: Bearer <jwt>` da sessão Authentik (módulo auth via `public-api`), monta query string (`period_start`/`period_end`/`granularity`/`mesoregion?`/`top?`), desembrulha `{ data, meta }`, converte 4xx/5xx em `AppError`, nunca vaza token nem `ANALYSIS_BI_API_URL` — `src/modules/analysis-bi/server/adapters/analysis-bi.client.test.ts`
- [ ] T013 Implementar `src/modules/analysis-bi/server/adapters/analysis-bi.client.ts` (`resultFetch` + `HttpError` + `mapToServerResponse`) (depende de T008, T010, T011, T012)
- [ ] T014 Gate RBAC no BFF Elysia (mitigação HIGH-003 — o serviço não enforça role): teste RED + implementação de `require-indicators-role.ts` em `src/modules/analysis-bi/server/application/` — verifica claim `groups` da sessão ANTES de qualquer chamada ao serviço; negado → `AppError` forbidden (depende de T010)
- [ ] T015 [P] Gap filling puro de séries esparsas: enumeração de períodos nas 3 granularidades (`monthly "2025-03"`, `quarterly "2025-Q1"`, `yearly "2025"`), preenchimento de pontos sintéticos (`synthetic: true`) entre `period_start` e `period_end` — testes `bun:test` + implementação em `src/modules/analysis-bi/client/domain/series.ts`
- [ ] T016 [P] Helpers puros de formatação (Intl pt-BR, sem libs npm): `"2025-03"` ↔ `"mar/2025"`, `"2025-Q1"` ↔ `"1º tri 2025"`, `"2025"` ↔ `"2025"`, valores inteiros e monetários (`benefit total_amount`) — testes + implementação em `src/modules/analysis-bi/client/domain/format.ts`
- [ ] T017 [P] Lookup local de mesorregiões IBGE (gap: `metadata/regions` retorna vazio/501) atrás de porta trocável: testes + implementação em `src/modules/analysis-bi/client/data/mesoregion-lookup.ts` com subset de `configs/ibge_mesoregions.csv` (foco RR/Norte) e comentário apontando o pedido P1 de `api-readiness.fe.md`
- [ ] T018 [P] Átomos/moléculas vanilla-extract (`.css.ts` com `vars.*` de `shared/ui/tokens`, ver `design-tokens.fe.md`): `SuppressionBanner` ("N grupos suprimidos por privacidade — K-anonimato K=5"), `KpiCard`, `PeriodRangePicker` (YYYY-MM, start ≤ end), `GranularitySelect`, `MesoregionSelect`, `TopNSelect`, `FormatBadge`, `EmptyStateCard` (distingue "sem dados" de "tudo suprimido") em `src/shared/ui/` — zero hex/px cru ([ADR-0007](../../adr/0007-design-system-vanilla-extract.md))
- [ ] T019 [P] Primitivas de gráfico como views burras Solid (recebem séries prontas, estilos só por token vanilla-extract): `TimeSeriesChart`, `CategoryBarChart`, `PopulationPyramid` em `src/modules/analysis-bi/client/charts/` + testes DOM básicos de render (`bun:test` + `happy-dom`)
- [ ] T020 Filtros compartilhados entre dashboards: `filters.view-model.ts` (reducer puro: período/granularidade/mesorregião/topN; validação start ≤ end) + `filters.binding.ts` (sincronia com search params da rota SolidStart via `createAsync`/`query` do `@solidjs/router`) + bus de eventos (fatos no passado: `filters-changed`, `export-requested`, `export-completed`) em `src/modules/analysis-bi/client/filters/` e `src/modules/analysis-bi/client/data/events/`

**Checkpoint**: fundação pronta — user stories podem começar (em paralelo, se houver gente)

---

## Phase 3: User Story 1 - Dashboard demográfico + epidemiológico (Priority: P1) 🎯 MVP

**Goal**: gestor visualiza o perfil demográfico (pirâmide etária `age_band` × `sex`, distribuição por sexo e por mesorregião) e o panorama epidemiológico (top N diagnósticos CID-10, casos novos vs acumulados) filtrando por período `YYYY-MM`, granularidade e mesorregião, com aviso de supressão sempre que `suppressed_groups > 0`.

**Independent Test**: com o `analysis-bi` de pé (com dados materializados), logar com role de indicadores → abrir o dashboard demográfico com `period_start=2025-01` e `period_end=2025-12` → ver a pirâmide etária renderizada e o banner de supressão se houver grupos omitidos → trocar granularity para quarterly e ver a série re-derivada com gaps preenchidos → abrir o epidemiológico com `top=10` e ver o ranking CID-10.

### Tests for User Story 1 (RED primeiro) ⚠️

- [ ] T021 [P] [US1] Teste de contrato TypeBox: `indicatorsQuerySchema` (`period_start`/`period_end` YYYY-MM obrigatórios, `mesoregion?`, `granularity` default `monthly`, `top?` só onde aplicável) e `IndicatorItemModel` com `labels` por eixo (`demographics`: `age_band`/`sex`/`mesoregion_name`; `epidemiological`: `icd_code`/`icd_label`) — `src/modules/analysis-bi/server/adapters/indicator.schema.test.ts` (`bun:test`)
- [ ] T022 [P] [US1] Teste do repositório: `getDemographics`/`getEpidemiological` expõem `Result` (nunca `throw`), propagam meta de privacidade (`k_threshold`, `suppressed_groups`, `total_records`) e o filtro `top` — `src/modules/analysis-bi/client/data/indicators.repository.test.ts`
- [ ] T023 [P] [US1] Teste do ViewModel demográfico (`*.view-model.ts`): deriva `PyramidRow[]` (`age_band` × `{male, female}`, 17 faixas, espelhamento), distribuição por sexo e por mesorregião a partir de `IndicatorItem[]`; banner ligado quando `suppressed_groups > 0`; estado vazio distingue "sem dados no período" de "tudo suprimido"; não importa `solid-js` — `src/modules/analysis-bi/client/demographics-dashboard/demographics-dashboard.view-model.test.ts` ([ADR-0009](../../adr/0009-framework-agnostic-client.md))
- [ ] T024 [P] [US1] Teste do ViewModel epidemiológico: top N ordenado por `value`, casos novos vs acumulados como séries separadas com gap filling nas 3 granularidades, mudança de `top` re-deriva sem refetch desnecessário (`queryKey` inclui `top`) — `src/modules/analysis-bi/client/epidemiological-dashboard/epidemiological-dashboard.view-model.test.ts`

### Implementation for User Story 1

- [ ] T025 [P] [US1] Implementar `src/modules/analysis-bi/server/adapters/indicator.schema.ts` (depende de T021)
- [ ] T026 [US1] Handlers Elysia em `src/modules/analysis-bi/server/adapters/demographics.query.fn.ts` (`getDemographics` → `GET /api/v1/indicators/demographics`) e `epidemiological.query.fn.ts` (`getEpidemiological` → `GET /api/v1/indicators/epidemiological?top=N`), ambos atrás do gate RBAC de T014, consumidos via Eden treaty (depende de T013, T014, T025) — [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md)
- [ ] T027 [US1] `client/data`: `indicator.model.ts` (TypeBox) + `indicators.repository.ts` (`Result`; `queryKey` por eixo + filtros; propaga meta de privacidade) em `src/modules/analysis-bi/client/data/` (depende de T026; testes T022 verdes)
- [ ] T028 [P] [US1] Dashboard demográfico: `demographics-dashboard.view-model.ts` (puro) + `demographics-dashboard.binding.ts` (`createAsync`/`query` do `@solidjs/router`) + `demographics-dashboard.page.tsx` (componente Solid: `PopulationPyramid` + `CategoryBarChart` por mesorregião + `SuppressionBanner` + `DashboardFilterBar`) em `src/modules/analysis-bi/client/demographics-dashboard/` ([ADR-0009](../../adr/0009-framework-agnostic-client.md))
- [ ] T029 [P] [US1] Dashboard epidemiológico: `epidemiological-dashboard.view-model.ts` + `binding.ts` + `page.tsx` (`CategoryBarChart` top N CID-10 com `icd_code`/`icd_label`, `TimeSeriesChart` casos novos vs acumulados, `TopNSelect`) em `src/modules/analysis-bi/client/epidemiological-dashboard/`
- [ ] T030 [US1] Visão geral: `overview.view-model.ts` + `page.tsx` (`KpiCards`: total de registros, grupos suprimidos, top diagnóstico; miniaturas dos 2 dashboards) em `src/modules/analysis-bi/client/overview/` (depende de T028, T029)
- [ ] T031 [US1] Testes DOM (`bun:test` + `happy-dom`): `demographics-dashboard.page.test.tsx` (pirâmide renderiza; banner aparece com `suppressed_groups > 0`; período inválido bloqueia consulta), `epidemiological-dashboard.page.test.tsx` (top N; troca de granularidade; 429 → mensagem de retry sem retry automático)
- [ ] T032 [US1] Exportar superfícies da US1 em `src/modules/analysis-bi/public-api/index.ts` e ligar rotas SolidStart `src/routes/analysis-bi/{index,demographics,epidemiological}.tsx` (filtros sincronizados com search params via `createAsync`/`query`)

**Checkpoint**: US1 funcional e testável de ponta a ponta — MVP demonstrável

---

## Phase 4: User Story 2 - Eixos socioeconômico, proteção e cuidado (Priority: P2)

**Goal**: gestor analisa vulnerabilidade socioeconômica (distribuição de renda em 6 faixas de SM, cobertura de benefícios BPC/PBF, insegurança alimentar), proteção (encaminhamentos por destino UPA/CRAS/CREAS, violações de direitos por tipo) e cuidado (atendimentos por tipo, completude de avaliações) sob os mesmos filtros compartilhados da US1.

**Independent Test**: com a Foundational pronta, abrir o dashboard socioeconômico com um período válido → ver a distribuição de renda nas 6 faixas e o top de benefícios → abrir proteção e ver encaminhamentos por destino e violações por tipo → abrir cuidado e ver atendimentos por tipo — cada um com banner de supressão quando aplicável e filtros persistidos entre dashboards.

### Tests for User Story 2 (RED primeiro) ⚠️

- [ ] T033 [P] [US2] Teste de contrato TypeBox: `labels` dos 3 eixos (`socioeconomic`: `income_band`/`mesoregion_name`; `protection`: `violation_type`|`destination`/`mesoregion_name`; `care`: `appointment_type`/`mesoregion_name`) e `top?` em `socioeconomic` — extensão de `src/modules/analysis-bi/server/adapters/indicator.schema.test.ts`
- [ ] T034 [P] [US2] Teste do ViewModel socioeconômico: ordenação fixa das 6 `income_bands` (`0-0.5`, `0.5-1`, `1-2`, `2-3`, `3-5`, `5+` SM), top N de benefícios, formatação monetária via Intl — `src/modules/analysis-bi/client/socioeconomic-dashboard/socioeconomic-dashboard.view-model.test.ts`
- [ ] T035 [P] [US2] Teste dos ViewModels de proteção e cuidado: agrupamento por `violation_type` vs `destination` (proteção) e por `appointment_type` (cuidado); séries temporais com gap filling; banner de supressão — `src/modules/analysis-bi/client/protection-dashboard/protection-dashboard.view-model.test.ts` e `src/modules/analysis-bi/client/care-dashboard/care-dashboard.view-model.test.ts`

### Implementation for User Story 2

- [ ] T036 [US2] Handlers Elysia em `src/modules/analysis-bi/server/adapters/socioeconomic.query.fn.ts` (`getSocioeconomic` → `GET /api/v1/indicators/socioeconomic?top=N`), `protection.query.fn.ts` (`getProtection` → `GET /api/v1/indicators/protection`) e `care.query.fn.ts` (`getCare` → `GET /api/v1/indicators/care`), atrás do gate RBAC (depende de T013, T014, T033) — [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md)
- [ ] T037 [US2] Estender `indicators.repository.ts` com os 3 eixos (`queryKeys` próprios; mesma meta de privacidade) em `src/modules/analysis-bi/client/data/` (depende de T036)
- [ ] T038 [P] [US2] Dashboard socioeconômico: ViewModel + `binding.ts` + `page.tsx` (`IncomeDistributionChart` 6 faixas, `CategoryBarChart` de benefícios, `KpiCard` de insegurança alimentar) em `src/modules/analysis-bi/client/socioeconomic-dashboard/`
- [ ] T039 [P] [US2] Dashboard de proteção: ViewModel + `binding.ts` + `page.tsx` (`CategoryBarChart` encaminhamentos por destino, `CategoryBarChart` violações por tipo, `TimeSeriesChart` de evolução) em `src/modules/analysis-bi/client/protection-dashboard/`
- [ ] T040 [P] [US2] Dashboard de cuidado: ViewModel + `binding.ts` + `page.tsx` (`CategoryBarChart` atendimentos por tipo, `TimeSeriesChart` de evolução, `KpiCard` de completude média de avaliações) em `src/modules/analysis-bi/client/care-dashboard/`
- [ ] T041 [US2] Testes DOM (`bun:test` + `happy-dom`): `socioeconomic-dashboard.page.test.tsx` (6 faixas na ordem fixa; banner), `protection-dashboard.page.test.tsx` e `care-dashboard.page.test.tsx` (render + filtros compartilhados persistem ao navegar entre eixos)
- [ ] T042 [US2] Exportar superfícies da US2 em `public-api/index.ts` e ligar rotas SolidStart `src/routes/analysis-bi/{socioeconomic,protection,care}.tsx`; adicionar os 3 eixos às miniaturas/navegação da visão geral (depende de T030)

**Checkpoint**: US1 e US2 funcionam de forma independente — os 5 eixos navegáveis

---

## Phase 5: User Story 3 - Central de exports em 8 formatos (Priority: P3)

**Goal**: gestor exporta qualquer um dos 5 datasets em qualquer um dos 8 formatos (CSV, JSON, XML, Parquet, DBF/TABWIN, DBC/DataSUS, ODS, FHIR/RNDS) com período e mesorregião, baixando via proxy streaming do BFF (Content-Disposition preservado, K=5 aplicado pelo serviço) — sem nunca ver a URL do `analysis-bi`.

**Independent Test**: abrir a central de exports → ver os 5 datasets (de `GET /metadata/datasets`) e os 8 formatos com nomes amigáveis (de `GET /metadata/formats`) → selecionar `dataset=epidemiological`, `format=csv`, período válido → clicar em exportar e receber o download `acdg-epidemiological-{period}.csv` → repetir com `format=fhir` e conferir o `Content-Type` preservado.

### Tests for User Story 3 (RED primeiro) ⚠️

- [ ] T043 [P] [US3] Teste de contrato TypeBox: `exportQuerySchema` (`format` ∈ 8 valores, `dataset` ∈ 5 valores default `demographics`, `period_start`/`period_end` obrigatórios, `mesoregion?`), `DatasetInfoModel` e `FormatInfoModel` (`name`, `content_type`, `extension`) — `src/modules/analysis-bi/server/adapters/metadata.schema.test.ts`
- [ ] T044 [P] [US3] Teste do handler de export (`*.service.fn.ts`): `export.service.fn.ts` injeta Bearer, repassa o stream do upstream sem bufferizar, preserva `Content-Type` e `Content-Disposition: attachment; filename="acdg-{dataset}-{period}.{ext}"`, mapeia 400/401/429 do upstream para respostas de erro sem vazar URL interna, e aplica o gate RBAC — `src/modules/analysis-bi/server/adapters/export.service.fn.test.ts` ([ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md))
- [ ] T045 [P] [US3] Teste do ViewModel da central: combinação `dataset` × `formato` × `período` só habilita o download quando válida; nomes amigáveis PT-BR (CSV, JSON, XML, Parquet, DBF/TABWIN, DBC/DataSUS, ODS, FHIR/RNDS); monta a URL relativa do proxy com a query certa; emite `export-requested`/`export-completed` no bus — `src/modules/analysis-bi/client/export-center/export-center.view-model.test.ts`

### Implementation for User Story 3

- [ ] T046 [P] [US3] Implementar `src/modules/analysis-bi/server/adapters/metadata.schema.ts` (depende de T043)
- [ ] T047 [US3] Handlers Elysia de metadata em `src/modules/analysis-bi/server/adapters/metadata.query.fn.ts`: `getDatasets` (`GET /api/v1/metadata/datasets`) e `getFormats` (`GET /api/v1/metadata/formats`) (depende de T013, T046)
- [ ] T048 [US3] Proxy streaming de download em `src/modules/analysis-bi/server/adapters/export.service.fn.ts` (rota Elysia `GET` → `GET /api/v1/export/{format}`; valida `exportQuerySchema`; stream pass-through) (depende de T013, T014, T044, T046)
- [ ] T049 [US3] `client/data`: `metadata.model.ts` + `metadata.repository.ts` (`Result`; cache longo via `createAsync` com `query` do `@solidjs/router` — metadata é estática) em `src/modules/analysis-bi/client/data/` (depende de T047)
- [ ] T050 [US3] Central de exports: `export-center.view-model.ts` + `binding.ts` + `page.tsx` (`ExportCenterForm` com `FormatBadges`, `PeriodRangePicker`, `MesoregionSelect`; download via âncora para `export.service.fn.ts`; feedback de export iniciado) em `src/modules/analysis-bi/client/export-center/` (depende de T048, T049)
- [ ] T051 [US3] Testes DOM (`bun:test` + `happy-dom`): `export-center.page.test.tsx` (8 formatos listados com nomes amigáveis; botão desabilitado com período inválido; clique gera href do proxy com query correta; nenhuma URL do serviço no DOM)
- [ ] T052 [US3] Exportar superfícies da US3 em `public-api/index.ts` e ligar rota SolidStart `src/routes/analysis-bi/export.tsx`; CTA "Exportar este dataset" nos 5 dashboards pré-preenchendo `dataset`/`período` da tela atual (depende de T032, T042)

**Checkpoint**: todas as user stories funcionais de forma independente

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: melhorias que atravessam as user stories

- [ ] T053 [P] Catálogo i18n pt-BR completo: 1 tag por `AppError.kind` (`validation`, `unauthorized`, `forbidden`, `notFound`, `rateLimited`, `serviceUnavailable`) + textos do banner de supressão e dos estados vazios em `src/modules/analysis-bi/client/domain/error-messages.ts`
- [ ] T054 [P] Acessibilidade dos gráficos: alternativa tabular (`<table>` visually-hidden ou toggle "ver como tabela") para `PopulationPyramid`/`TimeSeriesChart`/`CategoryBarChart`, `aria-labels`, navegação por teclado nos filtros, contraste das séries via tokens vanilla-extract (ver `design-tokens.fe.md`) — [ADR-0007](../../adr/0007-design-system-vanilla-extract.md)
- [ ] T055 Performance: `staleTime` adequado por `queryKey` via `createAsync`/`query` do `@solidjs/router` (indicadores mudam no máximo mensalmente — cache agressivo), prefetch dos eixos vizinhos a partir da visão geral; verificação dos goals (dashboard p95 < 1,5 s; troca de filtro < 1 s) em `metrics.fe.md`
- [ ] T056 [P] Testes adicionais de regressão (`bun:test`): 429 em rajada (mensagem única, sem tempestade de retry), série 100% suprimida (`EmptyStateCard` "tudo suprimido" + banner), período de 1 mês (série de ponto único), granularidade `yearly` atravessando anos
- [ ] T057 Hardening de segurança: confirmar que nenhum bundle client importa de `server/` (governance tests de boundaries), que `ANALYSIS_BI_API_URL` e token nunca aparecem no payload SSR nem no DOM da central de exports, que o gate RBAC cobre as 8 superfícies (5 eixos + export + 2 metadata) e que nenhum payload contém PII (só agregados) — [ADR-0006](../../adr/0006-security-headers-csp.md)
- [ ] T058 Atualizar docs irmãos: refletir contrato final em `api-readiness.fe.md` (status dos pedidos HIGH-001/HIGH-003/regions) e registrar decisões tomadas (biblioteca de gráficos, lookup local de mesorregiões, RBAC no BFF, export via handler Elysia) em [tasks.md](./tasks.md)/ADRs locais

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências — começa imediatamente
- **Foundational (Phase 2)**: depende do Setup — BLOQUEIA todas as user stories
- **User Stories (Phases 3–5)**: todas dependem da Foundational
  - Podem prosseguir em paralelo (se houver equipe)
  - Ou sequencialmente por prioridade (P1 → P2 → P3)
- **Polish (Phase 6)**: depende das user stories desejadas estarem completas

### User Story Dependencies

- **US1 (P1)**: começa após Foundational — sem dependência de outras stories
- **US2 (P2)**: começa após Foundational — reusa filtros compartilhados (T020) e repositório (T027/US1 estendido em T037), mas seus handlers, view-models e páginas são testáveis isoladamente
- **US3 (P3)**: começa após Foundational — o CTA de export nos dashboards (T052) integra com US1/US2, mas a central é testável isoladamente

### Within Each User Story

- Testes (RED) escritos e falhando ANTES da implementação
- Schemas TypeBox antes de handlers Elysia; handlers antes de repositories; repositories antes de view-models; view-models antes de bindings/pages
- Implementação central antes da integração na visão geral/navegação
- Story completa antes de avançar para a próxima prioridade

### Parallel Opportunities

- T003/T004/T005 (Setup) em paralelo
- Na Foundational: T007/T009/T011/T015–T019 em paralelo após T006
- Concluída a Foundational, US1/US2/US3 podem rodar em paralelo por pessoas diferentes
- Dentro de cada story, todas as tasks de teste [P] em paralelo; dashboards de eixos distintos [P] em paralelo (arquivos distintos)

---

## Parallel Example: User Story 1

```bash
# Disparar todos os testes RED da US1 juntos (bun:test):
Task: "Contrato TypeBox dos indicadores em src/modules/analysis-bi/server/adapters/indicator.schema.test.ts"
Task: "Repositório de indicadores em src/modules/analysis-bi/client/data/indicators.repository.test.ts"
Task: "ViewModel demográfico em src/modules/analysis-bi/client/demographics-dashboard/demographics-dashboard.view-model.test.ts"
Task: "ViewModel epidemiológico em src/modules/analysis-bi/client/epidemiological-dashboard/epidemiological-dashboard.view-model.test.ts"

# Depois, dashboards independentes em paralelo:
Task: "Dashboard demográfico em src/modules/analysis-bi/client/demographics-dashboard/"
Task: "Dashboard epidemiológico em src/modules/analysis-bi/client/epidemiological-dashboard/"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (CRÍTICO — bloqueia tudo; inclui gate RBAC e gap filling)
3. Completar Phase 3: US1 — dashboards demográfico + epidemiológico
4. **PARAR e VALIDAR**: testar US1 de forma independente (pirâmide etária → troca de granularidade → top N CID-10 → banner de supressão)
5. Deploy/demo se pronto

### Incremental Delivery

1. Setup + Foundational → fundação pronta
2. US1 → testar → deploy/demo (MVP: visão demográfica + epidemiológica operacional)
3. US2 → testar → deploy/demo (5 eixos completos)
4. US3 → testar → deploy/demo (central de exports nos 8 formatos)
5. Cada story agrega valor sem quebrar as anteriores

### Parallel Team Strategy

Com mais de um dev:

1. Time completa Setup + Foundational junto
2. Depois da Foundational:
   - Dev A: US1 (demográfico + epidemiológico)
   - Dev B: US2 (socioeconômico + proteção + cuidado)
   - Dev C: US3 (central de exports)
3. Stories completam e integram na visão geral/navegação de forma independente

---

## Notes

- [P] = arquivos diferentes, sem dependências entre si
- [Story] mapeia a task à user story para rastreabilidade
- Cada user story deve ser completável e testável de forma independente
- Verificar que os testes falham (RED) antes de implementar (`bun test` deve retornar falha)
- Commit após cada task ou grupo lógico (Conventional Commits, no repo `web_02/`)
- Parar em qualquer checkpoint para validar a story isoladamente
- Evitar: tasks vagas, conflitos no mesmo arquivo, dependências cross-story que quebrem a independência
- Lembrete transversal: `suppressed_groups > 0` é SUCESSO com banner obrigatório — nunca tratar como erro; nenhum payload do `analysis-bi` contém PII

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípios I–VI (lei de mais alto nível)
- [ADR-0001 — Vertical Modular Architecture](../../adr/0001-vertical-modular-architecture.md) — slice vertical; `public-api` como único import externo; governance tests de boundaries
- [ADR-0002 — Errors as Values](../../adr/0002-errors-as-values.md) — `Result<T,E>`; sem `throw`; branded types
- [ADR-0003 — Bun supply chain](../../adr/0003-bun-supply-chain.md) — `bun add`, `bun:test`, `bun run build`; supply-chain hardening
- [ADR-0004 — Client-Server Split MVVM/DDD](../../adr/0004-client-server-split-mvvm-ddd.md) — fronteira Eden treaty → rota Elysia; ViewModel puro
- [ADR-0005 — Auth/session/refresh](../../adr/0005-auth-session-refresh-decisions.md) — cookie HttpOnly; Bearer só no servidor
- [ADR-0006 — Security headers & CSP](../../adr/0006-security-headers-csp.md) — Elysia middleware + SolidStart
- [ADR-0007 — vanilla-extract design system](../../adr/0007-design-system-vanilla-extract.md) — tokens dataviz; `.css.ts`; zero hex cru
- [ADR-0009 — Framework-agnostic client](../../adr/0009-framework-agnostic-client.md) — ViewModel sem `solid-js`; binding Solid
- [ADR-0010 — BFF Elysia fn naming](../../adr/0010-bff-orchestration-fn-naming.md) — `*.query.fn.ts` / `*.service.fn.ts`; Eden treaty
- [ADR-0011 — No mocks in production](../../adr/0011-no-mocks-in-production.md) — fakes/in-memory; `not-implemented` como valor
- [ADR-README](../../adr/README.md) — tabela de substituições completa
- Docs irmãos: [bdd.md](./bdd.md) · [tdd.md](./tdd.md) · [qa-test-plan.md](./qa-test-plan.md) · [checklist.md](./checklist.md) · [review.md](./review.md)
- Referência offline: `../../reference/framework/elysia/` · `../../reference/framework/solidstart/` · `../../reference/runtime/bun/` · `../../reference/ui/vanilla-extract/` · `../../reference/ui/gsap/`
