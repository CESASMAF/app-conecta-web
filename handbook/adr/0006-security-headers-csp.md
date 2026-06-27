[← Voltar para ADRs](./README.md)

# ADR-0006 — Security Headers & CSP (Elysia middleware + SolidStart + Caddy)

**Status**: Aceito · **Data**: 2026-05-30 · **Atualizado**: 2026-06-12 (Elysia/SolidStart no lugar de TanStack Start) · **Amendado**: 2026-06-12 (CSP nonce **implementada**; style-src prod; CSRF por Origin — security review) · **Contexto**: spec `003-auth-security-hardening`

> **Amendência 2026-06-12 — implementação + hardening (security review).** A CSP com **nonce per-request**
> (Decisão #3bis, antes pendente em T050) foi **implementada e validada**: o middleware do SolidStart
> (`src/middleware.ts`, registrado em `app.config.ts`) gera o nonce (Web Crypto) e carimba
> `script-src 'self' 'nonce-<n>' 'strict-dynamic'`; o `entry-server.tsx` injeta o nonce nos scripts de
> hidratação do Solid; `serialization: { mode: 'json' }` (`app.config.ts`) evita `unsafe-eval`. Hardening
> do security review: **(L5)** em **produção** `style-src` vira `'self'` (o vanilla-extract emite CSS
> estático — sem `unsafe-inline`; em dev permanece por causa da injeção via JS); **(L3)** o CSRF ganhou
> **allowlist de `Origin`** nas mutações (além de `X-Requested-With` + `SameSite=Strict`). CSP de produção
> final é estrita e **zero `unsafe-inline`**. Registro completo (OWASP 2025 + achados L1–L6) em
> [`specs/001-foundation/security-review.md`](../../specs/001-foundation/security-review.md).

---

## Contexto

A auditoria OWASP da Auth confirmou que **nenhum security header** existia (`src/` nem `Caddyfile`). A
constituição (§ Technology Constraints) manda "CSP/HSTS/nosniff/frame-deny **via middleware**". No web_02
o request passa por **Elysia** (BFF, `routes/api/[...path].ts`) e por **SolidStart** (SSR das telas) — os
headers precisam cobrir as duas saídas, mais a borda **Caddy**.

> **Ponto-chave da hidratação:** assim como o TanStack Start injetava um `<script>` inline
> (`window.$_TSR`), o **Solid injeta um `<script>` inline de hidratação** (`window._$HY = ...`,
> `data-hk`) no HTML do SSR. Um `script-src 'self'` **não** cobre inline → a hidratação quebra (página
> branca). Por isso o `script-src` carrega um **nonce per-request**.

## Decisão

1. **Duas camadas de headers:**
   - **Middleware da aplicação** — carimba toda resposta:
     - **Elysia** (`onRequest`/`onAfterHandle`) para as respostas do BFF (`/api/*`, server fns).
     - **SolidStart middleware** (`src/middleware.ts`, `createMiddleware({ onRequest })`) para as
       respostas de SSR das telas.
     Ambos usam o mesmo builder puro; é a fonte da CSP dinâmica (nonce).
   - **Caddy** (borda) — headers estáticos redundantes (defesa em camadas); cobre respostas que não passam
     pelo app.

2. **Builder puro** em `src/shared/http/security-headers.ts` (`buildSecurityHeaders`, `serializeCsp`,
   `CSP_BASELINE`, `isHttpsFromForwardedProto`) — testável por **`bun:test`**, sem efeito colateral. A
   aplicação fica nos middlewares.

3. **CSP `script-src 'self' 'nonce-<n>'` com nonce per-request:**
   - O middleware gera um nonce por request (**Web Crypto nativo do Bun**) e o injeta no `script-src` via
     `buildSecurityHeaders({ nonce })`. O nonce é publicado no escopo do request e lido pelo **render SSR
     do SolidStart**, que o carimba no `<script>` inline de hidratação do Solid (e o cliente o reconstrói
     na hidratação). Em dev, o Vite/Vinxi também usa o nonce para seus assets.
   - **`style-src` mantém `'self' 'unsafe-inline'` SEM nonce** de propósito: pela regra CSP3 um nonce
     **desativa** o `'unsafe-inline'` da diretiva, e o `style-src` ainda depende dele (vanilla-extract/Vite
     injetam `<style>` por JS em dev — ver [ADR-0007](./0007-design-system-vanilla-extract.md)). Endurecer
     `style-src` com nonce é follow-up.

4. **HSTS condicional (trust-proxy)** — emitido só quando `x-forwarded-proto: https` (injetado pelo Caddy).
   Em `bun run dev` puro (http) é omitido para não travar localhost. O header só é confiável atrás do proxy.

5. **CSRF** — mutações exigem `X-Requested-With` (validado no `onRequest` do **Elysia**; ver
   [ADR-0005](./0005-auth-session-refresh-decisions.md) §7) + checagem de origem em login/logout. (Não há o
   "CSRF automático do framework a redesligar" como no Start; no Elysia o middleware é explícito.)

6. **`frame-src 'self' blob:`** — preview de PDF de documentos de contrato: o BFF entrega os **bytes**
   (same-origin, via Eden) e o client cria um `blob:` (`URL.createObjectURL`) como `src` do `<iframe>`.
   Sem `frame-src`, o framing do `blob:` cai no `default-src 'self'` e é bloqueado. Restrito a same-origin
   + blob (o blob vem do nosso próprio JS a partir de bytes same-origin). **Não** abrimos para `http(s)://`
   externo nem `*` (coberto por teste em `tests/shared/http/security-headers.test.ts`). `frame-ancestors
   'none'` (anti-clickjacking) permanece.

## Consequências

- ✅ Toda resposta (BFF Elysia + SSR SolidStart) carrega headers de segurança; CSP bloqueia script inline
  NÃO-autorizado (só o bootstrap de hidratação do Solid, carimbado com o nonce per-request, é liberado).
- ✅ **Zero dependências novas** (Web Crypto nativo do Bun + APIs do Elysia/SolidStart).
- ✅ Hidratação do Solid funciona sob `script-src` sem `'unsafe-inline'` (nonce per-request); boundary
  server/client preservada (nada de segredo/`isServer`-only no bundle client).
- ⚠️ `style-src 'unsafe-inline'` permanece (nonce em style-src desativaria o `'unsafe-inline'` exigido
  pelos `<style>` injetados por JS em dev); endurecer é follow-up.
- ⚠️ A confiança no `x-forwarded-proto` pressupõe o Caddy como único exposto (arquitetura atual).

## Alternativas consideradas

- **Só headers no Caddy** — rejeitado: não cobre CSP dinâmica (nonce per-request) nem respostas internas.
- **`script-src 'self'` sem nonce** — rejeitado: o `<script>` inline de hidratação do Solid não é coberto
  por `'self'` → hidratação quebra (mesmo aprendizado do web/React com o Start).
- **`unsafe-inline` em script-src** — rejeitado: anularia a proteção contra XSS por script inline.

## Referências

- `specs/003-auth-security-hardening/{research.md,contracts/security-headers.md}`
- `src/shared/http/security-headers.ts` + `tests/shared/http/security-headers.test.ts` (`bun:test`)
- `src/middleware.ts` (SolidStart) · `src/server/app.ts` (Elysia `onRequest`)
- `handbook/reference/framework/solidstart/` (middleware, entry-server) e `.../elysia/` (lifecycle/onRequest)
- Refina: [ADR-0004](./0004-client-server-split-mvvm-ddd.md) (composition root) · complementa [ADR-0005](./0005-auth-session-refresh-decisions.md) (CSRF).
