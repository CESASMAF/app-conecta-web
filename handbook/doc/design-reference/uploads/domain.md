# Modelo de Domínio: Analysis BI Web

**Feature**: `specs/003-analysis-bi-web/` · **Consultor**: `/acdg-skills:ddd-architect`

> Fase 2 da pipeline (máximo rigor). Cada decisão de fronteira/agregado
> exige **citação canônica ≥4 linhas** (Evans/Vernon) via `skills_citar`.
> Este documento descreve o domínio **CORE** do backend `analysis-bi` (Go 1.25 · chi · pgx ·
> NATS JetStream · star schema PostgreSQL), pipeline analítico que **nunca armazena PII**
> (anonimização na ingestão + K-anonymity K=5 na query) e fonte de verdade dos indicadores
> que a feature `003-analysis-bi-web` consome via BFF. O modelo do frontend (BFF + client)
> está em [domain.fe.md](./domain.fe.md); requisitos em `spec.md`/`spec.fe.md`.

## Bounded Contexts afetados

- [x] Anonymization (`internal/domain` — supressão, generalização, K-anonymity) · [x] Ingestion (`internal/ingestion` — consumer NATS → anonymize → materialize) · [x] Analytical Store (`internal/store` — star schema, carry-forward) · [x] Indicators API (`internal/api` — 5 eixos) · [x] Export (`internal/export` — 8 formatos)

**Justificativa das fronteiras** (citação obrigatória):
> A BOUNDED CONTEXT delimits the applicability of a particular model so that team members
> have a clear and shared understanding of what has to be consistent and how it relates to
> other contexts. Within that CONTEXT, work to keep the model logically unified, but do not
> worry about applicability outside those bounds. In other contexts, other models apply,
> with differences in terminology, in concepts and rules, and in dialects of the
> UBIQUITOUS LANGUAGE.
> — *(Linha 5212, p. 336, ERIC EVANS, *Domain-Driven Design: Tackling Complexity in the Heart of Software*)*

Cada contexto do `analysis-bi` responde a uma pergunta distinta do pipeline analítico:
**Anonymization** — "como remover identidade preservando valor estatístico?" (lógica pura,
sem I/O; única interface do pacote é `GeographyLookup`); **Ingestion** — "como consumir os
eventos do `social-care` at-least-once de forma idempotente?" (goroutines + channels,
dispatch por `EventType`); **Analytical Store** — "como materializar agregados consultáveis
no grão mensal?" (star schema, UPSERT, materialized views); **Indicators API** — "quais
indicadores os 5 eixos expõem, já filtrados por K=5?"; **Export** — "como entregar os
mesmos agregados nos 8 formatos (CSV…FHIR/RNDS) sem relaxar a supressão?". O modelo
clínico do `social-care` (nomes, CPF, endereços) **não existe** em nenhum desses contextos
— é descartado na fronteira de ingestão, deliberadamente.

## Linguagem ubíqua

| Termo (PT) | Significado | Tipo no código (EN) |
|---|---|---|
| Hash do paciente | Digest HMAC-SHA256 salgado, one-way, irreversível do `patientId` | `PatientHash` (VO) |
| Faixa etária | Banda de 5 anos generalizando data de nascimento — 17 faixas ("0-4" … "75-79", "80+") | `AgeBand` (VO) |
| Sexo | Quasi-identifier de 3 valores | `Sex` (`MALE \| FEMALE \| UNKNOWN`) |
| Faixa de renda | Renda familiar (centavos) em 6 faixas de salário mínimo (0-0.5, 0.5-1, 1-2, 2-3, 3-5, 5+ SM; SM = R$ 1.412,00/2024) | `IncomeBand` (VO) |
| Mesorregião | Generalização geográfica do CEP via hierarquia IBGE (~137 no BR) | `MesoregionCode`, `Geography` (VO) |
| Quasi-identifier | Tripla generalizada que define a classe de equivalência | `QuasiIdentifier` (AgeBand × Sex × Mesoregion) |
| Período | Mês de uma série temporal (`YYYY-MM`) | `Period` (VO, smart constructor `NewPeriod`) |
| Granularidade | Agregação temporal da série | `TimeGranularity` (`monthly \| quarterly \| yearly`) |
| Eixo de indicador | Tema do indicador (1 de 5) | `IndicatorAxis` (`demographics \| epidemiological \| socioeconomic \| protection \| care`) |
| Célula / grupo | Uma combinação de labels com contagem | `IndicatorGroup` (`Labels`, `Value`, `BelowThreshold`) |
| K-anonimato | Tamanho mínimo de classe de equivalência (K=5) | `KThreshold = 5`, `CheckKAnonymity` |
| Supressão por privacidade | Omissão de grupos com `COUNT < 5` + contagem informada | `CountSuppressed` → `meta.suppressed_groups` |
| Resultado de indicador | Envelope genérico de uma consulta | `IndicatorResult` (`Axis`, `Period`, `Groups`, `Suppressed`) |
| Dataset | Escopo de export (5 + full) | `DatasetScope` |
| Formato de export | 1 dos 8 formatos (DBF/DBC = TABWIN/DataSUS; FHIR R4 BR Core/RNDS) | `ExportFormat` (`csv \| json \| xml \| parquet \| dbf \| dbc \| ods \| fhir`) |
| Carry-forward | Job mensal (dia 1º) que copia snapshots de pacientes ativos para o novo período | `carryforward.go` + refresh `CONCURRENTLY` das MVs |

## Agregados e Value Objects

### Pipeline de anonimização (Anonymization)
- **Fluxo invariável**: **Supressão → Generalização → K-Anonymity** · **Invariantes**:
  - **Supressão na ingestão**: `actorId`, `memberId`, `caregiverId`, `victimId`, `professionalId` e endereço exato são descartados; CPF/NIS/CNS/nome nunca chegam nos eventos. A DLQ recebe payload **sanitizado** (`sanitizeForDLQ()` — sem PII).
  - `HashPatientID(patientID, salt)` exige salt não-vazio (`ErrEmptySalt`; env `PATIENT_HASH_SALT` obrigatório); HMAC evita concatenação ambígua — o hash é a única identidade persistida (`patient_hash VARCHAR(64)`).
  - `GeneralizeAge(birthDate, referenceDate)` rejeita nascimento futuro (`ErrInvalidBirthDate`) e mapeia para uma das **17 faixas** de 5 anos (teto convencional 199 na "80+").
  - `GeneralizeIncome(totalIncomeCents)` clampa negativos na faixa mais baixa e classifica nas **6 faixas de SM**.
  - CEP validado (8 dígitos — `ErrCEPWrongLength`/`ErrCEPNonDigit`) e resolvido a mesorregião via `GeographyLookup` (única interface do pacote `domain`; implementação `configs/ibge_mesoregions.csv`).
- **Value Objects**: `PatientHash`, `AgeBand`, `Sex`, `IncomeBand`, `MesoregionCode`, `Geography`, `QuasiIdentifier`, `Period` — imutáveis, comparados por valor, funções puras sem panics (errors-as-values).
- **Justificativa do boundary do agregado** (citação obrigatória):
  > When you care only about the attributes of an element of the model, classify it as a
  > VALUE OBJECT. Make it express the meaning of the attributes it conveys and give it
  > related functionality. Treat the VALUE OBJECT as immutable. Don't give it any identity
  > and avoid the design complexities necessary to maintain ENTITIES.
  > — *(Linha 1654, p. 99, ERIC EVANS, *Domain-Driven Design*)*

  O domínio analítico é deliberadamente **sem entidades**: após a supressão, nenhum objeto
  carrega identidade de pessoa — só valores generalizados (`AgeBand`, `IncomeBand`,
  `Geography`) e o digest opaco `PatientHash`, usado apenas para dedup de UPSERT.

### IndicatorResult (Indicators)
- **Raiz**: `IndicatorResult` (`Axis`, `Period`, `Groups []IndicatorGroup`, `Suppressed`) · **Invariantes**:
  - `KThreshold = 5` (ADR-001 §2.5 do `analysis-bi`): toda query de indicador aplica `HAVING COUNT(*) >= 5` — grupos abaixo do limiar **não saem do banco**; `CheckKAnonymity` marca `BelowThreshold` sem mutar o slice de entrada; `CountSuppressed` alimenta `meta.suppressed_groups` no envelope HTTP.
  - O **mesmo filtro K=5 vale para o export** — nenhum formato (nem FHIR, nem DBC) relaxa a supressão; `ExportMetadata` carrega `period`, `k_threshold`, `suppressed`, `total_records`, `generated_at`.
  - Item de resposta: `{ labels: { …dimensões… }, value, period }`; labels por eixo: demographics → `age_band`, `sex`, `mesoregion_name`; epidemiological → `icd_code`, `icd_label` (top N); socioeconomic → `income_band`, `mesoregion_name`; protection → `violation_type`/`destination`, `mesoregion_name`; care → `appointment_type`, `mesoregion_name`.
  - Agregações suportadas: COUNT, SUM (`total_amount`, `new_cases`), AVG (`assessment_completeness`, `family_size`), TOP N; granularidades `monthly` ("2025-03"), `quarterly` ("2025-Q1"), `yearly` ("2025"). Séries esparsas: períodos sem dados **não aparecem** (gap filling é do consumidor — [domain.fe.md](./domain.fe.md)).
- **Justificativa do boundary do agregado** (citação obrigatória):
  > When trying to discover the Aggregates in a Bounded Context, we must understand the
  > model's true invariants. Only with that knowledge can we determine which objects should
  > be clustered into a given Aggregate. An invariant is a business rule that must always be
  > consistent. There are different kinds of consistency. One is transactional consistency,
  > which is considered immediate and atomic. There is also eventual consistency.
  > — *(Linha 6188, p. 353, VAUGHN VERNON, *Implementing Domain-Driven Design*)*

  A invariante verdadeira do resultado é **"nenhum grupo < K sai com o conjunto"** — ela só
  se verifica sobre o resultado inteiro da consulta, por isso `Groups` + `Suppressed` formam
  uma unidade: entregar os grupos sem a contagem de supressão quebraria a consistência da
  comunicação de privacidade.

### Star schema (Analytical Store)
- **10 dimensões** (`internal/store/schema.go`, migrations forward-only): `dim_period` (year, month, year_month, quarter), `dim_age_band` (17), `dim_sex` (3), `dim_geography` (mesorregião/microrregião/UF/região IBGE), `dim_diagnosis` (CID-10: icd_code, icd_label, chapter, block), `dim_housing_type`, `dim_education_level`, `dim_benefit_type` (BPC, PBF…), `dim_referral_destination` (UPA, CRAS, CREAS…), `dim_violation_type` (negligência, violência física…).
- **7 tabelas de fatos** (todas com UNIQUE composto p/ UPSERT — migration 4):

| Fato | Grão (UNIQUE) | Métricas |
|---|---|---|
| `fact_patient_snapshot` | (period, patient_hash) | family_size, food_insecurity, has_deficiency, receives_benefit, is_overcrowded, income_band, assessment_completeness (0–1) |
| `fact_diagnosis` | (period, diagnosis, geo, age_band, sex) | new_cases, total_cases |
| `fact_appointment` | (period, geo, appointment_type) | count |
| `fact_referral` | (period, geo, destination) | count |
| `fact_violation` | (period, geo, violation_type) | count |
| `fact_benefit` | (period, geo, benefit_type) | beneficiary_count, total_amount |
| `fact_family_composition` | (period, geo) | avg_family_size, total_families, families_with_elderly, families_with_children |

- **Controle**: `event_processing_log` (event_id UUID PK — idempotência), `event_dlq` (payload sanitizado), `schema_migrations`. **Materialized views** (migration 5): `mv_demographics`, `mv_epidemiological` — refresh `CONCURRENTLY` no job mensal de carry-forward (1º dia do mês, copia snapshots de pacientes ativos para o novo período).
- **Justificativa do boundary do agregado** (citação obrigatória):
  > Prefer references to external Aggregates only by their globally unique identity, not by
  > holding a direct object reference (or "pointer"). Aggregates with inferred object
  > references are thus automatically smaller because references are never eagerly loaded.
  > The model can perform better because instances require less time to load and take less
  > memory.
  > — *(Linha 6291, p. 359–361, VAUGHN VERNON, *Implementing Domain-Driven Design*)*

  Cada fato referencia as dimensões **somente por surrogate id** (`period_id`,
  `age_band_id`, `geography_id`…) — o star schema é a expressão relacional desse princípio:
  fatos pequenos, dimensões compartilhadas, consultas que cruzam contextos sem nunca
  carregar (nem possuir) identidade de pessoa.

## Eventos de domínio (outbox)

O `analysis-bi` é **consumidor** (não emissor): os eventos nascem no Transactional Outbox do
`social-care` (ADR-013/ADR-014 daquele serviço) e chegam via NATS JetStream — stream
`SOCIAL_CARE_EVENTS`, subjects `social-care.events.<EventType>`, pull-based durable consumer
`analysis-bi`, at-least-once (ACK manual, DLQ sanitizada em erro), batch 10/timeout 2s,
reconexão com backoff. Idempotência por `event_processing_log(event_id UUID PK)`.

**18 eventos consumidos** (`internal/domain/events.go`), com eixo e tabela alimentada:

| Evento (EN-passado) | Eixo | Alimenta |
|---|---|---|
| `PatientCreatedEvent` | Demográfico | `fact_patient_snapshot` |
| `FamilyMemberAddedEvent` | Demográfico | `fact_patient_snapshot` |
| `FamilyMemberRemovedEvent` | Demográfico | `fact_patient_snapshot` |
| `SocialIdentityUpdatedEvent` | Demográfico | `fact_patient_snapshot` |
| `PrimaryCaregiverAssignedEvent` | Cuidado | `fact_patient_snapshot` |
| `SocialHealthSummaryUpdatedEvent` | Cuidado | `fact_patient_snapshot` |
| `IntakeInfoUpdatedEvent` | Cuidado | `fact_patient_snapshot` |
| `SocialCareAppointmentRegisteredEvent` | Cuidado | `fact_appointment` |
| `HousingConditionUpdatedEvent` | Socioeconômico | `fact_patient_snapshot` |
| `SocioEconomicSituationUpdatedEvent` | Socioeconômico | `fact_patient_snapshot`, `fact_benefit` |
| `WorkAndIncomeUpdatedEvent` | Socioeconômico | `fact_patient_snapshot` |
| `EducationalStatusUpdatedEvent` | Socioeconômico | `fact_patient_snapshot` |
| `HealthStatusUpdatedEvent` | Epidemiológico | `fact_diagnosis` |
| `CommunitySupportNetworkUpdatedEvent` | Proteção | `fact_patient_snapshot` |
| `PlacementHistoryUpdatedEvent` | Proteção | `fact_patient_snapshot` |
| `ReferralCreatedEvent` | Proteção | `fact_referral` |
| `RightsViolationReportedEvent` | Proteção | `fact_violation` |
| `FamilyCompositionEvent` (**planejado**) | Demográfico | `fact_family_composition` |

Os 10 eventos de assessment compartilham o payload genérico `AssessmentUpdatedEvent`
(`Before`/`After` como JSON cru, tipado por subject na ingestão); os IDs de pessoas no
payload (`memberId`, `caregiverId`, `victimId`, `professionalInChargeId`) são **suprimidos**
no anonimizador antes de qualquer persistência.

## Mapa de contexto

- **social-care** é **upstream (Conformist com anonimização na fronteira)**: o `analysis-bi` conforma-se ao published language dos eventos do Outbox (mesmos nomes Swift, subjects `social-care.events.*`), mas a fronteira de ingestão aplica supressão + generalização — o modelo clínico identificado **não atravessa** para dentro do contexto analítico.
- **people-context** não é consumido: identidade de pessoas é exatamente o que este serviço **não** conhece.
- **web_02 (esta feature)** é **downstream read-only com Anticorruption Layer**: o BFF Elysia (`server/adapters`) traduz o envelope `{ data, meta: { k_threshold, suppressed_groups, total_records, period } }` e os erros HTTP **sem código estruturado** (400/401/429/503…) para o Model do client via Eden Treaty — ver [domain.fe.md](./domain.fe.md) e [adr.fe.md](./adr.fe.md). Não existem mutations: o dashboard nunca escreve no `analysis-bi` (decisão em [adr.md](./adr.md) — sem drill-down individual, supressão jamais contornada).
- **Export** atende consumidores institucionais externos (TABWIN/DataSUS via DBF/DBC, RNDS via FHIR R4 BR Core, LibreOffice via ODS) — sempre sob o mesmo K=5; o download trafega pelo BFF (`Content-Disposition: attachment; filename="acdg-{dataset}-{period}.{ext}"`).
- **Auth/observabilidade (estado real)**: JWT via JWKS condicional; findings do FINAL-REPORT (74/100) — **HIGH-001** (issuer/audience não validados), **HIGH-002** (skip silencioso sem `JWKS_URL`), **HIGH-003** (RBAC placeholder) — são compensados na topologia ACDG-BV pelo BFF como única borda (rede interna Docker) até correção no serviço; ver [constitution.md](../../../.specify/memory/constitution.md) (Iron Frontier).
- Cross-BC **somente** via `public-api` (módulos do frontend) + **outbox/NATS** (backends) — nunca acesso direto a banco nem import interno ([ADR-0001 web_02](../../adr/0001-vertical-modular-architecture.md)). Audit trail clínico permanece centralizado no `social-care`; o `analysis-bi` não tem audit de acesso próprio (LOW-001 — aberto).

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Iron Frontier, Princípios I, III, VI
- [ADR-0001 (vertical-modular)](../../adr/0001-vertical-modular-architecture.md) — boundaries de módulo
- [adr.md](./adr.md) — proibição de drill-down individual
- [domain.fe.md](./domain.fe.md) — modelo BFF + client (Model TypeBox/Eden, eventos, mapeamento ACL)
- [api-readiness.fe.md](./api-readiness.fe.md) — prontidão dos endpoints e findings de segurança
- [ADR index](../../adr/README.md) — todos os ADRs web_02
- [Doc integração](../README.md) — mapa cross-service (social-care, people-context, analysis-bi)
- Docs offline: `../../reference/database/postgresql/` · `../../reference/messaging/` (NATS)
