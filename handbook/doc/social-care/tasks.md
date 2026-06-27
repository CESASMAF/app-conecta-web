---

description: "Task list — Interface Web Social-Care (001-social-care-web)"
---

# Tasks: Interface Web Social-Care

**Input**: Documentos de design de [../README.md](../README.md) (docs de integração 3-apps) e [web_02/handbook/doc/social-care/](.)

**Prerequisites**: [plan.fe.md](./plan.fe.md) (required), [spec.fe.md](./spec.fe.md) (required for user stories), [plan.md](./plan.md), [api-readiness.fe.md](./api-readiness.fe.md), [domain.fe.md](./domain.fe.md), [design-tokens.fe.md](./design-tokens.fe.md)

**Tests**: TDD obrigatório (Princípio II da [constituição](../../../.specify/memory/constitution.md) — Errors as Values + Princípio VI — Honesty/No Mocks) — toda task de teste precede a implementação correspondente e deve falhar primeiro (RED).

**Organization**: Tasks agrupadas por user story para permitir implementação e teste independentes de cada história.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: a qual user story a task pertence (US1, US2, US3)
- Paths exatos incluídos nas descrições

## Path Conventions

- Repo `web_02/` (Bun · SolidStart · Elysia BFF). Módulo vertical em `src/modules/social-care/` conforme [plan.fe.md](./plan.fe.md).
- `server/` = BFF Elysia (token vive aqui; handlers `*.query.fn.ts`/`*.service.fn.ts`) · `client/` = MVVM agnóstico (ViewModel puro + binding Solid) · `public-api/index.ts` = único import externo ([ADR-0001](../../adr/0001-vertical-modular-architecture.md)).
- Rotas SolidStart em `src/routes/social-care/` (file-based, `@solidjs/router`). Testes puros co-locados `*.test.ts` (`bun:test`); testes de componente Solid `*.test.tsx` (`bun:test` + happy-dom).

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: esqueleto do módulo vertical e fiação de build/teste

- [ ] T001 Criar esqueleto do módulo em `src/modules/social-care/{server/{domain,application,adapters},client/{data,domain},public-api}/` com `index.ts` vazio em `public-api`
- [ ] T002 Configurar governance tests de boundaries do módulo (`tests/architecture/social-care-boundaries.test.ts`) em `bun:test` — import externo só via `src/modules/social-care/public-api/index.ts`; núcleo `client/domain/` e `*.view-model.ts` sem `solid-js`/`@solidjs/*` ([ADR-0001](../../adr/0001-vertical-modular-architecture.md), [ADR-0009](../../adr/0009-framework-agnostic-client.md))
- [ ] T003 [P] Criar stubs de rota em `src/routes/social-care/` (index = lista; `$patientId` = prontuário; new = cadastro) importando apenas de `public-api` — rotas file-based do SolidStart (`@solidjs/router`)
- [ ] T004 [P] Garantir scripts de teste do módulo (`bun test`) em `package.json`; configurar happy-dom para testes de componente Solid

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: borda BFF Elysia↔social-care, cadeia de erro, sessão/Bearer, domínios (lookups) e tokens de design — pré-requisitos de TODAS as user stories

**⚠️ CRITICAL**: nenhuma user story pode começar antes desta fase terminar

- [ ] T005 Configurar `SOCIAL_CARE_API_URL` server-only (env do BFF Elysia; nunca exposto ao client) e registrar em `src/modules/social-care/server/adapters/config.ts`
- [ ] T006 [P] Teste RED do envelope: TypeBox (`Elysia.t`) de `StandardResponse` `{ data, meta: { timestamp } }`, meta paginada (`pageSize, totalCount, hasMore, nextCursor`) e erro `{ error: { code, message, details } }` em `src/modules/social-care/server/adapters/envelope.schema.test.ts`
- [ ] T007 [P] Implementar `src/modules/social-care/server/adapters/envelope.schema.ts` (depende de T006; tipo flui ao client via Eden Treaty — sem redeclarar Model — [ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md))
- [ ] T008 [P] Teste RED da taxonomia de erro: mapear códigos `{BC}-{SEQ}` (PAT, FAM, ADM, DISC, WDR, READM, HOUSING, SOCIO, WORK, EDU, HEALTH, REF, VIO, PLACE, LOOKUP, LREQ) → `AppError.kind` (notFound | conflict | validation | forbidden | unavailable) preservando `code`, em `src/modules/social-care/server/domain/errors.test.ts`
- [ ] T009 Implementar `src/modules/social-care/server/domain/errors.ts` com `Result<T,E>` e `AppError` — sem `throw`, sem `default` silencioso ([ADR-0002](../../adr/0002-errors-as-values.md); depende de T008)
- [ ] T010 Teste RED do client HTTP: injeta `Authorization: Bearer <jwt>` da sessão Authentik (módulo auth via `public-api`), desembrulha envelope, converte 4xx/5xx em `AppError`, nunca vaza token — `src/modules/social-care/server/adapters/social-care.client.test.ts`
- [ ] T011 Implementar `src/modules/social-care/server/adapters/social-care.client.ts` (resultFetch + HttpError + mapToServerResponse; Eden Treaty para chamadas tipadas) (depende de T007, T009, T010)
- [ ] T012 [P] Teste RED + implementação de lookups: `lookup.schema.ts` (TypeBox — LookupItem com flags `exigeRegistroNascimento`/`exigeCpfFalecido`/`exigeDescricao`) e `lookups.query.fn.ts` (`listLookupItems` → GET `/api/v1/dominios/:tableName`; `createLookupRequest` → POST `/api/v1/dominios/requests`) em `src/modules/social-care/server/adapters/` ([ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md))
- [ ] T013 [P] `client/data` de lookups: `lookup.model.ts` + `lookup.repository.ts` (porta → handler query fn; cache com `createAsync`/`query` do `@solidjs/router` — [ADR README](../../adr/README.md)) em `src/modules/social-care/client/data/`
- [ ] T014 [P] VOs branded puros com smart constructors retornando `Result`: `PatientId`, `PersonId`, `Cpf` (11 dígitos + DV), `Nis`, `Cep`, `LookupId`, `Money` (centavos), `PatientStatus` union — testes `bun:test` + implementação em `src/modules/social-care/server/domain/patient.ts` e `src/modules/social-care/client/domain/`
- [ ] T015 [P] Helpers puros de formatação (Intl, sem libs): máscara/desmáscara CPF (`123.456.789-00` ↔ dígitos), NIS, CEP (`12345-678`), data ISO 8601 ↔ `dd/MM/yyyy`, BRL — testes `bun:test` + implementação em `src/modules/social-care/client/domain/format.ts`
- [ ] T016 [P] Átomos/moléculas tokens-only (vanilla-extract — [ADR-0007](../../adr/0007-design-system-vanilla-extract.md)): Badge de status, MaskedField, DateField, MoneyField, LookupSelect (com campos condicionais metadata-driven) em `src/shared/ui/` — zero hex/rgb/px cru; webfonts de `public/fonts/` ([ADR-0008](../../adr/0008-self-host-webfonts.md))
- [ ] T017 Infra de `QueryError` + bus de eventos do módulo (fatos no passado: `patient-registered`, `patient-lifecycle-changed`, `assessment-updated`) em `src/modules/social-care/client/data/events/` — invalidação cruzada lista ↔ prontuário via `createAsync`/`action` do `@solidjs/router`

**Checkpoint**: fundação pronta — user stories podem começar (em paralelo, se houver gente)

---

## Phase 3: User Story 1 - Prontuário e cadastro do paciente (Registry) (Priority: P1) 🎯 MVP

**Goal**: assistente social (worker) lista pacientes, abre o prontuário completo (com analytics computados e audit trail), cadastra novo paciente, gerencia composição familiar/cuidador primário/identidade social e executa transições de lifecycle (admit/discharge/readmit/withdraw).

**Independent Test**: com o social-care de pé, logar como worker → cadastrar paciente (status `waitlisted`) → vê-lo na lista filtrada → abrir prontuário → adicionar membro familiar e designar cuidador → admitir → ver eventos no audit trail.

### Tests for User Story 1 (RED primeiro) ⚠️

- [ ] T018 [P] [US1] Teste de contrato TypeBox (`Elysia.t`): `RegisterPatientRequest` (personalData, civilDocuments, address, socialIdentity, prRelationshipId), `AddFamilyMemberRequest`, `DischargePatientRequest`/`WithdrawPatientRequest` (notes obrigatório se reason=`other`, max 1000), `PatientResponse`, `AuditTrailEntryResponse` — `src/modules/social-care/server/adapters/registry.schema.test.ts`
- [ ] T019 [P] [US1] Teste do repositório: list/get/register/lifecycle expõem `Result` (nunca throw); cursor de paginação propagado — `src/modules/social-care/client/data/patient.repository.test.ts`
- [ ] T020 [P] [US1] Teste do ViewModel da lista: filtros search/status, limit 1–100 (default 20), avanço por `nextCursor` — `src/modules/social-care/client/patient-list/patient-list.view-model.test.ts`
- [ ] T021 [P] [US1] Teste do ViewModel do cadastro: etapas do wizard, CPF/NIS/CEP enviados sem máscara, datas em ISO 8601, sex ∈ M|F|NB — `src/modules/social-care/client/patient-registration/patient-registration.view-model.test.ts`
- [ ] T022 [P] [US1] Teste do ViewModel de lifecycle: ações oferecidas por status (waitlisted→admit|withdraw; active→discharge; discharged→readmit), switch exaustivo, mapeamento de ADM-002/ADM-003/DISC-007/WDR-003/READM-005 para mensagens — `src/modules/social-care/client/patient-record/patient-lifecycle.view-model.test.ts`

### Implementation for User Story 1

- [ ] T023 [P] [US1] Implementar `src/modules/social-care/server/adapters/registry.schema.ts` com TypeBox (`Elysia.t`) (depende de T018)
- [ ] T024 [US1] Handlers de leitura em `src/modules/social-care/server/adapters/patients.query.fn.ts`: `listPatients` (GET `/api/v1/patients?search&status&cursor&limit`), `getPatient` (GET `/api/v1/patients/:patientId`), `getPatientByPerson` (GET `/api/v1/patients/by-person/:personId`), `getAuditTrail` (GET `/api/v1/patients/:patientId/audit-trail?eventType`) (depende de T011, T023; [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md))
- [ ] T025 [US1] Handlers de comando em `src/modules/social-care/server/adapters/patient-commands.service.fn.ts`: `registerPatient` (POST `/api/v1/patients`), `addFamilyMember`, `removeFamilyMember` (DELETE …/family-members/:memberId), `assignPrimaryCaregiver` (PUT …/primary-caregiver), `updateSocialIdentity` (PUT …/social-identity), `admitPatient`/`dischargePatient`/`readmitPatient`/`withdrawPatient` (POST …/admit|discharge|readmit|withdraw) (depende de T011, T023)
- [ ] T026 [US1] `client/data`: `patient.model.ts` (PatientSummary, PatientRecord com computedAnalytics, AuditTrailEntry) + `patient.repository.ts` (depende de T024, T025; testes T019 verdes)
- [ ] T027 [P] [US1] Lista de pacientes: `patient-list.view-model.ts` (puro, sem `solid-js`) + `patient-list.binding.ts` (`createAsync`/`query` do `@solidjs/router`; queryKey por filtros; binding Solid único ponto de reatividade) + `patient-list.page.tsx` (busca, filtro de status, paginação por cursor — SolidStart route) em `src/modules/social-care/client/patient-list/` ([ADR-0009](../../adr/0009-framework-agnostic-client.md))
- [ ] T028 [P] [US1] Prontuário: `patient-record.view-model.ts` (abas Cadastro · Família · Avaliação · Cuidado · Proteção · Histórico) + `patient-record.binding.ts` + `patient-record.page.tsx`; organismos `PatientHeader` (status + ações), `AnalyticsBadges` (densidade > 3.0 → alerta de sobrelotação, RPC, perfil etário — sem recalcular no front) e `LgpdAnonymizedBanner` (aviso "Dados pessoais removidos por solicitação LGPD" + bloqueio de edição) em `src/modules/social-care/client/patient-record/`
- [ ] T029 [P] [US1] Audit trail: `audit-trail.view-model.ts` (filtro por eventType) + `audit-trail-timeline.component.tsx` (diff before/after; vanilla-extract) em `src/modules/social-care/client/patient-record/`
- [ ] T030 [P] [US1] Cadastro: `patient-registration.view-model.ts` (wizard: dados pessoais → documentos civis → endereço → identidade social → diagnósticos CID) + `patient-registration.binding.ts` (`action`/`useSubmission` do `@solidjs/router`) + `patient-registration.page.tsx` em `src/modules/social-care/client/patient-registration/`
- [ ] T031 [US1] Composição familiar: `family-composition.view-model.ts` + componentes (FamilyCompositionTable, formulário de membro com relationship validado contra `dominio_parentesco` via LookupSelect, flags isResiding/isCaregiver/hasDisability, requiredDocuments) + mutations add/remove/assignPrimaryCaregiver em `src/modules/social-care/client/family-composition/` (depende de T026; lookups de T012/T013)
- [ ] T032 [US1] Ações de lifecycle no prontuário: diálogos de discharge (reason enum caseObjectiveAchieved|transferredToAnotherService|patientRequestedDischarge|lossOfContact|relocation|death|other) e withdraw (patientDeclined|noResponse|duplicateRecord|ineligible|transferredBeforeAdmit|other) com notes condicional; tratamento de 409 (conflito de version/transição) com recarga + reconciliação via `action`/`useSubmission`; emissão de `patient-lifecycle-changed` no bus (depende de T028)
- [ ] T033 [US1] Testes de componente Solid (`bun:test` + happy-dom + `@testing-library/solid`): `patient-list.page.test.tsx`, `patient-record.page.test.tsx`, `patient-registration.page.test.tsx` — fluxos felizes + erro PAT-001 exibido como mensagem localizada
- [ ] T034 [US1] Exportar superfícies da US1 em `src/modules/social-care/public-api/index.ts` e ligar rotas `src/routes/social-care/{index,new,$patientId}.tsx`

**Checkpoint**: US1 funcional e testável de ponta a ponta — MVP demonstrável

---

## Phase 4: User Story 2 - Avaliação socioeconômica (Assessment) (Priority: P2)

**Goal**: worker preenche/atualiza os 7 blocos da avaliação socioeconômica do prontuário (habitação, situação socioeconômica, trabalho/renda, escolaridade, saúde, rede de apoio, resumo de saúde social), com campos condicionais metadata-driven e indicadores computados exibidos.

**Independent Test**: abrir a aba Avaliação de um paciente ativo → preencher housing-condition e socioeconomic-situation (benefício com `exigeCpfFalecido` exibe campo extra) → salvar (204) → reabrir e ver os valores + analytics atualizados (densidade, RPC) e o evento no audit trail.

### Tests for User Story 2 (RED primeiro) ⚠️

- [ ] T035 [P] [US2] Teste de contrato TypeBox (`Elysia.t`) dos 7 DTOs: `UpdateHousingConditionRequest`, `UpdateSocioEconomicSituationRequest`, `UpdateWorkAndIncomeRequest`, `UpdateEducationalStatusRequest`, `UpdateHealthStatusRequest` (monthsGestation 1–9), `UpdateCommunitySupportNetworkRequest`, `UpdateSocialHealthSummaryRequest` — `src/modules/social-care/server/adapters/assessment.schema.test.ts`
- [ ] T036 [P] [US2] Teste dos ViewModels de formulário: regra metadata-driven (benefitTypeId com exigeCpfFalecido/exigeRegistroNascimento → campos obrigatórios extras), renda ≥ 0, validação cruzada de gestação por idade/sexo do membro; mapeamento de HOUSING-001, SOCIO-001/002, WORK-001, EDU-001, HEALTH-001/002 — `src/modules/social-care/client/assessment/assessment-forms.view-model.test.ts`

### Implementation for User Story 2

- [ ] T037 [P] [US2] Implementar `src/modules/social-care/server/adapters/assessment.schema.ts` com TypeBox (depende de T035)
- [ ] T038 [US2] Handlers em `src/modules/social-care/server/adapters/assessment.service.fn.ts`: `updateHousingCondition`, `updateSocioEconomicSituation`, `updateWorkAndIncome`, `updateEducationalStatus`, `updateHealthStatus`, `updateCommunitySupportNetwork`, `updateSocialHealthSummary` (7× PUT `/api/v1/patients/:patientId/…`, resposta 204) (depende de T011, T037; [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md))
- [ ] T039 [US2] `client/data`: `assessment.model.ts` + `assessment.repository.ts` (`Result`, emite `assessment-updated` no bus → invalida PatientRecord via `action`) em `src/modules/social-care/client/data/`
- [ ] T040 [P] [US2] Formulários de habitação e socioeconomia: `housing-condition.view-model.ts`/`.component.tsx`, `socioeconomic-situation.view-model.ts`/`.component.tsx` (SocialBenefit com campos condicionais via flags de lookup) em `src/modules/social-care/client/assessment/`
- [ ] T041 [P] [US2] Formulários por membro: `work-and-income` (IndividualIncome por memberId, occupationId via `dominio_tipo_ocupacao`), `educational-status` (memberProfiles + programOccurrences), `health-status` (deficiencies via `dominio_tipo_deficiencia`, gestatingMembers, foodInsecurity) em `src/modules/social-care/client/assessment/`
- [ ] T042 [P] [US2] Formulários de rede de apoio e resumo: `community-support-network.view-model.ts`/`.component.tsx`, `social-health-summary.view-model.ts`/`.component.tsx` em `src/modules/social-care/client/assessment/`
- [ ] T043 [US2] Integrar os 7 formulários na aba Avaliação do prontuário (`AssessmentFormSection`), com estado de edição em reducer local (Server-State ≠ UI-State via `createStore` + reducer puro — sem `useState`) e bloqueio de edição quando o paciente foi anonimizado (LGPD) (depende de T028, T040–T042)
- [ ] T044 [US2] Testes de componente Solid (`bun:test` + happy-dom): `assessment-forms.component.test.tsx` (salvar 204 → toast + invalidação; SOCIO-002 → mensagem no campo benefitTypeId)

**Checkpoint**: US1 e US2 funcionam de forma independente

---

## Phase 5: User Story 3 - Plano de cuidado (Care) + medidas de proteção (Protection) (Priority: P3)

**Goal**: worker registra atendimentos e informações de ingresso/triagem (Care) e gerencia medidas de proteção — encaminhamentos para a rede (CRAS/CREAS/saúde/educação/jurídico), relatórios de violação de direitos e histórico de acolhimento/afastamento (Protection).

**Independent Test**: no prontuário de um paciente ativo → registrar intake-info (ingressTypeId de `dominio_tipo_ingresso`, serviceReason) → registrar atendimento (201 com id) → criar encaminhamento CRAS (status PENDING visível) → registrar violação de direitos (descriptionOfFact obrigatória) → atualizar acolhimento e ver validações cruzadas de idade.

### Tests for User Story 3 (RED primeiro) ⚠️

- [ ] T045 [P] [US3] Teste de contrato TypeBox (`Elysia.t`): `RegisterAppointmentRequest`, `RegisterIntakeInfoRequest` (linkedSocialPrograms), `CreateReferralRequest` (destinationService union), `ReportRightsViolationRequest`, `UpdatePlacementHistoryRequest` (endDate ≥ startDate) — `src/modules/social-care/server/adapters/{care,protection}.schema.test.ts`
- [ ] T046 [P] [US3] Teste dos ViewModels: date ≤ hoje em appointment/referral (REF-001), reason obrigatório (REF-002), descriptionOfFact obrigatória (VIO-002) + exigeDescricao por tipo de violação, cross-checks de acolhimento (PLACE-001/PLACE-002: adolescentInInternment exige membro 12–18) — `src/modules/social-care/client/{care,protection}/*.view-model.test.ts`

### Implementation for User Story 3

- [ ] T047 [P] [US3] Implementar `src/modules/social-care/server/adapters/care.schema.ts` e `protection.schema.ts` com TypeBox (depende de T045)
- [ ] T048 [US3] Handlers: `care.service.fn.ts` (`registerAppointment` → POST …/appointments 201; `registerIntakeInfo` → PUT …/intake-info 204) e `protection.service.fn.ts` (`createReferral` → POST …/referrals 201; `reportRightsViolation` → POST …/violation-reports 201; `updatePlacementHistory` → PUT …/placement-history 204) em `src/modules/social-care/server/adapters/` (depende de T011, T047; [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md))
- [ ] T049 [US3] `client/data`: `care.model.ts`, `protection.model.ts` + repositórios (`Result` + eventos no bus) em `src/modules/social-care/client/data/`
- [ ] T050 [P] [US3] Care UI: `appointments.view-model.ts` + timeline de atendimentos + formulário (professionalId, type, summary, actionPlan, date ≤ hoje); `intake-info.view-model.ts` + formulário (ingressTypeId via LookupSelect, originName/originContact, linkedSocialPrograms) em `src/modules/social-care/client/care/`
- [ ] T051 [P] [US3] Protection UI: `referrals.view-model.ts` + lista com Badge de status (PENDING/COMPLETED/CANCELLED, somente leitura — sem endpoint de transição) + formulário de encaminhamento; `violation-report.view-model.ts` + formulário (violationTypeId via `dominio_tipo_violacao`, campos condicionais por exigeDescricao); `placement-history.view-model.ts` + formulário (registries por membro, collectiveSituations, separationChecklist) em `src/modules/social-care/client/protection/`
- [ ] T052 [US3] Integrar Care e Protection nas abas Cuidado e Proteção do prontuário; encaminhamentos e violações também aparecem no audit trail (depende de T028, T050, T051)
- [ ] T053 [US3] Testes de componente Solid (`bun:test` + happy-dom): care e protection components (201 → item aparece na timeline; VIO-002 → erro no campo de descrição)

**Checkpoint**: todas as user stories funcionais de forma independente

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: melhorias que atravessam as user stories

- [ ] T054 [P] Catálogo i18n pt-BR completo: 1 tag por `AppError.code` do social-care (PAT-001 … LREQ-002) em `src/modules/social-care/client/domain/error-messages.ts`
- [ ] T055 [P] Acessibilidade: labels/aria nos formulários, navegação por teclado no wizard e nas abas, contraste dos badges de severidade (tokens vanilla-extract — [ADR-0007](../../adr/0007-design-system-vanilla-extract.md), ver [design-tokens.fe.md](./design-tokens.fe.md))
- [ ] T056 Performance: prefetch da rota de prontuário a partir da lista; verificação dos goals (lista p95 < 1 s; TTI prontuário < 2 s) em [metrics.fe.md](./metrics.fe.md)
- [ ] T057 [P] Testes adicionais de regressão: fluxo 409 (version divergiu → recarga + reconciliação) e paciente anonimizado (banner LGPD + edição bloqueada) em `src/modules/social-care/client/patient-record/`
- [ ] T058 Hardening de segurança: governance test confirma que nenhum módulo `client/` importa de `server/` ([ADR-0001](../../adr/0001-vertical-modular-architecture.md)); `SOCIAL_CARE_API_URL` e token nunca aparecem no payload SSR; CSP/HSTS configurados no BFF Elysia + Caddy ([ADR-0006](../../adr/0006-security-headers-csp.md))
- [ ] T059 Atualizar docs irmãos: refletir contrato final em [api-readiness.fe.md](./api-readiness.fe.md) e registrar decisões tomadas (tratamento 409, referral somente leitura) em [../../adr/README.md](../../adr/README.md)

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
- **US2 (P2)**: começa após Foundational — integra com a aba Avaliação do prontuário (T028/US1), mas seus handlers, models e formulários são testáveis isoladamente
- **US3 (P3)**: começa após Foundational — integra com as abas Cuidado/Proteção do prontuário (T028/US1), mas é testável isoladamente da mesma forma

### Within Each User Story

- Testes (RED) escritos e falhando ANTES da implementação
- Schemas TypeBox antes de handlers; handlers antes de repositories; repositories antes de ViewModels; ViewModels antes de bindings/pages
- Implementação central antes da integração nas abas do prontuário
- Story completa antes de avançar para a próxima prioridade

### Parallel Opportunities

- T003/T004 (Setup) em paralelo
- Na Foundational: T006/T008/T012–T016 em paralelo após T005
- Concluída a Foundational, US1/US2/US3 podem rodar em paralelo por pessoas diferentes
- Dentro de cada story, todas as tasks de teste [P] em paralelo; schemas e features de UI [P] em paralelo (arquivos distintos)

---

## Parallel Example: User Story 1

```bash
# Disparar todos os testes RED da US1 juntos (bun test):
Task: "Contrato TypeBox Registry em src/modules/social-care/server/adapters/registry.schema.test.ts"
Task: "Repositório de pacientes em src/modules/social-care/client/data/patient.repository.test.ts"
Task: "ViewModel da lista em src/modules/social-care/client/patient-list/patient-list.view-model.test.ts"
Task: "ViewModel do cadastro em src/modules/social-care/client/patient-registration/patient-registration.view-model.test.ts"
Task: "ViewModel de lifecycle em src/modules/social-care/client/patient-record/patient-lifecycle.view-model.test.ts"

# Depois, features de UI independentes em paralelo:
Task: "Lista de pacientes em src/modules/social-care/client/patient-list/"
Task: "Prontuário + analytics em src/modules/social-care/client/patient-record/"
Task: "Cadastro (wizard) em src/modules/social-care/client/patient-registration/"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (CRÍTICO — bloqueia tudo)
3. Completar Phase 3: US1 — prontuário/cadastro (Registry)
4. **PARAR e VALIDAR**: testar US1 de forma independente (cadastrar → listar → admitir → audit trail)
5. Deploy/demo se pronto

### Incremental Delivery

1. Setup + Foundational → fundação pronta
2. US1 → testar → deploy/demo (MVP: prontuário operacional)
3. US2 → testar → deploy/demo (avaliação socioeconômica completa)
4. US3 → testar → deploy/demo (cuidado + proteção)
5. Cada story agrega valor sem quebrar as anteriores

### Parallel Team Strategy

Com mais de um dev:

1. Time completa Setup + Foundational junto
2. Depois da Foundational:
   - Dev A: US1 (Registry)
   - Dev B: US2 (Assessment)
   - Dev C: US3 (Care + Protection)
3. Stories completam e integram nas abas do prontuário de forma independente

---

## Notes

- [P] = arquivos diferentes, sem dependências entre si
- [Story] mapeia a task à user story para rastreabilidade
- Cada user story deve ser completável e testável de forma independente
- Verificar que os testes falham (RED) antes de implementar (`bun test`)
- Commit após cada task ou grupo lógico (Conventional Commits, no repo `web_02/`)
- Parar em qualquer checkpoint para validar a story isoladamente
- Evitar: tasks vagas, conflitos no mesmo arquivo, dependências cross-story que quebrem a independência
- **Bun-native**: usar `bun test`, `bun install`, `bun run build`; nunca `npm`/`pnpm`/`yarn` ([ADR-0003](../../adr/0003-bun-supply-chain.md)) — NON-NEGOTIABLE

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípios I–VI
- [ADR-0001 — Vertical-Modular Architecture](../../adr/0001-vertical-modular-architecture.md) — `modules`/`shared`/`public-api`; governance tests
- [ADR-0002 — Errors as Values](../../adr/0002-errors-as-values.md) — `Result<T,E>`, sem `throw`
- [ADR-0003 — Bun Supply Chain](../../adr/0003-bun-supply-chain.md) — `bun test`, `bun install`, `bun run build`
- [ADR-0004 — Client/Server Split MVVM×DDD](../../adr/0004-client-server-split-mvvm-ddd.md) — TypeBox/Eden; fronteira Elysia
- [ADR-0005 — Auth Session & Refresh](../../adr/0005-auth-session-refresh-decisions.md) — OIDC+PKCE, cookie opaco
- [ADR-0006 — Security Headers CSP](../../adr/0006-security-headers-csp.md) — Elysia middleware + SolidStart + Caddy
- [ADR-0007 — Design System vanilla-extract](../../adr/0007-design-system-vanilla-extract.md) — CSS-in-TS zero-runtime
- [ADR-0008 — Self-Host Webfonts](../../adr/0008-self-host-webfonts.md) — `.woff2` manual em `public/fonts/`
- [ADR-0009 — Framework-Agnostic Client](../../adr/0009-framework-agnostic-client.md) — ViewModel puro + binding Solid
- [ADR-0010 — BFF Orchestration / Fn Naming](../../adr/0010-bff-orchestration-fn-naming.md) — `*.query.fn.ts` / `*.service.fn.ts`
- [ADR-0011 — No Mocks in Production](../../adr/0011-no-mocks-in-production.md) — fakes apenas em `tests/`
- [Índice de ADRs](../../adr/README.md)
- [bdd.md](./bdd.md) — cenários BDD (fase 6)
- [tdd.md](./tdd.md) — test list RED (fase 7)
- [qa-test-plan.md](./qa-test-plan.md) — plano amplo de QA
- [checklist.md](./checklist.md) — prontidão de feature antes do release
- [review.md](./review.md) — audit W2 (🟡→🟢)
- [spec.fe.md](./spec.fe.md) — histórias US-001…US-006
- [plan.fe.md](./plan.fe.md) — vertical slice e padrão BFF
- [api-readiness.fe.md](./api-readiness.fe.md) — prontidão do contrato de API
- [design-tokens.fe.md](./design-tokens.fe.md) — tokens vanilla-extract
- [metrics.fe.md](./metrics.fe.md) — orçamentos Web Vitals e NFRs
- [../README.md](../README.md) — integração cross-serviço (3 apps → 1)
- Docs offline: [../../reference/runtime/bun/](../../reference/runtime/bun/) · [../../reference/framework/elysia/](../../reference/framework/elysia/) · [../../reference/framework/solidstart/](../../reference/framework/solidstart/) · [../../reference/ui/vanilla-extract/](../../reference/ui/vanilla-extract/)
