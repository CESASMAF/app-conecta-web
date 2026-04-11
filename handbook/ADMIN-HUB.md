# Admin Hub — Gestao de Pessoas e Lookup Tables via BFF

<!-- Source: src/middleware/admin_guard.ts, src/routes/api_admin.ts, src/adapters/admin/audit_store.ts, src/adapters/admin/types.ts, src/client/services/lookup-admin-service.ts, src/server.ts -->

> Modulo administrativo do BFF Deno. Permite que administradores gerenciem
> pessoas, roles e lookup tables sem acesso direto aos backends.
> Todas as mutacoes sao auditadas em um log in-memory.

---

## 1. Visao Geral

O Admin Hub e um conjunto de rotas no BFF que expoe operacoes administrativas
para usuarios com role `admin` ou `owner` no Zitadel.

**O que faz:**
- CRUD de pessoas (proxy para People Context)
- Gestao de roles por pessoa (proxy para People Context)
- CRUD de lookup tables (proxy para Social Care)
- Workflow de aprovacao de novas lookup entries (proxy para Social Care)
- Log de auditoria local (in-memory, nao e proxy)
- Dashboard de stats agregados

**Quem usa:** Usuarios autenticados com role `admin` ou `owner` no projeto Zitadel.

### Arquitetura

```
Browser (admin autenticado)
  |
  | Cookie: __Host-session (opaco)
  | X-Requested-With: XMLHttpRequest
  |
  v
BFF Deno (Hono) — /api/admin/*
  |
  | 1. securityHeaders → session → fetchMetadata → authGuard
  | 2. adminGuard (verifica role admin/owner na sessao)
  | 3. Validacao de parametros (UUID, whitelist de tabelas)
  | 4. Proxy com injecao de Bearer token + X-Actor-Id
  | 5. Audit log (mutacoes)
  |
  +---> People Context (Bun/Elysia)    http://people-context:3000
  |       /api/v1/people, /api/v1/people/:id/roles
  |
  +---> Social Care (Swift/Vapor)       http://social-care:3000
          /api/v1/dominios/:tableName, /api/v1/dominios/requests
```

### Arquivos

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/middleware/admin_guard.ts` | Middleware RBAC — bloqueia nao-admins |
| `src/routes/api_admin.ts` | Todas as rotas `/api/admin/*` |
| `src/adapters/admin/types.ts` | Tipos: AuditEntry, AuditAction, AuditStore |
| `src/adapters/admin/audit_store.ts` | Implementacao do audit store in-memory |
| `src/client/services/lookup-admin-service.ts` | Client service para lookups admin |
| `src/server.ts` | Montagem e wiring das dependencias |

---

## 2. Controle de Acesso — adminGuard

O `adminGuard` e um middleware Hono que roda **apos** o `authGuard` (sessao ja resolvida).
Verifica se `session.roles` contem `"admin"` ou `"owner"`.

**Tipo:**
```typescript
type AdminRole = "admin" | "owner";
```

**Comportamento por path:**

| Path | Sem role admin/owner | Com role admin/owner |
|------|---------------------|---------------------|
| `/api/admin/*` | 403 JSON: `{ "error": "Forbidden: admin role required" }` | Prossegue |
| `/admin/*` (SSR) | Redirect 302 para `/` | Prossegue |

**Montagem no server.ts:**
```typescript
app.use("/admin/*", adminGuard());
app.use("/api/admin/*", adminGuard());
```

O middleware verifica via `session.roles.some(r => ADMIN_ROLES.has(r))`.
Se a sessao nao existir ou nao tiver roles, o acesso e negado.

---

## 3. Audit Store

Log de auditoria in-memory, append-only, com evicao FIFO.
Segue o mesmo factory pattern do `createSessionStore`.

**Arquivo:** `src/adapters/admin/audit_store.ts`

### Criacao

```typescript
import { createAuditStore } from "./adapters/admin/audit_store.ts";

const auditStore = createAuditStore();
```

Instanciado uma unica vez no `server.ts` e injetado nas rotas admin.

### Contrato

```typescript
type AuditStore = Readonly<{
  append: (input: AuditAppendInput) => AuditEntry;
  list: (options: AuditListOptions) => AuditListResult;
  listByActor: (actorId: string, options: AuditListOptions) => AuditListResult;
  count: () => number;
}>;
```

### Tipos

**AuditEntry** — entrada completa no log:

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `id` | `string` | UUID gerado via `crypto.randomUUID()` |
| `timestamp` | `string` | ISO 8601, gerado no momento do append |
| `actorId` | `string` | `session.userSub` (sub do JWT Zitadel) |
| `actorName` | `string` | `session.userName` |
| `action` | `AuditAction` | Acao executada (ver tabela abaixo) |
| `targetId` | `string` | ID do recurso afetado |
| `details` | `string \| undefined` | Detalhes adicionais (ex: `"roleId: <uuid>"`) |
| `outcome` | `AuditOutcome` | `"SUCCESS"` ou `"FAILURE"` |
| `errorMessage` | `string \| undefined` | Mensagem de erro (so em FAILURE) |

**AuditAppendInput** — dados para criar uma entrada:

Mesmos campos que `AuditEntry`, exceto `id` e `timestamp` (gerados automaticamente).
`details` e `errorMessage` sao opcionais.

**AuditAction** — 15 variantes:

| Grupo | Acoes |
|-------|-------|
| People | `PERSON_CREATED`, `PERSON_UPDATED`, `PERSON_DEACTIVATED`, `PERSON_REACTIVATED` |
| Roles | `ROLE_ASSIGNED`, `ROLE_DEACTIVATED`, `ROLE_REACTIVATED` |
| Lookup Tables | `LOOKUP_CREATED`, `LOOKUP_UPDATED`, `LOOKUP_TOGGLED` |
| Lookup Aprovacao | `LOOKUP_APPROVED`, `LOOKUP_REJECTED` |
| Lookup Requests | `LOOKUP_REQUEST_CREATED`, `LOOKUP_REQUEST_APPROVED`, `LOOKUP_REQUEST_REJECTED` |

**AuditOutcome:** `"SUCCESS" | "FAILURE"`

### Comportamento

- **Capacidade maxima:** 10.000 entradas
- **Evicao:** FIFO — quando excede 10.000, as mais antigas sao removidas
- **Ordenacao:** `list()` retorna em ordem DESC (mais recente primeiro)
- **Paginacao:** via `limit` e `offset` em `AuditListOptions`
- **Filtro por ator:** `listByActor(actorId, options)` filtra antes de paginar

---

## 4. API Routes — Gestao de Pessoas

Todas proxiadas para People Context (`http://people-context:3000`).
Mutacoes geram entradas no audit store.

| Metodo | BFF Path | Backend Path | Audit Action | Notas |
|--------|----------|-------------|--------------|-------|
| GET | `/api/admin/people` | `/api/v1/people` | — | Listagem, read-only |
| GET | `/api/admin/people/:id` | `/api/v1/people/:id` | — | UUID validado |
| POST | `/api/admin/people` | `/api/v1/people` | `PERSON_CREATED` | targetId: `"new"` |
| PUT | `/api/admin/people/:id` | `/api/v1/people/:id` | `PERSON_UPDATED` | UUID validado |

### Exemplo — Criar pessoa

```bash
curl -X POST https://conecta.acdgbrasil.com.br/api/admin/people \
  -H "Content-Type: application/json" \
  -H "X-Requested-With: XMLHttpRequest" \
  -H "Cookie: __Host-session=<session_id>" \
  -d '{
    "fullName": "Maria Silva Santos",
    "cpf": "12345678901",
    "birthDate": "1985-03-15"
  }'
```

### Exemplo — Atualizar pessoa

```bash
curl -X PUT https://conecta.acdgbrasil.com.br/api/admin/people/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  -H "Content-Type: application/json" \
  -H "X-Requested-With: XMLHttpRequest" \
  -H "Cookie: __Host-session=<session_id>" \
  -d '{
    "fullName": "Maria Silva Santos Oliveira"
  }'
```

---

## 5. API Routes — Gestao de Roles

Todas proxiadas para People Context.
IDs de pessoa e role sao validados como UUID.

| Metodo | BFF Path | Backend Path | Audit Action |
|--------|----------|-------------|--------------|
| GET | `/api/admin/people/:id/roles` | `/api/v1/people/:id/roles` | — |
| POST | `/api/admin/people/:id/roles` | `/api/v1/people/:id/roles` | `ROLE_ASSIGNED` |
| PUT | `/api/admin/people/:id/roles/:roleId/deactivate` | mesmo path | `ROLE_DEACTIVATED` |
| PUT | `/api/admin/people/:id/roles/:roleId/reactivate` | mesmo path | `ROLE_REACTIVATED` |

**Nota:** nas acoes de deactivate/reactivate, o campo `details` do audit entry contem `"roleId: <uuid>"`.

### Exemplo — Atribuir role

```bash
curl -X POST https://conecta.acdgbrasil.com.br/api/admin/people/a1b2c3d4-e5f6-7890-abcd-ef1234567890/roles \
  -H "Content-Type: application/json" \
  -H "X-Requested-With: XMLHttpRequest" \
  -H "Cookie: __Host-session=<session_id>" \
  -d '{
    "systemName": "social-care",
    "roleName": "patient"
  }'
```

---

## 6. API Routes — Lookup Tables

Proxiadas para Social Care (`http://social-care:3000`) em `/api/v1/dominios/`.

### Whitelist de tabelas

O BFF valida o parametro `:tableName` contra uma whitelist fixa.
Qualquer valor fora da lista retorna `400 Invalid lookup table name`.
Isso previne path traversal.

**Tabelas permitidas:**

| Nome da tabela |
|---------------|
| `dominio_tipo_identidade` |
| `dominio_tipo_deficiencia` |
| `dominio_parentesco` |
| `dominio_programa_social` |
| `dominio_condicao_ocupacao` |
| `dominio_tipo_ingresso` |
| `dominio_escolaridade` |
| `dominio_tipo_beneficio` |
| `dominio_efeito_condicionalidade` |
| `dominio_tipo_violacao` |
| `dominio_servico_vinculo` |
| `dominio_tipo_medida` |
| `dominio_unidade_realizacao` |

### Rotas

| Metodo | BFF Path | Backend Path | Audit Action |
|--------|----------|-------------|--------------|
| GET | `/api/admin/lookups/:tableName` | `/api/v1/dominios/:tableName` | — |
| POST | `/api/admin/lookups/:tableName` | `/api/v1/dominios/:tableName` | `LOOKUP_CREATED` |
| PUT | `/api/admin/lookups/:tableName/:id` | `/api/v1/dominios/:tableName/:id` | `LOOKUP_UPDATED` |
| PATCH | `/api/admin/lookups/:tableName/:id/toggle` | `/api/v1/dominios/:tableName/:id/toggle` | `LOOKUP_TOGGLED` |

**Nota:** o `targetId` no audit entry e `tableName` para POST e `tableName/entryId` para PUT e PATCH.

### Exemplo — Criar entrada em lookup table

```bash
curl -X POST https://conecta.acdgbrasil.com.br/api/admin/lookups/dominio_parentesco \
  -H "Content-Type: application/json" \
  -H "X-Requested-With: XMLHttpRequest" \
  -H "Cookie: __Host-session=<session_id>" \
  -d '{ "label": "Padrasto" }'
```

### Exemplo — Toggle ativo/inativo

```bash
curl -X PATCH https://conecta.acdgbrasil.com.br/api/admin/lookups/dominio_parentesco/b2c3d4e5-f6a7-8901-bcde-f12345678901/toggle \
  -H "X-Requested-With: XMLHttpRequest" \
  -H "Cookie: __Host-session=<session_id>"
```

---

## 7. API Routes — Lookup Requests

Workflow de governanca: assistentes sociais solicitam novos valores de lookup,
administradores aprovam ou rejeitam.

### IMPORTANTE — Ordem de registro das rotas

As rotas de `/lookups/requests` sao registradas **ANTES** de `/lookups/:tableName`
no codigo. Isso e obrigatorio porque o Hono faz match na ordem de registro.
Se `/lookups/:tableName` viesse primeiro, a string `"requests"` seria capturada
como um `:tableName`, resultando em `400 Invalid lookup table name`.

```
// Ordem no api_admin.ts:
admin.get("/lookups/requests", ...)       // <- PRIMEIRO
admin.post("/lookups/requests", ...)
admin.put("/lookups/requests/:requestId/approve", ...)
admin.put("/lookups/requests/:requestId/reject", ...)
admin.get("/lookups/:tableName", ...)     // <- DEPOIS
admin.post("/lookups/:tableName", ...)
```

### Rotas

| Metodo | BFF Path | Backend Path | Audit Action | Body |
|--------|----------|-------------|--------------|------|
| GET | `/api/admin/lookups/requests` | `/api/v1/dominios/requests` | — | — |
| POST | `/api/admin/lookups/requests` | `/api/v1/dominios/requests` | `LOOKUP_REQUEST_CREATED` | `{ tableName, label }` |
| PUT | `/api/admin/lookups/requests/:requestId/approve` | `/api/v1/dominios/requests/:requestId/approve` | `LOOKUP_REQUEST_APPROVED` | — |
| PUT | `/api/admin/lookups/requests/:requestId/reject` | `/api/v1/dominios/requests/:requestId/reject` | `LOOKUP_REQUEST_REJECTED` | `{ reviewNote }` (obrigatorio) |

O `:requestId` e validado como UUID.

### Exemplo — Solicitar novo valor

```bash
curl -X POST https://conecta.acdgbrasil.com.br/api/admin/lookups/requests \
  -H "Content-Type: application/json" \
  -H "X-Requested-With: XMLHttpRequest" \
  -H "Cookie: __Host-session=<session_id>" \
  -d '{
    "tableName": "dominio_parentesco",
    "label": "Tio(a) de criacao"
  }'
```

### Exemplo — Rejeitar solicitacao

```bash
curl -X PUT https://conecta.acdgbrasil.com.br/api/admin/lookups/requests/c3d4e5f6-a7b8-9012-cdef-123456789012/reject \
  -H "Content-Type: application/json" \
  -H "X-Requested-With: XMLHttpRequest" \
  -H "Cookie: __Host-session=<session_id>" \
  -d '{ "reviewNote": "Ja existe valor equivalente: Parente proximo" }'
```

---

## 8. API Routes — Audit e Stats

Rotas locais do BFF (nao proxiadas para backends).

### GET /api/admin/audit

Retorna entradas do audit store paginadas, ordem DESC (mais recente primeiro).

**Query params:**

| Param | Tipo | Default | Max | Notas |
|-------|------|---------|-----|-------|
| `limit` | number | 50 | 100 | Se NaN ou <= 0, usa 50 |
| `offset` | number | 0 | — | Se NaN ou < 0, usa 0 |

**Resposta:**
```json
{
  "entries": [
    {
      "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "timestamp": "2026-04-11T10:30:00.000Z",
      "actorId": "367349956392059030",
      "actorName": "Gabriel Aderaldo",
      "action": "PERSON_CREATED",
      "targetId": "new",
      "outcome": "SUCCESS"
    }
  ],
  "total": 142
}
```

### GET /api/admin/stats

Dashboard agregado. Faz 2 requests em paralelo para os backends e combina com dados locais.

**Resposta:**
```json
{
  "people": { "total": 245 },
  "roles": { "active": 312 },
  "audit": { "total": 142 }
}
```

| Campo | Origem | Como e calculado |
|-------|--------|-----------------|
| `people.total` | People Context | GET `/api/v1/people?limit=0` — extrai campo `total` da resposta |
| `roles.active` | People Context | GET `/api/v1/roles?active=true` — extrai campo `total` da resposta |
| `audit.total` | Local (BFF) | `auditStore.count()` |

Se um backend estiver indisponivel, o valor correspondente retorna `0`.

---

## 9. Seguranca

### Validacao de parametros

| Parametro | Validacao | Resposta em caso de falha |
|-----------|-----------|--------------------------|
| `:id`, `:roleId`, `:requestId` | Regex UUID v4: `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i` | 400 `{ "error": "Invalid ID format" }` |
| `:tableName` | Whitelist de 13 tabelas permitidas | 400 `{ "error": "Invalid lookup table name" }` |
| Body JSON | Parse tentado em POST/PUT/DELETE/PATCH com `content-type: application/json` | 400 `{ "error": "Malformed JSON body" }` |
| `limit` (audit) | `Number.isFinite && > 0`, max 100 | Default: 50 |
| `offset` (audit) | `Number.isFinite && >= 0` | Default: 0 |

### Defesa em profundidade

Mesmo com o `adminGuard` aplicado via `app.use`, **cada handler verifica a sessao individualmente**:

```typescript
const session = c.get("session");
if (!session) return c.json({ error: "Unauthorized" }, 401);
```

Isso e intencional — defesa em camadas contra bypass de middleware.

### Headers enviados aos backends

| Header | Valor | Origem |
|--------|-------|--------|
| `Authorization` | `Bearer <access_token>` | Sessao do usuario |
| `X-Actor-Id` | `session.userSub` | Sub do JWT Zitadel |
| `Content-Type` | `application/json` | Quando ha body |

### Mapeamento de erros do RemoteClient

| RemoteError | HTTP Status | Descricao |
|-------------|-------------|-----------|
| `UNAUTHORIZED` | 401 | Token expirado ou invalido |
| `SERVER_ERROR` | 502 | Backend retornou erro |
| `NETWORK_ERROR` | 502 | Backend inalcancavel |
| `TIMEOUT` | 504 | Backend nao respondeu a tempo |

---

## 10. Client Service — Lookup Admin

**Arquivo:** `src/client/services/lookup-admin-service.ts`

Service client-side para operacoes de lookup tables no painel admin.
Usa `base-client.ts` para fetch com headers de seguranca (`X-Requested-With`, `credentials: "same-origin"`).

### Funcoes

| Funcao | Metodo | Path | Retorno |
|--------|--------|------|---------|
| `listEntries(tableName)` | GET | `/api/admin/lookups/:tableName` | `Result<readonly LookupEntry[], ServiceError>` |
| `createEntry(tableName, { label })` | POST | `/api/admin/lookups/:tableName` | `Result<LookupEntry, ServiceError>` |
| `updateEntry(tableName, entryId, { label })` | PUT | `/api/admin/lookups/:tableName/:id` | `Result<LookupEntry, ServiceError>` |
| `toggleEntry(tableName, entryId)` | PATCH | `/api/admin/lookups/:tableName/:id/toggle` | `Result<LookupEntry, ServiceError>` |
| `listRequests()` | GET | `/api/admin/lookups/requests` | `Result<readonly LookupRequest[], ServiceError>` |
| `createRequest({ tableName, label })` | POST | `/api/admin/lookups/requests` | `Result<LookupRequest, ServiceError>` |
| `approveRequest(requestId)` | PUT | `/api/admin/lookups/requests/:id/approve` | `Result<LookupRequest, ServiceError>` |
| `rejectRequest(requestId, reviewNote)` | PUT | `/api/admin/lookups/requests/:id/reject` | `Result<LookupRequest, ServiceError>` |

### Tipos exportados

```typescript
type LookupEntry = Readonly<{
  id: string;
  label: string;
  active: boolean;
}>;

type LookupRequest = Readonly<{
  id: string;
  tableName: string;
  label: string;
  status: "pendente" | "aprovado" | "rejeitado";
  requestedBy: string;
  reviewedBy: string | null;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
}>;
```

---

## 11. Integracao no server.ts

O wiring do Admin Hub acontece em `src/server.ts`:

```typescript
// 1. Instanciar audit store (uma unica vez)
const auditStore = createAuditStore();

// 2. Aplicar adminGuard nas rotas admin (apos authGuard)
app.use("/admin/*", adminGuard());
app.use("/api/admin/*", adminGuard());

// 3. Montar sub-app de rotas admin
app.route("/api/admin", createAdminApiRoutes({ remoteClient, auditStore }));
```

A funcao `createAdminApiRoutes` recebe `AdminRoutesDeps`:

```typescript
type AdminRoutesDeps = Readonly<{
  remoteClient: RemoteClient;
  auditStore: AuditStore;
}>;
```

O `remoteClient` e o mesmo usado pelas rotas `/api/*` regulares.
O `auditStore` e exclusivo do Admin Hub.

---

## 12. Testes

| Arquivo | Testes | Escopo |
|---------|--------|--------|
| `tests/middleware/admin_guard_test.ts` | 12 | Middleware RBAC: roles permitidas, bloqueio, JSON vs redirect |
| `tests/adapters/audit_store_test.ts` | 16 | Store: append, list, listByActor, paginacao, FIFO, count |
| `tests/routes/api_admin_test.ts` | 16 | Rotas people + roles + audit + stats |
| `tests/routes/api_admin_lookup_test.ts` | 12 | Rotas lookups + requests + whitelist + UUID |

**Total: 56 testes** cobrindo o Admin Hub.

Executar:
```bash
deno test tests/middleware/admin_guard_test.ts tests/adapters/audit_store_test.ts tests/routes/api_admin_test.ts tests/routes/api_admin_lookup_test.ts
```
