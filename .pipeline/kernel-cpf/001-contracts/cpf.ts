// =============================================================================
// CPF (Cadastro de Pessoa Fisica) -- Type-Level Contracts
// =============================================================================
// Branded type, error union, and function signatures for CPF value object.
// Zero implementations. Aligned with contracts/shared/validation-rules/kernel.yaml.
// =============================================================================

import type { Brand } from "../../../src/domain/shared/brand.ts";
import type { Result } from "../../../src/domain/shared/result.ts";

// ---------------------------------------------------------------------------
// Branded Type
// ---------------------------------------------------------------------------

/** CPF stored as 11 sanitized digits (no punctuation). */
export type CPF = Brand<string, "CPF">;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

/**
 * String literal union covering every CPF validation failure.
 *
 * | Code    | Meaning                                      |
 * |---------|----------------------------------------------|
 * | CPF-001 | Input is empty after trim                    |
 * | CPF-002 | Input contains chars outside digits/./- /ws  |
 * | CPF-003 | Not exactly 11 digits after sanitization     |
 * | CPF-004 | All 11 digits are identical                  |
 * | CPF-005 | Checksum (two check digits) is invalid       |
 */
export type CPFError =
  | "CPF-001"
  | "CPF-002"
  | "CPF-003"
  | "CPF-004"
  | "CPF-005";

// ---------------------------------------------------------------------------
// Fiscal Region (derived from digit at position 8)
// ---------------------------------------------------------------------------

/**
 * String literal union of fiscal region descriptions derived from CPF digit 8.
 * Mapping:
 *   0 -> "RS"
 *   1 -> "DF, GO, MS, MT, TO"
 *   2 -> "AC, AM, AP, PA, RO, RR"
 *   3 -> "CE, MA, PI"
 *   4 -> "AL, PB, PE, RN"
 *   5 -> "BA, SE"
 *   6 -> "MG"
 *   7 -> "ES, RJ"
 *   8 -> "SP"
 *   9 -> "PR, SC"
 */
export type FiscalRegion =
  | "RS"
  | "DF, GO, MS, MT, TO"
  | "AC, AM, AP, PA, RO, RR"
  | "CE, MA, PI"
  | "AL, PB, PE, RN"
  | "BA, SE"
  | "MG"
  | "ES, RJ"
  | "SP"
  | "PR, SC";

// ---------------------------------------------------------------------------
// Smart Constructor
// ---------------------------------------------------------------------------

/**
 * Validates and creates a CPF from a raw string input.
 *
 * Normalization: trim, remove ".- ", keep only digits.
 * Validation order: CPF-001 -> CPF-002 -> CPF-003 -> CPF-004 -> CPF-005.
 * On success the branded value contains 11 sanitized digits.
 */
export declare const CPF: (raw: string) => Result<CPF, CPFError>;

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

/**
 * Formats a validated CPF as "XXX.XXX.XXX-XX".
 * Accepts only a branded CPF (already validated).
 */
export declare const formatCPF: (cpf: CPF) => string;

// ---------------------------------------------------------------------------
// Derived Value
// ---------------------------------------------------------------------------

/**
 * Extracts the fiscal region from the digit at position 8 of a validated CPF.
 * Returns the region string (e.g. "SP", "RS", "MG").
 */
export declare const fiscalRegion: (cpf: CPF) => FiscalRegion;
