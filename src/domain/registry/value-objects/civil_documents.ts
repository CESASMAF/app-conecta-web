// =============================================================================
// CivilDocuments — Value Object
// =============================================================================
// Compound VO that groups CPF, NIS, and RGDocument.
// Invariant CD-001: at least one of the three must be present.
// Receives pre-validated branded types (CPF, NIS, RGDocument).
// =============================================================================

import type { CPF } from "../../kernel/cpf.ts";
import type { NIS } from "../../kernel/nis.ts";
import type { RGDocument } from "../../kernel/rg_document.ts";
import { type Result, ok, err } from "../../shared/result.ts";

// ---------------------------------------------------------------------------
// Type
// ---------------------------------------------------------------------------

/** Validated civil documents bundle. At least one document is always present. */
export type CivilDocuments = Readonly<{
  cpf: CPF | undefined;
  nis: NIS | undefined;
  rgDocument: RGDocument | undefined;
}>;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

export type CivilDocumentsError = "CD-001"; // at_least_one_present

// ---------------------------------------------------------------------------
// Input (pre-validated branded types)
// ---------------------------------------------------------------------------

export type CivilDocumentsInput = Readonly<{
  cpf?: CPF;
  nis?: NIS;
  rgDocument?: RGDocument;
}>;

// ---------------------------------------------------------------------------
// Smart Constructor
// ---------------------------------------------------------------------------

/**
 * Creates a CivilDocuments from pre-validated branded types.
 * Only checks the at_least_one invariant (CD-001).
 */
export const CivilDocuments = (
  input: CivilDocumentsInput,
): Result<CivilDocuments, CivilDocumentsError> => {
  const cpf = input.cpf;
  const nis = input.nis;
  const rgDocument = input.rgDocument;

  // CD-001: at least one document must be present
  if (cpf === undefined && nis === undefined && rgDocument === undefined) {
    return err("CD-001");
  }

  return ok({
    cpf,
    nis,
    rgDocument,
  });
};
