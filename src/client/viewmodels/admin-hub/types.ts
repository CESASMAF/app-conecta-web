// Admin Hub ViewModel — State types, action union, and initial state.
// Pure state management for the 4-tab admin panel.

import type {
  LookupEntry,
  LookupRequest,
} from "../../services/lookup-admin-service.ts";
import type { Person, SystemRole } from "../../services/people-service.ts";

// ---------------------------------------------------------------------------
// Re-exports for convenience (viewmodel consumers import from here)
// ---------------------------------------------------------------------------

export type { LookupEntry, LookupRequest, Person, SystemRole };

// ---------------------------------------------------------------------------
// Tab Navigation
// ---------------------------------------------------------------------------

export type AdminTab =
  | "dashboard"
  | "pessoas"
  | "lookups"
  | "solicitacoes";

// ---------------------------------------------------------------------------
// Per-tab loading state
// ---------------------------------------------------------------------------

export type AdminLoadingState = "idle" | "loading" | "loaded" | "error";

// ---------------------------------------------------------------------------
// Dashboard Stats (from GET /api/admin/stats)
// ---------------------------------------------------------------------------

export type DashboardStats = Readonly<{
  totalPeople: number;
  activeRoles: number;
  pendingRequests: number;
  recentAuditCount: number;
  health?: "ok" | "partial";
}>;

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------

export type ToastVariant = "success" | "error" | "info";

export type Toast = Readonly<{
  id: string;
  variant: ToastVariant;
  message: string;
}>;

// ---------------------------------------------------------------------------
// State — one top-level Readonly struct
// ---------------------------------------------------------------------------

export type AdminState = Readonly<{
  // Navigation
  activeTab: AdminTab;

  // Dashboard
  dashboardStatus: AdminLoadingState;
  dashboardError: string | null;
  stats: DashboardStats | null;

  // Pessoas
  peopleStatus: AdminLoadingState;
  peopleError: string | null;
  people: readonly Person[];

  // Lookups
  lookupsStatus: AdminLoadingState;
  lookupsError: string | null;
  selectedTable: string | null;
  lookupEntries: readonly LookupEntry[];

  // Solicitacoes (Lookup Requests)
  requestsStatus: AdminLoadingState;
  requestsError: string | null;
  requests: readonly LookupRequest[];

  // Toast notifications
  toasts: readonly Toast[];
}>;

// ---------------------------------------------------------------------------
// Action — discriminated union
// ---------------------------------------------------------------------------

export type AdminAction =
  // Navigation
  | Readonly<{ type: "SET_TAB"; tab: AdminTab }>
  // Dashboard
  | Readonly<{ type: "LOAD_STATS_START" }>
  | Readonly<{ type: "LOAD_STATS_SUCCESS"; stats: DashboardStats }>
  | Readonly<{ type: "LOAD_STATS_FAILURE"; error: string }>
  // People
  | Readonly<{ type: "LOAD_PEOPLE_START" }>
  | Readonly<{ type: "LOAD_PEOPLE_SUCCESS"; people: readonly Person[] }>
  | Readonly<{ type: "LOAD_PEOPLE_FAILURE"; error: string }>
  | Readonly<{ type: "CREATE_PERSON_SUCCESS"; person: Person }>
  | Readonly<{ type: "UPDATE_PERSON_SUCCESS"; person: Person }>
  // Lookups
  | Readonly<{ type: "LOAD_LOOKUPS_START" }>
  | Readonly<{ type: "LOAD_LOOKUPS_SUCCESS"; entries: readonly LookupEntry[] }>
  | Readonly<{ type: "LOAD_LOOKUPS_FAILURE"; error: string }>
  | Readonly<{ type: "SELECT_TABLE"; tableName: string }>
  | Readonly<{ type: "TOGGLE_ENTRY_SUCCESS"; entry: LookupEntry }>
  // Requests
  | Readonly<{ type: "LOAD_REQUESTS_START" }>
  | Readonly<
    { type: "LOAD_REQUESTS_SUCCESS"; requests: readonly LookupRequest[] }
  >
  | Readonly<{ type: "LOAD_REQUESTS_FAILURE"; error: string }>
  | Readonly<{ type: "APPROVE_REQUEST_SUCCESS"; request: LookupRequest }>
  | Readonly<{ type: "REJECT_REQUEST_SUCCESS"; request: LookupRequest }>
  // Toast
  | Readonly<{ type: "SHOW_TOAST"; toast: Toast }>
  | Readonly<{ type: "DISMISS_TOAST"; toastId: string }>;

// ---------------------------------------------------------------------------
// Initial State
// ---------------------------------------------------------------------------

export const initialState: AdminState = {
  activeTab: "dashboard",

  dashboardStatus: "idle",
  dashboardError: null,
  stats: null,

  peopleStatus: "idle",
  peopleError: null,
  people: [],

  lookupsStatus: "idle",
  lookupsError: null,
  selectedTable: null,
  lookupEntries: [],

  requestsStatus: "idle",
  requestsError: null,
  requests: [],

  toasts: [],
};
