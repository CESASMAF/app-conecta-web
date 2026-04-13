---
title: "Components must be pure (props) => JSX with no fetch or business state"
scope: "file"
path: ["src/client/views/components/**/*.tsx"]
severity_min: "high"
languages: ["typescript"]
buckets: ["architecture"]
enabled: true
---

## Instructions

Components are specialized, autocontained UI units. They receive props and return JSX. Nothing else.

Flag in component files:
- `fetch()` or any network call
- `useEffect`, `useReducer`
- `useState` holding business state (allowed only for local UI: tooltip open, dropdown expanded)
- Import from `src/client/services/` or `src/client/viewmodels/`
- Import from `src/domain/` or `src/application/`
- JSX longer than ~50 lines without extracting subcomponents
- `document.`, `window.`, `localStorage`

Components should:
- Accept typed props
- Use `hono/css` with tokens for styling
- Import only from `src/client/views/components/` (peer components) and `src/client/styles/`

## Examples

### Bad example
```typescript
// src/client/views/components/patient/patient-card.tsx
import { useState, useEffect } from "hono/jsx/dom";
import { getPatient } from "../../../services/patient-service.ts";

export const PatientCard = ({ id }: { id: string }) => {
  const [patient, setPatient] = useState(null);
  useEffect(() => { getPatient(id).then(setPatient); }, []);
  // ...
};
```

### Good example
```typescript
// src/client/views/components/patient/patient-card.tsx
import { css } from "hono/css";
import { tokens } from "../../../styles/tokens.ts";

type Props = Readonly<{ name: string; cpf: string; status: string }>;

export const PatientCard = ({ name, cpf, status }: Props) => (
  <div class={cardStyle}>
    <h3>{name}</h3>
    <span>{cpf}</span>
    <span>{status}</span>
  </div>
);
```
