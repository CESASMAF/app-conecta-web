# Domain Implementation Report -- kernel/cpf

## Status: GREEN (17/17 tests passing)

## Files Created
- `src/domain/kernel/cpf.ts`

## Public API

### Branded Type
- `CPF` -- `Brand<string, "CPF">` (11 sanitized digits, no punctuation)

### Error Union
- `CPFError` -- `"CPF-001" | "CPF-002" | "CPF-003" | "CPF-004" | "CPF-005"`

### Fiscal Region Union
- `FiscalRegion` -- `"RS" | "DF, GO, MS, MT, TO" | "AC, AM, AP, PA, RO, RR" | "CE, MA, PI" | "AL, PB, PE, RN" | "BA, SE" | "MG" | "ES, RJ" | "SP" | "PR, SC"`

### Smart Constructors
- `CPF(raw: string)` -> `Result<CPF, CPFError>` -- Validates and brands a CPF string. Fail-first order: empty (CPF-001), invalid chars (CPF-002), wrong length (CPF-003), all identical digits (CPF-004), bad checksum (CPF-005).

### Pure Functions
- `formatCPF(cpf: CPF)` -> `string` -- Formats branded CPF as "XXX.XXX.XXX-XX"
- `fiscalRegion(cpf: CPF)` -> `FiscalRegion` -- Derives fiscal region from digit at index 8

## Error Union Coverage

| Code    | Meaning                                   | Tests |
|---------|-------------------------------------------|-------|
| CPF-001 | Input empty after trim                    | 2     |
| CPF-002 | Invalid characters (not digits/./- /ws)   | 2     |
| CPF-003 | Not exactly 11 digits after sanitization  | 2     |
| CPF-004 | All 11 digits identical                   | 2     |
| CPF-005 | Checksum (two check digits) invalid       | 2     |

## Test Results
- **17 passed, 0 failed** (tests/domain/kernel/cpf_test.ts)
- Happy path: 3 tests (plain digits, formatted, extra spaces)
- Error paths: 10 tests (2 per error code)
- formatCPF: 1 test
- fiscalRegion: 3 tests (digits 0, 7, 8)

## Compliance
- No throw, class, this, new Error, any
- All types Readonly / readonly
- Smart constructor returns Result<CPF, CPFError>
- as unknown as CPF used only for branding (documented in code)
- Explicit return types on all exported functions
- import type for type-only imports
