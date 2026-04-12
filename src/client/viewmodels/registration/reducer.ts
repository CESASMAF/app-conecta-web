// Registration Wizard — Pure Reducer
// (state, action) => newState — zero side effects

import type { DiagnosisEntry, WizardAction, WizardState } from "./types.ts";
import { initialState } from "./types.ts";
import { validateStep } from "./validators.ts";

const TOTAL_STEPS = 7;

function updateSection(
  state: WizardState,
  section: string,
  field: string,
  value: string,
): WizardState {
  switch (section) {
    case "fields":
      return { ...state, fields: { ...state.fields, [field]: value } };
    case "documents":
      return { ...state, documents: { ...state.documents, [field]: value } };
    case "address":
      return { ...state, address: { ...state.address, [field]: value } };
    case "specificity":
      return {
        ...state,
        specificity: { ...state.specificity, [field]: value },
      };
    case "intake":
      return { ...state, intake: { ...state.intake, [field]: value } };
    default:
      return state;
  }
}

export function wizardReducer(
  state: WizardState,
  action: WizardAction,
): WizardState {
  switch (action.type) {
    case "UPDATE_FIELD":
      return updateSection(state, action.section, action.field, action.value);

    case "NEXT_STEP": {
      const errors = validateStep(state.currentStep, state);
      if (errors.size > 0) {
        return { ...state, errors, showErrors: true };
      }
      if (state.currentStep >= TOTAL_STEPS - 1) {
        return state;
      }
      return {
        ...state,
        currentStep: state.currentStep + 1,
        showErrors: false,
        errors: new Map(),
      };
    }

    case "PREV_STEP":
      return {
        ...state,
        currentStep: Math.max(0, state.currentStep - 1),
        showErrors: false,
        errors: new Map(),
      };

    case "ADD_DIAGNOSIS": {
      const empty: DiagnosisEntry = {
        code: "",
        date: "",
        description: "",
        quickCidId: null,
      };
      return { ...state, diagnoses: [...state.diagnoses, empty] };
    }

    case "REMOVE_DIAGNOSIS":
      return {
        ...state,
        diagnoses: state.diagnoses.filter((_, i) => i !== action.index),
      };

    case "UPDATE_DIAGNOSIS_FIELD": {
      const updated = state.diagnoses.map((d, i) =>
        i === action.index ? { ...d, [action.field]: action.value } : d
      );
      return { ...state, diagnoses: updated };
    }

    case "APPLY_QUICK_CID": {
      const updated = state.diagnoses.map((d, i) =>
        i === action.index
          ? {
            ...d,
            code: action.code,
            description: action.description,
            quickCidId: action.code,
          }
          : d
      );
      return { ...state, diagnoses: updated };
    }

    case "ADD_FAMILY_MEMBER":
      return {
        ...state,
        familyMembers: [...state.familyMembers, action.member],
      };

    case "UPDATE_FAMILY_MEMBER":
      return {
        ...state,
        familyMembers: state.familyMembers.map((m, i) =>
          i === action.index ? action.member : m
        ),
      };

    case "REMOVE_FAMILY_MEMBER":
      return {
        ...state,
        familyMembers: state.familyMembers.filter((_, i) => i !== action.index),
      };

    case "TOGGLE_ADDRESS_FLAG":
      return {
        ...state,
        address: {
          ...state.address,
          [action.field]: !state.address[action.field],
        },
      };

    case "TOGGLE_PROGRAM": {
      const programs = state.intake.selectedPrograms;
      const exists = programs.includes(action.programId);
      const updated = exists
        ? programs.filter((p) => p !== action.programId)
        : [...programs, action.programId];
      return {
        ...state,
        intake: { ...state.intake, selectedPrograms: updated },
      };
    }

    case "SAVE_START":
      return { ...state, saving: true, saveResult: null };

    case "SAVE_SUCCESS":
      return {
        ...state,
        saving: false,
        saveResult: { ok: true, message: action.message },
      };

    case "SAVE_FAILURE":
      return {
        ...state,
        saving: false,
        saveResult: { ok: false, message: action.message },
      };

    // --- Sage Garden redesign actions ---

    case "SET_LOCATION_TYPE": {
      const lt = action.locationType;
      const baseAddress = {
        ...state.address,
        locationType: lt,
        residenceLocation: lt === "RUA" ? "" : lt,
        isHomeless: lt === "RUA",
      };
      if (lt === "RUA") {
        return {
          ...state,
          address: {
            ...baseAddress,
            street: "",
            complement: "",
            neighborhood: "",
            cep: "",
            housingSituation: "",
            isShelter: false,
          },
        };
      }
      if (lt === "RURAL") {
        return {
          ...state,
          address: {
            ...baseAddress,
            street: "",
            complement: "",
          },
        };
      }
      // URBANO — no field clearing
      return { ...state, address: baseAddress };
    }

    case "GO_TO_STEP":
      return {
        ...state,
        currentStep: Math.max(0, Math.min(TOTAL_STEPS - 1, action.step)),
        showErrors: false,
        errors: new Map(),
      };

    case "SET_ERRORS":
      return { ...state, errors: action.errors, showErrors: true };

    case "CLEAR_ERRORS":
      return { ...state, errors: new Map(), showErrors: false };

    case "LOAD_DRAFT":
      return action.state;

    case "RESET":
      return initialState;
  }
}
