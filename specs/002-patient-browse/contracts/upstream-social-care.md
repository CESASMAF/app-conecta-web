# Contrato Upstream — social-care (BFF ↔ social-care)

Endpoints do `social-care` que o **BFF** consome (server-side; invisíveis ao browser). Fonte de verdade: `handbook/doc/social-care/requesitos/` (Gherkin) + `05-fluxo-frontend.md`.

## Transversais

- **Auth**: todo request leva `Authorization: Bearer <accessToken>` (OIDC). O BFF encaminha o Bearer da sessão; o backend deriva `actorId` do `JWT.sub` validado e **ignora headers custom** (ADR-023). Sem Bearer → 401.
- **Envelopes**: sucesso `{ data, meta:{timestamp} }` (`StandardResponse`); listas `PaginatedResponse` com `meta.{pageSize,totalCount,hasMore,nextCursor}`; erro `{ error:{ code, message } }`.
- **Base URL**: `SOCIAL_CARE_URL` (env, server-only).

## GET /api/v1/patients

Query: `search`, `status`, `limit` (1–100), `cursor`. → `PaginatedResponse<PatientSummaryResponse>` onde `PatientSummaryResponse = { patientId, fullName, primaryDiagnosis, memberCount, status }`.

- Paginação **cursor-based**: `meta.nextCursor` para a próxima; `meta.hasMore=false` encerra.
- RBAC: `worker|owner|admin` ✅; sem role → 403 (matriz, arquivo 04).
- Aceite: REG-010, REG-011, REG-012, REG-013.

## GET /api/v1/patients/:patientId

→ `StandardResponse<PatientResponse>` (agregado completo). Nesta feature o BFF usa só existência + cabeçalho; o restante é a feature 003.

- `404` se inexistente (REG-014). RBAC leitura: worker/owner/admin ✅.

## GET /api/v1/dominios/:tableName

→ `StandardResponse<DomainItem[]>`, `DomainItem = { id, codigo, descricao }`, só `ativo=true`, ordenado por `codigo`.

- `400 LKP-001` se `tableName` fora da `AllowedLookupTables.all` (13). RBAC leitura: worker/owner/admin ✅; mutações (não usadas aqui) só admin.
- Aceite: LKP-T001, LKP-T002.

## Erros relevantes a esta feature (read-only)

| status | code (ex.) | situação |
|---|---|---|
| 401 | — | Bearer ausente/inválido/expirado |
| 403 | — | role insuficiente (matriz RBAC) |
| 404 | — | paciente inexistente |
| 400 | `LKP-001` | tabela de domínio fora da allowlist |
| 503 | `REGP-031` | dependência (people-context) fora |
| 500 | — | interno |

> Códigos de escrita (`CPF-*`, `NIS-*`, `CEP-*`, `REGP-030/001/028`, validações cruzadas/metadado) **não** ocorrem nesta feature (sem POST/PUT), mas o mapa de erro (`upstream-error.ts`) já os contempla para as features 003+.
