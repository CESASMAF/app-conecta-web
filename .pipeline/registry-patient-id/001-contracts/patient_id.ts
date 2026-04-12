// =============================================================================
// Contract: PatientId — registry/patient_id
// =============================================================================
// Branded UUID type for Patient identification.
// Error code: PATID-001 (invalid UUID format).
// Normalization: trim + lowercase.
// Auto-generation: generatePatientId() via crypto.randomUUID().
// =============================================================================

import type { Brand } from "../../../src/domain/shared/brand.ts";
import type { Result } from "../../../src/domain/shared/result.ts";

// ---------------------------------------------------------------------------
// Branded Type
// ---------------------------------------------------------------------------

/** Patient identifier stored as a normalized lowercase UUID. */
export type PatientId = Brand<string, "PatientId">;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

/** PATID-001: invalid UUID format */
export type PatientIdError = "PATID-001";

// ---------------------------------------------------------------------------
// Smart Constructor
// ---------------------------------------------------------------------------

/**
 * Validates and creates a PatientId from a raw string.
 * Normalization: trim + lowercase.
 * Validation: UUID regex (8-4-4-4-12 hex).
 */
export declare const PatientId: (raw: string) => Result<PatientId, PatientIdError>;

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

/**
 * Generates a new PatientId using crypto.randomUUID().
 * Always produces a valid branded PatientId (no validation needed).
 */
export declare const generatePatientId: () => PatientId;
