# REPORT — kernel/address (Domain Modeler)

## Ticket
kernel-address — Address (compound Value Object)

## Files Created
- .pipeline/kernel-address/001-contracts/address.ts — Contract (types + function signatures)
- tests/domain/kernel/address_test.ts — 22 test cases
- src/domain/kernel/address.ts — Implementation

## Public API

### Types
| Type | Definition |
|------|-----------|
| ResidenceLocation | "URBANO" \| "RURAL" |
| Address | Readonly<{ cep, state, city, street, neighborhood, number, complement, residenceLocation, isShelter, isHomeless }> |
| AddressInput | Readonly<{ cep?, state, city, street?, neighborhood?, number?, complement?, residenceLocation, isShelter, isHomeless? }> |
| AddressError | "ADDR-001" \| "ADDR-002" \| "ADDR-003" \| "ADDR-004" \| "ADDR-005" |

### Functions
| Function | Signature |
|----------|-----------|
| Address | (input: AddressInput) => Result<Address, AddressError> |

### Error Codes
| Code | Meaning |
|------|---------|
| ADDR-001 | Invalid CEP (wraps CEPError from kernel/cep) |
| ADDR-002 | State is empty after trim |
| ADDR-003 | State is not a valid Brazilian state (27 UFs) |
| ADDR-004 | City is empty after trim |
| ADDR-005 | Invalid residenceLocation (not URBANO or RURAL) |

## Dependencies
- src/domain/kernel/cep.ts — reuses CEP smart constructor, CEP branded type, BrazilianState type

## Test Results
- 22 passed, 0 failed (5ms)
- Coverage: smart constructor happy path (full + minimal + isHomeless), all 5 error codes, isShelter preservation, isHomeless default, optional fields undefined, normalization

## Design Decisions
- Reuses BrazilianState type from cep.ts for the valid-states set — single source of truth for 27 UFs
- CEP validation delegates to the existing CEP smart constructor; any CEPError maps to ADDR-001
- Validation order: CEP -> state empty -> state valid -> city empty -> residenceLocation (first error wins)
- isHomeless defaults to false when omitted (optional with default)
- residenceLocation validated as string against a set, then cast to ResidenceLocation
- Normalization: state gets trim().toUpperCase(), all text fields get trim().replace(/\s+/g, " ")

## Pipeline
- Agents: domain-architect (contracts), test-writer (tests), domain-modeler (impl)
- Review rounds: 0 (all 22 tests green on first run)
