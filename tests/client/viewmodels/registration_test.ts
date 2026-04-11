import { assertEquals } from "@std/assert"
import { wizardReducer } from "../../../src/client/viewmodels/registration/reducer.ts"
import { initialState } from "../../../src/client/viewmodels/registration/types.ts"
import type { WizardState, WizardAction } from "../../../src/client/viewmodels/registration/types.ts"
import {
  validateStep0,
  validateStep1,
  validateStep3,
  validateStep6,
} from "../../../src/client/viewmodels/registration/validators.ts"

// --- UPDATE_FIELD ---

Deno.test("UPDATE_FIELD updates correct section (fields)", () => {
  const action: WizardAction = { type: "UPDATE_FIELD", section: "fields", field: "firstName", value: "Maria" }
  const result = wizardReducer(initialState, action)
  assertEquals(result.fields.firstName, "Maria")
})

Deno.test("UPDATE_FIELD updates documents section", () => {
  const action: WizardAction = { type: "UPDATE_FIELD", section: "documents", field: "cpf", value: "12345678901" }
  const result = wizardReducer(initialState, action)
  assertEquals(result.documents.cpf, "12345678901")
})

Deno.test("UPDATE_FIELD updates address section", () => {
  const action: WizardAction = { type: "UPDATE_FIELD", section: "address", field: "city", value: "Brasília" }
  const result = wizardReducer(initialState, action)
  assertEquals(result.address.city, "Brasília")
})

// --- NEXT_STEP ---

Deno.test("NEXT_STEP with valid step 0 advances to step 1", () => {
  const state: WizardState = {
    ...initialState,
    fields: {
      ...initialState.fields,
      firstName: "João",
      lastName: "Silva",
      motherName: "Ana",
      nationality: "Brasileira",
      gender: "Masculino",
    },
  }
  const result = wizardReducer(state, { type: "NEXT_STEP" })
  assertEquals(result.currentStep, 1)
  assertEquals(result.showErrors, false)
  assertEquals(result.errors.size, 0)
})

Deno.test("NEXT_STEP with invalid step 0 stays on step 0 and shows errors", () => {
  const result = wizardReducer(initialState, { type: "NEXT_STEP" })
  assertEquals(result.currentStep, 0)
  assertEquals(result.showErrors, true)
  assertEquals(result.errors.size > 0, true)
  assertEquals(result.errors.has("firstName"), true)
})

Deno.test("NEXT_STEP on optional step 4 (family) always advances", () => {
  const state: WizardState = { ...initialState, currentStep: 4 }
  const result = wizardReducer(state, { type: "NEXT_STEP" })
  assertEquals(result.currentStep, 5)
})

Deno.test("NEXT_STEP on last step (6) with valid data does not go beyond 6", () => {
  const state: WizardState = {
    ...initialState,
    currentStep: 6,
    intake: {
      ...initialState.intake,
      ingressType: "Demanda espontânea",
      serviceReason: "Avaliação social",
    },
  }
  const result = wizardReducer(state, { type: "NEXT_STEP" })
  assertEquals(result.currentStep, 6)
})

// --- PREV_STEP ---

Deno.test("PREV_STEP goes back one step", () => {
  const state: WizardState = { ...initialState, currentStep: 3 }
  const result = wizardReducer(state, { type: "PREV_STEP" })
  assertEquals(result.currentStep, 2)
})

Deno.test("PREV_STEP does not go below 0", () => {
  const result = wizardReducer(initialState, { type: "PREV_STEP" })
  assertEquals(result.currentStep, 0)
})

// --- ADD_DIAGNOSIS / REMOVE_DIAGNOSIS ---

Deno.test("ADD_DIAGNOSIS adds empty diagnosis entry", () => {
  const result = wizardReducer(initialState, { type: "ADD_DIAGNOSIS" })
  assertEquals(result.diagnoses.length, 1)
  assertEquals(result.diagnoses[0]!.code, "")
  assertEquals(result.diagnoses[0]!.date, "")
  assertEquals(result.diagnoses[0]!.description, "")
})

Deno.test("REMOVE_DIAGNOSIS removes entry by index", () => {
  const state: WizardState = {
    ...initialState,
    diagnoses: [
      { code: "F84.0", date: "2024-01-01", description: "Autismo" },
      { code: "G80.0", date: "2024-02-01", description: "Paralisia cerebral" },
    ],
  }
  const result = wizardReducer(state, { type: "REMOVE_DIAGNOSIS", index: 0 })
  assertEquals(result.diagnoses.length, 1)
  assertEquals(result.diagnoses[0]!.code, "G80.0")
})

Deno.test("APPLY_QUICK_CID updates code and description at index", () => {
  const state: WizardState = {
    ...initialState,
    diagnoses: [{ code: "", date: "2024-01-01", description: "" }],
  }
  const result = wizardReducer(state, {
    type: "APPLY_QUICK_CID",
    index: 0,
    code: "F84.0",
    description: "Autismo infantil",
  })
  assertEquals(result.diagnoses[0]!.code, "F84.0")
  assertEquals(result.diagnoses[0]!.description, "Autismo infantil")
  assertEquals(result.diagnoses[0]!.date, "2024-01-01")
})

// --- FAMILY MEMBERS ---

Deno.test("ADD_FAMILY_MEMBER adds member", () => {
  const member = {
    name: "José",
    birthDate: "1990-05-15",
    gender: "Masculino",
    relationship: "Pai",
    livesWithPatient: true,
    isDisabled: false,
  }
  const result = wizardReducer(initialState, { type: "ADD_FAMILY_MEMBER", member })
  assertEquals(result.familyMembers.length, 1)
  assertEquals(result.familyMembers[0]!.name, "José")
})

Deno.test("REMOVE_FAMILY_MEMBER removes by index", () => {
  const state: WizardState = {
    ...initialState,
    familyMembers: [
      { name: "A", birthDate: "", gender: "", relationship: "", livesWithPatient: true, isDisabled: false },
      { name: "B", birthDate: "", gender: "", relationship: "", livesWithPatient: true, isDisabled: false },
    ],
  }
  const result = wizardReducer(state, { type: "REMOVE_FAMILY_MEMBER", index: 0 })
  assertEquals(result.familyMembers.length, 1)
  assertEquals(result.familyMembers[0]!.name, "B")
})

// --- TOGGLE_PROGRAM ---

Deno.test("TOGGLE_PROGRAM adds program when not present", () => {
  const result = wizardReducer(initialState, { type: "TOGGLE_PROGRAM", programId: "prog-1" })
  assertEquals(result.intake.selectedPrograms.includes("prog-1"), true)
})

Deno.test("TOGGLE_PROGRAM removes program when already present", () => {
  const state: WizardState = {
    ...initialState,
    intake: { ...initialState.intake, selectedPrograms: ["prog-1", "prog-2"] },
  }
  const result = wizardReducer(state, { type: "TOGGLE_PROGRAM", programId: "prog-1" })
  assertEquals(result.intake.selectedPrograms.includes("prog-1"), false)
  assertEquals(result.intake.selectedPrograms.includes("prog-2"), true)
})

// --- SAVE actions ---

Deno.test("SAVE_START sets saving true and clears saveResult", () => {
  const result = wizardReducer(initialState, { type: "SAVE_START" })
  assertEquals(result.saving, true)
  assertEquals(result.saveResult, null)
})

Deno.test("SAVE_SUCCESS sets saving false with ok result", () => {
  const state: WizardState = { ...initialState, saving: true }
  const result = wizardReducer(state, { type: "SAVE_SUCCESS", message: "Salvo!" })
  assertEquals(result.saving, false)
  assertEquals(result.saveResult, { ok: true, message: "Salvo!" })
})

Deno.test("SAVE_FAILURE sets saving false with error result", () => {
  const state: WizardState = { ...initialState, saving: true }
  const result = wizardReducer(state, { type: "SAVE_FAILURE", message: "Erro de rede" })
  assertEquals(result.saving, false)
  assertEquals(result.saveResult, { ok: false, message: "Erro de rede" })
})

// --- Validators ---

Deno.test("validateStep0 catches empty firstName", () => {
  const errors = validateStep0(initialState)
  assertEquals(errors.has("firstName"), true)
})

Deno.test("validateStep0 passes with all required fields", () => {
  const state: WizardState = {
    ...initialState,
    fields: {
      ...initialState.fields,
      firstName: "João",
      lastName: "Silva",
      motherName: "Ana",
      nationality: "Brasileira",
      gender: "Masculino",
    },
  }
  const errors = validateStep0(state)
  assertEquals(errors.size, 0)
})

Deno.test("validateStep1 catches invalid CPF (too short)", () => {
  const state: WizardState = {
    ...initialState,
    documents: { ...initialState.documents, cpf: "123", birthDate: "2000-01-01" },
  }
  const errors = validateStep1(state)
  assertEquals(errors.has("cpf"), true)
})

Deno.test("validateStep1 catches future birthDate", () => {
  const state: WizardState = {
    ...initialState,
    documents: { ...initialState.documents, cpf: "12345678901", birthDate: "2099-01-01" },
  }
  const errors = validateStep1(state)
  assertEquals(errors.has("birthDate"), true)
})

Deno.test("validateStep3 requires at least 1 diagnosis", () => {
  const errors = validateStep3(initialState)
  assertEquals(errors.has("diagnoses"), true)
})

Deno.test("validateStep3 passes with complete diagnosis", () => {
  const state: WizardState = {
    ...initialState,
    diagnoses: [{ code: "F84.0", date: "2024-01-01", description: "Autismo" }],
  }
  const errors = validateStep3(state)
  assertEquals(errors.size, 0)
})

Deno.test("validateStep6 catches empty serviceReason", () => {
  const state: WizardState = {
    ...initialState,
    intake: { ...initialState.intake, ingressType: "Demanda espontânea", serviceReason: "" },
  }
  const errors = validateStep6(state)
  assertEquals(errors.has("serviceReason"), true)
  assertEquals(errors.has("ingressType"), false)
})
