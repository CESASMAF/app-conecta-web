// =============================================================================
// SystemRole VO — Role assignment from the People Context
// =============================================================================

import type { PersonId } from "../../kernel/ids.ts";
import { type Result, ok, err } from "../../shared/result.ts";
import type { RoleError } from "../errors.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A role assigned to a person in a specific system. */
export type SystemRole = Readonly<{
  id: string;
  personId: PersonId;
  system: string;
  role: string;
  active: boolean;
  assignedAt: string; // ISO datetime
}>;

/** Input for assigning a new role. */
export type AssignRoleInput = Readonly<{
  system: string;
  role: string;
}>;

// ---------------------------------------------------------------------------
// Smart Constructors
// ---------------------------------------------------------------------------

/**
 * Validates and creates an AssignRoleInput.
 * Both system and role must be non-empty after trimming.
 */
export const AssignRoleInput = (input: Readonly<{
  system: string;
  role: string;
}>): Result<AssignRoleInput, RoleError> => {
  const trimmedSystem = input.system.trim();
  const trimmedRole = input.role.trim();

  if (trimmedSystem.length === 0 || trimmedRole.length === 0) {
    return err("ROL-001");
  }

  return ok({
    system: trimmedSystem,
    role: trimmedRole,
  });
};
