// =============================================================================
// SocialIdentity — Value Object
// =============================================================================
// Represents a patient's social/community identity type.
//
// Fields:
//   - typeId: LookupId — references a lookup table entry
//   - otherDescription: string | undefined — free-text when type is "OUTRAS"
//
// Normalization:
//   - otherDescription: trim, null_if_empty (whitespace-only → undefined)
//
// Business Rules:
//   - SI-001: When isOtherType is true, otherDescription must be non-empty
//             after normalization.
//
// Design: The isOtherType flag is resolved by the caller (application layer)
// from lookup table metadata. The domain receives it as a plain boolean.
// =============================================================================

import type { LookupId } from "../../kernel/ids.ts";
import { type Result, ok, err } from "../../shared/result.ts";

// ---------------------------------------------------------------------------
// Value Object
// ---------------------------------------------------------------------------

export type SocialIdentity = Readonly<{
  typeId: LookupId;
  otherDescription: string | undefined;
}>;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

/** SI-001: otherDescription is required when typeId is "OUTRAS" */
export type SocialIdentityError = "SI-001";

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export type SocialIdentityInput = Readonly<{
  typeId: LookupId;
  otherDescription?: string;
  isOtherType: boolean;
}>;

// ---------------------------------------------------------------------------
// Normalization (module-private)
// ---------------------------------------------------------------------------

const normalizeDescription = (raw?: string): string | undefined => {
  if (raw === undefined) return undefined;
  const trimmed = raw.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

// ---------------------------------------------------------------------------
// Smart Constructor
// ---------------------------------------------------------------------------

/**
 * Creates a SocialIdentity from validated input.
 *
 * The caller must provide `isOtherType` based on lookup table metadata.
 * When `isOtherType` is true, `otherDescription` is required and must be
 * non-empty after trimming.
 */
export const SocialIdentity = (
  input: SocialIdentityInput,
): Result<SocialIdentity, SocialIdentityError> => {
  const description = normalizeDescription(input.otherDescription);

  if (input.isOtherType && description === undefined) {
    return err("SI-001");
  }

  return ok({
    typeId: input.typeId,
    otherDescription: description,
  });
};
