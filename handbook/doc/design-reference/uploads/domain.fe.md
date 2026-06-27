# Modelo de Domínio: Analysis BI Web

**Feature**: `specs/003-analysis-bi-web/` · **Consultor**: `/acdg-skills:ddd-architect`

> Fase de modelagem (frontend, máximo rigor). No web-app o domínio vive no **`server/`** (BFF, DDD):
> agregados, value-objects branded, errors-como-valor. O **`client/`** consome um **Model** (TypeBox)
> já normalizado pelo BFF — não reimplementa regra de negócio. Cada decisão de
> fronteira/agregado exige **citação canônica ≥4 linhas** (Evans/Vernon) via `skills_citar`.
> O domínio CORE (backend Go) está mapeado em [domain.md](./domain.md); contratos em
> [api-readiness.fe.md](./api-readiness.fe.md); requisitos em `spec.fe.md`; plano técnico em
> `plan.fe.md`.

## Bounded Context (módulo vertical)

- **Módulo**: `src/modules/analysis-bi/` (na convenção [ADR-0001 web_02](../../adr/0001-vertical-modular-architecture.md):
  `src/modules/analysis-bi/{server,client,public-api}/`) — fronteira de import enforçada por
  **governance tests em `bun:test`** (varrem `src/` — [ADR-0001](../../adr/0001-vertical-modular-architecture.md));
  cross-módulo só via `public-api` (`index.ts`).
- **Relação com outros módulos**: **downstream** de `001-foundation` (sessão OIDC/Authentik,
  cookie `__Host-session`, i18n, layout shell) e de `002-design-system` (importa componentes,
  tokens e paletas de gráfico via `public-api` — ver `design-tokens.fe.md`). **Não importa
  nada** de `social-care` nem de `people-context` no client: o dashboard exibe **agregados
  anônimos**, e qualquer correlação com prontuários individuais é proibida por decisão
  ([adr.md](./adr.md)) — não há sequer dado para correlacionar. Módulo **read-only**: nenhuma
  mutation contra o `analysis-bi`; a única operação não-GET conceitual (export) também é
  leitura, entregue como download. Atua como **ACL** do contrato HTTP do `analysis-bi`
  (`server/adapters`).

**Justificativa da fronteira** (citação obrigatória):
> Choose MODULES that tell the story of the system and contain a cohesive set of concepts.
> This often yields low coupling between MODULES, but if it doesn't, look for a way to
> change the model to disentangle the concepts. Give the MODULES names that become part of
> the UBIQUITOUS LANGUAGE. MODULES and their names should reflect insight into the domain.
> — *(Linha 1832, p. 110, ERIC EVANS, *Domain-Driven Design: Tackling Complexity in the Heart of Software*)*

O módulo conta uma história única — "os indicadores agregados da associação na tela:
5 eixos, filtros de período/região e export institucional" — e seu nome (`analysis-bi`) é o
mesmo termo do serviço upstream, mantendo a linguagem ubíqua de ponta a ponta.

## Linguagem ubíqua

| Termo (PT) | Significado (negócio) | Tipo no código (EN) |
|---|---|---|
| Painel de eixo | ViewModel completo de um eixo de indicadores, pronto para render | `IndicatorDashboardModel` (Model) |
| Série de indicador | Pontos `{ labels, value, period }` de um indicador, com gaps já preenchidos | `IndicatorSeriesModel` (Model) |
| Eixo | 1 dos 5 temas de indicadores | `IndicatorAxis` (union literal: `'demographics' \| 'epidemiological' \| 'socioeconomic' \| 'protection' \| 'care'`) |
| Período (filtro) | Mês `YYYY-MM` validado na borda | `PeriodYearMonth` (VO branded) |
| Intervalo de período | Par início/fim com `start ≤ end` | `PeriodRange` (VO) |
| Granularidade | Resolução temporal da série | `Granularity` (`'monthly' \| 'quarterly' \| 'yearly'`) |
| Mesorregião (filtro) | Código IBGE de 4 dígitos validado na borda | `MesoregionCode` (VO branded) |
| Top N | Limite de diagnósticos/faixas no ranking (`top ≥ 0`) | `TopN` (VO branded) |
| Supressão por privacidade | `suppressed_groups > 0` no `meta` → estado derivado que **obriga** banner | `hasSuppression` (derived) + `SuppressionNoticeModel` |
| Gap de série | Período sem dados (omitido pelo backend) preenchido no client | `gap: true` em `IndicatorSeriesPoint` |
| Export | Download de dataset em 1 dos 8 formatos com nome amigável | `ExportDescriptorModel` (Model) / `requestExport` (handler Elysia) |
| Erro do serviço | HTTP status sem código estruturado traduzido para union literal | `AnalysisBiError` (`AppError.kind`, string literal union) |

## Agregados e Value Objects (server/domain)

### IndicatorDashboard (server/domain)
- **Raiz**: `IndicatorDashboard` (identidade composta `axis × PeriodRange × filters`) · **Invariantes**:
  - Apenas invariantes de **orquestração/composição** — nunca duplica regra canônica do backend
    ([Princípio I](../../../.specify/memory/constitution.md)): K-anonymity, HAVING COUNT ≥ 5 e a
    contagem de supressão são **exclusivamente** do `analysis-bi`; o BFF apenas **propaga e
    nunca oculta** `meta.suppressed_groups`.
  - `PeriodRange` exige `start ≤ end` (smart constructor → `Result<PeriodRange, 'period-range-inverted'>`);
    `granularity` exaustiva (switch + `never`); `axis` exaustivo.
  - **Gap filling é invariante do ViewModel**: a série entregue ao client cobre **todos** os
    períodos do range na granularidade pedida — períodos omitidos pelo backend (séries esparsas)
    entram como ponto `{ value: 0, gap: true }`, distinguível de zero real reportado (decisão
    em [adr.fe.md](./adr.fe.md)).
  - `hasSuppression: boolean` é derivado (`suppressedGroups > 0`) e acompanha **toda** série
    do agregado — a UI não pode renderizar gráfico sem ter como exibir o aviso.
  - Agregado `Readonly<{}>` imutável; mutação = cópia via spread
    ([Princípio III](../../../.specify/memory/constitution.md)).
- **Value Objects**: `PeriodYearMonth` (`period-year-month.value-object.ts`:
  `const PeriodYearMonth = (raw: string): Result<PeriodYearMonth, 'period-invalid-format' | 'period-month-out-of-range'>`
  — regex `^\d{4}-(0[1-9]|1[0-2])$`), `PeriodRange`, `Granularity`, `MesoregionCode`
  (4 dígitos), `TopN` (inteiro ≥ 0), `IndicatorAxis` — branded types com smart constructor →
  `Result<T, E>`. Nunca lançam (`throw` proibido em `domain/` —
  [Princípio II — Errors as Values](../../../.specify/memory/constitution.md)). Espelham os
  tipos Go do backend (`Period`, `TimeGranularity`, `MesoregionCode` em
  `internal/domain/domain_types.go`), mas no estilo `Result` do `web_02` — os dois contratos
  não se importam mutuamente. Tipos definidos com TypeBox (`Elysia.t`) na borda BFF; o Eden
  Treaty propaga ao client sem redeclarar Model
  ([ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md),
  [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md)).
- **Justificativa do boundary do agregado** (citação obrigatória):
  > Limit the Aggregate to just the Root Entity and a minimal number of attributes and/or
  > Value-Typed properties. The correct minimum is the ones necessary, and no more. Which
  > ones are necessary? The simple answer is: those that must be consistent with others,
  > even if domain experts don't specify them as rules. Smaller Aggregates not only perform
  > and scale better, they are also biased toward transactional success.
  > — *(Linha 6244, p. 357–358, VAUGHN VERNON, *Implementing Domain-Driven Design*)*

  O agregado do BFF carrega só o que a tela exige consistente entre si: série × range ×
  granularidade × aviso de supressão. Separar `hasSuppression` da série permitiria renderizar
  dado suprimido sem aviso — exatamente a inconsistência que o boundary impede. As
  invariantes canônicas (K=5, generalização, hash) vivem no Go ([domain.md](./domain.md)).

### ExportRequest (server/domain)
- **Raiz**: `ExportRequest` (valor — sem identidade persistida) · **Invariantes**:
  - `format` ∈ união dos 8 (`'csv' | 'json' | 'xml' | 'parquet' | 'dbf' | 'dbc' | 'ods' | 'fhir'`)
    com nomes amigáveis no Model (`CSV`, `JSON`, `XML`, `Parquet`, `DBF/TABWIN`,
    `DBC/DataSUS`, `ODS`, `FHIR/RNDS`); `dataset` ∈ união dos 5 eixos (default
    `demographics`); `PeriodRange` obrigatório; `mesoregion` opcional.
  - O BFF **streama** o corpo binário e repassa `Content-Type` e `Content-Disposition`
    (`attachment; filename="acdg-{dataset}-{period}.{ext}"`) sem materializar o arquivo em
    memória nem logar payload; o filtro K=5 já vem aplicado pelo serviço — o BFF não
    pós-processa.
- **Value Objects**: `ExportFormat`, `DatasetScope` — unions literais exaustivas;
  `ExportFileName` derivado, nunca montado na UI.
- **Justificativa do boundary do agregado** (citação obrigatória):
  > When you care only about the attributes of an element of the model, classify it as a
  > VALUE OBJECT. Make it express the meaning of the attributes it conveys and give it
  > related functionality. Treat the VALUE OBJECT as immutable. Don't give it any identity
  > and avoid the design complexities necessary to maintain ENTITIES.
  > — *(Linha 1654, p. 99, ERIC EVANS, *Domain-Driven Design*)*

  Um export é puro valor: a mesma combinação `format × dataset × range` produz o mesmo
  arquivo; não há ciclo de vida, status nem identidade a manter — por isso não é entidade
  nem job assíncrono na v1.

## Model do client (`client/data`)

> O que a UI realmente consome (schema TypeBox do retorno do BFF; tipo propagado via Eden Treaty).
> Pode ser mais "plano" que o agregado server.

| Model | Campos | Origem (handler Elysia) |
|---|---|---|
| `IndicatorDashboardModel` | `axis`, `series: IndicatorSeriesModel[]`, `kThreshold` (5), `suppressedGroups`, `hasSuppression`, `totalRecords`, `periodRange`, `granularity` | `getIndicators` (proxy `GET /api/v1/indicators/{axis}`; `period_start`/`period_end` obrigatórios, `mesoregion?`, `granularity` default `monthly`, `top?` p/ epidemiological/socioeconomic; **sem paginação** — payload completo) |
| `IndicatorSeriesModel` | `key` (labels canonizados), `labels: Record<string, string>` (`age_band`, `sex`, `mesoregion_name`, `icd_code`, `icd_label`, `income_band`, `violation_type`, `destination`, `appointment_type` — conforme o eixo), `points: { period, value, gap }[]` | embutido em `getIndicators` (gap filling aplicado no BFF/view-model — [adr.fe.md](./adr.fe.md)) |
| `SuppressionNoticeModel` | `suppressedGroups`, `kThreshold`, `message` (tag i18n `'k-anonymity-suppression'`) | derivado de `meta` em `getIndicators` quando `suppressed_groups > 0` |
| `DatasetCatalogModel` | `datasets: { id, description }[]` (5), `formats: { id, friendlyName, contentType, extension }[]` (8) | `getExportCatalog` (fan-out `GET /metadata/datasets` + `GET /metadata/formats` no BFF) |
| `ExportTicketModel` | `fileName`, `format`, `dataset`, `periodRange` (o binário segue via rota `/api/*` com `Content-Disposition`) | `requestExport` |
| `ServiceHealthModel` | `available: boolean` (banner de degradação quando `/ready` → 503) | embutido como campo tolerável `| null` em `getIndicators` ([Princípio II — fallback gracioso](../../../.specify/memory/constitution.md)) |

## Eventos (client — Event Bus)

Implementação nativa `EventTarget` + `CustomEvent` (sem mitt/nanoevents —
[Princípio IV — Bun-Native](../../../.specify/memory/constitution.md)):

| Evento (EN-passado) | Quando ocorre | Quem assina (reação) |
|---|---|---|
| `DashboardFiltersApplied` | Usuário confirma filtros válidos (range, granularidade, mesorregião, top N) | ViewModels dos painéis de eixo (invalidam `createAsync` correspondente via `query` do `@solidjs/router`) |
| `SuppressionNoticeRaised` | `getIndicators` retorna `suppressedGroups > 0` | ViewModel do shell do dashboard (renderiza banner persistente "X grupos suprimidos por privacidade — K=5"; some apenas quando novo resultado vier com 0) |
| `ExportStarted` / `ExportCompleted` | `requestExport` dispara / download conclui | ViewModel do painel de export (spinner por formato; toast com `fileName`) |
| `RateLimitHit` | BFF traduz HTTP 429 (token bucket global do serviço — MED-002) | ViewModels dos painéis (pausam refetch e exibem aviso com retry manual via `action` do `@solidjs/router`) |
| `AnalysisServiceDegraded` | Campo tolerável `| null` no ViewModel (503/`/ready` falhou) | ViewModel do shell (banner "indicadores temporariamente indisponíveis", sem derrubar o layout) |
| `SessionExpired` | BFF traduz `unauthorized` (sessão OIDC expirada / 401 do serviço) | ViewModel de auth do `001-foundation` (limpa cache de `query` e redireciona ao login) |

O binding Solid (`*.binding.ts`) é o único ponto que toca a reatividade do Solid
(`createAsync`, `action`, `useSubmission`) — o ViewModel puro (`*.view-model.ts`) não importa
`solid-js` ([ADR-0009](../../adr/0009-framework-agnostic-client.md),
[ADR-0012](../../adr/0012-shell-as-root-screen-mvvm.md)).

## Notas de mapeamento (anti-corrupção)

O `server/adapters` (`analysis-bi.adapter.ts`) isola integralmente o contrato do serviço:

- **Envelope**: desempacota `{ data, meta: { timestamp, period, k_threshold, suppressed_groups, total_records } }`; `meta` vira campos tipados do Model (`kThreshold`, `suppressedGroups`, `totalRecords`) — **nunca descartados**: a supressão é informação de primeira classe da tela.
- **Erros sem código estruturado**: o `analysis-bi` não emite `ANA-XXX` — o body de erro é `{ data: { error, status, message } }`. O adapter mapeia por **HTTP status + contexto da chamada** para a union `AnalysisBiError` (`'invalid-indicator-query'` 400, `'unauthorized'` 401, `'unknown-axis'` 404, `'rate-limited'` 429, `'analysis-internal-error'` 500, `'not-implemented'` 501, `'analysis-unavailable'` 503); UI resolve via dicionário i18n — decisão completa em [adr.fe.md](./adr.fe.md). A `message` crua (EN) nunca chega ao usuário.
- **Séries esparsas**: o backend omite períodos sem dados; o view-model preenche os gaps do range na granularidade pedida com `{ value: 0, gap: true }` — gráficos renderizam o eixo temporal contínuo e diferenciam visualmente "sem dados" de "zero" ([adr.fe.md](./adr.fe.md)).
- **Granularidade**: labels do backend (`"2025-03"`, `"2025-Q1"`, `"2025"`) → `period` canônico do ponto; exibição PT-BR (`mar/2025`, `1º tri 2025`, `2025`) via `Intl.DateTimeFormat('pt-BR')`/formatadores próprios — nunca string mágica em componente.
- **Sem paginação**: payloads completos (K=5 + filtros tipicamente < 1000 rows); o adapter valida tamanho com TypeBox (schema defensivo com `.maxItems()`) e o view-model agrupa/ordena no client.
- **Export**: rota Elysia (não handler JSON) que streama o corpo, preservando `Content-Type` por formato e `Content-Disposition`; nomes amigáveis (`DBF/TABWIN`, `DBC/DataSUS`, `FHIR/RNDS`) vivem no `DatasetCatalogModel`, não hardcoded na UI.
- **Auth**: o adapter injeta `Authorization: Bearer <jwt>` lido da sessão server-side; não há header de ator (serviço read-only, sem audit de acesso — LOW-001). Enquanto **HIGH-003** (RBAC placeholder no serviço) não for corrigido, o BFF checa o papel da sessão **antes** de proxar — autorização efetiva, documentada na [constitution.md](../../../.specify/memory/constitution.md) (Iron Frontier).
- **Sem PII por construção**: nenhum payload contém dado individual (supressão → generalização → K=5 na ingestão e na query); ainda assim valem [ADR-0005](../../adr/0005-auth-session-refresh-decisions.md) (cache client-only) e a proibição de localStorage/sessionStorage.
- **Honesty**: enquanto endpoints não estiverem verdes no [api-readiness.fe.md](./api-readiness.fe.md), o adapter retorna o valor `'not-implemented'` (nunca dado fabricado); fakes/fixtures vivem exclusivamente em `tests/` — [ADR-0011](../../adr/0011-no-mocks-in-production.md), [Princípio VI](../../../.specify/memory/constitution.md).

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípios I–VI (Iron Frontier, Errors as Values, MVVM×DDD, Bun-Native, TypeBox/Eden, Honesty)
- [ADR-0001 (vertical-modular)](../../adr/0001-vertical-modular-architecture.md) — boundaries de módulo enforçados por governance tests
- [ADR-0002 (Errors as Values)](../../adr/0002-errors-as-values.md) — Result<T,E>, ErrorBoundary Solid
- [ADR-0004 (Client/Server MVVM×DDD)](../../adr/0004-client-server-split-mvvm-ddd.md) — split server/client, Eden Treaty
- [ADR-0005 (auth/session)](../../adr/0005-auth-session-refresh-decisions.md) — sessão opaca, cookie HttpOnly
- [ADR-0009 (framework-agnostic client)](../../adr/0009-framework-agnostic-client.md) — ViewModel puro sem solid-js; binding.ts separado
- [ADR-0010 (BFF orchestration / fn naming)](../../adr/0010-bff-orchestration-fn-naming.md) — `*.query.fn.ts`
- [ADR-0011 (no mocks)](../../adr/0011-no-mocks-in-production.md) — `'not-implemented'` como valor
- [ADR-0012 (shell MVVM)](../../adr/0012-shell-as-root-screen-mvvm.md) — shell autenticado como tela MVVM
- [adr.md](./adr.md) — proibição de drill-down individual
- [adr.fe.md](./adr.fe.md) — séries esparsas, supressão K=5 e mapeamento de erros
- [domain.md](./domain.md) — domínio CORE Go (invariantes canônicas)
- [api-readiness.fe.md](./api-readiness.fe.md) — prontidão dos endpoints
- [ADR index](../../adr/README.md) — todos os ADRs web_02
- Docs offline: `../../reference/framework/elysia/` · `../../reference/framework/solidstart/` · `../../reference/runtime/bun/`
