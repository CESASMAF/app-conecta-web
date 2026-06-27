# 04 · Organisms: Analysis BI Web

**Feature**: `specs/003-analysis-bi-web/design-system/` · **Nível**: Organisms (Atomic Design, Cap. 2)

> **Organismos** = seções relativamente complexas da interface, compostas de moléculas/átomos/outros
> organismos. Estabelecem padrões reutilizáveis e dão contexto. Vivem em `web_02/src/components/ui/m3/`
> (globais) ou em `web_02/src/features/003-analysis-bi/ui/` quando específicos da feature
> ([ADR-0001](../../adr/0001-vertical-modular-architecture.md)).
> Ficha por organismo (Frost, Cap. 3) — com **linhagem** e variações. Views burras: recebem
> **ViewModel** + handlers do **binding Solid** ([ADR-0009](../../adr/0009-framework-agnostic-client.md)), nunca chamam rota Elysia diretamente. Os organismos de
> **gráfico** são SVG próprio sobre tokens `--color-chart-*` (decisão de lib na `plan.fe.md`; este doc
> fixa API e comportamento, não a engine). Regra transversal de dataviz: **todo gráfico tem tabela de
> dados alternativa e exibe `SuppressionBanner` quando o recorte tiver supressão** ([design-governance.fe.md](./design-governance.fe.md) §3).

## Lista de organismos

### `AppShell` / `M3TopAppBar` — casca e barra superior (reuso integral)
- **Reuso?**: existem (`web_02/src/components/shell/`, `ui/m3/`) · **Escopo**: global — fichas completas em [../social-care/design-organisms.fe.md](../social-care/design-organisms.fe.md)
- **Composto de**: rail + user menu + network banner · back + título + slot de ações
- **Props (API)**: `{ user: SessionVM, children: JSX.Element }` · `{ title: string, onBack?: () => void, statusSlot?: JSX.Element, actions?: JSX.Element }`
- **Variações/estados**: nesta feature — item "Indicadores" no rail (`M3NavRailItem`); app bar dos dashboards com título do eixo e ação "Exportar este eixo"
- **Padrões de composição**: idem irmãos
- **Tokens**: `--color-bg-primary/secondary`, `zIndex.sticky`
- **Acessibilidade**: landmarks `nav`/`main`; título = `h1`
- **Usado em (linhagem)**: `ShellTemplate`, `DashboardTemplate`, `ExportTemplate`
- **Evidência**: `app-shell.component.tsx`, `app-nav.constants.tsx` existentes

### `DashboardFilterPanel` — painel de filtros persistente do dashboard (NOVO)
- **Reuso?**: novo · **Escopo**: `features/003-analysis-bi/ui` local (candidato a global, [design-governance.fe.md](./design-governance.fe.md) §2)
- **Composto de**: `M3PeriodRangeField` + `GranularitySelector` + `MesoregionFilter` + seletor de top N (`M3ChoiceChip`, só eixos epidemiológico/socioeconômico) + `M3Button` (tonal "Aplicar", text "Limpar")
- **Props (API)**: `{ filters: IndicatorFiltersVM, regions: { code: string, name: string }[], showTopN: boolean, showGranularity: boolean, pending: boolean, onApply: (f: IndicatorFiltersVM) => void, onClear: () => void }` — `IndicatorFiltersVM = { periodStart: string, periodEnd: string, granularity: "monthly" | "quarterly" | "yearly", mesoregion: string | null, top?: number }`
- **Variações/estados**: completo (5 controles) · sem top N (demographics/protection/care) · pendente (controles disabled durante fetch) · erro de validação local (período) · estado refletido na URL (search params da rota — filtros compartilháveis por link)
- **Padrões de composição**: controles dissimilares em linha única (wrap em `< md`); botão Aplicar é submit explícito — **não** refetch a cada tecla (mitiga o rate limit global, inconsistência #7 do [design-interface-inventory.fe.md](./design-interface-inventory.fe.md))
- **Tokens**: `--color-bg-elevated`, `--color-border-default`, `spacing.4`, `radius.lg`
- **Acessibilidade**: `<form role="search">` com `aria-label` "Filtros de indicadores"; submit por Enter; erro anunciado antes do fetch
- **Usado em (linhagem)**: header do `DashboardTemplate` (sticky); variação reduzida no `ExportPanel`
- **Evidência**: query params `period_start`, `period_end`, `granularity`, `mesoregion`, `top` de `GET /api/v1/indicators/{axis}`

### `AgePyramidChart` — pirâmide etária (barras espelhadas por sexo) (NOVO)
- **Reuso?**: novo · **Escopo**: local (primeiro organismo de dataviz da plataforma)
- **Composto de**: SVG de barras horizontais espelhadas (eixo central = faixas etárias; esquerda `sex=MALE`, direita `sex=FEMALE`; `UNKNOWN` em linha residual abaixo) + `M3SeriesLegendItem` × 3 + `M3ChartTooltip` + `M3EmptyState` + toggle "Ver como tabela" (`M3Table` com os mesmos dados)
- **Props (API)**: `{ items: DemographicItemVM[], suppressedGroups: number, pending: boolean, error?: string, onRetry: () => void }` — `DemographicItemVM = { ageBand: string, sex: "MALE" | "FEMALE" | "UNKNOWN", mesoregionName: string, value: number, period: string }`, imagem 1:1 dos labels `age_band`/`sex`/`mesoregion_name`
- **Variações/estados**: completa (até 17 faixas: "0-4"…"80+", ordenadas) · faixas ausentes (suprimidas K<5 — a faixa simplesmente não vem; pirâmide renderiza só o que chegou + `SuppressionBanner` no template) · vazia · carregando (skeleton de barras) · erro (retry) · modo tabela
- **Padrões de composição**: barras repetidas por faixa; legendas dissimilares no topo; ordenação fixa das 17 faixas (domínio conhecido), nunca pela ordem da resposta
- **Tokens**: `--color-chart-sex-male/-female/-unknown`, `--color-chart-grid/-axis`, `elevation.stateLayer.hover` (barra focada), `radius.sm`
- **Acessibilidade**: `role="img"` + `aria-label` resumo ("Pirâmide etária: maior grupo Feminino 25-29, 42 pessoas"); barras focáveis por teclado (setas) com tooltip; tabela alternativa é a mesma fonte de dados (não screenshot); posição (esq/dir) + cor + legenda = 3 canais
- **Usado em (linhagem)**: `DashboardTemplate` → página `/indicators/demographics`
- **Evidência**: `GET /api/v1/indicators/demographics` → labels `age_band`, `sex`, `mesoregion_name`; 17 age bands de 5 anos; mv_demographics

### `TopNBarChart` — barras de ranking top N (NOVO)
- **Reuso?**: novo · **Escopo**: local
- **Composto de**: SVG de barras horizontais ordenadas por valor + rótulo direto por barra (código mono + label) + `M3ChartTooltip` + `M3EmptyState` + toggle tabela
- **Props (API)**: `{ items: RankedItemVM[], codeKey: "icd_code" | "income_band" | "violation_type" | "destination" | "appointment_type", labelKey?: string, suppressedGroups: number, pending: boolean, error?: string, onRetry: () => void }` — genérico para os rankings dos eixos: CID-10 (`icd_code` + `icd_label`), renda (`income_band`), proteção (`violation_type`/`destination`), cuidado (`appointment_type`)
- **Variações/estados**: top N CID-10 (N ≤ 8, limite da paleta — tokens §4) · faixas de renda (6 barras em ordem fixa das faixas 0-0.5…5+ SM, **não** por valor) · categorias de proteção/cuidado · vazio · suprimido parcial · carregando · erro · modo tabela
- **Padrões de composição**: barras repetidas; 1 cor por categoria via `--color-chart-cat-1..N` em ordem; rótulo direto na barra reduz dependência da legenda
- **Tokens**: `--color-chart-cat-*`, `--color-chart-grid/-axis`, `typography.fontFamily.mono` (`icd_code`)
- **Acessibilidade**: lista semântica paralela (`ol` com "1º: E75.2 — Gangliosidose GM2, 37 casos"); barras focáveis; valores sempre visíveis (não só no hover)
- **Usado em (linhagem)**: `DashboardTemplate` → `/indicators/epidemiological` (top CID-10), `/indicators/socioeconomic` (faixas de renda, benefícios), `/indicators/protection`, `/indicators/care`
- **Evidência**: `top=<N>` (epidemiological/socioeconomic); labels `icd_code`/`icd_label`, `income_band`, `violation_type`/`destination`, `appointment_type`; dim_benefit_type (BPC, PBF…)

### `IndicatorTimeSeriesChart` — série temporal com gaps tratados (NOVO)
- **Reuso?**: novo · **Escopo**: local
- **Composto de**: SVG de linhas/colunas por período + eixo X de `M3PeriodLabel` (axis) + `M3SeriesLegendItem` por série + `M3ChartTooltip` + nota de gap + `M3EmptyState` + toggle tabela
- **Props (API)**: `{ series: { key: string, label: string, colorToken: ChartColorToken, points: { period: string, value: number | null }[] }[], granularity: "monthly" | "quarterly" | "yearly", suppressedGroups: number, pending: boolean, error?: string, onRetry: () => void }` — os `points` chegam **já normalizados pelo ViewModel**: o binding Solid gera o calendário contínuo entre `period_start` e `period_end` na granularidade ativa e preenche períodos ausentes com `value: null` (séries esparsas — inconsistência #3 do [design-interface-inventory.fe.md](./design-interface-inventory.fe.md))
- **Variações/estados**: contínua · com gaps (`null` → segmento interrompido/tracejado `--color-chart-grid` + nota "períodos sem dados publicados"; **nunca** interpolar nem assumir zero) · granularidade mensal/trimestral/anual (densidade do eixo X) · série única vs. múltipla (ex.: casos novos vs. acumulados) · vazia · carregando · erro
- **Padrões de composição**: pontos repetidos por período; legenda dissimilar; máx. 8 séries (paleta)
- **Tokens**: `--color-chart-cat-*` (séries), `--color-chart-grid/-axis`, `--color-info-500` (nota de gap)
- **Acessibilidade**: resumo textual da tendência em `aria-label`; navegação por teclado ponto a ponto; gaps anunciados ("março de 2025: sem dados"); tabela alternativa inclui as linhas de gap
- **Usado em (linhagem)**: `DashboardTemplate` → todos os 5 eixos (evolução no período filtrado)
- **Evidência**: campo `period` por item; granularidades `"2025-03"`/`"2025-Q1"`/`"2025"`; limitação "períodos sem dados NÃO aparecem" (§5 do mapa)

### `MesoregionBreakdownPanel` — desagregação por mesorregião (tabela; mapa futuro) (NOVO)
- **Reuso?**: novo (compõe `M3Table` existente) · **Escopo**: local
- **Composto de**: `M3SectionHeader` ("Por mesorregião") + `M3Table` (nome da mesorregião · valor `M3KpiValue` inline · barra proporcional com rampa `--color-chart-seq-*`) + `M3EmptyState`
- **Props (API)**: `{ rows: { mesoregionName: string, value: number, share: number }[], suppressedGroups: number, pending: boolean, onSelectRegion?: (code: string | null) => void }` — `share` (proporção 0–1) calculado pelo ViewModel **somente para a largura da barra** (apresentação, não indicador novo); `onSelectRegion` aplica o filtro `mesoregion` do painel
- **Variações/estados**: completa (ordenada por valor) · com supressão (mesorregiões K<5 ausentes + variante compacta do `SuppressionBanner`) · filtrada (1 região selecionada — painel mostra só ela e oferece "limpar") · vazia · carregando · **mapa coroplético = reservado para futuro** (depende de `GET /api/v1/metadata/regions`, hoje 501, + geometria IBGE — placeholder documentado, sem stub na UI)
- **Padrões de composição**: linhas repetidas; barra proporcional é redundância visual do valor numérico (sempre exibido)
- **Tokens**: `--color-chart-seq-1..5` (intensidade), `--color-border-default`, `typography.fontFamily.mono` (código)
- **Acessibilidade**: tabela semântica com caption; barra `aria-hidden` (valor textual é a fonte); linha selecionável com `aria-label` ("Filtrar por Norte de Roraima")
- **Usado em (linhagem)**: `DashboardTemplate` → todos os eixos (quando a resposta traz `mesoregion_name`)
- **Evidência**: label `mesoregion_name`; filtro `mesoregion=<code>`; dim_geography (mesorregião/microrregião/UF); `configs/ibge_mesoregions.csv`

### `ExportPanel` — painel de exportação em 8 formatos (NOVO)
- **Reuso?**: novo · **Escopo**: local
- **Composto de**: seletor de dataset (`M3DropdownField` com os 5 eixos de `GET /metadata/datasets`) + `M3PeriodRangeField` + `MesoregionFilter` + grade de 8 cards de formato (nome amigável + descrição + `M3DataField` com extensão/content-type) + `M3Button` filled ("Exportar") + `SuppressionBanner`
- **Props (API)**: `{ datasets: DatasetVM[], formats: FormatVM[], selection: ExportSelectionVM, downloading: boolean, error?: string, onSelect: (s: Partial<ExportSelectionVM>) => void, onExport: () => void }` — `formats` vem de `GET /api/v1/metadata/formats` (`{ name, content_type, extension }`); nomes amigáveis fixados no i18n: **CSV** (planilhas em geral) · **JSON** (integrações) · **XML** (sistemas legados) · **Parquet** (análise de dados) · **DBF/TABWIN** (TabWin/DataSUS) · **DBC/DataSUS** (compactado DataSUS) · **ODS** (LibreOffice) · **FHIR/RNDS** (Bundle R4 BR Core)
- **Variações/estados**: formato selecionado · download em voo (`downloading` — botão pending; arquivos grandes: Parquet/FHIR) · sucesso (download disparado via `Content-Disposition: attachment; filename="acdg-{dataset}-{period}.{ext}"` — o BFF Elysia repassa o stream; browser nunca vê URL do backend, [Princípio I](../../../.specify/memory/constitution.md)) · erro 400 (filtros inválidos) · 429 (aguarde e tente de novo) · 503 (indisponível) · aviso de supressão (o export aplica o **mesmo** K=5 — o arquivo também omite células K<5)
- **Padrões de composição**: cards de formato repetidos (grade 2×4 / 4×2); filtros dissimilares acima; 1 formato selecionável por vez (radiogroup de cards)
- **Tokens**: `--color-bg-elevated`, `--color-border-active` (card selecionado), `radius.lg`, `--color-banner-suppression-*`
- **Acessibilidade**: grade como `role="radiogroup"` ("Formato do arquivo"); card com nome + descrição lidos juntos; download anunciado em `aria-live` ("Arquivo acdg-demographics-2025.csv pronto")
- **Usado em (linhagem)**: `ExportTemplate` → página `/exports`
- **Evidência**: `GET /api/v1/export/{format}?dataset&period_start&period_end&mesoregion`; `GET /api/v1/metadata/{datasets,formats}`; 8 encoders (§5 do mapa)

## Cobertura vs. inventory

| Organismo do inventory | Coberto? | Documento |
|---|---|---|
| Shell + navegação | ✅ (reuso) | `AppShell`, `M3TopAppBar` |
| Painel de filtros do dashboard | ✅ (novo) | `DashboardFilterPanel` |
| Pirâmide etária (barras espelhadas por sexo) | ✅ (novo) | `AgePyramidChart` |
| Barras top N (CID-10, renda, proteção, cuidado) | ✅ (novo) | `TopNBarChart` |
| Série temporal com gaps | ✅ (novo) | `IndicatorTimeSeriesChart` |
| Tabela/mapa por mesorregião | ✅ (novo; mapa = futuro) | `MesoregionBreakdownPanel` |
| Painel de export (8 formatos, nomes amigáveis) | ✅ (novo) | `ExportPanel` |
| Banner de supressão / estados vazios | ✅ (moléculas) | [design-molecules.fe.md](./design-molecules.fe.md) → `SuppressionBanner`, `M3EmptyState` |

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípios I (BFF boundary), III (MVVM: views burras), VI (Honesty/No Mocks)
- [ADR-0001](../../adr/0001-vertical-modular-architecture.md) — escopo local vs. global de organismos
- [ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md) — fronteira client↔server; organismos só consomem ViewModel
- [ADR-0009](../../adr/0009-framework-agnostic-client.md) — ViewModel puro + binding Solid + Command; organismos são views burras
- [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md) — BFF Elysia; organismos nunca chamam `*.query.fn` diretamente
- [ADR-0011](../../adr/0011-no-mocks-in-production.md) — sem mocks em `src/`; fixtures só em `tests/`
- [design-molecules.fe.md](./design-molecules.fe.md) — moléculas compostas aqui
- [design-templates.fe.md](./design-templates.fe.md) — templates que posicionam estes organismos
- [design-tokens.fe.md](./design-tokens.fe.md) — tokens `--color-chart-*`
- [design-governance.fe.md](./design-governance.fe.md) — regras de dataviz (tabela alternativa, a11y, cor nunca único canal)
- Irmão social-care: [../social-care/design-organisms.fe.md](../social-care/design-organisms.fe.md)
- Doc offline vanilla-extract: [../../reference/ui/vanilla-extract/](../../reference/ui/vanilla-extract/)
- Doc offline GSAP: [../../reference/ui/gsap/](../../reference/ui/gsap/)
- Doc offline SolidStart: [../../reference/framework/solidstart/](../../reference/framework/solidstart/)
