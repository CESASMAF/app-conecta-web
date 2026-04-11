---
name: domain-expert
description: >
  Expert skill for designing and implementing Domain layers in TypeScript following DDD principles
  with strict functional, immutable, value-oriented approach. Use this skill whenever the user mentions:
  domain layer, bounded context, aggregate, entity, value object, repository protocol, domain service,
  CQRS, commands, events, DDD, domain modeling, aggregate root, Result pattern, branded types, smart
  constructors, or wants to model a business concept. Even "create the domain for X" triggers this.
  Project uses Deno runtime — imports use jsr: or import maps from deno.json.
---

# Domain Expert — Functional DDD in TypeScript (Deno)

You are a domain modeling specialist. Build **pure, immutable, throw-free** domain layers.

## Core Rules

1. **Structs only** — No classes. Every type is `Readonly<{}>`. Spread for copies.
2. **Total immutability** — `Readonly`, `readonly[]`, `as const` everywhere.
3. **First-order pure functions** — No `this`, no method chains, no inheritance.
4. **`throw` is FORBIDDEN** — Every failure is `Result<T, E>` with string literal error unions.

## Foundation Types

```typescript
// Result
type Result<T, E = string> =
  | Readonly<{ ok: true; value: T }>
  | Readonly<{ ok: false; error: E }>
const Ok = <T>(value: T): Result<T, never> => ({ ok: true, value })
const Err = <E>(error: E): Result<never, E> => ({ ok: false, error })

// Combinators
const map = <T, U, E>(r: Result<T, E>, fn: (v: T) => U): Result<U, E> => r.ok ? Ok(fn(r.value)) : r
const flatMap = <T, U, E1, E2>(r: Result<T, E1>, fn: (v: T) => Result<U, E2>): Result<U, E1 | E2> => r.ok ? fn(r.value) : r
const combine = <T extends readonly Result<unknown, unknown>[]>(results: T): Result<
  { readonly [K in keyof T]: T[K] extends Result<infer V, unknown> ? V : never },
  T[number] extends Result<unknown, infer E> ? E : never
> => { const v: unknown[] = []; for (const r of results) { if (!r.ok) return r as any; v.push(r.value) } return Ok(v as any) }

// Brand
type Brand<T, B extends string> = T & { readonly __brand: B }

// DeepReadonly
type DeepReadonly<T> = { readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P] }
```

## Building Blocks

### Value Objects — Branded + Smart Constructor → Result
```typescript
type CPF = Brand<string, 'CPF'>
const CPF = (raw: string): Result<CPF, 'INVALID_CPF_FORMAT' | 'INVALID_CPF_DIGITS'> => {
  if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(raw)) return Err('INVALID_CPF_FORMAT')
  // ... digit validation
  return Ok(raw as CPF)
}
```

### Entities — Readonly structs with Branded ID
```typescript
type Patient = Readonly<{ id: PatientId; cpf: CPF; name: string; email: Email }>
```

### Aggregates — Root entity + pure mutation functions
```typescript
const addItem = (payment: Payment, item: PaymentItem): Result<Payment, 'ALREADY_COMPLETED'> => {
  if (payment.status === 'completed') return Err('ALREADY_COMPLETED')
  return Ok({ ...payment, items: [...payment.items, item] })
}
```

### Commands/Events — Discriminated unions with `type` field
```typescript
type FamilyCommand =
  | Readonly<{ type: 'AddMember'; name: string; role: MemberRole }>
  | Readonly<{ type: 'RemoveMember'; memberId: MemberId }>
```

### Command Handlers — Exhaustive switch, returns Result
```typescript
type CommandHandler<S, C, E> = (state: S, command: C) => Result<S, E>
```

### Repository Protocols — Type contracts only, never implementations
```typescript
type PatientRepository = Readonly<{
  findById: (id: PatientId) => Promise<Result<Patient, 'NOT_FOUND'>>
  save: (patient: Patient) => Promise<Result<void, 'CONFLICT'>>
}>
```

### Domain Services — Cross-aggregate pure functions
Receive aggregates as args, return modified aggregates. Never access repos.

## Folder Structure
```
src/domain/
  shared/result.ts, brand.ts
  <bounded-context>/
    value-objects/, entities/
    aggregates/<name>/types.ts, operations.ts, events.ts
    commands/, queries/, handlers/, services/, repositories/, errors.ts
```

## Checklist
- [ ] No `class`, `throw`, `this`, `new Error`, `any`
- [ ] Every type `Readonly<{}>`, arrays `readonly T[]`
- [ ] Every ID is Branded, every smart constructor returns `Result<T, E>`
- [ ] Mutations return new copy via spread
- [ ] Commands/Events are discriminated unions
- [ ] Handlers use exhaustive switch
- [ ] Repos are `type` contracts only
- [ ] Domain Services never access repos
