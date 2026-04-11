// Family Composition — State + Action types

export type LookupItem = Readonly<{
  id: string;
  codigo: string;
  descricao: string;
  ativo: boolean;
}>;

export type FamilyMemberModel = Readonly<{
  personId: string;
  name: string;
  birthDate: string;
  sex: string;
  relationshipId: string;
  relationshipLabel: string;
  residesWithPatient: boolean;
  hasDisability: boolean;
  isPrimaryCaregiver: boolean;
  isPR: boolean;
  requiredDocuments: readonly string[];
}>;

export type FamilyState = Readonly<{
  loading: boolean;
  error: string | null;
  members: readonly FamilyMemberModel[];
  lookups: Readonly<{
    parentesco: readonly LookupItem[];
    specificities: readonly LookupItem[];
  }>;
  selectedSpecificityId: string | null;
  originalSpecificityId: string | null;
  saving: boolean;
  ageProfile: Readonly<Record<string, number>>;
}>;

export type FamilyAction =
  | Readonly<{ type: "LOAD_START" }>
  | Readonly<{
      type: "LOAD_SUCCESS";
      members: readonly FamilyMemberModel[];
      lookups: FamilyState["lookups"];
      specificityId: string | null;
    }>
  | Readonly<{ type: "LOAD_FAILURE"; error: string }>
  | Readonly<{ type: "ADD_MEMBER"; member: FamilyMemberModel }>
  | Readonly<{ type: "UPDATE_MEMBER"; index: number; member: FamilyMemberModel }>
  | Readonly<{ type: "REMOVE_MEMBER"; personId: string }>
  | Readonly<{ type: "SET_CAREGIVER"; personId: string }>
  | Readonly<{ type: "TOGGLE_DOCUMENT"; personId: string; doc: string }>
  | Readonly<{ type: "SET_SPECIFICITY"; id: string }>
  | Readonly<{ type: "SAVE_START" }>
  | Readonly<{ type: "SAVE_SUCCESS" }>
  | Readonly<{ type: "SAVE_FAILURE"; error: string }>;

export const AGE_BUCKETS = [
  "0-5",
  "6-11",
  "12-17",
  "18-24",
  "25-34",
  "35-44",
  "45-59",
  "60+",
] as const;

export type AgeBucket = (typeof AGE_BUCKETS)[number];

export const initialState: FamilyState = {
  loading: false,
  error: null,
  members: [],
  lookups: {
    parentesco: [],
    specificities: [],
  },
  selectedSpecificityId: null,
  originalSpecificityId: null,
  saving: false,
  ageProfile: {
    "0-5": 0,
    "6-11": 0,
    "12-17": 0,
    "18-24": 0,
    "25-34": 0,
    "35-44": 0,
    "45-59": 0,
    "60+": 0,
  },
};
