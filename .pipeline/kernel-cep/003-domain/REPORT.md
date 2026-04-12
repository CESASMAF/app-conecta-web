# REPORT — kernel/cep (Domain Modeler)

## Ticket
kernel-cep — CEP (Codigo de Enderecamento Postal) Value Object

## Files Created
- .pipeline/kernel-cep/001-contracts/cep.ts — Contract (types + function signatures)
- tests/domain/kernel/cep_test.ts — 25 test cases
- src/domain/kernel/cep.ts — Implementation

## Public API

### Types
| Type | Definition |
|------|-----------|
| CEP | Brand<string, "CEP"> — 8 sanitized digits |
| CEPError | "CEP-001" | "CEP-002" | "CEP-003" | "CEP-004" |
| DistributionKind | "STREET_RANGE" | "SPECIAL_CODES" | "PROMOTIONAL" | "POST_OFFICE_UNITS" | "OTHER" |
| BrazilianState | All 27 UF codes (AC | AL | ... | TO) |

### Functions
| Function | Signature |
|----------|-----------|
| CEP | (raw: string) => Result<CEP, CEPError> |
| formatCEP | (cep: CEP) => string |
| distributionKind | (cep: CEP) => DistributionKind |
| cepState | (cep: CEP) => BrazilianState | undefined |

### Error Codes
| Code | Meaning |
|------|---------|
| CEP-001 | Empty after trim |
| CEP-002 | Invalid characters (only digits, hyphens, whitespace allowed) |
| CEP-003 | Not exactly 8 digits after sanitization |
| CEP-004 | Numeric value not in any valid UF range |

## Test Results
- 25 passed, 0 failed (3ms)
- Coverage: smart constructor (happy + all 4 error codes), formatCEP, distributionKind (6 suffix buckets), cepState (7 UFs including split-range AM and RR)

## Design Decisions
- UF range table uses linear scan over 28 entries (sufficient for domain VO; no hot path)
- AM has two disjoint ranges (69000000-69299999, 69400000-69899999); both mapped
- GO/DF overlap at 72800000 resolved by order (DF range ends at 72799999, GO starts at 72800000)
- findUF is module-private, shared by smart constructor (CEP-004 validation) and cepState

## Pipeline
- Agents: domain-architect (contracts), test-writer (tests), domain-modeler (impl)
- Review rounds: 0 (all tests green on first run)
