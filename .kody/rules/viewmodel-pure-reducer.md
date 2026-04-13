---
title: "ViewModels must be pure reducers with zero side effects"
scope: "file"
path: ["src/client/viewmodels/**/*.ts"]
severity_min: "high"
languages: ["typescript"]
buckets: ["architecture"]
enabled: true
---

## Instructions

ViewModels are pure state machines: `(state, action) => newState`. They must have zero side effects.

Flag in viewmodel files:
- `fetch()`, `XMLHttpRequest`, or any network call
- `useEffect`, `useState`, `useReducer` (these are view-level hooks)
- `localStorage`, `sessionStorage`, `document`, `window`
- `console.log` or any logging
- `Deno.env`, `Deno.readFile`, or any I/O
- `import` from `src/client/services/` or `src/client/views/`
- `async` functions in the reducer itself (reducer must be synchronous)
- Mutable state: `.push()`, `.splice()`, direct property mutation

Required patterns:
- State type must be `Readonly<{...}>` with `readonly` arrays
- Actions must be discriminated unions with `type` field
- Reducer must use exhaustive switch on action type
- Validators are separate pure functions

## Examples

### Bad example
```typescript
// src/client/viewmodels/registration/reducer.ts
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SUBMIT':
      fetch('/api/patients', { method: 'POST' });  // SIDE EFFECT!
      return { ...state, loading: true };
  }
};
```

### Good example
```typescript
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SUBMIT_STARTED':
      return { ...state, loading: true };
    case 'SUBMIT_SUCCESS':
      return { ...state, loading: false, patient: action.patient };
    case 'SUBMIT_FAILURE':
      return { ...state, loading: false, error: action.error };
  }
};
```
