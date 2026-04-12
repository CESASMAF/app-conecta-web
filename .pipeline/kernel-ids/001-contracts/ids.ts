// =============================================================================
// Kernel IDs Contract — PersonId, ProfessionalId, LookupId
// =============================================================================
// All three are UUID-based branded types with smart constructors.
// Normalization: trim + lowercase.
// PersonId and ProfessionalId support auto-generation via crypto.randomUUID().
// =============================================================================

import type { Brand } from "../../../src/domain/shared/brand.ts";
import type { Result } from "../../../src/domain/shared/result.ts";

// ---------------------------------------------------------------------------
// Branded Types
// ---------------------------------------------------------------------------

export type PersonId = Brand<string, "PersonId">;
export type ProfessionalId = Brand<string, "ProfessionalId">;
export type LookupId = Brand<string, "LookupId">;

// ---------------------------------------------------------------------------
// Error Unions
// ---------------------------------------------------------------------------

/** Invalid UUID format */
export type PersonIdError = "PID-001";

/** Invalid UUID format */
export type ProfessionalIdError = "PRID-001";

/** Invalid UUID format */
export type LookupIdError = "LID-001";

// ---------------------------------------------------------------------------
// Smart Constructor Signatures
// ---------------------------------------------------------------------------

export declare const PersonId: (raw: string) => Result<PersonId, PersonIdError>;
export declare const ProfessionalId: (raw: string) => Result<ProfessionalId, ProfessionalIdError>;
export declare const LookupId: (raw: string) => Result<LookupId, LookupIdError>;

// ---------------------------------------------------------------------------
// Generator Signatures (no validation needed — they produce valid UUIDs)
// ---------------------------------------------------------------------------

export declare const generatePersonId: () => PersonId;
export declare const generateProfessionalId: () => ProfessionalId;
