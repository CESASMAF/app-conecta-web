# Feature Specification: Indicadores e BI — Web (contrato core-api · `svc-analysis-bi`)

**Feature Branch**: `003-analysis-bi-web`

**Created**: 2026-06-12

**Status**: Draft

**Input**: User description: "Interface web de dashboards de indicadores agregados e anonimizados da ACDG, consumindo o serviço `analysis-bi` via BFF Elysia. Esta spec define o contrato da API que o front consome; a spec da interface está em `spec.fe.md`."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Indicadores demográficos e epidemiológicos (Priority: P1)

O consumidor (BFF Elysia) consulta o eixo demográfico (pirâmide etária: faixa etária × sexo × mesorregião) e o eixo epidemiológico (top N diagnósticos CID-10, casos novos vs acumulados) num intervalo de períodos, recebendo apenas agregados com K-anonymity K=5 aplicado e o contador de grupos suprimidos no envelope.

**Why this priority**: São os dois eixos do dashboard mínimo de gestão/advocacy; validam o envelope, os query params e a semântica de supressão que todos os demais eixos reusam.

**Independent Test**: Pode ser testado integralmente com `GET /api/v1/indicators/demographics` e `GET /api/v1/indicators/epidemiological` contra base materializada por fixtures de eventos, verificando envelope, labels, supressão e erros de validação.

**Acceptance Scenarios**:

1. **Given** fatos materializados no star schema, **When** o consumidor faz `GET /api/v1/indicators/demographics?period_start=2025-01&period_end=2026-03` com Bearer válido, **Then** recebe `200` com `data: [{ labels: { age_band, sex, mesoregion_name }, value, period }]` e `meta: { timestamp, period: "2025-01/2026-03", k_threshold: 5, suppressed_groups, total_records }`.
2. **Given** um grupo (faixa etária × sexo × mesorregião) com COUNT < 5, **When** qualquer consulta o alcança, **Then** o grupo é omitido de `data` (filtro `HAVING COUNT(*) >= 5` na query) e `meta.suppressed_groups` é incrementado — a resposta permanece `200`.
3. **Given** fatos de diagnóstico, **When** `GET /api/v1/indicators/epidemiological?period_start=2025-01&period_end=2026-03&top=10`, **Then** recebe os 10 maiores com `labels: { icd_code, icd_label }` (CID-10) e valores de casos (novos vs acumulados conforme a métrica do eixo).
4. **Given** `granularity=quarterly`, **When** qualquer eixo é consultado, **Then** os itens trazem `period` no formato `"2025-Q1"`; com `granularity=yearly`, `"2025"`; default (monthly), `"2025-03"`.
5. **Given** `period_start=2025-13` (malformado), **When** submetido, **Then** o serviço responde `400` com `{ data: { error: "Bad Request", status: 400, message: "invalid period_start: expected YYYY-MM format" }, meta: { … } }`.
6. **Given** `top=-1` ou `mesoregion` inexistente no lookup IBGE, **When** submetidos, **Then** o serviço responde `400` com mensagem descritiva.

---

### User Story 2 - Eixos socioeconômico, proteção e cuidado (Priority: P2)

O consumidor consulta os três eixos restantes: socioeconômico (faixas de renda em salários mínimos, benefícios BPC/PBF), proteção (encaminhamentos por destino — UPA, CRAS, CREAS — e violações de direitos por tipo) e cuidado (atendimentos por tipo, completude de avaliações), com os mesmos query params e envelope do P1.

**Why this priority**: Completam os 5 eixos do dashboard; reusam contrato e supressão já validados no P1, ampliando apenas as dimensões (`income_band`, `violation_type`/`destination`, `appointment_type`).

**Independent Test**: Com fixtures dos eventos socioeconômicos/proteção/cuidado materializadas, exercitar `GET /api/v1/indicators/{socioeconomic|protection|care}` com combinações de `mesoregion` e `granularity`, verificando labels por eixo e supressão.

**Acceptance Scenarios**:

1. **Given** fatos socioeconômicos, **When** `GET /api/v1/indicators/socioeconomic?period_start=2025-01&period_end=2026-03`, **Then** recebe itens com `labels: { income_band, mesoregion_name }` nas 6 faixas de SM (0-0.5, 0.5-1, 1-2, 2-3, 3-5, 5+) e indicadores de benefício (beneficiários e total — `fact_benefit`).
2. **Given** fatos de proteção, **When** `GET /api/v1/indicators/protection?period_start=…&period_end=…&mesoregion=<code>`, **Then** recebe encaminhamentos por `destination` (UPA, CRAS, CREAS…) e violações por `violation_type` apenas da mesorregião filtrada.
3. **Given** fatos de cuidado, **When** `GET /api/v1/indicators/care?period_start=…&period_end=…`, **Then** recebe atendimentos por `appointment_type` × `mesoregion_name`; métricas de média (completude de avaliação, tamanho de família) seguem as agregações AVG do serviço.
4. **Given** um intervalo sem nenhum fato, **When** qualquer eixo é consultado, **Then** o serviço responde `200` com `data: []` e `meta.total_records: 0` — período vazio não é erro.
5. **Given** meses intermediários sem dados num intervalo, **When** o eixo é consultado, **Then** esses períodos simplesmente NÃO aparecem em `data` (série esparsa) — o preenchimento de gaps é responsabilidade do consumidor (BFF/client).

---

### User Story 3 - Export de datasets em 8 formatos (Priority: P3)

O consumidor baixa qualquer um dos 5 datasets como arquivo em 8 formatos — CSV, JSON, XML, Parquet, DBF (TABWIN), DBC (DataSUS), ODS (LibreOffice) e FHIR (Bundle R4 BR Core) — com os mesmos filtros e a mesma supressão K=5 das consultas.

**Why this priority**: Canal de pesquisa/advocacy/interoperabilidade (TABWIN, DataSUS, RNDS); reusa as queries dos eixos, agregando apenas a camada de encoding e os headers de download.

**Independent Test**: Para cada formato, `GET /api/v1/export/{format}?dataset=…&period_start=…&period_end=…` verifica Content-Type, `Content-Disposition`, decodificação do arquivo e igualdade do conjunto de linhas com a consulta equivalente do eixo.

**Acceptance Scenarios**:

1. **Given** dataset com dados, **When** `GET /api/v1/export/csv?dataset=epidemiological&period_start=2025-01&period_end=2026-03`, **Then** recebe `200` com `Content-Disposition: attachment; filename="acdg-epidemiological-{period}.csv"`, Content-Type do formato e linhas idênticas (mesmo filtro K=5) à consulta do eixo.
2. **Given** `dataset` omitido, **When** `GET /api/v1/export/json?period_start=…&period_end=…`, **Then** o export usa `demographics` (default); `dataset` desconhecido responde `400` ("unknown dataset: …").
3. **Given** formato `fhir`, **When** exportado, **Then** o arquivo é um Bundle FHIR R4 com perfis BR Core (recursos agregados — nenhum `Patient` identificável); formato `dbc` produz arquivo comprimido compatível com DataSUS; `ods` abre no LibreOffice.
4. **Given** qualquer export, **Then** os metadados do export (ExportMetadata) incluem period, `k_threshold`, contagem de suprimidos, `total_records` e `generated_at`.
5. **Given** formato desconhecido (ex.: `/api/v1/export/xlsx`), **When** requisitado, **Then** responde `404` (rota de formato inexistente).
6. **Given** `period_start`/`period_end` ausentes, **When** o export é requisitado, **Then** responde `400` — os dois parâmetros são obrigatórios também no export.

---

### User Story 4 - Metadata e health (Priority: P3)

O consumidor descobre datasets e formatos disponíveis via metadata e monitora a saúde do serviço via liveness/readiness, para construir UI sem hardcode e degradar com elegância.

**Why this priority**: Suporte de integração e operação; a UI pode operar com listas estáticas, mas o contrato existe e deve ser estável.

**Independent Test**: `GET /api/v1/metadata/datasets` → 5 itens; `GET /api/v1/metadata/formats` → 8 itens; `/health` sempre `200`; `/ready` alterna `200`/`503` ao derrubar Postgres/NATS no ambiente de teste.

**Acceptance Scenarios**:

1. **Given** o serviço no ar, **When** `GET /api/v1/metadata/datasets`, **Then** recebe os 5 datasets (`demographics`, `epidemiological`, `socioeconomic`, `protection`, `care`) com descrição.
2. **Given** o serviço no ar, **When** `GET /api/v1/metadata/formats`, **Then** recebe os 8 formatos com `name`, `content_type` e `extension`.
3. **Given** a v1 atual, **When** `GET /api/v1/metadata/regions`, **Then** a resposta é vazia/`501` (PLANEJADO — a lista de mesorregiões não é servida pelo serviço nesta versão).
4. **Given** Postgres ou NATS indisponível, **When** `GET /ready`, **Then** responde `503` com `{ data: { status, database: bool, nats: bool } }`; `GET /health` permanece `200` (liveness).

---

### Edge Cases

- Séries esparsas: períodos sem dados não aparecem em `data` — nenhum item com `value: 0` é fabricado pelo serviço; o consumidor (BFF/client) preenche gaps.
- `200` com `data: []`: intervalo válido sem dados (ou 100% suprimido) é resposta de sucesso; quando tudo foi suprimido, `data: []` convive com `suppressed_groups > 0`.
- Sem paginação HTTP: intervalos longos × granularidade mensal retornam o payload completo (desenho assume < 1000 linhas pós-K-anonymity); não há `limit`/`cursor` nos eixos.
- `period_start > period_end`: intervalo invertido responde `400` com mensagem descritiva [NEEDS CLARIFICATION: o handler valida a ordem do intervalo ou retorna `200` com `data: []`? Confirmar em [api-readiness.fe.md](./api-readiness.fe.md) antes do front assumir].
- Rate limit: token bucket GLOBAL (não per-IP — MED-002) responde `429`; um consumidor agressivo pode esgotar o bucket para todos — o BFF Elysia deve moderar (cache/debounce).
- Eixo desconhecido (`GET /api/v1/indicators/foo`) → `404`; método não suportado nas rotas (todas são GET) → `404`/`405` do router.
- Auth condicional: `AUTH_REQUIRED=true` (default) + `JWKS_URL` vazio → o servidor não inicia; `AUTH_REQUIRED=false` + JWKS vazio → API pública (somente dev). Token inválido/expirado → `401`.
- `403` por role está PLANEJADO mas não enforced (HIGH-003 — role guard placeholder): qualquer usuário autenticado acessa tudo; autorização fina é do BFF Elysia até correção.
- Erros não trazem códigos estruturados `ANA-XXX` — apenas HTTP status + `message` descritiva no envelope de erro; o consumidor mapeia por status.
- Carry-forward mensal: no 1º dia do mês o job copia snapshots de pacientes ativos para o novo período e atualiza as materialized views — consultas no novo mês antes do job podem retornar menos dados que o esperado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O serviço MUST expor `GET /api/v1/indicators/{axis}` para `demographics`, `epidemiological`, `socioeconomic`, `protection` e `care`, com `period_start` e `period_end` (YYYY-MM) obrigatórios, `mesoregion` opcional (código IBGE), `granularity` opcional (`monthly` default | `quarterly` | `yearly`) e `top` opcional (eixos `epidemiological`/`socioeconomic`).
- **FR-002**: Cada item de resposta MUST ter a forma `{ labels: { …dimensões do eixo… }, value: <int>, period: <string> }`, com labels por eixo: demographics → `age_band`/`sex`/`mesoregion_name`; epidemiological → `icd_code`/`icd_label`; socioeconomic → `income_band`/`mesoregion_name`; protection → `violation_type` ou `destination`/`mesoregion_name`; care → `appointment_type`/`mesoregion_name`.
- **FR-003**: Toda resposta MUST usar o envelope `{ data, meta: { timestamp, period, k_threshold, suppressed_groups, total_records } }`; erros MUST usar `{ data: { error, status, message }, meta }` com HTTP status (sem códigos `ANA-XXX` nesta versão).
- **FR-004**: O serviço MUST aplicar K-anonymity com `k_threshold = 5` na própria query (`HAVING COUNT(*) >= 5`) em TODA consulta de indicador e em TODO export, reportando as células omitidas em `meta.suppressed_groups` (LGPD Art. 12 — dado anonimizado).
- **FR-005**: O serviço MUST NOT expor PII em nenhuma resposta: identificadores individuais nunca saem (patientId existe apenas como HMAC-SHA256 salgado interno; actorId/memberId/caregiverId/victimId/professionalId e endereço exato são descartados na ingestão); quasi-identifiers só saem generalizados (17 faixas etárias de 5 anos, mesorregião IBGE, 6 faixas de renda em SM, sexo MALE|FEMALE|UNKNOWN).
- **FR-006**: O serviço MUST expor `GET /api/v1/export/{format}` para `csv|json|xml|parquet|dbf|dbc|ods|fhir`, com `dataset` (default `demographics`), `period_start`/`period_end` obrigatórios e `mesoregion` opcional, respondendo com `Content-Disposition: attachment; filename="acdg-{dataset}-{period}.{ext}"` e Content-Type por formato; o ExportMetadata MUST incluir period, `k_threshold`, contagem de suprimidos, `total_records` e `generated_at`.
- **FR-007**: O serviço MUST expor `GET /api/v1/metadata/datasets` (5 datasets com descrição) e `GET /api/v1/metadata/formats` (8 formatos com `name`/`content_type`/`extension`); `GET /api/v1/metadata/regions` permanece planejado (vazio/`501`) nesta versão.
- **FR-008**: O serviço MUST expor `GET /health` (liveness, sempre `200`) e `GET /ready` (readiness com checks `database`/`nats`, `503` em indisponibilidade).
- **FR-009**: O serviço MUST validar parâmetros na borda e responder `400` com mensagem descritiva para: período fora de `YYYY-MM`, mesorregião inexistente, `top < 0` e `dataset` desconhecido no export.
- **FR-010**: O serviço MUST manter a cadeia de middleware Recovery → Security Headers (HSTS etc.) → Rate Limit (token bucket, `429`) → JWT Auth (JWKS RS256, `401`) → Role Guard (placeholder) em todas as rotas `/api/v1`.
- **FR-011**: O serviço MUST permanecer READ-ONLY na borda HTTP: nenhuma rota de mutação; toda escrita ocorre exclusivamente via pipeline NATS (stream `SOCIAL_CARE_EVENTS`, consumer durable `analysis-bi`, at-least-once com idempotência por `event_processing_log` e DLQ sanitizada sem PII).
- **FR-012**: O serviço MUST NOT paginar respostas de indicadores/exports nesta versão (desenho: K-anonymity + filtros mantêm < 1000 linhas) e MUST omitir períodos sem dados (séries esparsas) — ambos contratos explícitos para o consumidor.

### Key Entities

- **IndicatorItem**: célula agregada — `labels` (dimensões generalizadas do eixo), `value` (inteiro agregado: COUNT/SUM; AVG para completude/tamanho de família), `period` (`"2025-03"` | `"2025-Q1"` | `"2025"`).
- **Meta (envelope)**: `timestamp`, `period` (`"2025-01/2026-03"`), `k_threshold` (5), `suppressed_groups` (células omitidas por K-anonymity), `total_records`.
- **Eixo/Dataset**: um dos 5 domínios analíticos (`demographics`, `epidemiological`, `socioeconomic`, `protection`, `care`) servidos pelas mesmas queries em consulta e export.
- **ExportMetadata**: descritor do arquivo exportado — dataset, period, `k_threshold`, suprimidos, `total_records`, `generated_at`.
- **Dimensões (star schema)**: dim_period, dim_age_band (17), dim_sex (3), dim_geography (mesorregião/microrregião/UF/região IBGE), dim_diagnosis (CID-10: código, rótulo, capítulo, bloco), dim_housing_type, dim_education_level, dim_benefit_type (BPC, PBF…), dim_referral_destination (UPA, CRAS, CREAS…), dim_violation_type.
- **Fatos**: fact_patient_snapshot, fact_diagnosis, fact_appointment, fact_referral, fact_violation, fact_benefit, fact_family_composition — alimentados pelos 18 eventos do `social-care`, nunca expostos cru via HTTP.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das jornadas do front (5 dashboards + central de exports + filtros) são atendidas pelo contrato existente sem nova rota — confirmado no [api-readiness.fe.md](./api-readiness.fe.md) (exceção registrada: lista de mesorregiões, pendente de decisão).
- **SC-002**: Zero PII em qualquer resposta HTTP (indicadores, exports, erros, DLQ): verificado por inspeção automatizada de payloads em suíte de contrato.
- **SC-003**: 100% das respostas de consulta e export com células omitidas reportam `suppressed_groups > 0` corretamente (nenhuma supressão silenciosa sem contagem no `meta`).
- **SC-004**: Export e consulta do mesmo dataset/filtros produzem conjuntos idênticos de linhas (mesma query, mesma supressão) em 100% dos casos testados.
- **SC-005**: `400` de validação sempre carrega `message` descritiva que permite ao front apontar o filtro inválido (zero erros genéricos sem causa).
- **SC-006**: `/ready` reflete indisponibilidade de Postgres/NATS em < 5 s, permitindo ao Compose/Caddy degradar antes de erros de usuário.

## Impacto Arquitetural (core-api) *(obrigatório se a feature toca `src/`)*

- **Bounded Contexts afetados**: [x] API (`internal/api`) · [x] Store (`internal/store`) · [x] Domain (`internal/domain`) · [x] Export (`internal/export`) — somente **consumo do contrato existente**; nenhum pacote é modificado. O pipeline de ingestão (`internal/ingestion`) não é tocado nem consumido diretamente.
  - ⚠️ A feature atravessa os pacotes porque é a interface de todo o domínio analítico — justificado: não há acoplamento novo, apenas consumo HTTP do contrato público `/api/v1`.
- **Novos agregados / Value Objects?**: Nenhum. O domínio (PatientHash, Sex, AgeBand, IncomeBand, Period, Geography) permanece intacto.
- **Novos eventos de domínio (outbox)?**: Nenhum. O serviço é consumidor downstream (18 eventos do `social-care`); não emite eventos próprios e esta feature não muda isso.
- **Novos subcomandos de CLI?**: N/A — o serviço é HTTP + consumer NATS; não há CLI de produto.
- **Borda HTTP envolvida?**: Sim — exclusivamente as rotas já existentes (`internal/api/router.go`, `handlers/{indicators,export,metadata,health}.go`). Nenhuma rota nova nesta feature; a eventual implementação de `metadata/regions` seria mudança no serviço, rastreada à parte.
- **Possíveis violações da constituição (I–VI)?**: Nenhuma identificada. Riscos a vigiar no plano ([plan.md](./plan.md)): pressão do front por (a) paginação ou endpoint composto multi-eixo — negar, composição é papel do BFF Elysia; (b) endpoint de drill-down individual — negar sempre (violaria o desenho de anonimização); (c) afrouxar K=5 para "ver mais dados" — negar (LGPD); (d) correções HIGH-001/002/003 misturadas a esta feature — manter como workstream separado do serviço.

## Assumptions

- O `svc-analysis-bi` está implantado e saudável na VPS BV (`/health`, `/ready`) antes do desenvolvimento do front; ambiente local segue a orquestração de dev do root.
- O `social-care` publica os 18 tipos de evento no stream `SOCIAL_CARE_EVENTS`; o star schema está materializado com dados reais ou fixtures representativas antes da homologação dos dashboards.
- `PATIENT_HASH_SALT` é provisionado via cofre de secrets, é estável (rotação quebraria o UPSERT por hash) e nunca aparece em logs.
- O IdP da instância BV é Authentik via JWKS (`JWKS_URL` configurado, `AUTH_REQUIRED=true`); enquanto HIGH-001/HIGH-003 não forem corrigidos, o BFF Elysia compensa com validação de issuer/audience e autorização por `groups`.
- O volume BV mantém as respostas < 1000 linhas por consulta (premissa do desenho sem paginação); se o volume crescer, paginação vira mudança de contrato versionada.
- Rate limit global (MED-002) é aceitável porque o único consumidor previsto é o BFF Elysia, que modera as chamadas (cache por filtros + debounce).
- Datas/períodos trafegam como strings (`YYYY-MM`, `YYYY-Qn`, `YYYY`); valores monetários agregados (total_amount de benefícios) em centavos, conversão para R$ é responsabilidade da UI Solid.

## Referências

- [spec.fe.md](./spec.fe.md) — especificação frontend desta feature
- [plan.md](./plan.md) — plano de consumo do contrato (visão core-api)
- [plan.fe.md](./plan.fe.md) — plano de implementação frontend
- [api-readiness.fe.md](./api-readiness.fe.md) — prontidão endpoint a endpoint
- [domain.fe.md](./domain.fe.md) — modelo de domínio client
- [../README.md](../README.md) — doc de integração cross-serviço
- [../../adr/README.md](../../adr/README.md) — índice de ADRs web_02
- [../../adr/0004-client-server-split-mvvm-ddd.md](../../adr/0004-client-server-split-mvvm-ddd.md) — split client × server (BFF Elysia)
- [../../adr/0010-bff-orchestration-fn-naming.md](../../adr/0010-bff-orchestration-fn-naming.md) — nomenclatura `*.query.fn.ts`
- [../../../.specify/memory/constitution.md](../../../.specify/memory/constitution.md) — constituição web_02
- [../../reference/framework/elysia/](../../reference/framework/elysia/) — docs offline Elysia
- [../../reference/runtime/bun/](../../reference/runtime/bun/) — docs offline Bun
