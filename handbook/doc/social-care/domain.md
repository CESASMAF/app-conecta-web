# Modelo de Domínio: Social Care Web

**Feature**: `specs/001-social-care-web/` · **Consultor**: `/acdg-skills:ddd-architect`

> Fase 2 da pipeline (máximo rigor). Cada decisão de fronteira/agregado
> exige **citação canônica ≥4 linhas** (Evans/Vernon) via `skills_citar` — Princípio II da
> constituição.
> Este documento descreve o domínio **CORE** do backend `social-care` (Swift 6.3 · Vapor ·
> CQRS+ES+Outbox), fonte de verdade que a feature `001-social-care-web` consome via BFF.
> O modelo do frontend (BFF + client) está em [`domain.fe.md`](./domain.fe.md); requisitos em
> [`discovery.md`](./discovery.md)/[`discovery.fe.md`](./discovery.fe.md).

## Bounded Contexts afetados

- [x] Kernel (VOs cross-cutting) · [x] Registry (`Patient`) · [x] Assessment (`PatientAssessment`) · [x] Protection (`Referral`, `RightsViolationReport`, `PlacementHistory`) · [x] Care (`SocialCareAppointment`, `IngressInfo`) · [x] Configuration (`Lookup*`)

**Justificativa das fronteiras** (citação obrigatória):
> A BOUNDED CONTEXT delimits the applicability of a particular model so that team members
> have a clear and shared understanding of what has to be consistent and how it relates to
> other contexts. Within that CONTEXT, work to keep the model logically unified, but do not
> worry about applicability outside those bounds. In other contexts, other models apply,
> with differences in terminology, in concepts and rules, and in dialects of the
> UBIQUITOUS LANGUAGE.
> — *(Linha 5212, p. 336, ERIC EVANS, *Domain-Driven Design: Tackling Complexity in the Heart of Software*)*

Cada contexto do `social-care` responde a uma pergunta distinta do atendimento socioassistencial:
**Registry** — "quem é o titular e sua família?"; **Assessment** — "qual a situação social,
econômica, habitacional e educacional?"; **Protection** — "quais violações, encaminhamentos e
acolhimentos existem?"; **Care** — "quais atendimentos e ingressos ocorreram?"; **Configuration** —
"quais domínios dinâmicos (lookup tables) parametrizam os formulários?"; **Kernel** — tipos de
valor compartilhados (shared kernel) sem regra de negócio contextual.

## Linguagem ubíqua

| Termo (PT) | Significado | Tipo no código (EN) |
|---|---|---|
| Paciente | Pessoa com doença rara em acompanhamento | `Patient` (Aggregate Root) |
| Prontuário | Agregado completo: titular + família + assessments + intervenções | `Patient` (Aggregate) |
| Titular | Pessoa com doença rara, raiz do agregado | `Patient.personId: PersonId` |
| Composição familiar | Membros que residem com o titular | `FamilyMember` (Entity) |
| Pessoa de referência | Responsável principal — máx. 1 por família | `AssignPrimaryCaregiverCommand` |
| Cuidador | Pessoa que oferece cuidado a um membro | `FamilyMember.isCaregiver: Bool` |
| Avaliação socioeconômica | Coleta de renda, habitação, educação, saúde | `PatientAssessment` (Aggregate) |
| Densidade habitacional | Pessoas / dormitórios (sobrelotação > 3.0) | `HousingAnalytics` (Domain Service) |
| Renda per capita | Renda total familiar / nº de pessoas | `FinancialAnalytics`, `Money` (VO) |
| Benefício assistencial | Auxílio financeiro (BPC, Bolsa Família) | `SocialBenefit` (VO) |
| Encaminhamento | Envio para serviço de rede (CRAS, CREAS, saúde) | `Referral` (Aggregate) |
| Relatório de violação | Documentação de abuso/negligência/exploração | `RightsViolationReport` (Aggregate) |
| Acolhimento | Separação do convívio familiar (institucional, guarda) | `PlacementHistory` (Entity) |
| Atendimento | Consulta/encontro com profissional | `SocialCareAppointment` (Aggregate) |
| Ingresso | Entrada no serviço (demanda espontânea, encaminhado) | `IngressInfo` (Aggregate) |
| Identidade social | Identidade coletiva (Cigana, Quilombola, indígena) | `SocialIdentity` (VO) |
| Desligamento | Saída do serviço (active → discharged) | `PatientDischargedEvent` |
| Lista de espera | Estado inicial do prontuário antes da admissão | `PatientStatus.waitlisted` |

## Agregados e Value Objects

### Patient (Registry)
- **Raiz**: `Patient` (`PatientId`) · **Invariantes**:
  - Máquina de estados `PatientStatus`: `waitlisted ──admit──> active ──discharge──> discharged ──readmit──> active`; `waitlisted ──withdraw──> withdrawn` (sem retorno). Não se desliga (`discharge`) paciente em lista de espera (`DISC-007`); não se readmite `waitlisted` (`READM-005`).
  - Máximo **1 pessoa de referência primária** por família (unique constraint + `AssignPrimaryCaregiverCommand`).
  - `personId` único; membro (`memberPersonId`) único na família (`FAM-002`).
  - Pai/mãe falecido exige documentação especial (CPF do falecido ou Certidão de Óbito — metadata-driven).
  - `version: Int` — optimistic locking (ADR-005 do `social-care`); conflito → HTTP 409.
- **Value Objects**: `CPF` (dígito verificador), `NIS`, `CEP`, `CNS`, `RGDocument`, `Address`, `PersonalData`, `CivilDocuments`, `SocialIdentity`, `Diagnosis`/`ICDCode`, `DischargeInfo`/`DischargeReason`, `WithdrawInfo`/`WithdrawReason`, `TimeStamp`, `Money` — todos com `init(_:) throws` (smart constructor; no frontend, espelhados como branded types + `Result<T, E>` — ver [`domain.fe.md`](./domain.fe.md)).
- **Justificativa do boundary do agregado** (citação obrigatória):
  > An AGGREGATE is a cluster of associated objects that we treat as a unit for the purpose
  > of data changes. Each AGGREGATE has a root and a boundary. The boundary defines what is
  > inside the AGGREGATE. The root is a single, specific ENTITY contained in the AGGREGATE.
  > The root is the only member of the AGGREGATE that outside objects are allowed to hold
  > references to, although objects within the boundary may hold references to each other.
  > — *(Linha 2104, p. 126–127, ERIC EVANS, *Domain-Driven Design*)*

  Toda mutação de família, status e dados civis passa pela raiz `Patient`, que garante as
  invariantes transacionais (1 cuidador primário, transições de status) na mesma transação SQL.

### PatientAssessment (Assessment)
- **Raiz**: `PatientAssessment` (em evolução — ADR-024/ADR-025 do `social-care`) · **Invariantes**:
  - Renda ≥ 0 (`SOCIO-001`); idade entre 0 e 120; gestação apenas para membros > 12 anos (`HEALTH-001`); `monthsGestation` 1–9.
  - Códigos de lookup válidos: `benefitTypeId`, `occupationId`, `educationLevelId`, `deficiencyTypeId`, `effectId` (validação metadata-driven via `LookupValidating`).
  - Compatibilidade idade × nível educacional (`EDU-001`).
- **Value Objects**: `HousingCondition`, `SocioEconomicSituation` (com `Money`), `WorkAndIncome`/`IndividualIncome`, `EducationalStatus`/`MemberEducationalProfile`, `HealthStatus`/`Deficiency`/`PregnantMember`, `CommunitySupportNetwork`, `SocialHealthSummary`, `SocialBenefit`.
- **Justificativa do boundary do agregado** (citação obrigatória):
  > When trying to discover the Aggregates in a Bounded Context, we must understand the
  > model's true invariants. Only with that knowledge can we determine which objects should
  > be clustered into a given Aggregate. An invariant is a business rule that must always be
  > consistent. There are different kinds of consistency. One is transactional consistency,
  > which is considered immediate and atomic. There is also eventual consistency.
  > — *(Linha 6188, p. 353, VAUGHN VERNON, *Implementing Domain-Driven Design*)*

  Cada seção (habitação, renda, educação, saúde…) é atualizada **atomicamente como um VO
  inteiro** (`PUT` substitutivo + evento com diff `before/after`); os indicadores derivados
  (`FinancialAnalytics`, `HousingAnalytics`, `EducationAnalytics`, `FamilyAnalytics`) são
  Domain Services calculados na leitura (`computedAnalytics`) — nunca no frontend.

### Referral · RightsViolationReport · PlacementHistory (Protection)
- **Raízes**: `Referral` (`ReferralId`), `RightsViolationReport` (`ViolationReportId`), `PlacementHistory` · **Invariantes**:
  - `Referral.status`: `PENDING → COMPLETED` | `PENDING → CANCELLED` (únicas transições); `date ≤ now` (`REF-001`); `reason` obrigatório (`REF-002`); `destinationService ∈ {CRAS, CREAS, HEALTH_CARE, EDUCATION, LEGAL, OTHER}`.
  - `RightsViolationReport` é **imutável após criação** (audit trail); `descriptionOfFact` obrigatória (`VIO-002`); tipo de violação validado contra `dominio_tipo_violacao` (`VIO-001`).
  - `PlacementHistory`: `data_fim ≥ data_inicio` (`PLACE-001`); `thirdPartyGuardReport` exige ≥ 1 membro < 18 anos; `adolescentInInternment` exige ≥ 1 membro de 12–18 anos incompletos (`PLACE-002`).
- **Value Objects**: `ReferralId`, `ViolationReportId`, `RegistroAcolhimento`, `SituacoesEspecificas`, `AfastamentoConvivio`.
- **Justificativa do boundary do agregado** (citação obrigatória):
  > Limit the Aggregate to just the Root Entity and a minimal number of attributes and/or
  > Value-Typed properties. The correct minimum is the ones necessary, and no more. Which
  > ones are necessary? The simple answer is: those that must be consistent with others,
  > even if domain experts don't specify them as rules. Smaller Aggregates not only perform
  > and scale better, they are also biased toward transactional success.
  > — *(Linha 6244, p. 357–358, VAUGHN VERNON, *Implementing Domain-Driven Design*)*

  `Referral` e `RightsViolationReport` são agregados pequenos e independentes: cada um tem
  ciclo de vida e consistência próprios, referenciando o prontuário apenas por `PatientId`.

### SocialCareAppointment · IngressInfo (Care)
- **Raízes**: `SocialCareAppointment` (`AppointmentId`), `IngressInfo` · **Invariantes**:
  - `date ≤ now` em atendimento; `professionalId` válido.
  - `ingressTypeId` válido contra `dominio_tipo_ingresso`; `serviceReason` obrigatória.
- **Value Objects**: `AppointmentId`, `Diagnosis`, `ICDCode`, `ProgramLink`.
- **Justificativa do boundary do agregado** (citação obrigatória):
  > Prefer references to external Aggregates only by their globally unique identity, not by
  > holding a direct object reference (or "pointer"). Aggregates with inferred object
  > references are thus automatically smaller because references are never eagerly loaded.
  > The model can perform better because instances require less time to load and take less
  > memory.
  > — *(Linha 6291, p. 359–361, VAUGHN VERNON, *Implementing Domain-Driven Design*)*

  Atendimentos referenciam `ProfessionalId` e `PersonId` apenas por identidade — o cadastro
  de pessoas vive no contexto `people-context`, nunca embutido aqui.

## Eventos de domínio (outbox)

Mecanismo: **Transactional Outbox** (ADR-013/ADR-014 do `social-care`) — evento gravado na
mesma transação SQL do agregado, entregue at-least-once ao NATS JetStream
(`social-care.events.<EventType>`). ~18 tipos registrados em `DomainEventRegistry`.

| Evento (EN-passado) | Quando ocorre | Payload | Consumidor(es) cross-BC |
|---|---|---|---|
| `PatientCreatedEvent` | `RegisterPatientCommand` (status `waitlisted`) | patientId, personId, actorId, occurredAt | people-context, analysis-bi |
| `PatientAdmittedEvent` | Transição `waitlisted → active` | patientId, actorId, occurredAt | analysis-bi |
| `PatientDischargedEvent` | Transição `active → discharged` | patientId, reason, notes, dischargedAt, dischargedBy | analysis-bi |
| `PatientReadmittedEvent` | Transição `discharged → active` | patientId, actorId, occurredAt | analysis-bi |
| `PatientWithdrawnEvent` | Transição `waitlisted → withdrawn` | patientId, reason, notes, withdrawnAt, withdrawnBy | analysis-bi |
| `PatientPIIAnonymizedEvent` | Erasure LGPD (ADR-039) após `people.person.deleted` | patientId, personId, actorId, occurredAt | analysis-bi |
| `FamilyMemberAddedEvent` / `FamilyMemberRemovedEvent` | Mutação da composição familiar | patientId, memberId, relationship, actorId | analysis-bi |
| `PrimaryCaregiverAssignedEvent` | Designação de pessoa de referência | patientId, caregiverId, actorId | analysis-bi |
| `HousingConditionUpdatedEvent` … `PlacementHistoryUpdatedEvent` (8 eventos) | `PUT` substitutivo de seção de assessment | patientId, actorId, **before**, **after**, occurredAt | analysis-bi (anonimiza na ingestão, K=5) |
| `ReferralCreatedEvent` | `CreateReferralCommand` (status `PENDING`) | patientId, referralId, destinationService, status | analysis-bi |
| `RightsViolationReportedEvent` | `ReportRightsViolationCommand` | patientId, reportId, victimId, violationType | analysis-bi |
| `SocialCareAppointmentRegisteredEvent` | `RegisterAppointmentCommand` | patientId, appointmentId, professionalInChargeId, type | analysis-bi |
| `IngressInfoRecordedEvent` | `RegisterIntakeInfoCommand` | patientId, ingressTypeId, serviceReason | analysis-bi |
| `LookupItemCreatedEvent` / `LookupRequestApprovedEvent` (+4) | Administração de lookup tables | tableName, itemId, codigo, actorId | N/A (interno) |

## Mapa de contexto

- **Kernel** é **Shared Kernel** dos 5 contextos internos do `social-care` (VOs sem regra contextual).
- **Registry** é **upstream** de Assessment, Protection e Care: todos operam sobre `PatientId` e dependem do ciclo de vida do prontuário (não se avalia/encaminha paciente inexistente — `PAT-001`).
- **people-context** é **upstream (Customer/Supplier)** do Registry: `PersonId` valida existência via HTTP outbound com Bearer forwarding (`PeopleContextPersonValidator`, ADR-011/ADR-023 do `social-care`); o erasure LGPD chega como evento `people.person.deleted`.
- **analysis-bi** é **downstream (Conformist com anonimização)**: consome os ~18 eventos do outbox via NATS, aplica SHA-256 salgado + K-anonymity (K=5), nunca armazena PII.
- **web_02 (esta feature)** é **downstream com Anticorruption Layer**: o BFF Elysia (`server/adapters`) traduz os contratos HTTP (`StandardResponse`, `AppError`) para o Model do client — ver [`domain.fe.md`](./domain.fe.md) e [`adr.md`](./adr.md) ("Consumo da API social-care exclusivamente via BFF").
- Cross-BC **somente** via `public-api` (módulos do frontend) + **outbox/NATS** (backends) — nunca acesso direto a banco ou import interno ([ADR-0001](../../adr/0001-vertical-modular-architecture.md) + ADR-013/ADR-014 do `social-care`). Audit trail centralizado no `social-care` (ADR-008 do `web/handbook`).

## Referências

- Constituição web_02: [`../../../.specify/memory/constitution.md`](../../../.specify/memory/constitution.md)
- ADR-0001 Arquitetura vertical-modular: [`../../adr/0001-vertical-modular-architecture.md`](../../adr/0001-vertical-modular-architecture.md)
- ADR-0004 Split client × server (MVVM × DDD): [`../../adr/0004-client-server-split-mvvm-ddd.md`](../../adr/0004-client-server-split-mvvm-ddd.md)
- Índice de ADRs: [`../../adr/README.md`](../../adr/README.md)
- Modelo frontend (BFF + client): [`./domain.fe.md`](./domain.fe.md)
- Prontidão da API: [`./api-readiness.fe.md`](./api-readiness.fe.md)
- Descoberta core-api: [`./discovery.md`](./discovery.md)
- Descoberta frontend: [`./discovery.fe.md`](./discovery.fe.md)
- Métricas do contrato: [`./metrics.md`](./metrics.md)
- people-context (upstream): [`../people-context/domain.md`](../people-context/domain.md)
- analysis-bi (downstream): [`../analysis-bi/domain.md`](../analysis-bi/domain.md)
