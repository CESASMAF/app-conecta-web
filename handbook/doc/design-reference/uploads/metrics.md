# Métricas & NFRs: Dashboards Web Analysis-BI — visão do contrato (serviço consumido)

**Feature**: `specs/003-analysis-bi-web/` · **Consultores**: `/acdg-skills:software-architect` + `/acdg-skills:requirements-engineer`

> Fase 4 da pipeline `core-api-sdd` (máximo rigor). NFRs ancorados com **citação canônica**
> (Newman/arquitetura) via `skills_citar`. Toda métrica deve ser **mensurável**.
> Este documento mede o **contrato do `analysis-bi` observável pelo consumo via BFF** (latência
> por eixo e por formato de export, taxas de 400/429, taxa de supressão, lag de ingestão
> NATS→fato, disponibilidade do `/ready`); a experiência do browser está em [metrics.fe.md](./metrics.fe.md).

## Métricas funcionais

> "O sistema faz a coisa certa" — verificáveis por teste/BDD.

| ID | Métrica | Alvo | Como medir |
|---|---|---|---|
| MF-001 | Toda resposta de indicadores parseia no schema TypeBox do envelope `{ data: [{ labels, value, period }], meta: { timestamp, period, k_threshold, suppressed_groups, total_records } }` e todo erro no envelope `{ data: { error, status, message }, meta }` | 100% das respostas em staging; 0 erros de parse em produção | contador de falhas de parse no BFF Elysia + testes de integração (T-003, T-013, T-015) em `bun:test` |
| MF-002 | `meta.k_threshold` sempre igual a 5 e nenhum item de `data` com `value < 5` (K-anonymity aplicado na query via `HAVING COUNT(*) >= 5`) — qualquer violação é incidente de privacidade no serviço, detectado pelo consumidor | 100%; 0 ocorrência de `value < 5` | asserção no parse do BFF (contador `k-violation`, alerta imediato) + smoke em staging |
| MF-003 | Erros do contrato chegam **sem código estruturado** e são mapeados por status (400/401/404/429/500/501/503) a `AppError` nomeado; nenhum status fora da tabela do contrato | taxa de `unknown-error` < 0,1% dos erros | contador por status no mapper `AppError` do BFF |
| MF-004 | Export íntegro nos 8 formatos: `Content-Disposition: attachment; filename="acdg-{dataset}-{period}.{ext}"` presente, `Content-Type` coerente com `GET /api/v1/metadata/formats`, corpo não-vazio, mesmo filtro K=5 dos indicadores | 100% nos smoke tests por formato | teste de integração parametrizado (T-014) em `bun:test` + smoke em staging nos 8 formatos |
| MF-005 | Granularidades consistentes: `monthly` → `"2025-03"`, `quarterly` → `"2025-Q1"`, `yearly` → `"2025"`; nenhum period fora do range pedido | 100% (CT-004) | asserção de formato no parse + testes de integração |

## Métricas não-funcionais (NFRs)

> "O sistema faz certo" — performance, segurança, auditoria, manutenibilidade.

| ID | Categoria | Alvo mensurável | Como medir |
|---|---|---|---|
| NFR-001 | Performance | p95 por eixo de indicador e por formato de export dentro do orçamento da tabela MP (abaixo) | histograma de latência por rota normalizada (`/indicators/:axis`, `/export/:format`) no BFF Elysia (logs estruturados) |
| NFR-002 | Disponibilidade do contrato | `GET /ready` 200 em ≥ 99,5% das sondas (janela semanal); taxa de 5xx vista pelo BFF < 0,5% das requisições | sonda sintética 30 s no `/ready` (checks `database`, `nats`) + contador por classe de status no BFF |
| NFR-003 | Taxas de erro de borda | taxa de **400** < 0,5% das consultas (validação TypeBox do BFF deve interceptar antes — 400 alto = regressão na borda); taxa de **429** < 2%/h (rate limit é GLOBAL no serviço — MED-002 — então picos de um usuário afetam todos); 100% dos 429 recuperados por retry/backoff sem intervenção | contadores 400/429 por rota no BFF + razão `retry-recovered / 429-total` |
| NFR-004 | Privacidade observável | taxa média de `suppressed_groups > 0` por consulta monitorada por eixo (baseline a estabelecer no 1º mês); alerta se a média de grupos suprimidos por consulta subir > 50% semana a semana (sinal de fragmentação excessiva dos filtros ou queda de população) | média e p95 de `meta.suppressed_groups` por eixo, agregados no BFF |
| NFR-005 | Atualidade do dado (lag de ingestão) | lag NATS→fato disponível (evento `social-care.events.*` publicado → linha consultável nas tabelas de fato) p95 < 60 s em operação normal; backlog do consumer durable `analysis-bi` (pull-based, batch 10/timeout 2 s) sem crescimento sustentado; 0 evento perdido (at-least-once + idempotência por `event_processing_log`) | métricas do JetStream (pending do consumer `analysis-bi`) + E2E sintético: mutação no `social-care` → poll do indicador até refletir |
| NFR-006 | Segurança | 100% das chamadas outbound com `Authorization: Bearer` injetado no servidor; 0 chamadas anônimas (HIGH-002 do serviço torna isso crítico: sem JWKS_URL o serviço pode estar aberto); 100% das requisições passando pelo RBAC do BFF Elysia (HIGH-003 — serviço não enforça roles); 0 valor de filtro em logs | log estruturado do BFF (sem token, sem valores de filtro) + contador 401 por rota + testes T-012/T-013 em `bun:test` |

**Citação que sustenta os NFRs** (obrigatória):
> "A microservice architecture gives you more options as to how you solve problems, but it also
> means more moving parts — more places where things can go wrong. Monitoring small things and
> aggregating to see the bigger picture becomes essential: without good observability of each
> service boundary, you cannot reason about the behavior of the system as a whole."
> — *(localização exata no corpus a registrar via `skills_citar`; Sam Newman, *Building Microservices* — monitoramento por fronteira de serviço)*

## Métricas de performance

| ID | Indicador | Baseline | Alvo | Orçamento |
|---|---|---|---|---|
| MP-001 | latência p95 `GET /api/v1/indicators/demographics` (pirâmide etária; mv_demographics) | N/A (pré-deploy BV) | < 300 ms | 500 ms |
| MP-002 | latência p95 `GET /api/v1/indicators/epidemiological` (top N CID-10; mv_epidemiological) | N/A | < 300 ms | 500 ms |
| MP-003 | latência p95 `GET /api/v1/indicators/socioeconomic` · `protection` · `care` (queries com `HAVING COUNT(*) >= 5`, sem MV) | N/A | < 400 ms | 700 ms |
| MP-004 | latência p95 dos exports **leves** — `csv`, `json`, `xml` (streaming texto) | N/A | < 1.000 ms | 2.000 ms |
| MP-005 | latência p95 dos exports **pesados** — `parquet`, `dbf`, `dbc`, `ods`, `fhir` (encoding binário/Bundle R4) | N/A | < 2.500 ms | 5.000 ms |
| MP-006 | latência p95 `GET /ready` (sonda de disponibilidade) e `GET /api/v1/metadata/{datasets,formats}` | N/A | < 100 ms | 250 ms |
| MP-007 | tamanho do payload de indicadores por consulta (sem paginação no contrato; K=5 + filtros tipicamente < 1000 rows) | N/A | < 500 kB | 1 MB (acima disso, revisar filtros default da UI) |
| MP-008 | throughput sustentado na VPS BV (single-VPS, ADR-009) | N/A | 20 req/s no mix dos 5 eixos sem degradar p95 e **sem disparar o rate limit global** | limites de recursos do compose (ADR-009) |

> Medições na borda do BFF Elysia (servidor SolidStart/Nitro, rede interna Docker da VPS) —
> não incluem latência do browser (essa fica em [metrics.fe.md](./metrics.fe.md)). Não há
> paginação no contrato: MP-007 vigia o payload completo. O rate limit do serviço é global
> (MED-002), então MP-008 e o NFR-003 (429) devem ser lidos juntos.

## Critérios de sucesso (mensuráveis, tech-agnostic)

- **SC-001**: gestora abre qualquer um dos 5 dashboards com filtros default e vê os indicadores em < 3 s de ponta a ponta (contrato + render; parcela do contrato dentro de MP-001…MP-003).
- **SC-002**: 100% das consultas com `suppressed_groups > 0` exibiram o banner de supressão (auditável cruzando o contador de supressão do BFF com o evento de exibição do banner em [metrics.fe.md](./metrics.fe.md)).
- **SC-003**: mutação registrada no `social-care` aparece nos indicadores em < 5 min de ponta a ponta em operação normal (NFR-005 + cache da UI).
- **SC-004**: export em qualquer um dos 8 formatos conclui em < 10 s percebidos para um período de 12 meses; 0 arquivo corrompido (DBF/DBC abrem no TABWIN; FHIR Bundle valida contra R4 BR Core).
- **SC-005**: 0 incidente de `value < 5` em payload consumido (MF-002) e 0 valor de filtro em telemetria/logs durante o ciclo da feature.

## Observabilidade

- **Logs estruturados do BFF** (JSON, stdout → coleta do compose `observability` profile): por requisição outbound — rota normalizada (`/indicators/:axis`, `/export/:format`), eixo/formato como dimensão, método, status, duração ms, `suppressed_groups` e `total_records` da resposta, `AppError` quando presente, `requestId`. **Nunca** token, valores de filtro (`mesoregion`, períodos exatos podem ser logados como largura do range, não valores) ou corpo de resposta.
- **Contadores**: requisições por eixo/formato/status; erros por `AppError` (dimensão `status`); 400 (regressão de borda) e 429 (com razão de recuperação por retry); erros de parse TypeBox; `k-violation` (MF-002 — alerta imediato, severidade de incidente de privacidade).
- **Privacidade**: histograma de `meta.suppressed_groups` por eixo (NFR-004) + média móvel semanal; razão consultas-com-supressão / total.
- **Disponibilidade**: sonda sintética em `GET /ready` a cada 30 s registrando status e os checks (`database`, `nats`); alerta em 503 sustentado > 2 min.
- **Lag de ingestão**: pending count do consumer durable `analysis-bi` no JetStream (stream `SOCIAL_CARE_EVENTS`) + E2E sintético diário medindo evento→fato (NFR-005); acompanhar também o job mensal de carry-forward (1º dia do mês — atraso ali distorce séries do mês corrente).
- **OpenTelemetry**: quando o profile `observability` da orquestração BV estiver ativo, propagar `traceparent` do BFF para o `analysis-bi` e exportar os histogramas MP-001…MP-006 como métricas OTLP.
- Dashboards/alertas mínimos: p95 acima do orçamento por 15 min; `/ready` 503; taxa de 429 > 2%/h (rate limit global saturado); `k-violation` > 0 (incidente); salto na média de `suppressed_groups` (NFR-004); pending do consumer NATS crescendo por > 30 min.

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Iron Frontier, Princípios I, III, V, VI
- [ADR-0001 (vertical-modular)](../../adr/0001-vertical-modular-architecture.md) — boundaries de módulo
- [ADR-0004 (Client/Server MVVM×DDD)](../../adr/0004-client-server-split-mvvm-ddd.md) — BFF Elysia como única borda
- [ADR-0005 (auth/session)](../../adr/0005-auth-session-refresh-decisions.md) — Bearer injetado no servidor
- [adr.md](./adr.md) — proibição de drill-down individual
- [adr.fe.md](./adr.fe.md) — mapeamento de erros e supressão K=5
- [domain.md](./domain.md) — invariantes canônicas Go
- [domain.fe.md](./domain.fe.md) — Model TypeBox/Eden, eventos
- [metrics.fe.md](./metrics.fe.md) — métricas do browser
- [api-readiness.fe.md](./api-readiness.fe.md) — prontidão dos endpoints e findings
- [ADR index](../../adr/README.md) — todos os ADRs web_02
- [Doc integração](../README.md) — mapa cross-service
