# Domain Report — registry/personal-data

## Agent: domain-modeler
## Status: COMPLETE
## Date: 2026-04-10

---

## Created Files

| File | Purpose |
|------|---------|
| src/domain/registry/personal_data.ts | PersonalData VO — types, error union, smart constructor |
| tests/domain/registry/personal_data_test.ts | 13 test cases (happy path, errors, normalization) |
| .pipeline/registry-personal-data/001-contracts/personal_data.ts | Contract specification |

---

## Public API

### Types

- Sex = MASCULINO | FEMININO | OUTRO
- PersonalData = Readonly with firstName, lastName, motherName, nationality, sex, socialName, birthDate, phone
- PersonalDataError = PD-001 through PD-006
- PersonalDataInput = raw input type with sex as string

### Smart Constructor

PersonalData(input: PersonalDataInput): Result<PersonalData, PersonalDataError>

---

## Error Union

| Code | Condition |
|------|-----------|
| PD-001 | firstName empty after trim+collapse |
| PD-002 | lastName empty after trim+collapse |
| PD-003 | motherName empty after trim+collapse |
| PD-004 | nationality empty after trim+collapse |
| PD-005 | birthDate is in the future |
| PD-006 | invalid sex value |

## Validation Order

PD-006 -> PD-001 -> PD-002 -> PD-003 -> PD-004 -> PD-005 (fail-fast)

## Normalization

- Required string fields: trim + collapse consecutive whitespace
- socialName (optional): trim + collapse, undefined if empty
- phone (optional): trim only (no collapse), undefined if empty

## Dependencies

- src/domain/shared/result.ts
- src/domain/kernel/timestamp.ts

## Test Results

ok | 13 passed | 0 failed (5ms)

## Rules Compliance

- No throw, class, this, any
- Result with string literal unions
- Readonly for all compound types
- Explicit return types on exported function
- import type for type-only imports
- .ts extensions on all relative imports
- Immutable: no let reassignment, no mutation
