// =============================================================================
// UUID — Shared validation and normalization utilities
// =============================================================================
// Single source of truth for UUID regex, normalization, and validation.
// All ID-branded types import from here instead of defining their own.
// =============================================================================

/** UUID v4-compatible regex (lowercase hex, 8-4-4-4-12 groups). */
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** Trims whitespace and lowercases the input for UUID normalization. */
export const normalizeUuid = (raw: string): string => raw.trim().toLowerCase();

/** Returns true if the value matches the UUID v4-compatible format. */
export const isValidUuid = (value: string): boolean => UUID_REGEX.test(value);
