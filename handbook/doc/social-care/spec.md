# Feature Specification: Atendimento Socioassistencial — Web (contrato core-api · `svc-social-care`)

**Feature Branch**: `001-social-care-web`

**Created**: 2026-06-12

**Status**: Draft

**Input**: User description: "Interface web para o atendimento socioassistencial de pacientes de doenças raras, consumindo o serviço `social-care` (fonte de verdade) via BFF Elysia. Esta spec define o contrato da API que o front consome; a spec da interface está em [spec.fe.md](./spec.fe.md)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Prontuário do paciente (Registry) (Priority: P1)

A assistente social registra um novo paciente (titular com doença rara) informando dados pessoais, documentos civis (CPF, NIS, RG, CNS), endereço, diagnósticos CID e identidade social. Em seguida consulta o prontuário completo, mantém a composição familiar (adicionar/remover membros, designar pessoa de referência) e acompanha o histórico auditado de mudanças.

**Why this priority**: O agregado `Patient` é a raiz de todo o domínio — avaliação, cuidado e proteção pendem dele. Sem este contrato funcionando, nenhuma outra jornada existe.

**Independent Test**: Pode ser testado integralmente com `POST /api/v1/patients` → `GET /api/v1/patients/:patientId` → `POST /patients/:patientId/family-members` → `GET /patients/:patientId/audit-trail`, entregando um prontuário consultável com trilha de auditoria.

**Acceptance Scenarios**:

1. **Given** um `personId` válido no people-context, **When** o consumidor envia `POST /api/v1/patients` com `personalData`, `civilDocuments` e `address` válidos, **Then** o serviço responde `201` com `{ data: { id }, meta: { timestamp } }` e o paciente nasce em status `waitlisted`.
2. **Given** um `patientId` existente, **When** o consumidor faz `GET /api/v1/patients/:patientId`, **Then** recebe o agregado completo (`PatientResponse`) incluindo `familyMembers`, `diagnoses`, seções de avaliação e `computedAnalytics`.
3. **Given** uma família já com pessoa de referência designada, **When** o consumidor designa outra via `PUT /patients/:patientId/primary-caregiver`, **Then** a designação anterior é substituída — nunca há duas ativas.
4. **Given** um CPF com dígito verificador inválido no payload, **When** o registro é submetido, **Then** o serviço responde `400` com erro estruturado de validação (envelope `{ error: { code, message } }`).
5. **Given** um `patientId` inexistente, **When** consultado, **Then** o serviço responde `404 PAT-001`.

---

### User Story 2 - Avaliação socioeconômica (Assessment) (Priority: P2)

A assistente social atualiza, seção a seção, a avaliação socioeconômica da família: condição habitacional, situação socioeconômica (renda e benefícios), trabalho e renda por membro, escolaridade, saúde/deficiências, rede de apoio comunitário e resumo de saúde social. Cada atualização gera evento com diff `before/after` e alimenta os indicadores calculados.

**Why this priority**: É o coração do parecer técnico e dos indicadores de vulnerabilidade, mas pressupõe o prontuário (P1) existente.

**Independent Test**: Com um paciente criado por fixture, cada um dos 7 `PUT`s do `AssessmentController` pode ser exercitado isoladamente verificando `204`, entrada no audit trail e recálculo de `computedAnalytics` no `GET` subsequente.

**Acceptance Scenarios**:

1. **Given** um prontuário existente, **When** o consumidor envia `PUT /patients/:patientId/housing-condition` válido, **Then** recebe `204 No Content` e o audit trail registra `HousingConditionUpdated` com `before/after`.
2. **Given** uma família com 5 membros e 1 dormitório, **When** a condição habitacional é salva, **Then** `GET /patients/:patientId` retorna `computedAnalytics.housing.density = 5.0` e `isOvercrowded = true`.
3. **Given** um benefício cujo tipo (`benefitTypeId`) tem metadata `exigeCpfFalecido = true`, **When** o payload omite `deceasedCpf`, **Then** o serviço responde `400` (validação metadata-driven em `MetadataValidator`).
4. **Given** uma gestação informada para membro fora da faixa etária válida, **When** `PUT /patients/:patientId/health-status` é enviado, **Then** o serviço responde `400 HEALTH-001`.
5. **Given** renda negativa em `totalFamilyIncome`, **When** submetida, **Then** o serviço responde `400 SOCIO-001`.

---

### User Story 3 - Cuidado e ciclo de vida (Care + lifecycle) (Priority: P3)

A equipe registra informações de ingresso/triagem (`intake-info`) e atendimentos realizados (`appointments`), e opera o ciclo de vida do paciente: admitir da lista de espera, desligar com motivo, readmitir e retirar da fila.

**Why this priority**: Documenta a trajetória de cuidado e o fluxo da fila, mas depende de prontuário e avaliação já operantes.

**Independent Test**: Com paciente em `waitlisted`, exercitar `POST .../admit`, `POST .../appointments`, `PUT .../intake-info` e `POST .../discharge`, verificando transições de status e erros `409` nas transições inválidas.

**Acceptance Scenarios**:

1. **Given** paciente `waitlisted`, **When** `POST /patients/:patientId/admit`, **Then** status transita para `active` e `PatientAdmittedEvent` é emitido via Outbox.
2. **Given** paciente `waitlisted`, **When** `POST /patients/:patientId/discharge`, **Then** o serviço responde `409 DISC-007` (desligamento exige paciente ativo; usar withdraw).
3. **Given** `reason = "other"` num desligamento sem `notes`, **When** submetido, **Then** o serviço responde `400` (notes obrigatório, máx. 1000 chars).
4. **Given** um atendimento com `date` no futuro, **When** `POST /patients/:patientId/appointments`, **Then** o serviço responde `400` (regra `date ≤ now`).

---

### User Story 4 - Medidas de proteção (Protection) (Priority: P3)

A assistente social cria encaminhamentos para a rede (CRAS, CREAS, saúde, educação, jurídico), registra relatórios de violação de direitos (imutáveis após criação) e mantém o histórico de acolhimento/afastamento do convívio familiar com validações cruzadas de idade.

**Why this priority**: Fluxo sensível e obrigatório por compliance, porém menos frequente que cadastro e avaliação.

**Independent Test**: Com paciente e membros por fixture, exercitar `POST .../referrals`, `POST .../violation-reports` e `PUT .../placement-history`, validando códigos `REF-*`, `VIO-*` e `PLACE-*`.

**Acceptance Scenarios**:

1. **Given** um membro vítima e tipo de violação válido em `dominio_tipo_violacao`, **When** `POST /patients/:patientId/violation-reports` com `descriptionOfFact`, **Then** o serviço responde `201` com id e o relatório torna-se imutável.
2. **Given** payload sem `descriptionOfFact`, **When** submetido, **Then** o serviço responde `400 VIO-002`.
3. **Given** `separationChecklist.adolescentInInternment = true` numa família sem membro de 12–18 anos incompletos, **When** `PUT /patients/:patientId/placement-history`, **Then** o serviço responde `400 PLACE-002`.
4. **Given** um encaminhamento com `date` futura, **When** submetido, **Then** o serviço responde `400 REF-001`.

---

### Edge Cases

- Dois usuários editam o mesmo prontuário: o segundo `PUT` com `version` divergente recebe `409` (optimistic locking, ADR-005) — o consumidor deve recarregar e reconciliar.
- Prontuário anonimizado por LGPD (`PatientPIIAnonymizedEvent`): `GET` retorna agregado sem `personalData`/`civilDocuments`/`address`, preservando histórico clínico e audit trail; mutações de assessment são rejeitadas.
- Paginação: `limit > 100` é rejeitado; `cursor` inválido (base64 corrompido) retorna `400`; última página retorna `hasMore = false` e `nextCursor` ausente.
- Lookup table desconhecida em `GET /dominios/:tableName` → `404 LOOKUP-001`; item duplicado na criação → `409 LOOKUP-002`.
- Token expirado ou audience errada → `401`; role insuficiente (ex.: `owner` tentando `POST /patients`) → `403` (`SECURITY_BOUNDARY_VIOLATION`).
- `people-context` indisponível durante validação de `personId` no registro → erro categoria `EXTERNALAPI_FAILURE` com status 5xx; o consumidor (BFF Elysia) deve tratar como falha recuperável e devolver `AppError` estruturado ao client.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O serviço MUST expor registro e consulta de prontuário em `/api/v1`: `POST /patients`, `GET /patients` (paginado por cursor com `search`/`status`/`limit`), `GET /patients/:patientId`, `GET /patients/by-person/:personId`.
- **FR-002**: O serviço MUST validar documentos civis na borda (CPF com dígito verificador, NIS 11 dígitos, CEP `12345-678`, CNS) e responder `400` com erro estruturado em payload inválido.
- **FR-003**: O serviço MUST manter composição familiar: `POST /patients/:patientId/family-members`, `DELETE .../family-members/:memberId` (soft-delete via `removed_at`), `PUT .../primary-caregiver` com invariante de pessoa de referência única.
- **FR-004**: O serviço MUST aceitar as 7 atualizações de avaliação (`housing-condition`, `socioeconomic-situation`, `work-and-income`, `educational-status`, `health-status`, `community-support-network`, `social-health-summary`) com resposta `204` e auditoria `before/after`.
- **FR-005**: O serviço MUST aplicar a máquina de estados `PatientStatus` (`waitlisted → active → discharged`; `withdraw` só de `waitlisted`; `readmit` só de `discharged`) respondendo `409` com códigos `ADM-00x`/`DISC-00x`/`WDR-00x`/`READM-00x` em transição inválida.
- **FR-006**: O serviço MUST registrar medidas de proteção: `POST .../referrals` (status inicial `PENDING`), `POST .../violation-reports` (imutável) e `PUT .../placement-history` (validações cruzadas de idade).
- **FR-007**: O serviço MUST registrar cuidado: `POST .../appointments` e `PUT .../intake-info` (com `ingressTypeId` validado contra `dominio_tipo_ingresso` e `serviceReason` obrigatório).
- **FR-008**: O serviço MUST servir lookup tables em `GET /dominios/:tableName` (itens ativos com `id`/`codigo`/`descricao`) e o fluxo de governança (`POST /dominios/:tableName`, `PATCH .../toggle`, `POST/PUT /dominios/requests/...`) restrito por RBAC.
- **FR-009**: O serviço MUST expor audit trail por paciente (`GET /patients/:patientId/audit-trail?eventType=…`) com `actorId` derivado exclusivamente de `JWT.sub` — nunca de header customizado.
- **FR-010**: O serviço MUST retornar `computedAnalytics` (densidade habitacional, RTF/RPC, perfil etário, vulnerabilidades educacionais) no `GET` do prontuário; consumidores não recalculam.
- **FR-011**: Todas as respostas MUST usar o envelope `{ data, meta: { timestamp } }` (com `pageSize`/`totalCount`/`hasMore`/`nextCursor` em listagens) e erros o envelope `{ error: { code, message } }` com código `{BC}-{SEQ}`.
- **FR-012**: Toda mutação MUST emitir evento de domínio via Transactional Outbox (at-least-once para NATS JetStream) e entrada correspondente no audit trail.
- **FR-013**: O serviço MUST autenticar via OIDC (Bearer JWT validado contra JWKS, multi-issuer Authentik/Zitadel — ADR-027/031) e autorizar por role (`worker`, `owner`, `admin`) conforme a matriz por rota.
- **FR-014**: Datas MUST trafegar em ISO 8601 com timezone; identificadores como UUID v4 em string; CPF/NIS como dígitos sem formatação.

### Key Entities

- **Patient (prontuário)**: agregado raiz do Registry — titular com doença rara; `status`, `version` (optimistic locking), dados pessoais, documentos civis, endereço, diagnósticos, seções de avaliação, atendimentos, encaminhamentos, violações.
- **FamilyMember**: membro do núcleo familiar — parentesco (lookup `dominio_parentesco`), residência conjunta, cuidador, deficiência, documentos pendentes, data de nascimento.
- **Seções de avaliação (VOs)**: `HousingCondition`, `SocioEconomicSituation`, `WorkAndIncome`, `EducationalStatus`, `HealthStatus`, `CommunitySupportNetwork`, `SocialHealthSummary` — atualizadas por inteiro, auditadas com diff.
- **Referral (encaminhamento)**: destino na rede (CRAS/CREAS/HEALTH_CARE/EDUCATION/LEGAL/OTHER), justificativa, status `PENDING → COMPLETED | CANCELLED`.
- **RightsViolationReport (relatório de violação)**: vítima, tipo (lookup `dominio_tipo_violacao`), descrição do fato; imutável após criação.
- **PlacementHistory (acolhimento/afastamento)**: registros por membro, situações coletivas, checklist de separação com validações cruzadas de idade.
- **SocialCareAppointment (atendimento)** e **IngressInfo (ingresso/triagem)**: registro da trajetória de cuidado.
- **LookupItem / LookupRequest**: itens de domínio dinâmicos com metadata flags e fluxo de solicitação/aprovação.
- **AuditTrailEntry**: evento, ator (`JWT.sub`), instante, `before/after`, endpoint.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das jornadas do front (cadastro, prontuário, avaliação, ciclo de vida, proteção, cuidado, lookups, audit) são atendidas pelo contrato existente sem nova rota — confirmado no [api-readiness.fe.md](./api-readiness.fe.md).
- **SC-002**: Toda mutação aparece no audit trail do paciente em até 1 s após o `2xx`, com `actorId` correto.
- **SC-003**: `GET /patients/:patientId` (agregado completo + analytics) responde em p95 < 500 ms na VPS BV com até 1.000 prontuários.
- **SC-004**: 100% das respostas de erro carregam código estruturado mapeável a mensagem i18n no front (zero erros "genéricos" sem código).
- **SC-005**: Zero transições de status inválidas persistidas (toda tentativa inválida responde `409` e não altera estado).

## Impacto Arquitetural (core-api) *(obrigatório se a feature toca `src/`)*

- **Bounded Contexts afetados**: [x] Registry · [x] Assessment · [x] Protection · [x] Care · [x] Configuration (somente **consumo do contrato existente** — leitura/escrita via rotas já publicadas; nenhum BC é modificado)
  - ⚠️ A feature atravessa todos os BCs porque é a interface da plataforma — justificado: não há acoplamento novo, apenas consumo HTTP do contrato público via BFF Elysia.
- **Novos agregados / Value Objects?**: Nenhum. O domínio (`Patient`, `Referral`, `RightsViolationReport`, VOs do Kernel) permanece intacto.
- **Novos eventos de domínio (outbox)?**: Nenhum. Os ~18 eventos existentes (`PatientCreatedEvent`, `HousingConditionUpdatedEvent`, `ReferralCreatedEvent`, …) cobrem todas as mutações desta feature.
- **Novos subcomandos de CLI?**: N/A — o serviço é HTTP-first (Vapor); não há CLI de produto.
- **Borda HTTP envolvida?**: Sim — exclusivamente as rotas já existentes de `/api/v1` (controllers `Patient`, `Assessment`, `Protection`, `Care`, `Lookup`, `Health`). Nenhuma rota nova.
- **Possíveis violações da constituição (I–VI)?**: Nenhuma identificada. Riscos a vigiar no [plan.md](./plan.md): pressão do front por endpoints "compostos" (negar — composição é papel do BFF Elysia — [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md)) e exposição de `ETag/If-Match` para locking otimista (exigiria ADR no `social-care`).

## Assumptions

- O `svc-social-care` está implantado e saudável na VPS BV (`/health`, `/ready`) antes do desenvolvimento do front; ambiente local segue a orquestração de dev do root.
- O IdP-alvo é Authentik (`auth.acdg-bv.org.br`); tokens Zitadel só durante a janela de migração (multi-issuer já suportado).
- `personId` é obtido previamente via `people-context`; esta feature não cria pessoas.
- As lookup tables seed (`dominio_parentesco`, `dominio_tipo_ingresso`, `dominio_tipo_beneficio`, `dominio_tipo_violacao`, …) estão populadas na instância BV.
- Não há requisito de idempotency key nesta fase; reentrância é mitigada na UI (ver [spec.fe.md](./spec.fe.md)) e por optimistic locking.
- Volume BV é de centenas (não milhares) de prontuários ativos; cursor pagination com `limit ≤ 100` é suficiente.

## Referências

- **Constituição web_02**: [../../../.specify/memory/constitution.md](../../../.specify/memory/constitution.md)
- **ADRs**: [../../adr/README.md](../../adr/README.md)
  - [ADR-0002](../../adr/0002-errors-as-values.md) · [ADR-0003](../../adr/0003-bun-supply-chain.md) · [ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md)
  - [ADR-0005](../../adr/0005-auth-session-refresh-decisions.md) · [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md)
- **Spec frontend**: [spec.fe.md](./spec.fe.md)
- **Plans**: [plan.md](./plan.md) · [plan.fe.md](./plan.fe.md)
- **Prontidão**: [api-readiness.fe.md](./api-readiness.fe.md)
- **Domínio**: [domain.fe.md](./domain.fe.md)
- **Integração cross-service**: [../README.md](../README.md)
- **Outros serviços**: [../people-context/spec.md](../people-context/spec.md) · [../analysis-bi/spec.md](../analysis-bi/spec.md)
- **Docs offline (backend)**:
  - `../../reference/framework/elysia/` (TypeBox `Elysia.t`, Eden treaty)
  - `../../reference/runtime/bun/` (Bun: `bun:test`)
