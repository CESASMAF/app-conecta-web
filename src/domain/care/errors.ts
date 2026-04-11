// =============================================================================
// Care — Error Unions
// =============================================================================
// Centralized error literal types for the Care bounded context.
// SCA-001: date is in the future
// SCA-002: neither summary nor actionPlan provided
// SCA-003: summary exceeds 500 characters
// SCA-004: actionPlan exceeds 2000 characters
// =============================================================================

/** Error codes for SocialCareAppointment aggregate operations. */
export type AppointmentError =
  | "SCA-001"
  | "SCA-002"
  | "SCA-003"
  | "SCA-004";
