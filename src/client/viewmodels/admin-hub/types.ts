// Admin Hub — State + Action types

export type AdminTab =
  | "dashboard"
  | "pessoas"
  | "lookups"
  | "solicitacoes"
  | "auditoria";

export type TabLoadState = "idle" | "loading" | "loaded" | "error";

export type PersonSummary = Readonly<{
  id: string;
  name: string;
  cpf: string;
  birthDate: string;
  roles: readonly string[];
  active: boolean;
}>;

export type LookupTableSummary = Readonly<{
  tableName: string;
  entryCount: number;
}>;

export type LookupEntry = Readonly<{
  id: string;
  label: string;
  active: boolean;
}>;

export type LookupRequest = Readonly<{
  id: string;
  tableName: string;
  label: string;
  status: "pendente" | "aprovado" | "rejeitado";
  requestedBy: string;
  reviewedBy: string | null;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
}>;

export type AuditEntry = Readonly<{
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  action: string;
  targetId: string | null;
  details: string | null;
  outcome: "SUCCESS" | "FAILURE";
}>;

export type AdminState = Readonly<{
  activeTab: AdminTab;
  tabStates: Readonly<Record<AdminTab, TabLoadState>>;

  // Dashboard
  stats:
    | Readonly<{
      people: Readonly<{ total: number }>;
      roles: Readonly<{ active: number }>;
      audit: Readonly<{ total: number }>;
      pendingRequests: number;
    }>
    | null;

  // Pessoas
  people: readonly PersonSummary[];
  peopleSearch: string;

  // Lookups
  lookupTables: readonly LookupTableSummary[];
  selectedTable: string | null;
  lookupEntries: readonly LookupEntry[];

  // Solicitacoes
  requests: readonly LookupRequest[];

  // Auditoria
  auditEntries: readonly AuditEntry[];
  auditTotal: number;
  auditOffset: number;

  // UI
  modal: Readonly<{
    type: "approve" | "reject" | null;
    targetId: string | null;
    targetLabel: string | null;
  }>;
  toast:
    | Readonly<{
      type: "success" | "error";
      message: string;
    }>
    | null;
  error:
    | Readonly<{
      title: string;
      message: string;
    }>
    | null;
}>;

export type AdminAction =
  // Navigation
  | Readonly<{ type: "SWITCH_TAB"; tab: AdminTab }>
  // Dashboard
  | Readonly<{ type: "LOAD_DASHBOARD_START" }>
  | Readonly<{
    type: "LOAD_DASHBOARD_SUCCESS";
    stats: AdminState["stats"];
    pendingRequests: readonly LookupRequest[];
    recentAudit: readonly AuditEntry[];
  }>
  | Readonly<{ type: "LOAD_DASHBOARD_FAILURE"; title: string; message: string }>
  // Pessoas
  | Readonly<{ type: "LOAD_PEOPLE_START" }>
  | Readonly<{ type: "LOAD_PEOPLE_SUCCESS"; people: readonly PersonSummary[] }>
  | Readonly<{ type: "LOAD_PEOPLE_FAILURE" }>
  | Readonly<{ type: "SET_PEOPLE_SEARCH"; query: string }>
  // Lookups
  | Readonly<{ type: "LOAD_LOOKUPS_START" }>
  | Readonly<{
    type: "LOAD_LOOKUPS_SUCCESS";
    tables: readonly LookupTableSummary[];
  }>
  | Readonly<{ type: "LOAD_LOOKUPS_FAILURE" }>
  | Readonly<{ type: "SELECT_LOOKUP_TABLE"; tableName: string }>
  | Readonly<{
    type: "LOAD_ENTRIES_SUCCESS";
    entries: readonly LookupEntry[];
  }>
  | Readonly<{
    type: "TOGGLE_ENTRY_SUCCESS";
    entryId: string;
    active: boolean;
  }>
  // Solicitacoes
  | Readonly<{ type: "LOAD_REQUESTS_START" }>
  | Readonly<{
    type: "LOAD_REQUESTS_SUCCESS";
    requests: readonly LookupRequest[];
  }>
  | Readonly<{ type: "LOAD_REQUESTS_FAILURE" }>
  // Audit
  | Readonly<{ type: "LOAD_AUDIT_START" }>
  | Readonly<{
    type: "LOAD_AUDIT_SUCCESS";
    entries: readonly AuditEntry[];
    total: number;
  }>
  | Readonly<{
    type: "LOAD_MORE_AUDIT_SUCCESS";
    entries: readonly AuditEntry[];
    total: number;
  }>
  | Readonly<{ type: "LOAD_AUDIT_FAILURE" }>
  // Modals
  | Readonly<{
    type: "OPEN_MODAL";
    modalType: "approve" | "reject";
    targetId: string;
    targetLabel: string;
  }>
  | Readonly<{ type: "CLOSE_MODAL" }>
  | Readonly<{ type: "APPROVE_SUCCESS"; requestId: string }>
  | Readonly<{ type: "REJECT_SUCCESS"; requestId: string }>
  // Toast
  | Readonly<{ type: "SHOW_TOAST"; toast: AdminState["toast"] }>
  | Readonly<{ type: "HIDE_TOAST" }>;

export const initialState: AdminState = {
  activeTab: "dashboard",
  tabStates: {
    dashboard: "idle",
    pessoas: "idle",
    lookups: "idle",
    solicitacoes: "idle",
    auditoria: "idle",
  },
  stats: null,
  people: [],
  peopleSearch: "",
  lookupTables: [],
  selectedTable: null,
  lookupEntries: [],
  requests: [],
  auditEntries: [],
  auditTotal: 0,
  auditOffset: 0,
  modal: { type: null, targetId: null, targetLabel: null },
  toast: null,
  error: null,
};
