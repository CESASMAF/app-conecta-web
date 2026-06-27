[← Voltar para ADRs](./README.md)

# ADR-0005: Decisões de segurança da Auth — OIDC+PKCE (Authentik), sessão opaca, refresh single-flight

- **Status:** Accepted
- **Date:** 2026-05-29 · **Atualizado:** 2026-06-12 (modelo OIDC/Authentik do web_02; jose + Bun.redis)
- **Deciders:** Gabriel Aderaldo (Tech Lead) + assistente (textos de UI pendentes da P.O. @lekadecastro)

---

## Contexto

A Auth é a **feature-modelo** do web_02. As decisões de segurança aqui viram padrão para todo módulo que
lide com sessão/token. Diferente do web/React (que falava com o `core-api` próprio emitindo `accessToken`/
`refreshToken`), o web_02 autentica via **OIDC contra o Authentik** (IdP único do deploy BV) — o BFF
**Elysia** faz o fluxo **Authorization Code + PKCE**, valida o `id_token` com **`jose`** (JWKS do
Authentik) e mantém a sessão **server-side**. Precisávamos decidir **onde** vivem os tokens, **como**
renovar sem o usuário perceber e **como** validar — sem violar o Princípio I (browser nunca vê token).

> Validado no spike (2026-06-12): `/api/auth/login` → 302 p/ o IdP com `code_challenge` S256 + cookie
> `pkce` assinado HttpOnly/Secure/SameSite=Lax; `/api/me` sem sessão → 401; CSRF por `X-Requested-With`.

## Decisão

### 1. OIDC Authorization Code + PKCE no BFF (Elysia)

O login inicia no BFF: gera `code_verifier`/`code_challenge` (**S256**, via Web Crypto nativo do Bun),
redireciona ao Authentik e guarda o `verifier` num **cookie `pkce` assinado** (HttpOnly·Secure·SameSite=Lax,
efêmero). No callback, troca `code`+`verifier` por tokens e **valida o `id_token`** (assinatura + claims).

- **Por quê PKCE:** mitiga interceptação do `code`; padrão OIDC para clients públicos/confidenciais.
- `oauth4webapi`/`jose` fazem o protocolo; **não** é dependência "utilitária" redundante (não há
  equivalente nativo no Bun para OIDC/JWKS) → permitido pela regra Bun-native.

### 2. Sessão server-side + cookie opaco `__Host-session`

O cookie carrega **apenas um `sessionId` opaco** (`crypto.randomUUID()` nativo); os tokens (access/refresh
do IdP) ficam no `SessionStore` server-side. Atributos: `HttpOnly · Secure · SameSite=Strict · Path=/` +
prefixo `__Host-`.

- **Por quê:** o browser nunca toca em token (Princípio I). `SameSite=Strict` + validação de origem/CSRF
  mitiga CSRF. `__Host-` impede sobrescrita por subdomínio.
- **`SessionStore` = `Bun.redis` nativo** (substitui o "Redis-like" do web/React e o in-memory de dev):
  o client Redis vem no runtime do Bun (`Bun.redis`), sem driver npm (`ioredis`/`redis`) — regra Bun-native.
  Estado de sessão server-side é uma anomalia REST aceita; o Redis nativo dá escala horizontal.
- **Default = cookie de sessão** (sem `Max-Age`). Persistência só com "lembrar este dispositivo", limitada
  ao TTL do refresh. **Autoridade é o IdP**: expiração, rotação e logout mandam.

### 3. Refresh silencioso **single-flight**

Quando o access expira, o guard (`server/adapters/session.guard`) dispara o refresh **server-side**,
transparente. Requisições concorrentes da mesma sessão compartilham **uma única** chamada de refresh
(single-flight): a primeira renova; as demais aguardam o mesmo resultado.

- **Por quê:** o IdP rotaciona o refresh e pode fazer reuse-detection — dois refresh paralelos com o
  mesmo token disparariam falso-positivo e matariam a sessão. Single-flight evita a corrida.
- **Reuse real → signOut**: apaga a sessão (`Bun.redis`) e força re-login (fail-safe).

### 4. Validação do `id_token` com `jose` (JWKS do Authentik); access apenas encaminhado

O BFF **verifica a assinatura do `id_token`** (`jwtVerify` com o JWKS derivado de
`AUTHENTIK_URL`+`AUTHENTIK_APP_SLUG`) no login/refresh — issuer/audience conferidos. O **access token** é
tratado como **Bearer opaco**: o BFF o injeta (`Authorization: Bearer`) nas chamadas aos serviços; quem
valida o access a cada request é o serviço de destino (que também aceita o issuer Authentik).

- **Por quê:** estabelece a identidade com prova criptográfica no login (id_token verificado), sem replicar
  a verificação do access em todo hop (o backend é a autoridade dele). Difere do web/React ("decode-only"),
  porque lá o `core-api` próprio era o emissor; aqui o emissor é o IdP e o id_token **é** verificado.

### 5. `/me` devolve **só o essencial** (`userId` + `permissions`/`groups`)

Mínimo para renderizar estado autenticado e filtrar menu por permissão (RBAC; ver
[ADR-0012](./0012-shell-as-root-screen-mvvm.md)). Roles vêm do claim **`groups`** do token Authentik.

### 6. Redirect pós-login anti open-redirect

`?redirect=<rota>` é **saneado** (`client/data/safe-redirect`): só caminho de mesma origem, começa com `/`
e não com `//`; URL externa é descartada → fallback `/`.

### 7. CSRF + mensagens de erro

- **CSRF:** mutações exigem header `X-Requested-With` (validado no `onRequest` do Elysia) + `SameSite=Strict`
  + checagem de origem. (Validado: POST `/api/auth/logout` sem o header → 403; com → 200.)
- **Erros = tags i18n** (`shared/i18n`); credencial usa mensagem **genérica** (anti-enumeração).

## Consequências

**Positivas**
- Token/refresh/segredo/URL do backend confinados ao `server/` — verificável (bundle do browser não contém
  `accessToken`/`Bearer`/segredo). Testável em **`bun:test`**.
- Identidade com prova (id_token verificado por `jose`); renovação transparente sem disparar reuse-detection.
- Sessão em **`Bun.redis`** (escala horizontal) sem driver npm; CSRF e PKCE com Web Crypto nativo.

**Negativas / custos**
- Estado de sessão server-side (mitigado pelo `Bun.redis`).
- Dependência do IdP (Authentik) disponível para login/refresh — esperado no deploy BV.

**Neutras**
- "Lembrar este dispositivo" é opt-in; sem ele, a sessão é efêmera.
- Callback completo (code→token→sessão) + `jwtVerify` validados só com IdP real (pendência do spike).

## Alternativas consideradas

- **Token no browser (localStorage/cookie legível)** — rejeitado (Princípio I): expõe a XSS/exfiltração.
- **Refresh sem single-flight** — rejeitado: corre contra a reuse-detection do IdP.
- **Decode-only do access (como o web/React)** — preterido: aqui o emissor é o IdP; o id_token **é**
  verificado com `jose`; o access segue como Bearer opaco encaminhado.
- **Driver npm de Redis (`ioredis`)** — rejeitado pela regra **Bun-native**: usa-se `Bun.redis`.

## Referências

- `.specify/memory/constitution.md` §I (BFF/sem token no browser), §II (erros como valor).
- `src/server/{env,session,oidc,app}.ts` (camada de auth validada no spike) · `src/lib/eden.ts`.
- `handbook/reference/runtime/bun/runtime/redis.mdx` (`Bun.redis`), `.../secrets.mdx`.
- [ADR-0004](./0004-client-server-split-mvvm-ddd.md) (fronteira client/server) e [ADR-0002](./0002-errors-as-values.md).
- Integração de auth do ecossistema: `people-context` (já Authentik) / `social-care` (multi-issuer).
