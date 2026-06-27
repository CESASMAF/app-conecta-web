# Phase 1 — Contracts: BFF de Auth (Elysia)

Rotas do **BFF Elysia** (montado em `src/routes/api/[...path].ts`) que esta fatia expõe. Schemas em
**TypeBox (`Elysia.t`)**; o client consome via **Eden treaty** (tipos derivados, sem redeclarar).
Envelope de erro: `{ error: { code, message, requestId } }` (códigos `AUTH-xxx`). Nenhum token/segredo
atravessa para o browser (Princ. I).

> Convenção de nomes (ADR-0010): leitura = `*.query.fn.ts`; efeito = `*.service.fn.ts`.

---

## `GET /api/auth/login` — iniciar OIDC *(service)*
- **Input**: `?redirect=<path>` (opcional; saneado → `SafePath`, FR-004).
- **Efeito**: gera PKCE (S256, Web Crypto), grava cookie `pkce` assinado (`codeVerifier`,`state`,`nonce`,`redirectTo`).
- **Resposta**: **302** `Location: <AUTHENTIK_AUTHORIZE_URL>?response_type=code&code_challenge=…&code_challenge_method=S256&state=…&nonce=…`.
- **Cookies set**: `pkce` (HttpOnly·Secure·SameSite=Lax, curto).
- *Validado no spike*: 302 com `code_challenge` S256 + cookie `pkce` assinado. ✅

## `GET /api/auth/callback` — concluir OIDC *(service)*
- **Input**: `?code=<str>&state=<str>` + cookie `pkce`.
- **Efeito**: valida `state`; troca `code`+`codeVerifier` por tokens; **`jwtVerify`** do `id_token`
  (JWKS Authentik, issuer/audience/nonce); cria `Session` em `Bun.redis`; descarta cookie `pkce`.
- **Resposta**: **302** → `redirectTo` (ou `/`). Erro IdP → `AUTH-IDP` (mensagem genérica).
- **Cookies set**: `__Host-session` (HttpOnly·Secure·SameSite=Strict·Path=/); `Max-Age` só se `persistent`.

## `GET /api/me` — identidade atual *(query)*
- **Auth**: requer sessão válida (senão dispara guard/refresh; ver abaixo).
- **Output 200** (`Elysia.t`): `{ data: { userId: string, displayName: string | null, groups: string[] }, meta }`.
- **Output 401**: `{ error: { code: 'AUTH-001', message, requestId } }` (sem sessão).
- *Validado no spike*: sem sessão → **401**. ✅

## `POST /api/auth/logout` — sair *(service)*
- **CSRF**: exige header `X-Requested-With` (senão **403**) — ADR-0005 §7. *Validado no spike: 403 sem header, 200 com.* ✅
- **Efeito**: revoga a `Session` (apaga do `Bun.redis`) + (opcional) `end_session` no IdP; limpa `__Host-session`.
- **Resposta**: **200** `{ data: { ok: true }, meta }` (ou 302 → `/login`).

## Guard / refresh single-flight *(interno — não é rota pública)*
- Aplicado às rotas/áreas protegidas (no `load` da rota SolidStart + `onRequest` do Elysia).
- Sessão ausente/expirada → **401**/redirect a `/api/auth/login`.
- `accessExpiresAt` vencido + sessão válida → **refresh transparente** (single-flight: 1 chamada
  compartilhada); reuse/refresh falho → revoga + signOut. Nunca expõe token (FR-005).

---

## Contrato Eden (client)
```ts
// src/lib/eden.ts
import { treaty } from '@elysiajs/eden'
import type { App } from '../server/app'        // tipo do app Elysia
export const api = treaty<App>(/* base */)       // isomorphic no SSR (chama app.fetch direto)
// uso (client, via createAsync/action):
//   const me = await api.me.get()               // { data, error } — erro é VALOR (ADR-0002)
```

## Códigos de erro (auth)
| Código | Significado | HTTP | UI (tag i18n) |
|---|---|---|---|
| `AUTH-001` | sem sessão / não autenticado | 401 | redireciona a login |
| `AUTH-CSRF` | mutação sem `X-Requested-With` | 403 | erro genérico |
| `AUTH-STATE` | `state`/`pkce` inválido no callback | 400 | "sessão de login expirou, tente de novo" |
| `AUTH-IDP` | falha de comunicação com o IdP | 502 | "falha com o provedor — tente novamente" |

**Referências**: [data-model.md](../data-model.md) · [research.md](../research.md) (D3/D4/D5) ·
[ADR-0005](../../../handbook/adr/0005-auth-session-refresh-decisions.md) ·
[ADR-0010](../../../handbook/adr/0010-bff-orchestration-fn-naming.md) ·
[ADR-0002](../../../handbook/adr/0002-errors-as-values.md).
