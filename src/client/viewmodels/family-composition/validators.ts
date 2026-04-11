// Family Composition — Pure validation functions

import type { FamilyMemberModel } from "./types.ts";

/**
 * Validate a family member form.
 * Returns a Map of field name → error message (PT-BR).
 * Empty map means valid.
 */
export const validateMember = (
  member: FamilyMemberModel,
): ReadonlyMap<string, string> => {
  const errors = new Map<string, string>();

  if (!member.name.trim()) {
    errors.set("name", "Nome é obrigatório");
  }

  if (!member.birthDate.trim()) {
    errors.set("birthDate", "Data de nascimento é obrigatória");
  }

  if (!member.sex.trim()) {
    errors.set("sex", "Sexo é obrigatório");
  }

  if (!member.relationshipId.trim()) {
    errors.set("relationshipId", "Parentesco é obrigatório");
  }

  return errors;
};
