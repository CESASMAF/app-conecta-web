# Phase 0 — Research: Fundação (Acesso autenticado)

Decisões técnicas que resolvem o "HOW" do [plan.md](./plan.md). As 3 *assumptions* do
[spec.md](./spec.md) (política de sessão, shell inicial, expiração) viram **decisões** aqui. Tudo
ancorado nos ADRs e na [constituição](../../.specify/memory/constitution.md). Nada de NEEDS
CLARIFICATION em aberto.

---

### D1 — Meta-framework: **SolidStart** (Solid · Vinxi · Nitro preset `bun`)
- **Decisão**: front + SSR em SolidStart; build via Vinxi/Nitro com `server.preset: "bun"`.
- **Rationale**: Gabriel quer Solid (não React); SolidStart é o full-stack Solid **maduro** (SSR,
  server functions, file-based router). Spike de 2026-06-12 validou `bun run build` → Nitro preset
  `bun` → `.output/server/index.mjs` rodando.
- **Alternativas**: TanStack Start com Solid (suporte **beta**, Solid 2.0 beta) — rejeitado por
  imaturidade. React/TanStack — rejeitado (decisão de stack, ver `handbook/adr/README.md`).

### D2 — BFF: **Elysia montado em `routes/api/[...path].ts`** (catch-all → `app.fetch`)
- **Decisão**: o BFF é uma app Elysia única, montada dentro do SolidStart via catch-all que delega ao
  `app.fetch(request)`; o client consome via **Eden treaty** (isomorphic no SSR — sem HTTP).
- **Rationale**: centraliza auth/sessão/orquestração (ADR-0010), dá type-safety ponta-a-ponta (Eden),
  e unifica runtime com `people-context` (também Elysia/Bun). Spike validou a montagem manual.
- **Alternativas**: só server functions do SolidStart (`"use server"`) — preterido como BFF geral
  (auth/orquestração ficam melhores centralizadas no Elysia); ficam para glue de SSR pontual.

### D3 — Auth: **OIDC Authorization Code + PKCE** (Authentik), `id_token` verificado com `jose`
- **Decisão**: o BFF faz o fluxo OIDC; `code_challenge` **S256** (Web Crypto nativo); `verifier` num
  cookie `pkce` assinado, efêmero; no callback troca `code`→tokens e **verifica o `id_token`**
  (`jwtVerify` com JWKS derivado de `AUTHENTIK_URL`+`AUTHENTIK_APP_SLUG`).
- **Rationale**: ADR-0005; PKCE mitiga interceptação do code; o IdP é a autoridade. `jose` é
  permitido pelo Princ. IV (OIDC/JWKS não tem nativo no Bun). Spike validou login→302 com S256 +
  cookie `pkce` assinado.
- **Alternativas**: senha local — rejeitado (FR-001, IdP único). Implicit flow — rejeitado (inseguro).

### D4 — Sessão: **server-side em `Bun.redis`**, cookie opaco `__Host-session`
- **Decisão**: tokens vivem no `SessionStore` (`Bun.redis`); ao browser vai só `sessionId` opaco em
  cookie `HttpOnly·Secure·SameSite=Strict·__Host-`.
- **Rationale**: Princ. I (token nunca no browser) + Princ. IV (`Bun.redis` nativo, sem driver npm
  `ioredis`). Escala horizontal. ADR-0005.
- **Alternativas**: token em cookie legível/localStorage — rejeitado (Princ. I, XSS). Driver npm de
  Redis — rejeitado (Princ. IV).

### D5 — Política de sessão: **efêmera por padrão**, "lembrar" opt-in, refresh **single-flight**
- **Decisão**: cookie de sessão sem `Max-Age` por padrão (morre ao fechar o navegador); "lembrar este
  dispositivo" é opt-in, limitado ao TTL absoluto do refresh. Renovação transparente **single-flight**
  (requisições concorrentes compartilham uma chamada de refresh); reuse real → signOut.
- **Rationale**: resolve as *assumptions* do spec; ADR-0005 (single-flight evita falso-positivo de
  reuse-detection do IdP). Atende SC-005.
- **Alternativas**: sessão sempre persistente — rejeitado (dispositivo compartilhado/LGPD). Refresh
  sem single-flight — rejeitado (corre contra reuse-detection).

### D6 — Validação: **TypeBox (`Elysia.t`)** + tipos via **Eden** (sem Zod)
- **Decisão**: schemas de input/output das rotas em `Elysia.t`; o tipo flui ao client pelo Eden.
- **Rationale**: Princ. IV/V — TypeBox vem com o Elysia (sem dep npm extra), type-safety ponta-a-ponta
  sem redeclarar Model. ADR-0004.
- **Alternativas**: Zod — rejeitado (Princ. IV).

### D7 — Testes: **`bun:test`** (+ happy-dom) + **governance tests**
- **Decisão**: puro (domain/application/view-model/data) em `bun:test`; DOM (page/component/binding)
  com happy-dom; boundaries e no-mocks como **governance tests** que varrem `src/`.
- **Rationale**: Princ. IV (sem `node:test`/Vitest/ESLint). ADR-0001/0009/0011. `bunx tsc --noEmit`
  como gate adicional.
- **Alternativas**: node:test + Vitest/jsdom + eslint-plugin-boundaries — rejeitado (Princ. IV).

### D8 — CSP: **nonce per-request** para o script de hidratação do Solid
- **Decisão**: middleware gera nonce (Web Crypto) por request e injeta em `script-src`; o SSR do Solid
  carimba o `<script>` inline de hidratação (`window._$HY`); `style-src 'self' 'unsafe-inline'` mantido
  (vanilla-extract injeta `<style>` em dev).
- **Rationale**: ADR-0006; `'self'` não cobre o inline de hidratação do Solid → quebraria. Atende a
  separação client/server (nada server-only no bundle).
- **Alternativas**: `script-src 'self'` sem nonce — rejeitado (hidratação quebra). `unsafe-inline` —
  rejeitado (anula proteção XSS).

### D9 — Segredos: **padrão `_FILE`** + **fail-fast em produção**
- **Decisão**: `OIDC_CLIENT_SECRET_FILE`/`SESSION_SECRET_FILE` (montados em `/run/secrets/…`); em prod,
  ausência das envs OIDC **derruba o boot** (500), nunca sobe inseguro.
- **Rationale**: alinhado ao cofre (Infisical/Vaultwarden) e à ADR-009; spike confirmou que o Vite
  inlina `NODE_ENV=production`, então `isProd` fica hardcoded no build → envs OIDC realmente
  obrigatórias em prod.
- **Alternativas**: env em texto plano no compose — rejeitado (governança de secrets).

---

**Pendências honestas (não bloqueiam esta fatia)**: callback completo (code→token→sessão), `jwtVerify`
real, proxy BFF com Bearer real e a otimização SSR-direto via Eden (o spike usou `fetch` HTTP) só foram
**parcialmente** validados — serão exercitados/testados nesta implementação contra um IdP real.
Ver [quickstart.md](./quickstart.md) e [contracts/auth-bff.md](./contracts/auth-bff.md).
