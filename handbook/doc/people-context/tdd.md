# Plano de TDD (RED 🔴): Interface Web People-Context (front+BFF)

**Feature**: `specs/002-people-context-web/` · **Consultor**: `/acdg-skills:tdd-strategist` · **Ticket**: `[CTR-002-people-context-web]`

> Fase 7 da pipeline `core-api-sdd` (máximo rigor). Ancorado em Kent Beck (TDD) — **citação
> obrigatória** via `skills_citar` (Princípio VI da constituição web_02). Os testes são escritos
> ANTES da implementação (W0) e DEVEM falhar por inexistência da API. Runner: **`bun:test`**
> (`bun test`); componentes Solid via `@testing-library/solid`; integração do BFF atrás de
> **fakes in-memory** (sem rede real; sem MSW — Princípio VI: Honesty/No Mocks).

## Estratégia

- **Estilo**: **Detroit/classicista no domínio do front** (VO `Cpf` espelhando MOD-11, schemas TypeBox, mapper `AppError`, máscara/formatadores — funções puras testadas por estado/retorno, sem mocks) e **London/mockist na borda** (handlers Elysia do BFF: o `people-context` é simulado por fakes in-memory; o cookie de sessão e a injeção de `Authorization: Bearer` + `X-Actor-Id` no servidor são verificados por interação). Justificativa: o valor do front está na transformação contrato→UI — incluindo os status incomuns do contrato (201 idempotente de dedup, 207 Multi-Status, 204 noop de vínculo); mockar o domínio puro só acoplaria os testes à implementação, enquanto a borda HTTP é, por definição, colaboração com um processo externo.
- **Níveis**:
  - **domínio** — `src/modules/people-context/server/domain/` e `client/domain/`: VO `Cpf` (MOD-11 + rejeição de repdigits, espelhando o branded type do backend), schemas TypeBox de request/response (`CreatePersonInput` com regra condicional `createLogin === true → email obrigatório` e `initialPassword` min 8; envelope `{ data, meta }` com paginação `nextCursor`/`hasMore`/`totalCount`; envelope de erro `{ success: false, error: { code, message } }`), união de literais dos códigos de erro (`'PEO-001' | ... | 'PEO-010' | 'ROL-001' | ... | 'ROL-009' | 'IDP-001' | ... | 'IDP-005' | 'AUTH-001' | 'AUTH-002' | 'AUTH-003' | 'ADM-001'`), máscara de CPF (exibe `390.533.447-05`, envia 11 dígitos crus) e datas ISO 8601 → `dd/MM/yyyy`.
  - **application** — ViewModels puros e use cases com ports fakes ([ADR-0009](../../adr/0009-framework-agnostic-client.md)): mapper `código → AppError → tag i18n` (switch exaustivo), acumulação de páginas por cursor, regras de visibilidade de RBAC (incl. `adminSystems(roles)` para admin escopado e ocultação de auto-assign), view models de dedup (201 com id existente) e de 207 (retry de provisão). ViewModels puros são testados sem montar Solid, sem `@solidjs/*`.
  - **integração** — rotas Elysia do BFF consumidas via Eden Treaty contra fakes in-memory ([ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md)): status 201/204/207/400/403/404/409/422/502, parse TypeBox da resposta, preservação do código estruturado, `X-Actor-Id` derivado da sessão no servidor (nunca do browser), nunca vazar o token ao retorno, 202 do reset sem nenhum link no body.
- **Citação que sustenta a estratégia** (obrigatória):
  > "Red — write a little test that doesn't work, and perhaps doesn't even compile at first.
  > Green — make the test work quickly, committing whatever sins necessary in the process.
  > Refactor — eliminate all of the duplication created in merely getting the test to work.
  > Red/green/refactor. The TDD mantra."
  > — *(localização exata no corpus a registrar via `skills_citar`; Kent Beck, *Test-Driven Development: By Example*)*

## Test list (Kent Beck)

> Lista viva do que precisa ser testado. Marque conforme RED→GREEN.

**Domínio (puro)**

- [ ] T-001 — `Cpf.create("39053344705")` retorna `ok`; `"11111111111"` (repdigit), `"12345678900"` (DV errado) e tamanho ≠ 11 retornam `err('invalid-cpf')` — espelha o MOD-11 do backend ← CT-002b — nível: domínio
- [ ] T-002 — schema TypeBox de `CreatePersonInput`: exige `fullName` (1–200 após trim) e `birthDate` (ISO, não-futura); `cpf`/`email` opcionais; refine condicional `createLogin === true → email obrigatório` e `initialPassword` min 8 ← CT-002 — nível: domínio
- [ ] T-003 — schema do envelope de sucesso parseia `{ data, meta.timestamp }` e o de paginação parseia `pageSize/totalCount/hasMore/nextCursor`; o envelope de erro parseia `{ success: false, error: { code, message } }` ← CT-005 — nível: domínio
- [ ] T-004 — máscara/formatadores: CPF exibido `390.533.447-05` e enviado como 11 dígitos crus; `1985-03-20` → `20/03/1985`; máscara digitável aceita só dígitos e limita a 11 — nível: domínio

**Application (fakes, sem rede)**

- [ ] T-005 — mapper `AppError` exaustivo: cada código real (`PEO-001`…`PEO-010`, `ROL-001`…`ROL-009`, `IDP-001`…`IDP-005`, `AUTH-001`…`AUTH-003`, `ADM-001`) resolve para tag i18n própria com o status HTTP esperado (400/403/404/409/422/502); código desconhecido cai em `unknown-error` sem `default` silencioso — exaustividade garantida pela união de literais no typecheck ← CT-008…CT-015 — nível: application
- [ ] T-006 — ViewModel de listagem (puro, sem `@solidjs/*`): concatena páginas por `nextCursor` sem duplicar `id`; esconde "Carregar mais" quando `hasMore=false`; busca dispara `search` (nome ILIKE / prefixo de CPF) ← CT-005 — nível: application
- [ ] T-007 — ViewModel de cadastro: resultado 201 com id já existente (dedup por CPF) é distinguido de criação nova → aviso "Pessoa já cadastrada com este CPF" e navegação ao registro existente ← CT-003, CT-006 — nível: application
- [ ] T-008 — ViewModel de 207 Multi-Status: pessoa criada + IdP falhou → estado `provisioning-failed` com ação de retry apontando para `POST /people/:personId/login`; nunca reenvia o `POST /people` ← CT-004 — nível: application
- [ ] T-009 — ViewModel de vínculos: seletor de sistemas derivado de `adminSystems(roles)` (admin escopado); `superadmin` vê todos; opção de role `superadmin` só para superadmin; ação desabilitada quando `person.idpUserId === session.sub` e não-superadmin (anti `ROL-008`) ← CT-008, CT-009, CT-010 — nível: application
- [ ] T-010 — visibilidade RBAC por papel: `owner` somente leitura; `worker` cadastra/edita/provisiona login; `admin` desativa/reativa, vincula e dispara reset; só `superadmin` vê o apagamento total ← CT-016 — nível: application

**Integração (BFF Elysia + fake in-memory)**

- [ ] T-011 — handler Elysia `registerPerson` (`*.service.fn.ts`): envia `POST /api/v1/people` com `Authorization: Bearer <jwt>` e `X-Actor-Id` injetados no servidor; 201 → parse de `{ data: { id } }`; 207 → resultado discriminado `created-without-login`; 400 `PEO-001` → `AppError`; resposta do handler não contém token nem `X-Actor-Id` ← CT-001, CT-002, CT-004 — nível: integração
- [ ] T-012 — `findPersonByCpf` (`*.query.fn.ts`): 200 → Person parseada; 404 `PEO-002` → resultado `not-found` (libera cadastro); 400 `PEO-004` → `AppError` (defesa em profundidade; a borda TypeBox já bloqueia antes) ← CT-006 — nível: integração
- [ ] T-013 — `assignRole` (`*.service.fn.ts`): 201 → `{ data: { id } }` (nova ou reativada); 204 → resultado `already-active` (noop); 403 `ROL-006`/`ROL-007`/`ROL-008` e 409 `ROL-009` → códigos preservados ← CT-007…CT-010 — nível: integração
- [ ] T-014 — `provisionLogin` (`*.service.fn.ts`): 201 → `{ data: { id, idpUserId } }`; 409 `PEO-008`; 422 `PEO-009`; 502 `IDP-001` ← CT-011 — nível: integração
- [ ] T-015 — `requestPasswordReset` (`*.service.fn.ts`): 202 → sucesso **sem** nenhum campo de link no body (asserção explícita anti-regressão ADR-030); 422 `PEO-007`; 502 `IDP-004` ← CT-012 — nível: integração
- [ ] T-016 — `deactivatePerson`/`reactivatePerson` (`*.service.fn.ts`): 204; 409 `PEO-005`/`PEO-006`; 502 `IDP-002`/`IDP-003` → mensagem deixa claro que nada foi alterado (IdP-first) ← CT-013 — nível: integração
- [ ] T-017 — `erasePerson` (`*.service.fn.ts`): 204; 403 `PEO-010`; 502 `IDP-005` (banco não tocado); o handler exige o flag de confirmação tipado vindo do diálogo de dupla confirmação ← CT-014, CT-015 — nível: integração

## Mapeamento BDD → teste

| Cenário (BDD) | Teste | Arquivo | Nível |
|---|---|---|---|
| CT-001 / CT-002 | T-002, T-011 | `server/adapters/__tests__/register-person.service.fn.test.ts` | integração |
| CT-002b | T-001, T-004 | `server/domain/__tests__/cpf.vo.test.ts` | domínio |
| CT-003 | T-007 | `client/person-registration/__tests__/person-registration.view-model.test.ts` | application |
| CT-004 | T-008, T-011 | `client/person-registration/__tests__/provision-retry.view-model.test.ts` | application/integração |
| CT-005 | T-003, T-006 | `client/person-list/__tests__/person-list.view-model.test.ts` | application |
| CT-006 | T-007, T-012 | `server/adapters/__tests__/find-person-by-cpf.query.fn.test.ts` | integração |
| CT-007 | T-013 | `server/adapters/__tests__/assign-role.service.fn.test.ts` | integração |
| CT-008 / CT-009 / CT-010 | T-005, T-009, T-013 | `client/role-management/__tests__/role-management.view-model.test.ts` + mapper | application/integração |
| CT-011 | T-014 | `server/adapters/__tests__/provision-login.service.fn.test.ts` | integração |
| CT-012 | T-015 | `server/adapters/__tests__/request-password-reset.service.fn.test.ts` | integração |
| CT-013 | T-016 | `server/adapters/__tests__/deactivate-person.service.fn.test.ts` | integração |
| CT-014 / CT-015 | T-017, T-010 | `client/access-management/__tests__/erasure-double-confirm.test.ts` + `server/adapters/__tests__/erase-person.service.fn.test.ts` | componente/integração |
| CT-016 | T-010 | `client/access-management/__tests__/rbac-visibility.test.ts` | componente |

## Ordem RED (primeiro teste a falhar)

1. **T-001** — `Cpf.create` é o teste mais simples que força a primeira decisão de design: VO branded + smart constructor retornando `Result` ([ADR-0002](../../adr/0002-errors-as-values.md)), sem classe e sem `throw`, espelhando MOD-11 + repdigits do backend.
2. T-005 — força a união de literais dos 27 códigos de erro (`PEO/ROL/IDP/AUTH/ADM`) e o switch exaustivo (o typecheck vira parte do teste).
3. T-002/T-003 — schemas TypeBox de request (refine condicional do `createLogin`) e dos envelopes (fundação de toda a borda). O tipo flui ao client via Eden Treaty sem redeclarar Model ([ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md)).
4. T-007/T-008 — view models de dedup 201 e de 207 (os dois resultados "estranhos" do contrato que mais geram bug de UX).
5. T-011 — primeiro handler Elysia (padrão `*.service.fn.ts`, [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md)); fake in-memory configurado aqui, incluindo o handler de 207.
6. T-006, T-012…T-016 — demais ViewModels e integrações.
7. T-009, T-010, T-017 — RBAC escopado, visibilidade por papel e erasure (dependem dos ViewModels existirem).

## Confirmação RED 🔴

```bash
bun test          # deve FALHAR — API ainda não existe
```

- [ ] Todos os testes da lista existem e **falham pelo motivo certo** (inexistência da API —
      módulos `server/domain/`, `client/domain/`, `server/adapters/`, `client/*/` ainda não criados),
      não por erro de compilação/typo nos próprios testes.
- [ ] Ticket aberto: `bun run pipeline:state init CTR-002-people-context-web --size L`; W0 registrado.

> Próxima fase: implementação mínima (W1) até 🟡 YELLOW (testes passam), depois review W2 ([review.md](./review.md)) e gate W3 ([qa-test-plan.md](./qa-test-plan.md)).

## Referências

- [Constitution web_02](../../../.specify/memory/constitution.md) — Princípios I–VI (BFF Boundary, Errors as Values, MVVM×DDD, Bun-Native, Type Safety, Honesty)
- [ADR-0002 — Errors as Values](../../adr/0002-errors-as-values.md) — `Result<T,E>`, `throw` proibido fora da borda de framework
- [ADR-0003 — Bun Supply Chain](../../adr/0003-bun-supply-chain.md) — `bun:test` como runner nativo (sem Vitest/`node:test`)
- [ADR-0004 — Client×Server Split](../../adr/0004-client-server-split-mvvm-ddd.md) — ViewModel puro sem `@solidjs/*`; Eden Treaty como fronteira
- [ADR-0009 — Framework-Agnostic Client](../../adr/0009-framework-agnostic-client.md) — ViewModel + binding Solid + Command
- [ADR-0010 — BFF Orchestration / fn naming](../../adr/0010-bff-orchestration-fn-naming.md) — `*.query.fn.ts` / `*.service.fn.ts`
- [ADR-0011 — No Mocks in Production](../../adr/0011-no-mocks-in-production.md) — fakes in-memory em testes; sem MSW
- [BDD (cenários)](./bdd.md)
- [QA Test Plan](./qa-test-plan.md)
- [Tasks](./tasks.md)
- Referência offline Bun: `../../reference/runtime/bun/`
- Referência offline Elysia: `../../reference/framework/elysia/`
