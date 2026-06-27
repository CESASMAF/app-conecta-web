# 01 · Design Tokens: Analysis BI Web

**Feature**: `specs/003-analysis-bi-web/design-system/` · **Base**: [ADR-0007](../../adr/0007-design-system-vanilla-extract.md) (tokens centralizados, zero-runtime via **vanilla-extract**), `web_02/src/styles/tokens.css.ts` (primitivos OKLCH) + `web_02/src/styles/contract.css.ts` (semânticos, contrato de tipo)

> A camada base do Atomic Design. **Regra constitucional** ([Princípio IV](../../../.specify/memory/constitution.md)): `ui/` (atoms/molecules/organisms e
> `features/*/ui`) **não** usa hex/rgb/hsl/px crus — só tokens (`vars.color.*`, `vars.spacing.*` etc.,
> notação `vars.*` do vanilla-extract; governance test em `bun:test` falha o CI em
> violação). A fonte de verdade dos literais vive em `tokens.css.ts` (primitivos OKLCH) e no
> `contract.css.ts` (semânticos, tipados como `StyleRule` do vanilla-extract). Este doc mapeia os tokens que a feature usa e sinaliza
> **lacunas** (token novo necessário) — não inventa cor solta na tela.
>
> Esta feature **reutiliza integralmente** a camada catalogada em
> [../social-care/design-tokens.fe.md](../social-care/design-tokens.fe.md) (e os aliases do people-context onde aplicável) e
> introduz a **primeira categoria nova desde a fundação do design system**: tokens de **dataviz**
> (paleta categórica e sequencial para gráficos) + o token do banner de supressão por privacidade.
> Gráficos são a única superfície onde uma "escala de cores" é legítima — e mesmo ela vira token.

## 1. Tokens existentes reutilizados

| Token (`vars.*` / `var(--…)`) | Valor | Uso na feature |
|---|---|---|
| `vars.color.actionPrimary` (+ hover, active, fg) | `coral-500/600/700` (`oklch(62% 0.21 25)` ACDG) | CTAs: "Exportar", "Aplicar filtros" |
| `vars.color.bgPrimary` / `vars.color.bgSecondary` / `vars.color.bgElevated` | `warmgray-50/100` / branco | fundo do shell, cards de KPI e de gráfico, painel de export |
| `vars.color.textPrimary` / `vars.color.textSecondary` / `vars.color.textDisabled` | `warmgray-900/600/400` | títulos de gráfico, labels de eixo/legenda, formato de export indisponível |
| `vars.color.borderDefault` / `vars.color.borderStrong` / `vars.color.borderActive` | `warmgray-200/400`, `coral-500` | bordas de card, divisores do painel de filtros, campo focado |
| `vars.color.focusRing` + `vars.width.focusRing` + `vars.offset.focusRing` | `coral-500`, `2px`, `1px` | foco visível WCAG 2.2 AA — inclusive em barras/pontos de gráfico focáveis por teclado |
| `vars.color.warning500` | `oklch(72% 0.18 75)` | aviso 429 (rate limit) com retry |
| `vars.color.danger500` | `oklch(58% 0.21 25)` | erro 400/500; falha de download de export |
| `vars.color.info500` | `oklch(60% 0.15 245)` | notas informativas (SM de referência 2024, série esparsa) |
| `vars.color.textError` / `vars.color.borderError` | `danger-500` | validação dos filtros (período `YYYY-MM` malformado, `period_end < period_start` — espelha o 400 do serviço) |
| `vars.spacing` (base 4/8: `2…96px`) · `vars.radius` (`sm…full`) · `vars.borderWidth` | `tokens.css.ts` | grid de cards do dashboard, chips (`radius.full`), cards (`radius.lg`) |
| `vars.typography` (Atkinson Hyperlegible Next; `xs…4xl`; **mono p/ valores e códigos**) | `tokens.css.ts` | `M3KpiValue` (numerais grandes), `icd_code` e códigos de mesorregião em mono |
| `vars.elevation.stateLayer` (hover 0.08 / focus 0.12 / pressed 0.16) + `vars.elevation.shadow` | `tokens.css.ts` | hover de barras/linhas de tabela; cards elevados |
| `vars.zIndex` (`dropdown…tooltip`) | `tokens.css.ts` | `M3ChartTooltip` (`vars.zIndex.tooltip`), dropdown de mesorregião |

## 2. Tokens novos propostos (se houver)

> Cada novo token exige adição em `tokens.css.ts` (primitivo) + `contract.css.ts` (semântico, tipado) + justificativa. Evite — prefira reusar.

| Token proposto | Valor | Por que não dá pra reusar um existente |
|---|---|---|
| `vars.color.chartCat1 … vars.color.chartCat8` | paleta categórica OKLCH própria, derivada de Okabe–Ito (azul, laranja, verde-azulado, amarelo, púrpura, vermelho-tijolo, ciano, cinza), luminância equalizada e contraste ≥ 3:1 contra `vars.color.bgElevated` | **categoria nova**: nenhum token existente é uma *escala* — semáforos (`success/warning/danger/info`) carregam julgamento de valor e não podem distinguir séries neutras (CID-10 top N, tipos de violação, tipos de atendimento, destinos). Paleta segura para daltonismo (protano/deutero/tritano) por construção; séries usam os índices em ordem, sem pular |
| `vars.color.chartSexMale` / `vars.color.chartSexFemale` / `vars.color.chartSexUnknown` | `vars.color.chartCat1` / `vars.color.chartCat2` / `vars.color.chartCat8` | o enum `sex` (`MALE/FEMALE/UNKNOWN`) é a série mais recorrente (pirâmide etária e quebras por sexo); fixar o mapeamento por alias garante a **mesma cor em todos os gráficos** — sem alias, cada componente decidiria o índice e a pirâmide divergiria da série temporal |
| `vars.color.chartSeq1 … vars.color.chartSeq5` | rampa sequencial mono-matiz (azul `info` de `oklch(94% 0.03 245)` a `oklch(45% 0.14 245)`), ordenada por luminância | intensidade ordenada (desagregação por mesorregião, futuro coroplético) precisa de rampa perceptualmente monotônica; a paleta categórica não tem ordem e os semáforos têm 1 tom por matiz |
| `vars.color.chartGrid` / `vars.color.chartAxis` | `vars.color.warmgray200` / `vars.color.warmgray600` | linhas de grade e eixos precisam de papel próprio: `vars.color.borderDefault` mudaria a grade junto com bordas de input em eventual ajuste de formulário — acoplamento errado |
| `vars.color.bannerSuppressionBg` / `vars.color.bannerSuppressionFg` | `vars.color.info500` com alpha 12% / `vars.color.textPrimary` | o banner de **supressão por privacidade** (`meta.suppressed_groups > 0`) é informativo-permanente, não erro nem warning: avisa que células K<5 foram omitidas (LGPD Art. 12). Parente do `bannerLgpd*` do social-care, mas com semântica distinta (lá: PII removida de um prontuário; aqui: células agregadas omitidas) — alias próprio evita acoplar os dois avisos |

Nenhum primitivo de marca novo: `chartSeq` e `bannerSuppression` derivam de paletas existentes; **somente a paleta categórica `chartCat1..8` introduz literais OKLCH novos** em `tokens.css.ts` — inevitável, pois é a primeira necessidade real de escala categórica da plataforma.

## 3. Mapa semântico (observado na evidência → token)

| Papel visual (evidência) | Cor/medida crua observada | Token canônico |
|---|---|---|
| Série `sex=MALE` na pirâmide etária (barras à esquerda) | azul | `vars.color.chartSexMale` |
| Série `sex=FEMALE` na pirâmide etária (barras à direita) | laranja | `vars.color.chartSexFemale` |
| Série `sex=UNKNOWN` (linha/segmento residual) | cinza | `vars.color.chartSexUnknown` |
| Top N `icd_code` (barras categóricas, N ≤ 8) | uma cor por diagnóstico | `vars.color.chartCat1..N` em ordem |
| 6 faixas de `income_band` (0-0.5 … 5+ SM) | uma cor por faixa | `vars.color.chartCat1..6` em ordem fixa das faixas |
| Séries por `violation_type` / `destination` / `appointment_type` | uma cor por categoria | `vars.color.chartCat*` em ordem de chegada do contrato |
| Intensidade por `mesoregion_name` (barra proporcional/mapa futuro) | rampa azul claro→escuro | `vars.color.chartSeq1..5` |
| Grade e eixos de todos os gráficos | cinza claro / cinza médio | `vars.color.chartGrid` / `vars.color.chartAxis` |
| `meta.suppressed_groups > 0` → banner "N grupos suprimidos por privacidade (K=5)" | azul suave | `vars.color.bannerSuppression*` |
| Gap de série esparsa (período sem dados) | segmento tracejado/vazio, **nunca** zero | `vars.color.chartGrid` (tracejado) + nota `vars.color.info500` |
| `429 Too Many Requests` → aviso com retry | âmbar | `vars.color.warning500` |
| `400` filtro inválido (`invalid period_start: expected YYYY-MM format`) | vermelho no campo | `vars.color.textError` + `vars.color.borderError` |
| `503` (DB/NATS indisponível em `/ready`) → estado de indisponibilidade | vermelho/neutro | `vars.color.danger500` + `M3EmptyState` |
| Valor de KPI (`total_records`, casos novos, beneficiários) | numeral grande mono | `vars.typography.fontFamily.mono` + `fontSize.3xl/4xl` |
| `icd_code` (`E75.2`) e código de mesorregião | fonte mono | `vars.typography.fontFamily.mono` |
| CTA primário (Exportar, Aplicar filtros) | coral ACDG | `vars.color.actionPrimary*` |
| Foco de teclado em barra/ponto/célula de gráfico | anel coral 2px | `vars.color.focusRing` + `vars.width.focusRing` |

## 4. Lacunas / riscos

- **Sync manual dupla** (herdada dos irmãos §4): primitivos vivem em `tokens.css.ts` **e** semânticos em `contract.css.ts`. A paleta `chartCat` e os demais aliases (§2) devem entrar **nos dois** arquivos no mesmo PR — governance test em `bun:test` verifica a consistência.
- **Paleta categórica limitada a 8**: `top > 8` no eixo epidemiológico esgotaria a escala — decisão: limitar o seletor de top N da UI a 8 (default do serviço aceita N livre; export não tem essa limitação). Se o produto exigir mais séries, voltar a este doc antes de codificar (nunca gerar cor programaticamente).
- **Dark mode parcial** (herdado): `.dark` cobre só neutros; a paleta `chartCat` foi calibrada contra `vars.color.bgElevated` claro — gráficos em dark mode ficam fora do escopo v1 (mesma decisão dos irmãos). `chartGrid`/`chartAxis` derivam de neutros e acompanham o `.dark` automaticamente.
- **Daltonismo**: a paleta Okabe–Ito mitiga, mas **cor nunca é o único canal** — séries pareiam cor + rótulo direto/legenda (`M3SeriesLegendItem`) e todo gráfico tem tabela de dados alternativa (regra dura em [design-governance.fe.md](./design-governance.fe.md) §3). Pirâmide etária reforça com posição (esquerda/direita por sexo).
- **Rampa sequencial com 5 degraus**: suficiente para a tabela de mesorregiões v1; um mapa coroplético real (futuro) pode exigir interpolação contínua — reavaliar formato do token (lista vs. função) nesse momento.
- Cores cruas observadas sem token: nenhuma — a feature nasce depois da auditoria dos irmãos; gráficos novos consomem exclusivamente `vars.color.chart*`.

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípio IV (Bun-Native: zero literal de cor em `ui/`), Princípio V (TypeScript estrito: token tipado como union)
- [ADR-0007](../../adr/0007-design-system-vanilla-extract.md) — vanilla-extract como engine; `vars.*`, `contract.css.ts`, proibição de literal de cor
- [ADR-0003](../../adr/0003-bun-supply-chain.md) — supply-chain; governance tests rodam em `bun:test`
- [design-interface-inventory.fe.md](./design-interface-inventory.fe.md) — origem dos papéis visuais mapeados aqui
- [design-atoms.fe.md](./design-atoms.fe.md) — átomos que consomem estes tokens
- [design-governance.fe.md](./design-governance.fe.md) — regra só-tokens (enforçada por governance test), sync dupla, proibição de cor crua em SVG
- Irmão social-care: [../social-care/design-tokens.fe.md](../social-care/design-tokens.fe.md)
- Irmão people-context: [../people-context/design-tokens.fe.md](../people-context/design-tokens.fe.md)
- Doc offline vanilla-extract: [../../reference/ui/vanilla-extract/](../../reference/ui/vanilla-extract/)
