# Review W2 (🟡→🟢): Dashboards Web Analysis-BI (front+BFF)

**Feature**: `specs/003-analysis-bi-web/` · **Ticket**: `[CTR-003-analysis-bi-web]` · **Round**: 1/3
**Consultores**: `/acdg-skills:clean-code-reviewer` + `/acdg-skills:security-reviewer` (superfície sensível: dados de saúde agregados K-anônimos/LGPD + sessão/token no BFF + RBAC compensatório do HIGH-003)

> Fase 9 da pipeline `core-api-sdd` (máximo rigor). Audit **read-only** do código de W1.
> Achados ancorados com **citação canônica** (Uncle Bob/Fowler/Valente; OWASP p/ segurança) via
> `skills_citar` — Princípio VI da [constituição web_02](../../../.specify/memory/constitution.md). Máx. 3 rounds antes de escalar.

## Veredito

**[ PENDENTE — registrar APPROVED | REJECTED ao fim do round ]**

## Issues

> Pontos de inspeção obrigatórios desta feature. Cada um vira linha de achado se violado;
> severidade indicada é a severidade **caso o ponto falhe**.

| # | Severidade | Arquivo:linha | Problema | Citação (regra) | Sugestão |
|---|---|---|---|---|---|
| 1 | blocker | `src/features/003-analysis-bi-web/ui/**`, `application/**` | **Qualquer tentativa de drill-down individual**: prop/rota/handler que aceite ou derive identificador de paciente, lista "de casos" por trás de um agregado, ou tooltip que sugira contagem unitária rastreável — o contrato só entrega agregados K-anônimos e a UI deve preservar essa garantia (whitelist de `labels`, T-016) | `skills_citar` → LGPD Art. 12 (anonimização) + OWASP (sensitive data exposure) | view models recebem somente `labels` agregados (`age_band`, `sex`, `mesoregion_name`, `icd_code`, `icd_label`, `income_band`, `violation_type`, `destination`, `appointment_type`) + `value` + `period`; remover qualquer prop/rota individual |
| 2 | blocker | `application/suppression-notice.view-model.ts`, `ui/suppression-banner.tsx` | **Ignorar `meta.suppressed_groups`**: banner ausente, condicionado a flag de feature, ou supressão (`suppressed_groups > 0`) confundida com estado vazio (`total_records: 0`) — leitor conclui "não há casos" onde há grupos < K=5 omitidos | `skills_citar` → Uncle Bob, *Clean Code* (estados explícitos, não booleanos ambíguos) + LGPD (transparência) | estado discriminado `empty` / `suppressed` / `populated`; banner obrigatório com contagem e K=5, anunciado com `role="status"`; teste T-008 |
| 3 | blocker | `src/features/003-analysis-bi-web/infrastructure/*.query.fn.ts`, `*.service.fn.ts` | Token/`Bearer` retornado ao client, logado ou presente no bundle; sessão fora de cookie HttpOnly — agravado pelos findings do serviço (HIGH-001 iss/aud não validados, HIGH-002 skip silencioso): o BFF é a única camada de confiança real | `skills_citar` → OWASP ASVS (session management / trust boundary) | injeção de `Authorization` exclusivamente no handler Elysia; resposta tipada sem campos de credencial; grep de bundle no CI — [ADR-0005](../../adr/0005-auth-session-refresh-decisions.md) |
| 4 | blocker | `ui/**/charts/*.tsx`, `vanilla-extract/tokens` | **Token de design ausente em gráfico**: hex/rgb/hsl hardcoded em série, eixo, grid ou tooltip em vez de tokens vanilla-extract de dataviz; sexo codificado só por cor | `skills_citar` → constituição Princípio III/V (design tokens — [ADR-0007](../../adr/0007-design-system-vanilla-extract.md)) + WCAG (use of color) | paleta categórica tokenizada com contraste AA e redundância rótulo/padrão; governance test so-tokens como gate |
| 5 | blocker | telemetria/RUM, logs do BFF, URLs | Valores de filtro em telemetria: mesorregião + CID-10 + período juntos podem reidentificar indiretamente em população de doenças raras; `message` técnica do backend ou booleanos do `/ready` ecoados à UI | `skills_citar` → OWASP (sensitive data exposure) + LGPD minimização | reportar apenas rota normalizada, eixo, granularidade e código `AppError`; valores de filtro nunca saem do client; detalhes do `/ready` só em log estruturado do servidor |
| 6 | major | `domain/gap-filling.ts` | **Gap filling incorreto**: interpolação entre pontos ausentes (inventa medições), gap preenchido na granularidade errada (mistura `"2025-03"` com `"2025-Q1"`), virada de ano quebrada, ou ponto `missing` indistinguível de zero medido | `skills_citar` → Valente, *Engenharia de Software Moderna* (domínio puro testável por propriedade) | função pura por granularidade com flag `missing: true`; casos de borda do T-004 (range de 1 período, virada de ano, resposta vazia) obrigatórios e verdes |
| 7 | major | `application/app-error-mapper.ts` | Mapper de erro com `default` silencioso, dependente de `message` EN do backend (contrato NÃO tem códigos estruturados — só status 400/401/404/429/500/501/503), ou 429 tratado como fatal sem retry/backoff | `skills_citar` → Uncle Bob, *Clean Code* (tratamento de erro explícito) | união de literais por status com fallback nomeado `unknown-error`; 429 → `stale-while-retrying` com backoff exponencial e teto (T-007/T-011) — [ADR-0002](../../adr/0002-errors-as-values.md) |
| 8 | major | `infrastructure/route-guards.ts`, `*.query.fn.ts` | RBAC do BFF ausente ou só cosmético (esconde link mas o handler Elysia atende qualquer sessão) — como o serviço não enforça roles (HIGH-003), o BFF é o único enforcement | `skills_citar` → OWASP (broken access control — enforce server-side) | guard no handler Elysia (não só na rota/UI), testado por T-012; negação sem vazar existência do recurso |
| 9 | major | `infrastructure/export-download.service.fn.ts` | Export parseado como JSON (corrompe Parquet/DBF/DBC), filename do `Content-Disposition` descartado, ou formato fora do enum dos 8 aceito na borda | `skills_citar` → Fowler (boundary explícito entre formatos) | repasse binário em stream; preservar `Content-Type` e `filename="acdg-{dataset}-{period}.{ext}"`; enum TypeBox dos formatos (T-014) |
| 10 | major | `domain/period.vo.ts`, formulário de filtros | Validação de período divergente do backend: YYYY-MM malformado ou range invertido chegando à rede (o TypeBox da borda deveria bloquear antes); ordenação alfabética das 17 faixas etárias (`"10-14"` antes de `"5-9"`) ou das 6 faixas de SM | `skills_citar` → constituição Princípio V (validação na borda com TypeBox — [ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md)) | VO `Period` + refine de range (T-001); comparadores canônicos de faixa (T-006) |
| 11 | minor | `ui/**` | Strings de UI fora do catálogo i18n (incl. rótulos de eixo/legenda/banner), identificadores de código em PT, ou alternativa textual/tabela ausente em gráfico novo | `skills_citar` → constituição idioma PT-BR + WCAG (text alternatives) | mover para o catálogo; código EN, mensagens PT; "Ver como tabela" obrigatório por gráfico (CT-012) |

**Citação de um achado relevante** (literal ≥4 linhas):
> "Error handling is important, but if it obscures logic, it's wrong. (...) In fact, exception
> handling done badly is one of the main sources of duplication and confusion in a code base.
> Returning error codes forces the caller to deal with the error immediately — make the handling
> explicit, named and exhaustive instead of scattering magic values."
> — *(localização exata no corpus a registrar via `skills_citar`; Robert C. Martin, *Clean Code*, cap. 7 — base para o mapper explícito por status HTTP, já que o `analysis-bi` não expõe códigos estruturados)*

## Checklist (princípios da [constituição web_02](../../../.specify/memory/constitution.md))

- [ ] **Princípio I — BFF-Orchestrated Boundary**: browser nunca recebe token; `Authorization: Bearer` injetado exclusivamente no servidor; client não conhece topologia de backends ([ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md), [ADR-0005](../../adr/0005-auth-session-refresh-decisions.md), [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md))
- [ ] **Princípio II — Errors as Values**: domínio puro sem `throw`; `Result<T,E>`; branded types (`Period`, faixas canônicas); mapper de status HTTP exaustivo ([ADR-0002](../../adr/0002-errors-as-values.md))
- [ ] **Princípio III — Vertical-Modular · MVVM × DDD**: isolamento de BC — cross-módulo só via `public-api`; a slice `003-analysis-bi-web` não importa internals de outra; ViewModel puro + binding Solid; view model não importa `solid-js` ([ADR-0001](../../adr/0001-vertical-modular-architecture.md), [ADR-0009](../../adr/0009-framework-agnostic-client.md))
- [ ] **Princípio IV — Bun-Native/Zero-NPM-Utility**: sem `npm`/`yarn`/`npx`/`pnpm`; apenas `bun`; nenhuma dependência npm que duplique o built-in; supply-chain via `trustedDependencies` + scanner ([ADR-0003](../../adr/0003-bun-supply-chain.md))
- [ ] **Princípio V — Strict TS & End-to-End Type Safety**: sem `any`; `bunx tsc --noEmit` limpo; TypeBox (`Elysia.t`) na borda do BFF; Eden propaga o tipo sem redeclarar Model; referenciar token vanilla-extract inexistente = erro de compilação ([ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md), [ADR-0007](../../adr/0007-design-system-vanilla-extract.md))
- [ ] **Princípio VI — Honesty in Production (No Mocks)**: nenhum `mock`/`stub` em `src/`; fakes/in-memory só em `tests/`; operação sem rota retorna `'not-implemented'`, nunca dado fabricado ([ADR-0011](../../adr/0011-no-mocks-in-production.md))
- [ ] Idioma: código EN, mensagens PT-BR (catálogo i18n completo)
- [ ] Segurança ([ADR-0005](../../adr/0005-auth-session-refresh-decisions.md), [ADR-0006](../../adr/0006-security-headers-csp.md)): token jamais no browser (cookie HttpOnly + Bearer só no servidor); input validado na borda com TypeBox (período, eixo, granularidade, formato); RBAC enforced no handler Elysia (compensação do HIGH-003); client consumidor passivo — nenhuma agregação "criativa" no browser que contorne o K=5
- [ ] LGPD/privacidade: banner de supressão sempre que `suppressed_groups > 0`; **valor de filtro em telemetria = blocker imediato**; whitelist de `labels` agregados (T-016); fixtures sintéticas com `value >= 5`
- [ ] Fidelidade estatística: gap filling sem interpolação, `missing` ≠ zero medido, legenda com `total_records` e K=5; estados `empty` / `suppressed` / `populated` discriminados
- [ ] MVVM funcional: ViewModels puros (`*.view-model.ts`) para pirâmide etária, top N CID-10, supressão e retry — testáveis sem render, sem `solid-js` ([ADR-0009](../../adr/0009-framework-agnostic-client.md))
- [ ] Estados de UI completos nos 5 eixos: loading/vazio/erro/sucesso + 429 `stale-while-retrying` + 503 degradado com re-sonda (CT-003, CT-008, CT-009)
- [ ] Acessibilidade de dataviz: alternativa textual/tabela por gráfico, paleta AA, redundância além de cor ([ADR-0007](../../adr/0007-design-system-vanilla-extract.md); CT-012)
- [ ] Testes de [tdd.md](./tdd.md) todos verdes pelo motivo certo; nenhum teste desabilitado/skipped sem issue vinculada (Princípio VI — Honesty)

## Decisão

- **APPROVED** → seguir para o gate W3 (GREEN): `bunx tsc --noEmit && bun test && bun run build` + [checklist.md](./checklist.md).
- **REJECTED** → endereçar issues (round++); regressão zero (Princípio II). Round 3 esgotado → escalar ao humano.

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípios I–VI (lei de mais alto nível)
- [ADR-0001 — Vertical Modular Architecture](../../adr/0001-vertical-modular-architecture.md)
- [ADR-0002 — Errors as Values](../../adr/0002-errors-as-values.md)
- [ADR-0003 — Bun supply chain](../../adr/0003-bun-supply-chain.md)
- [ADR-0004 — Client-Server Split MVVM/DDD](../../adr/0004-client-server-split-mvvm-ddd.md)
- [ADR-0005 — Auth/session/refresh](../../adr/0005-auth-session-refresh-decisions.md)
- [ADR-0006 — Security headers & CSP](../../adr/0006-security-headers-csp.md)
- [ADR-0007 — vanilla-extract design system](../../adr/0007-design-system-vanilla-extract.md)
- [ADR-0009 — Framework-agnostic client](../../adr/0009-framework-agnostic-client.md)
- [ADR-0010 — BFF Elysia fn naming](../../adr/0010-bff-orchestration-fn-naming.md)
- [ADR-0011 — No mocks in production](../../adr/0011-no-mocks-in-production.md)
- [ADR-README](../../adr/README.md) — tabela de substituições
- Docs irmãos: [bdd.md](./bdd.md) · [tdd.md](./tdd.md) · [qa-test-plan.md](./qa-test-plan.md) · [checklist.md](./checklist.md) · [tasks.md](./tasks.md)
- Referência offline: `../../reference/framework/elysia/` · `../../reference/framework/solidstart/` · `../../reference/runtime/bun/` · `../../reference/ui/vanilla-extract/`
