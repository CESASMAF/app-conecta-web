// =============================================================================
// CONTRACT — CivilDocuments Value Object
// =============================================================================
// Compound VO that groups CPF, NIS, and RGDocument.
// Invariant CD-001: at least one of the three must be present.
// Receives pre-validated branded types (CPF, NIS, RGDocument).
// =============================================================================

import type { CPF } from "../../../src/domain/kernel/cpf.ts";
import type { NIS } from "../../../src/domain/kernel/nis.ts";
import type { RGDocument } from "../../../src/domain/kernel/rg_document.ts";
import type { Result } from "../../../src/domain/shared/result.ts";

// ---------------------------------------------------------------------------
// Type
// ---------------------------------------------------------------------------

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
// Smart Constructor Signature
// ---------------------------------------------------------------------------

export type CivilDocumentsConstructor = (
  input: CivilDocumentsInput,
) => Result<CivilDocuments, CivilDocumentsError>;
