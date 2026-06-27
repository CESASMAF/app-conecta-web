# ADR-0001: Consumo da API social-care exclusivamente via BFF

**Status**: Accepted

**Data**: 2026-06-12

**Feature**: `specs/001-social-care-web/`

**Decisores**: Gabriel Aderaldo + equipe web ACDG-BV (com revisão arquitetural Claude)

## Contexto

O backend `social-care` (Swift 6.3 · Vapor · CQRS+Event Sourcing+Outbox) expõe a API
`/api/v1` — `PatientController`, `AssessmentController`, `ProtectionController`,
`CareController`, `LookupController` — protegida por JWT OIDC (Authentik, multi-issuer
durante a migração — ADR-027/ADR-031 do `social-care`) e RBAC (`worker`/`owner`/`admin`,
`RoleGuardMiddleware`). O `actorId` do audit trail é derivado do `JWT.sub` validado
(ADR-023 do `social-care`); erros seguem o envelope `AppError` (`PAT-001`, `DISC-007`…).

Restrições em jogo:

- **Constituição web_02** (ver [`../../../.specify/memory/constitution.md`](../../../.specify/memory/constitution.md)):
  **Princípio I** (BFF-Orchestrated Boundary — o browser **nunca** vê JWT, refresh token, client
  secret OIDC nem URL de backend; PII (CPF/NIS/RG) não trafega em JSON de estado JS) e
  **Princípio III** (Vertical-Modular: fronteira client↔server é o Eden treaty → rota Elysia).
- [**ADR-0004**](../../adr/0004-client-server-split-mvvm-ddd.md) (split client × server, MVVM ×
  DDD) e [**ADR-0005**](../../adr/0005-auth-session-refresh-decisions.md) (auth OIDC+PKCE, sessão
  opaca, cookie `HttpOnly`) — aceitos; este ADR os aplica à feature, não os contraria.
- **ADR-009 do `web/handbook`** (deploy ACDG-BV): VPS única, Docker Compose, Caddy como
  borda; `web` é o **único serviço público** — `social-care` vive em rede interna
  (`internal: true`), sem rota no Caddyfile.
- **ADR-008 do `web/handbook`**: audit trail centralizado no backend Swift via Outbox; o
  BFF não mantém audit próprio.
- LGPD: dados de saúde de pacientes de doenças raras — minimização e contenção de PII são
  requisito legal, não preferência.

A alternativa ingênua — SPA chamando `social-care` direto com token no browser — exigiria
expor o backend publicamente, gerenciar CORS, guardar JWT em storage acessível a XSS e
vazaria o vocabulário/contrato do backend para dentro do client.

## Decisão

**Toda interação do browser com o domínio social-care passa exclusivamente pelo BFF
(rotas Elysia em `src/routes/api/[...path].ts`, consumidas via Eden Treaty). O client
jamais conhece a URL, o contrato ou as credenciais do `social-care`.**

Concretamente:

- A sessão do usuário vive em cookie `__Host-session` (`HttpOnly`, `Secure`,
  `SameSite=Strict`); os tokens OIDC ficam **somente** no servidor (BFF Elysia).
- Cada handler Elysia (`*.query.fn.ts` / `*.service.fn.ts` — [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md))
  valida o input com TypeBox (`Elysia.t`), injeta `Authorization: Bearer <jwt>` na
  chamada outbound, valida a response e compõe o ViewModel da tela
  (`PatientCaseFileModel`, `PatientSummaryModel` — ver [`domain.fe.md`](./domain.fe.md)).
- O `social-care` deriva o `actorId` do `JWT.sub`; o BFF não envia header customizado de
  ator (ADR-023 do `social-care`).
- O adapter (`server/adapters/social-care.adapter.ts`) atua como Anticorruption Layer:
  traduz envelope `StandardResponse`, paginação por cursor, `version` (optimistic locking,
  HTTP 409) e códigos `AppError` para o modelo do frontend (detalhe do mapeamento de erros
  em [`adr.fe.md`](./adr.fe.md)).
- Na topologia ACDG-BV, `social-care` permanece em rede Docker interna; apenas
  `web`/Caddy têm exposição pública.

## Citação canônica *(obrigatória — Princípio II da constituição)*

> An Anticorruption Layer is the most defensive Context Mapping relationship, where the
> downstream team creates a translation layer between its Ubiquitous Language (model) and
> the Ubiquitous Language (model) that is upstream to it. The layer isolates the downstream
> model from the upstream model, translating between the two. Thus, this is also an
> approach to integration.
> — *(Linha 1577, p. 91–92, VAUGHN VERNON, *Implementing Domain-Driven Design*)*

## Alternativas consideradas

- **SPA chama `social-care` diretamente (token no browser)** — rejeitada: viola o
  Princípio I (BFF-Orchestrated Boundary), expõe JWT a XSS, exige backend público + CORS,
  e vaza PII de saúde para storage do client (risco LGPD inaceitável).
- **Gateway/reverse proxy "burro" (rota direta no Caddy para `social-care`)** — rejeitada:
  resolve TLS mas não composição; o client teria que agregar N chamadas (fan-out na view),
  violando o Princípio I (client nunca compõe, agrega nem faz fan-out), e o contrato do
  backend acoplaria a UI (sem ACL).
- **GraphQL federation entre os 3 microserviços** — rejeitada: camada extra de infra e
  schema stitching para time de 1–2 devs, contraria o Princípio IV (Bun-Native/Zero-NPM-Utility
  — [ADR-0003](../../adr/0003-bun-supply-chain.md)) e não oferece nada que o BFF Elysia +
  TypeBox não cubram no escopo atual.

## Consequências

- **Positivas**: superfície pública mínima (1 serviço); tokens e URLs de backend contidos
  no servidor; ViewModel pronto por tela (1 rota = 1 chamada); ACL isola o frontend de
  mudanças de contrato do Swift; fallback gracioso por campo quando um serviço tolerável
  falha; conformidade LGPD por construção.
- **Negativas / trade-offs**: BFF vira ponto único de passagem (mitigado por healthcheck +
  restart policy no Compose da ADR-009); +1 hop de latência por request; desenvolvimento
  do client depende de valores `'not-implemented'` (Princípio VI — [ADR-0011](../../adr/0011-no-mocks-in-production.md))
  enquanto endpoints não estiverem verdes no [`api-readiness.fe.md`](./api-readiness.fe.md);
  toda evolução de tela exige tocar BFF + client.
- **Impacto em BCs / outbox / migrations**: nenhum no backend — o contrato `/api/v1` do
  `social-care` permanece intacto, o Transactional Outbox continua sendo o único canal de
  eventos de domínio e o audit trail segue exclusivo do Swift (ADR-008); no frontend, todos
  os módulos verticais ([`domain.fe.md`](./domain.fe.md)) nascem já assumindo o BFF como única
  origem de dados.

## Referências

- Constituição web_02: [`../../../.specify/memory/constitution.md`](../../../.specify/memory/constitution.md)
- ADR-0001 Arquitetura vertical-modular: [`../../adr/0001-vertical-modular-architecture.md`](../../adr/0001-vertical-modular-architecture.md)
- ADR-0003 Bun supply-chain: [`../../adr/0003-bun-supply-chain.md`](../../adr/0003-bun-supply-chain.md)
- ADR-0004 Split client × server (MVVM × DDD): [`../../adr/0004-client-server-split-mvvm-ddd.md`](../../adr/0004-client-server-split-mvvm-ddd.md)
- ADR-0005 Auth — OIDC+PKCE, sessão opaca: [`../../adr/0005-auth-session-refresh-decisions.md`](../../adr/0005-auth-session-refresh-decisions.md)
- ADR-0010 BFF orquestrador / nomenclatura fn: [`../../adr/0010-bff-orchestration-fn-naming.md`](../../adr/0010-bff-orchestration-fn-naming.md)
- ADR-0011 No mocks em produção: [`../../adr/0011-no-mocks-in-production.md`](../../adr/0011-no-mocks-in-production.md)
- Índice de ADRs: [`../../adr/README.md`](../../adr/README.md)
- Domínio frontend (ViewModel, anti-corrupção): [`./domain.fe.md`](./domain.fe.md)
- Mapeamento de erros: [`./adr.fe.md`](./adr.fe.md)
- Prontidão da API: [`./api-readiness.fe.md`](./api-readiness.fe.md)
- Elysia (BFF): [`../../reference/framework/elysia/`](../../reference/framework/elysia/)
- SolidStart: [`../../reference/framework/solidstart/`](../../reference/framework/solidstart/)
