---
title: "No any — use unknown with narrowing"
scope: "file"
path: ["src/**/*.ts", "src/**/*.tsx"]
severity_min: "high"
languages: ["typescript"]
buckets: ["code_quality"]
enabled: true
---

## Instructions

`any` defeats TypeScript's type system and hides bugs. It is forbidden in this codebase.

Flag:
- `any` as a type annotation (`: any`, `as any`)
- `as unknown as T` escape hatch (unless explicitly documented with a `// WHY:` comment)
- Function parameters typed as `any`
- Generic defaults of `any` (e.g., `<T = any>`)

Use instead:
- `unknown` with type narrowing (type guards, discriminated unions)
- Specific types or generics
- If `as` casting is truly unavoidable, add a `// WHY:` comment explaining the reason

## Examples

### Bad example
```typescript
const parseBody = (body: any) => {
  return body.name as string;
};
```

### Good example
```typescript
const parseBody = (body: unknown): Result<ParsedBody, 'INVALID_BODY'> => {
  if (typeof body !== 'object' || body === null) return err('INVALID_BODY');
  if (!('name' in body) || typeof body.name !== 'string') return err('INVALID_BODY');
  return ok({ name: body.name });
};
```
