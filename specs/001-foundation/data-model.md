# Phase 1 — Data Model: Fundação (Acesso autenticado)

Entidades derivadas das *Key Entities* do [spec.md](./spec.md). Tudo **server-side** salvo onde
indicado; o browser só vê o `sessionId` opaco. Tipos no servidor via branded types + `Elysia.t`
(TypeBox); o que cruza para o client flui pelo **Eden** (ver [contracts/auth-bff.md](./contracts/auth-bff.md)).

---

## Session *(server-side; em `Bun.redis`)*

O contexto autenticado de um usuário. Referido ao browser só pelo cookie opaco `__Host-session`.

| Campo | Tipo | Notas |
|---|---|---|
| `sessionId` | `SessionId` (UUID opaco, branded) | `crypto.randomUUID()`; é o **único** valor no cookie |
| `idpSub` | `string` | `sub` do `id_token` verificado (identidade canônica) |
| `accessToken` | `string` *(server-only)* | Bearer injetado outbound; **nunca** ao browser |
| `refreshToken` | `string` *(server-only)* | rotacionado pelo IdP; usado no refresh single-flight |
| `groups` | `readonly string[]` | claim de grupos (papéis) — só p/ exibição |
| `createdAt` | `IsoInstant` | criação |
| `lastSeenAt` | `IsoInstant` | atualizado a cada request autenticado (inatividade) |
| `accessExpiresAt` | `IsoInstant` | quando renovar (lido do `exp`) |
| `absoluteExpiresAt` | `IsoInstant` | TTL absoluto (limite do refresh) |
| `persistent` | `boolean` | "lembrar este dispositivo" (opt-in); default `false` (cookie de sessão) |

**Invariantes / regras** (FR-002/003/005/006/011):
- O cookie carrega **apenas** `sessionId`; nenhum token/claim sensível no browser.
- `now > absoluteExpiresAt` **ou** inatividade além do limite → sessão **expirada** (re-login).
- Revogação no logout apaga a entrada do `Bun.redis` (idempotente).

**State transitions**:
```
[pending-pkce] --callback ok + id_token verificado--> [active]
[active] --access vencido--> [refreshing] --ok--> [active]
                                          --reuse/refresh falha--> [revoked] (signOut)
[active] --logout--> [revoked]
[active] --absoluteExpiresAt | inatividade--> [expired]
```

## AuthenticatedUser *(mínimo; derivado da Session)*

O que a UI precisa para renderizar "quem está logado" e filtrar exibição (FR-008).

| Campo | Tipo | Notas |
|---|---|---|
| `userId` | `string` | = `idpSub` |
| `displayName` | `string \| null` | claim opcional (`name`/`preferred_username`); fallback genérico |
| `groups` | `readonly string[]` | papéis (ex.: `worker`/`owner`/`admin`/`superadmin`) — **só exibição**; autorização real é do backend |

> Exposto ao client via `GET /api/me` (Eden). **Não** há perfil rico (minimização LGPD — Princ. Segurança).

## PkceState *(transiente; cookie `pkce` assinado, efêmero)*

Estado do início do fluxo OIDC, vivo entre `login` e `callback`.

| Campo | Tipo | Notas |
|---|---|---|
| `codeVerifier` | `string` | gerado por Web Crypto; gera o `code_challenge` S256 |
| `state` | `string` | anti-CSRF do fluxo OIDC |
| `nonce` | `string` | anti-replay do `id_token` |
| `redirectTo` | `SafePath` | destino pós-login **saneado** (mesma origem, começa com `/`, não `//`) — FR-004 |

> Cookie `pkce`: `HttpOnly·Secure·SameSite=Lax` (Lax p/ sobreviver ao redirect do IdP), curto, assinado.
> Descartado no callback. Tentativa de `redirectTo` externo/malformado → fallback `/` (SC-002).

## AppShell *(UI state; client — ADR-0012)*

A moldura autenticada onde o usuário aterrissa (FR-007). Nesta fatia, **placeholder**.

| Aspecto | Notas |
|---|---|
| `visibleMenu` | derivado de `user.groups` (mecânica de RBAC de exibição; itens reais nas próximas features) |
| `pageTitle` | derivado da rota ativa |
| `collapsed` | estado local do shell (reducer/signal) — SSR-safe (default determinístico) |
| conteúdo | `<Outlet/>` (vazio nesta fatia) |

> O shell é uma **tela MVVM** (`modules/shell/client/root`), não um layout solto — ADR-0012.

---

**Referências**: [spec.md](./spec.md) (Key Entities, FRs) · [research.md](./research.md) (D4/D5 sessão) ·
[ADR-0005](../../handbook/adr/0005-auth-session-refresh-decisions.md) ·
[ADR-0012](../../handbook/adr/0012-shell-as-root-screen-mvvm.md).
