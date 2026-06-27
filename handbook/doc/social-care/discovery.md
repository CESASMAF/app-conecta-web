# Descoberta: Atendimento Socioassistencial — Web (visão core-api · `svc-social-care`)

**Feature**: `specs/001-social-care-web/` · **Consultor**: `/acdg-skills:requirements-engineer`

> Fase 0 da pipeline `core-api-sdd`. Elicitação ancorada em Gerenciamento de Requisitos
> (Moraes & Lopes) + Histórias de Usuário. Saída alimenta a SPEC (fase 1 — [`domain.md`](./domain.md)).
> Esta é a visão **CORE-API**: o serviço `social-care` (Swift 6.3 · Vapor · CQRS+ES+Outbox)
> como fonte de verdade do atendimento socioassistencial. A visão de interface está em
> [`discovery.fe.md`](./discovery.fe.md).

## Problema / Oportunidade

A associação ACDG-BV (Boa Vista/RR) acompanha pacientes de doenças raras e suas famílias, mas o registro socioassistencial hoje depende de fichas em papel e planilhas dispersas — sem trilha de auditoria, sem histórico de mudanças e sem indicadores confiáveis de vulnerabilidade (renda per capita, densidade habitacional, evasão escolar). O serviço `social-care` já implementa o domínio completo (prontuário, composição familiar, avaliação socioeconômica, proteção, atendimentos), porém seu contrato HTTP ainda não é consumido por nenhuma interface. Esta feature consolida esse contrato como base estável para a interface web (`001-social-care-web`), permitindo que assistentes sociais operem o prontuário digital de ponta a ponta.

## Stakeholders

| Stakeholder | Interesse / o que espera | Decisor? |
|---|---|---|
| Assistente social (`worker`) | Registrar prontuário, família, avaliações, atendimentos e encaminhamentos sem fricção | não |
| Administrador da associação (`admin`) | Gerir lookup tables (`dominios`), aprovar solicitações, operar ciclo de vida (admit/discharge) | sim |
| Supervisor / gestor (`owner`) | Consultar prontuários e audit trail (leitura) para supervisão técnica | não |
| DPO / compliance LGPD | Audit trail completo, anonimização de PII (ADR-039), minimização de dados | sim |
| Equipe web (consumidora do contrato) | Contrato HTTP estável, envelope `{ data, meta }`, erros estruturados (`PAT-XXX`) | não |
| Paciente e família | Beneficiários indiretos: atendimento contínuo e protegido | não |

## Histórias de usuário (INVEST)

- **US-001** (P1): Como assistente social, quero registrar e consultar o prontuário do paciente (titular, documentos civis, endereço, diagnósticos CID), para ter a fonte de verdade do caso.
  - **Valor / prioridade**: P1 — sem prontuário (`Patient`) nenhum outro fluxo existe; é a raiz do agregado.
  - **Critérios de aceitação** (viram BDD na fase 6): dado um `personId` válido no people-context, quando envio `POST /api/v1/patients` com `personalData`, `civilDocuments` (CPF/NIS/RG/CNS) e `address`, então recebo `201` com `{ data: { id } }` e o paciente nasce em status `waitlisted`; dado um `patientId` existente, quando consulto `GET /api/v1/patients/:patientId`, então recebo o agregado completo com `computedAnalytics`.
- **US-002** (P1): Como assistente social, quero manter a composição familiar (adicionar/remover membros, designar pessoa de referência), para refletir o núcleo familiar real.
  - **Valor / prioridade**: P1 — analytics (RPC, densidade, perfil etário) dependem dos membros.
  - **Critérios de aceitação**: dado um prontuário ativo, quando envio `POST /patients/:patientId/family-members` com `relationship` válida contra `dominio_parentesco`, então o membro é incluído e `FamilyMemberAddedEvent` é emitido; dado dois cuidadores candidatos, quando designo o segundo via `PUT /patients/:patientId/primary-caregiver`, então apenas um cuidador primário permanece ativo (invariante: máx. 1 por família).
- **US-003** (P2): Como assistente social, quero atualizar as seções da avaliação socioeconômica (habitação, renda, trabalho, educação, saúde, rede de apoio), para fundamentar o parecer técnico.
  - **Valor / prioridade**: P2 — depende do prontuário existir; alimenta os indicadores de vulnerabilidade.
  - **Critérios de aceitação**: dado um prontuário, quando envio `PUT /patients/:patientId/housing-condition`, então recebo `204` e o audit trail guarda `before/after`; dado um benefício cujo metadata exige `exigeCpfFalecido`, quando omito `deceasedCpf`, então recebo `400` com código de validação.
- **US-004** (P2): Como administrador, quero operar o ciclo de vida do paciente (admit, discharge, readmit, withdraw), para controlar lista de espera e desligamentos.
  - **Valor / prioridade**: P2 — máquina de estados `waitlisted → active → discharged` é regra central do serviço.
  - **Critérios de aceitação**: dado paciente `waitlisted`, quando `POST /patients/:patientId/admit`, então status vira `active`; dado paciente `waitlisted`, quando tento `discharge`, então recebo `409 DISC-007` (usar withdraw).
- **US-005** (P3): Como assistente social, quero registrar atendimentos (`appointments`) e informações de ingresso (`intake-info`), para documentar a trajetória de cuidado.
  - **Valor / prioridade**: P3 — agrega histórico, mas pressupõe prontuário e avaliação.
  - **Critérios de aceitação**: dado um prontuário, quando `POST /patients/:patientId/appointments` com `date ≤ now`, então recebo `201` com id do atendimento.
- **US-006** (P3): Como assistente social, quero registrar encaminhamentos (CRAS/CREAS/saúde), violações de direitos e histórico de acolhimento, para acionar medidas de proteção.
  - **Valor / prioridade**: P3 — fluxo sensível, porém menos frequente que cadastro/avaliação.
  - **Critérios de aceitação**: dado um membro vítima, quando `POST /patients/:patientId/violation-reports` sem `descriptionOfFact`, então recebo `400 VIO-002`; dado `adolescentInInternment = true` sem membro 12–18 anos, então recebo `400 PLACE-002`.
- **US-007** (P3): Como administrador, quero gerir lookup tables e aprovar solicitações de novos itens, para manter os domínios dinâmicos sem deploy.
  - **Valor / prioridade**: P3 — habilita todos os selects do front, mas tem fallback (itens seed).
  - **Critérios de aceitação**: dado uma solicitação `pendente`, quando `PUT /dominios/requests/:requestId/approve`, então o item passa a constar em `GET /dominios/:tableName`.

## Requisitos

### Funcionais
- **RF-001**: O sistema DEVE expor CRU do prontuário (`POST/GET /api/v1/patients`, `GET /patients/:patientId`, `GET /patients/by-person/:personId`) — sem DELETE físico.
- **RF-002**: O sistema DEVE manter composição familiar com soft-delete (`removed_at`) e invariante de cuidador primário único.
- **RF-003**: O sistema DEVE aceitar atualizações por seção da avaliação socioeconômica (7 `PUT`s do `AssessmentController`) retornando `204` e auditando `before/after`.
- **RF-004**: O sistema DEVE aplicar a máquina de estados `PatientStatus` com erros estruturados nas transições inválidas (`ADM-003`, `DISC-007`, `WDR-003`, `READM-005`).
- **RF-005**: O sistema DEVE registrar encaminhamentos (`Referral`: PENDING→COMPLETED/CANCELLED), violações de direitos (imutáveis) e placement history com validações cruzadas de idade.
- **RF-006**: O sistema DEVE servir lookup tables (`GET /dominios/:tableName`) com metadata flags (`exigeCpfFalecido`, `exigeRegistroNascimento`, `exigeDescricao`) e fluxo de solicitação/aprovação.
- **RF-007**: O sistema DEVE expor audit trail por paciente (`GET /patients/:patientId/audit-trail?eventType=…`) com `actorId` derivado de `JWT.sub`.
- **RF-008**: O sistema DEVE retornar `computedAnalytics` (densidade habitacional, RPC, perfil etário, vulnerabilidades educacionais) no `GET` do prontuário — o consumidor não recalcula.
- **RF-009**: O sistema DEVE paginar listagens por cursor (`?search&status&cursor&limit≤100`) com `meta.hasMore`/`meta.nextCursor`.

### Não-funcionais (viram métricas na fase 4 — ver [`metrics.md`](./metrics.md))
- **RNF-001**: Segurança — toda rota (exceto `/health`, `/ready`) exige `Authorization: Bearer <jwt>` OIDC (Authentik; multi-issuer com Zitadel durante migração, ADR-027/031) + RBAC (`worker`/`owner`/`admin`).
- **RNF-002**: Auditoria — 100% das mutações geram entrada em `audit_trail` e evento via Transactional Outbox (at-least-once para NATS).
- **RNF-003**: Consistência — optimistic locking via `Patient.version` (ADR-005); conflito responde `409` e o consumidor recarrega.
- **RNF-004**: Performance — `GET /patients/:patientId` (agregado completo + analytics) responde em p95 < 500 ms na VPS BV.
- **RNF-005**: LGPD — anonimização de PII (`PatientPIIAnonymizedEvent`, ADR-039) preserva histórico clínico/social e audit trail sem dados pessoais.

## Restrições e premissas

- Serviço existente: Swift 6.3 · Vapor 4 · PostgreSQL · CQRS + Event Sourcing + Transactional Outbox → NATS JetStream; **a feature consome o contrato, não altera o domínio**.
- Envelope obrigatório `{ data, meta: { timestamp } }`; erros estruturados `{BC}-{SEQ}` (ex.: `PAT-001`, `VIO-002`).
- Padrão CRU: nenhuma exclusão física; inativação via `removed_at` / `ativo`.
- Sem upload de binários no contrato atual (`CNS.qrCode` é string); sem idempotency key em comandos.
- Identidade de pessoa (`personId`) vem do `people-context`; o `social-care` valida via Bearer forwarding (ADR-011/023).
- Premissa: a instância BV usa **Authentik** como IdP-alvo (`auth.acdg-bv.org.br`); Zitadel apenas legado.

## Fora de escopo

- Indicadores agregados/anonimizados (responsabilidade do `analysis-bi`, consumidor NATS).
- Cadastro e deduplicação de pessoas (responsabilidade do `people-context`).
- Upload/gestão de documentos digitalizados (estratégia futura de blob storage).
- Notificações (e-mail/push) e agendamento de atendimentos futuros (só registro retroativo, `date ≤ now`).
- Qualquer mudança de schema, evento novo ou rota nova no `social-care`.

## Rastreabilidade (inicial)

| Requisito | História | Critério → BDD | Teste (TDD) |
|---|---|---|---|
| RF-001 | US-001 | Registro retorna `201` + id; GET devolve agregado completo | a definir na fase 7 (`tasks.md`) |
| RF-002 | US-002 | Segundo cuidador primário substitui o primeiro | a definir |
| RF-003 | US-003 | `PUT housing-condition` → `204` + audit `before/after` | a definir |
| RF-004 | US-004 | `discharge` em `waitlisted` → `409 DISC-007` | a definir |
| RF-005 | US-006 | Violação sem descrição → `400 VIO-002` | a definir |
| RF-006 | US-007 | Item aprovado aparece no `GET /dominios/:tableName` | a definir |
| RF-007 | US-001 | Audit trail filtrável por `eventType` | a definir |

## Perguntas em aberto

- [ ] [NEEDS CLARIFICATION: o contrato exporá `ETag`/`If-Match` para optimistic locking na web, ou o front seguirá apenas com `version` no payload e tratamento de `409`?] → resolver na fase de clarificação (`/speckit-clarify`).
- [ ] [NEEDS CLARIFICATION: escopo final da role `owner` — apenas leitura de prontuário/audit ou também leitura de solicitações de lookup?]
- [ ] [NEEDS CLARIFICATION: `?includeInactive=true` em lookups está habilitado para `admin` na instância BV?]

## Referências

- Constituição web_02: [`../../../.specify/memory/constitution.md`](../../../.specify/memory/constitution.md)
- Índice de ADRs: [`../../adr/README.md`](../../adr/README.md)
- Domínio core-api: [`./domain.md`](./domain.md)
- Domínio frontend (BFF + client): [`./domain.fe.md`](./domain.fe.md)
- Descoberta frontend: [`./discovery.fe.md`](./discovery.fe.md)
- Prontidão da API: [`./api-readiness.fe.md`](./api-readiness.fe.md)
- Métricas do contrato: [`./metrics.md`](./metrics.md)
- people-context (upstream): [`../people-context/discovery.md`](../people-context/discovery.md)
- analysis-bi (downstream): [`../analysis-bi/discovery.md`](../analysis-bi/discovery.md)
