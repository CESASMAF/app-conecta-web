# Data Model — Fase 1 (002-patient-browse)

Entidades da feature (somente leitura). Tipos descritos de forma agnóstica; a fonte única em código é o **schema TypeBox (`Elysia.t`)** das rotas BFF, propagado ao client via **Eden** (Princ. V — sem redeclarar Model).

## PatientStatus (enum)

`ACTIVE` | `DISCHARGED` | `WITHDRAWN` | `WAITLISTED` | `ADMITTED`

- Ordem de exibição sugerida: `ACTIVE`, `WAITLISTED`, `ADMITTED`, `DISCHARGED`, `WITHDRAWN`.
- Cada valor tem rótulo i18n PT-BR (em atendimento / desligado / retirado / em fila / admitido) — `patient-status.ts`.
- **Read-only** nesta feature: não há transição de estado (ciclo de vida = feature futura).

## PatientSummary (item da lista)

| Campo | Tipo | Notas |
|---|---|---|
| `patientId` | UUID (string) | identificador estável; chave de navegação `/patients/:id` |
| `fullName` | string | nome completo exibido na linha |
| `primaryDiagnosis` | string \| null | diagnóstico principal (pode faltar) |
| `memberCount` | inteiro ≥ 0 | nº de membros da família |
| `status` | `PatientStatus` | situação atual |

Origem upstream: `PatientSummaryResponse` (social-care, `GET /api/v1/patients`). **Sem PII sensível além de nome/diagnóstico** — e nada disso vai a log (FR-015).

## ListQuery (recorte + paginação)

| Campo | Tipo | Regra |
|---|---|---|
| `search` | string \| ∅ | busca por nome (substring); opcional |
| `status` | `PatientStatus` \| ∅ | filtro de situação; opcional |
| `limit` | inteiro | **1–100**, default **20**; fora da faixa → entrada inválida (FR-003) |
| `cursor` | string \| ∅ | opaco; `meta.nextCursor` da página anterior |

Mudança em `search` ou `status` **reinicia** a paginação (`cursor=∅`, páginas zeradas) — D6/D7.

## Page<PatientSummary> (resposta paginada)

| Campo | Tipo | Notas |
|---|---|---|
| `items` | `PatientSummary[]` | a fatia atual |
| `pageSize` | inteiro | tamanho efetivo da página |
| `totalCount` | inteiro | total de itens no recorte |
| `hasMore` | boolean | `false` encerra o scroll |
| `nextCursor` | string \| null | referência da próxima página |

Mapeia `PaginatedResponse.meta`. No BFF, re-emitido como `{ data: items, meta: { pageSize, totalCount, hasMore, nextCursor } }`.

## PatientListState (estado acumulado — ViewModel puro)

Estado derivado mantido pelo ViewModel (sem Solid):

| Campo | Tipo | Notas |
|---|---|---|
| `query` | `ListQuery` | recorte corrente |
| `items` | `PatientSummary[]` | merge append de todas as páginas carregadas |
| `nextCursor` | string \| null | da última página |
| `hasMore` | boolean | se há próxima página |
| `isEmpty` | boolean derivado | `items.length === 0 && !hasMore` (estado vazio) |

Operações puras (testáveis): `start(query)`, `mergeNextPage(state, page)`, `isExhausted(state)`, `isEmpty(state)`.

## DomainTable (allowlist — 13)

`dominio_tipo_identidade`, `dominio_parentesco`, `dominio_condicao_ocupacao`, `dominio_escolaridade`, `dominio_efeito_condicionalidade`, `dominio_tipo_deficiencia`, `dominio_programa_social`, `dominio_tipo_ingresso`, `dominio_tipo_beneficio`, `dominio_tipo_violacao`, `dominio_servico_vinculo`, `dominio_tipo_medida`, `dominio_unidade_realizacao`.

- Enforçada no **BFF** (fora da lista → 400 `LKP-001`).

## DomainCatalogItem (item de catálogo)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | identificador do item |
| `codigo` | string | UPPER_SNAKE_CASE; chave de ordenação |
| `descricao` | string | rótulo exibível |

- Somente `ativo=true`, **ordenados por `codigo`** (LKP-T001). Flags de metadado (`exigeRegistroNascimento`/`exigeCpfFalecido`/`exigeDescricao`) existem no upstream mas **não são consumidas** nesta feature (entram nas features de escrita).

## DomainCatalog (cache por sessão)

| Campo | Tipo | Notas |
|---|---|---|
| `table` | `DomainTable` | chave do cache |
| `items` | `DomainCatalogItem[]` | itens ativos ordenados |

- Cache via `query` do Solid (chave = `table`), validade = sessão de navegação (D8).

## Relações

- `PatientListState 1—* PatientSummary` (acumulado por paginação).
- `ListQuery` parametriza `Page<PatientSummary>`.
- `DomainCatalog 1—* DomainCatalogItem`; `DomainTable` identifica o catálogo.
- `PatientSummary.patientId` → navegação ao detalhe-stub (`/patients/:id`).
