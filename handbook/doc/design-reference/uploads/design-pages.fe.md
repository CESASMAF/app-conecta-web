# 06 · Pages: Analysis BI Web

**Feature**: `specs/003-analysis-bi-web/design-system/` · **Nível**: Pages (Atomic Design, Cap. 2)

> **Páginas** = instâncias concretas de templates com **conteúdo real e representativo**. Validam se os
> padrões aguentam o conteúdo de verdade e documentam **variações e edge-cases** (sem dados vs.
> suprimido, gaps de série, rate limit, indisponibilidade). Cada página mapeia para uma rota real
> (SolidStart, file-based em `web_02/src/routes/_auth/`) e seu fluxo: page → **ViewModel** → **binding Solid**
> (`createAsync`/`action`/`useSubmission` do `@solidjs/router`) → **rota BFF Elysia** ([ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md))
> → endpoint do `analysis-bi`. O BFF injeta o Bearer e restringe acesso por
> papel (RBAC client-side/BFF enquanto HIGH-003 não é corrigido no serviço). O serviço **não** usa
> códigos estruturados (`ANA-XXX`) — variações de erro são por **HTTP status** (400/401/429/503…),
> mapeadas pelo BFF para mensagens i18n. Nenhum payload contém PII: só agregados K-anônimos (K=5).

## Páginas (instâncias) por comportamento

### Home de indicadores — `/indicators`
- **Template base**: `ShellTemplate` (variação home, sem template novo)
- **Conteúdo representativo**: 5 `M3KpiCard` — "Demográfico · 1.247 registros", "Epidemiológico · 37 casos novos", "Socioeconômico · 412 beneficiários", "Proteção · 89 encaminhamentos", "Cuidado · 503 atendimentos" — período default "jul/2025 a jun/2026"; card "Exportar dados"
- **Variações documentadas**:
  | Variação | Estado | Comportamento esperado |
  |---|---|---|
  | completa | 5 eixos com dados | cards clicáveis → dashboard do eixo |
  | eixo vazio | `data: []`, `suppressed_groups = 0` num eixo | card mostra "—" + "sem dados no período"; continua clicável |
  | eixo suprimido | `data: []`, `suppressed_groups > 0` | card mostra "—" + nota "dados omitidos por privacidade" |
  | 429 | rate limit (bucket global) | cards em estado de aviso âmbar + retry único agrupado (sem refetch em cascata) |
  | 503 | DB/NATS fora (`/ready` 503) | `M3EmptyState` de indisponibilidade no lugar do grid + retry |
  | carregando | pending | skeleton dos 6 cards |
- **Edge-cases**: primeira carga do sistema (ingestão ainda sem eventos → todos vazios, sem erro); datasets de `GET /metadata/datasets` orientam título/descrição dos cards (fonte canônica, não hardcode)
- **Fluxo de dados**: `indicators-home.page.tsx` → `indicatorsHomeViewModel` (`*.view-model.ts`) → binding Solid (`createAsync`) → `getIndicatorsSummary.query.fn.ts` (handler Elysia) → `GET /api/v1/metadata/datasets` + 5× `GET /api/v1/indicators/{axis}?period_start&period_end` (agrupadas e cacheadas no BFF via `Bun.redis` — mitiga MED-002)

### Dashboard demográfico — `/indicators/demographics`
- **Template base**: `DashboardTemplate`
- **Conteúdo representativo**: filtros `2025-01 → 2025-12 · mensal · todas as mesorregiões`; KPIs "1.247 registros" e "17 faixas com dados"; `AgePyramidChart` com itens `{ labels: { age_band: "25-29", sex: "FEMALE", mesoregion_name: "Norte de Roraima" }, value: 42, period: "2025-03" }`; `IndicatorTimeSeriesChart` da evolução; `MesoregionBreakdownPanel` ("Norte de Roraima · 812", "Sul de Roraima · 435"); banner "3 grupos com menos de 5 pessoas foram omitidos"
- **Variações documentadas**:
  | Variação | Estado | Comportamento esperado |
  |---|---|---|
  | completa | `data[]` + `suppressed_groups = 0` | pirâmide cheia (até 17 faixas × 3 sexos), sem banner |
  | suprimida parcial | `suppressed_groups: 3` | faixas K<5 ausentes da pirâmide; `SuppressionBanner` obrigatório no topo |
  | vazia | `data: []` | `M3EmptyState` "Sem dados no período" + CTA ampliar período |
  | tudo suprimido | `data: []` + `suppressed_groups > 0` | empty state de privacidade + banner (mensagem distinta do vazio comum) |
  | 400 | `period_start` malformado / `mesoregion` inexistente | erro no campo do `DashboardFilterPanel` ("use o formato AAAA-MM"); sem fetch novo até corrigir |
  | 429 | rate limit | aviso âmbar full-width + botão "Tentar de novo" (sem auto-retry) |
  | 503 | serviço indisponível | empty state de indisponibilidade + retry |
  | carregando | pending | skeleton de pirâmide + KPIs |
- **Edge-cases**: filtro por mesorregião única zera a coluna do breakdown (mostra só a selecionada + "limpar filtro"); granularidade anual com período < 1 ano (série de 1 ponto — render como coluna única, não linha); `sex: "UNKNOWN"` presente (linha residual com `--color-chart-sex-unknown`)
- **Fluxo de dados**: `axis-dashboard.page.tsx` → `demographicsDashboardViewModel` (preenche gaps com `null`, ordena as 17 faixas) → binding Solid (`createAsync`) → `getIndicators.query.fn.ts` → `GET /api/v1/indicators/demographics?period_start&period_end&mesoregion&granularity`

### Dashboard epidemiológico — `/indicators/epidemiological`
- **Template base**: `DashboardTemplate` (com seletor de top N)
- **Conteúdo representativo**: `TopNBarChart` top 5 CID-10 — `{ labels: { icd_code: "E75.2", icd_label: "Gangliosidose GM2" }, value: 37 }`, "Q87.4 — Síndrome de Marfan · 21"…; `IndicatorTimeSeriesChart` com 2 séries (casos novos vs. acumulados); KPI "37 casos novos no período"
- **Variações documentadas**:
  | Variação | Estado | Comportamento esperado |
  |---|---|---|
  | completa | top 5 com dados | barras ordenadas por valor; `icd_code` em mono + `icd_label` |
  | suprimida | `suppressed_groups > 0` | diagnósticos K<5 fora do ranking; banner explica que o "top" é entre grupos publicáveis |
  | vazia | `data: []` | empty state |
  | 400 | `top` negativo / período inválido | erro no controle de top N / período |
  | 429 / 503 | rate limit / indisponível | aviso com retry / empty state de indisponibilidade |
  | carregando | pending | skeleton de barras |
- **Edge-cases**: `top` limitado a 8 na UI (paleta categórica — [design-tokens.fe.md](./design-tokens.fe.md) §4) mesmo o serviço aceitando N maior; `icd_label` longo (truncate 1 linha + completo no tooltip/tabela); série temporal trimestral exibe `M3PeriodLabel` "T1 2025"
- **Fluxo de dados**: página → `epidemiologicalDashboardViewModel` → binding Solid (`createAsync`) → `getIndicators.query.fn.ts` → `GET /api/v1/indicators/epidemiological?period_start&period_end&top&granularity&mesoregion`

### Dashboard socioeconômico — `/indicators/socioeconomic`
- **Template base**: `DashboardTemplate` (com seletor de top N para benefícios)
- **Conteúdo representativo**: `TopNBarChart` das 6 faixas de renda em ordem fixa — `{ labels: { income_band: "0-0.5", mesoregion_name: "Norte de Roraima" }, value: 218 }` … "5+ SM · 12"; barras de benefícios "BPC · 187 beneficiários", "Bolsa Família · 225"; nota de rodapé "faixas em salários mínimos (referência 2024)"
- **Variações documentadas**:
  | Variação | Estado | Comportamento esperado |
  |---|---|---|
  | completa | 6 faixas presentes | barras em ordem fixa das faixas (0-0.5 → 5+), nunca por valor |
  | suprimida | faixa K<5 ausente | slot da faixa renderiza "—" + banner (ordem fixa preserva leitura comparativa) |
  | vazia | `data: []` | empty state |
  | 400 / 429 / 503 | filtros inválidos / rate limit / indisponível | idem dashboards anteriores |
  | carregando | pending | skeleton |
- **Edge-cases**: faixa de renda é **ordinal** — gap na escala é informativo e deve ficar visível (decisão de UX, diferente do ranking CID-10 onde o suprimido simplesmente não entra); `total_amount` de benefícios em `M3KpiValue` currency (`R$ 1.412,00` via `Intl.NumberFormat`)
- **Fluxo de dados**: página → `socioeconomicDashboardViewModel` → binding Solid (`createAsync`) → `getIndicators.query.fn.ts` → `GET /api/v1/indicators/socioeconomic?period_start&period_end&top&granularity&mesoregion`

### Dashboard de proteção — `/indicators/protection`
- **Template base**: `DashboardTemplate`
- **Conteúdo representativo**: `TopNBarChart` de encaminhamentos por destino — `{ labels: { destination: "CREAS", mesoregion_name: "Norte de Roraima" }, value: 34 }`, "UPA · 21", "CRAS · 18"; barras de violações por tipo — `{ labels: { violation_type: "negligência" }, value: 12 }`, "violência física · 7"; série temporal de encaminhamentos
- **Variações documentadas**:
  | Variação | Estado | Comportamento esperado |
  |---|---|---|
  | completa | destinos + tipos com dados | dois `TopNBarChart` lado a lado (grid 2 colunas) |
  | suprimida | tipos de violação K<5 omitidos | banner — crítico aqui: contagens pequenas de violação são exatamente o caso K=5 protege |
  | vazia | `data: []` | empty state ("nenhum encaminhamento/violação no período" — tom neutro, sem celebrar) |
  | 400 / 429 / 503 | idem | idem |
  | carregando | pending | skeleton |
- **Edge-cases**: a resposta mistura dois conjuntos de labels (`violation_type` e `destination`) — o ViewModel separa por presença do label antes de montar os 2 gráficos; nunca exibir busca/drill por vítima (impossível por design — sem PII)
- **Fluxo de dados**: página → `protectionDashboardViewModel` → binding Solid (`createAsync`) → `getIndicators.query.fn.ts` → `GET /api/v1/indicators/protection?period_start&period_end&granularity&mesoregion`

### Dashboard de cuidado — `/indicators/care`
- **Template base**: `DashboardTemplate`
- **Conteúdo representativo**: `TopNBarChart` de atendimentos por tipo — `{ labels: { appointment_type: "visita domiciliar", mesoregion_name: "Norte de Roraima" }, value: 156 }`, "atendimento psicossocial · 98"; KPI "completude média de avaliações: 72%" (AVG `assessment_completeness` 0–1 → percent); série temporal de atendimentos
- **Variações documentadas**:
  | Variação | Estado | Comportamento esperado |
  |---|---|---|
  | completa | tipos + completude | barras + KPI percent + série |
  | suprimida | `suppressed_groups > 0` | tipos K<5 fora + banner |
  | vazia | `data: []` | empty state |
  | 400 / 429 / 503 | idem | idem |
  | carregando | pending | skeleton |
- **Edge-cases**: completude é média 0–1 — exibir como % com 0 casas decimais e nunca somar com contagens no mesmo gráfico (unidades distintas → cards separados); gap de série em mês de carry-forward atrasado (job mensal dia 1º) é esperado no início do mês corrente
- **Fluxo de dados**: página → `careDashboardViewModel` → binding Solid (`createAsync`) → `getIndicators.query.fn.ts` → `GET /api/v1/indicators/care?period_start&period_end&granularity&mesoregion`

### Central de exports — `/exports`
- **Template base**: `ExportTemplate`
- **Conteúdo representativo**: dataset "Demográfico" + período `2025-01 → 2025-12` + todas as regiões; grade dos 8 formatos com nomes amigáveis — CSV · JSON · XML · Parquet · DBF/TABWIN · DBC/DataSUS · ODS · FHIR/RNDS; resumo "acdg-demographics-2025-01-2025-12.csv"; banner "3 grupos omitidos — o arquivo exportado também não os contém"
- **Variações documentadas**:
  | Variação | Estado | Comportamento esperado |
  |---|---|---|
  | download ok | `200` + `Content-Disposition: attachment; filename="acdg-{dataset}-{period}.{ext}"` | BFF Elysia repassa o stream; toast "arquivo pronto"; CTA libera |
  | com supressão | `ExportMetadata.suppressed > 0` | `SuppressionBanner` antes e depois do download (o arquivo aplica o mesmo K=5) |
  | vazio | dataset sem dados no recorte | aviso "o arquivo sairá sem linhas de dados" antes de exportar (consulta prévia ao indicador) |
  | 400 | período malformado / dataset inválido | erro nos campos; CTA bloqueado até corrigir |
  | 429 | rate limit | CTA bloqueado + aviso "aguarde alguns segundos e tente de novo" |
  | 503 | serviço indisponível | empty state de indisponibilidade no lugar da grade |
  | baixando | pending (Parquet/FHIR podem ser grandes) | CTA pending; 1 download por vez |
- **Edge-cases**: `?dataset=epidemiological` na URL pré-seleciona o dataset (atalho dos dashboards); formato DBC/DataSUS e DBF/TABWIN com descrição de uso ("para importar no TabWin"); FHIR/RNDS descrito como "Bundle FHIR R4 (perfis BR Core)"; nome de arquivo exibido **antes** do download (transparência); nenhum formato exporta PII — reforço textual no rodapé
- **Fluxo de dados**: `export-center.page.tsx` → `exportCenterViewModel` → binding Solid (`createAsync` + `action`) → `getExportFormats.query.fn.ts` (`GET /api/v1/metadata/formats` + `/datasets`) e `downloadExport.service.fn.ts` → `GET /api/v1/export/{format}?dataset&period_start&period_end&mesoregion` (stream via BFF Elysia, [Princípio I](../../../.specify/memory/constitution.md))

## Cobertura de telas

| Tela (evidência) | Página documentada? | Rota | Template |
|---|---|---|---|
| Home de indicadores (5 eixos) | ✅ | `/indicators` | `ShellTemplate` (variação home) |
| Dashboard demográfico (pirâmide etária) | ✅ | `/indicators/demographics` | `DashboardTemplate` |
| Dashboard epidemiológico (top CID-10) | ✅ | `/indicators/epidemiological` | `DashboardTemplate` |
| Dashboard socioeconômico (renda/benefícios) | ✅ | `/indicators/socioeconomic` | `DashboardTemplate` |
| Dashboard de proteção (encaminhamentos/violações) | ✅ | `/indicators/protection` | `DashboardTemplate` |
| Dashboard de cuidado (atendimentos/completude) | ✅ | `/indicators/care` | `DashboardTemplate` |
| Central de exports (8 formatos) | ✅ | `/exports` | `ExportTemplate` |

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípios I–VI; em especial I (BFF boundary), III (MVVM: fluxo page→ViewModel→binding→query.fn), VI (Honesty: sem mocks)
- [ADR-0002](../../adr/0002-errors-as-values.md) — erros como `Result`; fluxo valor→exceção só via `createAsync`/`ErrorBoundary`
- [ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md) — fronteira client↔server; page é client, `query.fn` é server
- [ADR-0009](../../adr/0009-framework-agnostic-client.md) — ViewModel puro (`*.view-model.ts`) + binding Solid (`*.binding.ts`)
- [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md) — naming `*.query.fn.ts` (leitura) e `*.service.fn.ts` (escrita/side-effect) das rotas Elysia
- [ADR-0011](../../adr/0011-no-mocks-in-production.md) — sem mocks em `src/`; fixtures só em `tests/`
- [design-templates.fe.md](./design-templates.fe.md) — templates instanciados aqui
- [design-organisms.fe.md](./design-organisms.fe.md) — organismos usados nas páginas
- [design-tokens.fe.md](./design-tokens.fe.md) — referência de tokens; §4 explica limite de top N = 8
- [design-governance.fe.md](./design-governance.fe.md) — gates de qualidade e a11y por página
- Doc offline SolidStart (rotas file-based, `createAsync`, `action`): [../../reference/framework/solidstart/](../../reference/framework/solidstart/)
- Doc offline Elysia (handlers, Eden Treaty): [../../reference/framework/elysia/](../../reference/framework/elysia/)
- Doc offline Bun: [../../reference/runtime/bun/](../../reference/runtime/bun/)
