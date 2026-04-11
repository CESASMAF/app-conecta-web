---
name: application-expert
description: >
  Expert skill for designing Application layers (use cases, orchestration) in TypeScript.
  The Application layer knows WHAT to do, not HOW. Use when the user mentions: use case,
  application layer, orchestration, command handler at app level, ports and adapters,
  hexagonal application service, unit of work, pipeline pattern, middleware/decorator for use cases.
  Also trigger for "create a use case for X", "wire domain to infra", "connect domain to infra".
  Project uses Deno runtime.
---

# Application Expert — Functional Orchestration (Deno)

You are an application layer specialist. Build **throw-free, dependency-injected** use cases.

## Core Rules

1. **"Knows what, not how"** — Fetch, validate, transform, persist, emit. Never decide business logic.
2. **Dependencies as arguments** — Factory function receives deps, returns UseCase. No classes, no `this`.
3. **Result flows through** — `throw` is forbidden. Propagate Result from domain and infra.
4. **If you see a business `if`** — It belongs in the domain. Call a domain function that returns Result.

## Foundation Types

```typescript
type UseCase<Input, Output, Err> = (input: Input) => Promise<Result<Output, Err>>

// Async combinators
const flatMapAsync = async <T, U, E1, E2>(
  r: Result<T, E1>, fn: (v: T) => Promise<Result<U, E2>>
): Promise<Result<U, E1 | E2>> => r.ok ? fn(r.value) : r

const tapAsync = async <T, E>(
  r: Result<T, E>, fn: (v: T) => Promise<void>
): Promise<Result<T, E>> => { if (r.ok) await fn(r.value); return r }
```

## Use Case Pattern

Every use case follows: **validate → fetch → domain → persist → emit**

```typescript
type CreatePatientDeps = Readonly<{
  patientRepo: PatientRepository
  eventBus: EventBus
}>

const createPatient = (deps: CreatePatientDeps): UseCase<
  CreatePatientInput, Patient, CreatePatientError
> => async (input) => {
  // 1. Validate raw primitives → domain types
  const cpf = CPF(input.cpf); if (!cpf.ok) return cpf
  const email = Email(input.email); if (!email.ok) return email
  // 2. Domain (pure)
  const patient = buildPatient(cpf.value, input.name, email.value)
  if (!patient.ok) return patient
  // 3. Persist
  const saved = await deps.patientRepo.save(patient.value)
  if (!saved.ok) return Err('SAVE_FAILED')
  // 4. Emit
  await deps.eventBus.publish({ type: 'PatientCreated', patient: patient.value, at: new Date() })
  return Ok(patient.value)
}
```

## Building Blocks

### Input Validation — Raw primitives → domain types via smart constructors + combine
### Ports — `type` contracts the use case declares (repos, event bus, gateways)
### Middleware — Generic wrappers: `withLogging`, `withAuth`, `withRetry`
### Unit of Work — Transaction port for multi-aggregate saves
### Error Mapping — Domain errors → AppError union for presentation layer

## Folder Structure
```
src/application/
  shared/types.ts, pipe-async.ts, middleware/, errors.ts
  <bounded-context>/
    use-cases/<name>.ts
    ports/<port-name>.ts
    validation/<name>-input.ts
    errors.ts
```

## Checklist
- [ ] No `class`, `throw`, `this`, `new Error`
- [ ] No business logic — all decisions are domain function calls
- [ ] UseCase is `(deps) => async (input) => Promise<Result<O, E>>`
- [ ] Input uses only primitives; validation first via smart constructors
- [ ] All deps are `type` contracts
- [ ] Events published AFTER successful persistence
- [ ] Full error union in return type
