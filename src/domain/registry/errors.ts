// =============================================================================
// Registry — Error Unions
// =============================================================================
// String literal union for all Patient aggregate invariant violations.
//
// PAT-001: diagnoses cannot be empty at creation
// PAT-002: exactly one "Pessoa de Referencia" (PR) required in family
// PAT-003: duplicate family member by personId
// PAT-004: adding a second PR when one already exists
// PAT-005: member not found (removal / promotion)
// PAT-006: referred person must belong to aggregate boundary
// PAT-007: victim must belong to aggregate boundary
// PAT-008: adolescentInInternment requires member 12-17 years old
// PAT-009: thirdPartyGuardReport requires member 0-17 years old
// =============================================================================

export type PatientError =
  | "PAT-001"
  | "PAT-002"
  | "PAT-003"
  | "PAT-004"
  | "PAT-005"
  | "PAT-006"
  | "PAT-007"
  | "PAT-008"
  | "PAT-009";
