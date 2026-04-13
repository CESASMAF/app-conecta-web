---
title: "throw is forbidden in domain and application layers"
scope: "file"
path: ["src/domain/**/*.ts", "src/application/**/*.ts"]
severity_min: "critical"
languages: ["typescript"]
buckets: ["architecture", "error_handling"]
enabled: true
---

## Instructions

In the domain and application layers, **`throw` is strictly forbidden**. Errors are values, not exceptions. All fallible operations must return `Result<T, E>` with string literal error unions.

Flag:
- `throw` keyword anywhere in domain or application code
- `new Error(...)` or any Error subclass construction
- `Promise.reject(...)` with error objects
- Functions that don't return `Result` for fallible operations

`throw` is allowed ONLY in the adapter layer (`src/adapters/`, `src/routes/`, `src/middleware/`), and even there it must be converted to `Result` at the boundary.

## Examples

### Bad example
```typescript
// src/domain/kernel/cpf.ts
export const CPF = (raw: string): CPF => {
  if (!isValid(raw)) {
    throw new Error("Invalid CPF");
  }
  return raw as CPF;
};
```

### Good example
```typescript
// src/domain/kernel/cpf.ts
export const CPF = (raw: string): Result<CPF, 'INVALID_CPF'> => {
  if (!isValid(raw)) {
    return err('INVALID_CPF');
  }
  return ok(raw as CPF);
};
```
