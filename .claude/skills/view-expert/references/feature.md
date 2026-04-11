# Feature Specs — Hono JSX DOM Implementation

> Three features adapted from Flutter. Each feature = 1 Page + N Components + 1 ViewModel + 1 Service.
> Read `design-tokens.md` and `components-catalog.md` first.

## Table of Contents
1. Home (family listing + detail panel)
2. Patient Registration (7-step wizard)
3. Family Composition (table + modals)
4. Shared: Data Models, Strings (PT-BR), API Endpoints

---

## 1. HOME FEATURE

**Route:** `/social-care`
**Client App:** `src/client/apps/social-care/entry.tsx`

### Page Structure

```
SocialCarePage (orchestrator, ~80 lines)
├── useReducer(socialCareReducer, initialState)
├── useEffect: loadPatients on mount, keyboard listener (Escape)
├── useEffect: saveDraft not needed (read-only page)
│
├── TopBar                    — tabs (Famílias/Cadastro) + counter
├── SearchInput               — real-time filter, max-width 420px
├── FamilyList                — scrollable, with FamilyItem per family
├── DetailPanel               — overlay + slide from right
├── NewRegistrationFab        — bottom-right, navigates to /patient-registration
```

### ViewModel (socialCareReducer)

```typescript
type PanelView = "dados" | "fichas"

type SocialCareState = Readonly<{
  families: readonly PatientSummary[]
  searchQuery: string
  selectedPatientId: string | null
  panelVisible: boolean
  panelView: PanelView
  patientDetail: PatientDetail | null
  fichas: readonly FichaStatus[]
  loading: boolean
  detailLoading: boolean
  activeTab: "familias" | "cadastro"
}>

type SocialCareAction =
  | Readonly<{ type: "LOAD_SUCCESS"; families: readonly PatientSummary[] }>
  | Readonly<{ type: "LOAD_FAILURE" }>
  | Readonly<{ type: "SET_SEARCH"; query: string }>
  | Readonly<{ type: "SELECT_PATIENT"; id: string }>
  | Readonly<{ type: "DETAIL_SUCCESS"; detail: PatientDetail; fichas: readonly FichaStatus[] }>
  | Readonly<{ type: "CLOSE_PANEL" }>
  | Readonly<{ type: "SHOW_FICHAS" }>
  | Readonly<{ type: "SHOW_DADOS" }>
  | Readonly<{ type: "SET_TAB"; tab: "familias" | "cadastro" }>
```

**Filtering:** `filteredFamilies` is a derived value computed in the reducer or as a pure function: case-insensitive `includes` on lastName, firstName, fullName.

**Panel toggle:** Clicking the same family again closes the panel (SELECT_PATIENT checks if id === selectedPatientId).

**Close flow:** CLOSE_PANEL sets panelVisible=false. After 350ms CSS transition completes, cleanup selectedPatientId and patientDetail (use setTimeout in Page's dispatch handler, or a secondary action).

### Key Components

| Component | Location | Props |
|-----------|----------|-------|
| TopBar | ui/patient/ | activeTab, familyCount, onTabChange |
| SearchInput | ui/ | query, onSearch, onClear |
| FamilyList | ui/patient/ | families, selectedId, onSelect |
| FamilyItem | ui/patient/ | lastName, firstName, memberCount, isSelected, isOtherSelected, onSelect |
| DetailPanel | ui/patient/ | visible, view, detail, fichas, onClose, onShowFichas, onShowDados |
| PanelDados | ui/patient/ | detail, onShowFichas, onEdit, onClose |
| PanelFichas | ui/patient/ | lastName, fichas, filledCount, onBack, onClose, onFichaClick |
| DataField | ui/ | label, value |
| FichaRow | ui/patient/ | name, filled, onFichaClick |
| NewRegistrationFab | ui/ | — (navigates on click) |

### FamilyItem Animation

```
Default:         Surname in weight 400, textPrimary
Hover:           Surname weight 700, details slide in (300ms easeOut)
Selected:        Surname weight 700, details visible
Other selected:  Surname weight 400, textMuted (dimmed)
```

CSS transition on font-weight (via font-variation-settings if variable font, or class swap) and color (250ms). Details use opacity + translateX(-5%) → 0.

### Detail Panel

- **Width:** min(56vw, 720px)
- **Background:** backgroundDark (#172D48)
- **Border-radius:** 24px top-left, 24px bottom-left
- **Shadow:** -8px 0 40px textPrimary@0.3
- **Slide:** CSS transform translateX(100%) → 0, 350ms easeInOut
- **Overlay:** textPrimary@0.05, opacity transition 300ms

Two views: PanelDados (patient data fields) and PanelFichas (10 fichas checklist).

### Fichas (10 total)

1. Composição familiar → navigate to /family-composition/{patientId}
2. Acesso a benefícios eventuais
3. Condições de saúde da família
4. Convivência familiar e comunitária
5. Condições educacionais da família
6. Situações de violência e violação de direitos
7. Condições de trabalho e rendimento da família
8. Especificidades sociais, étnicas ou culturais
9. Forma de ingresso e motivo do primeiro atendimento
10. Condições habitacionais da família

---

## 2. PATIENT REGISTRATION (7-Step Wizard)

**Route:** `/patient-registration`
**Client App:** `src/client/apps/registration/entry.tsx`

### Page Structure

```
RegistrationPage (orchestrator, ~100 lines)
├── useReducer(wizardReducer, loadDraft() ?? initialState)
├── useEffect: saveDraft on every state change
├── useEffect: keyboard listener (Escape to go back?)
│
├── WizardNavBar             — breadcrumbs (Famílias / Cadastro)
├── WizardHeader             — "Cadastrar Pessoa de Referência" (displayLarge)
├── WizardStepper            — 7 circles + connecting lines
├── CurrentStepComponent     — switches by state.currentStep
├── WizardButtonBar          — Back + Next/Save
```

### ViewModel (wizardReducer)

```typescript
type WizardState = Readonly<{
  currentStep: number              // 0-6
  showErrors: boolean
  saving: boolean
  saveResult: Readonly<{ ok: boolean; message: string }> | null

  // Step 0: Dados Pessoais
  fields: Readonly<{
    firstName: string; lastName: string; socialName: string; motherName: string
    nationality: string; gender: string; phoneNumber: string
  }>
  // Step 1: Documentos
  documents: Readonly<{
    cpf: string; nis: string; cnsNumber: string
    rgNumber: string; rgUf: string; rgAgency: string; rgDate: string
    birthDate: string
  }>
  // Step 2: Endereço
  address: Readonly<{
    housingSituation: string; residenceLocation: string
    cep: string; street: string; number: string; complement: string
    neighborhood: string; state: string; city: string
  }>
  // Step 3: Diagnósticos
  diagnoses: readonly DiagnosisEntry[]
  // Step 4: Família
  familyMembers: readonly FamilyMemberSnapshot[]
  // Step 5: Especificidades
  specificity: Readonly<{ selectedIdentity: string; description: string }>
  // Step 6: Ingresso
  intake: Readonly<{
    ingressType: string; originName: string; originContact: string
    serviceReason: string; selectedPrograms: readonly string[]; observation: string
  }>

  errors: ReadonlyMap<string, string>
}>

type WizardAction =
  | Readonly<{ type: "UPDATE_FIELD"; section: string; field: string; value: string }>
  | Readonly<{ type: "NEXT_STEP" }>
  | Readonly<{ type: "PREV_STEP" }>
  | Readonly<{ type: "ADD_DIAGNOSIS" }>
  | Readonly<{ type: "REMOVE_DIAGNOSIS"; index: number }>
  | Readonly<{ type: "APPLY_QUICK_CID"; index: number; code: string; description: string }>
  | Readonly<{ type: "ADD_FAMILY_MEMBER"; member: FamilyMemberSnapshot }>
  | Readonly<{ type: "UPDATE_FAMILY_MEMBER"; index: number; member: FamilyMemberSnapshot }>
  | Readonly<{ type: "REMOVE_FAMILY_MEMBER"; index: number }>
  | Readonly<{ type: "TOGGLE_PROGRAM"; programId: string }>
  | Readonly<{ type: "SAVE_START" }>
  | Readonly<{ type: "SAVE_SUCCESS"; message: string }>
  | Readonly<{ type: "SAVE_FAILURE"; message: string }>
```

### Steps (7)

| # | Name | Section | Required Fields |
|---|------|---------|----------------|
| 0 | Dados Pessoais | fields | firstName*, lastName*, motherName*, nationality*, gender* |
| 1 | Documentos | documents | cpf*, birthDate*, RG (all-or-nothing) |
| 2 | Endereço | address | housingSituation*, residenceLocation*, state*, city*. If homeless: address fields disabled |
| 3 | Diagnósticos | diagnoses | At least 1 complete diagnosis (code + date + description) |
| 4 | Família | familyMembers | Optional (can skip) |
| 5 | Especificidades | specificity | Optional (can skip) |
| 6 | Ingresso | intake | ingressType*, serviceReason* |

### Step Components

Each step is a standalone component receiving fields + errors + onUpdate callback:

```tsx
// components/registration/step-personal-data.tsx
interface StepPersonalDataProps {
  readonly fields: WizardState["fields"]
  readonly errors: ReadonlyMap<string, string>
  readonly onUpdate: (field: string, value: string) => void
}
```

### Form Grid

2 columns on desktop (flex-wrap with 280px min-width items, 40px gap), 1 column on mobile. Used in all steps.

### Validation

Validators are pure functions in `viewmodels/registration/validators.ts`. Each step has a `validateStepN(state) → Map<string, string>`. NEXT_STEP action runs the validator; if errors, sets showErrors=true and stays on step.

### Offline Persistence

State saved to localStorage on every dispatch (via Page useEffect). On page load, loadDraft() restores. On successful save, clearDraft().

### Success Animation

WizardSuccessButton: Scale 0→1 (600ms elasticOut) + checkmark SVG stroke animation (500ms easeOut). Text: "Cadastro salvo com sucesso!"

---

## 3. FAMILY COMPOSITION

**Route:** `/family-composition/:patientId`
**Client App:** `src/client/apps/family-composition/entry.tsx`

### Page Structure

```
FamilyPage (orchestrator, ~90 lines)
├── useReducer(familyReducer, initialState)
├── useEffect: loadPatient on mount
├── useState: modalOpen, modalMember (local UI state for modal)
├── useState: confirmDialog (local UI state for dialogs)
│
├── [loading] Spinner centered
├── [error] Error state with retry
├── [loaded]
│   ├── FamilyNavBar            — breadcrumbs
│   ├── FamilyHeader            — title + FAB add button
│   ├── FamilyContent           — table + specificities + age profile
│   └── FamilyActionBar         — Cancel / Save buttons
```

### ViewModel (familyReducer)

```typescript
type FamilyState = Readonly<{
  loading: boolean
  error: string | null
  members: readonly FamilyMemberModel[]
  lookups: Readonly<{
    parentesco: readonly LookupItem[]
    specificities: readonly LookupItem[]
  }>
  selectedSpecificityId: string | null
  originalSpecificityId: string | null
  saving: boolean
  ageProfile: Readonly<Record<string, number>>
}>

type FamilyAction =
  | Readonly<{ type: "LOAD_SUCCESS"; members: readonly FamilyMemberModel[]; lookups: ...; specificityId: string | null }>
  | Readonly<{ type: "LOAD_FAILURE"; error: string }>
  | Readonly<{ type: "ADD_MEMBER"; member: FamilyMemberModel }>
  | Readonly<{ type: "UPDATE_MEMBER"; index: number; member: FamilyMemberModel }>
  | Readonly<{ type: "REMOVE_MEMBER"; personId: string }>
  | Readonly<{ type: "SET_CAREGIVER"; personId: string }>
  | Readonly<{ type: "TOGGLE_DOCUMENT"; personId: string; doc: string }>
  | Readonly<{ type: "SET_SPECIFICITY"; id: string }>
  | Readonly<{ type: "SAVE_START" }>
  | Readonly<{ type: "SAVE_SUCCESS" }>
  | Readonly<{ type: "SAVE_FAILURE"; error: string }>
```

**canSave:** derived from `selectedSpecificityId !== originalSpecificityId`.
**ageProfile:** recalculated on every ADD_MEMBER/REMOVE_MEMBER (pure function in reducer or validator).

### Family Table

DataTable with columns: Nome, Idade, Sexo, Parentesco, Reside, PcD, Docs, Ações.

- **PR row:** primary@0.05 background, "Referência" badge (green), lock icon in actions
- **Caregiver row:** backgroundDark@0.04 background, "Cuidador" badge (dark blue)
- **Action buttons:** Star (toggle caregiver), Edit (open modal), Remove (open confirm dialog)

### Add/Edit Member Modal

Dark theme (backgroundDark). Contains form fields + relationship selection list. Wide layout: form left, relationship list right. Narrow: stacked.

**Fields:** Nome*, Data Nasc.*, Sexo*, Reside*, PcD*, Cuidador, Documentos, Parentesco*
**On edit:** Nome, Data Nasc., Sexo are disabled (read-only)

### Confirmation Dialogs

- **Remove:** "Remover membro da família?" + warning if caregiver
- **Caregiver switch:** "Trocar cuidador principal?" with current and new names

### Specificities Section

Radio-like selection (custom checkboxes, single selection). Two groups: "Tipo de Família" (4 options) and "Indígena e Outros" (3 options). Some options require a text description field.

### Age Profile Panel

Table with 8 age ranges, count per range. Highlighted rows (primary@0.07) when count > 0. Auto-calculated from members' birth dates.

---

## 4. SHARED DATA

### PatientSummary (list item)

```typescript
type PatientSummary = Readonly<{
  patientId: string
  firstName: string
  lastName: string
  fullName: string
  primaryDiagnosis: string | null
  memberCount: number
}>
```

### PatientDetail (panel)

```typescript
type PatientDetail = Readonly<{
  patientId: string
  personId: string
  personalData: PersonalDataDetail | null
  civilDocuments: CivilDocumentsDetail | null
  address: AddressDetail | null
  familyMembers: readonly FamilyMemberDetail[]
  diagnoses: readonly DiagnosisDetail[]
  // ... all assessment sections (nullable)
}>
```

### Strings (PT-BR)

All UI strings are in Portuguese (Brazilian). Code is in English. Define string constants in each feature's viewmodel types file or a shared constants file. Examples:

```typescript
export const HOME_STRINGS = {
  tabFamilies: "Famílias",
  tabRegistration: "Cadastro",
  familyCounter: (n: number) => `${n} famílias cadastradas`,
  searchPlaceholder: "Pesquisar família...",
  emptyState: "Nenhuma família encontrada",
  newRegistration: "Novo cadastro",
  panelDados: "Dados",
  panelFichas: "Fichas",
  // ... field labels
} as const
```

### API Endpoints (client services call these)

All go through the Hono BFF at same-origin. The BFF proxies to the backend with Bearer token.

| Method | Path | Feature |
|--------|------|---------|
| GET | /api/patients | List patients |
| POST | /api/patients | Register patient |
| GET | /api/patients/:id | Get patient detail |
| POST | /api/patients/:id/family-members | Add family member |
| DELETE | /api/patients/:id/family-members/:mid | Remove member |
| PUT | /api/patients/:id/primary-caregiver | Assign caregiver |
| PUT | /api/patients/:id/social-identity | Update specificity |
| GET | /api/lookups/:tableName | Get lookup table |

### Input Masks

| Field | Pattern | Digits |
|-------|---------|--------|
| CPF | ###.###.###-## | 11 |
| CEP | #####-### | 8 |
| Date | ##/##/#### | 8 |
| Phone | (##) #####-#### | 11 |
| CNS | ### #### #### #### | 15 |

Implement masks as pure formatting functions called onChange. The reducer stores unmasked digits; the component formats for display.

---

## 5. AUTH HUB (Landing + App Selector)

> **Spec completa em pasta dedicada:** `features/auth-hub/`
> Contém 4 documentos: feature-spec, components, states-and-flows, copy-a11y-responsive.
> Protótipo interativo: `prototype-auth-hub.html` (raiz do projeto).

**Route:** `/` (landing), `/hub` (app selector)
**Client App:** `src/client/apps/auth-hub/entry.tsx`

4 telas: Landing (pré-auth), App Hub (seleção de módulos), Auto-Redirect (1 app), Loading (transição).
8 cenários: 4 happy paths (multi-app, admin, single-app, primeiro acesso) + 4 edge cases (sem permissão, erro auth, sessão expirada, erro de rede).

---

## 6. UX IMPROVEMENTS (vs Flutter version)

| Area | Flutter (current) | Hono (improved) |
|------|-------------------|-----------------|
| Loading | CircularProgressIndicator | **Skeleton screens** (better perceived performance) |
| Transitions | AnimatedPositioned (JS-driven) | **CSS transitions** (GPU-accelerated, smoother) |
| Page transitions | Instant (no animation) | **View Transitions API** via startViewTransition |
| Responsive | MediaQuery breakpoints only | **Container queries** for component-level responsiveness |
| Offline | localStorage save/load per step | **Same, but add visual indicator** when offline |
| Keyboard | Escape only | **Arrow keys** for list navigation, **Enter** to select |
| Focus | Default Flutter | **Visible focus rings** for accessibility |
| Form grid | Wrap with fixed calculations | **CSS flex-wrap** with min-width (auto-responsive) |