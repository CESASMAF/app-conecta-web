---
title: "Immutability always — Readonly types, no mutation"
scope: "file"
path: ["src/domain/**/*.ts", "src/application/**/*.ts", "src/client/viewmodels/**/*.ts"]
severity_min: "high"
languages: ["typescript"]
buckets: ["architecture", "code_quality"]
enabled: true
---

## Instructions

State is always immutable in domain, application, and viewmodel layers. Changes are made via spread copy.

Flag:
- Mutable array methods: `.push()`, `.splice()`, `.pop()`, `.shift()`, `.unshift()`, `.sort()` (in-place), `.reverse()` (in-place)
- `let` reassignment on domain objects or state
- Missing `Readonly<{}>` on type definitions for domain types, commands, events
- Missing `readonly` on array type members (should be `readonly T[]`)
- Direct property mutation: `obj.prop = value`

Allowed:
- `let` for loop counters or local accumulators that don't escape the function
- Mutable operations inside adapters where performance requires it (must be contained)

## Examples

### Bad example
```typescript
type Patient = {
  name: string;
  members: FamilyMember[];
};

const addMember = (patient: Patient, member: FamilyMember) => {
  patient.members.push(member);
  return patient;
};
```

### Good example
```typescript
type Patient = Readonly<{
  name: string;
  members: readonly FamilyMember[];
}>;

const addMember = (patient: Patient, member: FamilyMember): Patient => ({
  ...patient,
  members: [...patient.members, member],
});
```
