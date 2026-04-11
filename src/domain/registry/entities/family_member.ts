// =============================================================================
// FamilyMember — Entity (Registry Bounded Context)
// =============================================================================
// Represents a family member associated with a Patient aggregate.
// Identity: personId (PersonId).
//
// RequiredDocument values are deduplicated and sorted alphabetically.
// =============================================================================

import type { PersonId } from "../../kernel/ids.ts";
import type { LookupId } from "../../kernel/ids.ts";
import type { TimeStamp } from "../../kernel/timestamp.ts";

// ---------------------------------------------------------------------------
// RequiredDocument
// ---------------------------------------------------------------------------

export type RequiredDocument = "CN" | "CPF" | "CTPS" | "RG" | "TE";

const VALID_DOCUMENTS: ReadonlySet<string> = new Set<RequiredDocument>([
  "CN",
  "CPF",
  "CTPS",
  "RG",
  "TE",
]);

const SORTED_ORDER: readonly RequiredDocument[] = [
  "CN",
  "CPF",
  "CTPS",
  "RG",
  "TE",
] as const;

// ---------------------------------------------------------------------------
// Entity Type
// ---------------------------------------------------------------------------

export type FamilyMember = Readonly<{
  personId: PersonId;
  relationshipId: LookupId;
  isPrimaryCaregiver: boolean;
  residesWithPatient: boolean;
  hasDisability: boolean;
  requiredDocuments: readonly RequiredDocument[];
  birthDate: TimeStamp;
}>;

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export type FamilyMemberInput = Readonly<{
  personId: PersonId;
  relationshipId: LookupId;
  isPrimaryCaregiver: boolean;
  residesWithPatient: boolean;
  hasDisability: boolean;
  requiredDocuments: readonly string[];
  birthDate: TimeStamp;
}>;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

/** FM-001: invalid required document value */
export type FamilyMemberError = "FM-001";

// ---------------------------------------------------------------------------
// Factory Function
// ---------------------------------------------------------------------------

import { type Result, ok, err } from "../../shared/result.ts";

/**
 * Creates a FamilyMember entity from input.
 * Deduplicates and sorts requiredDocuments alphabetically.
 * Returns FM-001 if any document value is not in the valid set.
 */
export const createFamilyMember = (
  input: FamilyMemberInput,
): Result<FamilyMember, FamilyMemberError> => {
  // Validate all document values
  for (const doc of input.requiredDocuments) {
    if (!VALID_DOCUMENTS.has(doc)) {
      return err("FM-001");
    }
  }

  // Deduplicate and sort
  const uniqueDocs = new Set(input.requiredDocuments);
  const sorted: readonly RequiredDocument[] = SORTED_ORDER.filter((d) =>
    uniqueDocs.has(d)
  );

  return ok({
    personId: input.personId,
    relationshipId: input.relationshipId,
    isPrimaryCaregiver: input.isPrimaryCaregiver,
    residesWithPatient: input.residesWithPatient,
    hasDisability: input.hasDisability,
    requiredDocuments: sorted,
    birthDate: input.birthDate,
  });
};
