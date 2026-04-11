# OIDC Reference — Conecta Web BFF + Zitadel

> Referencia completa de configuracao OIDC para o BFF Deno (social-care-deno).
> Levantamento realizado em 2026-04-10 cruzando codebase + console Zitadel + documentacao oficial.

---

## 1. Zitadel — Configuracao da Application

### 1. Qual o tipo da application no Zitadel?

Existem **7 aplicacoes** no projeto ACDG Platform:

| App | Tipo | Auth Method | Grant Types | Refresh Token |
|-----|------|-------------|-------------|---------------|
| **Conecta Web BFF** | Web | Basic (confidential) | Authorization Code + Refresh Token | Sim |
| social-care-web | User Agent | None (PKCE, public) | Authorization Code | Nao |
| social-care | Native | None (PKCE, public) | Authorization Code + Refresh Token | Sim |
| social-care-hml-tests | API | — | — | — |
| social-care-introspect | API | — | — | — |
| Admin Panel | Web | Basic (confidential) | Authorization Code | Nao |
| Cloudflare Access | Web | Post | Authorization Code | Nao |

**O BFF Deno usa a app "Conecta Web BFF".**

### 2. Confidential ou Public client?

**Confidential.** Auth method: Basic (client_id + client_secret enviados no token exchange).

O `client_secret` e armazenado no Bitwarden Secret Manager e injetado via Kubernetes BitwardenSecret CRD (`bff-oidc-credentials` em prod, `bff-oidc-credentials-hml` em HML).

No codigo: `bff_service.ts:338` envia `client_secret` no body do token exchange.

### 3. Quais redirect_uri estao cadastrados?

```
http://localhost:8081/auth/callback           # dev local (Deno BFF)
https://conecta-hml.acdgbrasil.com.br/auth/callback  # HML
https://conecta.acdgbrasil.com.br/auth/callback       # Producao
http://localhost:3000/api/auth/callback/zitadel         # dev alternativo
http://localhost:5173/auth/callback                     # dev Vite
```

### 4. Qual o post_logout_redirect_uri configurado?

**Apenas um cadastrado:** `http://localhost:3000`

**PROBLEMA:** Faltam os URIs de HML e producao. O BFF precisa adicionar:
- `https://conecta-hml.acdgbrasil.com.br`
- `https://conecta.acdgbrasil.com.br`

Alem disso, o codigo do BFF (`bff_service.ts:450-455`) **nao envia** `post_logout_redirect_uri` nem `id_token_hint` ao `end_session_endpoint`. O Zitadel aceita sem eles (invalida a sessao do browser), mas o redirect pos-logout nao vai funcionar corretamente. O Zitadel espera ambos os parametros para um logout completo.

### 5. PKCE e obrigatorio? Qual code_challenge_method?

**Sim. S256.**

- Verifier: 32 bytes random, base64url-encoded (`bff_service.ts:72-76`)
- Challenge: SHA-256 do verifier, base64url-encoded (`bff_service.ts:78-83`)
- TTL do verifier: 5 minutos (`bff_service.ts:218`)
- Max entries no PKCE store: 1000, com LRU eviction (`bff_service.ts:219`)

### 6. Quais scopes a application solicita?

**Atualmente no BFF Deno:** `openid profile email` (linha `bff_service.ts:299`)

**PROBLEMA:** Esta incompleto. O BFF **deveria** pedir:

```
openid profile email offline_access urn:zitadel:iam:org:project:roles
```

Sem `offline_access`: o token endpoint **nao retorna refresh_token** mesmo com a app configurada para suportar.

Sem `urn:zitadel:iam:org:project:roles`: as roles do projeto **podem nao vir** no access_token/id_token (dependendo da versao do Zitadel e configuracao).

Para referencia, o Flutter Desktop e o BFF Dart ja pedem todos esses scopes corretamente.

### 7. response_type e code puro ou permite code id_token?

**`code` puro.** Authorization Code flow standard (`bff_service.ts:296`).

---

## 2. Zitadel — Token Format

### 8. O access_token e opaco ou JWT?

**JWT (RS256).** Configurado como "Auth Token Type: JWT" no console.

O backend Swift/Vapor valida o access_token diretamente como JWT:
```swift
// JWTAuthMiddleware.swift:14
let payload = try await request.jwt.verify(as: ZitadelJWTPayload.self)
```

Claims presentes no access_token:

| Claim | Tipo | Descricao |
|-------|------|-----------|
| `sub` | string | User ID (Zitadel UID, ex: `"367349956392059030"`) |
| `iss` | string | `https://auth.acdgbrasil.com.br` |
| `aud` | string[] | Array incluindo o client_id |
| `exp` | number | Unix timestamp de expiracao |
| `urn:zitadel:iam:org:project:roles` | object | Mapa de roles (opcional, requer scope) |

### 9. O id_token — quais claims customizados?

Configuracao no console (Token Settings do Conecta Web BFF):
- "Add user roles to access token": **ativado**
- "User roles inside ID Token": **ativado**
- "Include user's profile info in ID Token": **desativado**

Claims no id_token:
- `sub` — user ID
- `name` — display name (do profile scope)
- `preferred_username` — username
- `email` — email
- `iss` — issuer
- `aud` — audience
- `exp` — expiration
- `urn:zitadel:iam:org:project:roles` — roles (se scope correto solicitado)

**Nota:** Como "Include profile info in ID Token" esta desativado, `name`, `email`, etc. podem **nao vir** no id_token. O BFF pode precisar chamar o `userinfo` endpoint para obte-los, ou ativar essa opcao no console.

O BFF Deno atualmente extrai do id_token (`bff_service.ts:36-44`):
```typescript
type JWTPayload = Readonly<{
  sub: string;
  name?: string;
  preferred_username?: string;
  email?: string;
  iss?: string;
  aud?: string | readonly string[];
  exp?: number;
}>;
```

### 10. O id_token tem aud como string ou array?

O Zitadel tipicamente retorna **array**. O codigo trata ambos os casos:
```typescript
// bff_service.ts:187
const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
```

### 11. Qual o expires_in padrao do access_token?

**12 horas (43200 segundos).**

Este e o default de instancia do Zitadel. A configuracao fica em **Instance Settings > OIDC Token Lifetimes** (nao na app individual — token lifetimes sao configurados a nivel de instancia, nao por app). Se nunca foi alterado, esta usando o default.

O BFF Deno usa o `expires_in` retornado pelo token endpoint para calcular o TTL da sessao:
```typescript
// bff_service.ts:374-376
const tokenExpiryMs = tokenData.expires_in * 1000;
const configExpiryMs = config.sessionTtlMinutes * 60 * 1000;
const expiresAt = now + Math.min(tokenExpiryMs, configExpiryMs);
```

Como `SESSION_TTL_MINUTES` default e 60 (1h), a sessao expira em **1 hora** (o menor entre 12h do token e 1h da config).

### 12. O refresh_token e emitido sempre ou so com offline_access scope?

**So com `offline_access` scope.**

Mesmo com a app configurada para suportar Refresh Token no console (checkbox marcado), o token endpoint **so emite refresh_token se o scope `offline_access` for solicitado** na requisicao de autorizacao.

O BFF Deno atualmente **nao pede** `offline_access` (`bff_service.ts:299`), entao **nao recebe refresh_token**. O codigo trata como opcional:
```typescript
// bff_service.ts:380
refreshToken: tokenData.refresh_token ?? undefined,
```

### 13. Qual o TTL do refresh_token?

Defaults do Zitadel (configuravel a nivel de instancia):

| Setting | Default | Descricao |
|---------|---------|-----------|
| Refresh Token Idle Expiration | **720h (30 dias)** | Tempo maximo de inatividade antes de expirar |
| Refresh Token Absolute Expiration | **2160h (90 dias)** | Vida util maxima absoluta, independente de uso |

Se o refresh_token nao for usado por 30 dias, expira. Independente de uso, expira apos 90 dias.

### 14. O token endpoint retorna token_type: "Bearer" exatamente assim?

**Sim.** `token_type: "Bearer"` (B maiusculo, padrao OAuth 2.0 RFC 6749).

O codigo aceita como string generica sem validar o valor:
```typescript
// bff_service.ts:28-34
type TokenResponse = Readonly<{
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in: number;
  token_type: string;
}>;
```

---

## 3. Zitadel — Login Flow

### 15. Tem MFA/2FA habilitado para os users?

**MFA esta disponivel mas NAO e obrigatorio.**

| Setting | Valor |
|---------|-------|
| Force MFA for all users | Desativado |
| Force MFA for local authenticated users only | Desativado |
| Fatores disponiveis | TOTP (Authenticator App) + Passkey |
| Passkey Login | Allowed (nao obrigatorio) |

Usuarios podem configurar TOTP ou Passkey voluntariamente. Nenhum usuario sera bloqueado por falta de MFA.

### 16. Tem algum login policy customizado?

**Sim, parcialmente:**

| Setting | Valor | Observacao |
|---------|-------|------------|
| Local authentication allowed | Ativado | — |
| User Registration allowed | **Ativado** | Qualquer pessoa pode se registrar (mitigado por "deny auth if no roles") |
| External Login allowed | Ativado | Mas 0 IdPs externos configurados |
| Password Reset hidden | Desativado | Botao visivel |
| Domain Discovery allowed | Ativado | — |
| Ignore unknown Usernames | **Desativado** | Risco de user enumeration |
| Default Redirect URI | Vazio | — |

**Password Complexity:**
- Minimo 8 caracteres
- Requer: numero + simbolo + minuscula + maiuscula

**Password Expiry:** Sem expiracao (campos vazios).

**Lockout:** Desativado (0 tentativas max para password e OTP).

**Actions V1:** 0 scripts configurados.

**Projeto ACDG Platform:**
- "Return user roles during authentication": ativado
- "Only authorized users can authenticate": ativado
- "Deny authentication if the user has no roles assigned to this project": **ativado** (mitiga o registro aberto — user se registra mas nao consegue logar sem role)

### 17. Usam login_hint para pre-preencher o email?

**Nao.** O BFF nao envia `login_hint` nos parametros de autorizacao (`bff_service.ts:295-303`).

### 18. O prompt padrao e login, consent, select_account, ou nenhum?

**Nenhum.** O codigo nao envia `prompt`. O Zitadel decide (mostra login se nao ha sessao ativa no browser).

### 19. Existe um user de teste dedicado para automacao?

**Sim:**
- **Display Name:** HML Integration Tests
- **Username:** `svc-hml-tests`
- **Tipo:** Service Account (API)
- **Status:** Active
- **Criado:** 03/13/2026
- **Roles:** Atribuidas no projeto ACDG Platform

As credenciais (JWT key ou client_secret) estao armazenadas no Bitwarden Secret Manager. Se foram perdidas, precisam ser regeneradas no console.

Para testes automatizados, o flow seria `client_credentials` grant type:
```bash
curl -X POST https://auth.acdgbrasil.com.br/oauth/v2/token \
  -d "grant_type=client_credentials" \
  -d "client_id=<service_account_client_id>" \
  -d "client_secret=<service_account_secret>" \
  -d "scope=openid profile"
```

---

## 4. Zitadel — Roles e Autorizacao

### 20. O backend Swift/Vapor valida roles do JWT? Quais roles existem?

**Sim.** O `RoleGuardMiddleware` valida roles por endpoint.

**3 roles definidas:**

| Role | Descricao | Permissoes |
|------|-----------|------------|
| `social_worker` | Profissional de assistencia social | CRUD completo: Patient, Assessment, Care, Protection |
| `owner` | Gestor/proprietario | Leitura: Patient, Lookup |
| `admin` | Administrador | Leitura + Admin: CRUD lookup tables, ver todas lookup requests |

**Mapeamento por endpoint no backend Swift:**

```
GET  /patients/*        → social_worker | owner | admin
POST /patients          → social_worker
PUT  /patients/*        → social_worker

GET  /assessments/*     → social_worker
PUT  /assessments/*     → social_worker

POST /care/*            → social_worker

POST /protection/*      → social_worker

GET  /lookups/*         → social_worker | owner | admin
POST /lookups/*         → admin
PUT  /lookups/*         → admin
PATCH /lookups/*/toggle → admin
GET  /lookups/requests  → social_worker (proprias) | admin (todas)
```

### 21. As roles vem como claim no access_token ou no id_token? Qual o nome do claim?

**Ambos** (access_token e id_token), conforme configuracao no console:
- "Add user roles to access token": ativado
- "User roles inside ID Token": ativado

**Nome do claim:** `urn:zitadel:iam:org:project:roles`

**Formato:**
```json
{
  "urn:zitadel:iam:org:project:roles": {
    "social_worker": {
      "363109883022671995": "acdg.auth.acdgbrasil.com.br"
    },
    "admin": {
      "363109883022671995": "acdg.auth.acdgbrasil.com.br"
    }
  }
}
```

O valor interno (`{ "<projectId>": "<orgDomain>" }`) e ignorado. So as **chaves do mapa externo** sao extraidas como roles:
```swift
// ZitadelJWTPayload.swift:19-22
var roleNames: Set<String> {
    guard let projectRoles else { return [] }
    return Set(projectRoles.keys)
}
```

### 22. O X-Actor-Id e extraido de qual campo do token?

**Do `sub` do JWT.** Nao e um header HTTP separado — e extraido programaticamente:

```swift
// Request+ActorId.swift:5-8
func extractActorId() throws -> String {
    let user = try requireAuthenticatedUser()
    return user.userId  // ← payload.sub.value
}

// JWTAuthMiddleware.swift:30-33
request.authenticatedUser = AuthenticatedUser(
    userId: payload.sub.value,  // ← sub claim do JWT
    roles: roles
)
```

### 23. Existe diferenca de permissao entre endpoints?

**Sim.** Detalhado na pergunta 20. Resumo:

- **Leitura (GET):** `social_worker` | `owner` | `admin`
- **Escrita (POST/PUT/PATCH):** apenas `social_worker` (exceto lookups admin)
- **Admin (CRUD lookup tables):** apenas `admin`
- **Filtro especial:** Lookup requests — `social_worker` ve so as proprias, `admin` ve todas

---

## 5. Backend Swift/Vapor (HML)

### 24. A URL de HML e `https://social-care-hml.acdgbrasil.com.br`?

**Sim.** Confirmado no smoke-test workflow do CI (`edge-cloud-infra/.github/workflows/smoke-test.yml`).

### 25. A URL do people-context HML e `https://people-hml.acdgbrasil.com.br`?

**Sim.** Confirmado no mesmo smoke-test workflow.

**Todas as URLs de servico:**

| Servico | HML | Producao |
|---------|-----|----------|
| Social Care | `https://social-care-hml.acdgbrasil.com.br` | `https://social-care.acdgbrasil.com.br` |
| People Context | `https://people-hml.acdgbrasil.com.br` | `https://people.acdgbrasil.com.br` |
| Conecta Web | `https://conecta-hml.acdgbrasil.com.br` | `https://conecta.acdgbrasil.com.br` |
| Zitadel | `https://auth.acdgbrasil.com.br` | `https://auth.acdgbrasil.com.br` (compartilhado) |

### 26. O backend aceita requests via rede publica ou so intra-cluster?

**Ambos.**

- **Intra-cluster (BFF → backend):** O BFF usa DNS interno K8s: `http://social-care:3000` (`.env.example:7`)
- **Rede publica:** Os endpoints HML/prod estao expostos via Ingress (Traefik). Teste local pode bater no HML via URL publica, desde que tenha um JWT valido emitido pelo Zitadel.

Para teste local batendo no HML:
1. Obter token via `client_credentials` com o service account `svc-hml-tests`
2. Enviar request com `Authorization: Bearer <token>`

### 27. O backend valida o iss do JWT?

**Nao explicitamente.** O `ZitadelJWTPayload.verify()` so checa expiracao:
```swift
// ZitadelJWTPayload.swift:15-17
func verify(using algorithm: some JWTAlgorithm) async throws {
    try exp.verifyNotExpired()
}
```

Porem, a validacao acontece **implicitamente via assinatura**: o backend carrega JWKS de `auth.acdgbrasil.com.br` no boot (`configure.swift:106-130`). Se o JWT for assinado por outra chave (ex: mock OIDC), a verificacao de assinatura falha.

**Implicacao para mock:** Um mock OIDC local **nao funcionaria** contra o backend real (assinatura diferente). Para testes contra o backend HML, use tokens reais do Zitadel.

### 28. Quais headers o backend espera alem de Authorization e X-Actor-Id?

**Apenas `Authorization: Bearer <JWT>`.** O `X-Actor-Id` nao e um header HTTP — e extraido do `sub` do JWT internamente.

Nao ha referencia a `X-Request-Id`, `X-Correlation-Id`, ou outros headers customizados no codigo Swift.

### 29. O backend retorna StandardResponse<T> com meta.timestamp em TODAS as respostas?

**Sim para respostas de sucesso com body.** Formato exato:

```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2026-04-10T14:30:00Z"
  }
}
```

- `timestamp`: `Date()` serializado com `.iso8601` encoding strategy (`configure.swift:155-157`)
- **DELETE:** retorna `204 No Content` (sem body)
- **Erros:** Tratados pelo `AppErrorMiddleware` com formato diferente (error code + message)

Estrutura no codigo:
```swift
// ResponseDTOs.swift:5-17
struct StandardResponse<T: Content>: Content {
    let data: T
    let meta: ResponseMeta
    init(data: T) {
        self.data = data
        self.meta = ResponseMeta(timestamp: Date())
    }
}
struct ResponseMeta: Content {
    let timestamp: Date
}
```

---

## 6. Zitadel — Discovery e JWKS

### 30. O discovery endpoint e `https://auth.acdgbrasil.com.br/.well-known/openid-configuration`?

**Sim.** Confirmado pelo console (aba URLs da app). O BFF faz fetch desse endpoint e cacheia por 1 hora:
```typescript
// bff_service.ts:137
const url = `${issuer}/.well-known/openid-configuration`;
```

**Nota:** O fetch de fora da rede do cluster pode retornar 403 (Cloudflare WAF na frente). Dentro do cluster funciona normalmente.

### 31. O JWKS endpoint rotaciona chaves? Com qual frequencia?

**Sim, a cada 6 horas.** Documentacao oficial do Zitadel:

> "ZITADEL practices frequent key rotation to enhance security with keys having a predefined maximum lifetime of 6 hours, after which they are rotated. Each key pair has a unique `kid`."

**PROBLEMA CRITICO:** O backend Swift carrega JWKS **uma unica vez no boot** (`configure.swift:106-130`) e nunca faz refresh. Apos 6 horas, novos tokens assinados com uma nova chave **nao serao validados** ate o proximo restart do servico.

**Solucao recomendada:** Implementar refresh periodico de JWKS (ex: a cada 5 minutos) ou usar uma biblioteca que faca cache com TTL automatico.

### 32. O end_session_endpoint — o Zitadel exige id_token_hint e post_logout_redirect_uri?

**Endpoint:** `https://auth.acdgbrasil.com.br/oidc/v1/end_session`

O Zitadel **espera** receber:
- `id_token_hint` — ID token emitido anteriormente
- `post_logout_redirect_uri` — deve estar pre-registrado no console

O BFF Deno atualmente **nao envia nenhum dos dois** — so redireciona para o `end_session_endpoint` cru. O Zitadel aceita sem eles (invalida a sessao do browser), mas:
- Sem `post_logout_redirect_uri`: o usuario fica na pagina de logout do Zitadel em vez de voltar ao app
- Sem `id_token_hint`: o Zitadel pode pedir confirmacao ao usuario

**Para corrigir:** Armazenar o `id_token` na sessao no callback e envia-lo no logout:
```
GET /oidc/v1/end_session
  ?id_token_hint=<id_token>
  &post_logout_redirect_uri=https://conecta.acdgbrasil.com.br
```

---

## 7. Infra / Rede

### 33. O BFF em dev local consegue fazer requests para auth.acdgbrasil.com.br?

**Em principio sim.** O BFF faz fetch para o Zitadel pela internet publica. O setup local usa Caddy como reverse proxy TLS (`Caddyfile`):
```
https://localhost {
  reverse_proxy bff:8081
}
```

A instancia Zitadel esta atras de Cloudflare (existe app "Cloudflare Access" configurada). Se o discovery endpoint retornar 403, pode ser:
- Bot detection do Cloudflare
- IP whitelist
- Rate limiting

**Teste:** `curl -s https://auth.acdgbrasil.com.br/.well-known/openid-configuration | jq .`

### 34. O OIDC redirect URI em HML aponta para qual URL?

**`https://conecta-hml.acdgbrasil.com.br/auth/callback`** — cadastrado no console do Conecta Web BFF.

### 35. Os secrets do Bitwarden sao os mesmos para dev local e HML?

**O Client ID e o mesmo** (uma unica app "Conecta Web BFF" serve dev/HML/prod com 5 redirect URIs).

Os **secrets no Kubernetes** sao separados por ambiente:
- Prod: `bff-oidc-credentials`, `bff-session-secret`
- HML: `bff-oidc-credentials-hml`, `bff-session-secret-hml`

Porem, como e o mesmo `client_id`, o `client_secret` provavelmente e o **mesmo** em todos os ambientes. Para dev local, usar o valor do `.env` (que aponta para o mesmo client).

---

## 8. Para o Mock ser fiel

### 36. Posso acessar o discovery endpoint real agora?

O endpoint e `https://auth.acdgbrasil.com.br/.well-known/openid-configuration`. Pode retornar 403 de fora da rede (Cloudflare). Testar localmente:
```bash
curl -s https://auth.acdgbrasil.com.br/.well-known/openid-configuration | jq .
```

Baseado nos endpoints confirmados no console, a estrutura do discovery document e:
```json
{
  "issuer": "https://auth.acdgbrasil.com.br",
  "authorization_endpoint": "https://auth.acdgbrasil.com.br/oauth/v2/authorize",
  "token_endpoint": "https://auth.acdgbrasil.com.br/oauth/v2/token",
  "end_session_endpoint": "https://auth.acdgbrasil.com.br/oidc/v1/end_session",
  "introspection_endpoint": "https://auth.acdgbrasil.com.br/oauth/v2/introspect",
  "jwks_uri": "https://auth.acdgbrasil.com.br/oauth/v2/keys",
  "revocation_endpoint": "https://auth.acdgbrasil.com.br/oauth/v2/revoke",
  "userinfo_endpoint": "https://auth.acdgbrasil.com.br/oidc/v1/userinfo",
  "device_authorization_endpoint": "https://auth.acdgbrasil.com.br/oauth/v2/device_authorization",
  "response_types_supported": ["code"],
  "grant_types_supported": ["authorization_code", "refresh_token", "client_credentials", "urn:ietf:params:oauth:grant-type:device_code"],
  "subject_types_supported": ["public"],
  "id_token_signing_alg_values_supported": ["RS256"],
  "scopes_supported": ["openid", "profile", "email", "offline_access", "urn:zitadel:iam:org:project:roles", "urn:zitadel:iam:org:project:id:zitadel:aud"],
  "token_endpoint_auth_methods_supported": ["client_secret_basic", "client_secret_post", "none"],
  "code_challenge_methods_supported": ["S256"]
}
```

### 37. Exemplo de id_token decodificado

Nao tenho acesso a um token real, mas baseado na configuracao, o payload do id_token teria esta estrutura:
```json
{
  "iss": "https://auth.acdgbrasil.com.br",
  "sub": "367XXXXXXXXX",
  "aud": ["367349956392059030"],
  "exp": 1744353600,
  "iat": 1744310400,
  "auth_time": 1744310400,
  "nonce": "<se enviado>",
  "name": "Gabriel Aderaldo",
  "preferred_username": "gabriel@acdg.auth.acdgbrasil.com.br",
  "email": "gabriel@example.com",
  "email_verified": true,
  "urn:zitadel:iam:org:project:roles": {
    "social_worker": {
      "363109883022671995": "acdg.auth.acdgbrasil.com.br"
    },
    "admin": {
      "363109883022671995": "acdg.auth.acdgbrasil.com.br"
    }
  }
}
```

**Nota:** Como "Include user's profile info in ID Token" esta **desativado** no console, `name`, `email`, etc. podem **nao vir** no id_token. Nesse caso, chamar o `userinfo` endpoint para obte-los.

Para extrair de um token real:
```bash
echo "<id_token>" | cut -d. -f2 | base64 -d 2>/dev/null | jq .
```

### 38. O Zitadel usa algum claim nao-standard que o BFF depende?

**Sim, um claim principal:**

`urn:zitadel:iam:org:project:roles` — mapa de roles do projeto.

Formato: `Map<string, Map<string, string>>`. So as keys externas importam.

Usado por:
- **Backend Swift:** `ZitadelJWTPayload.swift` — extraido do access_token para RBAC
- **Frontend Flutter:** `oidc_claims_parser.dart` — extraido para `Set<AuthRole>`
- **BFF Deno:** Atualmente **nao extrai** (deveria, apos adicionar o scope)

Outros claims Zitadel-specific que podem aparecer mas que o BFF nao usa:
- `urn:zitadel:iam:org:project:id:<projectId>:aud` — audience scope
- `urn:zitadel:iam:user:metadata` — metadados customizados do usuario
- `urn:zitadel:iam:org:id:<orgId>` — org do usuario

---

## Resumo de Problemas e Acoes

| # | Severidade | Problema | Acao Recomendada |
|---|-----------|----------|------------------|
| 1 | **CRITICA** | JWKS sem refresh no backend Swift — chaves rotacionam a cada 6h | Implementar refresh periodico de JWKS ou usar lib com cache+TTL |
| 2 | **ALTA** | BFF Deno scopes incompletos | Adicionar `offline_access` e `urn:zitadel:iam:org:project:roles` ao scope em `bff_service.ts:299` |
| 3 | **ALTA** | Lockout desativado (0 tentativas max) | Configurar valor razoavel em Settings > Lockout (ex: 5 tentativas) |
| 4 | **MEDIA** | Post-logout URIs faltando | Adicionar URIs de HML e prod no console do Conecta Web BFF |
| 5 | **MEDIA** | Logout incompleto (sem id_token_hint/post_logout_redirect_uri) | Armazenar id_token na sessao, enviar no logout |
| 6 | **MEDIA** | User Registration aberto + User Enumeration | Avaliar desativar registro publico; ativar "Ignore unknown Usernames" |
| 7 | **MEDIA** | "Include profile info in ID Token" desativado | Ativar no console ou usar userinfo endpoint |
| 8 | **BAIXA** | Client unico multi-ambiente | Considerar separar em clients por ambiente (dev/HML/prod) |

---

## Quick Reference — Dados para Copiar

```env
# .env do BFF Deno
OIDC_ISSUER=https://auth.acdgbrasil.com.br
OIDC_CLIENT_ID=367349956392059030
OIDC_CLIENT_SECRET=<do Bitwarden>
OIDC_REDIRECT_URI=https://localhost/auth/callback
SESSION_SECRET=<do Bitwarden, min 32 chars>
SESSION_TTL_MINUTES=60
API_BASE_URL=http://social-care:3000
PEOPLE_CONTEXT_BASE_URL=http://people-context:3000
```

```typescript
// Scopes corretos para o BFF Deno
scope: "openid profile email offline_access urn:zitadel:iam:org:project:roles"
```

```typescript
// Roles para RBAC no BFF
type ZitadelRole = "social_worker" | "owner" | "admin";
```
