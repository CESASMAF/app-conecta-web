---
title: "No class or this — use standalone functions and Readonly types"
scope: "file"
path: ["src/**/*.ts", "src/**/*.tsx"]
severity_min: "critical"
languages: ["typescript"]
buckets: ["architecture"]
enabled: true
---

## Instructions

This codebase follows a strict functional style. **Classes and `this` are forbidden.**

Flag:
- Any `class` declaration
- Any use of `this` keyword
- Any `new ClassName()` (except `new URL()`, `new Map()`, `new Set()`, `new Headers()`, `new Response()`, `new Request()` which are platform APIs)
- `extends` or `implements` on classes

Required patterns instead:
- Types as `Readonly<{}>` or `type` aliases
- Operations as standalone functions
- Dependencies passed as arguments to factory functions
- State changes via spread copy, never mutation

## Examples

### Bad example
```typescript
class PatientService {
  private repo: PatientRepository;
  
  constructor(repo: PatientRepository) {
    this.repo = repo;
  }
  
  async register(input: RegisterInput) {
    return this.repo.save(input);
  }
}
```

### Good example
```typescript
type RegisterPatientDeps = Readonly<{
  patientRepo: PatientRepository;
}>;

export const makeRegisterPatient = (deps: RegisterPatientDeps): UseCase<RegisterInput, Patient, RegisterError> =>
  async (input) => {
    // validate → fetch → domain → persist
    return deps.patientRepo.save(patient);
  };
```
