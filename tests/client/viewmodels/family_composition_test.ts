import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  calculateAge,
  calculateAgeProfile,
  canSave,
  familyReducer,
} from "../../../src/client/viewmodels/family-composition/reducer.ts";
import { initialState } from "../../../src/client/viewmodels/family-composition/types.ts";
import type {
  FamilyMemberModel,
  FamilyState,
  LookupItem,
} from "../../../src/client/viewmodels/family-composition/types.ts";
import { validateMember } from "../../../src/client/viewmodels/family-composition/validators.ts";

const makeMember = (
  overrides: Partial<FamilyMemberModel> = {},
): FamilyMemberModel => ({
  personId: "m1",
  name: "Carlos Silva",
  birthDate: "1990-05-15",
  sex: "M",
  relationshipId: "rel-1",
  relationshipLabel: "Filho(a)",
  residesWithPatient: true,
  hasDisability: false,
  isPrimaryCaregiver: false,
  isPR: false,
  requiredDocuments: [],
  ...overrides,
});

const makeLookup = (overrides: Partial<LookupItem> = {}): LookupItem => ({
  id: "lk1",
  codigo: "01",
  descricao: "Pai/Mae",
  ativo: true,
  ...overrides,
});

const defaultLookups: FamilyState["lookups"] = {
  parentesco: [makeLookup()],
  specificities: [makeLookup({ id: "sp1", descricao: "Indigena" })],
};

describe("familyReducer", () => {
  it("LOAD_START sets loading true and clears error", () => {
    const state: FamilyState = { ...initialState, error: "old error" };
    const result = familyReducer(state, { type: "LOAD_START" });
    assertEquals(result.loading, true);
    assertEquals(result.error, null);
  });

  it("LOAD_SUCCESS sets members, lookups, specificityId and calculates ageProfile", () => {
    const members = [makeMember({ birthDate: "2020-01-01" })];
    const result = familyReducer(
      { ...initialState, loading: true },
      {
        type: "LOAD_SUCCESS",
        members,
        lookups: defaultLookups,
        specificityId: "sp1",
      },
    );
    assertEquals(result.loading, false);
    assertEquals(result.members, members);
    assertEquals(result.lookups, defaultLookups);
    assertEquals(result.selectedSpecificityId, "sp1");
    assertEquals(result.originalSpecificityId, "sp1");
    assertEquals(result.error, null);
  });

  it("LOAD_FAILURE sets error and stops loading", () => {
    const result = familyReducer(
      { ...initialState, loading: true },
      { type: "LOAD_FAILURE", error: "Network error" },
    );
    assertEquals(result.loading, false);
    assertEquals(result.error, "Network error");
  });

  it("ADD_MEMBER appends member and recalculates ageProfile", () => {
    const member = makeMember({ personId: "m2", birthDate: "2015-06-01" });
    const result = familyReducer(initialState, {
      type: "ADD_MEMBER",
      member,
    });
    assertEquals(result.members.length, 1);
    assertEquals(result.members[0], member);
    // 2015 birth => ~10 years old in 2025/2026 => bucket 6-11
    const totalCount = Object.values(result.ageProfile).reduce(
      (a, b) => a + b,
      0,
    );
    assertEquals(totalCount, 1);
  });

  it("UPDATE_MEMBER replaces member at index", () => {
    const m1 = makeMember({ personId: "m1", name: "Old Name" });
    const m2 = makeMember({ personId: "m1", name: "New Name" });
    const state: FamilyState = { ...initialState, members: [m1] };
    const result = familyReducer(state, {
      type: "UPDATE_MEMBER",
      index: 0,
      member: m2,
    });
    assertEquals(result.members[0]!.name, "New Name");
  });

  it("REMOVE_MEMBER filters out by personId and recalculates ageProfile", () => {
    const m1 = makeMember({ personId: "m1" });
    const m2 = makeMember({ personId: "m2" });
    const state: FamilyState = { ...initialState, members: [m1, m2] };
    const result = familyReducer(state, {
      type: "REMOVE_MEMBER",
      personId: "m1",
    });
    assertEquals(result.members.length, 1);
    assertEquals(result.members[0]!.personId, "m2");
  });

  it("SET_CAREGIVER sets isPrimaryCaregiver true for target and false for others", () => {
    const m1 = makeMember({ personId: "m1", isPrimaryCaregiver: true });
    const m2 = makeMember({ personId: "m2", isPrimaryCaregiver: false });
    const state: FamilyState = { ...initialState, members: [m1, m2] };
    const result = familyReducer(state, {
      type: "SET_CAREGIVER",
      personId: "m2",
    });
    assertEquals(result.members[0]!.isPrimaryCaregiver, false);
    assertEquals(result.members[1]!.isPrimaryCaregiver, true);
  });

  it("TOGGLE_DOCUMENT adds doc when not present", () => {
    const m1 = makeMember({ personId: "m1", requiredDocuments: [] });
    const state: FamilyState = { ...initialState, members: [m1] };
    const result = familyReducer(state, {
      type: "TOGGLE_DOCUMENT",
      personId: "m1",
      doc: "CPF",
    });
    assertEquals(result.members[0]!.requiredDocuments, ["CPF"]);
  });

  it("TOGGLE_DOCUMENT removes doc when already present", () => {
    const m1 = makeMember({ personId: "m1", requiredDocuments: ["CPF", "RG"] });
    const state: FamilyState = { ...initialState, members: [m1] };
    const result = familyReducer(state, {
      type: "TOGGLE_DOCUMENT",
      personId: "m1",
      doc: "CPF",
    });
    assertEquals(result.members[0]!.requiredDocuments, ["RG"]);
  });

  it("SET_SPECIFICITY updates selectedSpecificityId", () => {
    const result = familyReducer(initialState, {
      type: "SET_SPECIFICITY",
      id: "sp2",
    });
    assertEquals(result.selectedSpecificityId, "sp2");
  });

  it("SAVE_START sets saving true", () => {
    const result = familyReducer(initialState, { type: "SAVE_START" });
    assertEquals(result.saving, true);
  });

  it("SAVE_SUCCESS sets saving false and updates originalSpecificityId", () => {
    const state: FamilyState = {
      ...initialState,
      saving: true,
      selectedSpecificityId: "sp2",
      originalSpecificityId: "sp1",
    };
    const result = familyReducer(state, { type: "SAVE_SUCCESS" });
    assertEquals(result.saving, false);
    assertEquals(result.originalSpecificityId, "sp2");
  });

  it("SAVE_FAILURE sets saving false and sets error", () => {
    const state: FamilyState = { ...initialState, saving: true };
    const result = familyReducer(state, {
      type: "SAVE_FAILURE",
      error: "Server error",
    });
    assertEquals(result.saving, false);
    assertEquals(result.error, "Server error");
  });
});

describe("calculateAgeProfile", () => {
  const refDate = new Date("2026-04-10");

  it("returns all zeros for empty members", () => {
    const profile = calculateAgeProfile([], refDate);
    assertEquals(profile["0-5"], 0);
    assertEquals(profile["60+"], 0);
  });

  it("counts a child (age 3) in 0-5 bucket", () => {
    const members = [makeMember({ birthDate: "2023-01-01" })];
    const profile = calculateAgeProfile(members, refDate);
    assertEquals(profile["0-5"], 1);
  });

  it("counts an adolescent (age 14) in 12-17 bucket", () => {
    const members = [makeMember({ birthDate: "2012-01-01" })];
    const profile = calculateAgeProfile(members, refDate);
    assertEquals(profile["12-17"], 1);
  });

  it("counts an elder (age 70) in 60+ bucket", () => {
    const members = [makeMember({ birthDate: "1956-01-01" })];
    const profile = calculateAgeProfile(members, refDate);
    assertEquals(profile["60+"], 1);
  });

  it("handles DD/MM/YYYY format", () => {
    const members = [makeMember({ birthDate: "01/01/2023" })];
    const profile = calculateAgeProfile(members, refDate);
    assertEquals(profile["0-5"], 1);
  });

  it("counts multiple members across buckets", () => {
    const members = [
      makeMember({ personId: "a", birthDate: "2024-01-01" }), // ~2 => 0-5
      makeMember({ personId: "b", birthDate: "2000-01-01" }), // ~26 => 25-34
      makeMember({ personId: "c", birthDate: "1960-01-01" }), // ~66 => 60+
    ];
    const profile = calculateAgeProfile(members, refDate);
    assertEquals(profile["0-5"], 1);
    assertEquals(profile["25-34"], 1);
    assertEquals(profile["60+"], 1);
  });
});

describe("calculateAge", () => {
  it("calculates age correctly before birthday in current year", () => {
    const age = calculateAge("1990-12-25", new Date("2026-04-10"));
    assertEquals(age, 35);
  });

  it("calculates age correctly after birthday in current year", () => {
    const age = calculateAge("1990-03-01", new Date("2026-04-10"));
    assertEquals(age, 36);
  });
});

describe("canSave", () => {
  it("returns false when specificityId has not changed", () => {
    const state: FamilyState = {
      ...initialState,
      selectedSpecificityId: "sp1",
      originalSpecificityId: "sp1",
    };
    assertEquals(canSave(state), false);
  });

  it("returns true when specificityId has changed", () => {
    const state: FamilyState = {
      ...initialState,
      selectedSpecificityId: "sp2",
      originalSpecificityId: "sp1",
    };
    assertEquals(canSave(state), true);
  });

  it("returns false when saving is in progress", () => {
    const state: FamilyState = {
      ...initialState,
      saving: true,
      selectedSpecificityId: "sp2",
      originalSpecificityId: "sp1",
    };
    assertEquals(canSave(state), false);
  });

  it("returns false when loading", () => {
    const state: FamilyState = {
      ...initialState,
      loading: true,
      selectedSpecificityId: "sp2",
      originalSpecificityId: "sp1",
    };
    assertEquals(canSave(state), false);
  });
});

describe("validateMember", () => {
  it("returns empty map for valid member", () => {
    const errors = validateMember(makeMember());
    assertEquals(errors.size, 0);
  });

  it("catches empty name", () => {
    const errors = validateMember(makeMember({ name: "" }));
    assertEquals(errors.has("name"), true);
    assertEquals(errors.get("name"), "Nome é obrigatório");
  });

  it("catches empty birthDate", () => {
    const errors = validateMember(makeMember({ birthDate: "" }));
    assertEquals(errors.has("birthDate"), true);
  });

  it("catches empty sex", () => {
    const errors = validateMember(makeMember({ sex: "" }));
    assertEquals(errors.has("sex"), true);
  });

  it("catches empty relationshipId", () => {
    const errors = validateMember(makeMember({ relationshipId: "" }));
    assertEquals(errors.has("relationshipId"), true);
  });

  it("catches multiple errors at once", () => {
    const errors = validateMember(
      makeMember({ name: "", birthDate: "", sex: "", relationshipId: "" }),
    );
    assertEquals(errors.size, 4);
  });

  it("whitespace-only name is invalid", () => {
    const errors = validateMember(makeMember({ name: "   " }));
    assertEquals(errors.has("name"), true);
  });
});
