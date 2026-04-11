// Family Composition — Pure reducer + utility functions

import type { FamilyAction, FamilyMemberModel, FamilyState } from "./types.ts";
import { AGE_BUCKETS } from "./types.ts";

/**
 * Calculate age in full years from a birthDate string (YYYY-MM-DD or DD/MM/YYYY)
 * relative to a reference date.
 */
export const calculateAge = (
  birthDate: string,
  referenceDate: Date,
): number => {
  let year: number;
  let month: number;
  let day: number;

  if (birthDate.includes("/")) {
    const parts = birthDate.split("/");
    day = parseInt(parts[0] ?? "0", 10);
    month = parseInt(parts[1] ?? "0", 10);
    year = parseInt(parts[2] ?? "0", 10);
  } else {
    const parts = birthDate.split("-");
    year = parseInt(parts[0] ?? "0", 10);
    month = parseInt(parts[1] ?? "0", 10);
    day = parseInt(parts[2] ?? "0", 10);
  }

  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth() + 1;
  const refDay = referenceDate.getDate();

  let age = refYear - year;
  if (refMonth < month || (refMonth === month && refDay < day)) {
    age -= 1;
  }
  return Math.max(0, age);
};

/**
 * Assign an age to its corresponding bucket string.
 */
const ageToBucket = (age: number): string => {
  if (age <= 5) return "0-5";
  if (age <= 11) return "6-11";
  if (age <= 17) return "12-17";
  if (age <= 24) return "18-24";
  if (age <= 34) return "25-34";
  if (age <= 44) return "35-44";
  if (age <= 59) return "45-59";
  return "60+";
};

/**
 * Calculate age profile from members' birth dates.
 * Returns a record with counts per age bucket.
 */
export const calculateAgeProfile = (
  members: readonly FamilyMemberModel[],
  referenceDate: Date,
): Readonly<Record<string, number>> => {
  const profile: Record<string, number> = {};
  for (const bucket of AGE_BUCKETS) {
    profile[bucket] = 0;
  }

  for (const member of members) {
    if (!member.birthDate) continue;
    const age = calculateAge(member.birthDate, referenceDate);
    const bucket = ageToBucket(age);
    profile[bucket] = (profile[bucket] ?? 0) + 1;
  }

  return profile;
};

/**
 * Determine if state has changes that can be saved.
 * True if specificity changed or members differ from loaded state.
 */
export const canSave = (state: FamilyState): boolean => {
  if (state.saving || state.loading) return false;
  return state.selectedSpecificityId !== state.originalSpecificityId;
};

export const familyReducer = (
  state: FamilyState,
  action: FamilyAction,
): FamilyState => {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, loading: true, error: null };

    case "LOAD_SUCCESS": {
      const ageProfile = calculateAgeProfile(action.members, new Date());
      return {
        ...state,
        loading: false,
        error: null,
        members: action.members,
        lookups: action.lookups,
        selectedSpecificityId: action.specificityId,
        originalSpecificityId: action.specificityId,
        ageProfile,
      };
    }

    case "LOAD_FAILURE":
      return { ...state, loading: false, error: action.error };

    case "ADD_MEMBER": {
      const members = [...state.members, action.member];
      const ageProfile = calculateAgeProfile(members, new Date());
      return { ...state, members, ageProfile };
    }

    case "UPDATE_MEMBER": {
      const members = state.members.map((m, i) =>
        i === action.index ? action.member : m
      );
      const ageProfile = calculateAgeProfile(members, new Date());
      return { ...state, members, ageProfile };
    }

    case "REMOVE_MEMBER": {
      const members = state.members.filter(
        (m) => m.personId !== action.personId,
      );
      const ageProfile = calculateAgeProfile(members, new Date());
      return { ...state, members, ageProfile };
    }

    case "SET_CAREGIVER":
      return {
        ...state,
        members: state.members.map((m) => ({
          ...m,
          isPrimaryCaregiver: m.personId === action.personId,
        })),
      };

    case "TOGGLE_DOCUMENT":
      return {
        ...state,
        members: state.members.map((m) => {
          if (m.personId !== action.personId) return m;
          const docs = m.requiredDocuments.includes(action.doc)
            ? m.requiredDocuments.filter((d) => d !== action.doc)
            : [...m.requiredDocuments, action.doc];
          return { ...m, requiredDocuments: docs };
        }),
      };

    case "SET_SPECIFICITY":
      return { ...state, selectedSpecificityId: action.id };

    case "SAVE_START":
      return { ...state, saving: true };

    case "SAVE_SUCCESS":
      return {
        ...state,
        saving: false,
        originalSpecificityId: state.selectedSpecificityId,
      };

    case "SAVE_FAILURE":
      return { ...state, saving: false, error: action.error };
  }
};
