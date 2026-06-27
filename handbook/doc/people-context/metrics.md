# Métricas & NFRs: Interface Web People-Context — visão do contrato (serviço consumido)

**Feature**: `specs/002-people-context-web/` · **Consultores**: `/acdg-skills:software-architect` + `/acdg-skills:requirements-engineer`

> Fase 4 da pipeline `core-api-sdd` (máximo rigor). NFRs ancorados com **citação canônica**
> (Newman/arquitetura) via `skills_citar`. Toda métrica deve ser **mensurável**.
> Este documento mede o **contrato do `people-context` observável pelo consumo via BFF Elysia**
> (latência, erros estruturados, taxa de 207, lag do outbox); a experiência do browser está em
> [`metrics.fe.md`](./metrics.fe.md). ADRs globais: [índice](../../adr/README.md).
> [Constituição web_02](../../../.specify/memory/constitution.md).

## Métricas funcionais

> "O sistema faz a coisa certa" — verificáveis por teste/BDD.

| ID | Métrica | Alvo | Como medir |
|---|---|---|---|
| MF-001 | Toda resposta do `people-context` parseia no schema TypeBox do envelope `{ data, meta.timestamp }` (com `pageSize/totalCount/hasMore/nextCursor` em listagens) e todo erro no envelope `{ success: false, error: { code, message } }` | 100% das respostas em staging; 0 `typebox-parse-error` em produção | contador de falhas de parse no BFF Elysia + testes de integração (`bun:test`, T-003, T-011…T-017) |
| MF-002 | Todo erro HTTP do backend carrega código estruturado conhecido (`PEO-001`…`PEO-010`, `ROL-001`…`ROL-009`, `IDP-001`…`IDP-005`, `AUTH-001`…`AUTH-003`, `ADM-001`) | taxa de código desconhecido (`unknown-error`) < 0,1% dos erros | contador por código no mapper `AppError` do BFF |
| MF-003 | Dedup por CPF é idempotente: `POST /people` com CPF existente retorna 201 com o id existente (0 duplicata criada); vínculo já ativo retorna 204 noop | 100% nos cenários CT-003/CT-007 | testes de integração (`bun:test` + fakes in-memory) + smoke em staging com CPF repetido |
| MF-004 | Regras de autorização de vínculo respondem com o código previsto: `ROL-006` (superadmin-only), `ROL-007` (admin escopado), `ROL-008` (auto-assign), `ROL-009` (race) | 100% nos cenários CT-008…CT-010 | testes de integração (`bun:test` + fakes in-memory) + smoke em staging |
| MF-005 | `POST /people/:personId/request-password-reset` responde 202 **sem link no body** (link só no evento `people.user.password_reset_requested` — ADR-030) | 100%; 0 ocorrência de link em resposta HTTP | asserção explícita em T-015 + inspeção de logs do BFF em staging |

## Métricas não-funcionais (NFRs)

> "O sistema faz certo" — performance, segurança, auditoria, manutenibilidade.

| ID | Categoria | Alvo mensurável | Como medir |
|---|---|---|---|
| NFR-001 | Performance | p95 dos grupos de endpoint dentro do orçamento da tabela MP (abaixo) | histograma de latência por rota normalizada no BFF (logs estruturados) |
| NFR-002 | Disponibilidade do contrato | `GET /ready` 200 em ≥ 99,5% das sondas (janela semanal); taxa de 5xx vista pelo BFF < 0,5% das requisições | sonda sintética 30 s no `/ready` (checks `database`, `nats`, `outbox`, `outboxBacklog`) + contador por classe de status no BFF |
| NFR-003 | Auditoria/eventos | lag do outbox (`occurredAt` do evento → publicado no NATS) p95 < 5 s (relay: poll 1 s, batch 50); backlog `outboxBacklog` < 1000 (limiar de warning do `/ready`) | métrica do outbox-relay exposta pelo serviço + campo `outboxBacklog` do `/ready` |
| NFR-004 | Resiliência de provisão IdP | taxa de `207 Multi-Status` em `POST /people` com `createLogin` < 2%/semana (acima disso = incidente Authentik); 100% dos 207 recuperados via `POST /people/:id/login` em ≤ 7 dias | contador `multi-status` no BFF + relatório de pessoas com `idpUserId=null` e login solicitado |
| NFR-005 | Segurança | 100% das mutações outbound com `Authorization: Bearer` + `X-Actor-Id` injetados no servidor; 0 chamadas anônimas a rotas protegidas; 401 (`AUTH-001`)/403 (`AUTH-002`) < 0,5% (indicador de RBAC desalinhado na UI); 0 CPF em logs | log estruturado do BFF (sem valor do token, sem CPF) + contador 401/403 por rota + grep de logs em CI/staging |

**Citação que sustenta os NFRs** (obrigatória):
> "A microservice architecture gives you more options as to how you solve problems, but it also
> means more moving parts — more places where things can go wrong. Monitoring small things and
> aggregating to see the bigger picture becomes essential: without good observability of each
> service boundary, you cannot reason about the behavior of the system as a whole."
> — *(localização exata no corpus a registrar via `skills_citar`; Sam Newman, *Building Microservices* — monitoramento por fronteira de serviço)*

## Métricas de performance

| ID | Indicador | Baseline | Alvo | Orçamento |
|---|---|---|---|---|
| MP-001 | latência p95 do grupo **leitura** — `GET /people` (lista paginada, limit=20), `GET /people/:personId`, `GET /people/by-cpf/:cpf` | N/A (pré-deploy BV) | < 250 ms | 400 ms |
| MP-002 | latência p95 do grupo **mutação local** — `POST /people` sem `createLogin`, `PUT /people/:personId` | N/A | < 400 ms | 700 ms |
| MP-003 | latência p95 do grupo **mutação com IdP síncrono** — `POST /people` com `createLogin`, `POST /people/:id/login`, `PUT .../deactivate|reactivate`, `request-password-reset`, `DELETE /people/:id` (Authentik na mesma VPS) | N/A | < 1.200 ms | 2.500 ms |
| MP-004 | latência p95 do grupo **vínculos** — `POST /people/:personId/roles` (transação `FOR UPDATE` + sync de group best-effort), `PUT .../roles/:roleId/deactivate|reactivate`, `GET /roles?system=...` | N/A | < 500 ms | 900 ms |
| MP-005 | latência p95 `GET /ready` (sonda de disponibilidade) | N/A | < 100 ms | 250 ms |
| MP-006 | throughput sustentado na VPS BV (single-VPS, ADR-009) | N/A | 20 req/s no mix das jornadas sem degradar p95 | limites de recursos do compose (ADR-009) |

> Medições na borda do BFF Elysia (`src/routes/api/[...path].ts` do SolidStart), rede interna
> Docker da VPS — não incluem latência do browser (essa fica em
> [`metrics.fe.md`](./metrics.fe.md)). O grupo MP-003 depende do Authentik (IdP-first):
> degradação ali aparece primeiro como aumento de 207/502 `IDP-*`, não só de latência.

## Critérios de sucesso (mensuráveis, tech-agnostic)

- **SC-001**: administradora cadastra uma pessoa com login provisionado em < 3 min, com confirmação visível ("Login provisionado") ou caminho de retry claro (207).
- **SC-002**: 0 pessoa duplicada por CPF no banco após uma semana de operação (dedup idempotente + busca prévia por CPF na UI).
- **SC-003**: evento derivado de mutação (ex.: `people.role.assigned` consumido por `social-care`) disponível em < 1 min após a ação na web (NFR-003).
- **SC-004**: nenhum erro exibido à usuária sem mensagem em PT-BR acionável (taxa de `unknown-error` < 0,1%); 100% dos 403 de vínculo (`ROL-006/007/008`) explicam o motivo específico.

## Observabilidade

- **Logs estruturados do BFF Elysia** (JSON, stdout → coleta do compose `observability`
  profile): por requisição outbound — rota normalizada (`/people/:personId/roles`), método,
  status, duração ms, código `AppError` quando presente, `requestId`. **Nunca** token,
  `X-Actor-Id` em claro junto a dados pessoais, CPF ou corpo de request/response.
- **Contadores**: requisições por rota/status; erros por código estruturado (dimensão
  `code`, famílias `PEO`/`ROL`/`IDP`/`AUTH`); `multi-status` (207);
  `typebox-parse-error`; 401/403 por rota; dedup (201 com id pré-existente, sinalizado
  pela busca prévia).
- **Disponibilidade**: sonda sintética em `GET /ready` a cada 30 s registrando status e
  os checks (`database`, `nats`, `outbox`, `outboxBacklog`); alerta em 503 ou
  `outboxBacklog` > 1000.
- **Lag do outbox**: métrica do relay do `people-context` (poll 1 s, batch 50) exposta no
  profile de observabilidade da ADR-009; nos E2E sintéticos, diff `occurredAt` → consumo
  do evento.
- **OpenTelemetry**: quando o profile `observability` da orquestração BV estiver ativo,
  propagar `traceparent` do BFF Elysia para o `people-context` e exportar histogramas
  MP-001…MP-005 como métricas OTLP.
- Dashboards/alertas mínimos: p95 acima do orçamento por 15 min; `/ready` 503; taxa de
  207 > 2%/h (incidente Authentik); surto de um mesmo código de erro (> 50/h) — sinal de
  regressão de contrato ou de RBAC desalinhado na UI.

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md)
- [ADR-0001 (people-context): BFF como única fronteira](./adr.md)
- [ADR-0004 (web_02): Client-Server Split — Eden Treaty](../../adr/0004-client-server-split-mvvm-ddd.md)
- [metrics.fe.md — NFRs da experiência do browser](./metrics.fe.md)
- [domain.md — modelo de domínio CORE](./domain.md)
- [api-readiness.fe.md — prontidão dos endpoints](./api-readiness.fe.md)
- [discovery.md — requisitos do backend](./discovery.md)
- [Índice de ADRs web_02](../../adr/README.md)
- Docs offline: `../../reference/messaging/nats/` · `../../reference/database/postgresql/`
