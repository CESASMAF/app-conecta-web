# Descoberta: Indicadores e BI — Web (visão core-api · `svc-analysis-bi`)

**Feature**: `specs/003-analysis-bi-web/` · **Consultor**: `/acdg-skills:requirements-engineer`

> Fase 0 da pipeline `core-api-sdd`. Elicitação ancorada em Gerenciamento de Requisitos
> (Moraes & Lopes) + Histórias de Usuário. Saída alimenta a SPEC (fase 1 — `spec.md`).
> Esta é a visão **CORE-API**: o serviço `analysis-bi` (Go · chi · pgx · NATS JetStream ·
> star schema) como pipeline analítico da plataforma ACDG — consome 18 eventos do
> `social-care`, anonimiza na ingestão (HMAC-SHA256 salgado, K-anonymity K=5, nunca
> armazena PII) e expõe indicadores AGREGADOS via HTTP. A visão de interface está em
> [discovery.fe.md](./discovery.fe.md).

## Problema / Oportunidade

A ACDG-BV atende pacientes de doenças raras e precisa de números para gerir e para advogar: quantos pacientes por faixa etária e mesorregião, quais diagnósticos CID-10 predominam, qual a vulnerabilidade socioeconômica das famílias, quantos encaminhamentos e violações de direitos ocorrem — sem jamais expor dados pessoais de uma população pequena e, por isso, altamente reidentificável. O prontuário (`social-care`) tem os dados, mas é PII por definição; planilhas manuais são lentas, erram e vazam. O `analysis-bi` já resolve isso no backend — pipeline de ingestão anonimizado, K-anonimato K=5 aplicado na query e supressão de grupos pequenos —, porém seus indicadores e exports ainda não são consumidos por nenhuma interface. Esta feature consolida esse contrato como base estável para a interface web de dashboards (`003-analysis-bi-web`).

## Stakeholders

| Stakeholder | Interesse / o que espera | Decisor? |
|---|---|---|
| Gestor da associação (ACDG-BV) | Dashboards confiáveis dos 5 eixos (demográfico, epidemiológico, socioeconômico, proteção, cuidado) para decisão e advocacy | sim |
| Pesquisador / parceiro acadêmico | Datasets agregados exportáveis em formatos de análise (CSV, Parquet, ODS) e de saúde pública (DBF/TABWIN, DBC/DataSUS, FHIR/RNDS) | não |
| DPO / compliance LGPD | Garantia de que nenhum payload contém PII; supressão K=5 aplicada em consulta E em export; aviso de supressão visível ao usuário | sim |
| Equipe web_02 (consumidora do contrato) | Contrato estável: envelope `{ data, meta }` com `k_threshold`/`suppressed_groups`, query params documentados, limitações conhecidas (sem paginação, séries esparsas) | não |
| `social-care` (emissor canônico) | Eventos consumidos via NATS JetStream sem retorno de acoplamento — o `analysis-bi` é downstream puro | não |
| Equipe de segurança | Findings HIGH-001/002/003 do FINAL-REPORT mitigados ou compensados no BFF antes do go-live | sim |

## Histórias de usuário (INVEST)

- **US-001** (P1): Como gestor, quero consultar indicadores demográficos (pirâmide etária por faixa × sexo × mesorregião) num período, para conhecer o perfil da população atendida.
  - **Valor / prioridade**: P1 — é o retrato básico da associação; todo relatório de gestão/advocacy começa aqui.
  - **Critérios de aceitação** (viram BDD na fase 6): dado dados materializados, quando consulto `GET /api/v1/indicators/demographics?period_start=2025-01&period_end=2026-03`, então recebo `200` com itens `{ labels: { age_band, sex, mesoregion_name }, value, period }` e `meta: { k_threshold: 5, suppressed_groups, total_records }`; grupos com COUNT < 5 não aparecem em `data`.
- **US-002** (P1): Como gestor, quero consultar o ranking de diagnósticos CID-10 (top N, casos novos vs acumulados), para entender o perfil epidemiológico das doenças raras atendidas.
  - **Valor / prioridade**: P1 — junto com o demográfico, forma o núcleo do dashboard; alimenta pleitos junto a SES/SMS.
  - **Critérios de aceitação**: dado dados materializados, quando consulto `GET /api/v1/indicators/epidemiological?period_start=2025-01&period_end=2026-03&top=10`, então recebo os top 10 com `labels: { icd_code, icd_label }`; `top` negativo responde `400`.
- **US-003** (P2): Como gestor, quero consultar indicadores socioeconômicos (faixas de renda em SM, cobertura de BPC/PBF, insegurança alimentar), de proteção (encaminhamentos por destino, violações por tipo) e de cuidado (atendimentos por tipo, completude de avaliações), para monitorar vulnerabilidade e a operação da assistência.
  - **Valor / prioridade**: P2 — completa os 5 eixos; depende do mesmo contrato do P1, só amplia a cobertura.
  - **Critérios de aceitação**: dado dados materializados, quando consulto `GET /api/v1/indicators/{socioeconomic|protection|care}?period_start=…&period_end=…`, então recebo itens com labels do eixo (`income_band`, `violation_type`/`destination`, `appointment_type` — todos com `mesoregion_name`) e o mesmo envelope com supressão K=5.
- **US-004** (P2): Como gestor ou pesquisador, quero filtrar qualquer eixo por mesorregião IBGE e escolher a granularidade temporal (mensal, trimestral, anual), para comparar territórios e períodos.
  - **Valor / prioridade**: P2 — transforma número estático em análise; usa params já implementados (`mesoregion`, `granularity`).
  - **Critérios de aceitação**: dado `granularity=quarterly`, quando consulto qualquer eixo, então `period` vem como `"2025-Q1"`; dado `mesoregion=<código inexistente>`, então recebo `400`.
- **US-005** (P2): Como pesquisador, quero exportar um dataset agregado em 8 formatos (CSV, JSON, XML, Parquet, DBF, DBC, ODS, FHIR), para analisar fora da plataforma e integrar com TABWIN/DataSUS/RNDS.
  - **Valor / prioridade**: P2 — é o canal de advocacy e pesquisa; reusa as mesmas queries com K=5.
  - **Critérios de aceitação**: dado dataset com dados, quando consulto `GET /api/v1/export/csv?dataset=epidemiological&period_start=2025-01&period_end=2026-03`, então recebo o arquivo com `Content-Disposition: attachment; filename="acdg-epidemiological-{period}.csv"` e metadados de export (period, k_threshold, suppressed count, total_records, generated_at); formato desconhecido responde `404`.
- **US-006** (P3): Como consumidor do contrato (BFF Elysia), quero descobrir datasets e formatos disponíveis via metadata (`GET /api/v1/metadata/datasets`, `GET /api/v1/metadata/formats`) e verificar saúde (`/health`, `/ready`), para construir a UI sem hardcode e degradar com elegância.
  - **Valor / prioridade**: P3 — conveniência de integração; a UI pode operar com listas estáticas se necessário.
  - **Critérios de aceitação**: dado o serviço no ar, quando consulto `/api/v1/metadata/formats`, então recebo os 8 formatos com `name`, `content_type`, `extension`; `GET /api/v1/metadata/regions` responde `501`/array vazio (planejado); `/ready` responde `503` com `{ database, nats }` se uma dependência cai.

## Requisitos

### Funcionais
- **RF-001**: O serviço DEVE expor `GET /api/v1/indicators/{axis}` para os 5 eixos (`demographics`, `epidemiological`, `socioeconomic`, `protection`, `care`) com `period_start`/`period_end` (YYYY-MM, obrigatórios), `mesoregion` (opcional), `granularity=monthly|quarterly|yearly` (default monthly) e `top` (epidemiological/socioeconomic).
- **RF-002**: Toda resposta de indicador DEVE usar o envelope `{ data: [{ labels, value, period }], meta: { timestamp, period, k_threshold, suppressed_groups, total_records } }`.
- **RF-003**: O serviço DEVE aplicar K-anonymity K=5 na query (`HAVING COUNT(*) >= 5`) em TODA consulta e em TODO export, reportando as células omitidas em `meta.suppressed_groups`.
- **RF-004**: O serviço DEVE expor `GET /api/v1/export/{format}` nos 8 formatos (`csv|json|xml|parquet|dbf|dbc|ods|fhir`) com `dataset` (default `demographics`), `period_start`/`period_end` obrigatórios e `mesoregion` opcional, respondendo com `Content-Disposition: attachment` e Content-Type por formato.
- **RF-005**: O serviço DEVE expor metadata de descoberta (`/api/v1/metadata/datasets`, `/api/v1/metadata/formats`) e health (`/health` liveness, `/ready` readiness com checks de database e NATS).
- **RF-006**: O serviço DEVE rejeitar parâmetros inválidos com `400` e mensagem descritiva (`invalid period_start: expected YYYY-MM format`, mesorregião inexistente, `top < 0`) — sem códigos estruturados `ANA-XXX` nesta versão.
- **RF-007**: O serviço DEVE manter o pipeline de ingestão NATS (stream `SOCIAL_CARE_EVENTS`, consumer durable `analysis-bi`, at-least-once, idempotência por `event_processing_log`, DLQ sanitizada) alimentando o star schema que serve as consultas — nenhum dado é gravado via HTTP.

### Não-funcionais (viram métricas na fase 4)
- **RNF-001**: Privacidade/LGPD — nenhum payload HTTP (indicador ou export) contém PII ou identificador individual; `patientId` existe apenas como HMAC-SHA256 salgado interno; quasi-identifiers generalizados (17 faixas etárias de 5 anos, ~137 mesorregiões IBGE, 6 faixas de renda em SM, sexo em 3 valores).
- **RNF-002**: Segurança — JWT via JWKS (RS256) quando `JWKS_URL` configurado; `AUTH_REQUIRED=true` sem JWKS impede o boot. Pendências conhecidas: issuer/audience não validados (HIGH-001), skip silencioso sem JWKS (HIGH-002), RBAC placeholder (HIGH-003) — compensar no BFF Elysia até correção.
- **RNF-003**: Disponibilidade — `/health` sempre `200`; `/ready` reflete database e NATS (`503` em indisponibilidade); rate limit token bucket (global — MED-002) responde `429`.
- **RNF-004**: Performance — consulta de eixo com filtros típicos (< 1000 linhas, sem paginação por desenho) responde em p95 < 500 ms na VPS BV; export síncrono completa em < 10 s para o volume BV.
- **RNF-005**: Consistência analítica — materialized views (mv_demographics, mv_epidemiological) atualizadas no job mensal de carry-forward (1º dia do mês); dados refletem eventos processados, não tempo real estrito (at-least-once + batch).

## Restrições e premissas

- Serviço existente (~90% implementado): Go 1.25 · chi v5 · pgx v5 · nats.go · PostgreSQL (database `analysis_bi`) · star schema (10 dimensões, 7 fatos) → **a feature consome o contrato, não altera o domínio**.
- Domínio READ-ONLY na borda HTTP: nenhuma rota de mutação; toda escrita acontece pela ingestão NATS.
- Sem paginação HTTP (decisão de desenho: K-anonymity + filtros mantêm < 1000 linhas por query); sem códigos de erro estruturados `ANA-XXX` (HTTP status + mensagem).
- Séries temporais esparsas: períodos sem dados NÃO aparecem na resposta — preencher gaps é responsabilidade do consumidor (front).
- Granularidades de `period`: `"2025-03"` (monthly), `"2025-Q1"` (quarterly), `"2025"` (yearly); salário mínimo de referência hardcoded (R$ 1.412,00/2024).
- Auth-alvo da instância BV é Authentik (`auth.acdg-bv.org.br`) via JWKS; RBAC fino não existe no serviço (HIGH-003) — autorização por papel deve ser imposta no BFF Elysia.
- Premissas: o `social-care` publica os 18 tipos de evento no stream `SOCIAL_CARE_EVENTS`; `PATIENT_HASH_SALT` é provisionado via cofre de secrets e nunca rotacionado sem replanejamento (hash é a chave de UPSERT dos fatos).

## Fora de escopo

- Qualquer mutação via HTTP (cadastros, correções de dados — pertencem ao `social-care`).
- Drill-down individual ou listagem de pacientes (impossível por desenho — só agregados ≥ K=5).
- Novas rotas, novos eixos, paginação, códigos `ANA-XXX` ou implementação de `metadata/regions` no serviço.
- Correção dos findings HIGH-001/002/003 dentro do serviço (rastreados no FINAL-REPORT; esta feature apenas compensa no BFF).
- Indicadores em tempo real (o pipeline é eventual: batch NATS + job mensal de carry-forward).

## Rastreabilidade (inicial)

| Requisito | História | Critério → BDD | Teste (TDD) |
|---|---|---|---|
| RF-001, RF-002 | US-001, US-002 | Eixo + período retorna envelope com `k_threshold`/`suppressed_groups` | a definir na fase 7 (`tasks.md`) |
| RF-003 | US-001…US-005 | Grupo com COUNT < 5 omitido; `suppressed_groups` incrementado | a definir |
| RF-001 | US-003, US-004 | `granularity=quarterly` → `period: "2025-Q1"`; mesorregião inválida → `400` | a definir |
| RF-004 | US-005 | Export com `Content-Disposition` e metadados; K=5 idêntico ao da consulta | a definir |
| RF-005 | US-006 | `metadata/formats` lista 8; `/ready` → `503` com checks quando DB cai | a definir |
| RF-006 | US-001…US-005 | `period_start` malformado → `400` com mensagem descritiva | a definir |

## Perguntas em aberto

- [ ] [NEEDS CLARIFICATION: a lista de mesorregiões para o filtro da UI deve vir de `GET /api/v1/metadata/regions` (hoje `501`/vazio — exigiria implementar no serviço) ou de um snapshot estático de `configs/ibge_mesoregions.csv` servido pelo BFF Elysia?] → resolver na fase de clarificação (`/speckit-clarify`).
- [ ] [NEEDS CLARIFICATION: HIGH-001/HIGH-003 (issuer/audience e RBAC) serão corrigidos no serviço antes do go-live dos dashboards, ou a compensação no BFF (validação extra + autorização por `groups`) é aceita como mitigação permanente para a instância BV?]
- [ ] [NEEDS CLARIFICATION: quais papéis do Authentik podem exportar datasets (todos que veem dashboards, ou export restrito a gestor/DPO)? O serviço não distingue — a decisão vira regra do BFF Elysia.]

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Iron Frontier, Princípios I, III, VI
- [ADR-0001 (vertical-modular)](../../adr/0001-vertical-modular-architecture.md) — módulo analysis-bi isolado
- [ADR-0004 (Client/Server MVVM×DDD)](../../adr/0004-client-server-split-mvvm-ddd.md) — BFF Elysia como única borda
- [ADR-0005 (auth/session)](../../adr/0005-auth-session-refresh-decisions.md) — OIDC+PKCE, Authentik
- [adr.md](./adr.md) — proibição de drill-down individual
- [adr.fe.md](./adr.fe.md) — séries esparsas, supressão K=5 e erros
- [domain.md](./domain.md) — domínio CORE Go (invariantes K=5)
- [domain.fe.md](./domain.fe.md) — modelo BFF + client
- [api-readiness.fe.md](./api-readiness.fe.md) — prontidão dos endpoints e gaps
- [discovery.fe.md](./discovery.fe.md) — visão frontend
- [ADR index](../../adr/README.md) — todos os ADRs web_02
- [Doc integração](../README.md) — mapa cross-service
