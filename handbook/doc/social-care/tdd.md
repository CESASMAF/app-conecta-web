# Plano de TDD (RED 🔴): Interface Web Social-Care (front+BFF)

**Feature**: `specs/001-social-care-web/` · **Consultor**: `/acdg-skills:tdd-strategist` · **Ticket**: `[CTR-001-social-care-web]`

> Fase 7 da pipeline `core-api-sdd` (máximo rigor). Ancorado em Kent Beck (TDD) — **citação
> obrigatória** via `skills_citar` (Princípio VI da [constituição](../../../.specify/memory/constitution.md)). Os testes são escritos ANTES da
> implementação (W0) e DEVEM falhar por inexistência da API. Runner: **`bun:test`** (`bun test`);
> componentes Solid via `@testing-library/solid`; integração do BFF com **fakes/in-memory**
> (sem MSW — [ADR-0011](../../adr/0011-no-mocks-in-production.md), Princípio VI: Honesty/No Mocks).

## Estratégia

- **Estilo**: **Detroit/classicista no domínio do front** (VOs branded, schemas TypeBox, mapper `AppError`, formatadores — funções puras testadas por estado/retorno, sem mocks) e **London/mockist na borda** (handlers Elysia — `*.service.fn.ts`/`*.query.fn.ts`: o `social-care` é simulado por fakes/in-memory; o cookie de sessão e a injeção de `Authorization: Bearer` são verificados por interação). Justificativa: o valor do front está na transformação contrato→UI; mockar o domínio puro só acoplaria os testes à implementação, enquanto a borda HTTP é, por definição, colaboração com um processo externo.
- **Níveis**:
  - **domínio** — `src/modules/social-care/server/domain/` e `client/domain/`: VOs (`Cpf`, `Cep`, `Nis`), schemas TypeBox (`Elysia.t`) de request/response (envelope `{ data, meta }`, paginação `nextCursor`/`hasMore`), união de literais dos códigos de erro (`'PAT-001' | 'ADM-003' | 'DISC-007' | ...`), formatadores de exibição (CPF `123.456.789-00`, datas ISO 8601 → `dd/MM/yyyy`).
  - **application** — ViewModels puros e use cases com ports fakes: máquina de estados de ações por `PatientStatus`, mapper `código → AppError → tag i18n` (switch exaustivo), acumulação de páginas por cursor. O núcleo (`data`/`domain`/`*.view-model.ts`) não importa `solid-js`/`@solidjs/*` (Princípio III da [constituição](../../../.specify/memory/constitution.md)).
  - **integração** — handlers Elysia (`*.query.fn.ts`/`*.service.fn.ts`) contra fake in-memory do `social-care` ([ADR-0011](../../adr/0011-no-mocks-in-production.md)): status 201/204/400/404/409, parse TypeBox da resposta, preservação do código estruturado, nunca vazar o token ao retorno.
- **Citação que sustenta a estratégia** (obrigatória):
  > "Red — write a little test that doesn't work, and perhaps doesn't even compile at first.
  > Green — make the test work quickly, committing whatever sins necessary in the process.
  > Refactor — eliminate all of the duplication created in merely getting the test to work.
  > Red/green/refactor. The TDD mantra."
  > — *(localização exata no corpus a registrar via `skills_citar`; Kent Beck, *Test-Driven Development: By Example*)*

## Test list (Kent Beck)

> Lista viva do que precisa ser testado. Marque conforme RED→GREEN.

**Domínio (puro)**

- [ ] T-001 — `Cpf.create("39053344705")` retorna `ok`; `"11111111111"` e tamanho ≠ 11 retornam `err('invalid-cpf')` ← CT-002 — nível: domínio
- [ ] T-002 — schema TypeBox (`Elysia.t`) de `RegisterPatientRequest` exige `personId`, `personalData`, `prRelationshipId`; aceita `civilDocuments` opcional — nível: domínio
- [ ] T-003 — schema do envelope `StandardResponse` parseia `{ data, meta.timestamp }` e o de paginação parseia `pageSize/totalCount/hasMore/nextCursor` ← CT-004 — nível: domínio
- [ ] T-004 — formatadores: CPF para `123.456.789-00` na exibição e dígitos crus no envio; `2026-06-10T14:30:00Z` → `10/06/2026` — nível: domínio

**Application (fakes, sem rede)**

- [ ] T-005 — mapper `AppError`: cada código real (`PAT-001`, `PAT-002`, `FAM-002`, `ADM-002`, `ADM-003`, `DISC-001`, `DISC-007`, `WDR-003`, `READM-005`, `HOUSING-001`, `SOCIO-001`, `SOCIO-002`, `WORK-001`, `EDU-001`, `HEALTH-001`, `VIO-001`, `VIO-002`, `REF-001`, `REF-002`, `PLACE-001`, `PLACE-002`, `LOOKUP-002`) resolve para tag i18n própria; código desconhecido cai em `unknown-error` sem `default` silencioso ← CT-003, CT-008, CT-011, CT-013 — nível: application
- [ ] T-006 — ViewModel de ciclo de vida: ações oferecidas por status — `waitlisted` → {admit, withdraw}; `active` → {discharge}; `discharged` → {readmit}; `withdrawn` → {} ← CT-006, CT-007 — nível: application
- [ ] T-007 — ViewModel de listagem: concatena páginas por `nextCursor` sem duplicar `patientId`; esconde "Carregar mais" quando `hasMore=false`; aplica `status=active` no filtro ← CT-004, CT-005 — nível: application
- [ ] T-008 — visibilidade RBAC no ViewModel: `owner` não vê mutações; `worker` vê cadastro/avaliação; só `admin` vê aprovação de domínios ← CT-015 — nível: application
- [ ] T-009 — ViewModel do prontuário anonimizado (LGPD): flag de PII removida → oculta `personalData`/`civilDocuments`/`address`, bloqueia formulários, mantém `diagnoses`/audit trail ← CT-016 — nível: application
- [ ] T-010 — formulário de benefício metadata-driven: flags `exigeCpfFalecido`/`exigeRegistroNascimento` tornam `deceasedCpf`/`birthCertificateNumber` obrigatórios no schema condicional ← CT-010 — nível: application

**Integração (BFF Elysia + fake in-memory)**

- [ ] T-011 — handler `registerPatient` (`*.service.fn.ts`): envia `POST /api/v1/patients` com `Authorization: Bearer <jwt>` injetado no servidor; 201 → parse do `{ data: { id } }`; resposta do handler não contém o token ← CT-001 — nível: integração
- [ ] T-012 — `updateSocioeconomicSituation` handler: 204 → sucesso; 400 `SOCIO-001` → `AppError` com código preservado ← CT-009, CT-011 — nível: integração
- [ ] T-013 — `dischargePatient` handler contra paciente `waitlisted` (fake devolve 409 `DISC-007`) → erro estruturado, não exceção genérica ← CT-007 — nível: integração
- [ ] T-014 — 409 de optimistic locking (`Patient.version` divergente) → resultado discriminado `version-conflict` para a UI oferecer recarga ← CT-011 (cenário de conflito) — nível: integração
- [ ] T-015 — `createReferral` handler: 201 com id; `REF-001`/`REF-002` mapeados ← CT-012, CT-013 — nível: integração

## Mapeamento BDD → teste

| Cenário (BDD) | Teste | Arquivo | Nível |
|---|---|---|---|
| CT-001 | T-002, T-011 | `server/adapters/__tests__/register-patient.service.fn.test.ts` | integração |
| CT-002 | T-001 | `server/domain/__tests__/cpf.vo.test.ts` | domínio |
| CT-003 | T-005 | `client/domain/__tests__/app-error-mapper.test.ts` | application |
| CT-004 / CT-005 | T-003, T-007 | `client/patient-list/__tests__/patient-list.view-model.test.ts` | application |
| CT-006 / CT-007 | T-006, T-013 | `client/patient-record/__tests__/patient-lifecycle.view-model.test.ts` | application/integração |
| CT-008 | T-005 (parametrizado) | `client/domain/__tests__/app-error-mapper.test.ts` | application |
| CT-009 | T-012 | `server/adapters/__tests__/update-socioeconomic.service.fn.test.ts` | integração |
| CT-010 | T-010 | `client/assessment/__tests__/social-benefit-schema.test.ts` | application |
| CT-011 | T-005, T-012, T-014 | mapper + server handler tests | application/integração |
| CT-012 / CT-013 | T-015, T-005 | `server/adapters/__tests__/create-referral.service.fn.test.ts` | integração |
| CT-015 | T-008 | `client/patient-record/__tests__/rbac-visibility.view-model.test.ts` | application |
| CT-016 | T-009 | `client/patient-record/__tests__/patient-anonymized.view-model.test.ts` | application |

> Todos os caminhos acima são relativos a `src/modules/social-care/`.

## Ordem RED (primeiro teste a falhar)

1. **T-001** — `Cpf.create` é o teste mais simples que força a primeira decisão de design: VO branded + smart constructor retornando `Result` ([ADR-0002](../../adr/0002-errors-as-values.md)), sem classe e sem `throw`.
2. T-005 — força a união de literais de códigos de erro e o switch exaustivo (o typecheck vira parte do teste).
3. T-002/T-003 — schemas TypeBox (`Elysia.t`) de request e do envelope (fundação de toda a borda; tipo flui ao client via Eden Treaty sem redeclarar Model — [ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md)).
4. T-006 — máquina de estados do ciclo de vida no ViewModel puro ([ADR-0009](../../adr/0009-framework-agnostic-client.md)).
5. T-011 — primeiro handler Elysia (padrão `*.service.fn.ts`, [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md)); fake in-memory configurado aqui ([ADR-0011](../../adr/0011-no-mocks-in-production.md)).
6. T-007, T-012…T-015 — demais ViewModels e integrações.
7. T-008, T-009, T-010 — RBAC, LGPD e metadata-driven (dependem dos ViewModels existirem).

## Confirmação RED 🔴

```bash
bun test          # deve FALHAR — API ainda não existe
```

- [ ] Todos os testes da lista existem e **falham pelo motivo certo** (inexistência da API —
      módulos `server/domain/`, `client/domain/`, `server/adapters/` ainda não criados), não por erro
      de compilação/typo nos próprios testes.
- [ ] Ticket aberto: `bun run pipeline:state init CTR-001-social-care-web --size L`; W0 registrado.

> Próxima fase: implementação mínima (W1) até 🟡 YELLOW (testes passam), depois review W2 ([review.md](./review.md)) e gate W3 ([qa-test-plan.md](./qa-test-plan.md)).

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípios I–VI
- [ADR-0002 — Errors as Values](../../adr/0002-errors-as-values.md) — `Result<T,E>`, VO branded, sem `throw`
- [ADR-0003 — Bun Supply Chain](../../adr/0003-bun-supply-chain.md) — `bun test` como runner (`bun:test`)
- [ADR-0004 — Client/Server Split MVVM×DDD](../../adr/0004-client-server-split-mvvm-ddd.md) — TypeBox/Eden, tipo sem redeclarar Model
- [ADR-0009 — Framework-Agnostic Client](../../adr/0009-framework-agnostic-client.md) — ViewModel puro testável sem montar Solid; `*.view-model.ts`
- [ADR-0010 — BFF Orchestration / Fn Naming](../../adr/0010-bff-orchestration-fn-naming.md) — `*.query.fn.ts` / `*.service.fn.ts`
- [ADR-0011 — No Mocks in Production](../../adr/0011-no-mocks-in-production.md) — fakes/in-memory em `tests/`; sem MSW em `src/`
- [Índice de ADRs](../../adr/README.md)
- [bdd.md](./bdd.md) — cenários Given-When-Then (fase 6); mapeamento CT→T
- [qa-test-plan.md](./qa-test-plan.md) — plano amplo de QA (quadrantes, pirâmide, riscos)
- [tasks.md](./tasks.md) — waves W0→W3 com gates da pipeline
- [review.md](./review.md) — audit W2 (🟡→🟢)
- Docs offline: [../../reference/runtime/bun/](../../reference/runtime/bun/) · [../../reference/framework/elysia/](../../reference/framework/elysia/) · [../../reference/framework/solidstart/](../../reference/framework/solidstart/)
