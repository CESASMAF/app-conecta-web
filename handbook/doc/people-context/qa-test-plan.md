# Plano de Testes / QA: Interface Web People-Context (front+BFF)

**Feature**: `specs/002-people-context-web/` · **Consultores**: `/acdg-skills:tdd-strategist` + `/acdg-skills:requirements-engineer`

> Plano de QA da pipeline `core-api-sdd`. Ancorado em **Agile Testing Condensed** (Gregory &
> Crispin) — agora no corpus (domínio `tdd`). Decisões de estratégia exigem **citação canônica
> ≥4 linhas** via `skills_citar` (Princípio VI: Honesty). Complementa o [tdd.md](./tdd.md)
> (test list/RED): aqui é o **plano amplo de QA**; lá, os testes unitários do ciclo RED→GREEN.

## 1. Contexto (Agile Testing — Cap. 3)

> "Para planejar atividades de teste eficazmente, um time precisa considerar seu contexto":
> **time**, **produto** e **níveis de detalhe**.

- **Time**: distribuído e enxuto (instância ACDG-BV, associação de recursos limitados); sem QA dedicado — abordagem *whole-team*. Sem especialista de performance/segurança em tempo integral: Q4 coberto por gates automatizados (Lighthouse, grep de bundle, `bun test`/`bunx tsc --noEmit`) e pelo `security-reviewer` sob demanda no review W2.
- **Produto**: **registro de identidade do ecossistema ACDG** — fonte de verdade de pessoas (CPF, nascimento, e-mail) e de vínculos `system:role`, com provisão de login no Authentik e erasure LGPD (Art. 18 V). O nível de qualidade exigido é alto: erro de RBAC (ex.: admin escopado mutando outro sistema), exposição de CPF em logs/telemetria, vazamento de link de recuperação de senha em HTTP ou erasure acionado por papel errado são defeitos críticos, não cosméticos.
- **Níveis de detalhe**: este plano cobre o nível **feature** (`002-people-context-web`); as histórias (US-001…US-007 do `spec.fe.md`) são detalhadas em cenários no [bdd.md](./bdd.md); tarefas e gates em [tasks.md](./tasks.md).

**Citação que sustenta a abordagem de planejamento** (obrigatória):
> "Collaborative testing practices that occur continuously, from inception to delivery and beyond,
> supporting frequent delivery of value for our customers. Testing activities focus on building
> quality into the product, using fast feedback loops to validate our understanding. The practices
> strengthen and support the idea of whole-team responsibility for quality."
> — *(definição de agile testing; localização exata no corpus a registrar via `skills_citar` em `agile-testing-condensed--gregory-crispin.md`, Janet Gregory, Lisa Crispin, *Agile Testing Condensed*)*

## 2. Estratégia por quadrantes (Agile Testing Quadrants)

| Quadrante | Foco | Nesta feature |
|---|---|---|
| **Q1** tecnologia ⋅ apoia o time | unit, component, integração (TDD) | `bun:test` + `@testing-library/solid`: VO `Cpf` (MOD-11 + repdigits), schemas TypeBox (`CreatePersonInput`, envelope `{ data, meta }` com cursor), mapper `PEO/ROL/IDP/AUTH → AppError → tag i18n`, ViewModels puros (sem `@solidjs/*`), rotas Elysia com fakes in-memory — ver [tdd.md](./tdd.md) |
| **Q2** negócio ⋅ apoia o time | testes de aceitação, exemplos (BDD) | cenários Gherkin de cadastro com/sem login, dedup por CPF, vínculos de sistema (ROL-006/007/008), reset de senha 202 e erasure — ver [bdd.md](./bdd.md) (CT-001…CT-016) |
| **Q3** negócio ⋅ critica o produto | exploratório, usabilidade, UAT | sessões exploratórias com a administradora da associação (papel `admin`): jornada completa buscar → cadastrar → provisionar login → vincular papel; validação do vocabulário PT-BR (pessoa, vínculo de sistema, provisão de login, apagamento total) |
| **Q4** tecnologia ⋅ critica o produto | performance, segurança, confiabilidade | orçamentos de `metrics.fe.md` (Web Vitals) e `metrics.md` (p95 por grupo de endpoint, taxa de 207); grep de bundle por `Bearer`/`accessToken`; grep de telemetria por CPF; axe/Lighthouse a11y; governance tests em `bun:test` verificando boundaries de módulo |

## 3. Escopo

- **Em escopo**:
  - Jornadas web sobre a API `people-context` `/api/v1`: listagem paginada de pessoas (`GET /people` com `search`, `cursor`, `limit`), busca por CPF (`GET /people/by-cpf/:cpf`), detalhe (`GET /people/:personId`), cadastro com e sem login (`POST /people` com `createLogin`/`initialPassword`), edição (`PUT /people/:personId` com semântica COALESCE), ativação/desativação (`PUT .../deactivate|reactivate`), provisão retroativa de login (`POST /people/:personId/login`), reset de senha (`POST /people/:personId/request-password-reset`), erasure LGPD (`DELETE /people/:personId`), vínculos (`POST/GET /people/:personId/roles`, `PUT .../roles/:roleId/deactivate|reactivate`) e discovery (`GET /roles?system=...`).
  - Validação TypeBox na borda do BFF Elysia (input e response), máscara/validação de CPF client-side espelhando MOD-11 + rejeição de repdigits, e mapeamento exaustivo dos códigos de erro reais (`PEO-001`…`PEO-010`, `ROL-001`…`ROL-009`, `IDP-001`…`IDP-005`, `AUTH-001`…`AUTH-003`, `ADM-001`) para mensagens i18n.
  - RBAC na UI (worker/owner/admin/admin escopado `system:admin`/superadmin) coerente com o AuthGuard do backend (matching `r === required || r.endsWith(":" + required)`); `X-Actor-Id` injetado exclusivamente pelo BFF em mutações.
  - Comportamento frente a `201` idempotente de dedup por CPF, `207 Multi-Status` (pessoa criada, IdP falhou → retry via provisão retroativa), `204` noop de vínculo já ativo, `409` (PEO-005/006/008, ROL-009), `422` (PEO-007/009) e `502 IDP-*`.
- **Fora de escopo**:
  - Testes do domínio Bun/Elysia do `people-context` (cobertos pela suíte `bun test` do próprio repo, gate ≥95%).
  - Consumo NATS dos eventos `people.*` por `social-care`/`analysis-bi`/`queue-manager` (contratos assíncronos não passam pelo BFF); o e-mail de recuperação de senha montado pelo `queue-manager`.
  - Administração do Authentik em si (groups via blueprint ADR-029, flows de recovery) — a UI só observa os efeitos via API do `people-context`.
  - Tela de auditoria de eventos do outbox (feature futura; aqui só o reflexo do estado no DB).

## 4. Pirâmide de testes (Vocke/Fowler)

- Distribuição alvo: **muitos unit** (VO `Cpf` com MOD-11, schemas TypeBox, mapper exaustivo de erros, ViewModels puros), **menos integração** (rotas Elysia do BFF com fakes in-memory simulando o `people-context`, incluindo 201 dedup, 207, 204 noop e 502), **poucos E2E** (Playwright: 3–4 jornadas críticas — cadastro com login feliz, dedup por busca de CPF antes do cadastro, retry pós-207, erasure com dupla confirmação).
- **Citação** (obrigatória):
  > "Your best bet is to remember two things from Cook's original test pyramid:
  > 1. Write tests with different granularity
  > 2. The more high-level you get the fewer tests you should have.
  > Stick to the pyramid shape to come up with a healthy, fast and maintainable test suite."
  > — *(localização exata no corpus a registrar via `skills_citar` em `practical-test-pyramid--vocke.md`, Ham Vocke)*

## 5. Níveis, tipos e ferramentas

| Nível | Tipo | Ferramenta | Gate |
|---|---|---|---|
| Domínio (front) | unit (puro): VO `Cpf` (MOD-11 + repdigits), schemas TypeBox de request/response, união de literais dos códigos de erro, máscara/formatadores CPF e data ISO 8601 | **`bun:test`** (`bun test`) | W3 |
| Application | ViewModels puros / use cases com ports fakes (sem rede, sem `@solidjs/*`): mapper `AppError`, acumulação de cursor, visibilidade RBAC, ViewModel de 207 | **`bun:test`** | W3 |
| Integração (BFF) | Rotas Elysia ([ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md)) contra fakes in-memory (status 201/204/207/400/403/404/409/422/502, envelope `{ data, meta }`, erro `{ success: false, error: { code, message } }`); Eden Treaty valida tipos end-to-end | **`bun:test`** | pré-merge |
| Componente | formulários Solid (cadastro, vínculo, reset), estados loading/erro/vazio, dupla confirmação de erasure, RBAC condicional | `bun:test` + `@testing-library/solid` | pré-merge |
| Aceitação | BDD Gherkin → E2E das jornadas críticas | Playwright (mapeado em [bdd.md](./bdd.md)) | review |
| Governance | boundaries de módulo, núcleo client sem `@solidjs/*`, só-tokens no design system, `no-mocks-in-src` | governance tests em **`bun:test`** ([ADR-0001](../../adr/0001-vertical-modular-architecture.md), [ADR-0011](../../adr/0011-no-mocks-in-production.md)) | pré-merge |
| Q4 | a11y, bundle, vitals, telemetria sem CPF | axe/Lighthouse CI, grep de bundle e de payloads RUM | release |

## 6. Critérios de entrada e saída (Definition of Done)

- **Entrada**: [bdd.md](./bdd.md) aprovado; testes RED escritos (🔴) conforme [tdd.md](./tdd.md).
- **Saída (GREEN 🟢)**: todos verdes + W3 (`/speckit-verify` — `bunx tsc --noEmit && bun test && bun build`) + review W2 ([review.md](./review.md) APPROVED) + citações registradas + regressão zero (Princípio II) + [checklist.md](./checklist.md) completo (a11y, LGPD, RBAC, estados 207/409/422, dupla confirmação de erasure).

## 7. Riscos de qualidade

| Risco | Probab. | Impacto | Mitigação (teste) |
|---|---|---|---|
| Token/`Bearer` vazar para o bundle do client, ou `X-Actor-Id` forjável a partir do browser | baixa | crítico | grep automatizado no bundle (`NFR-002` de `metrics.fe.md`) + teste do handler Elysia garantindo `X-Actor-Id` derivado da sessão no servidor + review W2 |
| CPF aparecer em logs do BFF, URLs de navegação, query params de telemetria, payloads RUM ou storage do browser (LGPD) | média | crítico | grep de payloads de observabilidade em CI + teste do reporter (campos EN, nunca valores) + item dedicado no [checklist.md](./checklist.md) |
| Mapper de erro não cobrir código novo (ex.: `ROL-009` de race) → mensagem genérica para a administradora | média | alto | switch exaustivo testado por união de literais; teste parametrizado por código (T-005 do [tdd.md](./tdd.md)) |
| 207 Multi-Status tratado como erro fatal — pessoa criada some da UI e o retry via `POST /people/:id/login` não é oferecido | média | alto | teste de integração fake devolvendo 207 + ViewModel dedicado (T-008) + cenário CT-004 |
| Dedup por CPF (201 idempotente) interpretado como "nova pessoa criada" → registros mentais duplicados na operação | média | médio | teste do ViewModel distinguindo `id` já existente (busca prévia por CPF) + cenário CT-003/CT-006 |
| UI oferecer vínculo que o backend negará: admin escopado em outro sistema (`ROL-007`), auto-assign (`ROL-008`), `superadmin` por não-superadmin (`ROL-006`) | média | alto | testes de ViewModel por papel + cenários CT-008…CT-010; erros 403 mapeados a mensagens específicas |
| Erasure LGPD acionado sem dupla confirmação ou oferecido a não-superadmin | baixa | crítico | teste de componente da dupla confirmação (digitar o nome da pessoa) + RBAC `superadmin` (CT-014/CT-015) |
| Paginação por cursor duplicar/perder pessoas ao concatenar páginas | média | médio | teste do ViewModel de lista com `nextCursor`/`hasMore` simulados (fake in-memory) |
| Link de recuperação de senha esperado no body do 202 (ele só viaja no evento NATS — ADR-030) | baixa | alto | teste de integração: 202 sem link → UI exibe "instruções enviadas por e-mail", nunca um link |

## 8. Ambiente e dados de teste

- **Ambiente**: unit/component/integração rodam sem backend (fakes in-memory interceptam o BFF → `people-context` — sem MSW, [ADR-0011](../../adr/0011-no-mocks-in-production.md)); E2E Playwright contra stack local via compose de dev (`compose.dev.yml`), um serviço por vez por causa da colisão de portas 5432/3000/4222 documentada no CLAUDE.md raiz; Authentik simulado pelo `createNoopAuthentikClient` do próprio serviço em dev.
- **Dados**: fixtures mínimas e significativas — Kent Beck: "se não há diferença conceitual entre 1 e 2, use 1". Uma pessoa sem login (`idpUserId=null`), uma com login provisionado, uma inativa (`active=false`), uma com vínculo `social-care:patient` ativo e um inativo; CPFs válidos gerados por dígito verificador MOD-11 e os inválidos canônicos `11111111111` (repdigit) e `12345678900` (DV errado). Nunca usar CPFs ou nomes reais em fixtures (Princípio VI: Honesty in Production).

## 9. Papéis (whole-team approach)

Qualidade é responsabilidade do time todo, não de um silo de QA:

- **Dev frontend (web_02/)**: escreve BDD + testes RED antes do código (W0), mantém mapper de erros e fixtures; roda `bun test && bunx tsc --noEmit` antes de abrir PR.
- **Dev backend (people-context/)**: valida que cenários BDD refletem o contrato real (códigos `PEO/ROL/IDP/AUTH`, status 201/204/207/409/422/502, envelope); avisa mudanças de contrato via versionamento SemVer da API.
- **Reviewer (W2)**: audita com [review.md](./review.md) — foco em segurança de token/`X-Actor-Id`, CPF fora de telemetria, validação na borda e Princípios I–VI da [constituição web_02](../../../.specify/memory/constitution.md).
- **Administradora parceira (ACDG-BV)**: sessões exploratórias Q3 e UAT do vocabulário PT-BR (pessoa, vínculo, provisão de login, apagamento total) antes do release.

## Referências

- [Constitution web_02](../../../.specify/memory/constitution.md) — Princípios I–VI
- [ADR README (índice)](../../adr/README.md) — tabela de substituições de stack
- [ADR-0001 — Vertical-Modular Architecture](../../adr/0001-vertical-modular-architecture.md) — boundaries de módulo; governance tests
- [ADR-0002 — Errors as Values](../../adr/0002-errors-as-values.md) — `Result<T,E>`
- [ADR-0003 — Bun Supply Chain](../../adr/0003-bun-supply-chain.md) — `bun:test` como runner nativo
- [ADR-0004 — Client×Server Split](../../adr/0004-client-server-split-mvvm-ddd.md) — Eden treaty → rota Elysia
- [ADR-0009 — Framework-Agnostic Client](../../adr/0009-framework-agnostic-client.md) — ViewModel puro + binding Solid
- [ADR-0010 — BFF Orchestration / fn naming](../../adr/0010-bff-orchestration-fn-naming.md) — `*.query.fn.ts` / `*.service.fn.ts`
- [ADR-0011 — No Mocks in Production](../../adr/0011-no-mocks-in-production.md) — fakes in-memory; sem MSW
- [BDD (cenários)](./bdd.md)
- [TDD (test list RED)](./tdd.md)
- [Checklist](./checklist.md)
- [Review W2](./review.md)
- [Tasks](./tasks.md)
- Referência offline Bun: `../../reference/runtime/bun/`
- Referência offline Elysia: `../../reference/framework/elysia/`
- Referência offline SolidStart: `../../reference/framework/solidstart/`
