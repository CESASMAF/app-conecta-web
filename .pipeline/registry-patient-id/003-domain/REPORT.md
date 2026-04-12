# Domain Report — registry/patient-id

## Public API

### Types
- `PatientId` — `Brand<string, "PatientId">` (normalized lowercase UUID)
- `PatientIdError` — `"PATID-001"` (invalid UUID format)

### Functions
- `PatientId(raw: string): Result<PatientId, PatientIdError>` — smart constructor, normalizes (trim + lowercase), validates UUID regex
- `generatePatientId(): PatientId` — generates new UUID via `crypto.randomUUID()`

## Files
- Contract: `.pipeline/registry-patient-id/001-contracts/patient_id.ts`
- Implementation: `src/domain/registry/patient_id.ts`
- Tests: `tests/domain/registry/patient_id_test.ts`

## Test Results
8/8 passed (0 failures)

| Test | Status |
|------|--------|
| valid lowercase UUID returns Ok | PASS |
| uppercase UUID normalizes to lowercase | PASS |
| UUID with spaces trims | PASS |
| empty string returns PATID-001 | PASS |
| invalid format returns PATID-001 | PASS |
| missing section returns PATID-001 | PASS |
| generatePatientId returns valid PatientId | PASS |
| generatePatientId generates unique ids | PASS |

## Compliance
- No throw, class, this, any
- Result<T, E> with string literal error union
- Branded type via Brand<string, "PatientId">
- Explicit return types on all exports
- import type for type-only imports
- .ts extensions on all relative imports
- Immutable — all operations return new values
- Pattern matches src/domain/kernel/ids.ts exactly

## Dependencies
- src/domain/shared/brand.ts (Brand)
- src/domain/shared/result.ts (Result, ok, err)
