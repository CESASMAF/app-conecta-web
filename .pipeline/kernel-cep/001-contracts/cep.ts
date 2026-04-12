// =============================================================================
// CEP (Codigo de Enderecamento Postal) — Contract
// =============================================================================
// Defines the public API surface for the CEP Value Object.
// Implementation lives at src/domain/kernel/cep.ts
// =============================================================================

import type { Brand } from "../../../src/domain/shared/brand.ts";
import type { Result } from "../../../src/domain/shared/result.ts";

// ---------------------------------------------------------------------------
// Branded Type
// ---------------------------------------------------------------------------

/** CEP stored as 8 sanitized digits (no punctuation). */
export type CEP = Brand<string, "CEP">;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

export type CEPError =
  | "CEP-001" // empty after trim
  | "CEP-002" // invalid characters (only digits, whitespace, hyphens allowed)
  | "CEP-003" // not exactly 8 digits after sanitization
  | "CEP-004"; // not in any valid UF range

// ---------------------------------------------------------------------------
// Distribution Kind
// ---------------------------------------------------------------------------

export type DistributionKind =
  | "STREET_RANGE"
  | "SPECIAL_CODES"
  | "PROMOTIONAL"
  | "POST_OFFICE_UNITS"
  | "OTHER";

// ---------------------------------------------------------------------------
// Brazilian State (UF)
// ---------------------------------------------------------------------------

export type BrazilianState =
  | "AC" | "AL" | "AM" | "AP" | "BA" | "CE" | "DF" | "ES"
  | "GO" | "MA" | "MG" | "MS" | "MT" | "PA" | "PB" | "PE"
  | "PI" | "PR" | "RJ" | "RN" | "RO" | "RR" | "RS" | "SC"
  | "SE" | "SP" | "TO";

// ---------------------------------------------------------------------------
// Function Signatures
// ---------------------------------------------------------------------------

/** Smart constructor: validates and creates a CEP from a raw string. */
export declare const CEP: (raw: string) => Result<CEP, CEPError>;

/** Formats a validated CEP (8 digits) as "XXXXX-XXX". */
export declare const formatCEP: (cep: CEP) => string;

/** Derives the distribution kind from the last 3 digits of a validated CEP. */
export declare const distributionKind: (cep: CEP) => DistributionKind;

/** Derives the Brazilian state (UF) from the numeric range. Returns undefined if unmapped. */
export declare const cepState: (cep: CEP) => BrazilianState | undefined;
