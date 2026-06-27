# 05 · Templates: Analysis BI Web

**Feature**: `specs/003-analysis-bi-web/design-system/` · **Nível**: Templates (Atomic Design, Cap. 2)

> **Templates** = objetos no nível de página que posicionam organismos num **layout** e articulam a
> **estrutura de conteúdo** — o esqueleto, sem conteúdo final. Definem guardrails do conteúdo dinâmico
> (dimensões, limites de caracteres, nº de colunas). No web-app SolidStart, um template ≈ o arquivo
> `*.page.tsx` "burro" que **liga o ViewModel + binding Solid** ([ADR-0009](../../adr/0009-framework-agnostic-client.md)) + compõe organismos. **Foco em estrutura, não em dados reais**
> (isso é o [design-pages.fe.md](./design-pages.fe.md)).
>
> Esta feature reutiliza o `ShellTemplate` do conjunto social-care
> ([../social-care/design-templates.fe.md](../social-care/design-templates.fe.md)) e introduz **dois templates novos** — o
> `DashboardTemplate` (primeiro layout de visualização de dados da plataforma) e o `ExportTemplate`.
> Nenhum dos templates de prontuário/formulário dos irmãos se aplica aqui: não há entidade individual
> nem mutação — todas as telas são consulta agregada + download.

## Lista de templates de layout

### `ShellTemplate` — casca autenticada (reuso integral)
- **Layout**: nav rail fixo à esquerda (72px; bottom tabs < `md`) + `M3TopAppBar` sticky + área de conteúdo (max-width 1200px, `spacing.6` de gutter) — idêntico aos irmãos
- **Organismos posicionados**: `AppShell` + slot de página; variação desta feature: item "Indicadores" no rail (`M3NavRailItem`), sem `M3CountBadge` (não há pendências — só consulta)
- **Estrutura de conteúdo (guardrails)**: título da app bar ≤ 1 linha (truncate); nos dashboards o título é o nome do eixo + ação "Exportar este eixo" no slot de ações
- **Regiões dinâmicas / slots**: conteúdo da rota filha; ações da app bar por página
- **Mapeia para**: `src/routes/_auth/route.tsx` (layout route SolidStart, já existente) + `web_02/src/components/shell/`
- **Rota(s)**: todas sob `/_auth`

### `DashboardTemplate` — dashboard de eixo com filtros persistentes (NOVO)
- **Layout**: `M3TopAppBar` (voltar à home + título do eixo + ação Exportar) → **header de filtros sticky** (`DashboardFilterPanel`, gruda sob a app bar ao rolar — os filtros governam TUDO abaixo) → `SuppressionBanner` condicional full-width → faixa de KPIs (grid 2–4 × `M3KpiCard`) → grid de cards de gráfico (1 coluna < `lg`, 2 colunas ≥ `lg`; gráfico principal do eixo ocupa as 2 colunas) → `MesoregionBreakdownPanel` full-width no rodapé
- **Organismos posicionados**: `DashboardFilterPanel` + (`AgePyramidChart` | `TopNBarChart` | `IndicatorTimeSeriesChart`, conforme o eixo) + `MesoregionBreakdownPanel`; cada gráfico vive num card com `M3SectionHeader` (título + menu "Ver como tabela"/"Exportar")
- **Estrutura de conteúdo (guardrails)**: 1 conjunto de filtros por página (nunca filtro local por gráfico — coerência do recorte é invariante); KPIs: valor ≤ 12 dígitos com separador pt-BR; card de gráfico com altura fixa por tipo (pirâmide 480px, barras 360px, série 320px) e título ≤ 1 linha; máx. 8 séries/categorias por gráfico (paleta `--color-chart-cat-1..8`); tabela alternativa dentro do card (toggle, mesma altura); sem paginação — payload completo do serviço (< 1000 rows/query por construção K=5 + filtros)
- **Regiões dinâmicas / slots**: composição de gráficos por eixo (cada página instancia os organismos do seu contrato); visibilidade de `top N`/granularidade no painel de filtros; banner de supressão condicional a `meta.suppressed_groups > 0`; filtros serializados nos search params da rota SolidStart (link compartilhável)
- **Mapeia para**: `features/003-analysis-bi/ui/axis-dashboard.page.tsx` (uma instância por eixo)
- **Rota(s)**: `/indicators/demographics`, `/indicators/epidemiological`, `/indicators/socioeconomic`, `/indicators/protection`, `/indicators/care`

### `ExportTemplate` — central de exportação (NOVO)
- **Layout**: `M3TopAppBar` (voltar + "Exportar dados") → coluna única (max-width 920px): seção de recorte (dataset + período + mesorregião) → grade de formatos (2×4 ≥ `md`, 1 coluna < `md`) → rodapé sticky com resumo da seleção ("demographics · 2025-01 a 2025-12 · todas as regiões · CSV") + `M3Button` "Exportar" → `SuppressionBanner` condicional acima do rodapé
- **Organismos posicionados**: `ExportPanel` (contém os filtros reduzidos, a grade de formatos e o CTA)
- **Estrutura de conteúdo (guardrails)**: exatamente 8 cards de formato (contrato fechado — novos formatos exigem novo encoder no serviço); card com nome amigável ≤ 2 palavras + descrição ≤ 2 linhas + extensão/content-type em mono; nome do arquivo previsto exibido no resumo (`acdg-{dataset}-{period}.{ext}`); 1 download por vez (CTA trava em pending)
- **Regiões dinâmicas / slots**: dataset pré-selecionado quando navegado de um dashboard (`?dataset=<axis>`); estados de erro (400/429/503) substituem o rodapé por aviso com retry
- **Mapeia para**: `features/003-analysis-bi/ui/export-center.page.tsx`
- **Rota(s)**: `/exports`

### Home de indicadores — variação do `ShellTemplate` (sem template novo)
- **Layout**: header da página ("Indicadores") + parágrafo de contexto (dados agregados e anônimos, K=5) → grid de 5 `M3KpiCard` clicáveis (1 por eixo, 2–3 colunas) + card de atalho "Exportar dados" → sem painel de filtros (a home usa período default — últimos 12 meses — calculado no ViewModel)
- **Organismos posicionados**: nenhum organismo de gráfico — só moléculas (`M3KpiCard`) sobre o `ShellTemplate`; decisão: home leve, gráficos só nos dashboards
- **Estrutura de conteúdo (guardrails)**: 5 cards de eixo + 1 de export; card com nome do eixo ≤ 2 linhas + 1 KPI síntese + período de referência
- **Regiões dinâmicas / slots**: KPI síntese por eixo (total de registros do período default)
- **Mapeia para**: `features/003-analysis-bi/ui/indicators-home.page.tsx`
- **Rota(s)**: `/indicators`

## Matriz template × comportamento

| Template | Comportamentos que usam | Variações de layout |
|---|---|---|
| `ShellTemplate` | todas as páginas autenticadas da feature | rail lateral (≥ md) vs. bottom tabs (mobile); item "Indicadores" ativo |
| `ShellTemplate` (variação home) | home de indicadores | grid de 5 cards de eixo + atalho de export; sem filtros |
| `DashboardTemplate` | 5 dashboards de eixo | composição de gráficos por eixo (pirâmide / top N / série / faixas); com/sem seletor de top N e granularidade; com/sem `SuppressionBanner` |
| `ExportTemplate` | central de exports | dataset livre vs. pré-selecionado (`?dataset=`); rodapé normal vs. estado de erro |

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípios I (BFF boundary), III (MVVM: template liga ViewModel + binding Solid)
- [ADR-0001](../../adr/0001-vertical-modular-architecture.md) — rotas file-based SolidStart em `src/routes/`
- [ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md) — fronteira client↔server; templates são client-only
- [ADR-0009](../../adr/0009-framework-agnostic-client.md) — ViewModel puro + binding Solid + Command; template é o ponto de ligação
- [ADR-0012](../../adr/0012-shell-as-root-screen-mvvm.md) — Shell autenticado como tela MVVM raiz
- [design-organisms.fe.md](./design-organisms.fe.md) — organismos posicionados aqui
- [design-pages.fe.md](./design-pages.fe.md) — instâncias concretas destes templates
- [design-governance.fe.md](./design-governance.fe.md) — guardrails e regras de evolução
- Irmão social-care (ShellTemplate): [../social-care/design-templates.fe.md](../social-care/design-templates.fe.md)
- Doc offline SolidStart (file-based routing): [../../reference/framework/solidstart/](../../reference/framework/solidstart/)
- Doc offline vanilla-extract (layout tokens): [../../reference/ui/vanilla-extract/](../../reference/ui/vanilla-extract/)
