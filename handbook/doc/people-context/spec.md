# Feature Specification: Gestão de Pessoas e Identidade — Web (contrato core-api · `svc-people-context`)

**Feature Branch**: `002-people-context-web`

**Created**: 2026-06-12

**Status**: Draft

**Input**: User description: "Interface web para o registro de identidade de pessoas do ecossistema ACDG (pacientes de doenças raras e familiares), consumindo o serviço `people-context` via BFF Elysia. Esta spec define o contrato da API que o BFF consome; a spec da interface está em `spec.fe.md`."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registro e busca de pessoa (Priority: P1)

A operadora registra uma pessoa (nome completo, CPF opcional, data de nascimento, e-mail opcional) com deduplicação automática por CPF, busca pessoas por nome parcial ou CPF, consulta o registro individual e atualiza dados cadastrais com preservação de campos omitidos.

**Why this priority**: O agregado `Person` é a identidade única do ecossistema — vínculos, provisão de login e os demais serviços (`social-care` referencia `personId`) dependem dele. Sem este contrato, nenhuma outra jornada existe.

**Independent Test**: Pode ser testado integralmente com `POST /people` → `GET /people?search=` → `GET /people/:personId` → `PUT /people/:personId`, entregando um registro único, buscável e atualizável.

**Acceptance Scenarios**:

1. **Given** um CPF inédito e payload válido, **When** o BFF envia `POST /people` com Bearer (`worker` ou `admin`) e header `X-Actor-Id`, **Then** o serviço responde `201` com `{ data: { id }, meta: { timestamp } }` e publica `people.person.registered` (payload sem CPF — LGPD).
2. **Given** um CPF já cadastrado, **When** o BFF envia `POST /people` com o mesmo CPF, **Then** o serviço responde `201` com o `id` da pessoa **existente** — deduplicação idempotente, sem erro.
3. **Given** registros existentes, **When** o BFF faz `GET /people?search=Maria&limit=20`, **Then** recebe `200` com `data: Person[]` e `meta: { pageSize, totalCount, hasMore, nextCursor }`; o `nextCursor` da resposta retorna a página seguinte.
4. **Given** um CPF de 11 dígitos cadastrado, **When** `GET /people/by-cpf/:cpf`, **Then** `200` com a pessoa; CPF mal formatado responde `400 PEO-004`; CPF inexistente responde `404 PEO-002`.
5. **Given** uma pessoa existente, **When** o BFF envia `PUT /people/:personId` apenas com `email`, **Then** recebe `204`, os campos omitidos são preservados (COALESCE) e, se a pessoa tem `idpUserPk`, nome/e-mail são sincronizados com o Authentik best-effort; o evento `people.person.updated` é publicado.
6. **Given** payload com `fullName` vazio ou `birthDate` futura, **When** submetido, **Then** o serviço responde `400 PEO-001` com envelope `{ success: false, error: { code, message } }`.

---

### User Story 2 - Vínculos de sistema (SystemRole) (Priority: P2)

O administrador atribui, desativa e reativa vínculos `system:role` de uma pessoa (ex.: `social-care:patient`), consulta os vínculos por pessoa e descobre pessoas por sistema/role, com autorização escopada (admin opera só no próprio sistema) e bloqueios de privilégio (role `superadmin`, auto-assign).

**Why this priority**: Os vínculos dão significado ao registro nos sistemas consumidores e alimentam os grupos do Authentik, mas pressupõem a pessoa (P1) existente.

**Independent Test**: Com pessoa criada por fixture, exercitar `POST /people/:personId/roles` → `GET /people/:personId/roles` → `PUT .../roles/:roleId/deactivate` → `PUT .../roles/:roleId/reactivate` → `GET /roles?system=social-care`, verificando idempotência, escopo e eventos.

**Acceptance Scenarios**:

1. **Given** pessoa existente e token com `social-care:admin`, **When** `POST /people/:personId/roles { system: "social-care", role: "patient" }`, **Then** `201 { data: { id } }`, o vínculo é sincronizado com o grupo Authentik `social-care:patient` (best-effort) e `people.role.assigned` é publicado.
2. **Given** vínculo já ativo para (person, system, role), **When** a mesma atribuição é reenviada, **Then** o serviço responde `204 No Content` (noop idempotente); vínculo inativo é **reativado** com `201` (nunca duplicado — UNIQUE(person_id, system, role)).
3. **Given** token de admin escopado a `social-care`, **When** tenta atribuir role em `therapies`, **Then** `403 ROL-007`; `superadmin` bypassa o escopo.
4. **Given** token sem `superadmin`, **When** tenta atribuir a role `superadmin`, **Then** `403 ROL-006`.
5. **Given** `person.idpUserId === auth.sub` (a própria pessoa autenticada) e token não-superadmin, **When** tenta atribuir role a si mesma, **Then** `403 ROL-008` — checado **antes** de qualquer mutação.
6. **Given** vínculo ativo, **When** `PUT /people/:personId/roles/:roleId/deactivate`, **Then** `204`, remoção do grupo Authentik e `people.role.deactivated`; vínculo não-ativo responde `404 ROL-002` (reativação espelhada: `404 ROL-003`).
7. **Given** consulta de discovery, **When** `GET /roles?system=social-care&role=patient&active=true`, **Then** `200` com `[{ person: PersonSummary, role: SystemRole }]`; omitir `system` responde `400 ROL-004`.

---

### User Story 3 - Provisão de login e recuperação de senha (IdP) (Priority: P3)

A operadora provisiona o login da pessoa no Authentik — na criação (`createLogin: true`) ou retroativamente quando a criação respondeu `207` — e o administrador dispara a recuperação de senha de forma assíncrona, com o link trafegando apenas no evento NATS.

**Why this priority**: Fecha o ciclo identidade → acesso, mas pressupõe pessoa registrada; o desenho assíncrono do reset é requisito de segurança (ADR-030 / AppSec CRITICAL-2).

**Independent Test**: Com pessoa sem login (fixture), exercitar `POST /people/:personId/login` → repetir (espera `409`) → `POST /people/:personId/request-password-reset`, verificando eventos `people.user.provisioned` e `people.user.password_reset_requested`.

**Acceptance Scenarios**:

1. **Given** `POST /people` com `createLogin: true`, e-mail e `initialPassword` (min 8), **When** o Authentik provisiona com sucesso, **Then** `201` e os eventos `people.person.registered` + `people.user.provisioned` são publicados.
2. **Given** `createLogin: true` e Authentik indisponível, **When** o registro é submetido, **Then** o serviço responde `207 Multi-Status` — a pessoa **foi criada** mas sem login; o BFF retoma via `POST /people/:personId/login`.
3. **Given** pessoa com `idpUserId === null` e e-mail, **When** `POST /people/:personId/login`, **Then** `201 { data: { id, idpUserId } }` com username único resolvido automaticamente; pessoa que já tem login responde `409 PEO-008`; pessoa sem e-mail responde `422 PEO-009`; falha do IdP responde `502 IDP-001`.
4. **Given** pessoa com login no IdP, **When** `POST /people/:personId/request-password-reset` (role `admin`), **Then** `202 Accepted` **sem** link no body — o `recoveryLink` viaja exclusivamente no evento `people.user.password_reset_requested` (consumido pelo queue-manager, que monta o e-mail PT-BR).
5. **Given** pessoa sem login no IdP, **When** o reset é solicitado, **Then** `422 PEO-007`; falha do Authentik responde `502 IDP-004`.

---

### User Story 4 - Ciclo de vida e erasure LGPD (Priority: P3)

O administrador desativa e reativa pessoas (soft-delete reversível, ordem IdP-first) e o superadministrador executa o apagamento total (LGPD Art. 18 V) — irreversível, removendo a conta no Authentik, os vínculos e a pessoa.

**Why this priority**: Operações sensíveis e de baixa frequência; a ordem IdP-first (ADR-HIGH-5) e a restrição a `superadmin` são invariantes de segurança/compliance.

**Independent Test**: Com pessoa ativa com login (fixture), exercitar `PUT .../deactivate` → repetir (espera `409`) → `PUT .../reactivate` → `DELETE /people/:personId` com tokens de roles distintas, verificando os eventos `people.user.deactivated`/`people.user.reactivated`/`people.person.deleted`.

**Acceptance Scenarios**:

1. **Given** pessoa ativa, **When** `PUT /people/:personId/deactivate` (role `admin`), **Then** o usuário é desativado no Authentik **primeiro** e depois `active=false` no banco (`204`); evento `people.user.deactivated`.
2. **Given** Authentik indisponível, **When** a desativação é tentada, **Then** `502 IDP-002` e o banco **não é tocado** (aborta antes do DB); reativação espelhada com `502 IDP-003`.
3. **Given** pessoa já inativa, **When** desativada novamente, **Then** `409 PEO-005`; pessoa já ativa reativada responde `409 PEO-006`.
4. **Given** token sem `superadmin`, **When** `DELETE /people/:personId`, **Then** `403 PEO-010`.
5. **Given** token `superadmin` e `X-Actor-Id`, **When** `DELETE /people/:personId`, **Then** o usuário é deletado no Authentik primeiro (sem rollback; falha → `502 IDP-005` e DB intacto), depois roles + pessoa são removidos em transação (`204`) e `people.person.deleted` é publicado contendo **apenas** `{ personId }`.

---

### Edge Cases

- Dedup por CPF sob concorrência: dois `POST /people` simultâneos com o mesmo CPF convergem para o mesmo registro (UNIQUE em `cpf`); atribuição de role paralela é serializada por transação `FOR UPDATE` — corrida residual responde `409 ROL-009`.
- `207 Multi-Status` parcial: pessoa persiste sem `idpUserId`; reexecutar `POST /people` com o mesmo CPF retorna a mesma pessoa; a retomada correta é `POST /people/:personId/login`.
- Paginação: `limit > 100` é rejeitado pela validação TypeBox; última página retorna `hasMore = false` sem `nextCursor`; cursor é o último `id` (ordenado por `id`), estável sob inserções concorrentes.
- `personId` malformado (não-UUID) → `400 PEO-003`; `roleId` malformado → `400 ROL-005`; pessoa inexistente → `404 PEO-002`.
- Mutação sem header `X-Actor-Id` → `400 AUTH-003`; token ausente/expirado → `401 AUTH-001`; role insuficiente (ex.: `owner` tentando `POST /people`) → `403 AUTH-002`.
- Sync de grupo Authentik com grupo inexistente (blueprint não aplicado): log de warning + skip — o vínculo persiste no banco (DB é source of truth) e a resposta é `2xx`.
- `PUT /people/:personId` removendo e-mail de pessoa com login: semântica COALESCE impede apagar o e-mail por omissão (campo omitido preserva o atual — não quebra o login).
- `/ready` responde `503` com `checks` quando o database está fora; backlog do outbox > 1000 sinaliza warning (relay é best-effort; consumidores deduplicam por `eventId`).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O serviço MUST expor registro de pessoa em `POST /api/v1/people` (roles `worker`/`admin`, `X-Actor-Id` obrigatório) validando na borda: `fullName` 1–200, `cpf?` `^\d{11}$` + MOD-11 sem repdigits, `birthDate` ISO não-futura, `email?` válido, `createLogin?` ⇒ e-mail obrigatório, `initialPassword?` mínimo 8 — payload inválido responde `400 PEO-001`.
- **FR-002**: O serviço MUST deduplicar por CPF de forma idempotente: CPF já existente em `POST /people` responde `201` com o `id` da pessoa existente, sem erro.
- **FR-003**: O serviço MUST expor consulta: `GET /people` (roles `worker`/`owner`/`admin`; `search` por ILIKE em `fullName` ou prefixo de CPF; cursor-based com `limit ≤ 100`, default 20), `GET /people/:personId` e `GET /people/by-cpf/:cpf`.
- **FR-004**: O serviço MUST atualizar pessoa via `PUT /people/:personId` (roles `worker`/`admin`) com semântica COALESCE e sync best-effort de nome/e-mail no Authentik quando houver `idpUserPk`, publicando `people.person.updated`.
- **FR-005**: O serviço MUST gerenciar vínculos: `POST /people/:personId/roles` (admin escopado), `PUT .../roles/:roleId/deactivate|reactivate` (admin escopado), `GET /people/:personId/roles` e `GET /roles?system=…&role=…&active=…` (leitura: `worker`/`owner`/`admin`; `system` obrigatório → `400 ROL-004`), com invariante UNIQUE(person, system, role), reativação em vez de duplicação e noop `204` para vínculo já ativo.
- **FR-006**: O serviço MUST checar autorização de vínculos **antes** de qualquer mutação: `ROL-006` (só superadmin atribui `superadmin`), `ROL-007` (admin fora do escopo `system:admin`), `ROL-008` (auto-assign proibido para não-superadmin).
- **FR-007**: O serviço MUST provisionar login no Authentik com resolução automática de username único (base, base2, base3… fallback uuid-fragment) e retry em conflito: na criação (`createLogin`, com `207 Multi-Status` em falha parcial) e retroativamente via `POST /people/:personId/login` (`201` / `409 PEO-008` / `422 PEO-009` / `502 IDP-001`), publicando `people.user.provisioned`.
- **FR-008**: O serviço MUST tratar recuperação de senha como operação assíncrona (`POST /people/:personId/request-password-reset`, role `admin`): `202 Accepted` sem link no body; o `recoveryLink` MUST trafegar exclusivamente no evento `people.user.password_reset_requested`.
- **FR-009**: O serviço MUST aplicar ordem IdP-first em desativação/reativação (`PUT /people/:personId/deactivate|reactivate`, role `admin`): falha no Authentik aborta antes do banco (`502 IDP-002`/`IDP-003`); conflitos de estado respondem `409 PEO-005`/`PEO-006`; eventos `people.user.deactivated`/`people.user.reactivated`.
- **FR-010**: O serviço MUST restringir o erasure LGPD (`DELETE /people/:personId`) a `superadmin` (`403 PEO-010`), executando Authentik primeiro sem rollback (`502 IDP-005` deixa o DB intacto) e depois roles + pessoa em transação; o evento `people.person.deleted` carrega apenas `personId`.
- **FR-011**: Todas as respostas MUST usar o envelope `{ data, meta: { timestamp } }` (com `pageSize`/`totalCount`/`hasMore`/`nextCursor` em listagens) e erros o envelope `{ success: false, error: { code, message } }` com códigos `PEO-XXX`/`ROL-XXX`/`IDP-XXX`/`AUTH-XXX`/`ADM-XXX`.
- **FR-012**: Toda mutação MUST publicar o evento `people.*` correspondente via Transactional Outbox (INSERT na transação HTTP; relay em background para NATS, at-least-once) com envelope `{ metadata: { eventId, occurredAt, schemaVersion }, actorId, data }` — e CPF MUST NOT aparecer em nenhum payload de evento.
- **FR-013**: O serviço MUST autenticar via Bearer JWT RS256 validado contra o JWKS do Authentik (fallback introspection RFC 7662 para tokens opacos), extrair roles do claim `groups` com matching `r === required || r.endsWith(":" + required)`, exigir `X-Actor-Id` (UUID) em POST/PUT/DELETE (`400 AUTH-003`) e conceder bypass total a `superadmin`.
- **FR-014**: Datas MUST trafegar em ISO 8601 (`YYYY-MM-DD` para `birthDate`, timestamps com timezone em `meta`/eventos); identificadores como UUID em string; CPF como 11 dígitos sem formatação (máscara é responsabilidade da UI).

### Key Entities

- **Person (pessoa)**: agregado raiz do registro de identidade — `id` (UUID imutável), `fullName`, `cpf` (nullable, UNIQUE, chave de deduplicação), `birthDate`, `email` (nullable), `idpUserId`/`idpUserPk` (referências ao Authentik; null = sem login), `active` (soft-delete), `createdAt`/`updatedAt`.
- **SystemRole (vínculo de sistema)**: papel da pessoa num sistema — `id`, `personId`, `system` (`social-care`, `queue-manager`, `therapies`, `timesheet`), `role` (`patient`, `professional`, `family-member`, `employee`, `therapist`, …; não exaustivo), `active`, `assignedAt`; UNIQUE(person, system, role); mapeado ao grupo Authentik `system:role`.
- **PersonSummary**: projeção de discovery em `GET /roles` — `{ id, fullName, cpf, birthDate }` (CPF exposto para auditoria administrativa).
- **Evento `people.*`**: envelope `{ metadata: { eventId, occurredAt, schemaVersion }, actorId, data }`; 10 subjects (`people.person.registered|updated|deleted`, `people.role.assigned|deactivated|reactivated`, `people.user.provisioned|deactivated|reactivated|password_reset_requested`).
- **OutboxEvent**: registro transacional de publicação (`subject`, `payload` JSONB, `published`, timestamps) — garantia at-least-once.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das jornadas do front (busca/cadastro, perfil, vínculos, provisão de login, reset, ciclo de vida, erasure) são atendidas pelo contrato existente sem nova rota — confirmado no [api-readiness.fe.md](./api-readiness.fe.md).
- **SC-002**: Zero pessoas duplicadas por CPF em produção (a deduplicação idempotente + UNIQUE garantem unicidade mesmo sob concorrência).
- **SC-003**: Todo evento `people.*` é publicado no NATS em até 2 s após o commit da transação HTTP (poll 1 s do relay), com zero CPF em payloads — verificado por inspeção dos subjects.
- **SC-004**: 100% das respostas de erro carregam código estruturado mapeável a mensagem i18n no front (zero erros "genéricos" sem código).
- **SC-005**: Zero links de recuperação de senha observáveis em respostas HTTP ou logs (o link existe apenas no evento NATS).
- **SC-006**: Zero registros órfãos pós-erasure: toda exclusão LGPD remove conta IdP, vínculos e pessoa, ou falha atomicamente sem tocar o banco.

## Impacto Arquitetural (core-api) *(obrigatório se a feature toca `src/`)*

- **Bounded Contexts afetados**: [x] Person (`people`) · [x] SystemRole (`system_roles`) · [x] IdP sync (`idp/` + `application/idp-sync.ts`) — somente **consumo do contrato existente**; nenhum módulo é modificado.
  - ⚠️ A feature atravessa os três módulos porque é a interface do registro de identidade — justificado: não há acoplamento novo, apenas consumo HTTP do contrato público de `/api/v1`.
- **Novos agregados / Value Objects?**: Nenhum. O domínio (`Person`, `SystemRole`, branded types `PersonId`/`Cpf`/`IsoDateString`) permanece intacto.
- **Novos eventos de domínio (outbox)?**: Nenhum. Os 10 eventos `people.*` existentes cobrem todas as mutações desta feature.
- **Novos subcomandos de CLI?**: N/A — o serviço é HTTP-first (Elysia); não há CLI de produto.
- **Borda HTTP envolvida?**: Sim — exclusivamente as rotas já existentes de `/api/v1` (`routes/people.ts`, `routes/roles.ts`, `routes/health.ts`). Nenhuma rota nova.
- **Possíveis violações da constituição (I–VI)?**: Nenhuma identificada. Riscos a vigiar no plano ([plan.md](./plan.md)): pressão do front por endpoint composto "pessoa + vínculos" numa chamada (negar — composição é papel do BFF, [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md)) e por retorno síncrono do link de reset (negar — violaria ADR-030).

## Assumptions

- O `svc-people-context` está implantado e saudável na VPS BV (`/health`, `/ready`) antes do desenvolvimento do front; ambiente local segue a orquestração de dev do root.
- O IdP da instância BV é Authentik (`auth.acdg-bv.org.br`), hard-switch concluído (sem tokens Zitadel); grupos `system:role`, `worker` e `superadmin` provisionados via blueprint (ADR-029).
- O queue-manager (consumidor de `people.user.password_reset_requested`) está operante para que o e-mail de recuperação chegue à pessoa; o contrato HTTP independe disso (`202` é aceite, não entrega).
- Não há requisito de idempotency key em mutações nesta fase; reentrância é mitigada na UI (ver [spec.fe.md](./spec.fe.md)), pela dedup por CPF e pela transação `FOR UPDATE` em roles.
- Volume BV é de centenas (não milhares) de pessoas; cursor pagination com `limit ≤ 100` é suficiente.
- Consumidores NATS (`analysis-bi`, queue-manager) são idempotentes por `eventId` (relay é at-least-once).

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — lei máxima do projeto
- [ADR-0002 — Errors as Values](../../adr/0002-errors-as-values.md)
- [ADR-0004 — Client × Server Split (MVVM × DDD)](../../adr/0004-client-server-split-mvvm-ddd.md)
- [ADR-0010 — BFF Elysia Orquestrador / fn naming](../../adr/0010-bff-orchestration-fn-naming.md)
- [ADR-0011 — No Mocks in Production](../../adr/0011-no-mocks-in-production.md)
- [Índice de ADRs](../../adr/README.md)
- [spec.fe.md — especificação frontend](./spec.fe.md)
- [plan.md — plano de implementação core-api](./plan.md)
- [plan.fe.md — plano de implementação frontend](./plan.fe.md)
- [api-readiness.fe.md — prontidão endpoint a endpoint](./api-readiness.fe.md)
- [Docs offline: framework/elysia](../../reference/framework/elysia/)
- [Docs offline: runtime/bun](../../reference/runtime/bun/)
