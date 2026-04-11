// Family Composition — Persistence functions (called by Page, NOT by reducer)

import type { FamilyState } from "./types.ts";

const STORAGE_KEY = "family-composition-draft";

export const saveDraft = (state: FamilyState): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const loadDraft = (): FamilyState | null => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as FamilyState;
};

export const clearDraft = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
