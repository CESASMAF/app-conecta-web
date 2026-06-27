# Implementation Plan: Interface Web Social-Care (front + BFF)

**Branch**: `001-social-care-web` | **Date**: 2026-06-12 | **Spec**: [spec.fe.md](./spec.fe.md)

**Input**: Feature specification em `web_02/handbook/doc/social-care/spec.fe.md`

## Summary

Interface web do atendimento socioassistencial: prontuário e cadastro do paciente (Registry), avaliação socioeconômica (Assessment), plano de cuidado (Care) e medidas de proteção (Protection), consumindo a API do `social-care` exclusivamente através do BFF Elysia. O browser nunca vê token nem URL de backend — toda chamada outbound sai de handlers Elysia (`*.query.fn.ts` / `*.service.fn.ts`) acessados via **Eden treaty**, que injetam `Authorization: Bearer <jwt>` (OIDC/Authentik) e validam input/output com **TypeBox** (`Elysia.t`) na borda. O módulo é vertical (`src/modules/social-care/`), com client MVVM framework-agnóstico (ViewModel puro + binding Solid) e design system atômico só-tokens (vanilla-extract). Prontidão do contrato em [api-readiness.fe.md](./api-readiness.fe.md); tasks em [tasks.md](./tasks.md).

## Technical Context

**Language/Version**: TypeScript estrito (`erasableSyntaxOnly`, sem `any` implícito; `tsc --noEmit` limpo é gate) · **Bun** (runtime/PM/test)
**Meta-framework**: **SolidStart** (Solid · Vinxi · Nitro preset `bun`) · BFF **Elysia** montado em `src/routes/api/[...path].ts` → `app.fetch`
**Server-state (client)**: `createAsync` / `query` / `action` / `useSubmission` de `@solidjs/router` (Solid nativo — sem TanStack Query) · **Validação na borda BFF**: TypeBox (`Elysia.t`, vem com Elysia) · **UI**: Solid (JSX)
**Design System**: vanilla-extract (zero-runtime), tokens-only (`vars.*`) — [ADR-0007](../../adr/0007-design-system-vanilla-extract.md) · tokens em [design-tokens.fe.md](./design-tokens.fe.md)
**Testes**: `bun:test` (puro: domain/application/view-model/data + governance tests) + `bun:test` + happy-dom (DOM: page/component/binding); fakes in-memory — sem MSW
**Storage**: N/A no front — server-state via `createAsync`/`query` do Solid; sessão/token server-only (cookie HttpOnly + BFF Elysia)
**Target Platform**: navegador moderno + BFF Elysia (Nitro preset `bun`), atrás do Caddy na VPS ACDG-BV
**Project Type**: web app (front + BFF unificado, módulos verticais em SolidStart)
**Performance Goals**: lista de pacientes p95 < 1 s @ 20 itens/página (cursor-based); TTI da rota de prontuário < 2 s (agregado completo + `computedAnalytics` em 1 request via Eden)
**Constraints**: token nunca no browser (Princ. I); CSP/HSTS via Caddy + Elysia + SolidStart middleware (nonce per-request p/ hidratação do Solid); UI nunca lê status HTTP (só `AppError.kind`); CPF/NIS enviados sem máscara, datas em ISO 8601, exibição em `dd/MM/yyyy` via `Intl`; analytics computados **não** são recalculados no front (vêm de `computedAnalytics`)
**Scale/Scope**: ~8 fluxos de tela (lista, prontuário com abas, cadastro, família, 7 formulários de assessment, atendimentos/ingresso, encaminhamentos/violações/acolhimento, domínios) · ~24 handlers Elysia (`*.query.fn.ts`/`*.service.fn.ts`) · 5 sub-contratos (Registry, Assessment, Protection, Care, Configuration)

## Constitution Check

*GATE: passar antes da Fase 0. Re-checar após a Fase 1.* Princípios I–VI da [constituição web_02](../../../.specify/memory/constitution.md) ([ADRs](../../adr/README.md)).

| Princípio | Aderência | Nota |
|---|---|---|
| I. BFF-Orchestrated Boundary | ✓ | browser só fala com rotas Elysia via Eden treaty; Bearer injetado no BFF; `SOCIAL_CARE_API_URL` server-only; client nunca compõe/faz fan-out — [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md) |
| II. Errors as Values | ✓ | `Result<T,E>` em domain/application/data; `throw` só na borda (derivação do `createAsync` para o `<ErrorBoundary>` do Solid); `AppError.kind` é o único ponto de decisão — [ADR-0002](../../adr/0002-errors-as-values.md) |
| III. Vertical-Modular · Client (MVVM) × Server (DDD) | ✓ | módulo vertical `src/modules/social-care/`; cross-módulo (ex.: `auth`, `people-context`) só via `public-api`; boundaries via governance test `bun:test` — [ADR-0001](../../adr/0001-vertical-modular-architecture.md), [ADR-0009](../../adr/0009-framework-agnostic-client.md) |
| IV. Bun-Native / Zero-NPM-Utility | ✓ | PM = Bun; TanStack Query → `createAsync`/`action`; Zod → TypeBox (`Elysia.t`); `node:test` → `bun:test`; ESLint boundaries → governance test; MSW → fakes in-memory; @fontsource → `.woff2` manual — [ADR-0003](../../adr/0003-bun-supply-chain.md), [ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md) |
| V. Strict TS & End-to-End Type Safety | ✓ | TypeBox (`Elysia.t`) no BFF; Eden propaga tipo ao client — sem redeclarar Model; branded types (`PatientId`, `Cpf`, `Nis`, `Cep`, `LookupId`); `PatientStatus` como union `'waitlisted' \| 'active' \| 'discharged' \| 'withdrawn'` com switch exaustivo; referenciar token de design inexistente é erro de compilação (vanilla-extract) |
| VI. Honesty in Production (No Mocks) | ✓ | sem mocks em `src/`; operação sem rota no backend retorna `'not-implemented'` como valor, nunca dado fabricado; fixtures só em `tests/` — [ADR-0011](../../adr/0011-no-mocks-in-production.md) |

## Project Structure

### Documentation (this feature)

```text
web_02/handbook/doc/social-care/
├── discovery.fe.md           # Fase 0 (elicitação)
├── spec.fe.md                # o quê
├── api-readiness.fe.md       # prontidão do contrato social-care
├── domain.fe.md              # bounded contexts + agregados (citação ACDG)
├── adr.fe.md                 # decisões (citação ACDG)
├── metrics.fe.md             # NFRs (citação ACDG)
├── plan.md                   # visão core-api do contrato
├── plan.fe.md                # este arquivo
├── tasks.md                  # tasks por user story
└── design-tokens.fe.md       # tokens (Atomic Design 00-interface-inventory … 07-governance)
```

### Source Code (módulo vertical — espelha `auth`/`contracts`)

```text
src/modules/social-care/
├── server/                                  # BFF · DDD · onde o token vive
│   ├── domain/                              #   PURO: branded VOs (PatientId, Cpf, Nis, Cep, LookupId, Money),
│   │   │                                    #   Result, errors (AppError por código {BC}-{SEQ}), ports, events
│   │   ├── patient.ts · errors.ts · ports.ts
│   ├── application/                         #   use-cases (commands/queries) — sem throw
│   │   ├── list-patients.ts · get-patient.ts · register-patient.ts
│   │   ├── manage-family.ts · patient-lifecycle.ts
│   │   ├── update-assessment.ts · register-care.ts · manage-protection.ts
│   │   └── list-lookups.ts
│   └── adapters/                            #   ★ fronteira BFF Elysia
│       ├── social-care.client.ts            #   HTTP client → social-care (Bearer + envelope + AppError)
│       ├── envelope.schema.ts               #   TypeBox de StandardResponse / erro / paginação
│       ├── registry.schema.ts · assessment.schema.ts
│       ├── protection.schema.ts · care.schema.ts · lookup.schema.ts
│       ├── patients.query.fn.ts             #   queries: listPatients, getPatient, getPatientByPerson, getAuditTrail
│       ├── patient-commands.service.fn.ts   #   registerPatient, family, caregiver, socialIdentity, lifecycle
│       ├── assessment.service.fn.ts         #   7 mutations PUT
│       ├── care.service.fn.ts               #   registerAppointment, registerIntakeInfo
│       ├── protection.service.fn.ts         #   createReferral, reportRightsViolation, updatePlacementHistory
│       └── lookups.query.fn.ts              #   listLookupItems (+ requests p/ admin)
├── client/                                  # FRONT · MVVM · agnóstico (ADR-0009) — feature-first FLAT
│   ├── data/                                #   patient.model.ts, assessment.model.ts, lookup.model.ts (TypeBox/tipos)
│   │   │                                    #   + *.repository.ts (porta → Eden treaty) + events/
│   ├── domain/                              #   use-cases compartilhados (idade, máscara CPF/CEP, moeda) — opcional
│   ├── patient-list/                        #   *.view-model.ts (puro) + *.binding.ts + *.page.tsx (Solid)
│   ├── patient-record/                      #   prontuário (abas) + audit-trail timeline + analytics badges
│   ├── patient-registration/                #   cadastro multi-etapa + *.mutation.ts
│   ├── family-composition/                  #   membros, cuidador primário, docs pendentes
│   ├── assessment/                          #   7 formulários (housing, socioeconomic, work, education, health,
│   │                                        #   community-support, social-health-summary) + metadata-driven flags
│   ├── care/                                #   atendimentos + intake-info
│   └── protection/                          #   encaminhamentos, violações, acolhimento/afastamento
└── public-api/index.ts                      # ★ único import externo
```

**Structure Decision**: módulo vertical único `src/modules/social-care/` espelhando os módulos `auth`/`contracts` já existentes; as features do client agrupam-se por comportamento (camada = sufixo do arquivo), e os 5 sub-contratos do serviço viram pares schema+handler no `server/adapters/`. Rotas SolidStart em `src/routes/social-care/` importam apenas de `public-api/index.ts`.

## Handlers BFF Elysia & Contratos *(a fronteira — Princ. I)*

Cada handler (`*.query.fn.ts` / `*.service.fn.ts`) registra uma rota na app Elysia, consumida pelo client via **Eden treaty** (type-safe, isomorphic no SSR). O schema de input/output é **TypeBox** (`Elysia.t`); o Eden propaga o tipo ao client sem redeclaração ([ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md)).

| Handler Elysia | Tipo | Input (TypeBox `t.*`) | Output | core-api consumido |
|---|---|---|---|---|
| `listPatients` (`patients.query.fn.ts`) | query | `t.Object({ search: t.Optional(t.String()), status: t.Optional(t.String()), cursor: t.Optional(t.String()), limit: t.Integer({ minimum: 1, maximum: 100 }) })` | `Result`→ lista `PatientSummary` + meta paginação (`hasMore`, `nextCursor`) | `GET /api/v1/patients` |
| `getPatient` (`patients.query.fn.ts`) | query | `t.Object({ patientId: t.String() })` | `Result`→ `PatientRecord` (agregado completo + `computedAnalytics`) | `GET /api/v1/patients/:patientId` |
| `getPatientByPerson` (`patients.query.fn.ts`) | query | `t.Object({ personId: t.String() })` | `Result`→ `PatientRecord` | `GET /api/v1/patients/by-person/:personId` |
| `getAuditTrail` (`patients.query.fn.ts`) | query | `t.Object({ patientId: t.String(), eventType: t.Optional(t.String()) })` | `Result`→ `AuditTrailEntry[]` (before/after) | `GET /api/v1/patients/:patientId/audit-trail` |
| `registerPatient` (`patient-commands.service.fn.ts`) | mutation | `t.Object(...)` (espelha `RegisterPatientRequest`) | `Result`→ `{ id: PatientId }` | `POST /api/v1/patients` |
| `addFamilyMember` (`patient-commands.service.fn.ts`) | mutation | `t.Object(...)` (`AddFamilyMemberRequest`) | `Result`→ `{ id }` | `POST /api/v1/patients/:patientId/family-members` |
| `removeFamilyMember` (`patient-commands.service.fn.ts`) | mutation | `t.Object({ patientId, memberId })` | `Result`→ void | `DELETE /api/v1/patients/:patientId/family-members/:memberId` |
| `assignPrimaryCaregiver` (`patient-commands.service.fn.ts`) | mutation | `t.Object(...)` | `Result`→ void | `PUT /api/v1/patients/:patientId/primary-caregiver` |
| `updateSocialIdentity` (`patient-commands.service.fn.ts`) | mutation | `t.Object({ typeId: t.String(), description: t.Optional(t.String()) })` | `Result`→ void | `PUT /api/v1/patients/:patientId/social-identity` |
| `admitPatient` (`patient-commands.service.fn.ts`) | mutation | `t.Object({ patientId: t.String() })` | `Result`→ void | `POST /api/v1/patients/:patientId/admit` |
| `dischargePatient` (`patient-commands.service.fn.ts`) | mutation | `t.Object({ patientId, reason, notes: t.Optional(t.String()) })` (notes obrig. se `other`) | `Result`→ void | `POST /api/v1/patients/:patientId/discharge` |
| `readmitPatient` (`patient-commands.service.fn.ts`) | mutation | `t.Object({ patientId: t.String() })` | `Result`→ void | `POST /api/v1/patients/:patientId/readmit` |
| `withdrawPatient` (`patient-commands.service.fn.ts`) | mutation | `t.Object({ patientId, reason, notes: t.Optional(t.String()) })` (notes obrig. se `other`) | `Result`→ void | `POST /api/v1/patients/:patientId/withdraw` |
| `updateHousingCondition` (`assessment.service.fn.ts`) | mutation | `t.Object(...)` | `Result`→ void (204) | `PUT /api/v1/patients/:patientId/housing-condition` |
| `updateSocioEconomicSituation` (`assessment.service.fn.ts`) | mutation | `t.Object(...)` (benefícios c/ flags metadata) | `Result`→ void (204) | `PUT /api/v1/patients/:patientId/socioeconomic-situation` |
| `updateWorkAndIncome` (`assessment.service.fn.ts`) | mutation | `t.Object(...)` | `Result`→ void (204) | `PUT /api/v1/patients/:patientId/work-and-income` |
| `updateEducationalStatus` (`assessment.service.fn.ts`) | mutation | `t.Object(...)` | `Result`→ void (204) | `PUT /api/v1/patients/:patientId/educational-status` |
| `updateHealthStatus` (`assessment.service.fn.ts`) | mutation | `t.Object(...)` (gestação 1–9 meses) | `Result`→ void (204) | `PUT /api/v1/patients/:patientId/health-status` |
| `updateCommunitySupportNetwork` (`assessment.service.fn.ts`) | mutation | `t.Object(...)` | `Result`→ void (204) | `PUT /api/v1/patients/:patientId/community-support-network` |
| `updateSocialHealthSummary` (`assessment.service.fn.ts`) | mutation | `t.Object(...)` | `Result`→ void (204) | `PUT /api/v1/patients/:patientId/social-health-summary` |
| `registerAppointment` (`care.service.fn.ts`) | mutation | `t.Object(...)` (`RegisterAppointmentRequest`) | `Result`→ `{ id }` (201) | `POST /api/v1/patients/:patientId/appointments` |
| `registerIntakeInfo` (`care.service.fn.ts`) | mutation | `t.Object(...)` (`RegisterIntakeInfoRequest`) | `Result`→ void (204) | `PUT /api/v1/patients/:patientId/intake-info` |
| `createReferral` (`protection.service.fn.ts`) | mutation | `t.Object(...)` (destinationService union CRAS\|CREAS\|HEALTH_CARE\|EDUCATION\|LEGAL\|OTHER) | `Result`→ `{ id }` (201) | `POST /api/v1/patients/:patientId/referrals` |
| `reportRightsViolation` (`protection.service.fn.ts`) | mutation | `t.Object(...)` (`descriptionOfFact` obrig.) | `Result`→ `{ id }` (201) | `POST /api/v1/patients/:patientId/violation-reports` |
| `updatePlacementHistory` (`protection.service.fn.ts`) | mutation | `t.Object(...)` (validações cruzadas de idade) | `Result`→ void (204) | `PUT /api/v1/patients/:patientId/placement-history` |
| `listLookupItems` (`lookups.query.fn.ts`) | query | `t.Object({ tableName: t.String() })` (tableName ∈ `dominio_*`) | `Result`→ `LookupItem[]` (id, codigo, descricao, metadata) | `GET /api/v1/dominios/:tableName` |
| `createLookupRequest` (`lookups.query.fn.ts`) | mutation | `t.Object(...)` | `Result`→ `{ id }` | `POST /api/v1/dominios/requests` |

- **Cadeia de erro** (Princ. II): social-care 4xx/5xx → `resultFetch` → `HttpError` → `mapToServerResponse` →
  rota Elysia lança / retorna `Result<never, AppError>` → Eden entrega ao client → `createAsync` deriva para `<ErrorBoundary>` do Solid (única travessia valor→exceção). A UI nunca olha status HTTP; decide por **semântica** (`AppError.kind`). Os códigos estruturados do serviço (`PAT-001`, `FAM-002`, `ADM-003`, `DISC-007`, `WDR-003`, `READM-005`, `HOUSING-001`, `SOCIO-002`, `EDU-001`, `HEALTH-001`, `REF-001`, `VIO-002`, `PLACE-002`, `LOOKUP-002`, `LREQ-001`, …) são preservados em `AppError.code` para mensagens localizadas precisas; 409 de lifecycle/version dispara fluxo de recarga + reconciliação.

## Integração core-api *(prontidão)*

Resumo de [api-readiness.fe.md](./api-readiness.fe.md). Ponto de troca = repository (`client/data`) / client (`server/adapters`).

| Capacidade | Prontidão | Estratégia Fase 1 |
|---|---|---|
| Registry — lista, prontuário, cadastro, família, lifecycle | 🟢 | integrar real |
| Audit trail (timeline before/after) | 🟢 | integrar real |
| Assessment — 7 formulários PUT | 🟢 | integrar real |
| Protection — referrals, violações, acolhimento | 🟢 | integrar real (sem update de status de referral — exibir somente) |
| Care — atendimentos, intake-info | 🟢 | integrar real |
| Configuration — `GET /dominios/:tableName` | 🟢 | integrar real (cache longo via `query` do Solid + BFF) |
| Configuration — admin de domínios/requests | 🟡 | integrar `GET/POST /dominios/requests`; telas admin completas ficam fora do MVP |
| Concorrência otimista via `ETag`/`If-Match` | 🔴 | fallback: tratar 409 com recarga + reconciliação (campo `version` no `PatientResponse`) |
| Upload de documentos | 🔴 | não suportado pela API — registrar pendências como `requiredDocuments` (strings); sem tela de upload |

## Design System Impact *(Atomic Design — [ADR-0007](../../adr/0007-design-system-vanilla-extract.md), design-system só-tokens)*

- **Tokens**: usa os existentes de `shared/ui/tokens` ([design-tokens.fe.md](./design-tokens.fe.md)); novos tokens semânticos de severidade para vulnerabilidade (`alert.info/warning/critical`) — proibido hex/px cru em `ui/`; referenciar token inexistente é erro de compilação (vanilla-extract).
- **Átomos/Moléculas novos**: `Badge` de status do paciente (waitlisted/active/discharged/withdrawn) e de `Referral.Status` (PENDING/COMPLETED/CANCELLED); `MaskedField` (CPF/NIS/CEP — exibe com máscara, emite sem); `DateField` ISO 8601 ↔ `dd/MM/yyyy`; `MoneyField` (BRL via `Intl.NumberFormat`); `LookupSelect` (opções de `GET /dominios/:tableName`, com campos condicionais metadata-driven). Fontes: `.woff2` self-host em `public/fonts/` — [ADR-0008](../../adr/0008-self-host-webfonts.md).
- **Organismos**: `PatientHeader` (status + ações de lifecycle), `FamilyCompositionTable`, `AssessmentFormSection`, `AuditTrailTimeline` (diff before/after), `AnalyticsBadges` (densidade > 3.0 → "Risco de Sobrelotação", RPC, perfil etário), `LgpdAnonymizedBanner` ("Dados pessoais removidos por solicitação LGPD" + bloqueio de edição).
- **Templates/Pages**: lista de pacientes (busca + filtro status + paginação cursor); prontuário em abas (Cadastro · Família · Avaliação · Cuidado · Proteção · Histórico); wizard de cadastro. Rotas file-based em `src/routes/social-care/` do SolidStart.

## Data Model (client × server)

- **server/domain**: `Patient` (agregado read-side com `version` e `status` union), VOs branded `PatientId`, `PersonId`, `Cpf` (11 dígitos + DV), `Nis`, `Cep`, `LookupId`, `Money` (centavos); invariantes de lifecycle replicadas como pré-condições de UX (ex.: só oferecer "Desligar" se `status === 'active'`) — o serviço continua sendo a autoridade.
- **client/data Model**: tipos derivados do schema TypeBox (`Elysia.t`) do BFF, propagados via Eden — `PatientSummary` (lista), `PatientRecord` (prontuário + `computedAnalytics` consumido como dado, nunca recalculado), `AuditTrailEntry`, `LookupItem` (com flags `exigeRegistroNascimento`/`exigeCpfFalecido`/`exigeDescricao` para campos condicionais); sem redeclaração de Model — o tipo flui do BFF via Eden ([ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md), Princ. V).
- Detalhe em [domain.fe.md](./domain.fe.md).

## Plano de Testes (TDD)

- **Puro (`bun:test`, imports relativos)**: domain (VOs `Cpf`/`Cep`/`Money`, máquina de status), application (use-cases com fakes HTTP in-memory), view-model (filtros da lista, wizard de cadastro, derivações dos 7 formulários, regras metadata-driven de benefício), data (repository → fake Eden; parsing dos types TypeBox).
- **DOM (`bun:test` + happy-dom, aliases ok)**: `patient-list.page`, `patient-record.page`, `patient-registration.page`, `assessment/*.component`, `audit-trail-timeline.component`, bindings de mutation (409 → recarga). Componentes são Solid (JSX) — sem React; sem jsdom.
- **Governance tests** (`tests/architecture/*`): boundaries de módulo, núcleo client sem `@solidjs/*`, "só-tokens" no design system, `no-mocks-in-src` — todos em `bun:test` (substituem ESLint boundaries — [ADR-0001](../../adr/0001-vertical-modular-architecture.md), [ADR-0009](../../adr/0009-framework-agnostic-client.md), [ADR-0011](../../adr/0011-no-mocks-in-production.md)).
- **Escreva o teste antes** (Princ. V, spec-driven). Suites que falham primeiro (RED): `registry.schema.test.ts`, `social-care.client.test.ts`, `patient.repository.test.ts`, `patient-list.view-model.test.ts` — mesmas do W0 em [plan.md](./plan.md).

## Complexity Tracking

| Violação | Por que necessária | Alternativa simples rejeitada porque |
|---|---|---|
| — nenhuma: os 6 princípios da constituição passam sem exceção | — | — |

## Referências

- **Constituição web_02**: [../../../.specify/memory/constitution.md](../../../.specify/memory/constitution.md)
- **ADRs**: [../../adr/README.md](../../adr/README.md) — especialmente:
  - [ADR-0001](../../adr/0001-vertical-modular-architecture.md) (arquitetura vertical-modular)
  - [ADR-0002](../../adr/0002-errors-as-values.md) (erros como valores)
  - [ADR-0003](../../adr/0003-bun-supply-chain.md) (Bun supply-chain)
  - [ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md) (split client×server, Eden treaty)
  - [ADR-0007](../../adr/0007-design-system-vanilla-extract.md) (vanilla-extract design system)
  - [ADR-0008](../../adr/0008-self-host-webfonts.md) (webfonts self-host)
  - [ADR-0009](../../adr/0009-framework-agnostic-client.md) (ViewModel puro + binding Solid + Command)
  - [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md) (BFF Elysia + `*.query.fn` / `*.service.fn`)
  - [ADR-0011](../../adr/0011-no-mocks-in-production.md) (sem mocks em produção)
- **Spec**: [spec.fe.md](./spec.fe.md) · [spec.md](./spec.md)
- **Prontidão da API**: [api-readiness.fe.md](./api-readiness.fe.md)
- **Domínio**: [domain.fe.md](./domain.fe.md)
- **Design tokens**: [design-tokens.fe.md](./design-tokens.fe.md)
- **Outros serviços**: [../people-context/spec.md](../people-context/spec.md) (seleção de `personId`), [../analysis-bi/spec.md](../analysis-bi/spec.md) (indicadores agregados)
- **Docs offline**:
  - `../../reference/framework/solidstart/` (SolidStart, `action`, `createAsync`, `query`, `useSubmission`)
  - `../../reference/framework/elysia/` (Elysia: `group`/plugin, TypeBox, Eden treaty, `onRequest`/`onAfterHandle`)
  - `../../reference/ui/vanilla-extract/` (CSS-in-TS zero-runtime, Atomic Design, só-tokens)
  - `../../reference/runtime/bun/` (Bun: `bun:test`, `bun install`, `bun audit`, `bun build`)
  - `../../reference/ui/gsap/` (GSAP — animações)
