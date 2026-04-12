# Patient Registration — Feature Spec

> Documento principal da feature. Define o fluxo, layout, ViewModel e tipos.
> Leia `design-tokens.md` e `components-catalog.md` antes.
> Design System: **Sage Garden** (ver `2026-04-11-redesign-sage-garden-design.md`)

## Fluxo de Decisão (Wizard Progression)

```
Usuário acessa /patient-registration
  ├── Tem sessão válida?
  │   ├── NÃO → authGuard redireciona para / (landing)
  │   └── SIM → Renderiza wizard shell (SSR) + hydrate client app
  │
  ├── Existe draft em localStorage?
  │   ├── SIM → loadDraft() → restaura state (step + todos os campos)
  │   └── NÃO → initialState (step 0, campos vazios)
  │
  ├── Navega pelo wizard:
  │   Step 0: Dados Pessoais → NEXT → validateStep0()
  │   Step 1: Documentos     → NEXT → validateStep1() [CD-001]
  │   Step 2: Endereço        → NEXT → validateStep2() [CEP-003/004, ADDR-002/004]
  │   Step 3: Diagnósticos    → NEXT → validateStep3() [PAT-001, ICD-001, DIA-001/003]
  │   Step 4: Família          → NEXT → (opcional, passa direto)
  │   Step 5: Especificidades → NEXT → (opcional, passa direto)
  │   Step 6: Ingresso         → SUBMIT → validateStep6() [ING-001]
  │
  ├── Submit:
  │   ├── Validação passa → POST /api/v1/patients
  │   │   ├── Sucesso → Success Overlay + clearDraft()
  │   │   └── Falha → Error Banner + manter state
  │   └── Validação falha → scroll to first error, stay on step
  │
  └── Navegação lateral:
      ├── ← Voltar para Famílias → navigate to /social-care
      ├── ← Anterior → prevStep()
      └── Stepper dots → goToStep(n) (navegação direta)
```

Decisões-chave:
- **Draft persistence** é client-side (localStorage) — salva a cada dispatch
- **Validação é step-by-step** — não pode avançar sem passar
- **Steps opcionais (4, 5)** passam direto sem validação
- **Location type gate (Step 2)** — campos condicionais baseados em Urbano/Rural/Rua
- **Diagnosis completeness** — feedback visual em tempo real (PENDENTE/COMPLETO)
- **Family documents** — toggle chips renderizam/destroem seções de form dinamicamente

---

## Page Structure

```
RegistrationPage (orchestrator, ~100 lines)
├── useReducer(wizardReducer, loadDraft() ?? initialState)
├── useEffect: saveDraft on every state change (debounced)
├── useEffect: keyboard listener (Escape → confirm leave?)
│
├── Sidebar                       — 64px icon bar, expands on hover
├── MainContent
│   ├── WizardTopBar              — back link + "Rascunho salvo automaticamente"
│   ├── WizardStepper             — progress bar + dots + labels
│   ├── StepperMobile             — "Etapa X de 7" (mobile only)
│   ├── StepContent (glass card)
│   │   ├── StepHeader            — number, title, description
│   │   ├── [step === 0] StepPersonalData
│   │   ├── [step === 1] StepDocuments
│   │   ├── [step === 2] StepAddress
│   │   ├── [step === 3] StepDiagnosis
│   │   ├── [step === 4] StepFamily
│   │   ├── [step === 5] StepSpecificity
│   │   ├── [step === 6] StepIngress
│   │   └── ButtonBar             — Back + Next/Submit
│   └── SuccessOverlay            — glass container + spring animation
```

O Page é um orchestrator puro: lê state, despacha actions, renderiza o step correto. Nenhum fetch direto — tudo via service injetado.

---

## ViewModel (wizardReducer)

```typescript
// src/client/viewmodels/registration/types.ts

type WizardStep = 0 | 1 | 2 | 3 | 4 | 5 | 6

type LocationType = 'URBANO' | 'RURAL' | 'RUA'

type DiagnosisEntry = Readonly<{
  code: string           // ICD-10 code (e.g., "G80", "F84.0")
  date: string           // DD/MM/YYYY
  description: string
  quickCidId: string | null  // which quick-select chip was used
}>

type FamilyMemberDocument = Readonly<{
  type: 'cpf' | 'rg' | 'cn' | 'cns' | 'te' | 'ctps'
  fields: Readonly<Record<string, string>>
}>

type FamilyMemberSnapshot = Readonly<{
  name: string
  birthDate: string
  sex: string
  relationship: string         // UPPER_SNAKE_CASE from parentesco lookup
  relationshipLabel: string    // display label
  livesWithPatient: boolean
  hasDisability: boolean
  documents: readonly FamilyMemberDocument[]
}>

type WizardState = Readonly<{
  currentStep: WizardStep
  showErrors: boolean
  saving: boolean
  saveResult: Readonly<{ ok: boolean; message: string }> | null

  // Step 0: Dados Pessoais
  fields: Readonly<{
    firstName: string
    lastName: string
    socialName: string
    motherName: string
    birthDate: string          // DD/MM/YYYY
    nationality: string
    sex: string                // "Masculino" | "Feminino" | "Outro"
    phoneNumber: string
  }>

  // Step 1: Documentos
  documents: Readonly<{
    cpf: string
    nis: string
    cnsNumber: string
    rgNumber: string
    rgUf: string
    rgAgency: string
    rgDate: string
  }>

  // Step 2: Endereço
  address: Readonly<{
    locationType: LocationType | null
    housingType: string
    cep: string
    street: string
    number: string
    complement: string
    neighborhood: string
    state: string              // 2-letter UF
    city: string
    isShelter: boolean
  }>

  // Step 3: Diagnósticos
  diagnoses: readonly DiagnosisEntry[]

  // Step 4: Família
  familyMembers: readonly FamilyMemberSnapshot[]

  // Step 5: Especificidades
  specificity: Readonly<{
    identity: string
    description: string
    observations: string
  }>

  // Step 6: Ingresso
  intake: Readonly<{
    ingressType: string
    originName: string
    originContact: string
    serviceReason: string
    selectedPrograms: readonly string[]
    observation: string
  }>

  errors: ReadonlyMap<string, string>
}>
```

### Actions

```typescript
// src/client/viewmodels/registration/types.ts

type WizardAction =
  // Navigation
  | Readonly<{ type: 'NEXT_STEP' }>
  | Readonly<{ type: 'PREV_STEP' }>
  | Readonly<{ type: 'GO_TO_STEP'; step: WizardStep }>

  // Field updates (generic across sections)
  | Readonly<{ type: 'UPDATE_FIELD'; section: 'fields' | 'documents' | 'address' | 'specificity' | 'intake'; field: string; value: string }>
  | Readonly<{ type: 'UPDATE_CHECKBOX'; section: 'address'; field: string; value: boolean }>

  // Step 2: Address
  | Readonly<{ type: 'SET_LOCATION_TYPE'; locationType: LocationType }>
  | Readonly<{ type: 'SELECT_CARD'; section: string; field: string; value: string }>

  // Step 3: Diagnoses
  | Readonly<{ type: 'ADD_DIAGNOSIS' }>
  | Readonly<{ type: 'REMOVE_DIAGNOSIS'; index: number }>
  | Readonly<{ type: 'UPDATE_DIAGNOSIS'; index: number; field: keyof DiagnosisEntry; value: string }>
  | Readonly<{ type: 'APPLY_QUICK_CID'; index: number; code: string; description: string }>

  // Step 4: Family
  | Readonly<{ type: 'ADD_FAMILY_MEMBER'; member: FamilyMemberSnapshot }>
  | Readonly<{ type: 'UPDATE_FAMILY_MEMBER'; index: number; member: FamilyMemberSnapshot }>
  | Readonly<{ type: 'REMOVE_FAMILY_MEMBER'; index: number }>

  // Step 6: Ingress
  | Readonly<{ type: 'TOGGLE_PROGRAM'; programId: string }>

  // Validation
  | Readonly<{ type: 'SET_ERRORS'; errors: ReadonlyMap<string, string> }>
  | Readonly<{ type: 'CLEAR_ERRORS' }>

  // Submit
  | Readonly<{ type: 'SAVE_START' }>
  | Readonly<{ type: 'SAVE_SUCCESS'; message: string }>
  | Readonly<{ type: 'SAVE_FAILURE'; message: string }>

  // Draft
  | Readonly<{ type: 'LOAD_DRAFT'; state: WizardState }>
  | Readonly<{ type: 'RESET' }>
```

### Reducer (esqueleto)

```typescript
// src/client/viewmodels/registration/reducer.ts

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'NEXT_STEP': {
      if (state.currentStep >= 6) return state
      return { ...state, currentStep: (state.currentStep + 1) as WizardStep, showErrors: false, errors: new Map() }
    }

    case 'PREV_STEP': {
      if (state.currentStep <= 0) return state
      return { ...state, currentStep: (state.currentStep - 1) as WizardStep, showErrors: false, errors: new Map() }
    }

    case 'GO_TO_STEP':
      return { ...state, currentStep: action.step, showErrors: false, errors: new Map() }

    case 'UPDATE_FIELD':
      return { ...state, [action.section]: { ...state[action.section], [action.field]: action.value } }

    case 'SET_LOCATION_TYPE': {
      const resetAddress = action.locationType === 'RUA'
        ? { ...state.address, locationType: action.locationType, street: '', complement: '', neighborhood: '', cep: '', housingType: '', isShelter: false }
        : action.locationType === 'RURAL'
        ? { ...state.address, locationType: action.locationType, street: '', complement: '' }
        : { ...state.address, locationType: action.locationType }
      return { ...state, address: resetAddress }
    }

    case 'ADD_DIAGNOSIS':
      return { ...state, diagnoses: [...state.diagnoses, { code: '', date: '', description: '', quickCidId: null }] }

    case 'REMOVE_DIAGNOSIS':
      return { ...state, diagnoses: state.diagnoses.filter((_, i) => i !== action.index) }

    case 'UPDATE_DIAGNOSIS':
      return {
        ...state,
        diagnoses: state.diagnoses.map((d, i) =>
          i === action.index ? { ...d, [action.field]: action.value } : d
        ),
      }

    case 'APPLY_QUICK_CID':
      return {
        ...state,
        diagnoses: state.diagnoses.map((d, i) =>
          i === action.index ? { ...d, code: action.code, description: action.description, quickCidId: action.code } : d
        ),
      }

    case 'ADD_FAMILY_MEMBER':
      return { ...state, familyMembers: [...state.familyMembers, action.member] }

    case 'REMOVE_FAMILY_MEMBER':
      return { ...state, familyMembers: state.familyMembers.filter((_, i) => i !== action.index) }

    case 'TOGGLE_PROGRAM': {
      const progs = state.intake.selectedPrograms
      const next = progs.includes(action.programId)
        ? progs.filter(p => p !== action.programId)
        : [...progs, action.programId]
      return { ...state, intake: { ...state.intake, selectedPrograms: next } }
    }

    case 'SET_ERRORS':
      return { ...state, errors: action.errors, showErrors: true }

    case 'CLEAR_ERRORS':
      return { ...state, errors: new Map(), showErrors: false }

    case 'SAVE_START':
      return { ...state, saving: true, saveResult: null }

    case 'SAVE_SUCCESS':
      return { ...state, saving: false, saveResult: { ok: true, message: action.message } }

    case 'SAVE_FAILURE':
      return { ...state, saving: false, saveResult: { ok: false, message: action.message } }

    case 'LOAD_DRAFT':
      return action.state

    case 'RESET':
      return initialState

    default:
      return state
  }
}
```

### Initial State

```typescript
const initialState: WizardState = {
  currentStep: 0,
  showErrors: false,
  saving: false,
  saveResult: null,
  fields: {
    firstName: '', lastName: '', socialName: '', motherName: '',
    birthDate: '', nationality: '', sex: '', phoneNumber: '',
  },
  documents: {
    cpf: '', nis: '', cnsNumber: '',
    rgNumber: '', rgUf: '', rgAgency: '', rgDate: '',
  },
  address: {
    locationType: null, housingType: '', cep: '', street: '', number: '',
    complement: '', neighborhood: '', state: '', city: '', isShelter: false,
  },
  diagnoses: [{ code: '', date: '', description: '', quickCidId: null }],
  familyMembers: [],
  specificity: { identity: '', description: '', observations: '' },
  intake: {
    ingressType: '', originName: '', originContact: '',
    serviceReason: '', selectedPrograms: [], observation: '',
  },
  errors: new Map(),
}
```

---

## Data Models

### Parentesco Lookup (from backend)

```typescript
type ParentescoLookup = Readonly<{
  codigo: string      // UPPER_SNAKE_CASE: "CONJUGE", "FILHO", "MAE", etc.
  descricao: string   // Display: "Conjuge / Companheiro(a)"
}>

const PARENTESCO_OPTIONS: readonly ParentescoLookup[] = [
  { codigo: "CONJUGE", descricao: "Conjuge / Companheiro(a)" },
  { codigo: "FILHO", descricao: "Filho(a)" },
  { codigo: "ENTEADO", descricao: "Enteado(a)" },
  { codigo: "PAI", descricao: "Pai" },
  { codigo: "MAE", descricao: "Mae" },
  { codigo: "AVO", descricao: "Avo / Avo" },
  { codigo: "NETO", descricao: "Neto(a)" },
  { codigo: "IRMAO", descricao: "Irmao / Irma" },
  { codigo: "TIO", descricao: "Tio(a)" },
  { codigo: "SOBRINHO", descricao: "Sobrinho(a)" },
  { codigo: "PRIMO", descricao: "Primo(a)" },
  { codigo: "OUTRO_PARENTE", descricao: "Outro Parente" },
  { codigo: "NAO_PARENTE", descricao: "Nao Parente" },
]
```

### Quick CID Options (ICD-10)

```typescript
type QuickCID = Readonly<{
  code: string
  description: string
}>

const QUICK_CIDS: readonly QuickCID[] = [
  { code: "G80", description: "Paralisia cerebral" },
  { code: "Q90", description: "Sindrome de Down" },
  { code: "F84.0", description: "Autismo infantil" },
  { code: "E70", description: "Fenilcetonuria" },
  { code: "G71.0", description: "Distrofia muscular" },
  { code: "R69", description: "Causas de morbidade desconhecidas e nao especificadas" },
  { code: "Z03", description: "Observacao e avaliacao medica por suspeita de doencas e afeccoes" },
  { code: "Z03.9", description: "Observacao nao especificada" },
]
```

### Social Programs

```typescript
const SOCIAL_PROGRAMS: readonly string[] = [
  "BPC (Beneficio de Prestacao Continuada)",
  "Bolsa Familia",
  "Auxilio Brasil",
  "PETI",
  "Outros programas",
]
```

---

## API Contract

### POST /api/v1/patients

Payload construído a partir do wizard state no submit. Todos os campos passam por validação de domínio (smart constructors) no BFF antes de proxiar ao backend.

```typescript
type RegisterPatientRequest = Readonly<{
  personalData: Readonly<{
    firstName: string
    lastName: string
    socialName: string | null
    motherName: string
    birthDate: string          // ISO 8601
    nationality: string
    sex: string
    phoneNumber: string | null
  }>
  civilDocuments: Readonly<{
    cpf: string | null
    nis: string | null
    cnsNumber: string | null
    rg: Readonly<{
      number: string
      uf: string
      agency: string
      issueDate: string        // ISO 8601
    }> | null
  }>
  address: Readonly<{
    locationType: 'URBANO' | 'RURAL' | 'RUA'
    housingType: string | null
    cep: string | null
    street: string | null
    number: string | null
    complement: string | null
    neighborhood: string | null
    state: string
    city: string
    isShelter: boolean
  }>
  diagnoses: readonly Readonly<{
    icdCode: string
    date: string               // ISO 8601
    description: string
  }>[]
  familyMembers: readonly Readonly<{
    name: string
    birthDate: string | null
    sex: string | null
    relationship: string
    livesWithPatient: boolean
    hasDisability: boolean
    documents: readonly Readonly<{
      type: string
      fields: Readonly<Record<string, string>>
    }>[]
  }>[]
  socialIdentity: Readonly<{
    identity: string | null
    description: string | null
    observations: string | null
  }> | null
  intakeInfo: Readonly<{
    ingressType: string
    originName: string | null
    originContact: string | null
    serviceReason: string
    linkedSocialPrograms: readonly Readonly<{
      programId: string
      observation: string | null
    }>[]
  }>
}>
```

### Response

```typescript
type RegisterPatientResponse = Readonly<{
  patientId: string      // UUID
  personId: string       // UUID
  createdAt: string      // ISO 8601
}>
```

---

## Segurança

- Página requer **sessão válida** (authGuard middleware no BFF)
- **Draft em localStorage** — NÃO contém dados sensíveis (CPF/RG são armazenados como masked strings)
- **Validação de domínio no BFF** — smart constructors validam TODOS os campos antes de proxiar
- **X-Requested-With: XMLHttpRequest** obrigatório no POST
- **Cookie:** `__Host-session` (HttpOnly, Secure, SameSite=Strict)
- **CSP nonce** no SSR shell
- **Sec-Fetch-Site** validado no proxy

---

## Rotas do BFF

```typescript
// src/routes/pages.tsx (SSR)
app.get('/patient-registration', authGuard, registrationPage)

// src/routes/api.ts (proxy)
app.post('/api/v1/patients', authGuard, csrfCheck, fetchMetadata, patientCreateProxy)

// src/routes/api.ts (lookups)
app.get('/api/v1/lookups/:tableName', authGuard, lookupProxy)
```

---

## Entry Points (client)

```
src/client/apps/
  registration/
    entry.tsx          <- hydration do wizard (SSR shell + client interactivity)
```

O SSR renderiza o shell (sidebar, topbar, wizard container vazio). O client app hydrates com o wizard completo (stepper + steps + validation + persistence).

---

## Input Masks (pure formatting functions)

| Campo | Máscara | Dígitos | Função |
|-------|---------|---------|--------|
| CPF | ###.###.###-## | 11 | maskCPF |
| CNS | ### #### #### #### | 15 | maskCNS |
| NIS | ########### | 11 | maskDigitsOnly(11) |
| CEP | #####-### | 8 | maskCEP |
| Data | ##/##/#### | 8 | maskDateInput |
| Telefone | (##) #####-#### | 11 | maskPhone |
| RG | ##.###.###-#X | 10 | maskRG |
| UF | XX | 2 | maskUF |
| CN (nascimento) | ###### ## ## #### # ##### ### ####### ## | 32 | maskCN |
| TE (eleitor) | #### #### #### | 12 | maskTE |
| CTPS | ####### | 7 | maskDigitsOnly(7) |
| CTPS Série | #### | 4 | maskDigitsOnly(4) |

Todas as máscaras são **pure functions** chamadas no `oninput`. O reducer armazena **valores não-mascarados**; o componente formata para display.
