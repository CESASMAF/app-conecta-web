# 00 · Interface Inventory: Analysis BI Web

**Feature**: `specs/003-analysis-bi-web/design-system/` · **Método**: Atomic Design (Frost), Cap. 4

> O **interface inventory** é a foto crua de TODA a UI da feature antes de sistematizar: cataloga cada
> elemento visual repetido (botões, campos, badges, tabelas, modais…), expõe **inconsistências** e
> estabelece o **vocabulário compartilhado**. É o insumo dos documentos 01–06 (tokens→pages).
> Aqui também fica fixada a **política de fidelidade**: replicar o contrato real do backend
> `analysis-bi` (envelope `{ data, meta }`, labels por eixo, K-anonymity K=5, 8 formatos de export)
> sobre o design system `M3*` já existente — esta é a **primeira feature com visualização de dados**
> da plataforma, então o inventário marca explicitamente o que é reuso e o que dataviz exige de novo.

## 1. Fonte da evidência

- Mapa completo do serviço `analysis-bi` (Go + chi + pgx + NATS JetStream): star schema (10 dimensões, 7 fatos), rotas `/api/v1/indicators/{axis}` e `/api/v1/export/{format}`, envelope com `meta.suppressed_groups`, limitações (sem paginação, séries esparsas) — relatório de exploração de 2026-06-12 (`/tmp/analysis-bi-service-map.md`, repo `analysis-bi/` @ HEAD).
- Conjuntos irmãos do design system: `../people-context/design-tokens.fe.md` → `../people-context/design-governance.fe.md` e `../social-care/design-tokens.fe.md` → `../social-care/design-governance.fe.md` — catálogo `M3*` em `web_02/src/components/ui/m3/`, shell em `web_02/src/components/shell/`, tokens vanilla-extract em `web_02/src/styles/tokens.css.ts` (ver [design-tokens.fe.md](./design-tokens.fe.md)).
- ADRs do `web_02/`: [ADR-0001](../../adr/0001-vertical-modular-architecture.md) (arquitetura vertical-modular), [ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md) (split client/server, BFF/DDD), [ADR-0007](../../adr/0007-design-system-vanilla-extract.md) (vanilla-extract, tokens), [ADR-0009](../../adr/0009-framework-agnostic-client.md) (ViewModel puro + binding Solid + Command), [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md) (naming BFF Elysia, `*.query.fn.ts`/`*.service.fn.ts`).
- Telas cobertas: Home de indicadores (visão geral dos 5 eixos) · Dashboard demográfico (pirâmide etária faixa × sexo × mesorregião) · Dashboard epidemiológico (top N CID-10, casos novos vs acumulados) · Dashboard socioeconômico (faixas de renda em SM, benefícios BPC/PBF) · Dashboard de proteção (encaminhamentos por destino, violações por tipo) · Dashboard de cuidado (atendimentos por tipo, completude) · Central de exports (8 formatos) — incluindo, em todas, os estados de **supressão por privacidade** (`suppressed_groups > 0`), vazio, carregamento e erro (400/429/503).

## 2. Inventário por categoria (Frost)

> Liste o que aparece, com onde foi visto. Marque duplicatas/variações divergentes.

| Categoria | Variações encontradas | Onde aparece | Consolidar como |
|---|---|---|---|
| Botões | filled (CTA "Exportar"), tonal ("Aplicar filtros"), text ("Limpar"), back, menu kebab | central de exports; painel de filtros; app bar | átomos `M3Button` (reuso), `M3BackButton`, `M3MenuButton` (reuso) |
| Filtros de consulta | período início/fim `YYYY-MM`, granularidade `monthly\|quarterly\|yearly`, mesorregião (código IBGE), top N (epidemiológico/socioeconômico) | header persistente de todos os dashboards; central de exports | moléculas `M3PeriodRangeField` (nova), `GranularitySelector` (nova, sobre `M3GranularityChip`), `MesoregionFilter` (nova, sobre `M3DropdownField`) |
| Gráficos | pirâmide etária (barras espelhadas por sexo), barras horizontais top N (CID-10, destino, tipo), série temporal (linha/coluna com gaps), distribuição por faixas (renda em SM) | 5 dashboards | organismos novos `AgePyramidChart`, `TopNBarChart`, `IndicatorTimeSeriesChart` (novidade dataviz) |
| Legendas/eixos | swatch + label por série (sexo, faixa, CID), labels de eixo/grade, label de período por granularidade (`2025-03`, `2025-Q1`, `2025`) | todos os gráficos | átomos novos `M3SeriesLegendItem`, `M3PeriodLabel` |
| Cards/KPIs | valor agregado grande + unidade + período (total de registros, casos novos, beneficiários, atendimentos, completude média 0–1) | home de indicadores; topo de cada dashboard | átomo novo `M3KpiValue` + molécula nova `M3KpiCard` (parente do `M3StatCard` do social-care) |
| Tooltips | valor exato da célula agregada ao pairar/focar barra ou ponto (labels + value + período) | todos os gráficos | molécula nova `M3ChartTooltip` |
| Tabelas | desagregação por mesorregião (nome + valor + barra proporcional); tabela de dados alternativa de cada gráfico (a11y) | dashboards; toggle "ver como tabela" | organismo novo `MesoregionBreakdownPanel`; `M3Table` (reuso) |
| Avisos | banner de supressão K=5 ("N grupos suprimidos por privacidade"), aviso de série esparsa (gaps preenchidos no client) | qualquer resposta com `meta.suppressed_groups > 0` | molécula nova `SuppressionBanner` |
| Export | grade dos 8 formatos com nomes amigáveis (CSV, JSON, XML, Parquet, DBF/TABWIN, DBC/DataSUS, ODS, FHIR/RNDS), seletor de dataset (5), download com `Content-Disposition` | central de exports | organismo novo `ExportPanel` |
| Estados vazios/erro | sem dados no período, tudo suprimido (`data: []` + `suppressed_groups > 0`), erro 400 (período malformado), 429 (rate limit), 503 (serviço indisponível), carregando (skeleton de gráfico) | todos os dashboards e exports | `M3EmptyState` (reuso) + skeletons de gráfico + `error-page` do shell |
| Navegação | shell com nav rail (item "Indicadores"), top app bar, abas/cards por eixo na home | todas as páginas autenticadas | `AppShell` + `M3TopAppBar` + `M3NavRailItem` (reuso integral) |

## 3. Inconsistências detectadas

| # | Inconsistência | Telas | Decisão (padronizar / manter / sanear) |
|---|---|---|---|
| 1 | Vocabulário de sexo: backend usa EN (`MALE/FEMALE/UNKNOWN`), UI exibe PT (Masculino/Feminino/Não informado) | pirâmide etária, legendas | padronizar — mapa único EN→PT no i18n; enum EN nunca aparece na UI |
| 2 | Formatos de período divergem por granularidade (`2025-03` vs `2025-Q1` vs `2025`) sem formatação amigável | eixos de gráficos, labels | padronizar — `M3PeriodLabel` formata por granularidade (mar/2025 · T1 2025 · 2025); valor cru só em export |
| 3 | Séries temporais esparsas: períodos sem dados NÃO vêm na resposta (limitação documentada do serviço) | série temporal | sanear no client — ViewModel preenche gaps com `value: null` (gap visual explícito, nunca interpolar como zero) |
| 4 | Sem códigos de erro estruturados (`ANA-XXX`): serviço responde só HTTP status + `message` EN | todos | manter contrato — BFF Elysia mapeia `status` → mensagem i18n; não inventar códigos no front |
| 5 | `GET /api/v1/metadata/regions` é PLANEJADO (array vazio / 501) | filtro de mesorregião | sanear — `MesoregionFilter` v1 usa catálogo estático derivado de `configs/ibge_mesoregions.csv` servido pelo BFF; migrar ao endpoint quando sair do 501 |
| 6 | `income_band` usa SM de 2024 hardcoded (R$ 1.412,00) no backend | dashboard socioeconômico | manter — exibir nota de rodapé "faixas em salários mínimos (referência 2024)"; correção é do serviço, não da UI |
| 7 | Rate limit é global (não per-IP — MED-002 do FINAL-REPORT) e dashboards disparam várias queries | todos os dashboards | sanear na UI — BFF Elysia agrupa e cacheia por filtro (`Bun.redis`, [Princípio IV](../../../.specify/memory/constitution.md)); 429 exibe aviso com retry, sem auto-refetch agressivo |
| 8 | RBAC não enforced no serviço (HIGH-003) | todas | sanear na borda — BFF Elysia restringe rotas por papel ([Princípio I](../../../.specify/memory/constitution.md)); UI não exibe entrada de navegação sem permissão (mesma regra dos irmãos) |

## 4. Política de fidelidade (clone fiel)

- **Replicar** (comportamento visível): envelope `{ data, meta }` com `k_threshold`, `suppressed_groups`, `total_records`, `period`; labels exatamente como o contrato entrega (`age_band`, `sex`, `mesoregion_name`, `icd_code`/`icd_label`, `income_band`, `violation_type`/`destination`, `appointment_type`); as 17 faixas etárias ("0-4"…"80+") e as 6 faixas de renda em SM; granularidades `monthly|quarterly|yearly`; os 8 formatos de export com download via `Content-Disposition` — a UI **não recalcula** nenhum agregado, só apresenta.
- **Sanear** (bug de borda, não-UI): gaps de séries esparsas (preencher com `null` no ViewModel, inconsistência #3); ausência de catálogo de regiões (#5); 429 por rajada de queries (#7); divergências de contrato → registrar em `web_02/handbook/inquiries/` ou ADR.
- **Reservado para futuro** (manter placeholder): mapa coroplético por mesorregião (depende de `metadata/regions` + geometria IBGE — v1 entrega tabela com barras proporcionais no `MesoregionBreakdownPanel`); drill-down individual (**impossível por design** — serviço só expõe agregados K-anônimos, sem PII; nunca prometer na UI); microrregião como granularidade geográfica (dimensão existe no star schema, API só filtra mesorregião).

## 5. Vocabulário compartilhado (saída)

Nomes canônicos usados pelos documentos [design-tokens.fe.md](./design-tokens.fe.md) → [design-pages.fe.md](./design-pages.fe.md) e pelo código (`web_02/src/components/ui/m3/` + `web_02/src/features/003-analysis-bi/ui/`), nomeados por **papel/estrutura**, nunca por conteúdo:

- **Átomos**: reuso — `M3Button`, `M3BackButton`, `M3MenuButton`, `M3ChoiceChip`; novos (dataviz) — `M3SeriesLegendItem`, `M3KpiValue`, `M3PeriodLabel`, `M3GranularityChip` — ver [design-atoms.fe.md](./design-atoms.fe.md).
- **Moléculas**: reuso — `M3DropdownField`, `M3EmptyState`, `M3SectionHeader`, `M3DataField`; novas — `M3PeriodRangeField`, `GranularitySelector`, `MesoregionFilter`, `M3KpiCard`, `M3ChartTooltip`, `SuppressionBanner` — ver [design-molecules.fe.md](./design-molecules.fe.md).
- **Organismos**: reuso — `AppShell`, `M3TopAppBar`; novos — `AgePyramidChart`, `TopNBarChart`, `IndicatorTimeSeriesChart`, `MesoregionBreakdownPanel`, `DashboardFilterPanel`, `ExportPanel` — ver [design-organisms.fe.md](./design-organisms.fe.md).
- **Templates**: reuso — `ShellTemplate`; novos — `DashboardTemplate`, `ExportTemplate` — ver [design-templates.fe.md](./design-templates.fe.md).
- **Domínio (PT-BR na UI)**: Indicador · Eixo (Demográfico/Epidemiológico/Socioeconômico/Proteção/Cuidado) · Pirâmide etária · Faixa etária · Mesorregião · CID-10 · Faixa de renda (salários mínimos) · Benefício (BPC, Bolsa Família) · Encaminhamento · Violação de direitos · Atendimento · Completude de avaliação · Supressão por privacidade (K-anonimato, K=5) · Exportação.

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípios I (BFF-Orchestrated Boundary), III (Vertical-Modular), IV (Bun-Native)
- [ADR-0001](../../adr/0001-vertical-modular-architecture.md) — Arquitetura vertical-modular
- [ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md) — Split client (MVVM) × server (BFF/DDD)
- [ADR-0007](../../adr/0007-design-system-vanilla-extract.md) — vanilla-extract como engine do design system
- [ADR-0009](../../adr/0009-framework-agnostic-client.md) — ViewModel puro + binding Solid + Command
- [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md) — BFF Elysia orquestrador; naming `*.query.fn`/`*.service.fn`
- [ADR-0011](../../adr/0011-no-mocks-in-production.md) — Sem mocks em produção
- [design-tokens.fe.md](./design-tokens.fe.md) — Tokens do design system desta feature
- [design-atoms.fe.md](./design-atoms.fe.md) — Átomos
- [design-molecules.fe.md](./design-molecules.fe.md) — Moléculas
- [design-organisms.fe.md](./design-organisms.fe.md) — Organismos
- [design-templates.fe.md](./design-templates.fe.md) — Templates
- [design-pages.fe.md](./design-pages.fe.md) — Páginas
- [design-governance.fe.md](./design-governance.fe.md) — Governança do design system
- Irmão social-care: [../social-care/design-tokens.fe.md](../social-care/design-tokens.fe.md)
- Irmão people-context: [../people-context/design-tokens.fe.md](../people-context/design-tokens.fe.md)
- Doc offline vanilla-extract: [../../reference/ui/vanilla-extract/](../../reference/ui/vanilla-extract/)
- Doc offline SolidStart: [../../reference/framework/solidstart/](../../reference/framework/solidstart/)
- Doc offline Elysia: [../../reference/framework/elysia/](../../reference/framework/elysia/)
- Doc offline Bun: [../../reference/runtime/bun/](../../reference/runtime/bun/)
