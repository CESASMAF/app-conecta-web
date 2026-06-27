# Plano de Testes / QA: Dashboards Web Analysis-BI (front+BFF)

**Feature**: `specs/003-analysis-bi-web/` · **Consultores**: `/acdg-skills:tdd-strategist` + `/acdg-skills:requirements-engineer`

> Plano de QA da pipeline `core-api-sdd`. Ancorado em **Agile Testing Condensed** (Gregory &
> Crispin) — agora no corpus (domínio `tdd`). Decisões de estratégia exigem **citação canônica
> ≥4 linhas** via `skills_citar` (Princípio VI da constituição). Complementa o [tdd.md](./tdd.md) (test list/RED):
> aqui é o **plano amplo de QA**; lá, os testes unitários do ciclo RED→GREEN.

## 1. Contexto (Agile Testing — Cap. 3)

> "Para planejar atividades de teste eficazmente, um time precisa considerar seu contexto":
> **time**, **produto** e **níveis de detalhe**.

- **Time**: distribuído e enxuto (instância ACDG-BV, associação de recursos limitados); sem QA dedicado — abordagem *whole-team*. Sem especialista de performance/segurança em tempo integral: Q4 coberto por gates automatizados (Lighthouse, axe, grep de bundle/telemetria, `bun test`/`bunx tsc --noEmit`) e pelo `security-reviewer` sob demanda no review W2 — relevante porque o serviço consumido carrega findings abertos (HIGH-001 iss/aud não validados, HIGH-003 RBAC ausente) que o BFF precisa compensar.
- **Produto**: **dashboards read-only de indicadores agregados K-anônimos** sobre pacientes de doenças raras (`analysis-bi`, K=5, LGPD Art. 12). Nenhum dado individual existe no contrato — só agregados por faixa etária, sexo, mesorregião, CID-10, faixas de salário mínimo. O nível de qualidade exigido é alto em um eixo específico: **fidelidade estatística e transparência de privacidade**. Omitir o aviso de supressão (`meta.suppressed_groups > 0`), preencher gaps de série esparsa com valores errados ou renderizar um gráfico que sugira contagem individual são defeitos críticos, não cosméticos — distorcem decisão de política assistencial.
- **Níveis de detalhe**: este plano cobre o nível **feature** (`003-analysis-bi-web`); as histórias (US-001…US-007 do `spec.fe.md`) são detalhadas em cenários no [bdd.md](./bdd.md); tarefas e gates em [tasks.md](./tasks.md).

**Citação que sustenta a abordagem de planejamento** (obrigatória):
> "Collaborative testing practices that occur continuously, from inception to delivery and beyond,
> supporting frequent delivery of value for our customers. Testing activities focus on building
> quality into the product, using fast feedback loops to validate our understanding. The practices
> strengthen and support the idea of whole-team responsibility for quality."
> — *(definição de agile testing; localização exata no corpus a registrar via `skills_citar` em `agile-testing-condensed--gregory-crispin.md`, Janet Gregory, Lisa Crispin, *Agile Testing Condensed*)*

## 2. Estratégia por quadrantes (Agile Testing Quadrants)

| Quadrante | Foco | Nesta feature |
|---|---|---|
| **Q1** tecnologia ⋅ apoia o time | unit, component, integração (TDD) | `bun:test` + componentes Solid via `happy-dom`: VO `Period` (YYYY-MM + range), schemas TypeBox dos query params e do envelope `{ data, meta }` com `k_threshold`/`suppressed_groups`, gap filling de séries esparsas por granularidade, formatação `"2025-03" → "mar/2025"`, mapper status HTTP → `AppError`, handlers Elysia com fakes in-memory — ver [tdd.md](./tdd.md) |
| **Q2** negócio ⋅ apoia o time | testes de aceitação, exemplos (BDD) | cenários Gherkin de pirâmide etária com filtros, banner de supressão K=5, período sem dados, granularidade trimestral, top N CID-10, export CSV com filename, 400 de período malformado, 503 do `/ready` — ver [bdd.md](./bdd.md) (CT-001…CT-012) |
| **Q3** negócio ⋅ critica o produto | exploratório, usabilidade, UAT | sessões exploratórias com a administradora da associação: jornada completa selecionar eixo → filtrar período/mesorregião → interpretar gráfico → exportar; validação do vocabulário PT-BR (faixa etária, mesorregião, CID-10, salário mínimo, benefício, encaminhamento, supressão por privacidade, K-anonimato); leitura dos gráficos pela alternativa textual/tabela |
| **Q4** tecnologia ⋅ critica o produto | performance, segurança, confiabilidade | orçamentos de `metrics.fe.md` (Web Vitals, LCP com gráficos) e `metrics.md` (p95 por eixo e por formato de export, taxa de 400/429, lag NATS→fato); grep de bundle por `Bearer`/`accessToken`; grep de telemetria por filtros com valores sensíveis; axe/Lighthouse a11y dos 5 dashboards |

## 3. Escopo

- **Em escopo**:
  - Jornadas web sobre a API `analysis-bi` `/api/v1`: os 5 eixos de indicadores (`GET /api/v1/indicators/{axis}` com `axis` ∈ `demographics | epidemiological | socioeconomic | protection | care`), filtros `period_start`/`period_end` (YYYY-MM, obrigatórios), `mesoregion` (opcional), `granularity=monthly|quarterly|yearly` (default `monthly`) e `top=<N>` (epidemiological/socioeconomic); export nos 8 formatos (`GET /api/v1/export/{format}` com `format` ∈ `csv | json | xml | parquet | dbf | dbc | ods | fhir` e `dataset`), download via `Content-Disposition: attachment; filename="acdg-{dataset}-{period}.{ext}"`; metadata (`GET /api/v1/metadata/datasets`, `GET /api/v1/metadata/formats`); readiness (`GET /ready` 200/503 com `database`/`nats`).
  - Transparência de privacidade: banner obrigatório quando `meta.suppressed_groups > 0` ("X grupos suprimidos por privacidade K=5"), exibição de `k_threshold` e `total_records` na legenda dos gráficos.
  - Gap filling client-side de séries esparsas (períodos sem dados NÃO vêm na resposta) nas 3 granularidades (`"2025-03"`, `"2025-Q1"`, `"2025"`); validação TypeBox na borda do BFF (input e response) incluindo range invertido (`period_end < period_start`) bloqueado antes da rede.
  - Mapeamento dos erros HTTP **sem código estruturado** (`{ data: { error, status, message }, meta }` com 400/401/404/429/500/501/503) para `AppError` por status; 429 com retry/backoff e aviso na UI.
  - RBAC no BFF (compensação client-side do HIGH-003 — o serviço não tem RBAC enforced): só papéis autorizados acessam dashboards e exports; BFF injeta `Authorization: Bearer <jwt>` (Authentik OIDC).
  - Acessibilidade de dataviz: toda visualização com alternativa textual/tabela equivalente.
- **Fora de escopo**:
  - Testes do pipeline Go do `analysis-bi` (anonimização HMAC-SHA256, `HAVING COUNT(*) >= 5`, encoders de export) — cobertos pela suíte `go test ./...` do próprio repo.
  - Consumo NATS dos 18 eventos `social-care.events.<EventType>` e o job mensal de carry-forward (contratos assíncronos não passam pelo BFF; o lag de ingestão é apenas **observado** em `metrics.md`).
  - Correção dos findings HIGH-001/HIGH-002/HIGH-003 no serviço (trabalho do repo `analysis-bi`); aqui apenas mitigação no BFF.
  - `GET /api/v1/metadata/regions` (501 Not Implemented na v1 — a UI usa lista local de mesorregiões IBGE até existir).
  - Qualquer visão individual/drill-down por paciente — **não existe no contrato** (só agregados) e não deve existir na UI.

## 4. Pirâmide de testes (Vocke/Fowler)

- Distribuição alvo: **muitos unit** (VO `Period`, schemas TypeBox do envelope com meta de privacidade, gap filling puro por granularidade, formatadores de período, mapper de status HTTP, view models de pirâmide/top N), **menos integração** (handlers Elysia `*.query.fn.ts`/`*.service.fn.ts` com fakes in-memory simulando o `analysis-bi`, incluindo `suppressed_groups > 0`, 400, 429 com backoff, 503 e os 8 content-types de export), **poucos E2E** (Playwright: 3–4 jornadas críticas — abrir dashboard demográfico com filtros, ver banner de supressão, exportar CSV verificando o download, estado degradado com `/ready` 503).
- **Citação** (obrigatória):
  > "Your best bet is to remember two things from Cook's original test pyramid:
  > 1. Write tests with different granularity
  > 2. The more high-level you get the fewer tests you should have.
  > Stick to the pyramid shape to come up with a healthy, fast and maintainable test suite."
  > — *(localização exata no corpus a registrar via `skills_citar` em `practical-test-pyramid--vocke.md`, Ham Vocke)*

## 5. Níveis, tipos e ferramentas

| Nível | Tipo | Ferramenta | Gate |
|---|---|---|---|
| Domínio (front) | unit (puro): VO `Period` (YYYY-MM, range não-invertido), schemas TypeBox de params (`axis`, `granularity`, `top`) e do envelope `{ data, meta: { k_threshold, suppressed_groups, total_records, period } }`, gap filling por granularidade, formatadores `"2025-03" → "mar/2025"`, `"2025-Q1" → "T1 2025"` | `bun:test` (`bun test`) | W3 |
| Application | ViewModels puros (`*.view-model.ts`) + bindings Solid (`*.binding.ts`) com ports fakes (sem rede): pirâmide etária (17 faixas × sexo), top N CID-10, faixas de renda em SM ordenadas, estado de supressão, mapper status → `AppError`, política de retry/backoff do 429 | `bun:test` + `happy-dom` | W3 |
| Integração (BFF) | Handlers Elysia `*.query.fn.ts`/`*.service.fn.ts` consumidos via Eden treaty, contra fakes in-memory (200 com/sem supressão, 400, 401, 429 com `Retry-After`, 500, 503; envelope de erro `{ data: { error, status, message } }`; export com `Content-Disposition` e content-type por formato) | `bun:test` + fakes in-memory | pré-merge |
| Componente | gráficos Solid e seus estados (loading skeleton, vazio "sem dados no período", erro com retry, sucesso), banner de supressão, alternativa textual/tabela, seletor de período/granularidade/mesorregião, menu de export com 8 formatos | `bun:test` + `happy-dom` | pré-merge |
| Aceitação | BDD Gherkin → E2E das jornadas críticas (incl. download real do export) | Playwright (mapeado em [bdd.md](./bdd.md)) | review |
| Q4 | a11y de dataviz, bundle, vitals, telemetria sem PII/filtros sensíveis | axe/Lighthouse CI, grep de bundle e de payloads RUM | release |

## 6. Critérios de entrada e saída (Definition of Done)

- **Entrada**: [bdd.md](./bdd.md) aprovado; testes RED escritos (🔴) conforme [tdd.md](./tdd.md).
- **Saída (GREEN 🟢)**: todos verdes + W3 (`/speckit-verify` — `bunx tsc --noEmit && bun test && bun run build`) + review W2 ([review.md](./review.md) APPROVED) + citações registradas + regressão zero (Princípio II — Errors as Values) + [checklist.md](./checklist.md) completo (a11y de gráficos, banner de supressão, estados por eixo, exports, sem PII em telemetria).

## 7. Riscos de qualidade

| Risco | Probab. | Impacto | Mitigação (teste) |
|---|---|---|---|
| Banner de supressão omitido quando `suppressed_groups > 0` → leitor conclui que "não há casos" onde há grupos < K=5 suprimidos (distorção estatística + opacidade LGPD) | média | crítico | teste de view model dedicado (T-008) + componente do banner (CT-002) + item bloqueador no [checklist.md](./checklist.md) e no [review.md](./review.md) |
| Gap filling incorreto: série esparsa interpolada (inventa dados) ou gap preenchido na granularidade errada (mistura `"2025-03"` com `"2025-Q1"`) | média | crítico | testes puros de gap filling por granularidade (T-004) com casos de borda (início/fim do range, range de 1 período, virada de ano) |
| Token/`Bearer` vazar para o bundle do client (agravado pelos findings HIGH-001/HIGH-002 do serviço — o BFF é a única camada que valida de fato) | baixa | crítico | grep automatizado no bundle (`NFR-002` de `metrics.fe.md`) + teste de handler Elysia garantindo injeção só no servidor + review W2 |
| RBAC do BFF frouxo: como o serviço não enforça roles (HIGH-003), qualquer falha de guard no BFF expõe os dashboards a papéis não autorizados | média | alto | testes de view model/route guard por papel + teste de handler Elysia rejeitando sessão sem papel autorizado (T-012) |
| 429 do rate limit global (MED-002 do serviço) tratado como erro fatal — dashboard quebra em vez de re-tentar com backoff | média | alto | teste de integração fake in-memory devolvendo 429 + política de retry com backoff exponencial e teto (T-011); UI mostra "muitas consultas, tentando novamente" |
| Range invertido (`period_end < period_start`) ou YYYY-MM malformado chega à API e vira 400 genérico em vez de validação na borda | média | médio | VO `Period` + TypeBox bloqueando antes da rede (T-001/T-002); 400 do backend mapeado mesmo assim (defesa em profundidade, CT-007) |
| Export interpretado como JSON pelo client (parse TypeBox aplicado a binário) ou filename do `Content-Disposition` perdido → arquivo sem nome/extensão | média | médio | teste de integração por formato (T-014): content-type esperado, repasse binário sem parse, filename `acdg-{dataset}-{period}.{ext}` preservado |
| Gráficos inacessíveis: leitores de tela sem alternativa textual/tabela; cores cruas fora dos tokens sem contraste AA | média | alto | testes de componente da alternativa textual + axe nas 5 telas + governance test de tokens (vanilla-extract) |
| Telemetria vazando combinações de filtros raras que reidentifiquem indiretamente (mesorregião pequena + CID-10 raro) | baixa | crítico | reporter só envia rota normalizada e nomes de campo EN, nunca valores de filtro; grep de payloads RUM em CI |
| Séries com `total_records` baixo lidas como tendência robusta (sem contexto de N) | média | médio | legenda obrigatória com `total_records` e `k_threshold` testada por componente (CT-002) |

## 8. Ambiente e dados de teste

- **Ambiente**: unit/component/integração rodam sem backend (fakes in-memory interceptam o BFF → `analysis-bi`); E2E Playwright contra stack local via compose de dev (`compose.dev.yml`), um serviço por vez por causa da colisão de portas 5432/3000/4222 documentada no CLAUDE.md raiz; `analysis-bi` local com `AUTH_REQUIRED=false` (modo dev documentado do serviço) e fixtures semeadas nas tabelas de fatos.
- **Dados**: fixtures mínimas e significativas — Kent Beck: "se não há diferença conceitual entre 1 e 2, use 1". Uma resposta de eixo **sem supressão** (`suppressed_groups: 0`), uma **com supressão** (`suppressed_groups: 3`), uma série esparsa com gaps (`2025-01`, `2025-03`, `2025-06` num range `2025-01..2025-06`), um período totalmente vazio (`data: []`, `total_records: 0`), um top 5 CID-10 com `icd_code`/`icd_label` sintéticos e as 6 faixas de renda em SM. Todos os agregados são sintéticos com `value >= 5` (coerente com K=5); **nenhuma fixture contém identificador individual** — o contrato não tem PII e as fixtures tampouco.

## 9. Papéis (whole-team approach)

Qualidade é responsabilidade do time todo, não de um silo de QA:

- **Dev frontend (web_02/)**: escreve BDD + testes RED antes do código (W0), mantém gap filling, mapper de erros e fixtures; roda `bun test && bunx tsc --noEmit` antes de abrir PR.
- **Dev backend (analysis-bi/)**: valida que cenários BDD refletem o contrato real (eixos, params, envelope com `k_threshold`/`suppressed_groups`, erros por status sem código estruturado, formatos de export); avisa mudanças de contrato e o progresso dos findings HIGH-001/HIGH-003.
- **Reviewer (W2)**: audita com [review.md](./review.md) — foco em transparência de supressão, gap filling correto, token fora do client, RBAC no BFF e Princípios I–VI da constituição.
- **Administradora parceira (ACDG-BV)**: sessões exploratórias Q3 e UAT do vocabulário PT-BR (faixa etária, mesorregião, CID-10, salário mínimo, supressão por privacidade) e da legibilidade dos gráficos antes do release.

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípios I–VI (regra de ouro de qualidade e tooling)
- [ADR-0003 — Bun supply chain](../../adr/0003-bun-supply-chain.md) — `bun:test` como runner; supply-chain hardening
- [ADR-0004 — Client-Server Split MVVM/DDD](../../adr/0004-client-server-split-mvvm-ddd.md) — ViewModel puro testável sem render
- [ADR-0009 — Framework-agnostic client](../../adr/0009-framework-agnostic-client.md) — núcleo sem `solid-js`; testável isoladamente
- [ADR-0010 — BFF Elysia fn naming](../../adr/0010-bff-orchestration-fn-naming.md) — `*.query.fn.ts` / `*.service.fn.ts`
- [ADR-0011 — No mocks in production](../../adr/0011-no-mocks-in-production.md) — fakes/in-memory em vez de MSW
- [ADR-0007 — vanilla-extract design system](../../adr/0007-design-system-vanilla-extract.md) — governance test de tokens; lint so-tokens
- [ADR-README](../../adr/README.md) — tabela de substituições e regra-mãe Bun-native
- Docs irmãos: [bdd.md](./bdd.md) · [tdd.md](./tdd.md) · [checklist.md](./checklist.md) · [review.md](./review.md) · [tasks.md](./tasks.md)
- Referência offline: `../../reference/framework/elysia/` · `../../reference/framework/solidstart/` · `../../reference/runtime/bun/` · `../../reference/ui/vanilla-extract/`
