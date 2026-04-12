# Domain Report — kernel/RGDocument

## Summary

Implemented RGDocument compound Value Object for the kernel bounded context. Unlike branded-string VOs (CPF, NIS), RGDocument is a Readonly<{}> struct carrying four validated fields: number, issuingState, issuingAgency, and issueDate.

## Public API

### Types

| Export | Kind | Description |
|--------|------|-------------|
| RGDocument | Readonly<{}> | Validated RG with number (9 chars), issuingState (2-letter), issuingAgency, issueDate (ISO) |
| RGDocumentError | String literal union | RG-001 through RG-006 |
| RGDocumentInput | Readonly<{}> | Raw input accepted by the smart constructor |

### Functions

| Export | Signature | Description |
|--------|-----------|-------------|
| RGDocument | (input: RGDocumentInput) => Result<RGDocument, RGDocumentError> | Smart constructor with validation order RG-001 through RG-006 |
| formatRG | (doc: RGDocument) => string | Formats as XXXXXXXX-X |

## Error Codes

| Code | Rule | Description |
|------|------|-------------|
| RG-001 | Not empty | Number is empty after trim |
| RG-002 | Format | Number does not match ^[0-9]{8}[0-9X]$ after normalization |
| RG-003 | Check digit | Weighted sum mod 11 check digit mismatch |
| RG-004 | Valid state | issuingState not in 27 Brazilian states |
| RG-005 | Not empty | issuingAgency is empty after trim |
| RG-006 | Not future | issueDate is after today |

## Normalization

- number: trim, uppercase, remove . - spaces
- issuingState: trim, uppercase
- issuingAgency: trim, collapse whitespace, uppercase

## Check Digit Algorithm

1. Base: first 8 digits, Weights: [2, 3, 4, 5, 6, 7, 8, 9]
2. remainder = sum mod 11
3. 0 -> 0, 1 -> X, else String(11 - remainder)

## Files

- src/domain/kernel/rg_document.ts
- tests/domain/kernel/rg_document_test.ts (20 tests)
- .pipeline/kernel-rg-document/001-contracts/rg_document.ts

## Test Coverage

20/20 passing. Covers all 6 error codes, 3 check digit variants (numeric, X, 0), normalization, formatting, edge cases.

## Pipeline

Agents: domain-architect, test-writer, domain-modeler. Review rounds: 1.
