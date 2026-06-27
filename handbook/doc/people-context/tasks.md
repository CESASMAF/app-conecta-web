---

description: "Task list — Interface Web People-Context (002-people-context-web)"
---

# Tasks: Interface Web People-Context

**Input**: Design documents de `web_02/handbook/doc/people-context/`

**Prerequisites**: `plan.fe.md` (required), `spec.fe.md` (required for user stories), `plan.md`, `api-readiness.fe.md`, `domain.fe.md`, `design-tokens.fe.md`

**Tests**: TDD obrigatório (Princípio II da [constitution.md](../../../.specify/memory/constitution.md)) — toda task de teste precede a implementação correspondente e deve falhar primeiro (RED).

**Organization**: Tasks agrupadas por user story para permitir implementação e teste independentes de cada história.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: a qual user story a task pertence (US1, US2, US3)
- Paths exatos incluídos nas descrições

## Path Conventions

- Repo `web_02/` (Bun · SolidStart · Elysia). Módulo vertical em `src/modules/people-context/` conforme `plan.fe.md`.
- `server/` = BFF Elysia (token e `X-Actor-Id` vivem aqui) · `client/` = MVVM agnóstico (ViewModels puros + bindings Solid) · `public-api/index.ts` = único import externo.
- Rotas SolidStart em `src/routes/people/`. Testes via **`bun:test`** (`bun test`); co-locados `*.test.ts`; testes de componente Solid `*.test.tsx` com `@testing-library/solid`.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: esqueleto do módulo vertical e fiação de build/teste

- [ ] T001 Criar esqueleto do módulo em `src/modules/people-context/{server/{domain,application,adapters},client/{data,domain},public-api}/` com `index.ts` vazio em `public-api`
- [ ] T002 Configurar governance test de boundaries de módulo (import externo só via `src/modules/people-context/public-api/index.ts`) em `tests/architecture/people-context-boundaries.test.ts` — [ADR-0001](../../adr/0001-vertical-modular-architecture.md)
- [ ] T003 [P] Criar stubs de rota SolidStart em `src/routes/people/` (index = lista; $personId = ficha; new = cadastro; roles = discovery por sistema) importando apenas de `public-api`
- [ ] T004 [P] Garantir scripts de teste do módulo (`bun test`) em `package.json`/`bunfig.toml`; configurar `happy-dom` para testes de componente Solid

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: borda BFF Elysia↔people-context (Bearer + X-Actor-Id), cadeia de erro PEO/ROL/IDP/AUTH, VOs, helpers e átomos — pré-requisitos de TODAS as user stories

**⚠️ CRITICAL**: nenhuma user story pode começar antes desta fase terminar

- [ ] T005 Configurar `PEOPLE_CONTEXT_API_URL` server-only (env do BFF Elysia; nunca exposto ao client) e registrar em `src/modules/people-context/server/adapters/config.ts`
- [ ] T006 [P] Teste RED do envelope: TypeBox de `{ data, meta: { timestamp } }`, meta paginada (`pageSize`, `totalCount`, `hasMore`, `nextCursor`), erro `{ success: false, error: { code, message } }` e 207 com `warnings: [{ code, message }]` — `src/modules/people-context/server/adapters/envelope.schema.test.ts`
- [ ] T007 [P] Implementar `src/modules/people-context/server/adapters/envelope.schema.ts` (depende de T006)
- [ ] T008 [P] Teste RED da taxonomia de erro: mapear `PEO-001..010`, `ROL-001..009`, `IDP-001..005`, `AUTH-001..003`, `ADM-001` → `AppError.kind` (`validation | notFound | conflict | precondition | forbidden | unauthorized | idpUnavailable`) preservando `code` — `src/modules/people-context/server/domain/errors.test.ts`
- [ ] T009 Implementar `src/modules/people-context/server/domain/errors.ts` com `Result<T,E>` e `AppError` (depende de T008)
- [ ] T010 Teste RED do client HTTP Elysia: injeta `Authorization: Bearer <jwt>` da sessão Authentik (módulo auth via `public-api`) E `X-Actor-Id` = `JWT.sub` em toda mutação (nunca aceito do browser), desembrulha envelope, trata 207 como sucesso parcial, converte 4xx/5xx em `AppError`, nunca vaza token — `src/modules/people-context/server/adapters/people-context.client.test.ts`
- [ ] T011 Implementar `src/modules/people-context/server/adapters/people-context.client.ts` (`resultFetch` + `HttpError` + `mapToServerResponse` + injeção de `X-Actor-Id`) (depende de T007, T009, T010)
- [ ] T012 [P] VOs branded puros com smart constructors retornando `Result`: `PersonId`, `RoleId` (UUID), `Cpf` (11 dígitos + MOD-11 + rejeição de repdigits), `IsoDateString` (`YYYY-MM-DD`; `birthDate` não-futura) — testes `bun:test` + implementação em `src/modules/people-context/server/domain/person.ts` e `src/modules/people-context/client/domain/`
- [ ] T013 [P] Helpers puros de formatação (`Intl`, sem libs): máscara/desmáscara CPF (`123.456.789-00` ↔ 11 dígitos), data ISO 8601 ↔ `dd/MM/yyyy`, idade a partir de `birthDate`, detecção dígitos-vs-nome para o campo de busca — testes + implementação em `src/modules/people-context/client/domain/format.ts`
- [ ] T014 [P] Átomos/moléculas tokens-only (vanilla-extract, [ADR-0007](../../adr/0007-design-system-vanilla-extract.md)): `Badge` ativo/inativo, Badge de vínculo `system:role`, `MaskedField` CPF, `DateField`, `SearchField`, `AccessStatusPill` (sem login · login ativo · provisão pendente) em `src/shared/ui/` — zero hex/px cru; governance test `só-tokens` verde
- [ ] T015 Infra de `QueryError` + bus de eventos do módulo (fatos no passado: `person-registered`, `person-updated`, `person-access-changed`, `role-assignment-changed`) em `src/modules/people-context/client/data/events/` — invalidação cruzada lista ↔ ficha ↔ vínculos

**Checkpoint**: fundação pronta — user stories podem começar (em paralelo, se houver gente)

---

## Phase 3: User Story 1 - Cadastro e busca de pessoa (Priority: P1) 🎯 MVP

**Goal**: worker lista/busca pessoas (nome ILIKE ou prefixo de CPF, paginação cursor-based), faz lookup direto por CPF, cadastra pessoa nova (com dedup idempotente por CPF e opção "criar login" — incluindo o caminho 207) e edita os dados cadastrais na ficha.

**Independent Test**: com o people-context de pé, logar como worker → cadastrar pessoa com CPF (201) → recadastrar o mesmo CPF e receber o mesmo id (dedup) → buscá-la na lista por prefixo de CPF → abrir a ficha → editar `fullName` (204) e ver o dado atualizado.

### Tests for User Story 1 (RED primeiro) ⚠️

- [ ] T016 [P] [US1] Teste de contrato TypeBox: `createPersonSchema` (`fullName` 1–200, `cpf` `^\d{11}$` opcional, `birthDate` date não-futura, `email` opcional, `createLogin` ⇒ `email` obrigatório, `initialPassword` min 8), `updatePersonSchema`, `PersonModel` (`id`, `fullName`, `cpf|null`, `birthDate`, `email|null`, `idpUserId|null`, `idpUserPk|null`, `active`, `createdAt`, `updatedAt`) — `src/modules/people-context/server/adapters/person.schema.test.ts`
- [ ] T017 [P] [US1] Teste do repositório: `list`/`getById`/`getByCpf`/`create`/`update` expõem `Result` (nunca `throw`); `create` discrimina `created` vs `created-idp-pending` (207); cursor de paginação propagado — `src/modules/people-context/client/data/person.repository.test.ts`
- [ ] T018 [P] [US1] Teste do ViewModel da lista (puro, sem `@solidjs/*`): campo de busca único (dígitos → prefixo CPF; texto → nome), `limit` 1–100 (default 20), avanço por `nextCursor`, `totalCount` exibido — `src/modules/people-context/client/person-list/person-list.view-model.test.ts`
- [ ] T019 [P] [US1] Teste do ViewModel do cadastro: CPF emitido sem máscara, `birthDate` em ISO 8601, seção "criar login" liga `email` obrigatório (`PEO-001` mapeado a mensagem de campo), resultado 207 → estado `idp-pending` com CTA de retry — `src/modules/people-context/client/person-registration/person-registration.view-model.test.ts`

### Implementation for User Story 1

- [ ] T020 [P] [US1] Implementar `src/modules/people-context/server/adapters/person.schema.ts` (depende de T016)
- [ ] T021 [US1] Handlers Elysia de leitura (`*.query.fn.ts`) em `src/modules/people-context/server/adapters/people.query.fn.ts`: `listPeople` (`GET /api/v1/people?search&cursor&limit`), `getPerson` (`GET /api/v1/people/:personId` — `PEO-002`/`PEO-003`), `getPersonByCpf` (`GET /api/v1/people/by-cpf/:cpf` — `PEO-004`) (depende de T011, T020)
- [ ] T022 [US1] Handlers Elysia de cadastro (`*.service.fn.ts`) em `src/modules/people-context/server/adapters/person-commands.service.fn.ts`: `createPerson` (`POST /api/v1/people` — 201 dedup-aware + 207 → `created-idp-pending`), `updatePerson` (`PUT /api/v1/people/:personId` — 204; email omitido preserva atual via COALESCE) (depende de T011, T020)
- [ ] T023 [US1] `client/data`: `person.model.ts` (TypeBox) + `person.repository.ts` (`Result`; emite `person-registered`/`person-updated` no bus) em `src/modules/people-context/client/data/` (depende de T021, T022; testes T017 verdes)
- [ ] T024 [P] [US1] Lista de pessoas: `person-list.view-model.ts` (puro) + `person-list.binding.ts` (`createAsync`/`query` do `@solidjs/router`) + `person-list.page.tsx` (componente Solid: `SearchField`, badges ativo/inativo, paginação por cursor) em `src/modules/people-context/client/person-list/`
- [ ] T025 [P] [US1] Cadastro: `person-registration.view-model.ts` + `register-person.service.fn.ts` + `person-registration.page.tsx` (seção opcional "Criar login" com `email`/`initialPassword`; `IdpPendingCallout` no 207 com CTA "Provisionar login" apontando para a US3) em `src/modules/people-context/client/person-registration/`
- [ ] T026 [US1] Ficha da pessoa: `person-record.view-model.ts` (abas Cadastro · Vínculos · Acesso; aba Cadastro com edição inline → `updatePerson`; `PersonHeader` com badges) + `person-record.binding.ts` + page em `src/modules/people-context/client/person-record/` (depende de T023)
- [ ] T027 [US1] Testes de componente Solid (`bun:test` + `@testing-library/solid`): `person-list.page.test.tsx`, `person-registration.page.test.tsx` (fluxo feliz 201, dedup 201, fluxo 207 → callout), `person-record.page.test.tsx` (edição 204 → re-fetch; `PEO-001` exibido como mensagem localizada)
- [ ] T028 [US1] Exportar superfícies da US1 em `src/modules/people-context/public-api/index.ts` e ligar rotas `src/routes/people/{index,new,$personId}.tsx`

**Checkpoint**: US1 funcional e testável de ponta a ponta — MVP demonstrável

---

## Phase 4: User Story 2 - Gestão de vínculos de sistema (Priority: P2)

**Goal**: admin (escopado ao próprio sistema) atribui vínculos `system:role` a uma pessoa, lista os vínculos na ficha, desativa/reativa vínculos e consulta o discovery por sistema (`GET /roles`); as regras `ROL-006` (superadmin-only), `ROL-007` (escopo de sistema) e `ROL-008` (auto-assign proibido) viram mensagens claras.

**Independent Test**: logar como `social-care:admin` → na ficha de uma pessoa, atribuir `social-care:patient` (201) → reatribuir o mesmo vínculo e receber noop (204, sem toast de erro) → tentar atribuir vínculo em `therapies` e ver mensagem de escopo (`ROL-007`) → desativar o vínculo (204) → reativá-lo → vê-lo no discovery `GET /roles?system=social-care`.

### Tests for User Story 2 (RED primeiro) ⚠️

- [ ] T029 [P] [US2] Teste de contrato TypeBox: `assignRoleSchema` (`{ system, role }` min 1), `SystemRoleModel` (`{ id, personId, system, role, active, assignedAt }`), `RoleQueryEntryModel` (`{ person: PersonSummary` com `cpf, role: SystemRole }`), `queryRolesSchema` (`system` obrigatório) — `src/modules/people-context/server/adapters/role.schema.test.ts`
- [ ] T030 [P] [US2] Teste do ViewModel de vínculos (puro): resultado discriminado `assigned` (201) vs `already-active` (204 noop, sem erro); catálogo hardcoded `KnownSystem` (`social-care | queue-manager | therapies | timesheet`) e `KnownRole` (`patient | professional | family-member | employee | therapist`) + campo livre; mapeamento de `ROL-001`/`ROL-006`/`ROL-007`/`ROL-008`/`ROL-009` para mensagens; esconder ação "atribuir superadmin" se caller não é superadmin — `src/modules/people-context/client/role-management/role-management.view-model.test.ts`

### Implementation for User Story 2

- [ ] T031 [P] [US2] Implementar `src/modules/people-context/server/adapters/role.schema.ts` (depende de T029)
- [ ] T032 [US2] Handlers Elysia (`*.service.fn.ts` / `*.query.fn.ts`) em `src/modules/people-context/server/adapters/roles.service.fn.ts`: `assignRole` (`POST /api/v1/people/:personId/roles` — 201 vs 204), `listPersonRoles` (`GET /api/v1/people/:personId/roles?active=`), `deactivateRole`/`reactivateRole` (`PUT /api/v1/people/:personId/roles/:roleId/{deactivate|reactivate}` — `ROL-002`/`ROL-003`/`ROL-005`/`ROL-007`/`ROL-009`), `queryRoles` (`GET /api/v1/roles?system=&role=&active=` — `ROL-004`) (depende de T011, T031)
- [ ] T033 [US2] `client/data`: `role.model.ts` + `role.repository.ts` (`Result`; emite `role-assignment-changed` no bus → invalida ficha e discovery) em `src/modules/people-context/client/data/`
- [ ] T034 [US2] Aba Vínculos da ficha: `role-management.view-model.ts` + `RolesTable` (toggle ativar/desativar com tratamento de `ROL-009` → recarga) + `AssignRoleDialog` (selects de catálogo + campo livre; aviso quando `role = superadmin`) em `src/modules/people-context/client/role-management/` (depende de T026, T032, T033)
- [ ] T035 [P] [US2] Discovery por sistema: `roles-discovery.view-model.ts` + page Solid (filtros `system`/`role`/`active`; CPF exibido via `MaskedField` — nunca cru; aviso de lista não paginada para sistemas grandes) em `src/modules/people-context/client/role-management/` e rota `src/routes/people/roles.tsx`
- [ ] T036 [US2] Testes de componente: `role-management.component.test.tsx` (201 → linha nova; 204 noop → sem erro; `ROL-007` → mensagem de escopo; `ROL-008` → mensagem de auto-assign) e `roles-discovery.page.test.tsx` (`ROL-004` nunca disparado — `system` sempre enviado)

**Checkpoint**: US1 e US2 funcionam de forma independente

---

## Phase 5: User Story 3 - Gestão de acesso e IdP (Priority: P3)

**Goal**: admin gerencia o ciclo de acesso da pessoa no Authentik a partir da aba Acesso: provisão retroativa de login (inclusive recuperação do 207 da US1), solicitação de password reset (202 — link nunca aparece na UI), desativação/reativação (IdP-first) e erasure LGPD Art. 18 V (somente superadmin, dupla confirmação, irreversível).

**Independent Test**: logar como admin → abrir ficha de pessoa sem login → "Provisionar login" com email (201, `AccessStatusPill` vira "login ativo") → "Enviar redefinição de senha" (202 → toast, sem link) → desativar a pessoa (204, badge inativa) → reativar → logar como superadmin → apagar a pessoa digitando o nome completo na confirmação (204) → pessoa some da lista.

### Tests for User Story 3 (RED primeiro) ⚠️

- [ ] T037 [P] [US3] Teste de contrato TypeBox: `provisionLoginSchema` (`personId`, `email?` override, `initialPassword?` min 8), `erasePersonSchema` (`personId` + confirmação de nome validada no BFF antes do `DELETE`) — `src/modules/people-context/server/adapters/access.schema.test.ts`
- [ ] T038 [P] [US3] Teste do ViewModel de acesso (puro): `AccessState` derivado (`no-login | provisioned | idp-pending`) com switch exaustivo; ações oferecidas por estado (`no-login` → provisionar; `provisioned` → reset/desativar) e por role do caller (erasure só superadmin); mapeamento de `PEO-005`/`PEO-006`/`PEO-007`/`PEO-008`/`PEO-009`/`PEO-010` e `IDP-001..005` (`kind` `idpUnavailable` → mensagem de retry) — `src/modules/people-context/client/access-management/access-management.view-model.test.ts`

### Implementation for User Story 3

- [ ] T039 [P] [US3] Implementar `src/modules/people-context/server/adapters/access.schema.ts` (depende de T037)
- [ ] T040 [US3] Handlers Elysia (`*.service.fn.ts`) em `src/modules/people-context/server/adapters/access.service.fn.ts`: `provisionLogin` (`POST /api/v1/people/:personId/login` — 201/409 `PEO-008`/422 `PEO-009`/502 `IDP-001`), `requestPasswordReset` (`POST /api/v1/people/:personId/request-password-reset` — 202; `PEO-007`; `IDP-004`), `deactivatePerson`/`reactivatePerson` (`PUT /api/v1/people/:personId/{deactivate|reactivate}` — `PEO-005`/`PEO-006`; `IDP-002`/`IDP-003`), `erasePerson` (`DELETE /api/v1/people/:personId` — `PEO-010`; `IDP-005`) (depende de T011, T039)
- [ ] T041 [US3] `client/data`: `access.repository.ts` (`Result`; emite `person-access-changed` no bus → invalida ficha e lista) em `src/modules/people-context/client/data/`
- [ ] T042 [P] [US3] Aba Acesso: `access-management.view-model.ts` + componentes Solid (`AccessStatusPill`, formulário de provisão retroativa com `email` override, botão de reset → `ResetRequestedToast` "Solicitação enviada — a pessoa receberá um email", ações desativar/reativar com confirmação) em `src/modules/people-context/client/access-management/` (depende de T026, T040, T041)
- [ ] T043 [US3] Erasure LGPD: `EraseConfirmDialog` (dupla confirmação digitando o nome completo; aviso de irreversibilidade e remoção dos vínculos; visível apenas se caller tem `superadmin` no claim `groups`) + `erase-person.service.fn.ts` → redirect para a lista em `src/modules/people-context/client/access-management/` (depende de T042)
- [ ] T044 [US3] Integrar o retry pós-207: `IdpPendingCallout` da US1 chama `provisionLogin` via binding Solid (`action`/`useSubmission`) e atualiza `AccessState` sem reload (depende de T025, T042)
- [ ] T045 [US3] Testes de componente: `access-management.component.test.tsx` (provisão 201 → pill atualiza; `PEO-009` → erro no campo email; `IDP-002` → mensagem de retry sem mudança de estado; reset 202 → toast sem link; erasure bloqueado até o nome conferir)

**Checkpoint**: todas as user stories funcionais de forma independente

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: melhorias que atravessam as user stories

- [ ] T046 [P] Catálogo i18n pt-BR completo: 1 tag por `AppError.code` do people-context (`PEO-001..010`, `ROL-001..009`, `IDP-001..005`, `AUTH-001..003`, `ADM-001`) em `src/modules/people-context/client/domain/error-messages.ts`
- [ ] T047 [P] Acessibilidade: labels/aria nos formulários e diálogos de confirmação Solid, navegação por teclado nas abas e na `RolesTable`, contraste dos badges (tokens vanilla-extract, ver `design-tokens.fe.md`)
- [ ] T048 Performance: prefetch da ficha a partir da lista via `query`/`createAsync`; verificação dos goals (lista p95 < 1 s; lookup por CPF < 500 ms) em `metrics.fe.md`
- [ ] T049 [P] Testes adicionais de regressão: races 409 (`PEO-005`/`PEO-006`/`ROL-009` → recarga + reconciliação) e fluxo completo 207 → retry → `provisioned` em `src/modules/people-context/client/`
- [ ] T050 Hardening de segurança: confirmar que nenhum bundle client importa de `server/` (governance test de boundaries, [ADR-0001](../../adr/0001-vertical-modular-architecture.md)), que `PEOPLE_CONTEXT_API_URL`, token e `X-Actor-Id` nunca aparecem no payload SSR, que o CPF do discovery nunca é renderizado sem máscara e que o link de reset não existe em nenhum response do BFF
- [ ] T051 Atualizar docs irmãos: refletir contrato final em `api-readiness.fe.md` e registrar decisões tomadas (207 como sucesso parcial, catálogo hardcoded de `systems`/`roles`, CPF mascarado no discovery) em `adr/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências — começa imediatamente
- **Foundational (Phase 2)**: depende do Setup — BLOQUEIA todas as user stories
- **User Stories (Phases 3–5)**: todas dependem da Foundational
  - Podem prosseguir em paralelo (se houver equipe)
  - Ou sequencialmente por prioridade (P1 → P2 → P3)
- **Polish (Phase 6)**: depende das user stories desejadas estarem completas

### User Story Dependencies

- **US1 (P1)**: começa após Foundational — sem dependência de outras stories
- **US2 (P2)**: começa após Foundational — integra com a aba Vínculos da ficha (T026/US1), mas seus handlers, models e componentes são testáveis isoladamente
- **US3 (P3)**: começa após Foundational — integra com a aba Acesso da ficha (T026/US1) e com o retry do 207 (T025/US1), mas é testável isoladamente da mesma forma

### Within Each User Story

- Testes (RED) escritos e falhando ANTES da implementação
- Schemas TypeBox antes de handlers; handlers antes de repositories; repositories antes de ViewModels; ViewModels antes de bindings/pages
- Implementação central antes da integração nas abas da ficha
- Story completa antes de avançar para a próxima prioridade

### Parallel Opportunities

- T003/T004 (Setup) em paralelo
- Na Foundational: T006/T008/T012–T014 em paralelo após T005
- Concluída a Foundational, US1/US2/US3 podem rodar em paralelo por pessoas diferentes
- Dentro de cada story, todas as tasks de teste [P] em paralelo; schemas e features de UI [P] em paralelo (arquivos distintos)

---

## Parallel Example: User Story 1

```bash
# Disparar todos os testes RED da US1 juntos:
Task: "Contrato TypeBox Person em src/modules/people-context/server/adapters/person.schema.test.ts"
Task: "Repositório de pessoas em src/modules/people-context/client/data/person.repository.test.ts"
Task: "ViewModel da lista em src/modules/people-context/client/person-list/person-list.view-model.test.ts"
Task: "ViewModel do cadastro em src/modules/people-context/client/person-registration/person-registration.view-model.test.ts"

# Depois, features de UI independentes em paralelo:
Task: "Lista de pessoas em src/modules/people-context/client/person-list/"
Task: "Cadastro (com fluxo 207) em src/modules/people-context/client/person-registration/"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (CRÍTICO — bloqueia tudo)
3. Completar Phase 3: US1 — cadastro/busca de pessoa
4. **PARAR e VALIDAR**: testar US1 de forma independente (cadastrar → dedup por CPF → buscar → editar)
5. Deploy/demo se pronto

### Incremental Delivery

1. Setup + Foundational → fundação pronta
2. US1 → testar → deploy/demo (MVP: registro de pessoas operacional)
3. US2 → testar → deploy/demo (vínculos de sistema completos)
4. US3 → testar → deploy/demo (ciclo de acesso IdP + erasure LGPD)
5. Cada story agrega valor sem quebrar as anteriores

### Parallel Team Strategy

Com mais de um dev:

1. Time completa Setup + Foundational junto
2. Depois da Foundational:
   - Dev A: US1 (Pessoa)
   - Dev B: US2 (Vínculos)
   - Dev C: US3 (Acesso/IdP)
3. Stories completam e integram nas abas da ficha de forma independente

---

## Notes

- [P] = arquivos diferentes, sem dependências entre si
- [Story] mapeia a task à user story para rastreabilidade
- Cada user story deve ser completável e testável de forma independente
- Verificar que os testes falham (RED) antes de implementar
- Commit após cada task ou grupo lógico (Conventional Commits, no repo `web_02/`)
- Parar em qualquer checkpoint para validar a story isoladamente
- Evitar: tasks vagas, conflitos no mesmo arquivo, dependências cross-story que quebrem a independência

## Referências

- [Constitution web_02](../../../.specify/memory/constitution.md) — Princípios I–VI
- [ADR README (índice + tabela de substituições)](../../adr/README.md)
- [ADR-0001 — Vertical-Modular Architecture](../../adr/0001-vertical-modular-architecture.md)
- [ADR-0002 — Errors as Values](../../adr/0002-errors-as-values.md)
- [ADR-0003 — Bun Supply Chain](../../adr/0003-bun-supply-chain.md) — `bun:test`; sem `node:test`/Vitest
- [ADR-0004 — Client×Server Split](../../adr/0004-client-server-split-mvvm-ddd.md)
- [ADR-0007 — vanilla-extract](../../adr/0007-design-system-vanilla-extract.md)
- [ADR-0009 — Framework-Agnostic Client](../../adr/0009-framework-agnostic-client.md) — ViewModel puro + binding Solid
- [ADR-0010 — BFF Orchestration / fn naming](../../adr/0010-bff-orchestration-fn-naming.md) — `*.query.fn.ts` / `*.service.fn.ts`
- [ADR-0011 — No Mocks in Production](../../adr/0011-no-mocks-in-production.md)
- [BDD (cenários)](./bdd.md)
- [TDD (test list RED)](./tdd.md)
- [QA Test Plan](./qa-test-plan.md)
- [Checklist](./checklist.md)
- [Review W2](./review.md)
- Referência offline Bun: `../../reference/runtime/bun/`
- Referência offline Elysia: `../../reference/framework/elysia/`
- Referência offline SolidStart: `../../reference/framework/solidstart/`
- Referência offline vanilla-extract: `../../reference/ui/vanilla-extract/`
