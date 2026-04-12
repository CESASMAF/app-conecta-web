// Registration Wizard — State Types & Actions
// 7-step patient registration form

// --- Location Type (gate pattern for address section) ---
export type LocationType = "URBANO" | "RURAL" | "RUA";

// --- Family Member Document (multi-document support) ---
export type FamilyMemberDocument = Readonly<{
  type: "cpf" | "rg" | "cn" | "cns" | "te" | "ctps";
  fields: Readonly<Record<string, string>>;
}>;

export type DiagnosisEntry = Readonly<{
  code: string;
  date: string;
  description: string;
  // Tracks which quick-select chip was used (null = manual entry)
  quickCidId?: string | null;
}>;

export type FamilyMemberSnapshot = Readonly<{
  name: string;
  birthDate: string;
  relationship: string;
  // Display label from parentesco lookup
  relationshipLabel?: string;
  livesWithPatient: boolean;
  // Kept for backward compat with existing views/tests
  isDisabled: boolean;
  // Sage Garden redesign field — alias of isDisabled
  hasDisability?: boolean;
  // BFF-aligned field (preferred); falls back to gender
  sex?: string;
  // Deprecated alias — use sex instead
  gender: string;
  // Multi-document support
  documents?: readonly FamilyMemberDocument[];
}>;

export type WizardState = Readonly<{
  currentStep: number; // 0-6
  showErrors: boolean;
  saving: boolean;
  saveResult: Readonly<{ ok: boolean; message: string }> | null;

  // Step 0: Dados Pessoais
  fields: Readonly<{
    firstName: string;
    lastName: string;
    socialName: string;
    motherName: string;
    nationality: string;
    sex: string;
    phone: string;
    birthDate: string;
    // Deprecated aliases — kept for backward compat with existing tests
    gender: string;
    phoneNumber: string;
  }>;
  // Step 1: Documentos
  documents: Readonly<{
    cpf: string;
    nis: string;
    cnsNumber: string;
    rgNumber: string;
    rgUf: string;
    rgAgency: string;
    rgDate: string;
    // Deprecated: birthDate moved to fields (Step 0) — kept for backward compat
    birthDate: string;
  }>;
  // Step 2: Endereço
  address: Readonly<{
    locationType: LocationType | null; // Gate pattern (URBANO | RURAL | RUA)
    housingSituation: string; // Kept for backward compat
    residenceLocation: string; // Deprecated — now derived from locationType
    isShelter: boolean; // Kept for backward compat
    isHomeless: boolean; // Deprecated — derived from locationType === 'RUA'
    cep: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    state: string;
    city: string;
  }>;
  // Step 3: Diagnósticos
  diagnoses: readonly DiagnosisEntry[];
  // Step 4: Família
  familyMembers: readonly FamilyMemberSnapshot[];
  // Step 5: Especificidades
  specificity: Readonly<{
    selectedIdentity: string;
    description: string;
  }>;
  // Step 6: Ingresso
  intake: Readonly<{
    ingressType: string;
    originName: string;
    originContact: string;
    serviceReason: string;
    selectedPrograms: readonly string[];
    observation: string;
  }>;

  errors: ReadonlyMap<string, string>;
}>;

export type WizardAction =
  | Readonly<
    { type: "UPDATE_FIELD"; section: string; field: string; value: string }
  >
  | Readonly<{ type: "NEXT_STEP" }>
  | Readonly<{ type: "PREV_STEP" }>
  | Readonly<{ type: "ADD_DIAGNOSIS" }>
  | Readonly<{ type: "REMOVE_DIAGNOSIS"; index: number }>
  | Readonly<
    {
      type: "UPDATE_DIAGNOSIS_FIELD";
      index: number;
      field: keyof DiagnosisEntry;
      value: string;
    }
  >
  | Readonly<
    {
      type: "APPLY_QUICK_CID";
      index: number;
      code: string;
      description: string;
    }
  >
  | Readonly<{ type: "ADD_FAMILY_MEMBER"; member: FamilyMemberSnapshot }>
  | Readonly<
    {
      type: "UPDATE_FAMILY_MEMBER";
      index: number;
      member: FamilyMemberSnapshot;
    }
  >
  | Readonly<{ type: "REMOVE_FAMILY_MEMBER"; index: number }>
  | Readonly<{ type: "TOGGLE_ADDRESS_FLAG"; field: "isShelter" | "isHomeless" }>
  | Readonly<{ type: "TOGGLE_PROGRAM"; programId: string }>
  | Readonly<{ type: "SAVE_START" }>
  | Readonly<{ type: "SAVE_SUCCESS"; message: string }>
  | Readonly<{ type: "SAVE_FAILURE"; message: string }>
  // Sage Garden redesign actions
  | Readonly<{ type: "SET_LOCATION_TYPE"; locationType: LocationType }>
  | Readonly<{ type: "GO_TO_STEP"; step: number }>
  | Readonly<{ type: "SET_ERRORS"; errors: ReadonlyMap<string, string> }>
  | Readonly<{ type: "CLEAR_ERRORS" }>
  | Readonly<{ type: "LOAD_DRAFT"; state: WizardState }>
  | Readonly<{ type: "RESET" }>;

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
    sex: "",
    phone: "",
    birthDate: "",
    // Deprecated aliases
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
    locationType: null,
    housingSituation: "",
    residenceLocation: "",
    isShelter: false,
    isHomeless: false,
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
};
