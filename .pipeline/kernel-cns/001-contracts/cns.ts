// =============================================================================
// CNS (Cartao Nacional de Saude) — Contract
// =============================================================================
// Compound Value Object: number (15 digits) + cpf (branded) + optional qrCode.
//
// Validation rules:
//   CNS-001: number must not be empty after trim
//   CNS-002: number must be exactly 15 digits after sanitization
//   CNS-003: first digit must be 1, 2, 7, 8, or 9
//   CNS-005: checksum validation (definitivo or provisorio algorithm)
//
// Cross-validation (enforced at higher level, NOT here):
//   CVD-002: When both CivilDocuments.cpf and CNS.cpf exist, they must match.
//
// Format output: "XXX XXXX XXXX XXXX"
// =============================================================================

import type { Brand } from "../../src/domain/shared/brand.ts";
import type { Result } from "../../src/domain/shared/result.ts";
import type { CPF } from "../../src/domain/kernel/cpf.ts";

// ---------------------------------------------------------------------------
// Type
// ---------------------------------------------------------------------------

type CNS = Readonly<{
  number: string; // 15 sanitized digits
  cpf: CPF; // branded CPF from kernel/cpf.ts
  qrCode: string | undefined;
}>;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

type CNSError = "CNS-001" | "CNS-002" | "CNS-003" | "CNS-005";

// ---------------------------------------------------------------------------
// Smart Constructor Signature
// ---------------------------------------------------------------------------

// CNS(input: { number: string; cpf: CPF; qrCode?: string }) => Result<CNS, CNSError>

// ---------------------------------------------------------------------------
// Formatter Signature
// ---------------------------------------------------------------------------

// formatCNS(cns: CNS) => string
// Output: "XXX XXXX XXXX XXXX"

// ---------------------------------------------------------------------------
// Checksum Algorithms
// ---------------------------------------------------------------------------
//
// DEFINITIVO (first digit 1 or 2 — PIS-based):
//   1. PIS = first 11 digits
//   2. Weights: [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5]
//   3. sum = sum(PIS[i] * weight[i])
//   4. resto = sum % 11, dv = 11 - resto
//   5. If dv == 11 then dv = 0
//   6. If dv == 10: sum2 = sum + 2, resto2 = sum2 % 11, dv2 = 11 - resto2,
//      expected = PIS + "001" + str(dv2)
//   7. Else: expected = PIS + "000" + str(dv)
//   8. Compare input with expected
//
// PROVISORIO (first digit 7, 8, or 9):
//   1. Weights: [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
//   2. sum = sum(digit[i] * weight[i]) for all 15 digits
//   3. Valid if sum % 11 == 0

export type { CNS, CNSError };
