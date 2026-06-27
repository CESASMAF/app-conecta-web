# Implementation Plan: Dashboards Web Analysis-BI (front + BFF)

**Branch**: `003-analysis-bi-web` | **Date**: 2026-06-12 | **Spec**: [spec.fe.md](./spec.fe.md)

**Input**: Feature specification em `web_02/handbook/doc/analysis-bi/spec.fe.md`

## Summary

Dashboards web dos indicadores agregados e anonimizados do ecossistema ACDG: 5 eixos analíticos (demográfico, epidemiológico, socioeconômico, proteção e cuidado) com filtros de período (`YYYY-MM` start/end), granularidade (mensal/trimestral/anual) e mesorregião IBGE, mais uma central de exports em 8 formatos (CSV, JSON, XML, Parquet, DBF/TABWIN, DBC/DataSUS, ODS, FHIR/RNDS) — tudo consumindo a API do `analysis-bi` exclusivamente através do BFF (Elysia). O browser nunca vê token nem URL de backend — toda chamada outbound sai de handlers Elysia (`*.query.fn.ts`) que injetam `Authorization: Bearer <jwt>` e validam input/output com TypeBox (`Elysia.t`) na borda; o tipo flui ao client via Eden Treaty sem redeclaração. O download de export é **proxy streaming** pelo BFF (preserva `Content-Disposition`). Como o serviço não tem RBAC (HIGH-003), o BFF aplica gate de role como mitigação. Quando `meta.suppressed_groups > 0`, a UI exibe obrigatoriamente o aviso de supressão por privacidade (K=5). Prontidão do contrato em [api-readiness.fe.md](./api-readiness.fe.md); tasks em [tasks.md](./tasks.md).

## Technical Context

**Language/Version**: TypeScript estrito (`strict`, `noImplicitAny`, `tsc --noEmit` limpo é gate)
**Runtime + PM**: **Bun** (runtime / `bun install` / `bun.lock` / `bun test` / `bun build`) — [ADR-0003](../../adr/0003-bun-supply-chain.md)
**Meta-framework**: **SolidStart** (Solid · Vinxi · Nitro preset `bun`) · rotas file-based em `src/routes/`
**BFF**: **Elysia** montado em `src/routes/api/[...path].ts` (catch-all → `app.fetch`) — [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md)
**Client ↔ BFF**: **Eden Treaty** (type-safe, isomórfico no SSR); type do schema flui do Elysia ao client sem redeclarar Model — [ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md), [ADR-0005 Princípio V](../../../.specify/memory/constitution.md)
**Server-state**: **Solid nativo** — `createAsync` / `query` / `action` / `useSubmission` do `@solidjs/router` — [ADR-0002](../../adr/0002-errors-as-values.md), [ADR-0009](../../adr/0009-framework-agnostic-client.md)
**Validação**: **TypeBox** (`Elysia.t`, incluído no Elysia) — [ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md)
**UI**: **Solid** (JSX do Solid) · **Gráficos**: visx (módulos `@visx/scale`, `@visx/shape`, `@visx/axis`, `@visx/group` — views burras, sem estado) · **Estilo**: vanilla-extract (CSS-in-TS zero-runtime) — [ADR-0007](../../adr/0007-design-system-vanilla-extract.md)
**Testes**: **`bun:test`** (puro: domain / application / view-model / data) + **`bun:test` + happy-dom** (DOM: page / component / binding); fakes/in-memory no lugar de MSW — [ADR-0011](../../adr/0011-no-mocks-in-production.md)
**Storage**: N/A no front — estado remoto via `createAsync`/`query`; sessão/token server-only (cookie `HttpOnly` + Elysia middleware)
**Target Platform**: navegador moderno + BFF Bun (Nitro preset `bun`), atrás do Caddy na VPS ACDG-BV
**Project Type**: web app (front + BFF unificado, módulos verticais)
**Performance Goals**: dashboard de um eixo renderizado p95 < 1,5 s @ 12 meses de série (payload < 1000 rows, sem paginação); troca de filtro (período/granularidade/mesorregião) < 1 s com cache aquecido; início do download de export < 2 s (streaming, sem buffer integral no BFF)
**Constraints**: token e `ANALYSIS_BI_API_URL` nunca no browser (Princípio I); UI nunca lê status HTTP (só `AppError.kind`); aviso de supressão **obrigatório** quando `suppressed_groups > 0`; séries esparsas preenchidas no client (períodos sem dados não vêm da API); nenhum drill-down individual existe (só agregados — nenhuma PII em payload algum); RBAC aplicado no BFF enquanto HIGH-003 não é corrigido; 429 do rate limit global tratado com mensagem de retry, sem retry automático agressivo
**Scale/Scope**: ~7 telas (visão geral + 5 dashboards de eixo + central de exports) · 8 rotas/handlers Elysia (5 eixos + export + 2 metadata) · 1 agregado de leitura (IndicatorSeries) · 8 formatos de export

## Constitution Check

*GATE: passar antes da Fase 0. Re-checar após a Fase 1.* Constituição [web_02](../../../.specify/memory/constitution.md) · ADRs em [../../adr/README.md](../../adr/README.md).

| Princípio | Aderência | Nota |
|---|---|---|
| I. BFF-Orchestrated Boundary | ✓ | browser só fala com handlers Elysia em `server/adapters/*.query.fn.ts`; Bearer injetado pelo BFF; `ANALYSIS_BI_API_URL` server-only; export baixado via proxy streaming do BFF (nunca URL direta do serviço); gate de role no BFF mitiga HIGH-003 — [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md) |
| II. Errors as Values | ✓ | `Result<T,E>` em domain/application/data; `throw` só na borda do handler Elysia; `AppError` é o único valor de erro que chega à UI via Eden `{ data, error }`; `suppressed_groups > 0` NÃO é erro — é metadado de sucesso que liga o banner — [ADR-0002](../../adr/0002-errors-as-values.md) |
| III. Vertical-Modular · Client (MVVM) × Server (DDD) | ✓ | módulo vertical `src/modules/analysis-bi/`; cross-módulo (ex.: `auth`) só via `public-api`; governance tests em `bun:test` substituem eslint-plugin-boundaries — [ADR-0001](../../adr/0001-vertical-modular-architecture.md), [ADR-0009](../../adr/0009-framework-agnostic-client.md) |
| IV. Bun-Native / Zero-NPM-Utility | ✓ | runtime Bun; `bun:test` (não node:test); Bun como PM (`bun install`, `bun.lock`); happy-dom em vez de jsdom/Vitest; fakes/in-memory em vez de MSW; sem pnpm — [ADR-0003](../../adr/0003-bun-supply-chain.md) |
| V. Strict TS & End-to-End Type Safety | ✓ | `tsc --noEmit` limpo é gate; TypeBox (`Elysia.t`) valida input/output na borda do BFF; Eden propaga o tipo ao client sem redeclarar Model; branded types (`YearMonth`, `MesoregionCode`, `TopN`, etc.) sem `any` implícito — [ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md) |
| VI. Honesty in Production (No Mocks) | ✓ | sem MSW em `src/`; fakes/in-memory só em `tests/`; `suppressed_groups > 0` exibe aviso real; gaps preenchidos com zero/nulo explícito, nunca interpolado — [ADR-0011](../../adr/0011-no-mocks-in-production.md) |

*(Princípios IV "Illegal States Unrepresentable", V "Server-State ≠ UI-State" e XI "Framework-Agnostic" do stack anterior foram consolidados acima nos Princípios III, V e VI da nova constituição.)*

## Project Structure

### Documentation (this feature)

```text
web_02/handbook/doc/analysis-bi/
├── discovery.fe.md           # Fase 0 (elicitação)
├── spec.fe.md                # o quê
├── api-readiness.fe.md       # prontidão do contrato analysis-bi (5 eixos + 8 formatos + metadata + health)
├── domain.fe.md              # eixos/indicadores/KPIs vistos pelo front
├── adr.fe.md                 # decisões frontend desta feature
├── metrics.fe.md             # NFRs
├── plan.md                   # visão core-api do contrato
├── plan.fe.md                # este arquivo
├── tasks.md                  # tasks por user story
└── design-tokens.fe.md       # tokens (Atomic Design 00-interface-inventory … 07-governance)
```

### Source Code (módulo vertical — espelha `auth`/`contracts`)

```text
src/modules/analysis-bi/
├── server/                                  # BFF · DDD · onde o token vive
│   ├── domain/                              #   PURO: branded VOs (YearMonth, PeriodRange, Granularity,
│   │   │                                    #   MesoregionCode, Axis, Dataset, ExportFormat, TopN),
│   │   │                                    #   Result, errors (AppError por status HTTP), ports
│   │   ├── indicators.ts · errors.ts · ports.ts
│   ├── application/                         #   use-cases (queries) — sem throw
│   │   ├── get-indicators.ts                #   parametrizado por eixo (demographics…care)
│   │   ├── export-dataset.ts                #   valida formato/dataset e delega o stream
│   │   └── get-metadata.ts                  #   datasets + formats
│   └── adapters/                            #   ★ fronteira
│       ├── analysis-bi.client.ts            #   HTTP client → analysis-bi (Bearer + envelope + AppError por status)
│       ├── envelope.schema.ts               #   TypeBox: { data, meta: { k_threshold, suppressed_groups, total_records, period } } / erro { data: { error, status, message } }
│       ├── indicator.schema.ts · metadata.schema.ts
│       ├── demographics.query.fn.ts         #   getDemographics  → GET /api/v1/indicators/demographics
│       ├── epidemiological.query.fn.ts      #   getEpidemiological (com top N)
│       ├── socioeconomic.query.fn.ts        #   getSocioeconomic (com top N)
│       ├── protection.query.fn.ts           #   getProtection
│       ├── care.query.fn.ts                 #   getCare
│       ├── metadata.query.fn.ts             #   getDatasets + getFormats
│       └── export.route.ts                  #   ★ proxy streaming de download (rota Elysia GET, não handler JSON)
├── client/                                  # FRONT · MVVM · agnóstico (ADR-0009) — feature-first FLAT
│   ├── data/                                #   indicator.model.ts, metadata.model.ts (TypeBox) + indicators.repository.ts
│   │   │                                    #   + mesoregion-lookup.ts (porta: hardcode IBGE → futura metadata/regions) + events/
│   ├── domain/                              #   PURO: series.ts (gap filling 3 granularidades), pyramid.ts (espelha age_band × sex),
│   │   │                                    #   format.ts (Intl pt-BR: "2025-03" ↔ "mar/2025", "2025-Q1" ↔ "1º tri 2025")
│   ├── overview/                            #   visão geral (KPIs + miniaturas demográfico/epidemiológico)
│   ├── demographics-dashboard/              #   *.view-model.ts (puro) + *.binding.ts + *.page.tsx Solid (pirâmide etária, sexo, geografia)
│   ├── epidemiological-dashboard/           #   top N CID-10, casos novos vs acumulados
│   ├── socioeconomic-dashboard/             #   renda (6 faixas SM), benefícios, insegurança alimentar
│   ├── protection-dashboard/               #   encaminhamentos por destino, violações por tipo
│   ├── care-dashboard/                      #   atendimentos por tipo, completude de avaliações
│   ├── filters/                             #   filtros compartilhados (período/granularidade/mesorregião) + view-model + reducer puro
│   └── export-center/                       #   central de exports (dataset × formato × período) + *.view-model + page
└── public-api/index.ts                      # ★ único import externo
```

**Structure Decision**: módulo vertical único `src/modules/analysis-bi/` espelhando os módulos `auth`/`people-context` já planejados; cada eixo vira um par schema+handler dedicado em `server/adapters/` (5 `*.query.fn.ts` de eixo + 1 `*.query.fn.ts` duplo de metadata) — nomenclatura conforme [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md) (`*.query.fn.ts` para leitura, `*.service.fn.ts` para escrita). O export vira **rota Elysia** (`export.route.ts`) porque download de attachment exige `Response` streamada navegável por `<a href>`, não payload JSON de handler comum. Os dashboards do client agrupam-se por comportamento (camada = sufixo do arquivo), compartilhando os filtros via `client/filters/` + event bus. Rotas SolidStart em `src/routes/analysis-bi/` importam apenas de `public-api/index.ts`.

## Rotas Elysia & Contratos do BFF *(a fronteira — Princípio I)*

Handlers Elysia em `src/routes/api/[...path].ts`, consumidos via **Eden Treaty** pelo client.

| Handler (`*.query.fn.ts`) | Tipo | Input (TypeBox / `Elysia.t`) | Output | core-api consumido |
|---|---|---|---|---|
| `getDemographics` | query | `indicatorsQuerySchema` (period_start/period_end `YYYY-MM` obrigatórios, mesoregion?, granularity `monthly\|quarterly\|yearly` default monthly) | `Result`→ `{ items: IndicatorItem[] (labels: age_band, sex, mesoregion_name), meta: PrivacyMeta }` | `GET /api/v1/indicators/demographics` |
| `getEpidemiological` | query | `indicatorsQuerySchema` + `top?` (int ≥ 1) | `Result`→ `{ items (labels: icd_code, icd_label), meta }` — top N diagnósticos, casos novos vs total | `GET /api/v1/indicators/epidemiological` |
| `getSocioeconomic` | query | `indicatorsQuerySchema` + `top?` | `Result`→ `{ items (labels: income_band, mesoregion_name), meta }` | `GET /api/v1/indicators/socioeconomic` |
| `getProtection` | query | `indicatorsQuerySchema` | `Result`→ `{ items (labels: violation_type \| destination, mesoregion_name), meta }` | `GET /api/v1/indicators/protection` |
| `getCare` | query | `indicatorsQuerySchema` | `Result`→ `{ items (labels: appointment_type, mesoregion_name), meta }` | `GET /api/v1/indicators/care` |
| `getDatasets` | query | — (sem input) | `Result`→ `DatasetInfo[]` (5 datasets com descrição) | `GET /api/v1/metadata/datasets` |
| `getFormats` | query | — (sem input) | `Result`→ `FormatInfo[]` (8 formatos: name, content_type, extension) | `GET /api/v1/metadata/formats` |
| `exportDataset` (`export.route.ts`) | rota Elysia (Response stream) | `exportQuerySchema` (format `csv\|json\|xml\|parquet\|dbf\|dbc\|ods\|fhir`, dataset default `demographics`, period_start/period_end obrigatórios, mesoregion?) | `Response` streamada com `Content-Disposition: attachment; filename="acdg-{dataset}-{period}.{ext}"` e Content-Type preservados do upstream | `GET /api/v1/export/{format}` |

- **Cadeia de erro** (Princípios II/V): analysis-bi 4xx/5xx → `resultFetch` → `HttpError` → `mapToServerResponse` → handler Elysia devolve `{ data: null, error: AppError }` via Eden `{ data, error }` → `switch` em `AppError.kind` → tag i18n. A UI nunca olha status HTTP. Como o serviço **não tem códigos estruturados** (gap registrado em [api-readiness.fe.md](./api-readiness.fe.md)), o mapeamento é por status: 400 → `validation` (mensagem do serviço preservada em `AppError.detail` só para log, nunca exibida crua); 401 → `unauthorized` (BFF redireciona para re-login); 403 → `forbidden` (hoje gerado pelo **gate do BFF**, já que o RBAC do serviço é placeholder — HIGH-003); 404 → `notFound` (eixo desconhecido = bug do BFF); 429 → `rateLimited` (mensagem "Muitas requisições — aguarde alguns segundos", sem retry automático); 500/503 → `serviceUnavailable`; 501 (metadata/regions) nunca é chamado — a lookup de mesorregiões é local. **`suppressed_groups > 0` não entra na cadeia de erro**: é sucesso com banner de supressão obrigatório ("N grupos suprimidos por privacidade — K-anonimato K=5").

## Integração core-api *(prontidão)*

Resumo de [api-readiness.fe.md](./api-readiness.fe.md). Ponto de troca = repository (`client/data`) / client (`server/adapters`).

| Capacidade | Prontidão | Estratégia Fase 1 |
|---|---|---|
| Indicadores — 5 eixos com período/granularidade/mesorregião/top | 🟢 | integrar real; gap filling de séries esparsas no client; banner de supressão quando `suppressed_groups > 0` |
| Export — 8 formatos com K=5 e Content-Disposition | 🟢 | integrar real via proxy streaming no BFF (`export.route.ts`) |
| Metadata — datasets e formats | 🟢 | integrar real; nomes amigáveis PT-BR mapeados no client (CSV, JSON, XML, Parquet, DBF/TABWIN, DBC/DataSUS, ODS, FHIR/RNDS) |
| Metadata — regions (opções do filtro de mesorregião) | 🔴 | lookup própria hardcoded (subset de `configs/ibge_mesoregions.csv`, foco RR/Norte) atrás da porta `mesoregion-lookup.ts`; trocar pelo endpoint quando sair do 501 |
| RBAC no serviço | 🔴 | gate de role no BFF (claim `groups` da sessão Authentik) antes de toda chamada — mitigação do HIGH-003 |
| Códigos de erro estruturados (`ANA-XXX`) | 🔴 | mapeamento por status HTTP no `analysis-bi.client.ts`; troca trivial quando os códigos existirem |
| Validação iss/aud no serviço (HIGH-001) | 🔴 | fora do alcance do front — rede interna Docker + pedido P1; nenhum workaround no BFF |
| Paginação | 🟡 | inexistente por design (payloads < 1000 rows); tratar payload completo no client, sem scroll infinito |

## Design System Impact *(Atomic Design — [ADR-0007](../../adr/0007-design-system-vanilla-extract.md), design-system só-tokens)*

- **Biblioteca de gráficos (decisão)**: **visx** (Airbnb) — pacotes modulares instalados individualmente (`@visx/scale`, `@visx/shape`, `@visx/axis`, `@visx/group`), tree-shakeable e **unstyled por padrão**: renderiza SVG cru e deixa 100% do estilo para os tokens vanilla-extract (`vars.*`), sem CSS runtime — o único caminho compatível com o design system só-tokens ([ADR-0007](../../adr/0007-design-system-vanilla-extract.md)) e com o Princípio IV (zero utilitário npm desnecessário). Alternativas rejeitadas: **Recharts** (estilos/temas próprios difíceis de subordinar aos tokens, bundle maior, composição menos flexível para a pirâmide etária espelhada); **ECharts/Chart.js** (canvas imperativo, bundle grande, tema próprio, pior acessibilidade SVG); **SVG manual sem lib** (rejeitado pelo custo de reimplementar escalas/eixos/band scales corretamente para 3 granularidades — `@visx/scale` é um wrapper fino de `d3-scale`, que é exatamente essa primitiva). visx é agnóstico de framework de UI — os gráficos são **views burras** (Princípio III — MVVM) com todo cálculo de série/gap/topN vivendo em view-models puros testáveis sem DOM.
- **Tokens**: usa os existentes de `shared/ui/tokens` ([design-tokens.fe.md](./design-tokens.fe.md)); paleta categórica de gráficos e tons de severidade (`alert.info/warning`) derivados de tokens semânticos vanilla-extract — proibido hex/px cru em `ui/`; cores de série sempre via token (inclusive a dupla masculino/feminino da pirâmide).
- **Átomos/Moléculas novos**: `KpiCard` (valor + variação + rótulo); `SuppressionBanner` ("N grupos suprimidos por privacidade — K-anonimato K=5", obrigatório quando `suppressed_groups > 0`); `PeriodRangePicker` (par de inputs `YYYY-MM` com validação start ≤ end); `GranularitySelect` (mensal/trimestral/anual); `MesoregionSelect` (lookup local IBGE, com aviso de fonte provisória); `TopNSelect` (epidemiológico/socioeconômico); `FormatBadge` (nome amigável + extensão do formato de export).
- **Organismos**: `TimeSeriesChart` (linha/área com gaps preenchidos e marcação de período vazio); `CategoryBarChart` (barras horizontais para top N CID-10, destinos, tipos de violação/atendimento); `PopulationPyramid` (pirâmide etária espelhada age_band × sex); `IncomeDistributionChart` (6 faixas de SM); `DashboardFilterBar` (período + granularidade + mesorregião + topN compartilhados); `ExportCenterForm` (dataset × formato × período com download via `export.route.ts`); `EmptyStateCard` (sem dados no período ou tudo suprimido pelo K=5 — distingue os dois casos).
- **Templates/Pages**: visão geral (KPIs + 2 miniaturas); 5 páginas de dashboard (uma por eixo) sob filtro compartilhado; central de exports.

## Data Model (client × server)

- **server/domain**: VOs branded `YearMonth` (`YYYY-MM`, mês 01–12), `PeriodRange` (start ≤ end), `Granularity`/`Axis`/`Dataset`/`ExportFormat` (unions + `as const`), `MesoregionCode`, `TopN` (int ≥ 1); `IndicatorItem` `{ labels: Record<string, string>, value: number, period: string }` com refinamento de labels por eixo; `PrivacyMeta` `{ kThreshold: 5, suppressedGroups, totalRecords, period }`; invariantes replicadas como pré-condições de UX (`top` só oferecido em epidemiological/socioeconomic; granularity default monthly) — o serviço continua sendo a autoridade.
- **client/data Model**: TypeBox do retorno do BFF — `IndicatorSeriesModel` (items + meta de privacidade), `DatasetInfoModel`, `FormatInfoModel`; tipo flui via Eden Treaty sem redeclaração; derivados puros em `client/domain`: `FilledSeries` (série com gaps preenchidos — pontos sintéticos marcados `synthetic: true` para o tooltip distinguir "zero real" de "sem dado/suprimido"), `PyramidRow` (age_band × {male, female}), `TopNEntry`.
- Detalhe em [domain.fe.md](./domain.fe.md).

## Plano de Testes (TDD)

- **Puro (`bun:test`, imports relativos)**: domain (VOs `YearMonth`/`PeriodRange`, enumeração de períodos nas 3 granularidades, **gap filling** de séries esparsas com pontos sintéticos, espelhamento da pirâmide, top N), application (use-cases com fakes do client HTTP — meta de privacidade propagada; gate de role negando antes do fetch), view-model (filtros compartilhados start ≤ end, troca de granularidade re-deriva a série, banner ligado por `suppressed_groups > 0`, estado vazio "tudo suprimido" vs "sem dados", regras da central de export — formato × dataset × período válidos antes de habilitar o download), data (repository → handler fake; parsing dos models TypeBox; lookup de mesorregião).
- **DOM (`bun:test` + happy-dom, aliases ok)**: `demographics-dashboard.page` (pirâmide renderiza + banner de supressão), `epidemiological-dashboard.page` (top N + casos novos vs total), `filters.component` (período inválido bloqueia consulta; 429 → mensagem de retry), `export-center.page` (8 formatos com nomes amigáveis; clique gera link para `export.route.ts` com query certa; nunca expõe URL do serviço).
- **Governance tests (`bun:test`)**: boundaries de módulo (nenhum cross-módulo fora de `public-api`), núcleo client sem `@solidjs/*`/`solid-js`, `no-mocks-in-src` — em `tests/architecture/` conforme [ADR-0001](../../adr/0001-vertical-modular-architecture.md) e [ADR-0011](../../adr/0011-no-mocks-in-production.md).
- **Escreva o teste antes** (Spec-Driven). Suites que falham primeiro (RED): `envelope.schema.test.ts`, `analysis-bi.client.test.ts`, `indicators.repository.test.ts`, `series.test.ts` — mesmas do W0 em [plan.md](./plan.md).

## Complexity Tracking

| Violação | Por que necessária | Alternativa simples rejeitada porque |
|---|---|---|
| Export como rota Elysia (Response stream) em vez de handler JSON | Download de attachment precisa de navegação/`<a href>` com `Content-Disposition` e streaming (Parquet/FHIR podem ser grandes; BFF com RAM limitada na VPS de 8 GB não deve bufferizar) | Handler devolvendo base64/Blob JSON foi rejeitado: dobra memória, perde streaming e quebra o nome de arquivo do `Content-Disposition` do upstream |
| Gate de RBAC duplicado no BFF | O serviço não enforça role (HIGH-003 — `role_guard.go` placeholder); sem o gate, qualquer sessão autenticada veria todos os indicadores | Esperar o fix do serviço bloquearia a feature; o gate vive num único ponto (`server/application`) e será removido quando o RBAC real existir — UI/ViewModel intocados |
| Lookup local de mesorregiões IBGE | `GET /api/v1/metadata/regions` retorna vazio/501 na v1 — o filtro de mesorregião ficaria sem opções | Remover o filtro empobrece os 5 dashboards; a lookup vive atrás da porta `mesoregion-lookup.ts` e a troca pelo endpoint real não toca UI/ViewModel |

## Referências

- [spec.fe.md](./spec.fe.md) — especificação frontend desta feature
- [spec.md](./spec.md) — especificação do contrato core-api (`svc-analysis-bi`)
- [plan.md](./plan.md) — plano de consumo do contrato (visão core-api)
- [api-readiness.fe.md](./api-readiness.fe.md) — prontidão endpoint a endpoint
- [domain.fe.md](./domain.fe.md) — modelo de domínio client
- [design-tokens.fe.md](./design-tokens.fe.md) — tokens do design system (vanilla-extract)
- [tasks.md](./tasks.md) — tasks por user story
- [../README.md](../README.md) — doc de integração cross-serviço
- [../../adr/README.md](../../adr/README.md) — índice de ADRs web_02
- [../../adr/0001-vertical-modular-architecture.md](../../adr/0001-vertical-modular-architecture.md) — arquitetura vertical-modular
- [../../adr/0002-errors-as-values.md](../../adr/0002-errors-as-values.md) — erros como valores
- [../../adr/0003-bun-supply-chain.md](../../adr/0003-bun-supply-chain.md) — Bun supply-chain
- [../../adr/0004-client-server-split-mvvm-ddd.md](../../adr/0004-client-server-split-mvvm-ddd.md) — split client (MVVM) × server (DDD)
- [../../adr/0007-design-system-vanilla-extract.md](../../adr/0007-design-system-vanilla-extract.md) — vanilla-extract
- [../../adr/0009-framework-agnostic-client.md](../../adr/0009-framework-agnostic-client.md) — ViewModel puro + binding Solid
- [../../adr/0010-bff-orchestration-fn-naming.md](../../adr/0010-bff-orchestration-fn-naming.md) — nomenclatura `*.query.fn.ts`
- [../../adr/0011-no-mocks-in-production.md](../../adr/0011-no-mocks-in-production.md) — sem mocks em produção
- [../../../.specify/memory/constitution.md](../../../.specify/memory/constitution.md) — constituição web_02
- [../../reference/runtime/bun/](../../reference/runtime/bun/) — docs offline Bun
- [../../reference/framework/elysia/](../../reference/framework/elysia/) — docs offline Elysia
- [../../reference/framework/solidstart/](../../reference/framework/solidstart/) — docs offline SolidStart
- [../../reference/ui/vanilla-extract/](../../reference/ui/vanilla-extract/) — docs offline vanilla-extract
