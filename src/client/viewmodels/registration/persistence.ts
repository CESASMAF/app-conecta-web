// Registration Wizard — Persistence Functions
// Called by the Page in useEffect, NOT by the reducer

import type { WizardState } from "./types.ts";

const STORAGE_KEY = "registration-wizard-draft";

export function saveDraft(state: WizardState): void {
  const serializable = {
    ...state,
    errors: Array.from(state.errors.entries()),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
}

export function loadDraft(): WizardState | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const parsed = JSON.parse(raw) as Record<string, unknown>;
  // Restore Map from serialized array
  const errors = Array.isArray(parsed.errors)
    ? new Map(parsed.errors as readonly (readonly [string, string])[])
    : new Map<string, string>();
  return { ...parsed, errors } as WizardState;
}

export function clearDraft(): void {
  localStorage.removeItem(STORAGE_KEY);
}
