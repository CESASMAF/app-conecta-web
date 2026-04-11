// =============================================================================
// AppointmentId — Value Object (Care)
// =============================================================================
// UUID-based branded type for appointment identification.
// Normalization: trim + lowercase. Validation: UUID v4-compatible regex.
// Supports auto-generation via crypto.randomUUID().
// =============================================================================

import type { Brand } from "../../shared/brand.ts";
import { type Result, ok, err } from "../../shared/result.ts";
import { normalizeUuid, isValidUuid } from "../../kernel/uuid.ts";

// ---------------------------------------------------------------------------
// Branded Type
// ---------------------------------------------------------------------------

/** Appointment identifier stored as a normalized lowercase UUID. */
export type AppointmentId = Brand<string, "AppointmentId">;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

/** AI-001: invalid UUID format */
export type AppointmentIdError = "AI-001";

// ---------------------------------------------------------------------------
// Smart Constructor
// ---------------------------------------------------------------------------

/**
 * Validates and creates an AppointmentId from a raw string.
 *
 * Uses `as unknown as AppointmentId` for branding because TypeScript cannot
 * narrow a plain string into a branded type — the phantom __brand tag only
 * exists at the type level and has no runtime representation.
 */
export const AppointmentId = (raw: string): Result<AppointmentId, AppointmentIdError> => {
  const normalized = normalizeUuid(raw);
  if (!isValidUuid(normalized)) {
    return err("AI-001");
  }
  return ok(normalized as unknown as AppointmentId);
};

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

/**
 * Generates a new AppointmentId using crypto.randomUUID().
 * Always produces a valid branded AppointmentId (no validation needed).
 *
 * Uses `as unknown as AppointmentId` — see branding note above.
 */
export const generateAppointmentId = (): AppointmentId =>
  crypto.randomUUID() as unknown as AppointmentId;
