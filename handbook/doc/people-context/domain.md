# Modelo de Domínio: People Context Web

**Feature**: `specs/002-people-context-web/` · **Consultor**: `/acdg-skills:ddd-architect`

> Fase 2 da pipeline (máximo rigor). Cada decisão de fronteira/agregado
> exige **citação canônica ≥4 linhas** (Evans/Vernon) via `skills_citar`.
> Este documento descreve o domínio **CORE** do backend `people-context` (Bun 1.3 · Elysia ·
> PostgreSQL · NATS · Transactional Outbox · TypeScript funcional sem classes), registro de
> identidade do ecossistema ACDG e fonte de verdade que a feature `002-people-context-web`
> consome via BFF Elysia. O modelo do frontend (BFF + client) está em
> [`domain.fe.md`](./domain.fe.md); contratos em [`api-readiness.fe.md`](./api-readiness.fe.md);
> requisitos em `spec.md`/`spec.fe.md`. ADRs globais: [índice](../../adr/README.md).
> [Constituição web_02](../../../.specify/memory/constitution.md).

## Bounded Contexts afetados

- [x] Identity Registry (`Person`) · [x] System Roles (`SystemRole`) · [x] IdP Provisioning (`idp/` + `application/idp-sync.ts` — fronteira com o Authentik)

**Justificativa das fronteiras** (citação obrigatória):
> A BOUNDED CONTEXT delimits the applicability of a particular model so that team members
> have a clear and shared understanding of what has to be consistent and how it relates to
> other contexts. Within that CONTEXT, work to keep the model logically unified, but do not
> worry about applicability outside those bounds. In other contexts, other models apply,
> with differences in terminology, in concepts and rules, and in dialects of the
> UBIQUITOUS LANGUAGE.
> — *(Linha 5212, p. 336, ERIC EVANS, *Domain-Driven Design: Tackling Complexity in the Heart of Software*)*

Cada contexto do `people-context` responde a uma pergunta distinta da identidade no
ecossistema ACDG: **Identity Registry** — "quem existe no ecossistema?" (agregado `Person`,
deduplicação por CPF, soft-delete, erasure LGPD); **System Roles** — "qual papel essa pessoa
exerce em cada sistema?" (`SystemRole`, vínculos `system:role` mapeados a groups do
Authentik); **IdP Provisioning** — "como essa pessoa passa a ter login?" (orquestração
IdP-first com o Authentik Management API, isolada em `idp/client.ts` +
`application/idp-sync.ts`, boundary `AuthentikResult` sem `throw`). O modelo de "usuário" do
Authentik (username, pk, groups) **não vaza** para os outros dois contextos: só `idpUserId`
(uid hex64 — o `JWT.sub`/actorId, ADR-023) e `idpUserPk` (pk integer para mutações DRF)
atravessam a fronteira.

## Linguagem ubíqua

| Termo (PT) | Significado | Tipo no código (EN) |
|---|---|---|
| Pessoa | Registro único de uma pessoa no ecossistema ACDG | `Person` (Aggregate Root) |
| Identidade | UUID imutável e global da pessoa | `PersonId` (VO branded, `toPersonId`) |
| Documento | CPF — 11 dígitos, chave de deduplicação | `Cpf` (VO branded, `toCpf`: MOD-11 + rejeita repdigits) |
| Data de nascimento | ISO 8601 `YYYY-MM-DD`, nunca futura | `IsoDateString` (VO branded, `toIsoDate`) |
| Vínculo de Sistema | Papel da pessoa num sistema específico | `SystemRole` (Entity, `RoleId`) |
| Sistema | social-care, queue-manager, therapies, timesheet | `KnownSystem` (union literal) |
| Papel/Função | paciente, profissional, membro da família, funcionário, terapeuta | `KnownRole` (union literal) |
| Ativo/Inativo | Soft-delete reversível (histórico preservado) | `Person.active` / `SystemRole.active` |
| Provisão de Login | Criação de usuário no Authentik (IdP-first) | `provisionUserInIdp` (`AuthentikResult<ProvisionedUser>`) |
| Sincronização de Perfil/Papel | Sync best-effort com Authentik (group `system:role`) | `syncPersonProfileToIdp`, `syncRoleAssignment` |
| Recuperação de Senha | Link viaja **só** no evento NATS, nunca em HTTP | `people.user.password_reset_requested` (Event) |
| Apagamento Total | Erasure LGPD Art. 18 V; superadmin; irreversível | `DELETE /people/:id` → `people.person.deleted` (Event) |
| Desativação Temporária | Soft-delete reversível (IdP primeiro, depois DB) | `PUT /people/:id/deactivate` |
| Ator | Quem executa a mutação (`JWT.sub` + header `X-Actor-Id`) | `AuthResult.actorId` |

## Agregados e Value Objects

### Person (Identity Registry)
- **Raiz**: `Person` (`PersonId`) · **Invariantes**:
  - **Deduplicação por CPF**: se o CPF já existe, `POST /people` retorna o `Person` existente (HTTP 201, sem erro) — idempotência por construção.
  - `PersonId` imutável; `fullName` obrigatório, 1–200 caracteres (trim); `birthDate` `YYYY-MM-DD` não-futura; `email` opcional com regex, **obrigatório** quando `createLogin === true`; `initialPassword` mínimo 8 caracteres.
  - `cpf` nullable e `UNIQUE` (CHAR(11)); validado por MOD-11 com rejeição de repdigits (`111.111.111-11`).
  - `active` é soft-delete: nunca hard-delete, **exceto** erasure LGPD (Art. 18 V) por `superadmin` — IdP primeiro sem rollback, depois roles + pessoa removidos em transação (`409 PEO-005`/`PEO-006` para transições inválidas).
  - Identidade no IdP em par: `idpUserId` (uid hex64 — viaja no `JWT.sub`, actorId) e `idpUserPk` (pk integer do Authentik para mutações na Management API, ADR-027); ambos `UNIQUE` e nullable (pessoa pode existir sem login).
  - Operações de estado seguem **IdP-first (ADR-HIGH-5)**: deactivate/reactivate/delete mutam o Authentik ANTES do DB; falha no IdP aborta com `502 IDP-00x` sem tocar o banco.
- **Value Objects**: `PersonId` (`toPersonId`), `Cpf` (`toCpf(value): Cpf | null`), `IsoDateString` (`toIsoDate(value): IsoDateString | null`) — branded types com smart constructors; validação agregada em `validateCreatePerson`/`validateUpdatePerson` retornando `ValidationResult` (union discriminada por `kind: "ok" | "error"`), nunca `throw` (regra `functional-ts`).
- **Justificativa do boundary do agregado** (citação obrigatória):
  > An AGGREGATE is a cluster of associated objects that we treat as a unit for the purpose
  > of data changes. Each AGGREGATE has a root and a boundary. The boundary defines what is
  > inside the AGGREGATE. The root is a single, specific ENTITY contained in the AGGREGATE.
  > The root is the only member of the AGGREGATE that outside objects are allowed to hold
  > references to, although objects within the boundary may hold references to each other.
  > — *(Linha 2104, p. 126–127, ERIC EVANS, *Domain-Driven Design*)*

  Toda mutação de identidade (registro, atualização, ativação, provisão de login, erasure)
  passa pela raiz `Person`, que garante na mesma transação SQL a unicidade de CPF/idpUserId
  e a consistência do par `idpUserId`/`idpUserPk`. Ciclo de vida real:
  `Register → (Login retroativo) → Update → Deactivate ⇄ Reactivate → Hard Delete (LGPD)`.

### SystemRole (System Roles)
- **Entidade** (`RoleId`), referenciando a raiz por `personId` · **Invariantes**:
  - `UNIQUE(person_id, system, role)`; reatribuir role já ativa é noop (`204 No Content`); role inativa é **reativada** (201) em vez de duplicada.
  - FK `REFERENCES people(id)` **sem** `ON DELETE CASCADE` — o erasure remove roles explicitamente na mesma transação.
  - `active = false` é remoção soft, reversível; nunca hard-delete de role.
  - **Autorização checada ANTES de qualquer mutação** (code-review HIGH-1): só `superadmin` atribui role `superadmin` (`403 ROL-006`); admin é escopado ao próprio sistema — `social-care:admin` só atua em `social-care` (`403 ROL-007`, superadmin bypassa); auto-assignment proibido — `person.idpUserId === auth.sub` sem superadmin (`403 ROL-008`); mudança concorrente durante o request → `409 ROL-009` (transação `FOR UPDATE`).
  - **Mapeamento para Authentik Groups**: `(system, role)` → group homônimo `system:role` (ex.: `social-care:patient`), criado via blueprint (ADR-029); o sync é **best-effort** (log + skip se o group não existir) — o PostgreSQL do `people-context` é a fonte de verdade.
- **Value Objects**: `RoleId` (`toRoleId`); `KnownSystem` (`"social-care" | "queue-manager" | "therapies" | "timesheet"`) e `KnownRole` (`"patient" | "professional" | "family-member" | "employee" | "therapist"`) — unions literais **não exaustivas** (o contrato aceita strings novas sem migração).
- **Justificativa do boundary do agregado** (citação obrigatória):
  > Prefer references to external Aggregates only by their globally unique identity, not by
  > holding a direct object reference (or "pointer"). Aggregates with inferred object
  > references are thus automatically smaller because references are never eagerly loaded.
  > The model can perform better because instances require less time to load and take less
  > memory.
  > — *(Linha 6291, p. 359–361, VAUGHN VERNON, *Implementing Domain-Driven Design*)*

  `SystemRole` referencia a pessoa apenas por `personId` e os sistemas consumidores apenas
  pelo nome (`system`); o vínculo é pequeno, com ciclo de vida próprio
  (`Assign → Deactivate ⇄ Reactivate`), e a consistência com os groups do Authentik é
  **eventual** (best-effort), nunca transacional.

## Eventos de domínio (outbox)

Mecanismo: **Transactional Outbox** — evento gravado na tabela `outbox_events` na mesma
transação SQL da mutação HTTP; relay em background (poll 1s, batch 50) publica em NATS
JetStream e marca `published`. Entrega at-least-once: consumidores devem ser idempotentes
por `metadata.eventId`. Envelope: `{ metadata: { eventId, occurredAt, schemaVersion },
actorId, data }`. **LGPD: CPF nunca entra em payload de evento** (AppSec HIGH-8).

| Evento (EN-passado) | Quando ocorre | Payload (`data`) | Consumidor(es) cross-BC |
|---|---|---|---|
| `people.person.registered` | `POST /people` (pessoa nova) | `{ personId, fullName, birthDate }` (**nunca** CPF) | N/A (auditoria/futuros consumidores) |
| `people.person.updated` | `PUT /people/:id` | `{ personId, fullName, birthDate }` | N/A (auditoria) |
| `people.person.deleted` | `DELETE /people/:id` (erasure LGPD) | `{ personId }` (zero PII) | **social-care** (dispara `PatientPIIAnonymizedEvent`, ADR-039) |
| `people.role.assigned` | `POST /people/:id/roles` | `{ personId, system, role }` | N/A (auditoria) |
| `people.role.deactivated` | `PUT .../roles/:roleId/deactivate` | `{ personId, system, role }` | N/A (auditoria) |
| `people.role.reactivated` | `PUT .../roles/:roleId/reactivate` | `{ personId, system, role }` | N/A (auditoria) |
| `people.user.provisioned` | User criado no Authentik (`createLogin` ou login retroativo) | `{ personId, idpUserId }` | N/A (auditoria) |
| `people.user.deactivated` | `PUT /people/:id/deactivate` | `{ personId, idpUserId }` | N/A (auditoria) |
| `people.user.reactivated` | `PUT /people/:id/reactivate` | `{ personId, idpUserId }` | N/A (auditoria) |
| `people.user.password_reset_requested` | `POST /people/:id/request-password-reset` (202) | `{ personId, idpUserId, recoveryLink }` — **o link viaja AQUI, nunca em HTTP** (ADR-030/CRITICAL-2) | **queue-manager** (monta e envia o e-mail PT-BR) |

## Mapa de contexto

- **Identity Registry** é **upstream** de System Roles e IdP Provisioning dentro do serviço: não se atribui role nem se provisiona login para pessoa inexistente (`404 PEO-002`).
- **Authentik (IdP)** é sistema externo acessado **exclusivamente** pela camada `idp/` (ACL): `client.ts` traduz a Management API (DRF — `pk` para mutações, `uid` como `JWT.sub`) para `AuthentikResult<T>` sem `throw`; erros do Authentik **não vazam** no HTTP (HIGH-7), viram `IDP-00x` genérico. Ordem **IdP-first (ADR-HIGH-5)** em deactivate/reactivate/erasure; provisão resolve username único (`base`, `base2`… até 50, fallback uuid-fragment; retry 3× em 409); role-sync e profile-sync são best-effort — o DB local é a fonte de verdade.
- **social-care** é **downstream (Customer/Supplier)**: valida existência de `PersonId` via HTTP outbound com Bearer forwarding (`PeopleContextPersonValidator`, ADR-011/ADR-023 do `social-care`) e consome `people.person.deleted` via NATS para o erasure em cascata (ADR-039).
- **queue-manager** é **downstream (consumidor NATS)**: durable consumer de `people.user.password_reset_requested` — único canal pelo qual o `recoveryLink` trafega.
- **web_02 (esta feature)** é **downstream com Anticorruption Layer**: o BFF Elysia
  (`server/adapters`) traduz o contrato HTTP (envelope `{ data, meta }`, erros
  `PEO/ROL/IDP/AUTH-XXX`, paginação por cursor, `207 Multi-Status`) para o Model do client
  via Eden Treaty — ver [`domain.fe.md`](./domain.fe.md) e [`adr.md`](./adr.md)
  ("Orquestração de provisão de login e operações IdP-first via BFF").
- Cross-BC **somente** via `public-api` (módulos do frontend — boundaries enforçadas por
  governance tests em `bun:test`, [ADR-0001](../../adr/0001-vertical-modular-architecture.md))
  + **outbox/NATS** (backends) — nunca acesso direto a banco nem import interno. O audit do
  `people-context` é exclusivamente por eventos NATS (não há tabela de audit em DB); o audit
  trail clínico permanece centralizado no `social-care`.

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md)
- [ADR-0001 (web_02): Arquitetura Vertical-Modular](../../adr/0001-vertical-modular-architecture.md)
- [ADR-0004 (web_02): Client-Server Split MVVM×DDD](../../adr/0004-client-server-split-mvvm-ddd.md)
- [ADR-0001 (people-context): BFF como única fronteira de identidade](./adr.md)
- [domain.fe.md — modelo do frontend (BFF + client)](./domain.fe.md)
- [api-readiness.fe.md — prontidão dos endpoints](./api-readiness.fe.md)
- [discovery.md — requisitos do backend](./discovery.md)
- [Índice de ADRs web_02](../../adr/README.md)
- Docs offline: `../../reference/messaging/nats/` · `../../reference/database/postgresql/`
