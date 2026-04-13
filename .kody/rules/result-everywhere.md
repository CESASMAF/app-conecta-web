---
title: "Fallible operations must return Result<T, E> with string literal errors"
scope: "file"
path: ["src/domain/**/*.ts", "src/application/**/*.ts", "src/client/services/**/*.ts"]
severity_min: "high"
languages: ["typescript"]
buckets: ["architecture", "error_handling"]
enabled: true
---

## Instructions

All fallible operations in domain, application, and client services must return `Result<T, E>` where `E` is a **string literal union**, not an Error class.

Flag:
- Smart constructors that return `T` instead of `Result<T, E>` for validated types
- Use cases that return `Promise<T>` instead of `Promise<Result<T, E>>`
- Client service functions that return `Promise<T>` instead of `Promise<Result<T, E>>`
- Error types using `Error` subclasses instead of string literal unions
- `catch` blocks that swallow errors without converting to Result

## Examples

### Bad example
```typescript
type RegisterError = Error;

export const makeRegisterPatient = (deps: Deps) =>
  async (input: Input): Promise<Patient> => {
    try {
      return await deps.repo.save(patient);
    } catch (e) {
      throw new RegisterError("Failed");
    }
  };
```

### Good example
```typescript
type RegisterError = 'INVALID_CPF' | 'DUPLICATE_PATIENT' | 'REPO_ERROR';

export const makeRegisterPatient = (deps: Deps): UseCase<Input, Patient, RegisterError> =>
  async (input): Promise<Result<Patient, RegisterError>> => {
    const cpf = CPF(input.cpf);
    if (!cpf.ok) return cpf;
    // ...
    return ok(patient);
  };
```
