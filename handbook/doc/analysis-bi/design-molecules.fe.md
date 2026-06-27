# 03 · Molecules: Analysis BI Web

**Feature**: `specs/003-analysis-bi-web/design-system/` · **Nível**: Molecules (Atomic Design, Cap. 2)

> **Moléculas** = grupos simples de átomos funcionando como uma unidade com propósito (single
> responsibility: "faz uma coisa bem"). Vivem em `web_02/src/components/ui/m3/` (globais) ou em
> `web_02/src/features/003-analysis-bi/ui/` (locais). Compõem só átomos (e tokens), sem lógica de
> negócio — dados e handlers chegam prontos do **ViewModel** ([ADR-0009](../../adr/0009-framework-agnostic-client.md)).
> Ficha por molécula (Frost, Cap. 3). Reusos do catálogo dos irmãos: ficha completa em
> [../social-care/design-molecules.fe.md](../social-care/design-molecules.fe.md) e
> [../people-context/design-molecules.fe.md](../people-context/design-molecules.fe.md).

## Lista de moléculas

### `M3PeriodRangeField` — seletor de intervalo de período `YYYY-MM` (NOVO)
- **Reuso?**: nova — nasce em `ui/m3/` (qualquer consulta temporal futura reusa); composta sobre primitivos Solid, parente do `M3DateField` do social-care porém com precisão **mês**, não dia
- **Composta de (átomos)**: 2 campos mês/ano (início e fim) + `M3PeriodLabel` (preview do intervalo) + mensagem de erro
- **Props (API)**: `{ start: string, end: string, onChange: (v: { start: string, end: string }) => void, minValue?: string, maxValue?: string, errorMessage?: string }` — emite e recebe o formato cru do contrato (`"2025-01"`), exibição `mm/aaaa`
- **Comportamento**: valida localmente o que o serviço rejeitaria com 400 — formato `YYYY-MM` e `end ≥ start` — antes de emitir; **nunca** monta query string (isso é do ViewModel)
- **Variações/estados**: vazio (obrigatório — `period_start`/`period_end` são required) · preenchido · erro de formato · erro de intervalo invertido · disabled (durante fetch)
- **Tokens**: `--color-border-*`, `--color-text-error`, `radius.md`, `spacing.4`
- **Acessibilidade**: grupo com label "Período (início e fim)"; erro em `aria-describedby`; campos navegáveis por teclado (mês/ano segmentados, composição Solid pura)
- **Usado em (linhagem)**: `DashboardFilterPanel`, `ExportPanel`
- **Evidência**: `period_start=YYYY-MM` e `period_end=YYYY-MM` obrigatórios; erro 400 `"invalid period_start: expected YYYY-MM format"`

### `GranularitySelector` — seletor de granularidade (NOVO)
- **Reuso?**: nova — local em `features/003-analysis-bi/ui/` até segunda feature temporal (critério de promoção em [design-governance.fe.md](./design-governance.fe.md) §2)
- **Composta de (átomos)**: 3 × `M3GranularityChip` em grupo exclusivo
- **Props (API)**: `{ value: "monthly" | "quarterly" | "yearly", onChange: (v: "monthly" | "quarterly" | "yearly") => void, disabled?: boolean }` — default `monthly` (espelha o default do serviço)
- **Comportamento**: troca de granularidade reseta a série exibida (períodos mudam de formato: `2025-03` → `2025-Q1` → `2025`); o refetch é do ViewModel (via `createAsync`/`action` do `@solidjs/router`)
- **Variações/estados**: monthly · quarterly · yearly · disabled (eixo sem visão temporal)
- **Tokens**: herdados de `M3GranularityChip`
- **Acessibilidade**: `role="radiogroup"` com legenda "Granularidade"; setas navegam entre as 3 opções
- **Usado em (linhagem)**: `DashboardFilterPanel`
- **Evidência**: `granularity=monthly|quarterly|yearly` (default monthly) em todos os eixos

### `MesoregionFilter` — filtro de mesorregião IBGE (NOVO)
- **Reuso?**: nova — local; composta sobre `M3DropdownField` (reuso do social-care)
- **Composta de (átomos)**: `M3DropdownField` (label "Mesorregião") + opção "Todas" + botão limpar
- **Props (API)**: `{ regions: { code: string, name: string }[], selectedCode: string | null, onChange: (code: string | null) => void, pending?: boolean }` — `null` = sem filtro (todas)
- **Comportamento**: emite o **código** IBGE (query `mesoregion=<code>`), exibe o nome; catálogo v1 vem do BFF Elysia (estático, derivado de `configs/ibge_mesoregions.csv` — `GET /api/v1/metadata/regions` é 501/array vazio, inconsistência #5 do [design-interface-inventory.fe.md](./design-interface-inventory.fe.md))
- **Variações/estados**: todas (sem filtro) · selecionada · carregando catálogo · código inexistente vindo da URL (limpa + avisa — o serviço responderia 400)
- **Tokens**: herdados de `M3DropdownField`; código em `typography.fontFamily.mono` no item
- **Acessibilidade**: composição Solid com `Select` semântico (combobox ARIA); opção ativa anunciada; "Todas" é a opção default explícita
- **Usado em (linhagem)**: `DashboardFilterPanel`, `ExportPanel`, `MesoregionBreakdownPanel` (drill por seleção)
- **Evidência**: query `mesoregion=<code>` opcional; label `mesoregion_name` nas respostas; ~137 mesorregiões IBGE

### `M3KpiCard` — card de indicador agregado (NOVO)
- **Reuso?**: nova — nasce em `ui/m3/`; parente do `M3StatCard` do social-care (lá: analytics por prontuário; aqui: agregado populacional com contexto de período) — convergência avaliada na governança §2
- **Composta de (átomos)**: label do indicador + `M3KpiValue` + `M3PeriodLabel` (inline) + nota opcional (ex.: "referência SM 2024")
- **Props (API)**: `{ label: string, value: number | null, format: "integer" | "decimal" | "percent" | "currency", unitLabel?: string, period: string, granularity: "monthly" | "quarterly" | "yearly", footnote?: string, pending?: boolean, href?: string }`
- **Comportamento**: apresentação pura; `href` opcional leva ao dashboard do eixo (cards da home); **a UI nunca recalcula** — exibe valores agregados como vêm do serviço
- **Variações/estados**: preenchido · vazio (`value: null` → "—", quando todo o eixo foi suprimido ou sem dados) · skeleton · clicável (home) · estático (topo do dashboard)
- **Tokens**: `--color-bg-elevated`, `radius.lg`, `elevation.shadow.sm`, `spacing.4/6`
- **Acessibilidade**: card clicável é link com `aria-label` composto ("Demográfico: 1.247 registros, janeiro a dezembro de 2025"); valor + label lidos como unidade
- **Usado em (linhagem)**: home `/indicators` (5 cards de eixo), faixa de KPIs do `DashboardTemplate`
- **Evidência**: `meta.total_records`; COUNT/SUM/AVG por eixo (§5/§8 do mapa)

### `M3ChartTooltip` — tooltip de ponto/barra de gráfico (NOVO)
- **Reuso?**: nova — nasce em `ui/m3/` (compartilhada por todos os organismos de gráfico)
- **Composta de (átomos)**: `M3SeriesLegendItem` (estático, identifica a série) + pares label/valor (`labels` do item) + `M3KpiValue` (inline) + `M3PeriodLabel`
- **Props (API)**: `{ series: { label: string, colorToken: ChartColorToken }, entries: { label: string, value: number | null }[], period: string, granularity: "monthly" | "quarterly" | "yearly" }`
- **Comportamento**: posicionada pelo organismo de gráfico; mostra o item **exatamente** como o contrato entrega (ex.: `age_band: "25-29"`, `sex: "FEMALE"` → "Feminino", `mesoregion_name`, `value: 42`); some em `Esc`
- **Variações/estados**: ponto único · barra (pirâmide: faixa + sexo + valor) · multi-entrada (mesma posição, várias séries)
- **Tokens**: `--color-bg-elevated`, `elevation.shadow.md`, `zIndex.tooltip`, `radius.md`, `typography.fontSize.xs`
- **Acessibilidade**: não é o único acesso ao dado — todo gráfico tem tabela alternativa ([design-governance.fe.md](./design-governance.fe.md) §3); exibida também em **foco de teclado**, não só hover; conteúdo espelhado em `aria-label` do elemento focado
- **Usado em (linhagem)**: `AgePyramidChart`, `TopNBarChart`, `IndicatorTimeSeriesChart`
- **Evidência**: item de resposta `{ labels: {...}, value, period }` (§5 do mapa)

### `SuppressionBanner` — aviso de supressão por privacidade K=5 (NOVO)
- **Reuso?**: nova — local em `features/003-analysis-bi/ui/` (padrão de banner análogo ao `LgpdAnonymizedBanner` do social-care e ao `IdpRetryBanner` do people-context); promover se outra feature exibir agregados K-anônimos
- **Composta de (átomos)**: ícone de privacidade + texto + link "Entenda" (explicação do K-anonimato)
- **Props (API)**: `{ suppressedGroups: number, kThreshold: number }` — texto i18n: "{suppressedGroups} grupos com menos de {kThreshold} pessoas foram omitidos para proteger a privacidade."
- **Comportamento**: renderizada **sempre** que `meta.suppressed_groups > 0` (regra dura do contrato — "o front DEVE exibir aviso"); não dispensável enquanto os filtros atuais estiverem ativos; aparece também no `ExportPanel` (o export aplica o mesmo K)
- **Variações/estados**: visível (`suppressed_groups > 0`) · ausente (= 0) · variante compacta (dentro de card de gráfico individual)
- **Tokens**: `--color-banner-suppression-bg/-fg` (propostos em [design-tokens.fe.md](./design-tokens.fe.md) §2), `radius.md`, `spacing.4`
- **Acessibilidade**: `role="note"` (informativo permanente, não alerta); contagem anunciada uma vez por mudança de filtro via `aria-live="polite"`
- **Usado em (linhagem)**: `DashboardTemplate` (full-width sob o header de filtros), cards de gráfico, `ExportPanel`
- **Evidência**: `meta: { k_threshold: 5, suppressed_groups: 3 }`; `HAVING COUNT(*) >= 5` (LGPD Art. 12); §9.1 do mapa

### `M3EmptyState` — vazio com ação (reuso)
- **Reuso?**: já existe (ficha no conjunto social-care)
- **Composta de (átomos)**: ícone + título + texto + `M3Button` opcional
- **Props (API)**: `{ title: string, description: string, action?: { label: string, onPress: () => void } }`
- **Comportamento**: nesta feature distingue **dois vazios**: "Sem dados no período selecionado" (`data: []`, `suppressed_groups = 0`) vs. "Dados omitidos por privacidade" (`data: []`, `suppressed_groups > 0` — acompanha `SuppressionBanner`); CTA sugere ampliar o período
- **Variações/estados**: sem dados · tudo suprimido · serviço indisponível (503, com retry)
- **Tokens**: `--color-text-secondary`, `spacing.12`
- **Acessibilidade**: título como heading; não usa `role="alert"`
- **Usado em (linhagem)**: todos os organismos de gráfico e o `MesoregionBreakdownPanel`
- **Evidência**: `data: []` + `meta.suppressed_groups`; `/ready` 503

### `M3SectionHeader` / `M3DataField` — título de seção e par label/valor (reuso)
- **Reuso?**: já existem (fichas nos conjuntos irmãos)
- **Composta de (átomos)**: título + descrição + slot de ação · label + valor
- **Props (API)**: `{ title: string, description?: string, action?: JSX.Element }` · `{ label: string, value: string | number, format?: string, emptyFallback?: string }`
- **Comportamento**: `M3SectionHeader` ancora as seções do dashboard ("Pirâmide etária", "Top diagnósticos") com slot de ação ("Ver como tabela"); `M3DataField` exibe metadados do export (formato, content-type, extensão) e o `meta` da consulta
- **Variações/estados**: com/sem descrição · com/sem ação · valor vazio ("—")
- **Tokens**: `typography.fontSize.xl`, `--color-text-*`
- **Acessibilidade**: heading semântico; `<dl>/<dt>/<dd>`
- **Usado em (linhagem)**: cards de gráfico, `ExportPanel`
- **Evidência**: `GET /api/v1/metadata/formats` → `{ name, content_type, extension }`

## Cobertura vs. inventory

| Molécula do inventory | Coberta? | Documento |
|---|---|---|
| Seletor de período `YYYY-MM` (início/fim) | ✅ (nova) | `M3PeriodRangeField` |
| Seletor de granularidade | ✅ (nova) | `GranularitySelector` |
| Filtro de mesorregião | ✅ (nova) | `MesoregionFilter` |
| Card de KPI | ✅ (nova) | `M3KpiCard` |
| Tooltip de gráfico | ✅ (nova) | `M3ChartTooltip` |
| Banner de supressão K=5 | ✅ (nova) | `SuppressionBanner` |
| Estado vazio (sem dados / suprimido / 503) | ✅ (reuso) | `M3EmptyState` |
| Título de seção / par label-valor | ✅ (reuso) | `M3SectionHeader` / `M3DataField` |
| Grade de formatos de export | ⬜ (parte do organismo) | [design-organisms.fe.md](./design-organisms.fe.md) → `ExportPanel` |

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípios II (Errors as Values), III (MVVM), IV (Bun-Native)
- [ADR-0007](../../adr/0007-design-system-vanilla-extract.md) — vanilla-extract; tokens semânticos
- [ADR-0009](../../adr/0009-framework-agnostic-client.md) — ViewModel puro + binding Solid; moléculas recebem dados prontos do ViewModel
- [design-interface-inventory.fe.md](./design-interface-inventory.fe.md) — inventário de origem
- [design-atoms.fe.md](./design-atoms.fe.md) — átomos compostos aqui
- [design-organisms.fe.md](./design-organisms.fe.md) — organismos que compõem estas moléculas
- [design-tokens.fe.md](./design-tokens.fe.md) — tokens semânticos referenciados
- [design-governance.fe.md](./design-governance.fe.md) — regras de promoção local→global
- Irmão social-care: [../social-care/design-molecules.fe.md](../social-care/design-molecules.fe.md)
- Irmão people-context: [../people-context/design-molecules.fe.md](../people-context/design-molecules.fe.md)
- Doc offline vanilla-extract: [../../reference/ui/vanilla-extract/](../../reference/ui/vanilla-extract/)
- Doc offline SolidStart: [../../reference/framework/solidstart/](../../reference/framework/solidstart/)
