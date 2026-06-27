# Relatório de Prontidão da API (core-api): Interface Web Social-Care

**Feature**: `web_02/handbook/doc/social-care/` (001-social-care-web) · **Emissor**: Arquitetura Frontend v2 · **Destinatário**: Time social-care (svc-social-care)

> Documento `-fe` específico do BFF Elysia. Como o browser **nunca** fala com o `social-care` direto
> (Princípio I da constituição — [`../../../.specify/memory/constitution.md`](../../../.specify/memory/constitution.md)),
> toda capacidade depende de um endpoint atrás de um handler Elysia (`*.query.fn.ts` /
> `*.service.fn.ts` — [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md)). Este relatório mapeia,
> por sub-domínio/capacidade, **o que a API já entrega** vs. **o que falta**, e define a **estratégia
> de integração progressiva**. Alimenta o [`plan.fe.md`](./plan.fe.md) (seção "Integração core-api")
> e os ADRs.

## 1. Resumo Executivo

A API do `social-care` está **majoritariamente pronta** para a feature: os 5 sub-domínios (Registry, Assessment, Protection, Care, Configuration) expõem todas as rotas de leitura e mutação de que o front precisa sob o prefixo **`/api/v1`**, com envelope `StandardResponse` (`{ data, meta: { timestamp } }`), paginação cursor-based, códigos de erro estruturados `{BC}-{SEQ}` e audit trail consultável. As lacunas são de **estabilização do contrato**, não de capacidade: **não há OpenAPI publicado** (a fonte de verdade do contrato é o código — `IO/HTTP/DTOs/RequestDTOs.swift` / `ResponseDTOs.swift`), não há `ETag`/`If-Match` (409 por `Patient.version` apenas), não há idempotência em mutações e não há upload de documentos. Dá para integrar real desde a Fase 1, com schemas TypeBox (`Elysia.t`) no BFF cobrindo a ausência de OpenAPI.

## 2. Matriz de Prontidão

| Sub-domínio / Capacidade | Endpoint (método rota) | Existe? | Contrato OK? | RBAC | Veredito |
|---|---|---|---|---|---|
| Registry — listar pacientes (busca, status, cursor, limit) | `GET /api/v1/patients` | ✅ | ✅ (`PatientSummaryResponse` + meta paginada) | worker, owner, admin | 🟢 PRONTO |
| Registry — prontuário completo | `GET /api/v1/patients/:patientId` | ✅ | ✅ (`PatientResponse` + `computedAnalytics`) | worker, owner, admin | 🟢 PRONTO |
| Registry — buscar por pessoa | `GET /api/v1/patients/by-person/:personId` | ✅ | ✅ (`PatientResponse`) | worker, owner, admin | 🟢 PRONTO |
| Registry — audit trail | `GET /api/v1/patients/:patientId/audit-trail` | ✅ | ✅ (`AuditTrailEntryResponse`, filtro `?eventType=`) | worker, owner, admin | 🟢 PRONTO |
| Registry — cadastrar paciente | `POST /api/v1/patients` | ✅ | ✅ (`RegisterPatientRequest` → `{ data: { id } }`) | worker | 🟢 PRONTO |
| Registry — adicionar membro familiar | `POST /api/v1/patients/:patientId/family-members` | ✅ | ✅ (`AddFamilyMemberRequest`) | worker | 🟢 PRONTO |
| Registry — remover membro familiar | `DELETE /api/v1/patients/:patientId/family-members/:memberId` | ✅ | ✅ (soft-delete `removed_at`) | worker | 🟢 PRONTO |
| Registry — cuidador primário | `PUT /api/v1/patients/:patientId/primary-caregiver` | ✅ | parcial (DTO não documentado fora do código) | worker | 🟡 PARCIAL |
| Registry — identidade social | `PUT /api/v1/patients/:patientId/social-identity` | ✅ | parcial (DTO `{ typeId, description? }` só no código) | worker | 🟡 PARCIAL |
| Registry — admitir | `POST /api/v1/patients/:patientId/admit` | ✅ | ✅ (erros ADM-001/002/003) | worker, admin | 🟢 PRONTO |
| Registry — desligar | `POST /api/v1/patients/:patientId/discharge` | ✅ | ✅ (`DischargePatientRequest`, DISC-001/007) | worker, admin | 🟢 PRONTO |
| Registry — readmitir | `POST /api/v1/patients/:patientId/readmit` | ✅ | ✅ (READM-005) | worker, admin | 🟢 PRONTO |
| Registry — retirar da fila | `POST /api/v1/patients/:patientId/withdraw` | ✅ | ✅ (`WithdrawPatientRequest`, WDR-001/003) | worker, admin | 🟢 PRONTO |
| Assessment — habitação | `PUT /api/v1/patients/:patientId/housing-condition` | ✅ | ✅ (`UpdateHousingConditionRequest`, 204) | worker | 🟢 PRONTO |
| Assessment — socioeconômico | `PUT /api/v1/patients/:patientId/socioeconomic-situation` | ✅ | ✅ (`UpdateSocioEconomicSituationRequest`, flags metadata) | worker | 🟢 PRONTO |
| Assessment — trabalho e renda (v2.0) | `PUT /api/v1/patients/:patientId/work-and-income` | ✅ | ✅ (`UpdateWorkAndIncomeRequest`) | worker | 🟢 PRONTO |
| Assessment — escolaridade (v2.0) | `PUT /api/v1/patients/:patientId/educational-status` | ✅ | ✅ (`UpdateEducationalStatusRequest`) | worker | 🟢 PRONTO |
| Assessment — saúde (v2.0) | `PUT /api/v1/patients/:patientId/health-status` | ✅ | ✅ (`UpdateHealthStatusRequest`, gestação 1–9) | worker | 🟢 PRONTO |
| Assessment — rede de apoio | `PUT /api/v1/patients/:patientId/community-support-network` | ✅ | ✅ (`UpdateCommunitySupportNetworkRequest`) | worker | 🟢 PRONTO |
| Assessment — resumo de saúde social | `PUT /api/v1/patients/:patientId/social-health-summary` | ✅ | ✅ (`UpdateSocialHealthSummaryRequest`) | worker | 🟢 PRONTO |
| Protection — acolhimento/afastamento | `PUT /api/v1/patients/:patientId/placement-history` | ✅ | ✅ (`UpdatePlacementHistoryRequest`, PLACE-001/002) | worker | 🟢 PRONTO |
| Protection — violação de direitos | `POST /api/v1/patients/:patientId/violation-reports` | ✅ | ✅ (`ReportRightsViolationRequest`, 201, VIO-001/002) | worker | 🟢 PRONTO |
| Protection — criar encaminhamento | `POST /api/v1/patients/:patientId/referrals` | ✅ | ✅ (`CreateReferralRequest`, 201, REF-001/002) | worker | 🟢 PRONTO |
| Protection — concluir/cancelar encaminhamento | `PUT/PATCH …/referrals/:referralId` | ❌ | — (transições PENDING→COMPLETED/CANCELLED existem no domínio, sem rota) | — | 🔴 AUSENTE |
| Care — registrar atendimento | `POST /api/v1/patients/:patientId/appointments` | ✅ | ✅ (`RegisterAppointmentRequest`, 201) | worker | 🟢 PRONTO |
| Care — info de ingresso/triagem | `PUT /api/v1/patients/:patientId/intake-info` | ✅ | ✅ (`RegisterIntakeInfoRequest`, 204) | worker | 🟢 PRONTO |
| Configuration — listar domínio | `GET /api/v1/dominios/:tableName` | ✅ | ✅ (`{ id, codigo, descricao }`; flags de metadata p/ benefícios) | worker, owner, admin | 🟢 PRONTO |
| Configuration — solicitar item de domínio | `POST /api/v1/dominios/requests` | ✅ | ✅ (`LookupRequest`) | worker, admin | 🟢 PRONTO |
| Configuration — listar solicitações | `GET /api/v1/dominios/requests` | ✅ | ✅ (próprias; todas se admin) | worker, owner, admin | 🟢 PRONTO |
| Configuration — admin de domínios (criar/editar/toggle/aprovar/rejeitar) | `POST/PUT/PATCH /api/v1/dominios/…` | ✅ | ✅ | admin | 🟡 PARCIAL (fora do MVP do front) |
| Concorrência otimista por header | `ETag` / `If-Match` | ❌ | — (`version` no body; 409 em conflito) | — | 🔴 AUSENTE |
| Upload de documentos | — | ❌ | — (`CNS.qrCode` é string; sem endpoint binário) | — | 🔴 AUSENTE |
| Contrato publicado | `GET /docs/json` (OpenAPI) | ❌ | — (fonte de verdade = `IO/HTTP/DTOs/*.swift`) | — | 🔴 AUSENTE |

## 3. Gaps por Sub-domínio

### Registry — 🟢 PRONTO (com 2 pontos 🟡)

- **Endpoints**: 13 rotas em `PatientController` (`social-care/Sources/social-care-s/IO/HTTP/Controllers/PatientController.swift`).
- **Contrato (request/response)**: `RegisterPatientRequest`, `AddFamilyMemberRequest`, `DischargePatientRequest`, `WithdrawPatientRequest`, `PatientResponse` (com `computedAnalytics`, `dischargeInfo`, `withdrawInfo`), `AuditTrailEntryResponse` — tudo em `IO/HTTP/DTOs/`. Datas ISO 8601; CPF/NIS sem máscara; paginação cursor base64 com `pageSize`/`totalCount`/`hasMore`/`nextCursor`.
- **Agregado/tabela**: agregado `Patient` (Migration001…007; `audit_trail` na 007; optimistic locking via `version` — ADR-005).
- **GAP**: DTOs de `PUT …/primary-caregiver` e `PUT …/social-identity` não estão documentados fora do código Swift; sem `ETag`/`If-Match` (409 só via `version` no body); o status `withdrawn` aparece no lifecycle mas não na lista documentada do filtro `?status=` (`waitlisted|active|discharged`) — confirmar se o filtro o aceita.
- **Estratégia front**: integrar direto; schemas TypeBox (`Elysia.t`) do BFF escritos a partir do código Swift e validando em runtime; 409 → recarga + reconciliação no client.

### Assessment — 🟢 PRONTO

- **Endpoints**: 7 rotas `PUT` em `AssessmentController` (resposta `204 No Content`).
- **Contrato (request/response)**: 7 DTOs `Update*Request` completos, incluindo blocos v2.0 (work-and-income, educational-status, health-status). Validações metadata-driven (`benefitTypeId` → `exigeCpfFalecido`/`exigeRegistroNascimento`) revalidadas no servidor (`MetadataValidator`).
- **Agregado/tabela**: VOs do agregado `PatientAssessment` (Migration004 — campos v2.0).
- **GAP**: respostas 204 não retornam o estado novo nem os analytics recalculados — o front precisa refazer `GET /patients/:patientId` após cada PUT (1 round-trip extra por salvamento).
- **Estratégia front**: integrar direto; invalidação do `createAsync` do paciente após cada mutação via ViewModel; `computedAnalytics` nunca recalculado no client.

### Protection — 🟡 PARCIAL

- **Endpoints**: `PUT …/placement-history`, `POST …/violation-reports`, `POST …/referrals` em `ProtectionController`.
- **Contrato (request/response)**: `CreateReferralRequest` (union `CRAS|CREAS|HEALTH_CARE|EDUCATION|LEGAL|OTHER`), `ReportRightsViolationRequest` (`descriptionOfFact` obrigatória; `exigeDescricao` por tipo), `UpdatePlacementHistoryRequest` (cross-checks de idade PLACE-001/002).
- **Agregado/tabela**: `Referral` (status PENDING/COMPLETED/CANCELLED), `RightsViolationReport` (imutável), `PlacementHistory`.
- **GAP**: **não há endpoint para transicionar o status do Referral** (PENDING→COMPLETED/CANCELLED), embora as transições existam no domínio — o front só consegue criar e exibir; violação de direitos é imutável (ok, by design), mas não há rota de leitura individual de referral/violação fora do `PatientResponse`.
- **Estratégia front**: integrar direto para criação; status de encaminhamento **somente leitura** (badge) até a rota de transição existir — ponto de troca é o `protection.repository.ts`, sem tocar UI/ViewModel.

### Care — 🟢 PRONTO

- **Endpoints**: `POST …/appointments` (201), `PUT …/intake-info` (204) em `CareController`.
- **Contrato (request/response)**: `RegisterAppointmentRequest` (date ≤ now, `professionalId`), `RegisterIntakeInfoRequest` (`ingressTypeId` LookupId, `serviceReason` obrigatório, `linkedSocialPrograms`).
- **Agregado/tabela**: `SocialCareAppointment`, `IngressInfo` no agregado Patient.
- **GAP**: atendimentos não têm edição/cancelamento (CRU sem update de appointment) — confirmar se é by design; sem paginação própria de appointments (vêm embutidos no `PatientResponse`, pode pesar em pacientes antigos).
- **Estratégia front**: integrar direto; timeline alimentada pelo `PatientResponse`.

### Configuration (Lookups) — 🟢 PRONTO (admin 🟡)

- **Endpoints**: `GET/POST /dominios/:tableName`, `PUT /dominios/:tableName/:itemId`, `PATCH …/toggle`, `GET/POST /dominios/requests`, `PUT /dominios/requests/:requestId/{approve|reject}` em `LookupController`.
- **Contrato (request/response)**: itens `{ id, codigo, descricao }` + metadata (`exigeRegistroNascimento`, `exigeCpfFalecido`, `exigeDescricao`); tabelas `dominio_parentesco`, `dominio_tipo_ingresso`, `dominio_tipo_beneficio`, `dominio_tipo_violacao`, `dominio_nivel_educacao`, `dominio_tipo_deficiencia`, `dominio_tipo_ocupacao`, `dominio_tipo_efeito_presenca_escolar`.
- **Agregado/tabela**: lookup tables (Migration003) + `LookupRequest`.
- **GAP**: param `?includeInactive=true` citado como comportamento esperado para admin mas não confirmado na rota; metadata flags precisam vir no `GET /dominios/:tableName` (confirmar serialização) para o front montar campos condicionais sem chamada extra.
- **Estratégia front**: integrar direto com cache longo no `createAsync` do SolidStart (domínios mudam raramente); telas de administração de domínio ficam fora do MVP (worker usa apenas `POST /dominios/requests`).

### Transversal (contrato/infra) — 🔴 AUSENTE

- **Endpoints**: não há `GET /docs/json` (OpenAPI); não há `ETag`/`If-Match`; não há `idempotencyKey` em mutações; não há upload binário.
- **GAP**: sem OpenAPI o contrato pode divergir silenciosamente; sem idempotência, retry de mutação POST pode duplicar atendimento/encaminhamento.
- **Estratégia front**: schemas TypeBox (`Elysia.t`) versionados no BFF como contrato executável (falha ruidosa em divergência — MF-001 de [`metrics.md`](./metrics.md)); mutações POST sem retry automático no handler; upload fora de escopo.

## 4. Estratégia de Integração Progressiva

| Sub-domínio | Fase 1 (agora) | Quando o backend evoluir |
|---|---|---|
| Registry | integra real (todas as 13 rotas) | adotar `ETag`/`If-Match` no `social-care.client.ts` quando existir — UI/ViewModel intocados |
| Assessment | integra real (7 PUTs + re-fetch do prontuário via `createAsync`) | se o PUT passar a retornar estado novo, remover re-fetch no `assessment.repository.ts` |
| Protection | integra real para criação; status de referral somente leitura | ligar ações "Concluir/Cancelar encaminhamento" quando a rota de transição existir (troca só no `protection.repository.ts`) |
| Care | integra real | paginação dedicada de appointments, se criada, entra no repository |
| Configuration | integra real (`GET /dominios/:tableName` + `POST /dominios/requests`) | telas admin completas quando priorizadas; `?includeInactive` quando confirmado |
| Contrato (OpenAPI) | TypeBox (`Elysia.t`) no BFF como contrato executável | gerar schemas a partir do OpenAPI publicado e diffar contra os TypeBox existentes |

> Decisão registrada como ADR ([`adr.md`](./adr.md) — "integração real + contrato executável em TypeBox; referral read-only"). O ponto de troca é o **repository** (`client/data`) ou o **client social-care** (`server/adapters/social-care.client.ts`) — a UI e o ViewModel não mudam. Integração progressiva sem mocks ([ADR-0011](../../adr/0011-no-mocks-in-production.md)): endpoints não prontos retornam `'not-implemented'` como `Result`.

## 5. Pedidos ao Time core-api (priorizados)

- **P1**: Publicar **OpenAPI** (`GET /docs/json` ou artefato versionado no repo) cobrindo todos os DTOs de `IO/HTTP/DTOs/` — hoje o contrato dos endpoints `primary-caregiver` e `social-identity` só existe no código Swift.
- **P1**: Endpoint de **transição de status do Referral** (`PENDING → COMPLETED | CANCELLED`) — as transições já existem no domínio (REF-003 para not found), falta a rota; bloqueia o fluxo completo de encaminhamento na US3.
- **P2**: **`ETag`/`If-Match`** sobre `Patient.version` (já previsto na visão do serviço) para concorrência otimista padronizada em vez de 409 ad-hoc.
- **P2**: Confirmar/expor filtro `?status=withdrawn` em `GET /patients` e o param `?includeInactive=true` em `GET /dominios/:tableName`.
- **P2**: `idempotencyKey` nas mutações POST (appointments, referrals, violation-reports) para retry seguro.
- **P3**: Upload de documentos (S3/blob + signed URL) para materializar `requiredDocuments` além de strings.

## Referências

- Constituição web_02: [`../../../.specify/memory/constitution.md`](../../../.specify/memory/constitution.md)
- ADR-0004 Split client × server (MVVM × DDD): [`../../adr/0004-client-server-split-mvvm-ddd.md`](../../adr/0004-client-server-split-mvvm-ddd.md)
- ADR-0010 BFF orquestrador / nomenclatura fn: [`../../adr/0010-bff-orchestration-fn-naming.md`](../../adr/0010-bff-orchestration-fn-naming.md)
- ADR-0011 No mocks em produção: [`../../adr/0011-no-mocks-in-production.md`](../../adr/0011-no-mocks-in-production.md)
- Índice de ADRs: [`../../adr/README.md`](../../adr/README.md)
- ADR de feature — consumo via BFF: [`./adr.md`](./adr.md)
- ADR de feature — mapeamento de erros: [`./adr.fe.md`](./adr.fe.md)
- Domínio frontend (ViewModel, Model): [`./domain.fe.md`](./domain.fe.md)
- Domínio core-api: [`./domain.md`](./domain.md)
- Métricas do contrato: [`./metrics.md`](./metrics.md)
- Métricas frontend: [`./metrics.fe.md`](./metrics.fe.md)
- Elysia (BFF): [`../../reference/framework/elysia/`](../../reference/framework/elysia/)
- Bun (runtime): [`../../reference/runtime/bun/`](../../reference/runtime/bun/)
