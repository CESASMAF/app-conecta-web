# CARD: Correção Definitiva do Admin Panel — BFF Social Care Deno

> **Serviço:** social-care-deno (Deno 2.x / Hono)
> **Escopo:** Adapter layer (routes, services, middleware) + Client layer (services, viewmodel, views)
> **Prioridade:** Alta
> **Tipo:** Fix + Refactor (corrigir bugs + limpar arquitetura)

---

## 1. Contexto e Diagnóstico

### O que é o Admin Panel

O Admin Panel é um dashboard de 5 abas dentro do BFF Social Care Deno que permite a administradores gerenciar:

1. **Dashboard** — métricas agregadas (total pessoas, roles ativas, solicitações pendentes)
2. **Pessoas** — CRUD de pessoas via proxy para o People Context
3. **Lookups** — gerenciamento de tabelas de domínio via proxy para o Social Care (Swift)
4. **Solicitações** — workflow de aprovação/rejeição de novos valores de lookup
5. **Auditoria** — log de ações administrativas

### Arquitetura atual

```
Browser (admin-hub-page.tsx)
  └─ admin-service.ts / lookup-admin-service.ts
      └─ base-client.ts (fetch → Result)
          ↓ /api/admin/*
Hono BFF
  └─ adminGuard (role: admin | owner)
      └─ api_admin.ts (754 linhas)
          ├─ /people, /roles → proxy → People Context
          ├─ /lookups, /requests → proxy → Social Care (Swift)
          ├─ /audit → audit_store.ts (in-memory)
          └─ /stats → agrega 3 backends + audit count
```

### Por que está quebrando

Existem **3 categorias de problemas**: bugs de integração, código morto confundindo a manutenção, e responsabilidades que não pertencem ao BFF.

---

## 2. Problemas Identificados (12 issues)

### Categoria A — Bugs de Integração (quebram funcionalidade)

#### BUG-01: Response shape mismatch entre BFF e client

**Severidade:** CRITICAL — causa dados undefined/null no frontend

**O problema:**

O `base-client.ts` (linha 54) extrai `json.data` de toda resposta:

```typescript
// base-client.ts:54
const json = await response.json();
return { ok: true, value: json.data as T };
```

Mas o `api_admin.ts` repassa o body do backend **cru**, sem wrapper:

```typescript
// api_admin.ts:167 (e repetido em ~20 rotas)
return c.json(toJsonBody(result.value.body), 200);
```

Se o People Context retorna `{ data: [...] }`, o client faz `json.data` e funciona por acidente. Mas se retorna `[...]` direto ou `{ items: [...] }`, o client recebe `undefined`.

**O `/stats` é a única rota que wrapa corretamente:**

```typescript
// api_admin.ts:742
return c.json({ data: { totalPeople, ... } });
```

**Fix:** Todas as rotas admin devem normalizar a resposta para `{ data: ... }` antes de enviar ao client.

---

#### BUG-02: Backend HTTP status engolido — tudo vira 502

**Severidade:** HIGH — erros 400/404/409/422 do backend viram 502

**O problema:**

O `RemoteClient.classifyResponse` (remote_client.ts:58-62) retorna `err("SERVER_ERROR")` para qualquer status >= 500, e `err("UNAUTHORIZED")` para 401. Mas para status 400, 404, 409, 422 — ele retorna **`ok()`** com o status real.

O `api_admin.ts` só checa `if (!result.ok)` e mapeia via `ERROR_STATUS_MAP`:

```typescript
// api_admin.ts:50-55
const ERROR_STATUS_MAP: Record<RemoteError, ContentfulStatusCode> = {
  UNAUTHORIZED: 401,
  SERVER_ERROR: 502,
  NETWORK_ERROR: 502,
  TIMEOUT: 504,
};
```

Isso significa:
- Backend retorna **404** → RemoteClient retorna `ok({ status: 404, body })` → BFF retorna `c.json(body, 404)` via `toResponseStatus` → **funciona por acidente** (mas sem `{ data: ... }` wrapper)
- Backend retorna **500** → RemoteClient retorna `err("SERVER_ERROR")` → BFF retorna `c.json({ error: "SERVER_ERROR" }, 502)` → **perde o body do erro original**

O body de erro do backend (com código estruturado tipo PAT-001, mensagem legível) é **perdido** quando o status é >= 500. O client recebe apenas `{ error: "SERVER_ERROR" }`.

**Fix:** Repassar o status real E o body de erro do backend. O BFF é proxy, não deve mascarar erros.

---

#### BUG-03: `rejectRequest` sempre envia reviewNote vazio

**Severidade:** MEDIUM — rejeições ficam sem justificativa

**O problema:**

```typescript
// admin-hub-page.tsx:171
const handleReject = async (requestId: string): Promise<void> => {
  const r = await lookupSvc.rejectRequest(requestId, ""); // ← hardcoded ""
```

O assistente social rejeita uma solicitação de lookup mas nunca pode informar o motivo.

**Fix:** Adicionar modal/prompt para capturar reviewNote antes de chamar reject.

---

#### BUG-04: Audit list retorna `{ entries, total }` mas client espera array

**Severidade:** MEDIUM — aba auditoria pode mostrar vazio

**O problema:**

O `GET /api/admin/audit` retorna:
```typescript
// api_admin.ts:685
return c.json(result); // result = { entries: [...], total: number }
```

Mas o `admin-service.ts` espera:
```typescript
export const listAudit = (): Promise<Result<readonly AuditEntry[], ServiceError>> =>
  get<readonly AuditEntry[]>("/api/admin/audit?limit=50&offset=0");
```

E o `base-client.ts` faz `json.data` — mas o audit retorna `{ entries, total }` sem wrapper `data`. Resultado: `json.data` é `undefined`.

**Fix:** Normalizar resposta do audit para `{ data: entries }` ou ajustar o client para ler `entries`.

---

### Categoria B — Código Morto (confunde manutenção)

#### DEAD-01: `src/domain/people/` — 6 arquivos, 0 imports

**Arquivos:**
```
src/domain/people/
  value-objects/system_role.ts
  value-objects/person.ts
  repositories/people_repository.ts
  repositories/role_repository.ts
  errors.ts
  mod.ts
```

**Confirmação:** `grep -r "from.*domain/people" src/` retorna zero resultados.

**Por que existe:** Foi criado com a intenção de ter uma camada domain para People no BFF. Mas o BFF é um **proxy**, não é dono do bounded context People. As validações de domínio pertencem ao People Context.

**Fix:** Deletar diretório inteiro.

---

#### DEAD-02: `src/application/people/` — 8 arquivos, 0 imports

**Arquivos:**
```
src/application/people/
  use-cases/search_people.ts
  use-cases/find_person_by_id.ts
  use-cases/find_person_by_cpf.ts
  use-cases/register_person.ts
  use-cases/assign_role.ts
  use-cases/get_person_roles.ts
  use-cases/fetch_lookup_tables.ts
  ports/people-proxy.ts
```

**Confirmação:** `grep -r "from.*application/people" src/` retorna zero resultados.

**Por que existe:** Use cases foram criados mas as rotas em `api_admin.ts` chamam `remoteClient` diretamente, bypassando completamente esta camada.

O `PeopleProxy` port (people-proxy.ts) só define `get` e `post` — falta `put` e `delete` — então as rotas de deactivate/reactivate nunca poderiam usá-lo mesmo.

**Fix:** Deletar diretório inteiro.

---

### Categoria C — Responsabilidades que não pertencem ao BFF

#### ARCH-01: Audit Store in-memory — efêmero e redundante

**Severidade:** HIGH — perde dados no restart, duplica responsabilidade

**O problema:**

```typescript
// audit_store.ts:21
let entries: readonly AuditEntry[] = [];
```

- Max 10.000 entries, FIFO eviction
- **Perde tudo quando o Deno reinicia** (deploy, crash, restart)
- O People Context já registra `actorId` em todos os eventos
- O Social Care (Swift) já tem tabela `audit_trail` persistida
- Este é um **terceiro** audit trail, efêmero, que não serve pra nada em produção

**Fix:** Remover. Se precisar de audit no admin, consumir dos backends que já persistem.

**ALTERNATIVA (se quiser manter temporariamente):** Manter como log efêmero para a sessão do admin (útil para debugging), mas renomear para `AdminActivityLog` e deixar claro na UI que é "atividade recente desta sessão", não "audit trail permanente". Documentar que é temporário.

---

#### ARCH-02: Dashboard stats com agregação cross-service

**Severidade:** MEDIUM — lógica de negócio no proxy

**O problema:**

```typescript
// api_admin.ts:729-735
const reqBody = requestsResult.value.body as { data?: unknown[] };
if (Array.isArray(reqBody?.data)) {
  pendingCount = reqBody.data.filter(
    (item: unknown) =>
      typeof item === "object" && item !== null &&
      (item as Record<string, unknown>).status === PENDING_REQUEST_STATUS,
  ).length;
}
```

O BFF faz 3 requests paralelos, extrai totais com casts unsafe, e filtra manualmente pelo status "pendente". Isso é lógica de negócio — o BFF deveria apenas repassar números prontos.

**Fix:** Cada backend deveria ter endpoint `/count` ou `/stats`. Enquanto não tiver, manter mas com tipagem segura e indicação de falha parcial.

---

#### ARCH-03: Tipos duplicados em 3 camadas

**Severidade:** LOW — drift silencioso entre definições

`Person`, `SystemRole`, `AssignRoleInput` definidos em:
1. `src/client/services/people-service.ts` (usado pelo non-admin)
2. `src/client/services/admin-service.ts` (usado pelo admin)
3. `src/domain/people/` (não usado por ninguém — DEAD-01)

**Fix:** Depois de deletar DEAD-01, consolidar tipos. O `admin-service.ts` deve importar `Person` e `SystemRole` de `people-service.ts` ao invés de redefinir.

---

## 3. Plano de Correção — 6 Tickets Ordenados

### Ticket 1: Limpar código morto

**Escopo:** Deletar sem alterar funcionalidade

**Deletar:**
```
src/domain/people/                    (6 arquivos)
src/application/people/               (8 arquivos)
```

**Verificação:** `deno task build` + `deno task test` devem passar sem mudança.

**Arquivos tocados:** 0 modificados, 14 deletados

---

### Ticket 2: Normalizar response shape nas rotas admin

**Escopo:** Todas as rotas de `api_admin.ts` devem retornar `{ data: ... }` consistente

**O que muda em `api_admin.ts`:**

Criar helper de normalização:

```typescript
/** Wraps backend response body in { data: ... } for consistent client consumption. */
const toDataResponse = (
  body: unknown,
): Readonly<{ data: unknown }> => {
  if (body === null || body === undefined) return { data: null };
  // If backend already wraps in { data: ... }, pass through
  if (
    typeof body === "object" &&
    body !== null &&
    "data" in body
  ) {
    return body as Readonly<{ data: unknown }>;
  }
  // Otherwise wrap
  return { data: body };
};
```

**Alterar TODAS as rotas de sucesso** (aproximadamente 20 ocorrências):

```typescript
// ANTES:
return c.json(toJsonBody(result.value.body), 200);

// DEPOIS:
return c.json(toDataResponse(result.value.body), toResponseStatus(result.value.status));
```

**Alterar rota de audit:**

```typescript
// ANTES:
return c.json(result); // { entries: [...], total: N }

// DEPOIS:
return c.json({ data: result.entries, meta: { total: result.total } });
```

**Alterar no client — `admin-service.ts` listAudit:**

```typescript
// Agora retorna { data: AuditEntry[], meta: { total } }
// base-client.ts extrai json.data automaticamente — funciona
```

**Arquivos tocados:** `api_admin.ts`

**Testes:** Atualizar `tests/routes/api_admin_test.ts` para verificar shape `{ data: ... }` em todas as respostas.

---

### Ticket 3: Repassar HTTP status real do backend

**Escopo:** O BFF não deve mascarar erros do backend

**O que muda em `api_admin.ts`:**

O problema é que `ERROR_STATUS_MAP` mapeia `RemoteError` para status fixos. Mas quando o backend retorna 4xx, o `RemoteClient` retorna `ok()` com o status real — e o BFF já repassa via `toResponseStatus()`. O problema real é quando `RemoteClient` retorna `err()`.

**Alterar error responses para incluir body quando disponível:**

```typescript
// ANTES (todas as rotas de erro):
if (!result.ok) {
  return c.json({ error: result.error }, ERROR_STATUS_MAP[result.error]);
}

// DEPOIS:
if (!result.ok) {
  return c.json(
    { error: result.error, message: `Upstream service error: ${result.error}` },
    ERROR_STATUS_MAP[result.error],
  );
}
```

**Alterar `RemoteClient` para capturar body de erro em 4xx:**

Atualmente `classifyResponse` retorna `ok()` com o body para 4xx. Isso já funciona — o BFF repassa. Mas o status original pode se perder se o BFF retorna 200 ao invés do status real.

**Verificar todas as rotas:** As que usam `toResponseStatus(result.value.status)` repassam corretamente. As que hardcodam `200` precisam mudar:

```typescript
// ANTES (linhas 167, 292, 423, 553):
return c.json(toJsonBody(result.value.body), 200);

// DEPOIS:
return c.json(toDataResponse(result.value.body), toResponseStatus(result.value.status));
```

Isso garante que se o People Context retorna 404, o BFF retorna 404 (não 200).

**Arquivos tocados:** `api_admin.ts`

**Testes:** Adicionar testes para 404, 409, 422 passthrough.

---

### Ticket 4: Decidir destino do Audit Store

**Escopo:** Decisão arquitetural + implementação

**Decisão: Opção A — Remover completamente** (confirmado pelo P.O.)

- Deletar `src/adapters/admin/audit_store.ts`
- Deletar `src/adapters/admin/types.ts`
- Remover todas as chamadas `auditStore.append(...)` em `api_admin.ts`
- Remover `GET /api/admin/audit` rota
- Remover `auditStore` de `AdminRoutesDeps`
- Remover criação em `server.ts`
- Remover aba "auditoria" do viewmodel/page/components
- Remover `AuditEntry`, `AuditAction` do viewmodel types
- Remover `listAudit` de `admin-service.ts`
- Atualizar testes

**Arquivos tocados:**
```
DELETAR:
  src/adapters/admin/audit_store.ts
  src/adapters/admin/types.ts

MODIFICAR:
  src/routes/api_admin.ts          — remover audit imports, append calls, /audit rota
  src/server.ts                    — remover createAuditStore, auditStore injection
  src/client/services/admin-service.ts      — remover listAudit
  src/client/viewmodels/admin-hub/types.ts  — remover AuditEntry, AuditAction, aba auditoria
  src/client/viewmodels/admin-hub/reducer.ts — remover LOAD_AUDIT_* actions
  src/client/viewmodels/admin-hub/strings.ts — remover strings de auditoria
  src/client/views/pages/admin-hub-page.tsx  — remover aba auditoria
  src/client/views/components/admin/audit-list.tsx — DELETAR
  tests/client/viewmodels/admin_hub_test.ts  — remover testes de audit
  tests/routes/api_admin_test.ts             — remover testes de audit
```

---

### Ticket 5: Tipar stats route com segurança + indicar falha parcial

**Escopo:** Refatorar `/stats` para ser type-safe e transparente

**O que muda em `api_admin.ts`:**

```typescript
// ANTES:
const reqBody = requestsResult.value.body as { data?: unknown[] };
// ... filter com (item as Record<string, unknown>).status ...

// DEPOIS — type guard:
type RequestItem = Readonly<{ status: string }>;

const isRequestItem = (v: unknown): v is RequestItem =>
  typeof v === "object" && v !== null && "status" in v &&
  typeof (v as Record<string, unknown>).status === "string";

const extractPendingCount = (body: unknown): number => {
  if (!body || typeof body !== "object") return 0;
  const arr = Array.isArray(body) ? body
    : "data" in body && Array.isArray((body as Record<string, unknown>).data)
    ? (body as Record<string, unknown>).data as unknown[]
    : [];
  return arr.filter((item) => isRequestItem(item) && item.status === PENDING_REQUEST_STATUS).length;
};
```

**Indicar falha parcial na resposta:**

```typescript
type StatsHealth = "ok" | "partial" | "degraded";

return c.json({
  data: {
    totalPeople: peopleTotal,
    activeRoles: rolesActive,
    pendingRequests: pendingCount,
    recentAuditCount: 0, // audit store removido (Ticket 4)
  },
  health: (peopleResult.ok && rolesResult.ok) ? "ok" : "partial",
});
```

**O que muda no client:**

- `DashboardStats` ganha campo opcional `health?: string`
- `DashboardTab` mostra aviso sutil quando `health !== "ok"`: "Alguns dados podem estar incompletos"

**Arquivos tocados:** `api_admin.ts`, `admin-service.ts`, `types.ts` (viewmodel), `dashboard-tab.tsx`

---

### Ticket 6: Fix review note + consolidar tipos + minor UI fixes

**Escopo:** Correções pontuais restantes

#### 6a. Review note no reject

**Arquivo:** `src/client/views/pages/admin-hub-page.tsx`

Adicionar state local para reviewNote e modal/prompt antes de rejeitar:

```typescript
// Opção simples: window.prompt (temporário, funcional)
const handleReject = async (requestId: string): Promise<void> => {
  const reviewNote = globalThis.prompt("Motivo da rejeição:");
  if (reviewNote === null) return; // cancelou
  const r = await lookupSvc.rejectRequest(requestId, reviewNote);
  // ... dispatch
};
```

Ou, para UX melhor: adicionar action `OPEN_REJECT_MODAL` / `CLOSE_REJECT_MODAL` no reducer, com componente modal dedicado. Decisão de escopo — o `prompt` funciona como MVP.

#### 6b. Consolidar tipos Person/SystemRole

**Arquivo:** `src/client/services/admin-service.ts`

```typescript
// ANTES:
import type { Person, SystemRole } from "./people-service.ts";
// ↑ Já faz isso! Verificar se realmente importa de people-service ou redefine
```

Verificar se `admin-service.ts` reexporta ou redefine. Se redefine, trocar por import.

#### 6c. Inline styles → tokens

**Arquivos:** `toast-container.tsx`, `requests-list.tsx`

```typescript
// ANTES:
style={{ marginLeft: "8px" }}

// DEPOIS:
import { css } from "hono/css";
import { spacing } from "../../styles/tokens.ts";
const mlSmall = css`margin-left: ${spacing.xs};`;
// ...
class={mlSmall}
```

#### 6d. Toast auto-dismiss

**Arquivo:** `admin-hub-page.tsx`

Adicionar useEffect para auto-dismiss após 4 segundos:

```typescript
useEffect(() => {
  if (state.toasts.length === 0) return;
  const latest = state.toasts[state.toasts.length - 1];
  if (!latest) return;
  const timer = setTimeout(() => {
    dispatch({ type: "DISMISS_TOAST", toastId: latest.id });
  }, 4000);
  return () => clearTimeout(timer);
}, [state.toasts.length]);
```

**Arquivos tocados:** `admin-hub-page.tsx`, `admin-service.ts`, `toast-container.tsx`, `requests-list.tsx`

---

## 4. Arquivos — Visão Completa

### Arquivos a DELETAR (14 + 2 opcionais)

```
CÓDIGO MORTO (deletar sempre):
  src/domain/people/value-objects/system_role.ts
  src/domain/people/value-objects/person.ts
  src/domain/people/repositories/people_repository.ts
  src/domain/people/repositories/role_repository.ts
  src/domain/people/errors.ts
  src/domain/people/mod.ts
  src/application/people/use-cases/search_people.ts
  src/application/people/use-cases/find_person_by_id.ts
  src/application/people/use-cases/find_person_by_cpf.ts
  src/application/people/use-cases/register_person.ts
  src/application/people/use-cases/assign_role.ts
  src/application/people/use-cases/get_person_roles.ts
  src/application/people/use-cases/fetch_lookup_tables.ts
  src/application/people/ports/people-proxy.ts

AUDIT (Ticket 4 — Opção A confirmada):
  src/adapters/admin/audit_store.ts
  src/adapters/admin/types.ts
  src/client/views/components/admin/audit-list.tsx
```

### Arquivos a MODIFICAR

```
src/routes/api_admin.ts                         — Tickets 2, 3, 4, 5
src/server.ts                                   — Ticket 4 (remover audit se Opção A)
src/client/services/admin-service.ts            — Tickets 2, 4, 6b
src/client/viewmodels/admin-hub/types.ts        — Tickets 4, 5
src/client/viewmodels/admin-hub/reducer.ts      — Ticket 4
src/client/viewmodels/admin-hub/strings.ts      — Tickets 4, 6a
src/client/views/pages/admin-hub-page.tsx       — Tickets 4, 6a, 6d
src/client/views/components/admin/dashboard-tab.tsx  — Ticket 5
src/client/views/components/admin/toast-container.tsx — Ticket 6c
src/client/views/components/admin/requests-list.tsx   — Ticket 6c
tests/routes/api_admin_test.ts                  — Tickets 2, 3, 4
tests/client/viewmodels/admin_hub_test.ts       — Ticket 4
```

---

## 5. Por que o People Context NÃO muda

O BFF do Social Care é um **proxy seguro** (Iron Frontier) entre o browser e os backends. Ele:

1. **Esconde tokens** — o browser envia cookie, o BFF injeta Bearer token
2. **Esconde URLs** — o browser fala com `/api/admin/*`, o BFF roteia para `peopleContextBaseUrl`
3. **Valida input** — UUIDs, whitelist de tabelas, JSON válido
4. **Controla acesso** — admin guard middleware

O BFF **não é dono** do bounded context People. Ele não deve:
- Ter domain layer para People (por isso deletamos `src/domain/people/`)
- Ter use cases para People (por isso deletamos `src/application/people/`)
- Manter audit trail próprio (o People Context e o Social Care Swift já fazem isso)
- Agregar stats com lógica de negócio (filtrar por status "pendente" é lógica)

O People Context já tem todos os endpoints necessários. O BFF é apenas o intermediário seguro.

---

## 6. Testes Necessários por Ticket

### Ticket 1 (código morto)

| Teste | Verifica |
|-------|----------|
| `deno task build` | Bundles compilam sem imports quebrados |
| `deno task test` | Nenhum teste existente quebra |

### Ticket 2 (response shape)

| Teste | Verifica |
|-------|----------|
| `GET /api/admin/people` retorna `{ data: [...] }` | Shape normalizada |
| `GET /api/admin/people/:id` retorna `{ data: {...} }` | Shape normalizada |
| `POST /api/admin/people` retorna `{ data: {...} }` | Shape normalizada |
| `GET /api/admin/people/:id/roles` retorna `{ data: [...] }` | Shape normalizada |
| `GET /api/admin/lookups/:table` retorna `{ data: [...] }` | Shape normalizada |
| `GET /api/admin/audit` retorna `{ data: [...], meta: { total } }` | Shape + meta |
| `GET /api/admin/stats` retorna `{ data: {...} }` | Já funciona, verificar |

### Ticket 3 (HTTP status passthrough)

| Teste | Verifica |
|-------|----------|
| Backend retorna 404 → BFF retorna 404 | Status preservado |
| Backend retorna 409 → BFF retorna 409 | Status preservado |
| Backend retorna 422 → BFF retorna 422 | Status preservado |
| Backend retorna 500 → BFF retorna 502 | Mapeado (upstream error) |
| Backend timeout → BFF retorna 504 | Mapeado (timeout) |

### Ticket 4 (audit)

| Teste | Verifica |
|-------|----------|
| `/api/admin/audit` retorna 404 (se removido) | Endpoint não existe mais |
| Mutations não chamam `auditStore.append` | Sem side effects |
| Viewmodel não tem aba "auditoria" | State limpo |

### Ticket 5 (stats type-safe)

| Teste | Verifica |
|-------|----------|
| Stats com backends saudáveis → `health: "ok"` | Happy path |
| Stats com 1 backend falhando → `health: "partial"` | Degradação transparente |
| Stats com body inesperado → `pendingCount: 0` | Não crasheia |

### Ticket 6 (minor fixes)

| Teste | Verifica |
|-------|----------|
| Reject com reviewNote preenchido | Body enviado correto |
| Toast desaparece após 4 segundos | Auto-dismiss |

---

## 7. Ordem de Execução (Pipeline)

```
TICKET 1 — Limpar código morto
  Agent: infra-implementer
  Impacto: 14 arquivos deletados, 0 modificados
  Gate: deno task build + deno task test passam
  ↓

TICKET 2 — Normalizar response shape
  Agent: infra-implementer
  Impacto: api_admin.ts (20+ linhas alteradas)
  Gate: testes de shape passam, build ok
  ↓

TICKET 3 — HTTP status passthrough
  Agent: infra-implementer
  Impacto: api_admin.ts (error handling)
  Gate: testes de status passthrough
  ↓

TICKET 4 — Audit store (decisão + execução)
  Agents: infra-implementer + viewmodel-engineer + view-implementer
  Decisão: Opção A (remover completamente)
  Impacto: 3 deletados, 10 modificados
  Gate: build + test + bundle
  ↓

TICKET 5 — Stats type-safe
  Agent: infra-implementer + viewmodel-engineer
  Impacto: api_admin.ts, types.ts, dashboard-tab.tsx
  Gate: testes de stats com mocks
  ↓

TICKET 6 — Minor fixes
  Agent: view-implementer
  Impacto: 4 arquivos, mudanças pontuais
  Gate: build + visual check
  ↓

CODE REVIEW
  Agent: code-reviewer
  Checklist:
    □ Nenhum import de domain/people ou application/people
    □ Todas as rotas admin retornam { data: ... }
    □ Nenhum `as Promise<Result<...>>` sem narrowing
    □ Nenhum inline style
    □ Testes cobrem happy path + error cases
  ↓

INTEGRATION
  Agent: integration-validator
  Gate: deno task build + deno task test + bundle size ok
```

---

## 8. Commit Convention

Um commit por ticket:

```
fix(admin/cleanup): remove dead domain/application people code

- Delete src/domain/people/ (6 files, 0 imports anywhere)
- Delete src/application/people/ (8 files, 0 imports anywhere)
- BFF is a proxy, not a People bounded context owner
- Zero functional change, build + tests pass

Pipeline: [infra-implementer], review: 0 rounds
```

```
fix(admin/response): normalize all admin API responses to { data: ... }

- All /api/admin/* routes now return { data: ... } wrapper
- Fixes base-client.ts json.data extraction returning undefined
- Audit endpoint returns { data: entries, meta: { total } }
- Stats endpoint already wrapped (no change)

Pipeline: [infra-implementer], review: 1 round
```

```
fix(admin/status): passthrough backend HTTP status codes

- 404, 409, 422 from backends now forwarded as-is (were returning 200)
- 500+ from backends still mapped to 502 (upstream error)
- Error body from backend preserved in response

Pipeline: [infra-implementer], review: 1 round
```

```
refactor(admin/audit): remove ephemeral in-memory audit store

- Delete audit_store.ts, types.ts, audit-list.tsx
- Remove audit tab from admin dashboard (4 tabs remain)
- People Context and Social Care backends own audit persistence
- BFF should not maintain redundant ephemeral audit trail

Pipeline: [infra-implementer, viewmodel-engineer, view-implementer], review: 1 round
```

```
fix(admin/stats): type-safe stats aggregation with partial health indicator

- Replace unsafe `as Record<string, unknown>` casts with type guards
- Add `health: "ok" | "partial"` field to stats response
- Dashboard shows warning when health is partial
- extractPendingCount uses proper narrowing

Pipeline: [infra-implementer, viewmodel-engineer], review: 1 round
```

```
fix(admin/ui): review note prompt, toast auto-dismiss, token-based styles

- Reject now prompts for review note (was hardcoded "")
- Toasts auto-dismiss after 4 seconds
- Replace inline styles with hono/css token classes
- Consolidate Person/SystemRole imports from people-service.ts

Pipeline: [view-implementer], review: 1 round
```
