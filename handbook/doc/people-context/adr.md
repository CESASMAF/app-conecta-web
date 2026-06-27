# ADR-0001: Orquestração de provisão de login e operações IdP-first exclusivamente via BFF

**Status**: Accepted

**Data**: 2026-06-12

**Feature**: `specs/002-people-context-web/`

**Decisores**: Gabriel Aderaldo + equipe web ACDG-BV (com revisão arquitetural Claude)

## Contexto

O backend `people-context` (Bun 1.3 · Elysia · PostgreSQL · NATS · TypeScript funcional)
expõe a API `/api/v1` — pessoas, vínculos de sistema, provisão de login, password reset e
erasure LGPD — protegida por JWT OIDC do Authentik (RS256 via JWKS, roles no claim
`groups`) e pelo `AuthGuard` (`AUTH-001..003`), com header `X-Actor-Id` obrigatório em
mutações (correlacionado ao `JWT.sub`). Ele é, por decisão de arquitetura (ADR-HIGH-5,
ADR-027, ADR-029, ADR-030 do `people-context`), o **único** serviço que fala com o
**Authentik Management API**: provisiona usuários (`provisionUserInIdp` — username único
com retry, `setPassword` best-effort), sincroniza groups `system:role` e perfil
(best-effort, DB local como fonte de verdade) e executa as operações **IdP-first**
(deactivate/reactivate/erasure mutam o Authentik ANTES do DB).

Essa orquestração produz respostas HTTP com semântica própria, que não são erros comuns:

- `207 Multi-Status` em `POST /people`: a pessoa **foi criada**, mas a provisão do login no
  IdP falhou — recuperável via `POST /people/:id/login` (login retroativo).
- `502 IDP-001..005`: a mutação no Authentik falhou e, pela ordem IdP-first, **o banco não
  foi tocado** — retry é seguro e idempotente.
- `202 Accepted` em `request-password-reset`: o link **não retorna no body**
  (ADR-030/AppSec CRITICAL-2) — viaja só no evento NATS `people.user.password_reset_requested`
  consumido pelo `queue-manager`, que envia o e-mail PT-BR.

Restrições em jogo:

- **[Constituição web_02](../../../.specify/memory/constitution.md)** — Princípio I
  (BFF-Orchestrated Boundary): o browser **nunca** vê JWT, refresh token, client secret
  OIDC, token de service account do Authentik nem URL de backend; CPF não trafega em JSON
  de estado JS. Princípio II (Errors as Values). Princípio III (Vertical-Modular,
  MVVM×DDD). Princípio IV (Bun-Native). Princípio V (End-to-End Type Safety).
- **[ADR-0004 (web_02)](../../adr/0004-client-server-split-mvvm-ddd.md)** (Split
  Client×Server; fronteira = Eden Treaty → rota Elysia; BFF fala com backends, client não
  conhece backends) e **[ADR-0005 (web_02)](../../adr/0005-auth-session-refresh-decisions.md)**
  (sessão opaca, refresh single-flight, `jose` verify) — este ADR os aplica à feature.
- **ADR-009 do `web_02`** (deploy ACDG-BV): VPS única, Docker Compose, Caddy como borda;
  `web_02` é o **único serviço público** — `people-context` e o Authentik Management API
  vivem em rede interna, sem rota pública para a API administrativa.
- O BFF não mantém audit próprio; o audit do `people-context` é por eventos NATS (Outbox).
- LGPD: registro de identidade de pacientes de doenças raras — minimização, contenção de
  PII e contenção do link de recuperação de senha são requisito legal, não preferência.
- Precedente do conjunto irmão: ADR-0001 de `001-social-care-web`
  (`../social-care/adr.md`) — mesmo padrão, aqui estendido à orquestração IdP.

A alternativa ingênua — o front (ou mesmo o BFF) chamando o Authentik Management API para
criar usuários e groups — exigiria distribuir o token de service account, duplicaria a
lógica de unicidade de username/IdP-first/role-sync já resolvida no `people-context` e
criaria split-brain entre dois orquestradores do mesmo IdP.

## Decisão

**Toda interação do browser com identidade, vínculos e provisão de login passa
exclusivamente pelo BFF Elysia (rotas `/api/*` em `src/routes/api/[...path].ts` do
SolidStart), que fala somente com o `people-context` via Eden Treaty. Nem o client nem o
BFF conhecem o Authentik Management API — e o client tampouco conhece a URL, o contrato ou
as credenciais do `people-context`.**

Concretamente:

- A sessão do usuário vive em cookie `__Host-session` (`HttpOnly`, `Secure`,
  `SameSite=Strict`); os tokens OIDC ficam **somente** no servidor (verificados com
  `jose` — [ADR-0005](../../adr/0005-auth-session-refresh-decisions.md)).
- Cada rota Elysia ([ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md) —
  `*.query.fn.ts` / `*.service.fn.ts`) valida o input com TypeBox (`Elysia.t`), injeta
  `Authorization: Bearer <jwt>` e — em toda mutação — o header `X-Actor-Id` com o
  `JWT.sub` da sessão (exigência `AUTH-003` do `people-context`), valida a response com
  TypeBox e compõe o ViewModel da tela (`PersonModel`, `PersonSummaryModel` — ver
  [`domain.fe.md`](./domain.fe.md)).
- O BFF **traduz os estados de orquestração IdP em estados de UI, não em erros fatais**:
  - `207 Multi-Status` → sucesso parcial `provisionPending: true` + evento de client
    `LoginProvisionPending`; a ficha exibe banner com ação "Provisionar login" (retry via
    rota Elysia `provisionLogin.query.fn.ts` → `POST /people/:id/login`).
  - `502 IDP-001..005` → estados retryable (`'idp-provision-failed'`,
    `'idp-deactivation-failed'`…) com botão "Tentar novamente" — seguro porque IdP-first
    garante que o DB não mudou (mapeamento completo em [`adr.fe.md`](./adr.fe.md)).
  - `202 Accepted` do password reset → confirmação "o link será enviado por e-mail"; a UI
    **nunca** exibe nem espera o link.
- O adapter (`server/adapters/people-context.adapter.ts`) atua como Anticorruption Layer:
  traduz envelope `{ data, meta }`, paginação por cursor (`nextCursor`/`hasMore`), máscara
  de CPF (`cpfMasked`) e códigos `PEO/ROL/IDP/AUTH-XXX` para o modelo do frontend.
- Na topologia ACDG-BV, `people-context` e Authentik Management API permanecem em rede
  Docker interna; apenas `web_02`/Caddy (e os endpoints OIDC públicos do Authentik para o
  login) têm exposição.

## Citação canônica *(obrigatória — rigor arquitetural)*

> An Anticorruption Layer is the most defensive Context Mapping relationship, where the
> downstream team creates a translation layer between its Ubiquitous Language (model) and
> the Ubiquitous Language (model) that is upstream to it. The layer isolates the downstream
> model from the upstream model, translating between the two. Thus, this is also an
> approach to integration.
> — *(Linha 1577, p. 91–92, VAUGHN VERNON, *Implementing Domain-Driven Design*)*

## Alternativas consideradas

- **Front (ou BFF) chamando o Authentik Management API diretamente** — rejeitada: exigiria
  token de service account fora do `people-context` (no caso do front, no browser —
  inaceitável); duplicaria `provisionUserInIdp`/`syncRoleAssignment` (unicidade de
  username, retry em 409, IdP-first, blueprint de groups ADR-029) criando split-brain de
  orquestração; quebraria a fonte de verdade única (`idpUserId`/`idpUserPk` no Postgres do
  `people-context`).
- **SPA chama `people-context` diretamente (token no browser)** — rejeitada: viola o
  Princípio I da [constituição web_02](../../../.specify/memory/constitution.md)
  (BFF-Orchestrated Boundary), expõe JWT a XSS, exige backend público + CORS e vaza CPF
  para storage do client (risco LGPD inaceitável).
- **Tratar 207/502 como erro genérico (toast "algo deu errado")** — rejeitada: perde a
  semântica recuperável que o backend oferece de propósito — 207 significa "pessoa salva,
  só falta o login" (retry específico), 502 IdP-first significa "nada persistiu, repita" —
  e induziria o operador a recadastrar a pessoa, esbarrando na dedup por CPF sem entender o
  porquê.
- **Link de password reset exibido na tela para o admin copiar** — rejeitada: o contrato
  nem oferece o link em HTTP (ADR-030/CRITICAL-2); reintroduzi-lo via Management API
  violaria a decisão de AppSec e colocaria credencial de recuperação no browser.

## Consequências

- **Positivas**: superfície pública mínima (1 serviço); token de service account do
  Authentik contido no `people-context`, tokens OIDC contidos no BFF; semântica IdP-first
  preservada de ponta a ponta (UI sabe quando retry é seguro); 207 vira fluxo de
  recuperação guiado em vez de suporte manual; ViewModel puro pronto por tela (1 rota
  Elysia = 1 chamada — [ADR-0009](../../adr/0009-framework-agnostic-client.md)); ACL isola
  o frontend de mudanças do contrato Bun/Elysia; conformidade LGPD por construção (CPF
  mascarado, link de reset jamais no browser).
- **Negativas / trade-offs**: BFF vira ponto único de passagem (mitigado por healthcheck +
  restart policy no Compose da ADR-009); +1 hop de latência por request; a UI precisa
  modelar estados extras (`provision-pending`, retries de IdP) que não existiriam num CRUD
  ingênuo; desenvolvimento do client usa fakes/in-memory em `bun:test` (Princípio VI —
  Honesty/No Mocks; ver [ADR-0011](../../adr/0011-no-mocks-in-production.md)) incluindo
  207/202, enquanto endpoints não estiverem verdes no
  [`api-readiness.fe.md`](./api-readiness.fe.md).
- **Impacto em BCs / outbox / migrations**: nenhum no backend — o contrato `/api/v1` do
  `people-context` permanece intacto, o Transactional Outbox continua sendo o único canal
  de eventos (`people.*`) e o `recoveryLink` segue trafegando exclusivamente via NATS para
  o `queue-manager`; no frontend, o módulo vertical ([`domain.fe.md`](./domain.fe.md))
  nasce já assumindo o BFF como única origem de dados.

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípios I, II, III, IV, V
- [ADR-0001 (web_02): Arquitetura Vertical-Modular](../../adr/0001-vertical-modular-architecture.md)
- [ADR-0004 (web_02): Client-Server Split MVVM×DDD](../../adr/0004-client-server-split-mvvm-ddd.md)
- [ADR-0005 (web_02): Auth — OIDC+PKCE, sessão opaca, jose verify](../../adr/0005-auth-session-refresh-decisions.md)
- [ADR-0009 (web_02): Framework-Agnostic Client](../../adr/0009-framework-agnostic-client.md)
- [ADR-0010 (web_02): BFF Elysia — nomenclatura de funções](../../adr/0010-bff-orchestration-fn-naming.md)
- [ADR-0011 (web_02): No Mocks in Production](../../adr/0011-no-mocks-in-production.md)
- [ADR-0002 (feature): Mapeamento de erros PEO/ROL/IDP/AUTH](./adr.fe.md)
- [domain.fe.md — modelo e eventos do client](./domain.fe.md)
- [api-readiness.fe.md — prontidão dos endpoints](./api-readiness.fe.md)
- [Índice de ADRs web_02](../../adr/README.md)
