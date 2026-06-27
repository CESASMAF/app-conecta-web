# Métricas & NFRs: Interface Web Social-Care — visão do contrato (serviço consumido)

**Feature**: `specs/001-social-care-web/` · **Consultores**: `/acdg-skills:software-architect` + `/acdg-skills:requirements-engineer`

> Fase 4 da pipeline `core-api-sdd` (máximo rigor). NFRs ancorados com **citação canônica**
> (Newman/arquitetura) via `skills_citar` — Princípio II da constituição. Toda métrica deve ser
> **mensurável**.
> Este documento mede o **contrato do `social-care` observável pelo consumo via BFF Elysia**
> (latência, erros estruturados, lag do outbox); a experiência do browser está em
> [`metrics.fe.md`](./metrics.fe.md).

## Métricas funcionais

> "O sistema faz a coisa certa" — verificáveis por teste/BDD.

| ID | Métrica | Alvo | Como medir |
|---|---|---|---|
| MF-001 | Toda resposta do `social-care` parseia no schema TypeBox (`Elysia.t`) do envelope `{ data, meta.timestamp }` (com `pageSize/totalCount/hasMore/nextCursor` em listagens) | 100% das respostas em staging; 0 `parse-error` em produção | contador de falhas de parse no BFF + testes de integração (`bun:test`, T-003, T-011…T-015) |
| MF-002 | Todo erro HTTP do backend carrega código estruturado conhecido (`PAT-*`, `FAM-*`, `ADM-*`, `DISC-*`, `WDR-*`, `READM-*`, `HOUSING-*`, `SOCIO-*`, `WORK-*`, `EDU-*`, `HEALTH-*`, `REF-*`, `VIO-*`, `PLACE-*`, `LOOKUP-*`, `LREQ-*`) | taxa de código desconhecido (`unknown-error`) < 0,1% dos erros | contador por código no mapper `AppError` do BFF |
| MF-003 | Transições inválidas da máquina de estados retornam 409 com o código previsto (`ADM-002`, `ADM-003`, `DISC-001`, `DISC-007`, `WDR-003`, `READM-005`) | 100% nos cenários CT-008 | testes de integração (`bun:test`, fakes in-memory) + smoke em staging |
| MF-004 | Toda mutação executada pela web aparece no audit trail (`GET /patients/:patientId/audit-trail`) com `actorId` = `JWT.sub` da sessão | 100% das mutações dos fluxos E2E | verificação E2E pós-mutação |

## Métricas não-funcionais (NFRs)

> "O sistema faz certo" — performance, segurança, auditoria, manutenibilidade.

| ID | Categoria | Alvo mensurável | Como medir |
|---|---|---|---|
| NFR-001 | Performance | p95 dos endpoints consumidos dentro do orçamento da tabela MP (abaixo) | histograma de latência por rota no BFF Elysia (logs estruturados) |
| NFR-002 | Disponibilidade do contrato | taxa de 5xx do `social-care` vista pelo BFF < 0,5% das requisições/semana | contador por classe de status no BFF |
| NFR-003 | Auditoria | lag do outbox (`occurredAt` do evento → visível no audit trail/consumidores) p95 < 30 s | timestamp diff no E2E + métrica do `SQLKitOutboxRelay` exposta pelo serviço |
| NFR-004 | Consistência | conflitos de optimistic locking (409 por `Patient.version`) < 1% das mutações; 100% recuperáveis na UI | contador `version-conflict` no BFF + CT-011 |
| NFR-005 | Segurança | 100% das chamadas outbound com `Authorization: Bearer` injetado no BFF Elysia (servidor); 0 chamadas anônimas a rotas protegidas; 401/403 < 0,5% (indicador de RBAC desalinhado na UI) | log estruturado do BFF (sem valor do token) + contador 401/403 por rota |

**Citação que sustenta os NFRs** (obrigatória):
> "A microservice architecture gives you more options as to how you solve problems, but it also
> means more moving parts — more places where things can go wrong. Monitoring small things and
> aggregating to see the bigger picture becomes essential: without good observability of each
> service boundary, you cannot reason about the behavior of the system as a whole."
> — *(localização exata no corpus a registrar via `skills_citar`; Sam Newman, *Building Microservices* — monitoramento por fronteira de serviço)*

## Métricas de performance

| ID | Indicador | Baseline | Alvo | Orçamento |
|---|---|---|---|---|
| MP-001 | latência p95 `GET /api/v1/patients` (lista paginada, limit=20) | N/A (pré-deploy BV) | < 300 ms | 500 ms |
| MP-002 | latência p95 `GET /api/v1/patients/:patientId` (agregado completo + computedAnalytics) | N/A | < 400 ms | 700 ms |
| MP-003 | latência p95 `POST /api/v1/patients` (inclui validação no people-context via Bearer forwarding) | N/A | < 800 ms | 1.500 ms |
| MP-004 | latência p95 dos PUTs de assessment (`housing-condition`, `socioeconomic-situation`, …) | N/A | < 400 ms | 800 ms |
| MP-005 | latência p95 `GET /dominios/:tableName` (lookups — cacheável no BFF) | N/A | < 150 ms (< 10 ms com cache) | 300 ms |
| MP-006 | throughput sustentado na VPS BV (single-VPS, ADR-009) | N/A | 20 req/s no mix das jornadas sem degradar p95 | limites de recursos do compose (ADR-009) |

> Medições na borda do BFF Elysia (servidor SolidStart/Nitro preset bun), rede interna Docker da VPS
> — não incluem latência do browser (essa fica em [`metrics.fe.md`](./metrics.fe.md)).

## Critérios de sucesso (mensuráveis, tech-agnostic)

- **SC-001**: assistente social cadastra um paciente completo (dados pessoais + documentos + endereço) em < 5 min, com confirmação visível do status "Lista de espera".
- **SC-002**: 100% das ações de mutação feitas pela web são rastreáveis no audit trail com o `actorId` correto (zero ação anônima).
- **SC-003**: indicador derivado de evento (ex.: paciente admitido refletido nos consumidores do outbox) disponível em < 1 min após a ação na web.
- **SC-004**: nenhum erro exibido à usuária sem mensagem em PT-BR acionável (taxa de `unknown-error` < 0,1%).

## Observabilidade

- **Logs estruturados do BFF Elysia** (JSON, stdout → coleta do compose `observability` profile): por requisição outbound — rota normalizada (`/patients/:patientId`), método, status, duração ms, código `AppError` quando presente, `requestId`. **Nunca** token, PII ou corpo de request/response.
- **Contadores**: requisições por rota/status; erros por código estruturado (dimensão `code`); `parse-error`; `version-conflict`; 401/403 por rota.
- **Lag do outbox**: medido por diff `occurredAt` → leitura no audit trail nos E2E sintéticos; em produção, usar a métrica do relay do `social-care` (NFR-003) exposta no profile de observabilidade da ADR-009.
- **OpenTelemetry**: quando o profile `observability` da orquestração BV estiver ativo, propagar `traceparent` do BFF para o `social-care` e exportar histogramas MP-001…MP-005 como métricas OTLP.
- Dashboards/alertas mínimos: p95 acima do orçamento por 15 min; taxa de 5xx > 0,5%; surto de um mesmo código de erro (> 50/h) — sinal de regressão de contrato.

## Referências

- Constituição web_02: [`../../../.specify/memory/constitution.md`](../../../.specify/memory/constitution.md)
- ADR-0004 Split client × server (MVVM × DDD): [`../../adr/0004-client-server-split-mvvm-ddd.md`](../../adr/0004-client-server-split-mvvm-ddd.md)
- ADR-0005 Auth — OIDC+PKCE, sessão opaca: [`../../adr/0005-auth-session-refresh-decisions.md`](../../adr/0005-auth-session-refresh-decisions.md)
- ADR-0010 BFF orquestrador / nomenclatura fn: [`../../adr/0010-bff-orchestration-fn-naming.md`](../../adr/0010-bff-orchestration-fn-naming.md)
- Índice de ADRs: [`../../adr/README.md`](../../adr/README.md)
- Métricas frontend (browser): [`./metrics.fe.md`](./metrics.fe.md)
- Domínio core-api: [`./domain.md`](./domain.md)
- Prontidão da API: [`./api-readiness.fe.md`](./api-readiness.fe.md)
- Elysia (BFF): [`../../reference/framework/elysia/`](../../reference/framework/elysia/)
- Bun (runtime): [`../../reference/runtime/bun/`](../../reference/runtime/bun/)
