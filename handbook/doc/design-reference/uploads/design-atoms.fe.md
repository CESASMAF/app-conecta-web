# 02 · Atoms: Analysis BI Web

**Feature**: `specs/003-analysis-bi-web/design-system/` · **Nível**: Atoms (Atomic Design, Cap. 2)

> **Átomos** = blocos elementares de UI que não se decompõem sem perder função (Button, Input, Label,
> Badge, Icon…). Vivem em `web_02/src/components/ui/m3/` (Atomic: `tokens ← atoms`). São burros, só-tokens,
> nomeados pelo papel, construídos com **vanilla-extract** sobre os tokens do design system
> ([ADR-0007](../../adr/0007-design-system-vanilla-extract.md)). Ficha por átomo segue as
> qualidades de pattern library (Frost, Cap. 3): descrição, props, estados/variações, tokens, a11y,
> **linhagem** (onde é usado). Reusos do catálogo dos irmãos têm ficha completa em
> [../social-care/design-atoms.fe.md](../social-care/design-atoms.fe.md) e
> [../people-context/design-atoms.fe.md](../people-context/design-atoms.fe.md) —
> aqui só a variação desta feature. Os 4 átomos novos são os primeiros **átomos de dataviz** da
> plataforma.

## Lista de átomos (novos ou reusados)

### `M3Button` — ação (reuso)
- **Reuso?**: já existe em `ui/m3/M3Button/` (ficha completa no conjunto social-care)
- **Props (API)**: `{ variant: "filled" | "tonal" | "outlined" | "text" | "destructive", size, disabled, pending, onPress, children }`
- **Variações/estados**: nesta feature — filled ("Exportar", dispara download), tonal ("Aplicar filtros"), text ("Limpar filtros", "Ver como tabela", "Tentar de novo"); pending durante geração do export (payload pode ser pesado — Parquet/FHIR)
- **Tokens usados**: `--color-action-primary*`, `elevation.stateLayer`, `radius.full`
- **Acessibilidade**: foco visível; `aria-disabled` em pending; composição Solid pura (sem dependência de React Aria)
- **Usado em (linhagem)**: `DashboardFilterPanel`, `ExportPanel`, estados de erro (retry)
- **Evidência**: `GET /api/v1/export/{format}` (download); filtros de `GET /api/v1/indicators/{axis}`

### `M3BackButton` / `M3MenuButton` — navegação e menu contextual (reuso)
- **Reuso?**: já existem (ficha no conjunto social-care)
- **Props (API)**: `{ onPress }` · `{ items: MenuItem[], onAction }`
- **Variações/estados**: nesta feature, o menu kebab do card de gráfico oferece "Ver como tabela" e "Exportar este eixo" (atalho pra `/exports?dataset=<axis>`)
- **Tokens usados**: `--color-text-secondary`, `elevation.stateLayer`, `zIndex.dropdown`
- **Acessibilidade**: `aria-haspopup` no botão de menu; foco gerenciado pelo binding Solid
- **Usado em (linhagem)**: `M3TopAppBar` (voltar à home de indicadores), header dos cards de gráfico
- **Evidência**: rotas `/indicators/*` → `/indicators`; `?dataset=` do export

### `M3ChoiceChip` — seleção exclusiva curta (reuso)
- **Reuso?**: já existe (ficha no conjunto social-care)
- **Props (API)**: `{ options, value, onChange }` (composição Solid com `createSignal` interno)
- **Variações/estados**: nesta feature é a base composicional do `M3GranularityChip` (abaixo) e do seletor de top N (5/8) no eixo epidemiológico
- **Tokens usados**: `--color-action-primary`, `--color-border-default`, `radius.full`, `elevation.stateLayer`
- **Acessibilidade**: `role="radiogroup"`; navegação por setas
- **Usado em (linhagem)**: `GranularitySelector`, `DashboardFilterPanel`
- **Evidência**: query `granularity=monthly|quarterly|yearly`; `top=<N>`

### `M3GranularityChip` — opção de granularidade temporal (NOVO)
- **Reuso?**: novo — especialização visual do `M3ChoiceChip` para o eixo temporal; nasce em `ui/m3/` (qualquer feature futura com séries temporais reusa)
- **Props (API)**: `{ granularity: "monthly" | "quarterly" | "yearly", selected: boolean, onPress: () => void }` — variantes = imagem 1:1 do enum `granularity` do serviço (default `monthly`); labels i18n "Mensal" / "Trimestral" / "Anual"
- **Variações/estados**: selecionado · não selecionado · disabled (eixo sem série temporal)
- **Tokens usados**: herdados de `M3ChoiceChip` (`--color-action-primary`, `radius.full`) — nenhum token novo
- **Acessibilidade**: parte de `role="radiogroup"` ("Granularidade"); estado anunciado via `aria-checked`
- **Usado em (linhagem)**: `GranularitySelector` (molécula) → `DashboardFilterPanel`
- **Evidência**: `granularity=monthly|quarterly|yearly` em `GET /api/v1/indicators/{axis}`; formatos de período `"2025-03"` / `"2025-Q1"` / `"2025"`

### `M3SeriesLegendItem` — entrada de legenda de série (NOVO)
- **Reuso?**: novo — primeiro átomo de dataviz; nasce em `ui/m3/`
- **Props (API)**: `{ label: string, colorToken: ChartColorToken, shape?: "square" | "line", muted?: boolean, onPress?: () => void }` — `colorToken` é **nome de token** (`--color-chart-cat-3`, `--color-chart-sex-female`…), tipado como union dos tokens `chart-*`; literal de cor é proibido na API (governance test em [ADR-0007](../../adr/0007-design-system-vanilla-extract.md))
- **Variações/estados**: default · muted (série ocultada por toque na legenda) · interativa (`onPress` alterna a série) · estática (sem `onPress`)
- **Tokens usados**: `--color-chart-cat-*` / `--color-chart-sex-*` (swatch), `--color-text-secondary` (label), `typography.fontSize.xs`, `radius.sm`
- **Acessibilidade**: swatch `aria-hidden`; quando interativa, é botão Solid com `aria-pressed` ("Ocultar série Feminino"); cor nunca é o único canal — label textual sempre presente
- **Usado em (linhagem)**: `AgePyramidChart`, `TopNBarChart`, `IndicatorTimeSeriesChart` (legendas)
- **Evidência**: séries derivadas dos labels do contrato (`sex`, `icd_label`, `income_band`, `violation_type`, `appointment_type`)

### `M3KpiValue` — valor agregado de indicador (NOVO)
- **Reuso?**: novo — átomo de dataviz; nasce em `ui/m3/`
- **Props (API)**: `{ value: number | null, format: "integer" | "decimal" | "percent" | "currency", unitLabel?: string }` — formata via `Intl.NumberFormat` pt-BR (Princípio IV — zero libs de formatação); `null` exibe "—"
- **Variações/estados**: inteiro (contagens: `value` dos itens, `total_records`) · decimal (média de `assessment_completeness` 0–1, `avg_family_size`) · percent (completude exibida como %) · currency (`total_amount` de benefícios) · vazio ("—") · skeleton
- **Tokens usados**: `typography.fontFamily.mono` + `fontSize.3xl/4xl`, `--color-text-primary`; **nunca** semáforo automático — tom é decidido pelo card pai quando houver regra de domínio
- **Acessibilidade**: `aria-label` composto com unidade por extenso ("1.247 registros"); separador de milhar pt-BR
- **Usado em (linhagem)**: `M3KpiCard` (molécula) → home de indicadores e topo dos dashboards
- **Evidência**: `meta.total_records`; agregações COUNT/SUM/AVG do serviço (§5 do mapa)

### `M3PeriodLabel` — rótulo de período por granularidade (NOVO)
- **Reuso?**: novo — átomo de dataviz; nasce em `ui/m3/`
- **Props (API)**: `{ period: string, granularity: "monthly" | "quarterly" | "yearly", variant?: "axis" | "inline" }` — parser dos 3 formatos do contrato: `"2025-03"` → "mar/2025", `"2025-Q1"` → "T1 2025", `"2025"` → "2025"; formatação via `Intl.DateTimeFormat`, sem date-libs (Princípio IV)
- **Variações/estados**: axis (curto, eixos de gráfico) · inline (extenso em tooltips/banners: "março de 2025") · range (composto pela molécula `M3PeriodRangeField`, não por este átomo)
- **Tokens usados**: `--color-text-secondary` (axis) / `--color-text-primary` (inline), `typography.fontSize.xs/sm`
- **Acessibilidade**: `<time dateTime>` com o valor cru do contrato; leitura por extenso no `aria-label`
- **Usado em (linhagem)**: eixos do `IndicatorTimeSeriesChart`, `M3ChartTooltip`, `M3KpiCard` (contexto do período), header do `DashboardTemplate`
- **Evidência**: campo `period` por item (`"2025-03"`) e `meta.period` (`"2025-01/2026-03"`); granularidades §5 do mapa

## Cobertura vs. inventory

| Átomo do inventory | Coberto? | Documento |
|---|---|---|
| Botões (filled/tonal/text, retry) | ✅ (reuso) | `M3Button` |
| Voltar / menu kebab do card | ✅ (reuso) | `M3BackButton` / `M3MenuButton` |
| Chip de escolha (top N) | ✅ (reuso) | `M3ChoiceChip` |
| Chip de granularidade | ✅ (novo) | `M3GranularityChip` |
| Legenda de série (swatch + label) | ✅ (novo) | `M3SeriesLegendItem` |
| Valor de KPI | ✅ (novo) | `M3KpiValue` |
| Label de período (mensal/trimestral/anual) | ✅ (novo) | `M3PeriodLabel` |
| Seletor de período, filtro de mesorregião, banner de supressão, tooltip | ⬜ (são moléculas) | [design-molecules.fe.md](./design-molecules.fe.md) |

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípios IV (Bun-Native/zero-npm), V (TypeScript estrito)
- [ADR-0007](../../adr/0007-design-system-vanilla-extract.md) — vanilla-extract, tokens só-tokens, proibição de literal de cor
- [ADR-0009](../../adr/0009-framework-agnostic-client.md) — ViewModel puro; átomos são burros (sem `solid-js` no núcleo)
- [design-interface-inventory.fe.md](./design-interface-inventory.fe.md) — inventário de todos os elementos
- [design-molecules.fe.md](./design-molecules.fe.md) — moléculas que compõem estes átomos
- [design-tokens.fe.md](./design-tokens.fe.md) — tokens `--color-chart-*` usados nesta ficha
- Irmão social-care (fichas completas dos átomos reutilizados): [../social-care/design-atoms.fe.md](../social-care/design-atoms.fe.md)
- Irmão people-context: [../people-context/design-atoms.fe.md](../people-context/design-atoms.fe.md)
- Doc offline vanilla-extract: [../../reference/ui/vanilla-extract/](../../reference/ui/vanilla-extract/)
- Doc offline SolidStart: [../../reference/framework/solidstart/](../../reference/framework/solidstart/)
