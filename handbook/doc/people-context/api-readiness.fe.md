# Relatório de Prontidão da API (core-api): Interface Web People-Context

**Feature**: `web_02/handbook/doc/people-context/` (002-people-context-web) · **Emissor**: Arquitetura Frontend v2 · **Destinatário**: Time people-context (svc-people-context)

> Documento `-fe` específico do BFF Elysia. Como o browser **nunca** fala com o `people-context`
> direto (Princípio I — BFF-Orchestrated Boundary, ver
> [Constituição web_02](../../../.specify/memory/constitution.md)), toda capacidade depende de uma
> rota Elysia em `src/routes/api/[...path].ts` consumida via Eden Treaty. Este relatório mapeia, por
> sub-domínio/capacidade, **o que a API já entrega** vs. **o que falta**, e define a **estratégia de
> integração progressiva**. Alimenta o [plan.fe.md](./plan.fe.md) (seção "Integração core-api") e
> os [ADRs](../../adr/README.md).

## 1. Resumo Executivo

A API do `people-context` está **pronta para integração real desde a Fase 1**: as 17 rotas
(2 health + 10 person + 5 role) sob o prefixo **`/api/v1`** cobrem todos os fluxos da
feature, com envelope `{ data, meta: { timestamp } }`, envelope de erro
`{ success: false, error: { code, message } }` (PEO/ROL/IDP/AUTH/ADM), paginação
cursor-based em `GET /people`, RBAC via claim `groups`
(`worker`/`owner`/`admin` escopado/`superadmin`) e idempotência por design nos pontos
críticos (dedup por CPF, UNIQUE de role com 204 noop). Há um contrato formal (OpenAPI 3.1
em `contracts/services/people/`), porém **desatualizado: documenta 12 endpoints vs 17
reais** — a fonte de verdade hoje é `people-context/src/routes/`. As lacunas são de
estabilização e LGPD, não de capacidade: **sem optimistic locking/`ETag`**
(last-write-wins no `PUT /people/:personId`), **`PersonSummary` expõe CPF cru em
`GET /roles`** para qualquer `worker`, **`GET /roles` sem paginação**, **207 Multi-Status
com campo `warnings` fora do envelope padrão** e **update de email só por COALESCE**
(impossível limpar o email). Integração real desde Fase 1 — sem mocks (Princípio VI —
Honesty/No Mocks; [ADR-0011](../../adr/0011-no-mocks-in-production.md)); rotas ainda não
implementadas retornam valor `'not-implemented'` via handler Elysia.

## 2. Matriz de Prontidão

| Sub-domínio / Capacidade | Endpoint (método rota) | Existe? | Contrato OK? | RBAC | Veredito |
|---|---|---|---|---|---|
| Health — liveness | `GET /health` | ✅ | ✅ (`{ status: "alive" }`, sem auth) | — | 🟢 PRONTO (uso: healthcheck Compose, não BFF) |
| Health — readiness | `GET /ready` | ✅ | ✅ (200/503 + `checks: { database, nats, outbox, outboxBacklog }`) | — | 🟢 PRONTO |
| Pessoa — cadastrar (dedup CPF, login opcional) | `POST /api/v1/people` | ✅ | parcial (201 ok; **207** retorna `warnings` fora do envelope padrão) | worker, admin + `X-Actor-Id` | 🟡 PARCIAL |
| Pessoa — listar/buscar (nome ILIKE \| prefixo CPF, cursor) | `GET /api/v1/people` | ✅ | parcial (meta paginada ok; **sem filtro `?active=`**) | worker, owner, admin | 🟡 PARCIAL |
| Pessoa — lookup por CPF | `GET /api/v1/people/by-cpf/:cpf` | ✅ | ✅ (400 `PEO-004` · 404 `PEO-002`) | worker, owner, admin | 🟢 PRONTO |
| Pessoa — ficha | `GET /api/v1/people/:personId` | ✅ | ✅ (400 `PEO-003` · 404 `PEO-002`) | worker, owner, admin | 🟢 PRONTO |
| Pessoa — editar | `PUT /api/v1/people/:personId` | ✅ | parcial (204; full-payload com COALESCE de email — **sem update parcial nem como limpar email**; sem locking) | worker, admin + `X-Actor-Id` | 🟡 PARCIAL |
| Acesso — desativar (IdP-first) | `PUT /api/v1/people/:personId/deactivate` | ✅ | ✅ (204 · 409 `PEO-005` · 502 `IDP-002`) | admin + `X-Actor-Id` | 🟢 PRONTO |
| Acesso — reativar (IdP-first) | `PUT /api/v1/people/:personId/reactivate` | ✅ | ✅ (204 · 409 `PEO-006` · 502 `IDP-003`) | admin + `X-Actor-Id` | 🟢 PRONTO |
| Acesso — provisão retroativa de login | `POST /api/v1/people/:personId/login` | ✅ | ✅ (201 `{ id, idpUserId }` · 409 `PEO-008` · 422 `PEO-009` · 502 `IDP-001`; email do body ou do cadastro) | worker, admin + `X-Actor-Id` | 🟢 PRONTO |
| Acesso — password reset (link só via NATS) | `POST /api/v1/people/:personId/request-password-reset` | ✅ | ✅ (202 sem link no body — ADR-030/CRITICAL-2 · 422 `PEO-007` · 502 `IDP-004`) | admin + `X-Actor-Id` | 🟢 PRONTO |
| Acesso — erasure LGPD Art. 18 V | `DELETE /api/v1/people/:personId` | ✅ | ✅ (204 · 403 `PEO-010` · 502 `IDP-005`; IdP-first sem rollback; remove roles + pessoa em transação) | superadmin + `X-Actor-Id` | 🟢 PRONTO |
| Vínculos — atribuir | `POST /api/v1/people/:personId/roles` | ✅ | ✅ (201 `{ id }` nova/reativada · **204 noop** se já ativa · 403 `ROL-006/007/008` · 400 `ROL-001`) | admin escopado + `X-Actor-Id` | 🟢 PRONTO |
| Vínculos — listar da pessoa | `GET /api/v1/people/:personId/roles` | ✅ | ✅ (`?active=true\|false`; `SystemRole[]`) | worker, owner, admin | 🟢 PRONTO |
| Vínculos — desativar | `PUT /api/v1/people/:personId/roles/:roleId/deactivate` | ✅ | ✅ (204 · 404 `ROL-002` · 400 `ROL-005` · 403 `ROL-007` · 409 `ROL-009`) | admin escopado + `X-Actor-Id` | 🟢 PRONTO |
| Vínculos — reativar | `PUT /api/v1/people/:personId/roles/:roleId/reactivate` | ✅ | ✅ (204 · 404 `ROL-003` · 403 `ROL-007` · 409 `ROL-009`) | admin escopado + `X-Actor-Id` | 🟢 PRONTO |
| Vínculos — discovery por sistema | `GET /api/v1/roles?system=&role=&active=` | ✅ | parcial (`system` obrigatório → 400 `ROL-004`; **sem paginação**; **`PersonSummary` expõe `cpf` cru**) | worker, owner, admin | 🟡 PARCIAL |
| Concorrência otimista por header | `ETag` / `If-Match` | ❌ | — (sem coluna `version` em `people`; last-write-wins) | — | 🔴 AUSENTE |
| Catálogo de systems/roles | `GET /api/v1/systems` (ou equivalente) | ❌ | — (`KnownSystem`/`KnownRole` só como tipos no domain, não exaustivos) | — | 🔴 AUSENTE |
| Contrato publicado e atualizado | OpenAPI 3.1 em `contracts/services/people/` | ✅ | parcial (**12 endpoints documentados vs 17 reais**) | — | 🟡 PARCIAL |

## 3. Gaps por Sub-domínio

### Pessoa — cadastro/busca/edição — 🟡 PARCIAL

- **Endpoints**: 5 rotas em `people-context/src/routes/people.ts` (POST, GET list, GET by-cpf, GET by-id, PUT).
- **Contrato (request/response)**: TypeBox no POST/PUT (`fullName` 1–200, `cpf` `^\d{11}$`, `birthDate` format date, `email` format email, `initialPassword` min 8); `Person` completo no GET (`id, fullName, cpf|null, birthDate, email|null, idpUserId|null, idpUserPk|null, active, createdAt, updatedAt`); dedup por CPF idempotente (201 com id existente); paginação cursor por `id` com `pageSize`/`totalCount`/`hasMore`/`nextCursor` (limit 1–100, default 20).
- **Agregado/tabela**: `people` (CPF `CHAR(11) UNIQUE`, soft-delete via `active`, sem `version`) — `src/repository/migrations.ts`.
- **GAP**: (1) `GET /people` **não filtra por `active`** — a lista mistura ativos e inativos e o front não consegue paginar "só ativos" server-side; (2) `PUT` é full-payload: `email` omitido preserva via COALESCE, logo **não existe forma de limpar o email** nem update parcial de um campo isolado; (3) **207 Multi-Status** do POST devolve `{ data, warnings: [{ code: "IDP-001" }], meta }` — o campo `warnings` não consta do envelope padrão `{ data, meta }` documentado; (4) sem optimistic locking (ver Transversal).
- **Estratégia front**: integrar direto; schemas TypeBox (`Elysia.t`) do BFF aceitam o
  envelope 207 explicitamente e o modelam como sucesso parcial (`created-idp-pending` → CTA
  "Provisionar login"); badge ativo/inativo renderizado por item via Solid (filtro visual por
  página até existir `?active=`); edição sempre reenvia o objeto completo carregado da ficha.

### Acesso/IdP (provisão, reset, ativação, erasure) — 🟢 PRONTO

- **Endpoints**: 5 rotas em `src/routes/people.ts` (`deactivate`, `reactivate`, `login`, `request-password-reset`, `DELETE`).
- **Contrato (request/response)**: estados de pré-condição bem discriminados (`PEO-005/006` já no estado-alvo → 409; `PEO-007` sem login → 422; `PEO-008` já tem login → 409; `PEO-009` sem email → 422; `PEO-010` não-superadmin → 403); falhas do Authentik genéricas `IDP-001..005` → 502 (mensagem do IdP nunca vaza — AppSec HIGH-7); IdP-first (HIGH-5) garante que 502 significa "DB intocado, pode tentar de novo".
- **Agregado/tabela**: `people.idp_user_id` (uid hex64 = `JWT.sub`) + `people.idp_user_pk` (pk DRF p/ mutações — ADR-027).
- **GAP**: nenhum bloqueante. Nota de UX: o reset retorna 202 e o link viaja apenas no evento NATS `people.user.password_reset_requested` (ADR-030) — o front **não tem como confirmar a entrega do email** (responsabilidade do queue-manager); a UI comunica "solicitação enviada" sem promessa de entrega.
- **Estratégia front**: integrar direto; `IDP-00x` → `AppError.kind = 'idpUnavailable'` com
  retry manual via `action` do Solid; erasure atrás de dupla confirmação (nome digitado) e
  visível só com `superadmin` no claim `groups`.

### Vínculos (SystemRole) — 🟡 PARCIAL

- **Endpoints**: 5 rotas em `src/routes/roles.ts` (assign, list by person, deactivate, reactivate, query).
- **Contrato (request/response)**: `{ system, role }` livres (min 1); UNIQUE(person_id, system, role) com `FOR UPDATE` → assign idempotente (**201 com `{ id }`** para nova/reativada vs **204 sem body** para noop); autorização verificada ANTES da mutação (`ROL-006` superadmin-only, `ROL-007` escopo via `adminSystems()`, `ROL-008` auto-assign); races → 409 `ROL-009`; sync de group Authentik best-effort (DB é source of truth).
- **Agregado/tabela**: `system_roles` (soft removal via `active`; FK sem CASCADE).
- **GAP**: (1) `GET /roles` retorna **`PersonSummary` com `cpf` cru** (`{ id, fullName, cpf, birthDate }`) para qualquer `worker` — atrito com a minimização LGPD aplicada no resto do serviço (CPF fora de eventos/logs); (2) `GET /roles` **não tem paginação** (`roles.query` devolve tudo) — risco de payload grande em `social-care:patient`; (3) não há endpoint de **catálogo** de systems/roles válidos (`KnownSystem`/`KnownRole` existem só como tipos não exaustivos no domain) — o front precisa hardcodar as opções; (4) o duplo status 201/204 do assign exige parsing condicional no BFF (204 sem envelope).
- **Estratégia front**: integrar direto; CPF do discovery sempre renderizado via `MaskedField`
  (componente Solid) e nunca logado; catálogo hardcoded como union + `as const` com campo
  livre no handler Elysia; `assignRole.service.fn.ts` devolve resultado discriminado
  `assigned | already-active`; uso do discovery limitado com aviso de lista completa (sem
  cursor).

### Transversal (contrato/infra) — 🔴 AUSENTE

- **Endpoints**: não há `ETag`/`If-Match` nem coluna `version` em `people` (mapa do serviço §8: "sem optimistic locking"); o OpenAPI 3.1 de `contracts/services/people/` cobre 12 endpoints (Person 5, Roles 5, Health 2) e **não documenta** `POST …/login`, `POST …/request-password-reset`, `PUT …/roles/:roleId/{deactivate|reactivate}` e `DELETE /people/:personId`.
- **GAP**: edições concorrentes do cadastro são last-write-wins silencioso (os 409 existentes cobrem só os fluxos de ativação/role); o drift do contrato pode esconder divergência futura de payload. Pontos positivos a registrar: idempotência por design (dedup CPF, UNIQUE role, 409 nos retries de login) torna `idempotencyKey` desnecessário nos POSTs atuais.
- **Estratégia front**: schemas TypeBox (`Elysia.t`) versionados no BFF como contrato
  executável via Eden Treaty (falha ruidosa em divergência — Princípio V); re-fetch da ficha
  via `createAsync` após todo 204; sem retry automático de mutação.

## 4. Estratégia de Integração Progressiva

| Sub-domínio | Fase 1 (agora) | Quando o backend evoluir |
|---|---|---|
| Pessoa (CRUD + busca) | integra real (5 rotas); 207 modelado como sucesso parcial; filtro de ativos visual via Solid | adotar `?active=` em `GET /people` no `person.repository.ts`; trocar full-payload por PATCH parcial quando existir — UI/ViewModel Solid intocados |
| Acesso/IdP | integra real (5 rotas); erasure gated por `superadmin` | nenhuma mudança prevista; se o 207 ganhar envelope padronizado, ajustar só `envelope.schema.ts` no handler Elysia |
| Vínculos | integra real (5 rotas); CPF mascarado no discovery; catálogo hardcoded no handler Elysia | trocar catálogo hardcoded por `GET /systems` quando existir (troca só no `role.repository.ts`); ligar paginação do discovery quando houver cursor |
| Concorrência | re-fetch pós-mutação via `createAsync` + 409 existentes | adotar `ETag`/`If-Match` no `people-context.client.ts` quando existir — UI/ViewModel intocados |
| Contrato (OpenAPI) | TypeBox no BFF como contrato executável via Eden Treaty | diffar os schemas TypeBox contra o OpenAPI 3.1 atualizado de `contracts/services/people/` |

> Decisão registrada como [ADR-0001 (people-context)](./adr.md) e alinhada com
> [ADR-0004 (web_02)](../../adr/0004-client-server-split-mvvm-ddd.md) ("integração real +
> contrato executável em TypeBox/Eden Treaty; 207 como sucesso parcial; CPF mascarado no
> discovery"). O ponto de troca é o **repository** (`client/data`) ou o **client
> people-context** (`server/adapters/people-context.client.ts`) — a UI e o ViewModel Solid
> não mudam.

## 5. Pedidos ao Time core-api (priorizados)

- **P1**: Filtro **`?active=true|false`** em `GET /api/v1/people` — sem ele o front não consegue paginar só pessoas ativas (ou só inativas, para o fluxo de reativação); o filtro client-side quebra com paginação cursor-based.
- **P1**: Revisar a exposição de **CPF cru no `PersonSummary` de `GET /api/v1/roles`** (minimização LGPD): remover o campo, truncar (`***.***.***-XX`) ou restringir o endpoint a `admin` — hoje qualquer `worker` enumera CPFs por sistema.
- **P2**: Atualizar o **OpenAPI 3.1** em `contracts/services/people/` de 12 para as 17 rotas reais (faltam `login`, `request-password-reset`, role `deactivate`/`reactivate`, `DELETE /people/:personId`) — o contrato dos 5 endpoints novos só existe no código TS.
- **P2**: **Paginação cursor-based em `GET /api/v1/roles`** (mesmo padrão de `GET /people`) — `social-care:patient` pode crescer além de um payload razoável.
- **P2**: Semântica de **update parcial** em `PUT /people/:personId` (ou `PATCH`): hoje o COALESCE de `email` impede limpar o email e obriga full-payload; definir também como o front distingue "preservar" de "apagar".
- **P2**: **Optimistic locking** (`updatedAt` como precondition ou `ETag`/`If-Match`) em `PUT /people/:personId` — edições concorrentes hoje são last-write-wins silencioso.
- **P3**: Padronizar o **envelope do 207** (`warnings` documentado no envelope oficial, ou trocar por `data.idpStatus: 'pending'`) para o BFF não depender de um shape ad-hoc.
- **P3**: Endpoint de **catálogo de systems/roles** (`GET /api/v1/systems` com roles válidas
  por sistema) para substituir o hardcode do handler Elysia e alinhar com os groups
  `system:role` do blueprint Authentik (ADR-029).

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípios I, IV, V, VI
- [ADR-0001 (people-context): BFF como única fronteira](./adr.md)
- [ADR-0002 (feature): Mapeamento de erros](./adr.fe.md)
- [ADR-0004 (web_02): Client-Server Split — Eden Treaty](../../adr/0004-client-server-split-mvvm-ddd.md)
- [ADR-0010 (web_02): BFF Elysia — query.fn / service.fn](../../adr/0010-bff-orchestration-fn-naming.md)
- [ADR-0011 (web_02): No Mocks in Production](../../adr/0011-no-mocks-in-production.md)
- [domain.fe.md — modelos e adaptadores](./domain.fe.md)
- [metrics.fe.md — NFRs da UI](./metrics.fe.md)
- [metrics.md — NFRs do contrato/backend](./metrics.md)
- [Índice de ADRs web_02](../../adr/README.md)
- Docs offline: `../../reference/framework/elysia/` · `../../reference/framework/solidstart/`
