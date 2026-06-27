# Plano de TDD (RED 🔴): Dashboards Web Analysis-BI (front+BFF)

**Feature**: `specs/003-analysis-bi-web/` · **Consultor**: `/acdg-skills:tdd-strategist` · **Ticket**: `[CTR-003-analysis-bi-web]`

> Fase 7 da pipeline `core-api-sdd` (máximo rigor). Ancorado em Kent Beck (TDD) — **citação
> obrigatória** via `skills_citar` (Princípio VI da constituição). Os testes são escritos ANTES da implementação
> (W0) e DEVEM falhar por inexistência da API. Runner: **`bun:test`** (`bun test`); componentes via
> `happy-dom`; integração do BFF com **fakes/in-memory** (sem rede real, conforme [ADR-0011](../../adr/0011-no-mocks-in-production.md)).

## Estratégia

- **Estilo**: **Detroit/classicista no domínio do front** (VO `Period`, schemas TypeBox, gap filling, formatadores de período, view models de pirâmide/top N — funções puras testadas por estado/retorno, sem mocks) e **London/mockist na borda** (handlers Elysia do BFF — `*.query.fn.ts`/`*.service.fn.ts`: o `analysis-bi` é simulado por fakes in-memory; o cookie de sessão e a injeção de `Authorization: Bearer` no servidor são verificados por interação, incluindo o repasse binário dos exports). Justificativa: o valor desta feature está na **transformação fiel de agregados K-anônimos em visualização** — gap filling sem inventar dados, supressão comunicada, períodos formatados — que é 100% pura e testável sem rede; a borda HTTP, por sua vez, é colaboração com um processo externo cujo contrato de erro é por status HTTP sem código estruturado, e precisa de simulação fiel (400/429/503, content-types de export). Fakes in-memory em vez de MSW, conforme [ADR-0011](../../adr/0011-no-mocks-in-production.md) (Princípio VI — Honesty in Production).
- **Níveis**:
  - **domínio** — `src/features/003-analysis-bi-web/domain/`: VO `Period` (regex `^\d{4}-(0[1-9]|1[0-2])$`, smart constructor com `Result`, range não-invertido `period_start <= period_end`); schemas TypeBox ([Elysia.t](../../reference/framework/elysia/)) dos query params (`axis` ∈ `demographics | epidemiological | socioeconomic | protection | care`; `granularity` ∈ `monthly | quarterly | yearly` default `monthly`; `top` inteiro positivo, só para epidemiological/socioeconomic; `mesoregion` opcional) e dos envelopes — sucesso `{ data: Array<{ labels, value, period }>, meta: { timestamp, period, k_threshold, suppressed_groups, total_records } }` e erro `{ data: { error, status, message }, meta }`; **gap filling puro** por granularidade (`"2025-03"` mensal, `"2025-Q1"` trimestral, `"2025"` anual); formatadores de período (`"2025-03" → "mar/2025"`, `"2025-Q1" → "T1 2025"`, `"2025" → "2025"`); ordenações canônicas das 17 faixas etárias (`"0-4"` … `"80+"`) e das 6 faixas de renda em SM (`0-0.5` … `5+`).
  - **application** — ViewModels puros (`*.view-model.ts`) e bindings Solid (`*.binding.ts`) com ports fakes: mapper `status HTTP → AppError → tag i18n` (o contrato NÃO tem códigos estruturados — mapeia por status 400/401/404/429/500/501/503 com fallback nomeado), view model da pirâmide etária (age_band × sex), top N CID-10 ordenado, estado de supressão (`suppressed_groups > 0 → banner`), política de retry/backoff do 429, visibilidade RBAC no BFF (compensação do HIGH-003). O núcleo (`data`/`domain`/`*.view-model.ts`) não importa `solid-js`/`@solidjs/*` ([ADR-0009](../../adr/0009-framework-agnostic-client.md)).
  - **integração** — Handlers Elysia (`*.query.fn.ts`/`*.service.fn.ts`) consumidos via **Eden treaty** ([ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md)) contra fakes in-memory: envelope parseado com meta de privacidade, `Authorization: Bearer` injetado só no servidor, 400/401/429/500/503 mapeados, export repassado como binário com `Content-Disposition` preservado nos 8 formatos, `/ready` 503 → estado degradado. Inclui o teste-guarda de que **nenhum dado individual é renderizável** (T-016).
- **Citação que sustenta a estratégia** (obrigatória):
  > "Red — write a little test that doesn't work, and perhaps doesn't even compile at first.
  > Green — make the test work quickly, committing whatever sins necessary in the process.
  > Refactor — eliminate all of the duplication created in merely getting the test to work.
  > Red/green/refactor. The TDD mantra."
  > — *(localização exata no corpus a registrar via `skills_citar`; Kent Beck, *Test-Driven Development: By Example*)*

## Test list (Kent Beck)

> Lista viva do que precisa ser testado. Marque conforme RED→GREEN.

**Domínio (puro)**

- [ ] T-001 — `Period.create("2025-03")` retorna `ok`; `"2025-13"`, `"2025-3"`, `"03-2025"` e `"2025"` retornam `err('invalid-period')`; `PeriodRange.create` com `period_end < period_start` retorna `err('inverted-range')` ← CT-007 — nível: domínio
- [ ] T-002 — schemas TypeBox dos params: `axis` fora do enum dos 5 eixos rejeitado; `granularity` default `monthly`; `top` aceita só inteiro positivo e só nos eixos `epidemiological`/`socioeconomic`; `mesoregion` opcional ← CT-001, CT-005 — nível: domínio
- [ ] T-003 — schema do envelope de sucesso parseia `{ data: [{ labels, value, period }], meta: { timestamp, period, k_threshold: 5, suppressed_groups, total_records } }` e o de erro parseia `{ data: { error, status, message }, meta }`; campos desconhecidos em `labels` não quebram o parse (forward-compat) ← CT-001 — nível: domínio
- [ ] T-004 — gap filling: range mensal `2025-01..2025-06` com dados só em `2025-01/2025-03/2025-06` produz 6 pontos, gaps com `value: 0` e flag `missing: true` (nunca interpolado); trimestral `2025-Q1..2025-Q4` e anual idem; bordas: range de 1 período, virada de ano (`2024-11..2025-02`), resposta vazia → todos os pontos `missing` ← CT-004, CT-010 — nível: domínio
- [ ] T-005 — formatadores de período: `"2025-03" → "mar/2025"`, `"2025-12" → "dez/2025"`, `"2025-Q1" → "T1 2025"`, `"2025" → "2025"`; formato desconhecido retorna `err('unknown-period-format')`, nunca string crua ← CT-004, CT-010 — nível: domínio
- [ ] T-006 — ordenações canônicas: 17 age bands na ordem `"0-4" < "5-9" < … < "75-79" < "80+"` (não alfabética — `"10-14"` não vem antes de `"5-9"`); 6 faixas de renda `0-0.5 < 0.5-1 < 1-2 < 2-3 < 3-5 < 5+` SM — nível: domínio

**Application (fakes, sem rede)**

- [ ] T-007 — mapper `AppError` por status HTTP (sem códigos estruturados no contrato): 400 → `invalid-params`, 401 → `session-expired`, 404 → `unknown-axis`, 429 → `rate-limited`, 500 → `service-error`, 501 → `not-implemented`, 503 → `service-unavailable`; status desconhecido cai em `unknown-error` sem `default` silencioso; a `message` EN do backend nunca vaza à UI ← CT-007, CT-008, CT-009 — nível: application
- [ ] T-008 — view model de supressão: `suppressed_groups: 3` → estado `{ showBanner: true, count: 3, kThreshold: 5 }` com tag i18n "grupos suprimidos por privacidade"; `suppressed_groups: 0` → sem banner; `total_records` e `k_threshold` sempre presentes na legenda ← CT-002 — nível: application
- [ ] T-009 — view model da pirâmide etária: agrupa itens por `labels.age_band` × `labels.sex`, ordena pelas 17 faixas canônicas, separa MALE/FEMALE em lados opostos e UNKNOWN em série própria; faixa ausente vira barra zero ← CT-001 — nível: application
- [ ] T-010 — view model top N CID-10: ordena por `value` decrescente, limita a N, expõe `icd_code` + `icd_label` por barra; empate mantém ordem estável ← CT-005 — nível: application
- [ ] T-011 — política de retry do 429: backoff exponencial com teto de tentativas, respeita `Retry-After` quando presente, mantém últimos dados válidos (estado `stale-while-retrying`), nunca re-tenta após o teto sem ação manual ← CT-009 — nível: application
- [ ] T-012 — RBAC no BFF (compensação do HIGH-003): sessão sem papel autorizado → rota de dashboard e handler de export bloqueados no servidor; view model não exibe links de eixos para papéis não autorizados — nível: application

**Integração (BFF Elysia + fakes in-memory)**

- [ ] T-013 — handler `getIndicators` (`*.query.fn.ts`): envia `GET /api/v1/indicators/{axis}` com `Authorization: Bearer <jwt>` injetado no servidor e os params validados via TypeBox; 200 → envelope parseado preservando `meta.suppressed_groups`; resposta da função não contém token; params inválidos nem geram chamada de rede (TypeBox na borda) ← CT-001, CT-004, CT-005 — nível: integração
- [ ] T-014 — handler `downloadExport` (`*.service.fn.ts`): `GET /api/v1/export/{format}?dataset=...&period_start=...&period_end=...` parametrizado nos 8 formatos (`csv`, `json`, `xml`, `parquet`, `dbf`, `dbc`, `ods`, `fhir`); corpo repassado como stream binário SEM parse JSON; `Content-Disposition: attachment; filename="acdg-{dataset}-{period}.{ext}"` e `Content-Type` preservados; formato fora do enum rejeitado na borda ← CT-006, CT-011 — nível: integração
- [ ] T-015 — erros do contrato: fake in-memory devolvendo 400 (`message: "invalid period_start: expected YYYY-MM format"`), 401, 429 (com e sem `Retry-After`), 500 e 503 → cada um vira o `AppError` correto do T-007; o body de erro `{ data: { error, status, message } }` parseia no schema de erro ← CT-007, CT-009 — nível: integração
- [ ] T-016 — **nenhum dado individual é renderizável**: o schema de resposta só admite `labels` agregados (`age_band`, `sex`, `mesoregion_name`, `icd_code`, `icd_label`, `income_band`, `violation_type`, `destination`, `appointment_type`) + `value` + `period`; payload adversarial com chaves `patient_hash`, `patientId`, `cpf` ou `name` em `labels` é aceito pelo parse **mas as chaves não transitam ao view model** (whitelist, não blacklist); nenhum componente de UI possui prop que aceite identificador individual — verificado por typecheck + teste de render — nível: integração
- [ ] T-017 — handler `checkReadiness` (`*.query.fn.ts`): `GET /ready` 200 → `ready`; 503 com `{ data: { status, database: false, nats: true } }` → estado `degraded` SEM expor os booleanos internos à UI (só ao log estruturado do BFF); re-sonda com intervalo crescente ← CT-008 — nível: integração

## Mapeamento BDD → teste

| Cenário (BDD) | Teste | Arquivo | Nível |
|---|---|---|---|
| CT-001 | T-002, T-003, T-009, T-013 | `application/__tests__/age-pyramid.view-model.test.ts` + `infrastructure/__tests__/get-indicators.query.fn.test.ts` | application/integração |
| CT-002 | T-008 | `application/__tests__/suppression-notice.view-model.test.ts` | application |
| CT-003 | T-004 (resposta vazia), componente | `ui/__tests__/empty-period-state.test.tsx` | domínio/componente |
| CT-004 | T-004, T-005, T-013 | `domain/__tests__/gap-filling.test.ts` + `get-indicators.query.fn.test.ts` | domínio/integração |
| CT-005 | T-002, T-010, T-013 | `application/__tests__/top-diagnoses.view-model.test.ts` | application/integração |
| CT-006 / CT-011 | T-014 | `infrastructure/__tests__/export-download.service.fn.test.ts` | integração |
| CT-007 | T-001, T-007, T-015 | `domain/__tests__/period.vo.test.ts` + `application/__tests__/app-error-mapper.test.ts` | domínio/application/integração |
| CT-008 | T-017 | `infrastructure/__tests__/readiness.query.fn.test.ts` | integração |
| CT-009 | T-011, T-015 | `infrastructure/__tests__/get-indicators.query.fn.test.ts` (429) | application/integração |
| CT-010 | T-004, T-005 | `domain/__tests__/gap-filling.test.ts` | domínio |
| CT-012 | componente (a11y) | `ui/__tests__/chart-table-alternative.test.tsx` | componente |
| (guarda LGPD) | T-016 | `infrastructure/__tests__/no-individual-data.test.ts` | integração |

## Ordem RED (primeiro teste a falhar)

1. **T-001** — `Period.create` é o teste mais simples que força a primeira decisão de design: VO branded + smart constructor retornando `Result` ([ADR-0002](../../adr/0002-errors-as-values.md)), sem classe e sem `throw`, com o range não-invertido como segunda invariante.
2. T-003 — schema TypeBox do envelope com a meta de privacidade (`k_threshold`/`suppressed_groups`/`total_records`): fundação de toda a borda e do banner.
3. T-004/T-005 — gap filling e formatação de períodos (o coração estatístico da feature; puro, rápido, com mais casos de borda).
4. T-007 — mapper por status HTTP (força a união de literais dos `AppError` sem códigos estruturados do backend).
5. T-008/T-009/T-010 — view models de supressão, pirâmide e top N (consomem T-003…T-006).
6. T-013 — primeiro handler Elysia `*.query.fn.ts` (padrão `bff-endpoint-add`, [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md)); fake in-memory configurado aqui.
7. T-014, T-015, T-017 — export binário, matriz de erros e readiness.
8. T-011, T-012, T-016 — retry/backoff, RBAC no BFF e o teste-guarda de dado individual (dependem dos anteriores existirem).

## Confirmação RED 🔴

```bash
bun test          # deve FALHAR — API ainda não existe
```

- [ ] Todos os testes da lista existem e **falham pelo motivo certo** (inexistência da API —
      módulos `domain/`, `application/`, `infrastructure/` da slice `003-analysis-bi-web` ainda
      não criados), não por erro de compilação/typo nos próprios testes.
- [ ] Ticket aberto: `bun run pipeline:state init CTR-003-analysis-bi-web --size L`; W0 registrado.

> Próxima fase: implementação mínima (W1) até 🟡 YELLOW (testes passam), depois review W2 ([review.md](./review.md)) e gate W3 ([qa-test-plan.md](./qa-test-plan.md)).

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípio II (Errors as Values), IV (Bun-Native/Zero-NPM-Utility), V (Strict TS & End-to-End Type Safety), VI (Honesty/No Mocks)
- [ADR-0002 — Errors as Values](../../adr/0002-errors-as-values.md) — `Result<T,E>`; VO branded com smart constructor
- [ADR-0003 — Bun supply chain](../../adr/0003-bun-supply-chain.md) — `bun:test` como runner; `bun test` no CI
- [ADR-0004 — Client-Server Split MVVM/DDD](../../adr/0004-client-server-split-mvvm-ddd.md) — fronteira Eden treaty → rota Elysia
- [ADR-0009 — Framework-agnostic client](../../adr/0009-framework-agnostic-client.md) — ViewModel puro + binding Solid; núcleo sem `solid-js`
- [ADR-0010 — BFF Elysia fn naming](../../adr/0010-bff-orchestration-fn-naming.md) — `*.query.fn.ts` / `*.service.fn.ts`
- [ADR-0011 — No mocks in production](../../adr/0011-no-mocks-in-production.md) — fakes/in-memory em vez de MSW; `not-implemented` como valor
- [ADR-README](../../adr/README.md) — tabela de substituições completa (pnpm→Bun, Zod→TypeBox, node:test→bun:test)
- Docs irmãos: [bdd.md](./bdd.md) · [qa-test-plan.md](./qa-test-plan.md) · [checklist.md](./checklist.md) · [review.md](./review.md) · [tasks.md](./tasks.md)
- Referência offline: `../../reference/framework/elysia/` · `../../reference/framework/solidstart/` · `../../reference/runtime/bun/`
