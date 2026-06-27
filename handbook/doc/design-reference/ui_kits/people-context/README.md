# UI Kit — People Context (`people-context`)

Interactive recreation of the **web_02 / People Context** module: the central registry
of people across the RAROS network. Composes the design-system primitives — it never
re-implements them.

> Source of truth: `people-context/` spec set (Atomic Design docs `design-atoms` →
> `design-pages`, `design-interface-inventory`). Backend: Bun + Elysia + PostgreSQL +
> NATS service `people-context` (Person aggregate, SystemRole, Authentik IdP provisioning,
> async password reset, LGPD Art. 18 V erasure). All data here is synthetic — no real PII.

## Routes recreated

| Screen | Route | Template | What it shows |
|---|---|---|---|
| People list / search | `/people` | ListTemplate | cursor pagination ("Carregar mais"), search by name **or** CPF prefix, FAB, per-row kebab, empty/no-result states, inactive rows dimmed |
| New person | `/people/new` | FormTemplate | `PersonForm` with the optional **"Acesso ao sistema"** login section; 207 Multi-Status simulation |
| Record · Perfil | `/people/$id` | RecordTemplate | header avatar + `M3ActiveBadge` + `M3LoginIndicator`; `M3DataField` grid; inline edit |
| Record · Vínculos | `/people/$id/roles` | RecordTemplate | `RolePanel`: filter chips, `RoleChipWithActions`, scoped-admin assign dialog, empty state |
| Record · Acesso | `/people/$id/access` | RecordTemplate | `IdpAccessPanel`: provision login / reset / deactivate / **LGPD erasure** with typed double-confirmation |

## Files

- `index.html` — shell, all kit CSS, mounts `window.PeopleKit.App`.
- `fixtures.js` — `window.PeopleData`: ~22 synthetic people (edge-cases: no CPF, no login, 207 failed, inactive, 4+ vínculos, long name), systems/roles, the logged-in actor (a **scoped** social-care/therapies admin), and a date formatter.
- `people-panels.jsx` — `window.PeoplePanels`: organism panels `PersonForm`, `RolePanel`, `RoleChipWithActions`, `IdpAccessPanel`, `ErasureDialog`, plus a kit-local `Modal`.
- `people-screens.jsx` — `window.PeopleKit`: `App`, `Shell`, `ListScreen`, `PersonRow`, `DetailScreen`, tab orchestration + the fake interaction state machine.

## DS components composed

`M3Button`, `M3TextField`, `M3DropdownField`, `M3ChoiceChip`, `M3Switch`, `M3PasswordField`,
`M3SectionHeader`, `M3DataField`, `M3EmptyState`, `M3Card`, `M3Badge`, `M3TopAppBar`,
`M3NavRail`, and the People atoms `M3ActiveBadge`, `M3LoginIndicator`, `M3RoleBadge`,
plus `IdpRetryBanner`.

## Things to try

- **Search** "maria" (name) or "456" (CPF prefix); clear to see "Carregar mais".
- Open **Maria** → all three tabs are full; **José** → no CPF / no login (Acesso offers provisioning).
- **Nova pessoa** → toggle "Acesso ao sistema"; type a name containing `207` to simulate a
  failed IdP provision → `IdpRetryBanner` with working retry.
- **Vínculos** → assign a vínculo (only your scoped systems appear), desativar/reativar via the chip menu.
- **Acesso** → reset password (link is never shown — only a confirmation), deactivate/reactivate,
  and the superadmin-only **danger zone**: erasure needs the checkbox **and** the exact typed name.

## Fidelity notes (from the inventory)

- CPF shown masked (`***.456.789-**`), never raw. Backend EN enums (`active`, `system:role`) are
  translated to PT-BR in the UI. Dates render `dd/MM/yyyy`.
- Password-reset link is **never** displayed — only "link enviado por e-mail" (it travels on a NATS event).
- RBAC is **scoped**: the demo actor is a social-care/therapies admin — the assign dialog only
  offers those systems; the LGPD danger zone is hidden (superadmin-only).
- This is a cosmetic recreation: no real network, auth, or persistence.
