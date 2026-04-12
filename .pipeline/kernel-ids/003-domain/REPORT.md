# Domain Report — kernel/ids (PersonId, ProfessionalId, LookupId)

## Exported Public API

### Branded Types
- `PersonId` — `Brand<string, "PersonId">`
- `ProfessionalId` — `Brand<string, "ProfessionalId">`
- `LookupId` — `Brand<string, "LookupId">`

### Error Unions
- `PersonIdError` — `"PID-001"` (invalid UUID format)
- `ProfessionalIdError` — `"PRID-001"` (invalid UUID format)
- `LookupIdError` — `"LID-001"` (invalid UUID format)

### Smart Constructors
- `PersonId(raw: string): Result<PersonId, PersonIdError>`
- `ProfessionalId(raw: string): Result<ProfessionalId, ProfessionalIdError>`
- `LookupId(raw: string): Result<LookupId, LookupIdError>`

### Generators
- `generatePersonId(): PersonId`
- `generateProfessionalId(): ProfessionalId`

## Normalization
All three constructors apply: `trim()` + `toLowerCase()` before UUID regex validation.

## UUID Regex
`^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`

## Test Coverage
- 22 tests, 0 failures
- 6 happy path (2 per ID type: lowercase, uppercase normalization, trim)
- 6 error path (2 per ID type: empty, invalid format, missing section)
- 4 generator tests (round-trip validation + uniqueness for PersonId and ProfessionalId)

## Files
- Contract: `.pipeline/kernel-ids/001-contracts/ids.ts`
- Tests: `tests/domain/kernel/ids_test.ts`
- Implementation: `src/domain/kernel/ids.ts`

## Pipeline
- Agents: domain-architect (contracts), test-writer (tests), domain-modeler (implementation)
- Review rounds: 0 (all tests passed on first run)
