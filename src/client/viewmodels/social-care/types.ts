// Social Care Home — State + Action types

export type PanelView = "dados" | "fichas";

export type PatientSummary = Readonly<{
  patientId: string;
  personId: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  primaryDiagnosis: string | null;
  memberCount: number;
}>;

export type PersonalDataDetail = Readonly<{
  firstName: string;
  lastName: string;
  motherName: string;
  nationality: string;
  sex: string;
  birthDate: string;
  phone: string | null;
  socialName: string | null;
}>;

export type CivilDocumentsDetail = Readonly<{
  cpf: string | null;
  nis: string | null;
}>;

export type AddressDetail = Readonly<{
  street: string | null;
  city: string | null;
  state: string | null;
  cep: string | null;
}>;

export type DiagnosisDetail = Readonly<{
  icdCode: string;
  description: string;
  date: string;
}>;

export type FamilyMemberDetail = Readonly<{
  personId: string;
  relationship: string;
  birthDate: string;
}>;

export type PatientDetail = Readonly<{
  patientId: string;
  personId: string;
  personalData: PersonalDataDetail | null;
  civilDocuments: CivilDocumentsDetail | null;
  address: AddressDetail | null;
  diagnoses: readonly DiagnosisDetail[];
  familyMembers: readonly FamilyMemberDetail[];
}>;

export type FichaStatus = Readonly<{
  name: string;
  filled: boolean;
  route: string | null;
}>;

export type SocialCareState = Readonly<{
  families: readonly PatientSummary[];
  searchQuery: string;
  selectedPatientId: string | null;
  panelVisible: boolean;
  panelView: PanelView;
  patientDetail: PatientDetail | null;
  fichas: readonly FichaStatus[];
  loading: boolean;
  detailLoading: boolean;
  activeTab: "familias" | "cadastro";
}>;

export type SocialCareAction =
  | Readonly<{ type: "LOAD_START" }>
  | Readonly<{ type: "LOAD_SUCCESS"; families: readonly PatientSummary[] }>
  | Readonly<{ type: "LOAD_FAILURE" }>
  | Readonly<{ type: "SET_SEARCH"; query: string }>
  | Readonly<{ type: "SELECT_PATIENT"; id: string }>
  | Readonly<{ type: "DETAIL_START" }>
  | Readonly<{ type: "DETAIL_SUCCESS"; detail: PatientDetail; fichas: readonly FichaStatus[] }>
  | Readonly<{ type: "DETAIL_FAILURE" }>
  | Readonly<{ type: "CLOSE_PANEL" }>
  | Readonly<{ type: "SHOW_FICHAS" }>
  | Readonly<{ type: "SHOW_DADOS" }>
  | Readonly<{ type: "SET_TAB"; tab: "familias" | "cadastro" }>;

export const initialState: SocialCareState = {
  families: [],
  searchQuery: "",
  selectedPatientId: null,
  panelVisible: false,
  panelView: "dados",
  patientDetail: null,
  fichas: [],
  loading: false,
  detailLoading: false,
  activeTab: "familias",
};
