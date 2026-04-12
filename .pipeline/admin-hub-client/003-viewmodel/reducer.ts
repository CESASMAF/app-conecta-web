// Admin Hub — Pure reducer + derived state helpers

import type {
  AdminAction,
  AdminState,
  AdminTab,
  AuditEntry,
  LookupRequest,
  PersonSummary,
} from "./types.ts";

const closedModal: AdminState["modal"] = {
  type: null,
  targetId: null,
  targetLabel: null,
};

const setTabState = (
  tabStates: AdminState["tabStates"],
  tab: AdminTab,
  loadState: AdminState["tabStates"][AdminTab],
): AdminState["tabStates"] => ({
  ...tabStates,
  [tab]: loadState,
});

export const adminReducer = (
  state: AdminState,
  action: AdminAction,
): AdminState => {
  switch (action.type) {
    // -- Navigation -----------------------------------------------------------
    case "SWITCH_TAB":
      return { ...state, activeTab: action.tab, error: null };

    // -- Dashboard ------------------------------------------------------------
    case "LOAD_DASHBOARD_START":
      return {
        ...state,
        tabStates: setTabState(state.tabStates, "dashboard", "loading"),
      };

    case "LOAD_DASHBOARD_SUCCESS":
      return {
        ...state,
        tabStates: setTabState(state.tabStates, "dashboard", "loaded"),
        stats: action.stats,
        requests: action.pendingRequests,
        auditEntries: action.recentAudit,
      };

    case "LOAD_DASHBOARD_FAILURE":
      return {
        ...state,
        tabStates: setTabState(state.tabStates, "dashboard", "error"),
        error: { title: action.title, message: action.message },
      };

    // -- Pessoas --------------------------------------------------------------
    case "LOAD_PEOPLE_START":
      return {
        ...state,
        tabStates: setTabState(state.tabStates, "pessoas", "loading"),
      };

    case "LOAD_PEOPLE_SUCCESS":
      return {
        ...state,
        tabStates: setTabState(state.tabStates, "pessoas", "loaded"),
        people: action.people,
      };

    case "LOAD_PEOPLE_FAILURE":
      return {
        ...state,
        tabStates: setTabState(state.tabStates, "pessoas", "error"),
      };

    case "SET_PEOPLE_SEARCH":
      return { ...state, peopleSearch: action.query };

    // -- Lookups --------------------------------------------------------------
    case "LOAD_LOOKUPS_START":
      return {
        ...state,
        tabStates: setTabState(state.tabStates, "lookups", "loading"),
      };

    case "LOAD_LOOKUPS_SUCCESS":
      return {
        ...state,
        tabStates: setTabState(state.tabStates, "lookups", "loaded"),
        lookupTables: action.tables,
      };

    case "LOAD_LOOKUPS_FAILURE":
      return {
        ...state,
        tabStates: setTabState(state.tabStates, "lookups", "error"),
      };

    case "SELECT_LOOKUP_TABLE":
      return {
        ...state,
        selectedTable: action.tableName,
        lookupEntries: [],
      };

    case "LOAD_ENTRIES_SUCCESS":
      return { ...state, lookupEntries: action.entries };

    case "TOGGLE_ENTRY_SUCCESS": {
      const updatedEntries = state.lookupEntries.map((entry) =>
        entry.id === action.entryId
          ? { ...entry, active: action.active }
          : entry
      );
      return { ...state, lookupEntries: updatedEntries };
    }

    // -- Solicitacoes ---------------------------------------------------------
    case "LOAD_REQUESTS_START":
      return {
        ...state,
        tabStates: setTabState(state.tabStates, "solicitacoes", "loading"),
      };

    case "LOAD_REQUESTS_SUCCESS":
      return {
        ...state,
        tabStates: setTabState(state.tabStates, "solicitacoes", "loaded"),
        requests: action.requests,
      };

    case "LOAD_REQUESTS_FAILURE":
      return {
        ...state,
        tabStates: setTabState(state.tabStates, "solicitacoes", "error"),
      };

    // -- Auditoria ------------------------------------------------------------
    case "LOAD_AUDIT_START":
      return {
        ...state,
        tabStates: setTabState(state.tabStates, "auditoria", "loading"),
      };

    case "LOAD_AUDIT_SUCCESS":
      return {
        ...state,
        tabStates: setTabState(state.tabStates, "auditoria", "loaded"),
        auditEntries: action.entries,
        auditTotal: action.total,
        auditOffset: action.entries.length,
      };

    case "LOAD_MORE_AUDIT_SUCCESS":
      return {
        ...state,
        auditEntries: [...state.auditEntries, ...action.entries],
        auditTotal: action.total,
        auditOffset: state.auditOffset + action.entries.length,
      };

    case "LOAD_AUDIT_FAILURE":
      return {
        ...state,
        tabStates: setTabState(state.tabStates, "auditoria", "error"),
      };

    // -- Modals ---------------------------------------------------------------
    case "OPEN_MODAL":
      return {
        ...state,
        modal: {
          type: action.modalType,
          targetId: action.targetId,
          targetLabel: action.targetLabel,
        },
      };

    case "CLOSE_MODAL":
      return { ...state, modal: closedModal };

    case "APPROVE_SUCCESS": {
      const updatedRequests = state.requests.map((request) =>
        request.id === action.requestId
          ? { ...request, status: "aprovado" as const }
          : request
      );
      return {
        ...state,
        requests: updatedRequests,
        modal: closedModal,
      };
    }

    case "REJECT_SUCCESS": {
      const updatedRequests = state.requests.map((request) =>
        request.id === action.requestId
          ? { ...request, status: "rejeitado" as const }
          : request
      );
      return {
        ...state,
        requests: updatedRequests,
        modal: closedModal,
      };
    }

    // -- Toast ----------------------------------------------------------------
    case "SHOW_TOAST":
      return { ...state, toast: action.toast };

    case "HIDE_TOAST":
      return { ...state, toast: null };
  }
};

// -- Derived state helpers --------------------------------------------------

/** Filters people by name (case-insensitive) or CPF (digits only). */
export const filteredPeople = (
  people: readonly PersonSummary[],
  search: string,
): readonly PersonSummary[] => {
  const query = search.trim().toLowerCase();
  if (query === "") return people;

  const digits = query.replace(/\D/g, "");

  return people.filter((person) => {
    const nameMatch = person.name.toLowerCase().includes(query);
    const cpfMatch =
      digits.length > 0 && person.cpf.replace(/\D/g, "").includes(digits);
    return nameMatch || cpfMatch;
  });
};

/** Filters audit entries by action or actor name (case-insensitive). */
export const filteredAudit = (
  entries: readonly AuditEntry[],
  search: string,
): readonly AuditEntry[] => {
  const query = search.trim().toLowerCase();
  if (query === "") return entries;

  return entries.filter(
    (entry) =>
      entry.action.toLowerCase().includes(query) ||
      entry.actorName.toLowerCase().includes(query),
  );
};

/** Returns only pending requests, sorted first. */
export const pendingRequests = (
  requests: readonly LookupRequest[],
): readonly LookupRequest[] =>
  requests.filter((r) => r.status === "pendente");

/** Returns the count of pending requests for badge display. */
export const pendingRequestCount = (
  requests: readonly LookupRequest[],
): number => requests.filter((r) => r.status === "pendente").length;

/** Whether there are more audit entries to load. */
export const hasMoreAudit = (state: AdminState): boolean =>
  state.auditOffset < state.auditTotal;
