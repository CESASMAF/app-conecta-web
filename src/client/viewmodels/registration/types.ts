// Registration Wizard — State Types & Actions
// 7-step patient registration form

export type DiagnosisEntry = Readonly<{
  code: string
  date: string
  description: string
}>

export type FamilyMemberSnapshot = Readonly<{
  name: string
  birthDate: string
  gender: string
  relationship: string
  livesWithPatient: boolean
  isDisabled: boolean
}>

export type WizardState = Readonly<{
  currentStep: number // 0-6
  showErrors: boolean
  saving: boolean
  saveResult: Readonly<{ ok: boolean; message: string }> | null

  // Step 0: Dados Pessoais
  fields: Readonly<{
    firstName: string
    lastName: string
    socialName: string
    motherName: string
    nationality: string
    gender: string
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
    birthDate: string
  }>
  // Step 2: Endereço
  address: Readonly<{
    housingSituation: string
    residenceLocation: string
    cep: string
    street: string
    number: string
    complement: string
    neighborhood: string
    state: string
    city: string
  }>
  // Step 3: Diagnósticos
  diagnoses: readonly DiagnosisEntry[]
  // Step 4: Família
  familyMembers: readonly FamilyMemberSnapshot[]
  // Step 5: Especificidades
  specificity: Readonly<{
    selectedIdentity: string
    description: string
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

export type WizardAction =
  | Readonly<{ type: "UPDATE_FIELD"; section: string; field: string; value: string }>
  | Readonly<{ type: "NEXT_STEP" }>
  | Readonly<{ type: "PREV_STEP" }>
  | Readonly<{ type: "ADD_DIAGNOSIS" }>
  | Readonly<{ type: "REMOVE_DIAGNOSIS"; index: number }>
  | Readonly<{ type: "UPDATE_DIAGNOSIS_FIELD"; index: number; field: keyof DiagnosisEntry; value: string }>
  | Readonly<{ type: "APPLY_QUICK_CID"; index: number; code: string; description: string }>
  | Readonly<{ type: "ADD_FAMILY_MEMBER"; member: FamilyMemberSnapshot }>
  | Readonly<{ type: "UPDATE_FAMILY_MEMBER"; index: number; member: FamilyMemberSnapshot }>
  | Readonly<{ type: "REMOVE_FAMILY_MEMBER"; index: number }>
  | Readonly<{ type: "TOGGLE_PROGRAM"; programId: string }>
  | Readonly<{ type: "SAVE_START" }>
  | Readonly<{ type: "SAVE_SUCCESS"; message: string }>
  | Readonly<{ type: "SAVE_FAILURE"; message: string }>

export const initialState: WizardState = {
  currentStep: 0,
  showErrors: false,
  saving: false,
  saveResult: null,
  fields: {
    firstName: "",
    lastName: "",
    socialName: "",
    motherName: "",
    nationality: "",
    gender: "",
    phoneNumber: "",
  },
  documents: {
    cpf: "",
    nis: "",
    cnsNumber: "",
    rgNumber: "",
    rgUf: "",
    rgAgency: "",
    rgDate: "",
    birthDate: "",
  },
  address: {
    housingSituation: "",
    residenceLocation: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    state: "",
    city: "",
  },
  diagnoses: [],
  familyMembers: [],
  specificity: {
    selectedIdentity: "",
    description: "",
  },
  intake: {
    ingressType: "",
    originName: "",
    originContact: "",
    serviceReason: "",
    selectedPrograms: [],
    observation: "",
  },
  errors: new Map(),
}
