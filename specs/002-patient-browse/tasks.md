# Tasks: Navegação de pacientes (leitura) + catálogos de domínio

**Feature**: `002-patient-browse` · **Spec**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md)
**Design**: [research.md](./research.md) · [data-model.md](./data-model.md) · [contracts/](./contracts/) · [quickstart.md](./quickstart.md)

## Format: `[ID] [P?] [Story] Descrição com caminho de arquivo`

- **[P]** = paralelizável (arquivos distintos, sem dependência pendente).
- **[USx]** = pertence à User Story x (só nas fases de story).
- Testes incluídos: a constituição exige gates (`bun:test`) — governança + contract (BFF vs stub) + ViewModel puro. **Sem mock em `src/`** (stub só em `tests/`).

## Path Conventions

Front+BFF num só projeto SolidStart+Elysia. BFF em `src/server/`, adapters em `src/external/`, módulos verticais em `src/modules/<f>/{client,public-api}`, rotas em `src/routes/(app)/`, testes em `tests/`.

---

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 [P] Adicionar `SOCIAL_CARE_URL` (server-only) em `src/server/env.ts` (com validação de presença em prod) e dummy em `tests/setup/env.ts`.
- [X] T002 [P] Tipos de envelope + unwrap tipado em `src/shared/http/envelope.ts` (`StandardResponse<T>`, `PaginatedResponse<T>`).

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ Bloqueia todas as user stories — o cliente outbound e o mapa de erro são base de tudo.**

- [X] T003 [P] Mapa de erro upstream `src/shared/http/upstream-error.ts` — `(status, error.code)` → tag de `AppError` (ver research D4); sem vazar URL/stack.
- [X] T004 Porta `SocialCareClient` + adapter HTTP (`fetch`, Bearer, `AbortSignal`/`withTimeout`, devolve `Result`) em `src/external/social-care-client.ts` (depende T002, T003).
- [X] T005 Compor `SocialCareClient` em `AppDeps` (`src/server/deps.ts`) e na fábrica `createApp` (`src/server/app.ts`) — injetável p/ teste (depende T004).
- [X] T006 [P] Stub HTTP upstream `tests/support/social-care-stub.ts` (`Bun.serve` com fixtures de pacientes/domínios + envelopes/erros documentados) + helper de injeção da porta.
- [X] T007 [P] Tags i18n PT-BR das mensagens (erros + estado vazio) em `src/shared/i18n/patients.ts` e `src/shared/i18n/domains.ts`.

---

## Phase 3: User Story 1 - Percorrer a lista de pacientes (Priority: P1) 🎯 MVP

**Goal**: profissional autenticado vê a lista paginada por cursor (nome/diagnóstico/membros/situação) com scroll infinito e estado vazio.
**Independent Test**: com sessão + pacientes no stub/DEV, abrir `/patients` e ver a 1ª página (≤20) + carregar a próxima ao rolar + encerrar no fim (REG-010, REG-011).

### Tests for User Story 1

- [X] T008 [P] [US1] Contract test `tests/contract/patients-list.contract.test.ts` — default ≤20 + `meta` completo, cursor → `hasMore=false`, Bearer encaminhado ao stub, envelope `{data,meta}` (REG-010, REG-011); **+ G1**: upstream 403 → tag `forbidden` (sem dado vazado); **+ G3**: sessão ausente/expirada → 401 (sem Bearer ao upstream).
- [X] T009 [P] [US1] ViewModel test `tests/modules/patients/patient-list.view-model.test.ts` — `mergeNextPage` (append + cursor), `isExhausted`, `isEmpty`.

### Implementation for User Story 1

- [X] T010 [P] [US1] `src/modules/patients/client/data/patient-summary.model.ts` + `patient-status.ts` (enum `PatientStatus` + ordem + rótulos i18n).
- [X] T011 [US1] Rota BFF `src/server/routes/patients-list.query.fn.ts` — query `Elysia.t` (`search/status/limit 1–100/cursor`), `requireSession` + Bearer, chama `SocialCareClient.listPatients`, re-emite `{data,meta}` (depende T004, T005).
- [X] T012 [US1] Registrar a rota em `src/server/app.ts` (grupo `/patients`).
- [X] T013 [P] [US1] Server function `src/modules/patients/server/patient-list.fn.ts` (`"use server"` → `app.handle('/api/patients', {cookie})`; devolve `Result<Page,AppError>`) — transporte SSR-safe (research **D11**, espelha `getCurrentUserFn`). Tipos puros em `client/data/`.
- [X] T014 [P] [US1] ViewModel puro `src/modules/patients/client/list/patient-list.view-model.ts` (`start`, `mergeNextPage`, `isEmpty`, `isExhausted`).
- [X] T015 [US1] Binding `src/modules/patients/client/list/patient-list.binding.ts` (Solid: `createAsync` + cursor + `IntersectionObserver` no sentinel) (depende T013, T014). **+ G2**: expor estado de erro por tag (`dependency-unavailable`/`forbidden`) com ação **"tentar novamente"** preservando o recorte (search/filtro/posição).
- [X] T016 [P] [US1] Views burras `src/modules/patients/client/list/components/{patient-row,empty-state,list-skeleton,error-retry}.component.tsx` + `patient-list.css.ts` (tokens do DS). **+ G2**: `error-retry` (mensagem por tag + botão "tentar novamente").
- [X] T017 [US1] Página `src/modules/patients/client/list/patient-list.page.tsx` (compõe binding + componentes) + `src/modules/patients/public-api/index.ts` (depende T015, T016).
- [X] T018 [US1] Rota `src/routes/(app)/patients/index.tsx` (protegida pelo guard 001) montando `PatientListPage`.
- [X] T019 [US1] Entrada de menu "Pacientes" → `/patients` em `src/modules/shell/client/root/root.view-model.ts` + ajustar `tests/modules/shell/root.view-model.test.ts`.

---

## Phase 4: User Story 2 - Buscar e filtrar pacientes (Priority: P2)

**Goal**: refinar a lista por nome (busca) e por situação (filtro), combináveis, reiniciando a paginação.
**Independent Test**: buscar "Maria" → só nomes com "Maria"; filtrar "ACTIVE" → só ativos; combinar (REG-013).

### Tests for User Story 2

- [X] T020 [P] [US2] Estender `tests/contract/patients-list.contract.test.ts` — `search`+`status` mapeados ao upstream; `limit` 0/101 → 400 sem tocar o stub (REG-012, REG-013).

### Implementation for User Story 2

- [X] T021 [P] [US2] Views `src/modules/patients/client/list/components/{search-bar,status-filter}.component.tsx` + estilos (tokens).
- [X] T022 [US2] Estender `patient-list.binding.ts` com debounce (`setTimeout`, ~300ms) na busca + reset de paginação ao mudar recorte (depende T015).
- [X] T023 [US2] Estender `patient-list.view-model.ts` (troca de `query` → `start`) + caso de estado vazio com recorte preservado em `patient-list.view-model.test.ts`.

---

## Phase 5: User Story 3 - Abrir um paciente (Priority: P2)

**Goal**: abrir um paciente navega ao detalhe (stub honesto); paciente inexistente volta à lista com aviso.
**Independent Test**: abrir um id válido → stub; abrir id inexistente → volta à lista com aviso (REG-014).

### Tests for User Story 3

- [X] T024 [P] [US3] Contract test `tests/contract/patient-get.contract.test.ts` — 200 (cabeçalho mínimo) + 404 (REG-014); **+ G1**: 403 → tag `forbidden`.

### Implementation for User Story 3

- [X] T025 [US3] Rota BFF `src/server/routes/patient-get.query.fn.ts` (200 mínimo / 404) + registrar em `src/server/app.ts` (depende T004, T005).
- [X] T026 [P] [US3] Repository get + `src/modules/patients/client/detail/patient-detail.binding.ts` (checa existência; 404 → `Navigate` à lista) + `patient-detail-stub.page.tsx` (placeholder honesto "prontuário = feature 003") + `patient-detail.css.ts`.
- [X] T027 [US3] Rota `src/routes/(app)/patients/[id].tsx` + export no `patients/public-api` (depende T026).

---

## Phase 6: User Story 4 - Catálogos de domínio prontos (Priority: P3)

**Goal**: após login, catálogos disponíveis e cacheados por sessão (só ativos, ordenados por código; allowlist).
**Independent Test**: obter um catálogo permitido (itens ativos ordenados); 2º pedido vem do cache; tabela fora da allowlist → erro tratado (LKP-T001, LKP-T002).

### Tests for User Story 4

- [X] T028 [P] [US4] Contract test `tests/contract/domains-get.contract.test.ts` — itens ativos ordenados por `codigo`; `tableName` fora da allowlist → 400 `LKP-001` **sem** tocar o stub (LKP-T001, LKP-T002); **+ G1**: 403 → tag `forbidden`.
- [X] T029 [P] [US4] Cache test `tests/modules/domains/domain-cache.test.ts` — 2º pedido na sessão não rechama o repository (dedup).

### Implementation for User Story 4

- [X] T030 [US4] Rota BFF `src/server/routes/domains-get.query.fn.ts` (allowlist 13 + `requireSession` + Bearer + repassa itens ativos ordenados) + registrar em `src/server/app.ts` (depende T004, T005).
- [X] T031 [P] [US4] `src/modules/domains/client/data/domain-catalog.model.ts` + `DomainTable` (allowlist das 13).
- [X] T032 [P] [US4] Server function `src/modules/domains/server/domain-catalog.fn.ts` (`"use server"` → `app.handle('/api/domains/:tableName', {cookie})`) — transporte SSR-safe (D11). Tipos puros em `client/data/`.
- [X] T033 [US4] Cache por sessão `src/modules/domains/client/cache/domain-cache.ts` (`query` do Solid) + `src/modules/domains/public-api/index.ts` (accessor p/ selects futuros) (depende T032).

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T034 [P] Smoke SSR (build) + leak/LGPD: `/patients` com/sem sessão (200/302), render da lista do stub; `.output/public` sem `SOCIAL_CARE_URL`/token/`jose`/redis; logs do servidor sem nome/diagnóstico de paciente (SC-006, FR-015).
- [X] T035 [P] Governança verde p/ os novos módulos (boundaries/agnostic/no-mocks/no-leak) + grep anti-hardcode de opções de domínio (SC-004) em `tests/architecture/`.
- [X] T036 Rodar validação do [quickstart.md](./quickstart.md): `bunx tsc --noEmit`, `bun test`, `bun audit --audit-level=high`, `bun run build`.
- [X] T037 [P] Registrar decisões (cliente outbound `social-care` + padrão "stub upstream em `tests/`") como emenda em `handbook/adr/0010-bff-orchestration-fn-naming.md` e/ou `0011-no-mocks-in-production.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Fase 1)**: sem dependências.
- **Foundational (Fase 2)**: depende do Setup — **BLOQUEIA** todas as stories (SocialCareClient + erro + deps + stub).
- **US1 (Fase 3)**: depende da Fase 2. É o **MVP**.
- **US2 (Fase 4)**: depende da US1 (refina a mesma lista/binding).
- **US3 (Fase 5)**: depende da Fase 2 (rota get) + US1 (navegação a partir da lista).
- **US4 (Fase 6)**: depende só da Fase 2 — independente das demais (pode ir em paralelo à US1).
- **Polish (Fase 7)**: depois das stories desejadas.

### Paralelismo

- Fase 2: T003, T006, T007 em paralelo; T004→T005 sequencial.
- US1: T008/T009 (testes) ‖ ; T010/T013/T014/T016 [P] ‖ ; T011→T012 e T015→T017→T018 sequenciais.
- **US4 pode rodar em paralelo à US1** (módulo `domains` é disjunto do `patients`).

### MVP

- **MVP = Fase 1 + Fase 2 + US1** (lista paginada renderizando com dado real). US2/US3 incrementam usabilidade; US4 prepara as features de escrita.

## Total

**37 tasks** — Setup 2 · Foundational 5 · US1 12 · US2 4 · US3 4 · US4 6 · Polish 4.
