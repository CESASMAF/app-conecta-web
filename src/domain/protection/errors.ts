// =============================================================================
// Protection Bounded Context — Error Literal Unions
// =============================================================================
// All domain errors for Protection are string literal unions.
// No Error subclasses, no exceptions.
// =============================================================================

// ---------------------------------------------------------------------------
// Referral Errors
// ---------------------------------------------------------------------------

/** REF-001: date not in future | REF-002: reason not empty | REF-003: invalid status transition */
export type ReferralError = "REF-001" | "REF-002" | "REF-003";

// ---------------------------------------------------------------------------
// ViolationReport Errors
// ---------------------------------------------------------------------------

/** RVR-001: reportDate not in future | RVR-002: incidentDate <= reportDate | RVR-003: descriptionOfFact not empty */
export type ViolationReportError = "RVR-001" | "RVR-002" | "RVR-003";

// ---------------------------------------------------------------------------
// PlacementHistory Errors
// ---------------------------------------------------------------------------

/** PLC-001: if endDate provided, endDate >= startDate */
export type PlacementError = "PLC-001";

// ---------------------------------------------------------------------------
// Aggregate Union
// ---------------------------------------------------------------------------

export type ProtectionError = ReferralError | ViolationReportError | PlacementError;
