// =============================================================================
// Contract — SocialIdentity Value Object
// =============================================================================
// Bounded Context: Registry
// Source: registry.yaml → SocialIdentity
//
// Fields:
//   - typeId: LookupId (branded UUID, required)
//   - otherDescription: string | undefined (optional, trim + null_if_empty)
//
// Business Rules:
//   - SI-001: When typeId corresponds to "OUTRAS" type (isOtherType=true),
//             otherDescription is required and must be non-empty after trim.
//
// Design Decisions:
//   - The "is other type" check depends on lookup table data unavailable in the
//     domain layer. The smart constructor receives a boolean `isOtherType` flag
//     resolved by the caller (application layer).
//   - otherDescription is trimmed; empty/whitespace-only strings become undefined.
// =============================================================================

import type { LookupId } from "../../../src/domain/kernel/ids.ts";
import type { Result } from "../../../src/domain/shared/result.ts";

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
// Smart Constructor Signature
// ---------------------------------------------------------------------------

export type SocialIdentityConstructor = (
  input: SocialIdentityInput,
) => Result<SocialIdentity, SocialIdentityError>;
