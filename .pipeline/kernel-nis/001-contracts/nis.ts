// =============================================================================
// NIS (Numero de Identificacao Social) — Contract
// =============================================================================
// Types only: branded type, error union, smart constructor signature.
// =============================================================================

import type { Brand } from "../../../src/domain/shared/brand.ts";
import type { Result } from "../../../src/domain/shared/result.ts";

// ---------------------------------------------------------------------------
// Branded Type
// ---------------------------------------------------------------------------

/** NIS stored as 11 sanitized digits (no punctuation). */
export type NIS = Brand<string, "NIS">;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

export type NISError =
  | "NIS-001"   // empty after trim
  | "NIS-002";  // not exactly 11 digits after sanitization

// ---------------------------------------------------------------------------
// Smart Constructor Signature
// ---------------------------------------------------------------------------

export type NISConstructor = (raw: string) => Result<NIS, NISError>;
