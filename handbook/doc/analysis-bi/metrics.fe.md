# Métricas & NFRs: Dashboards Web Analysis-BI — frontend (browser)

**Feature**: `specs/003-analysis-bi-web/` · **Consultores**: `/acdg-skills:software-architect` + `/acdg-skills:requirements-engineer`

> Fase de NFRs (frontend, máximo rigor). NFRs ancorados com **citação canônica** via `skills_citar`.
> Toda métrica deve ser **mensurável**. Foco do front: experiência (latência até o primeiro gráfico,
> acessibilidade de dataviz), integridade (gap filling fiel, supressão sempre comunicada) e
> segurança (token nunca no browser; **nenhum valor de filtro nem PII em telemetria**).
> Visão do contrato/backend em [metrics.md](./metrics.md).

## Métricas funcionais

> "Faz a coisa certa" — verificáveis por teste/cenário.

| ID | Métrica | Alvo | Como medir |
|---|---|---|---|
| MF-001 | VO `Period` rejeita YYYY-MM malformado e range invertido antes de qualquer chamada de rede | 100% (CT-007) | teste de domínio (`bun:test`, T-001) |
| MF-002 | mapper por status HTTP (400/401/404/429/500/501/503 — contrato sem código estruturado) → tag i18n própria | sem `default` solto; fallback nomeado `unknown-error` | typecheck (união de literais) + teste do view-model (T-007) em `bun:test` |
| MF-003 | banner de supressão renderizado sempre que `meta.suppressed_groups > 0`, com contagem e K=5; nunca confundido com estado vazio | 100% (CT-002/CT-003) | teste de view model (T-008) + componente + E2E |
| MF-004 | gap filling fiel: pontos ausentes com `value: 0` + flag `missing`, sem interpolação, nas 3 granularidades | 100% (CT-004/CT-010) | testes de domínio (T-004) em `bun:test` + componente da série |
| MF-005 | pirâmide etária ordena as 17 faixas canonicamente (`"0-4"` … `"80+"`) e separa MALE/FEMALE/UNKNOWN | 0 ordenação alfabética (CT-001) | teste de view model (T-009) em `bun:test` |
| MF-006 | download de export preserva filename `acdg-{dataset}-{period}.{ext}` e content-type nos 8 formatos, repassado como binário | 100% (CT-006/CT-011) | teste de integração parametrizado (T-014) em `bun:test` + E2E de download |

## NFRs

| ID | Categoria | Alvo mensurável | Como medir |
|---|---|---|---|
| NFR-001 | Performance (UI) | **tempo até o primeiro gráfico renderizado** (rota do eixo → primeira visualização com dados pintada) p75 < 2,5 s; troca de filtro → gráfico atualizado p75 < 1 s (dados já disponíveis via `createAsync` + `query` do `@solidjs/router`) | `performance.mark('first-chart-rendered')` + RUM |
| NFR-002 | Segurança | bundle do client sem `accessToken`/`refreshToken`/`Bearer` | grep no bundle no CI (SC-002 da auth — [ADR-0005](../../adr/0005-auth-session-refresh-decisions.md)) |
| NFR-003 | LGPD em telemetria | 0 PII e **0 valor de filtro** (mesorregião, CID-10, período exato) em eventos RUM, analytics, URLs reportadas e logs de erro do client — combinações de filtros raros são indiretamente reidentificantes; reportar apenas rota normalizada, eixo, granularidade e código `AppError` | grep automatizado dos payloads de telemetria em CI + review do reporter |
| NFR-004 | Acessibilidade de dataviz | 100% dos gráficos com alternativa textual/tabela ("Ver como tabela") e `aria-label` descritivo; navegável por teclado de ponta a ponta; contraste AA inclusive entre séries (tokens OKLCH — [ADR-0007](../../adr/0007-design-system-vanilla-extract.md)); 0 violações sérias/críticas no axe nas 5 telas de eixo | axe / Lighthouse a11y + teste de componente (CT-012) |
| NFR-005 | i18n | 0 string literal de UI fora do catálogo (inclui mensagens dos `AppError` por status, rótulos de eixos/legendas/banner e nomes amigáveis dos 8 formatos de export) | governance test em `bun:test` ([ADR-0001](../../adr/0001-vertical-modular-architecture.md)) |
| NFR-006 | Design system | 0 hex/rgb/px cru em `ui/`, **incluindo paletas de gráfico** (tokens de dataviz via vanilla-extract — [ADR-0007](../../adr/0007-design-system-vanilla-extract.md)) | governance test `so-tokens` em `bun:test` |
| NFR-007 | Web Vitals | **LCP ≤ 2,5 s** · INP ≤ 200 ms · CLS ≤ 0,1 (p75, hardware modesto da associação) — atenção: o LCP dos dashboards tende a ser o próprio gráfico (SVG/canvas grande pintado pós-fetch); skeleton com dimensões fixas para não estourar CLS na chegada dos dados | Lighthouse CI + web-vitals RUM reportado ao BFF |
| NFR-008 | Resiliência de UI | 100% das telas de eixo com estados loading/vazio/erro/sucesso; 429 em `stale-while-retrying` mantendo dados anteriores (via `createAsync` com fallback); 503 degradado com re-sonda; estado vazio distinto de supressão | testes de componente + checklist CHK026…CHK030 |

**Citação que sustenta os NFRs** (obrigatória):
> "Your best bet is to remember two things from Cook's original test pyramid:
> 1. Write tests with different granularity
> 2. The more high-level you get the fewer tests you should have.
> A healthy, fast and maintainable test suite is what lets you verify these qualities continuously
> instead of discovering regressions in production."
> — *(localização exata no corpus a registrar via `skills_citar` em `practical-test-pyramid--vocke.md`, Ham Vocke — base da verificação contínua dos NFRs de UI)*

## Métricas de performance (orçamento)

| ID | Indicador | Baseline | Alvo | Orçamento |
|---|---|---|---|---|
| MP-001 | tempo até o primeiro gráfico renderizado (rota de eixo, filtros default) p75 | N/A (pré-Sprint 0) | < 2,5 s | 4 s |
| MP-002 | LCP p75 das 5 rotas de dashboard (elemento LCP esperado: o gráfico principal) | N/A | ≤ 2,5 s | 4 s |
| MP-003 | troca de filtro (período/granularidade/mesorregião/top N) → gráfico atualizado p75 | N/A | < 1 s | 2 s |
| MP-004 | tamanho do chunk da feature `003-analysis-bi-web` incl. lib de gráficos (gzip; lib carregada lazy por rota) | N/A | < 150 kB | 220 kB |
| MP-005 | JS total inicial (gzip) | N/A | < 300 kB | 400 kB |
| MP-006 | clique em "Exportar" → início do download percebido p75 (formatos leves CSV/JSON/XML; pesados Parquet/DBF/DBC/ODS/FHIR com indicador de progresso) | N/A | < 2 s leves · < 5 s pesados | 4 s · 10 s |
| MP-007 | render da série mais longa esperada (12 meses × 17 faixas × 3 sexos, pós gap filling) sem travar a interação (long task < 50 ms) | N/A | 0 long task > 50 ms no render | 1 long task |

## Critérios de sucesso (mensuráveis, tech-agnostic)

- **SC-001**: gestora abre um dashboard, ajusta período e mesorregião e interpreta o indicador em < 2 min na primeira utilização, sem ajuda externa (UAT Q3).
- **SC-002**: 100% das consultas com supressão exibiram o banner — razão `suppression-banner-shown / respostas com suppressed_groups > 0` = 1,0 (cruzada com o contador do BFF em [metrics.md](./metrics.md), SC-002 de lá).
- **SC-003**: ≥ 70% das sessões usam ao menos um filtro (período, mesorregião, granularidade ou top N) — sinal de que os filtros são compreensíveis; granularidades trimestral/anual usadas em ≥ 15% das consultas após o 1º mês.
- **SC-004**: taxa de consultas sem dados retornados (`data: []`) < 20% após o 1º mês — acima disso, os defaults de período/filtro da UI estão mal calibrados para a base real.
- **SC-005**: ≥ 90% dos exports iniciados concluem em download (sem abandono por demora); distribuição por formato conhecida (esperado: CSV/ODS dominantes; DBC/FHIR nicho institucional).
- **SC-006**: 0 incidente de exposição de token, de PII ou de valores de filtro em telemetria durante o ciclo da feature.

## Observabilidade

- **RUM leve**: `web-vitals` (LCP/INP/CLS) reportado a um endpoint do BFF (`/api/vitals`) com rota normalizada (`/dashboards/:axis` — o eixo é dimensão permitida; valores de filtro jamais) — sem PII.
- **Primeiro gráfico**: `performance.mark('chart-data-received')` / `performance.mark('first-chart-rendered')` + `performance.measure` por eixo → MP-001/MP-003, separando tempo de contrato (ver [metrics.md](./metrics.md)) de tempo de render.
- **Erros de UI**: o binding Solid escuta falhas do `createAsync` e envia ao BFF { rota normalizada, eixo, código `AppError`, timestamp } → taxa de erro por tela e por status; dimensão dedicada para `rate-limited` (429 em retry, não erro fatal) e `service-unavailable` (503 degradado).
- **Uso de filtros e granularidades** (agregado, sem valores): contadores `filter-applied` por **tipo** de filtro (`period`, `mesoregion`, `granularity`, `top`) e por granularidade escolhida (`monthly`/`quarterly`/`yearly`) → SC-003. A largura do range em meses pode ser reportada (número), nunca os meses exatos.
- **Consultas sem dados**: contador `empty-result-shown` por eixo (resposta `data: []`) e contador separado `suppression-banner-shown` com a contagem de grupos — distintos por construção → SC-002/SC-004 e NFR-004 de [metrics.md](./metrics.md).
- **Funil de export**: contadores `export-opened` → `export-started` (dimensão: formato) → `export-completed`/`export-failed` → SC-005 e taxa de export por formato; correlação por `requestId` com MP-004/MP-005 de [metrics.md](./metrics.md).
- **Tabela alternativa**: contador `chart-table-toggled` por eixo (uso real da alternativa acessível — orienta investimento em a11y).
- **Logs do BFF**: correlação `requestId` entre erro visto na tela e chamada outbound registrada em [metrics.md](./metrics.md) — nunca logar token nem valores de filtro.

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípios I–VI (Iron Frontier, Errors as Values, MVVM, Bun-Native, TypeBox/Eden, Honesty)
- [ADR-0001 (vertical-modular)](../../adr/0001-vertical-modular-architecture.md) — governance tests em `bun:test`
- [ADR-0002 (Errors as Values)](../../adr/0002-errors-as-values.md) — AppError como union de literais
- [ADR-0004 (Client/Server MVVM×DDD)](../../adr/0004-client-server-split-mvvm-ddd.md) — binding Solid (`createAsync`, `action`)
- [ADR-0005 (auth/session)](../../adr/0005-auth-session-refresh-decisions.md) — token nunca no browser
- [ADR-0007 (vanilla-extract)](../../adr/0007-design-system-vanilla-extract.md) — tokens OKLCH, so-tokens
- [ADR-0009 (framework-agnostic client)](../../adr/0009-framework-agnostic-client.md) — ViewModel puro testável
- [ADR-0011 (no mocks)](../../adr/0011-no-mocks-in-production.md) — fakes in-memory em `tests/`
- [adr.fe.md](./adr.fe.md) — séries esparsas, supressão K=5 e erros
- [domain.fe.md](./domain.fe.md) — Model, eventos, mapeamento ACL
- [metrics.md](./metrics.md) — métricas do contrato/backend
- [api-readiness.fe.md](./api-readiness.fe.md) — prontidão dos endpoints
- [ADR index](../../adr/README.md) — todos os ADRs web_02
- Docs offline: `../../reference/framework/solidstart/` · `../../reference/framework/elysia/` · `../../reference/runtime/bun/` · `../../reference/ui/gsap/`
