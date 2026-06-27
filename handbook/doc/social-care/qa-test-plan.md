# Plano de Testes / QA: Interface Web Social-Care (front+BFF)

**Feature**: `specs/001-social-care-web/` · **Consultores**: `/acdg-skills:tdd-strategist` + `/acdg-skills:requirements-engineer`

> Plano de QA da pipeline `core-api-sdd`. Ancorado em **Agile Testing Condensed** (Gregory &
> Crispin) — agora no corpus (domínio `tdd`). Decisões de estratégia exigem **citação canônica
> ≥4 linhas** via `skills_citar` (Princípio VI da [constituição](../../../.specify/memory/constitution.md)). Complementa o [tdd.md](./tdd.md) (test list/RED):
> aqui é o **plano amplo de QA**; lá, os testes unitários do ciclo RED→GREEN.

## 1. Contexto (Agile Testing — Cap. 3)

> "Para planejar atividades de teste eficazmente, um time precisa considerar seu contexto":
> **time**, **produto** e **níveis de detalhe**.

- **Time**: distribuído e enxuto (instância ACDG-BV, associação de recursos limitados); sem QA dedicado — abordagem *whole-team*. Sem especialista de performance/segurança em tempo integral: Q4 coberto por gates automatizados (Lighthouse, grep de bundle, `bun run typecheck`) e pelo `security-reviewer` sob demanda no review W2.
- **Produto**: **software de saúde/assistência social com dados sensíveis de pacientes de doenças raras (LGPD)** — nível de qualidade exigido é alto, próximo de software médico: erro de RBAC, vazamento de token no browser ou exibição de PII anonimizada são defeitos críticos, não cosméticos.
- **Níveis de detalhe**: este plano cobre o nível **feature** (`001-social-care-web`); as histórias (US-001…US-006 do [spec.fe.md](./spec.fe.md)) são detalhadas em cenários no [bdd.md](./bdd.md); tarefas e gates em [tasks.md](./tasks.md).

**Citação que sustenta a abordagem de planejamento** (obrigatória):
> "Collaborative testing practices that occur continuously, from inception to delivery and beyond,
> supporting frequent delivery of value for our customers. Testing activities focus on building
> quality into the product, using fast feedback loops to validate our understanding. The practices
> strengthen and support the idea of whole-team responsibility for quality."
> — *(definição de agile testing; localização exata no corpus a registrar via `skills_citar` em `agile-testing-condensed--gregory-crispin.md`, Janet Gregory, Lisa Crispin, *Agile Testing Condensed*)*

## 2. Estratégia por quadrantes (Agile Testing Quadrants)

| Quadrante | Foco | Nesta feature |
|---|---|---|
| **Q1** tecnologia ⋅ apoia o time | unit, component, integração (TDD) | `bun:test` + `@testing-library/solid`: VOs (`CPF`, `CEP`, `Money` exibido), schemas TypeBox (`Elysia.t`), mapper `PAT-XXX → AppError → tag i18n`, ViewModels puros, handlers Elysia com fakes/in-memory — ver [tdd.md](./tdd.md) |
| **Q2** negócio ⋅ apoia o time | testes de aceitação, exemplos (BDD) | cenários Gherkin de cadastro de paciente, avaliação socioeconômica, proteção e transições de status — ver [bdd.md](./bdd.md) (CT-001…CT-016) |
| **Q3** negócio ⋅ critica o produto | exploratório, usabilidade, UAT | sessões exploratórias com assistente social da associação (papel `worker`): jornada completa cadastro → admissão → avaliação → encaminhamento; validação do vocabulário PT-BR (prontuário, acolhimento, titular) |
| **Q4** tecnologia ⋅ critica o produto | performance, segurança, confiabilidade | orçamentos de [metrics.fe.md](./metrics.fe.md) (Web Vitals) e [metrics.md](./metrics.md) (p95 por endpoint); grep de bundle por `Bearer`/`accessToken`; axe/Lighthouse a11y |

## 3. Escopo

- **Em escopo**:
  - Jornadas web sobre a API `social-care` `/api/v1`: listagem paginada de pacientes (`GET /patients` com `search`, `status`, `cursor`, `limit`), prontuário completo (`GET /patients/:patientId`), cadastro (`POST /patients`), composição familiar (add/remove/primary-caregiver), transições de status (`admit`, `discharge`, `readmit`, `withdraw`), avaliação socioeconômica (7 PUTs de assessment), proteção (`referrals`, `violation-reports`, `placement-history`), atendimento (`appointments`, `intake-info`) e domínios (`GET /dominios/:tableName`).
  - Validação TypeBox (`Elysia.t`) na borda do BFF Elysia (input e response) e mapeamento exaustivo dos códigos de erro reais (`PAT-001`, `ADM-003`, `DISC-007`, `WDR-003`, `READM-005`, `FAM-002`, `HOUSING-001`, `SOCIO-001`, `HEALTH-001`, `VIO-002`, `REF-001`, `PLACE-002`, `LOOKUP-002`…) para mensagens i18n.
  - RBAC na UI (worker/owner/admin) coerente com o `RoleGuardMiddleware` do backend.
  - Comportamento frente a `409` de optimistic locking (`Patient.version`) e ao estado LGPD-anonimizado (`PatientPIIAnonymizedEvent`).
- **Fora de escopo**:
  - Testes do domínio Swift do `social-care` (cobertos pela suíte `swift-testing` do próprio repo, gate 95% CI).
  - Consumo NATS/outbox por `people-context`/`analysis-bi` (contratos assíncronos não passam pelo BFF).
  - Upload de binários (não existe no contrato atual — seção 10.3 do mapa do serviço).
  - Fluxo de administração de lookup tables pelo papel `admin` (feature futura; aqui só leitura de `GET /dominios/:tableName`).

## 4. Pirâmide de testes (Vocke/Fowler)

- Distribuição alvo: **muitos unit** (VOs, schemas TypeBox, mappers de erro, ViewModels puros), **menos integração** (handlers Elysia do BFF com fakes/in-memory simulando o `social-care`; componentes Solid com `@testing-library/solid`), **poucos E2E** (Playwright: 3–4 jornadas críticas — cadastro feliz, CPF inválido, discharge bloqueado em waitlisted, paginação).
- **Citação** (obrigatória):
  > "Your best bet is to remember two things from Cook's original test pyramid:
  > 1. Write tests with different granularity
  > 2. The more high-level you get the fewer tests you should have.
  > Stick to the pyramid shape to come up with a healthy, fast and maintainable test suite."
  > — *(localização exata no corpus a registrar via `skills_citar` em `practical-test-pyramid--vocke.md`, Ham Vocke)*

## 5. Níveis, tipos e ferramentas

| Nível | Tipo | Ferramenta | Gate |
|---|---|---|---|
| Domínio (front) | unit (puro): VOs branded, schemas TypeBox (`Elysia.t`), mapper `AppError`, formatadores CPF/CEP/data | `bun:test` (`bun test`) | W3 |
| Application | ViewModels puros / use cases com ports fakes (sem rede, sem `solid-js`) | `bun:test` | W3 |
| Integração (BFF) | handlers Elysia (`*.query.fn.ts`/`*.service.fn.ts`) contra fakes/in-memory (status 2xx/4xx/409, envelope `{data, meta}`) | `bun:test` + fake in-memory | pré-merge |
| Componente Solid | formulários, estados loading/erro/vazio, RBAC condicional | `@testing-library/solid` + `bun:test` (happy-dom) | pré-merge |
| Aceitação | BDD Gherkin → E2E das jornadas críticas | Playwright (mapeado em [bdd.md](./bdd.md)) | review |
| Q4 | a11y, bundle, vitals | axe/Lighthouse CI, grep de bundle | release |

## 6. Critérios de entrada e saída (Definition of Done)

- **Entrada**: [bdd.md](./bdd.md) aprovado; testes RED escritos (🔴) conforme [tdd.md](./tdd.md).
- **Saída (GREEN 🟢)**: todos verdes + W3 (`/speckit-verify` — `bun run format:check && bun run typecheck && bun test && bun run build`) + review W2 ([review.md](./review.md) APPROVED) + citações registradas + regressão zero (Princípio II) + [checklist.md](./checklist.md) completo (a11y, LGPD, RBAC, estados de erro/loading).

## 7. Riscos de qualidade

| Risco | Probab. | Impacto | Mitigação (teste) |
|---|---|---|---|
| Token/`Bearer` vazar para o bundle do client (quebra do contrato BFF — Princípio I) | baixa | crítico | grep automatizado no bundle (`NFR-002` de [metrics.fe.md](./metrics.fe.md)) + review W2; governance test `no-server-import-in-client` ([ADR-0001](../../adr/0001-vertical-modular-architecture.md)) |
| Mapper de erro não cobrir código novo (ex.: `READM-005`) → mensagem genérica para a assistente social | média | alto | switch exaustivo testado por união de literais TypeBox; teste parametrizado por código (T-005 do [tdd.md](./tdd.md)) |
| Transição de status oferecida na UI fora da máquina de estados (ex.: botão "Desligar" em `waitlisted` → `DISC-007`) | média | alto | testes de ViewModel puro por status (`waitlisted`/`active`/`discharged`/`withdrawn`) + cenários CT-006…CT-008 |
| `409` de optimistic locking (`version`) tratado como erro fatal em vez de recarregar/reconciliar | média | médio | teste de integração fake in-memory devolvendo 409 + cenário CT-011 |
| Campos metadata-driven (benefício com `exigeCpfFalecido`) não exibidos → rejeição só no servidor | média | médio | teste de ViewModel do formulário de benefícios lendo flags de `dominio_tipo_beneficio` |
| Exibir PII de paciente anonimizado (LGPD, ADR-039) ou permitir edição de assessments pós-anonimização | baixa | crítico | teste do ViewModel do prontuário com fixture anonimizada + item dedicado no [checklist.md](./checklist.md) |
| Paginação por cursor duplicar/perder itens ao concatenar páginas | média | médio | teste do ViewModel de lista com `nextCursor`/`hasMore` simulados (fake in-memory) |

## 8. Ambiente e dados de teste

- **Ambiente**: unit/application/integração rodam sem backend (fakes/in-memory interceptam o BFF → `social-care`; sem MSW em `src/` — [ADR-0011](../../adr/0011-no-mocks-in-production.md)); E2E Playwright contra stack local via compose de dev (`compose.dev.yml`), um serviço por vez por causa da colisão de portas 5432/3000 documentada no CLAUDE.md raiz.
- **Dados**: fixtures mínimas e significativas — Kent Beck: "se não há diferença conceitual entre 1 e 2, use 1". Um `Patient` por status (`waitlisted`, `active`, `discharged`, `withdrawn`), uma família com 1 membro <18 anos (para `PLACE-002`), um paciente anonimizado (LGPD), CPFs válidos gerados por dígito verificador e o inválido canônico `111.111.111-11`. Nunca usar dados reais de pacientes em fixtures. Fixtures de teste vivem exclusivamente em `tests/` ([ADR-0011](../../adr/0011-no-mocks-in-production.md)).

## 9. Papéis (whole-team approach)

Qualidade é responsabilidade do time todo, não de um silo de QA:

- **Dev frontend (web_02/)**: escreve BDD + testes RED antes do código (W0), mantém mapper de erros e fixtures; roda `quality-gate` antes de abrir PR.
- **Dev backend (social-care/)**: valida que cenários BDD refletem o contrato real (códigos, status HTTP, envelope); avisa mudanças de contrato via versionamento.
- **Reviewer (W2)**: audita com [review.md](./review.md) — foco em segurança de token, validação na borda e Princípios I–VI da [constituição](../../../.specify/memory/constitution.md).
- **Assistente social parceira (ACDG-BV)**: sessões exploratórias Q3 e UAT do vocabulário PT-BR antes do release.

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípios I–VI
- [ADR-0001 — Vertical-Modular Architecture](../../adr/0001-vertical-modular-architecture.md) — governance tests de boundaries de módulo em `bun:test`
- [ADR-0002 — Errors as Values](../../adr/0002-errors-as-values.md) — `Result<T,E>`, mapper exaustivo
- [ADR-0003 — Bun Supply Chain](../../adr/0003-bun-supply-chain.md) — `bun test` como runner
- [ADR-0004 — Client/Server Split MVVM×DDD](../../adr/0004-client-server-split-mvvm-ddd.md) — TypeBox/Eden, fronteira Elysia
- [ADR-0009 — Framework-Agnostic Client](../../adr/0009-framework-agnostic-client.md) — ViewModel puro testável sem Solid
- [ADR-0010 — BFF Orchestration / Fn Naming](../../adr/0010-bff-orchestration-fn-naming.md) — `*.query.fn.ts` / `*.service.fn.ts`
- [ADR-0011 — No Mocks in Production](../../adr/0011-no-mocks-in-production.md) — fakes/in-memory; fixtures em `tests/`
- [Índice de ADRs](../../adr/README.md)
- [bdd.md](./bdd.md) — cenários CT-001…CT-016
- [tdd.md](./tdd.md) — test list RED (fase 7)
- [checklist.md](./checklist.md) — prontidão de feature antes do release
- [review.md](./review.md) — audit W2
- [tasks.md](./tasks.md) — waves W0→W3
- [spec.fe.md](./spec.fe.md) — histórias US-001…US-006
- [metrics.fe.md](./metrics.fe.md) — orçamentos Web Vitals e NFRs
- [metrics.md](./metrics.md) — contratos p95 por endpoint do backend
- Docs offline: [../../reference/runtime/bun/](../../reference/runtime/bun/) · [../../reference/framework/elysia/](../../reference/framework/elysia/) · [../../reference/framework/solidstart/](../../reference/framework/solidstart/)
