# REPORT — registry/civil-documents (domain-modeler)

## Ticket
`registry-civil-documents` — CivilDocuments Value Object

## What Was Created

### Files
- `src/domain/registry/civil_documents.ts` — Implementation
- `tests/domain/registry/civil_documents_test.ts` — 6 tests
- `.pipeline/registry-civil-documents/001-contracts/civil_documents.ts` — Contract

### Public API

```typescript
type CivilDocuments = Readonly<{
  cpf: CPF | undefined;
  nis: NIS | undefined;
  rgDocument: RGDocument | undefined;
}>;

type CivilDocumentsError = "CD-001";

type CivilDocumentsInput = Readonly<{
  cpf?: CPF;
  nis?: NIS;
  rgDocument?: RGDocument;
}>;

const CivilDocuments: (input: CivilDocumentsInput) => Result<CivilDocuments, CivilDocumentsError>
```

### Error Union
| Code   | Rule                  | Description                              |
|--------|-----------------------|------------------------------------------|
| CD-001 | at_least_one_present  | At least one of cpf, nis, rgDocument     |

### Dependencies (imports from)
- `src/domain/kernel/cpf.ts` — CPF (type only)
- `src/domain/kernel/nis.ts` — NIS (type only)
- `src/domain/kernel/rg_document.ts` — RGDocument (type only)
- `src/domain/shared/result.ts` — Result, ok, err

## Test Results
```
6 passed | 0 failed
```

| Test Case               | Expected |
|--------------------------|----------|
| All three present        | Ok       |
| Only CPF                 | Ok       |
| Only NIS                 | Ok       |
| Only RGDocument          | Ok       |
| CPF + NIS                | Ok       |
| None present             | CD-001   |

## Compliance
- No throw, class, this, any
- Result<T, E> with string literal union
- Readonly<{}> on all types
- Explicit return types on exported function
- import type for type-only imports
- .ts extensions on all relative imports
- noUncheckedIndexedAccess compatible

## Pipeline
- Agents: domain-architect (contract), test-writer (tests), domain-modeler (impl)
- Review rounds: 0 (all tests passed first run)
