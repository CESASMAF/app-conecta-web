---
name: viewmodel-expert
description: >
  Expert skill for designing ViewModels (state reducers) for client-side interactive apps.
  ViewModels are pure reducers: (state, action) => newState. Zero side effects, zero fetch,
  zero DOM. Use when the user mentions: viewmodel, reducer, state management, wizard state,
  client state, useReducer, action types, state machine, form state, step validation,
  persistence (localStorage/IndexedDB), or wants to model client-side state.
  Also trigger for "create the viewmodel for X" or "manage state for Y".
---

# ViewModel Expert — Pure State Reducers (hono/jsx/dom)

You are a client-side state management specialist. ViewModels are **pure reducers** that decide what the View shows. They contain zero side effects.

## Reference Documents

For feature-specific state types and actions, see:
→ `.claude/skills/view-expert/references/features.md` — SocialCareState, WizardState, FamilyState definitions with full action unions

## Core Rules

1. **Pure function: `(state, action) => newState`** — No fetch, no DOM, no localStorage inside the reducer.
2. **State is Readonly** — Every state type is `Readonly<{}>` with `readonly` arrays.
3. **Actions are discriminated unions** — `Readonly<{ type: '...' }>` with exhaustive switch.
4. **Side effects are EXTERNAL** — Persistence, fetch results, timers are handled by the Page via `useEffect`. The reducer only receives their results as actions.
5. **Validation is a separate pure function** — `validateStep(step, fields) => Map<string, string>`. Called by the reducer, not by the Page.

## ViewModel Structure

### State Type
```typescript
type WizardState = Readonly<{
  currentStep: number
  showErrors: boolean
  saving: boolean
  saveResult: Readonly<{ ok: boolean; message: string }> | null
  fields: Readonly<{
    firstName: string
    lastName: string
    cpf: string
  }>
  errors: ReadonlyMap<string, string>
}>

const initialState: WizardState = {
  currentStep: 0,
  showErrors: false,
  saving: false,
  saveResult: null,
  fields: { firstName: "", lastName: "", cpf: "" },
  errors: new Map(),
}
```

### Action Union
```typescript
type WizardAction =
  | Readonly<{ type: "UPDATE_FIELD"; field: string; value: string }>
  | Readonly<{ type: "NEXT_STEP" }>
  | Readonly<{ type: "PREV_STEP" }>
  | Readonly<{ type: "SHOW_ERRORS" }>
  | Readonly<{ type: "SAVE_START" }>
  | Readonly<{ type: "SAVE_SUCCESS"; message: string }>
  | Readonly<{ type: "SAVE_FAILURE"; message: string }>
```

### Reducer (Pure Function)
```typescript
const wizardReducer = (state: WizardState, action: WizardAction): WizardState => {
  switch (action.type) {
    case "UPDATE_FIELD":
      return { ...state, fields: { ...state.fields, [action.field]: action.value } }
    case "NEXT_STEP": {
      const errors = validateStep(state.currentStep, state.fields)
      if (errors.size > 0) return { ...state, errors, showErrors: true }
      return { ...state, currentStep: state.currentStep + 1, showErrors: false, errors: new Map() }
    }
    case "PREV_STEP":
      return { ...state, currentStep: Math.max(0, state.currentStep - 1) }
    case "SAVE_START":
      return { ...state, saving: true, saveResult: null }
    case "SAVE_SUCCESS":
      return { ...state, saving: false, saveResult: { ok: true, message: action.message } }
    case "SAVE_FAILURE":
      return { ...state, saving: false, saveResult: { ok: false, message: action.message } }
  }
}
```

### Validators (Pure Functions)
```typescript
const validateStep = (step: number, fields: WizardState["fields"]): ReadonlyMap<string, string> => {
  const errors = new Map<string, string>()
  switch (step) {
    case 0:
      if (!fields.firstName.trim()) errors.set("firstName", "Nome obrigatório")
      if (!fields.cpf.trim()) errors.set("cpf", "CPF obrigatório")
      break
    case 1:
      // ...step 1 validations
      break
  }
  return errors
}
```

### Persistence (Pure Transform Functions)
```typescript
// These are called by the Page in useEffect, NOT by the reducer
const saveDraft = (state: WizardState): void => {
  localStorage.setItem("wizard-draft", JSON.stringify(state))
}

const loadDraft = (): WizardState | null => {
  const raw = localStorage.getItem("wizard-draft")
  return raw ? JSON.parse(raw) as WizardState : null
}

const clearDraft = (): void => {
  localStorage.removeItem("wizard-draft")
}
```

## LoadingState Pattern

For async data:
```typescript
type LoadingState<T> =
  | Readonly<{ status: "idle" }>
  | Readonly<{ status: "loading" }>
  | Readonly<{ status: "success"; data: T }>
  | Readonly<{ status: "error"; error: string }>
```

## Folder Structure
```
src/client/viewmodels/
  <feature>/
    types.ts           — State type + Action union + initialState
    reducer.ts         — Reducer function (pure)
    validators.ts      — Step/field validators (pure)
    persistence.ts     — save/load/clear (called by Page)
```

## Checklist
- [ ] Reducer is a pure function: (state, action) => newState
- [ ] Zero `fetch`, `useEffect`, `localStorage`, `DOM` inside reducer
- [ ] State type is `Readonly<{}>` with `readonly` arrays/maps
- [ ] Actions are discriminated unions with `type` field
- [ ] Switch is exhaustive
- [ ] Validators are separate pure functions
- [ ] Persistence is separate functions called externally by the Page
- [ ] No `class`, `this`, `throw`
- [ ] Testable with `Deno.test`: given state + action, assert newState
