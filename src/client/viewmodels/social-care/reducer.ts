// Social Care Home — Pure reducer + filter utility

import type {
  PatientSummary,
  SocialCareAction,
  SocialCareState,
} from "./types.ts";

export const socialCareReducer = (
  state: SocialCareState,
  action: SocialCareAction,
): SocialCareState => {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, loading: true };

    case "LOAD_SUCCESS":
      return { ...state, loading: false, families: action.families };

    case "LOAD_FAILURE":
      return { ...state, loading: false };

    case "SET_SEARCH":
      return { ...state, searchQuery: action.query };

    case "SELECT_PATIENT":
      if (action.id === state.selectedPatientId && state.panelVisible) {
        return { ...state, panelVisible: false };
      }
      return {
        ...state,
        selectedPatientId: action.id,
        panelVisible: true,
        panelView: "dados",
        patientDetail: null,
        fichas: [],
        detailLoading: true,
      };

    case "DETAIL_START":
      return { ...state, detailLoading: true };

    case "DETAIL_SUCCESS":
      return {
        ...state,
        detailLoading: false,
        patientDetail: action.detail,
        fichas: action.fichas,
      };

    case "DETAIL_FAILURE":
      return { ...state, detailLoading: false };

    case "CLOSE_PANEL":
      return { ...state, panelVisible: false };

    case "SHOW_FICHAS":
      return { ...state, panelView: "fichas" };

    case "SHOW_DADOS":
      return { ...state, panelView: "dados" };

    case "SET_TAB":
      return { ...state, activeTab: action.tab };
  }
};

export const filterFamilies = (
  families: readonly PatientSummary[],
  query: string,
): readonly PatientSummary[] => {
  const trimmed = query.trim();
  if (trimmed === "") return families;
  const lower = trimmed.toLowerCase();
  return families.filter((f) =>
    [f.firstName, f.lastName, f.fullName].some((n) =>
      n?.toLowerCase().includes(lower)
    )
  );
};
