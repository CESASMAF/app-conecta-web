// =============================================================================
// IngressInfo — Compound Value Object (Care)
// =============================================================================
// Represents ingress information for a social care appointment.
// Contains ingress type, origin details, service reason, and linked programs.
// =============================================================================

import type { LookupId } from "../../kernel/ids.ts";
import { type Result, ok, err } from "../../shared/result.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LinkedProgram = Readonly<{
  programId: LookupId;
  observation: string | undefined;
}>;

export type IngressInfo = Readonly<{
  ingressTypeId: LookupId;
  originName: string | undefined;
  originContact: string | undefined;
  serviceReason: string;
  linkedSocialPrograms: readonly LinkedProgram[];
}>;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

/** ING-001: empty service reason */
export type IngressInfoError = "ING-001";

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export type LinkedProgramInput = Readonly<{
  programId: LookupId;
  observation: string | undefined;
}>;

export type IngressInfoInput = Readonly<{
  ingressTypeId: LookupId;
  originName: string | undefined;
  originContact: string | undefined;
  serviceReason: string;
  linkedSocialPrograms: readonly LinkedProgramInput[];
}>;

// ---------------------------------------------------------------------------
// Helpers (module-private)
// ---------------------------------------------------------------------------

/** Trims a string, returns undefined if empty or undefined. */
const trimOrUndefined = (value: string | undefined): string | undefined => {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

// ---------------------------------------------------------------------------
// Smart Constructor
// ---------------------------------------------------------------------------

/**
 * Validates and creates an IngressInfo from input.
 * originName and originContact are trimmed; empty strings become undefined.
 */
export const IngressInfo = (input: IngressInfoInput): Result<IngressInfo, IngressInfoError> => {
  // ING-001: service reason not empty
  const trimmedReason = input.serviceReason.trim();
  if (trimmedReason.length === 0) {
    return err("ING-001");
  }

  const programs: readonly LinkedProgram[] = input.linkedSocialPrograms.map(
    (p) => ({
      programId: p.programId,
      observation: trimOrUndefined(p.observation),
    }),
  );

  return ok({
    ingressTypeId: input.ingressTypeId,
    originName: trimOrUndefined(input.originName),
    originContact: trimOrUndefined(input.originContact),
    serviceReason: trimmedReason,
    linkedSocialPrograms: programs,
  });
};
