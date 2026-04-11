import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  filterFamilies,
  socialCareReducer,
} from "../../../src/client/viewmodels/social-care/reducer.ts";
import { initialState } from "../../../src/client/viewmodels/social-care/types.ts";
import type {
  PatientSummary,
  SocialCareState,
} from "../../../src/client/viewmodels/social-care/types.ts";

const makeSummary = (overrides: Partial<PatientSummary> = {}): PatientSummary => ({
  patientId: "p1",
  personId: "per1",
  firstName: "Maria",
  lastName: "Silva",
  fullName: "Maria Silva",
  primaryDiagnosis: null,
  memberCount: 3,
  ...overrides,
});

describe("socialCareReducer", () => {
  it("LOAD_START sets loading to true", () => {
    const result = socialCareReducer(initialState, { type: "LOAD_START" });
    assertEquals(result.loading, true);
  });

  it("LOAD_SUCCESS sets families and loading to false", () => {
    const families = [makeSummary()];
    const state: SocialCareState = { ...initialState, loading: true };
    const result = socialCareReducer(state, { type: "LOAD_SUCCESS", families });
    assertEquals(result.loading, false);
    assertEquals(result.families, families);
  });

  it("LOAD_FAILURE sets loading to false", () => {
    const state: SocialCareState = { ...initialState, loading: true };
    const result = socialCareReducer(state, { type: "LOAD_FAILURE" });
    assertEquals(result.loading, false);
  });

  it("SET_SEARCH updates searchQuery", () => {
    const result = socialCareReducer(initialState, { type: "SET_SEARCH", query: "silva" });
    assertEquals(result.searchQuery, "silva");
  });

  it("SELECT_PATIENT opens panel and sets detailLoading", () => {
    const result = socialCareReducer(initialState, { type: "SELECT_PATIENT", id: "p1" });
    assertEquals(result.selectedPatientId, "p1");
    assertEquals(result.panelVisible, true);
    assertEquals(result.detailLoading, true);
    assertEquals(result.panelView, "dados");
  });

  it("SELECT_PATIENT same id toggles panel closed", () => {
    const state: SocialCareState = {
      ...initialState,
      selectedPatientId: "p1",
      panelVisible: true,
    };
    const result = socialCareReducer(state, { type: "SELECT_PATIENT", id: "p1" });
    assertEquals(result.panelVisible, false);
  });

  it("SELECT_PATIENT different id opens panel for new patient", () => {
    const state: SocialCareState = {
      ...initialState,
      selectedPatientId: "p1",
      panelVisible: true,
    };
    const result = socialCareReducer(state, { type: "SELECT_PATIENT", id: "p2" });
    assertEquals(result.selectedPatientId, "p2");
    assertEquals(result.panelVisible, true);
    assertEquals(result.detailLoading, true);
  });

  it("DETAIL_START sets detailLoading to true", () => {
    const result = socialCareReducer(initialState, { type: "DETAIL_START" });
    assertEquals(result.detailLoading, true);
  });

  it("DETAIL_SUCCESS sets patientDetail and fichas", () => {
    const detail = {
      patientId: "p1",
      personId: "per1",
      personalData: null,
      civilDocuments: null,
      address: null,
      diagnoses: [],
      familyMembers: [],
    };
    const fichas = [{ name: "Composicao familiar", filled: true, route: "/fc/p1" }];
    const state: SocialCareState = { ...initialState, detailLoading: true };
    const result = socialCareReducer(state, { type: "DETAIL_SUCCESS", detail, fichas });
    assertEquals(result.detailLoading, false);
    assertEquals(result.patientDetail, detail);
    assertEquals(result.fichas, fichas);
  });

  it("DETAIL_FAILURE sets detailLoading to false", () => {
    const state: SocialCareState = { ...initialState, detailLoading: true };
    const result = socialCareReducer(state, { type: "DETAIL_FAILURE" });
    assertEquals(result.detailLoading, false);
  });

  it("CLOSE_PANEL sets panelVisible to false", () => {
    const state: SocialCareState = { ...initialState, panelVisible: true };
    const result = socialCareReducer(state, { type: "CLOSE_PANEL" });
    assertEquals(result.panelVisible, false);
  });

  it("SHOW_FICHAS sets panelView to fichas", () => {
    const result = socialCareReducer(initialState, { type: "SHOW_FICHAS" });
    assertEquals(result.panelView, "fichas");
  });

  it("SHOW_DADOS sets panelView to dados", () => {
    const state: SocialCareState = { ...initialState, panelView: "fichas" };
    const result = socialCareReducer(state, { type: "SHOW_DADOS" });
    assertEquals(result.panelView, "dados");
  });

  it("SET_TAB changes activeTab", () => {
    const result = socialCareReducer(initialState, { type: "SET_TAB", tab: "cadastro" });
    assertEquals(result.activeTab, "cadastro");
  });
});

describe("filterFamilies", () => {
  const families: readonly PatientSummary[] = [
    makeSummary({ patientId: "p1", firstName: "Maria", lastName: "Silva", fullName: "Maria Silva" }),
    makeSummary({ patientId: "p2", firstName: "Joao", lastName: "Santos", fullName: "Joao Santos" }),
    makeSummary({ patientId: "p3", firstName: "Ana", lastName: "Oliveira", fullName: "Ana Oliveira" }),
  ];

  it("returns all families when query is empty", () => {
    const result = filterFamilies(families, "");
    assertEquals(result, families);
  });

  it("returns all families when query is whitespace", () => {
    const result = filterFamilies(families, "   ");
    assertEquals(result, families);
  });

  it("filters by firstName case-insensitive", () => {
    const result = filterFamilies(families, "maria");
    assertEquals(result.length, 1);
    assertEquals(result[0]!.patientId, "p1");
  });

  it("filters by lastName case-insensitive", () => {
    const result = filterFamilies(families, "SANTOS");
    assertEquals(result.length, 1);
    assertEquals(result[0]!.patientId, "p2");
  });

  it("filters by fullName", () => {
    const result = filterFamilies(families, "Ana Oli");
    assertEquals(result.length, 1);
    assertEquals(result[0]!.patientId, "p3");
  });

  it("returns empty when no match", () => {
    const result = filterFamilies(families, "xyz");
    assertEquals(result.length, 0);
  });

  it("handles null name fields gracefully", () => {
    const withNulls: readonly PatientSummary[] = [
      makeSummary({ patientId: "p1", firstName: null, lastName: null, fullName: null }),
    ];
    const result = filterFamilies(withNulls, "test");
    assertEquals(result.length, 0);
  });
});
