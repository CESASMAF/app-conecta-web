# Domain Report — kernel/NIS

## Summary

NIS (Numero de Identificacao Social) Value Object implemented as a branded type with smart constructor.

## Public API

| Export | Kind | Signature |
|--------|------|-----------|
| NIS | Branded Type | Brand<string, "NIS"> |
| NISError | Error Union | "NIS-001" | "NIS-002" |
| NIS | Smart Constructor | (raw: string) => Result<NIS, NISError> |

## Error Codes

| Code | Meaning |
|------|---------|
| NIS-001 | Empty after trim |
| NIS-002 | Not exactly 11 digits after sanitization |

## Validation Flow

1. Trim input
2. If empty -> NIS-001
3. Sanitize: keep only digits
4. If length !== 11 -> NIS-002
5. Brand and return Ok

## Files

| File | Purpose |
|------|---------|
| src/domain/kernel/nis.ts | Implementation |
| tests/domain/kernel/nis_test.ts | 7 tests (all passing) |
| .pipeline/kernel-nis/001-contracts/nis.ts | Contract (types only) |

## Test Results

7 passed | 0 failed

## Agents

- domain-architect (contracts)
- test-writer (tests)
- domain-modeler (implementation)
