# API Integration — Client Services Reference

> How client services talk to the Hono BFF. The BFF proxies to the backend with Bearer token injection.
> Client services NEVER see tokens — they use same-origin cookies automatically.

## Base Client Pattern

All requests go to same-origin `/api/v1/*`. The Hono BFF handles auth.

```typescript
// src/client/data/services/base-client.ts
const headers = {
  "Content-Type": "application/json",
  "X-Requested-With": "XMLHttpRequest",  // Required by fetchMetadata guard
}

// Every method returns Result — never throws
```

## Patient List Endpoint

```
GET /api/v1/patients?search=&cursor=&limit=20
```

| Param | Type | Default | Notes |
|-------|------|---------|-------|
| search | string | — | Filters by firstName, lastName, CPF. Case-insensitive partial match |
| cursor | string (UUID) | — | Last patientId from previous page. Omit for first page |
| limit | integer | 20 | Min 1, Max 100 |

### Response Shape

```typescript
type PatientListResponse = Readonly<{
  data: readonly PatientSummary[]
  meta: Readonly<{
    timestamp: string        // ISO 8601
    pageSize: number
    totalCount: number       // Use for FamilyCounter: "{n} famílias cadastradas"
    hasMore: boolean
    nextCursor: string | null
  }>
}>

type PatientSummary = Readonly<{
  patientId: string          // UUID — primary key, used to fetch detail
  personId: string           // UUID — cross-reference
  firstName: string | null   // null if no personalData
  lastName: string | null
  fullName: string | null
  primaryDiagnosis: string | null
  memberCount: number
}>
```

### Pagination (cursor-based)

1. First page: `GET /patients?limit=20`
2. Next page: `GET /patients?limit=20&cursor={meta.nextCursor}`
3. On search change: discard cursor, start from page 1
4. Append mode: cursor requests append to existing list, non-cursor replaces

### Search Integration

Debounce 300ms. On clear, fetch without search param (reset).

## Patient Detail Endpoint

```
GET /api/v1/patients/:patientId
```

Called on-demand when user clicks a family in the list.

### Key Mappings for Detail Panel

| UI Field | JSON Path |
|----------|-----------|
| Nome completo | personalData.firstName + " " + personalData.lastName |
| Nome da mãe | personalData.motherName |
| Diagnóstico | diagnoses[0].description |
| Data de nascimento | personalData.birthDate (format DD/MM/YYYY) |
| CPF | civilDocuments.cpf (already formatted) |
| Status | "Ativo" if personalData exists |
| CEP | address.cep (already formatted) |
| Telefone | personalData.phone |
| Endereço | address.street + ", " + address.number |

### Fichas Derivation

Derive `filled: boolean` from field presence in the detail response:

| Ficha | Condition |
|-------|-----------|
| Composição familiar | familyMembers.length > 0 |
| Acesso a benefícios | socioeconomicSituation !== null |
| Condições de saúde | healthStatus !== null |
| Convivência familiar | communitySupportNetwork !== null |
| Condições educacionais | educationalStatus !== null |
| Violência e violação | violationReports.length > 0 |
| Trabalho e rendimento | workAndIncome !== null |
| Especificidades sociais | socialIdentity !== null |
| Forma de ingresso | intakeInfo !== null |
| Condições habitacionais | housingCondition !== null |

## Registration Endpoint

```
POST /api/v1/patients
```

Payload built from wizard state. See features.md for field-by-field mapping.

## Family Endpoints

| Method | Path | Action |
|--------|------|--------|
| POST | /api/v1/patients/:id/family-members | Add member |
| DELETE | /api/v1/patients/:id/family-members/:mid | Remove member |
| PUT | /api/v1/patients/:id/primary-caregiver | Assign caregiver |
| PUT | /api/v1/patients/:id/social-identity | Update specificity |

## Lookups

```
GET /api/v1/lookups/:tableName
```

Used for: relationship types, specificities.

## Error Response Shape

```typescript
type ApiError = Readonly<{
  error: true
  reason: string
  code: string   // e.g. "QLP-001", "PAT-409"
}>
```

## Date Handling

- All dates arrive as ISO 8601 strings
- Format for display: DD/MM/YYYY
- CPF and CEP arrive already formatted from backend — do NOT re-format
- Null fields → display "—" (em-dash)
