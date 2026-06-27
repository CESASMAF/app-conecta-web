# Tasks: Cadastro, ciclo de vida, núcleo familiar e identidade social do paciente (escrita)

**Feature**: `003-patient-manage` · **Spec**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md)
**Design**: [research.md](./research.md) · [data-model.md](./data-model.md) · [contracts/](./contracts/) · [quickstart.md](./quickstart.md)

## Format: `[ID] [P?] [Story] Descrição com caminho de arquivo`

- **[P]** = paralelizável (arquivos distintos, sem dependência pendente).
- **[USx]** = pertence à User Story x (só nas fases de story).
- **Padrão facade (ADR-0010 adendo 2026-06-25)**: o BFF compõe view-ready (fan-out + merge + domínio→rótulo + transições disponíveis); **mutações devolvem view-state, nunca `204`**; o client só troca estado (sem refetch). Cache de domínio = input de select apenas.
- Testes: a constituição exige gates (`bun:test`) — governança + contract (BFF vs stub, incl. **composição/erro-parcial**) + ViewModel puro + segurança. **Sem mock em `src/`** (stub só em `tests/`).

## Path Conventions

Rotas do BFF em `src/server/routes/*.{query,service}.fn.ts`, composição em `src/server/composition/`, adapter outbound em `src/external/`, **extensão** do módulo vertical `src/modules/patients/{server,client,public-api}`, telas em `src/routes/(app)/`, testes em `tests/`.

---

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 [P] Tipos de domínio puros de escrita em `src/modules/patients/client/data/{patient-registration,lifecycle,family,social-identity}.model.ts` (shapes de request + enums `DischargeReason`/`WithdrawReason`/documentos; sem `@solidjs/*`).
- [ ] T002 [P] Tags i18n PT-BR de escrita (por comando: validação/conflito/sem-permissão/dependência-fora/não-encontrado) em `src/shared/i18n/patients.ts` (estende a da 002).

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ Bloqueia todas as user stories — o cliente outbound de escrita+leitura, o mapa de erro, a composição view-ready e o stub são base de tudo.**

- [ ] T003 Estender `src/shared/http/upstream-error.ts` — mapear `REGP/ADM/DISC/READM/WDR/APP/RFM/APC/USIA-xxx` (status + `error.code`) → tag (`validation`/`conflict`/`notFound`/`forbidden`/`dependencyUnavailable`/`unknown`), sem vazar URL/stack (research D4).
- [ ] T004 Estender `SocialCareClient` (`src/external/social-care-client.ts`): (a) 9 métodos de **escrita** (`createPatient`/`admit`/`discharge`/`readmit`/`withdraw`/`addFamilyMember`/`removeFamilyMember`/`setPrimaryCaregiver`/`updateSocialIdentity`); (b) **leitura para composição** (paciente completo + núcleo familiar + identidade social, além do header da 002). `fetch` + Bearer + `withTimeout` + `Result`; **sem** header de ator (D5) (depende T003).
- [ ] T005 [P] Estender stub HTTP upstream `tests/support/social-care-stub.ts` com handlers/fixtures das 9 mutações + **máquina de estados** (`WAITLISTED→ACTIVE→DISCHARGED`) + dados para overview/form-context, conforme `contracts/upstream-social-care-write.md` (tests-only — Princ. VI).
- [ ] T006 **Composição view-ready** `src/server/composition/patient-overview.compose.ts` — fan-out no `social-care` (cabeçalho + família + identidade social), **merge**, **resolve domínio→rótulo** (via domínios da 002, server-side), calcula `availableTransitions` a partir da situação, e **degradação parcial** (`meta.partial` quando uma origem secundária cai) → `PatientOverview` (data-model) (depende T004).
- [ ] T007 Rotas de **leitura composta** `src/server/routes/patient-overview.query.fn.ts` (`GET /api/patients/:id/overview`) + `patient-form-context.query.fn.ts` (`GET /api/patients/new/form-context`) + registrar em `src/server/app.ts`; contract test `tests/contract/patient-overview.contract.test.ts` (composição completa; rótulos resolvidos; `availableTransitions` por situação; `meta.partial` na queda de origem) (depende T006).
- [ ] T008 View-ready model + transporte: `src/modules/patients/client/data/patient-overview.model.ts` (tipos do retorno do BFF) + server fn `src/modules/patients/server/patient-overview.fn.ts` (`"use server"` → `app.handle(GET /overview)`) + binding `src/modules/patients/client/detail/patient-overview.binding.ts` que **substitui o detalhe-stub da 002** em `src/routes/(app)/patients/[id].tsx` (base onde US2/US3/US4 montam) (depende T007).

---

## Phase 3: User Story 1 - Registrar um novo paciente (Priority: P1) 🎯 MVP

**Goal**: profissional `worker` cadastra um paciente (validação local + BFF); o BFF cria e **devolve o `PatientOverview` view-ready**; a tela navega ao overview sem novo GET; o paciente nasce `WAITLISTED` e aparece na lista da 002.
**Independent Test**: cadastro válido → 201 com overview pronto + paciente na lista; inválido → erro de campo **sem** chamar o backend (REGP-001…031).

### Tests for User Story 1

- [ ] T009 [P] [US1] Contract test `tests/contract/patient-create.contract.test.ts` — 201 retorna **`PatientOverview` view-ready** (status+rótulo+transições) + Bearer encaminhado; corpo inválido → **400 sem tocar o stub** (SC-002); 409 (REGP-001/030); 422 pessoa inexistente (REGP-029); 503 (REGP-031); **CSRF** sem `X-Requested-With` → 403; sem sessão → 401.
- [ ] T010 [P] [US1] ViewModel test `tests/modules/patients/patient-create.view-model.test.ts` — `validateForm` (obrigatórios, CPF, data não-futura, descrição condicional de identidade), erros por campo (tags i18n).

### Implementation for User Story 1

- [ ] T011 [US1] Rota BFF `src/server/routes/patient-create.service.fn.ts` — corpo `Elysia.t`, `requireSession` + CSRF, **valida antes** do upstream, `SocialCareClient.createPatient`, **recompõe via `patient-overview.compose.ts` e devolve `201 {data: PatientOverview, meta}`** (depende T004, T006).
- [ ] T012 [US1] Registrar a rota em `src/server/app.ts` (grupo `/patients`, `POST`).
- [ ] T013 [P] [US1] Server function `src/modules/patients/server/patient-create.fn.ts` (`"use server"` → `app.handle('POST /api/patients', {cookie})`) → `Result<PatientOverview, AppError>`.
- [ ] T014 [P] [US1] ViewModel puro `src/modules/patients/client/create/patient-create.view-model.ts` (`validateField`/`validateForm`/regras condicionais; sem Solid).
- [ ] T015 [US1] Binding `src/modules/patients/client/create/patient-create.binding.ts` (Solid: `action`+`useSubmission` anti-duplo-submit; erro por campo; **on success → navega ao `/patients/:id` usando o `PatientOverview` devolvido, sem refetch**) (depende T013, T014).
- [ ] T016 [P] [US1] Views `src/modules/patients/client/create/components/{form-section,field,domain-select,submit-bar}.component.tsx` + `patient-create.css.ts` — `domain-select` consome o **`form-context`/cache de domínio** (input apenas), nada de opção fixa (SC-004).
- [ ] T017 [US1] Página `src/modules/patients/client/create/patient-create.page.tsx` (seções de D11; carrega `form-context` do BFF) + export em `src/modules/patients/public-api/index.ts` (depende T015, T016).
- [ ] T018 [US1] Rota `src/routes/(app)/patients/new.tsx` (protegida pelo guard 001) + entrada "Novo paciente" em `src/modules/shell/client/root/root.view-model.ts` (+ ajustar `tests/modules/shell/root.view-model.test.ts`).

---

## Phase 4: User Story 2 - Conduzir o ciclo de vida (Priority: P2)

**Goal**: oferecer só a transição cabível (vinda do `availableTransitions` do overview) e, ao executar, **trocar o estado com o cabeçalho recomposto** devolvido pela mutação (sem refetch).
**Independent Test**: em fila → admitir → ativo; ativo → alta(motivo) → desligado; desligado → readmitir; em fila → retirar(motivo); transição inválida → 409 sem mudar estado.

### Tests for User Story 2

- [ ] T019 [P] [US2] Contract test `tests/contract/patient-lifecycle.contract.test.ts` — admit/discharge/readmit/withdraw: **200 + cabeçalho recomposto** (status+statusLabel+availableTransitions), **não `204`**; erros de estado (ADM-002/003, DISC-001/007, READM-001/005, WDR-002/003); discharge/withdraw `reason='other'` sem `notes` → **400 no BFF**; CSRF/401.
- [ ] T020 [P] [US2] ViewModel test `tests/modules/patients/lifecycle.view-model.test.ts` — `requiresReason`/`requiresNotes(transition, reason)` (as transições disponíveis vêm do BFF, não derivadas no client).

### Implementation for User Story 2

- [ ] T021 [P] [US2] 4 rotas BFF `src/server/routes/patient-{admit,discharge,readmit,withdraw}.service.fn.ts` (corpo `Elysia.t` onde houver; valida `notes` p/ "outro"; `SocialCareClient` + recompõe cabeçalho via composição) + registrar em `src/server/app.ts` (depende T004, T006).
- [ ] T022 [P] [US2] Server function `src/modules/patients/server/patient-lifecycle.fn.ts` (`"use server"` → admit/discharge/readmit/withdraw → `Result<cabeçalho, AppError>`).
- [ ] T023 [P] [US2] ViewModel puro `src/modules/patients/client/lifecycle/lifecycle.view-model.ts` (exigência de motivo/observações por transição — data-model).
- [ ] T024 [US2] Binding `src/modules/patients/client/lifecycle/lifecycle.binding.ts` (`action` por transição; **troca o estado do overview com o cabeçalho devolvido**; bloqueia duplo-submit) (depende T022, T023).
- [ ] T025 [US2] Componentes `lifecycle-actions.component.tsx` (renderiza `overview.availableTransitions`) + `discharge-dialog.component.tsx` (motivo + obs obrigatória se "outro") montados no overview em `src/routes/(app)/patients/[id].tsx` (depende T024).

---

## Phase 5: User Story 3 - Gerir o núcleo familiar (Priority: P3)

**Goal**: adicionar/remover membro e definir cuidador principal; cada mutação **devolve o `FamilyView` recomposto** (com rótulos), e o client troca o estado.
**Independent Test**: adicionar membro → consta; readicionar → APP-008; remover → some; definir cuidador → marcado.

### Tests for User Story 3

- [ ] T026 [P] [US3] Contract test `tests/contract/patient-family.contract.test.ts` — add/remove/caregiver: **200 + `FamilyView` recomposto** (relationshipLabel + primaryCaregiverId), não `204`; já-existe (APP-008); não-encontrado (RFM-002/APC-002); não-ativo (APP-010/RFM-005/APC-005); CSRF/401.
- [ ] T027 [P] [US3] ViewModel test `tests/modules/patients/family.view-model.test.ts` — validação de membro (campos obrigatórios, documentos válidos) e de cuidador.

### Implementation for User Story 3

- [ ] T028 [P] [US3] 3 rotas BFF `src/server/routes/{family-member-add,family-member-remove,primary-caregiver-set}.service.fn.ts` (recompõem `FamilyView`) + registrar em `src/server/app.ts` (depende T004, T006).
- [ ] T029 [P] [US3] Server function `src/modules/patients/server/family.fn.ts` (`"use server"` → add/remove/caregiver → `Result<FamilyView, AppError>`).
- [ ] T030 [P] [US3] ViewModel puro `src/modules/patients/client/family/family.view-model.ts`.
- [ ] T031 [US3] Binding `src/modules/patients/client/family/family.binding.ts` (add/remove/caregiver; **troca o estado com o `FamilyView` devolvido**) (depende T029, T030).
- [ ] T032 [US3] `src/modules/patients/client/family/family-panel.page.tsx` + `components/` (selects de parentesco do `form-context`/cache; **rótulos já vêm resolvidos do BFF**) montado no overview `[id].tsx` (depende T031).

---

## Phase 6: User Story 4 - Atualizar a identidade social (Priority: P3)

**Goal**: atualizar tipo de identidade (catálogo) com descrição condicional; a mutação **devolve o fragmento `{ typeId, typeLabel, description }`** (rótulo resolvido).
**Independent Test**: atualizar com tipo do catálogo → 200 com rótulo; tipo que exige descrição sem ela → barrado; não-ativo → 409.

### Tests for User Story 4

- [ ] T033 [P] [US4] Contract test `tests/contract/patient-social-identity.contract.test.ts` — **200 + identidade recomposta com `typeLabel`**, não `204`; descrição exigida ausente (USIA-006) → **400 no BFF**; não-ativo (USIA-008); lookup (USIA-007); CSRF/401.
- [ ] T034 [P] [US4] ViewModel test `tests/modules/patients/social-identity.view-model.test.ts` — exigência condicional de descrição por tipo.

### Implementation for User Story 4

- [ ] T035 [US4] Rota BFF `src/server/routes/social-identity-update.service.fn.ts` (corpo `Elysia.t`; valida descrição condicional; recompõe a identidade com rótulo) + registrar em `src/server/app.ts` (depende T004, T006).
- [ ] T036 [P] [US4] Server function `src/modules/patients/server/social-identity.fn.ts` + ViewModel puro `src/modules/patients/client/social-identity/social-identity.view-model.ts`.
- [ ] T037 [US4] Binding `social-identity.binding.ts` (troca estado com o fragmento devolvido) + `social-identity-form.component.tsx` (select de tipo do `form-context`/cache) montado no overview `[id].tsx` (depende T036).

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T038 [P] Teste de segurança `tests/security/patient-write.security.test.ts` — **CSRF** por mutação (sem `X-Requested-With` → 403); **nenhum header de ator** (`X-Actor-Id`) encaminhado ao upstream (D5); **nenhuma mutação retorna `204`** (todas devolvem view-state — ADR-0010 §3); sem PII de paciente/membro em log (SC-006, FR-015).
- [ ] T039 [P] Governança verde p/ as sub-features novas (boundaries/agnostic/no-mocks/no-leak) + grep anti-hardcode de opções de domínio (SC-004) + **grep "client não resolve label nem faz fan-out"** (exibição vem do BFF) em `tests/architecture/`.
- [ ] T040 Rodar validação do [quickstart.md](./quickstart.md): `bunx tsc --noEmit`, `bun test`, `bun audit --audit-level=high`, `bun run build`.
- [ ] T041 [P] Confirmar o adendo ao `handbook/adr/0010-bff-orchestration-fn-naming.md` (facade view-ready) e registrar a composição (`patient-overview.compose.ts`) + CSRF/sem-header-de-ator como emenda em `0005`/`0011` se necessário.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Fase 1)**: sem dependências.
- **Foundational (Fase 2)**: depende do Setup — **BLOQUEIA** todas as stories. Inclui a **composição view-ready + overview** (T006–T008), base onde US2/US3/US4 montam.
- **US1 (Fase 3)**: depende da Fase 2. É o **MVP** (cadastro devolve overview).
- **US2/US3/US4**: dependem da Fase 2 (overview montado em `[id].tsx`); **podem rodar em paralelo entre si** (cada uma adiciona um painel/ação ao overview e recompõe seu fragmento).
- **Polish (Fase 7)**: depois das stories desejadas.

### Paralelismo

- Fase 1: T001, T002 ‖.
- Fase 2: T005 [P] ‖ ; T003→T004→T006→T007→T008 sequencial (cadeia da composição).
- US1: T009/T010 (testes) ‖ ; T013/T014/T016 [P] ‖ ; T011→T012 e T015→T017→T018 sequenciais.
- **US2, US3 e US4 em paralelo entre si** após a Fase 2 (painéis disjuntos no overview).

### MVP

- **MVP = Fase 1 + Fase 2 + US1**: cadastrar paciente ponta a ponta; o BFF compõe e devolve o `PatientOverview` view-ready; a tela de detalhe já é a composta (não mais o stub da 002).

## Total

**41 tasks** — Setup 2 · Foundational 6 (inclui composição+overview) · US1 10 · US2 7 · US3 7 · US4 5 · Polish 4.
