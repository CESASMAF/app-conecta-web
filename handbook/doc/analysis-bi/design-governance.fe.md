# 07 · Governance & Maintenance: Analysis BI Web

**Feature**: `specs/003-analysis-bi-web/design-system/` · **Base**: Atomic Design Cap. 5 + [ADR-0007](../../adr/0007-design-system-vanilla-extract.md) (UI Library Strategy) + [ADR-0001](../../adr/0001-vertical-modular-architecture.md) + [ADR-0009](../../adr/0009-framework-agnostic-client.md) + [ADR-0011](../../adr/0011-no-mocks-in-production.md)

> O design system é **produto vivo**, não artefato (Nathan Curtis). Este doc define como os
> átomos/moléculas/organismos desta feature são mantidos, versionados e promovidos para o design system
> global (`web_02/src/components/ui/m3/`) vs. mantidos locais na feature
> (`web_02/src/features/003-analysis-bi/ui/`). É **consistente com** a governança dos conjuntos irmãos
> ([../social-care/design-governance.fe.md](../social-care/design-governance.fe.md) e
> [../people-context/design-governance.fe.md](../people-context/design-governance.fe.md)) — mesmas regras, mesmos makers. A novidade
> desta feature é a **governança de dataviz**: esta é a primeira feature com visualização de dados, e
> as regras que ela inaugura (paleta como token, proibição de cor crua em gráfico, acessibilidade de
> gráficos) passam a valer para toda a plataforma.

## 1. Makers vs. Users

- **Makers** (mantêm `ui/m3/` + `src/styles/`): os mesmos dos irmãos — Gabriel + agente `design-system-curator` ([ADR-0007](../../adr/0007-design-system-vanilla-extract.md)), fontes na ordem vanilla-extract docs → WAI-ARIA APG → Atlassian tokens → Carbon → M3 community. Decidem API de componente global, tokens novos — incluindo a **categoria nova `vars.color.chart*`** e `vars.color.bannerSuppression*` ([design-tokens.fe.md](./design-tokens.fe.md) §2) — e breaking changes. PR de componente global exige: story de estado (fixtures no Storybook/Ladle-equivalent do projeto), axe verde, comparação visual com o Figma `bHV9kAG2pIWMnEjOQIUCOE`, TSDoc e aprovação dupla. A paleta categórica, por introduzir literais OKLCH novos, exige adicionalmente verificação documentada de contraste e simulação de daltonismo (protano/deutero/tritano) anexada ao PR.
- **Users** (consomem na feature): a feature `003-analysis-bi-web` é o **terceiro consumidor** do design system — usa `M3*` via import direto de `~/components/ui/m3/*`; **não forka estilo** nem reimplementa variante local de componente global. Consome sem alteração componentes nascidos nos irmãos (`M3DropdownField`, `M3EmptyState`, `M3SectionHeader`, `M3DataField`, `M3ChoiceChip`, `AppShell`/`M3TopAppBar`) e **contribui** a primeira leva de componentes de dataviz (átomos `M3SeriesLegendItem`/`M3KpiValue`/`M3PeriodLabel`/`M3GranularityChip` e moléculas `M3PeriodRangeField`/`M3KpiCard`/`M3ChartTooltip` nascem globais). Necessidade nova → issue para os makers (ou proposta de promoção, §2). Documentos de consumo: [design-atoms.fe.md](./design-atoms.fe.md) → [design-pages.fe.md](./design-pages.fe.md) desta pasta.

## 2. Local vs. Global (promoção)

| Componente | Hoje | Critério para promover a `ui/m3/` |
|---|---|---|
| `M3SeriesLegendItem`, `M3KpiValue`, `M3PeriodLabel`, `M3GranularityChip` | propostos (átomos novos, [design-atoms.fe.md](./design-atoms.fe.md)) | nascem **globais** — são o vocabulário mínimo de dataviz da plataforma; qualquer gráfico futuro (dashboard do social-care incluso) os reusa |
| `M3PeriodRangeField`, `M3KpiCard`, `M3ChartTooltip` | propostas (moléculas novas) | nascem **globais** — consulta temporal, KPI e tooltip são transversais; `M3KpiCard` deve convergir com o `M3StatCard` do social-care (avaliar fusão de APIs quando o dashboard de lá migrar para dados do `analysis-bi`) |
| `GranularitySelector`, `MesoregionFilter`, `SuppressionBanner` | locais em `features/003-analysis-bi/ui/` | promover quando segunda feature consultar séries temporais/geografia IBGE/agregados K-anônimos; `SuppressionBanner` é o candidato mais provável (qualquer superfície que exiba dados do `analysis-bi`) |
| `AgePyramidChart`, `TopNBarChart`, `IndicatorTimeSeriesChart` | locais (organismos de gráfico) | extrair o núcleo genérico (`BarChart`, `TimeSeriesChart`) pra `ui/m3/` quando houver segundo consumidor; o binding de domínio (labels do contrato, ordenação das 17 faixas) permanece local |
| `MesoregionBreakdownPanel`, `DashboardFilterPanel`, `ExportPanel` | locais | bindings de domínio permanecem locais; a oportunidade real é o padrão "painel de filtros sticky + grid de cards" virar template documentado (já está em [design-templates.fe.md](./design-templates.fe.md) → `DashboardTemplate`) |
| Tokens `vars.color.chartCat1..8`, `vars.color.chartSex*`, `vars.color.chartSeq1..5`, `vars.color.chartGrid/Axis`, `vars.color.bannerSuppression*` | propostos em [design-tokens.fe.md](./design-tokens.fe.md) §2 | entram direto em `tokens.css.ts` + `contract.css.ts` (camada global por definição), com aprovação de maker — **nos dois arquivos no mesmo PR** |

## 3. Regras de evolução (governance tests enforçam)

- **Só-tokens**: nenhum hex/rgb/oklch/px cru em `ui/` ou `features/*/ui/` — **governance test em `bun:test`** ([ADR-0007](../../adr/0007-design-system-vanilla-extract.md) + [ADR-0001](../../adr/0001-vertical-modular-architecture.md)) falha o CI; literais só em `src/styles/tokens.css.ts` e `contract.css.ts`. A sync manual dupla dos dois arquivos é gate de revisão (herdado dos irmãos §3).
- **Proibição de cor crua em gráficos (NOVA — dataviz)**: a regra só-tokens vale **dentro do SVG** — `fill`/`stroke` de barra, linha, ponto, grade e eixo usam exclusivamente `vars.color.chart*` (vanilla-extract); props de cor nos componentes de gráfico são tipadas como union de nomes de token (`ChartColorToken`), nunca `string` livre. Gerar cor programaticamente (HSL rotativo, interpolação fora dos tokens `chartSeq`) é violação de revisão — se a paleta acabar (> 8 séries), volta a [design-tokens.fe.md](./design-tokens.fe.md) antes de codificar.
- **Paleta categórica é contrato (NOVA — dataviz)**: séries com semântica fixa usam o alias dedicado (`vars.color.chartSex*` — mesma cor para o mesmo sexo em **todos** os gráficos); séries neutras consomem `vars.color.chartCat1..N` em ordem, sem pular índices. Trocar a ordem ou o mapeamento de um alias é mudança **estrutural** (§4).
- **Acessibilidade de gráficos (NOVA — dataviz)**: todo organismo de gráfico embarca, obrigatoriamente: (1) **tabela de dados alternativa** alimentada pela mesma ViewModel (toggle "Ver como tabela" — não imagem, não recálculo); (2) **resumo textual** do achado principal em `aria-label`/`role="img"`; (3) navegação por **teclado** ponto a ponto com `M3ChartTooltip` em foco (não só hover); (4) cor **nunca** como único canal — parear com posição, rótulo direto ou legenda textual. PR de gráfico sem os 4 itens não passa revisão.
- **Hierarquia Atomic**: `tokens ← atoms ← molecules ← organisms ← templates ← pages`; átomo não importa molécula; organismo desta feature **não importa** organismo de `features/001-*`/`002-*` (boundaries enforçados por governance test em `bun:test` — [ADR-0001](../../adr/0001-vertical-modular-architecture.md)) — reuso cross-feature passa por promoção a `ui/m3/`.
- **Views burras** ([ADR-0009](../../adr/0009-framework-agnostic-client.md)): componentes de `ui/` não chamam rota Elysia, não usam `createAsync`/`action` diretamente, não têm estado de aplicação — recebem **ViewModel** + handlers do **binding Solid**; postfix obrigatório (`*.component.tsx`). Normalização de dados de gráfico (preencher gaps com `null`, ordenar as 17 faixas, separar `violation_type`/`destination`) é responsabilidade do **ViewModel** (`*.view-model.ts`), nunca do componente.
- **Variantes derivam do domínio**: estados de UI espelham o contrato real do `analysis-bi` — `M3GranularityChip` é imagem do enum `granularity`; séries derivam dos labels reais (`age_band`, `sex`, `mesoregion_name`, `icd_code`, `income_band`, `violation_type`, `destination`, `appointment_type`); `SuppressionBanner` deriva de `meta.suppressed_groups`. Adicionar variante sem correspondência no contrato é violação de revisão.
- **Privacidade como invariante de componente**: exibir o `SuppressionBanner` quando `suppressed_groups > 0` é regra de contrato, não opção — componentes não aceitam prop que o desligue; **nunca** interpolar gaps como zero (mentira estatística); **nenhum** componente oferece drill-down individual (o serviço não tem PII por design — prometer isso na UI é violação).
- **Sem mocks em `src/`** ([ADR-0011](../../adr/0011-no-mocks-in-production.md)): `not-implemented` como valor; fixtures sintéticas só em `tests/`; governance test `no-mocks-in-src` em `bun:test` verifica ausência de mocks em `src/`.
- Mudança de API de componente global = revisão de todos os consumidores (**agora ≥3 features**: buscar imports em `features/001-*`, `002-*` e `003-*`) + stories de estado + atualização do doc irmão correspondente nas pastas afetadas (`social-care/`, `people-context/`, `analysis-bi/`) quando o componente for compartilhado.

## 4. Versionamento & changelog

- Conventional Commits por repo (`feat(ds): adiciona paleta chart-cat e M3KpiValue` → minor; `fix(ds): contraste do chart-cat-4 sobre bg-elevated` → patch), commits em PT-BR (convenção do `web_02/`).
- **Estrutural** (API de componente global, token novo/renomeado — incl. a categoria `chart*` inteira, mudança de mapeamento dos aliases `chartSex*`, mudança de hierarquia): exige ADR em `web_02/handbook/adr/` antes do merge ([ADR README](../../adr/README.md)). **Cosmético** (ajuste de spacing/altura de card sem mudar API): nota no PR + story atualizada.
- Docs desta pasta são versionados junto: PR que muda componente referenciado aqui atualiza o doc irmão correspondente (inventory → tokens → atoms → … → pages) no mesmo PR; mudanças em componentes consumidos dos irmãos atualizam **também** os docs de lá.
- **Depreciação**: `@deprecated` no TSDoc apontando substituto; compat por ≥1 sprint; remoção só com zero consumidores nas três features.

## 5. Acessibilidade & qualidade (gate)

- Gate obrigatório antes de fechar PR (pipeline W0-W3 fail-first do `web_02/`): `bunx tsc --noEmit` · governance tests em `bun:test` (boundaries + só-tokens + `no-mocks-in-src`) · cobertura · `bun build` (budget ≤200KB gzip — atenção: engine de gráficos entra no budget; decisão de lib na `plan.fe.md` responde a isso) — **NUNCA** npm/yarn/npx ([Princípio IV](../../../.specify/memory/constitution.md)).
- E2E com `bun:test` + `happy-dom` + fakes in-memory ([ADR-0011](../../adr/0011-no-mocks-in-production.md)) nas 7 páginas de [design-pages.fe.md](./design-pages.fe.md); PR bloqueia com violação séria de axe. Cenários obrigatórios desta feature: banner de supressão presente quando o fake devolve `suppressed_groups > 0`; toggle "Ver como tabela" em cada gráfico; navegação por teclado na pirâmide etária; fluxo completo de export (seleção → download `Content-Disposition`); estados 400/429/503 dos dashboards.
- Catálogo de componentes: todo componente novo tem story com matriz de variants/states — gráficos com fixtures de **dados sintéticos agregados** cobrindo: completo, esparso (com gaps), suprimido (`suppressed_groups > 0`), vazio, 1 ponto único, 8 séries (limite da paleta); `M3PeriodLabel` nas 3 granularidades; `ExportPanel` com os 8 formatos.
- Tipografia Atkinson Hyperlegible + foco visível (`vars.color.focusRing`) + `prefers-reduced-motion` são pré-condições globais (herdadas) — gráficos animados (transições de barra via GSAP) respeitam `prefers-reduced-motion` desligando animação, nunca o dado.
- LGPD como qualidade: fixtures e screenshots usam **somente agregados sintéticos** (o serviço real já não tem PII — manter a propriedade nos testes); valores de fixture sempre ≥ 5 por célula exceto nos cenários que testam supressão; o texto do `SuppressionBanner` ("omitidos para proteger a privacidade") é revisado pelo DPO antes do release (vocabulário LGPD Art. 12).

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípios I–VI; Princípio IV (Bun-Native, NON-NEGOTIABLE: `bun:test`, nunca npm/yarn/npx nos gates)
- [ADR-0001](../../adr/0001-vertical-modular-architecture.md) — vertical-modular; boundaries enforçados por governance tests
- [ADR-0003](../../adr/0003-bun-supply-chain.md) — Bun supply-chain; `bun:test` como runner de todos os gates
- [ADR-0007](../../adr/0007-design-system-vanilla-extract.md) — vanilla-extract; regra só-tokens; governance test de literal de cor
- [ADR-0009](../../adr/0009-framework-agnostic-client.md) — ViewModel puro + binding Solid; views burras; núcleo client sem `solid-js`
- [ADR-0011](../../adr/0011-no-mocks-in-production.md) — sem mocks em `src/`; governance test `no-mocks-in-src`
- [ADR README](../../adr/README.md) — índice de todos os ADRs
- [design-tokens.fe.md](./design-tokens.fe.md) — tokens que este doc governa
- [design-atoms.fe.md](./design-atoms.fe.md), [design-molecules.fe.md](./design-molecules.fe.md), [design-organisms.fe.md](./design-organisms.fe.md), [design-templates.fe.md](./design-templates.fe.md), [design-pages.fe.md](./design-pages.fe.md) — docs governados por estas regras
- [design-interface-inventory.fe.md](./design-interface-inventory.fe.md) — origem dos componentes catalogados
- Irmão social-care: [../social-care/design-governance.fe.md](../social-care/design-governance.fe.md)
- Irmão people-context: [../people-context/design-governance.fe.md](../people-context/design-governance.fe.md)
- Doc offline vanilla-extract: [../../reference/ui/vanilla-extract/](../../reference/ui/vanilla-extract/)
- Doc offline Bun (bun:test): [../../reference/runtime/bun/](../../reference/runtime/bun/)
- Doc offline GSAP (animações + prefers-reduced-motion): [../../reference/ui/gsap/](../../reference/ui/gsap/)
