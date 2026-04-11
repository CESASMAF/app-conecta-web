// =============================================================================
// Protection Application — Error Union
// =============================================================================
// Aggregates all possible errors from Protection use cases.
// Domain validation errors + proxy errors + application-specific errors.
// =============================================================================

import type { ReferralError, ViolationReportError, PlacementError } from "../../domain/protection/errors.ts";
import type { DestinationServiceError } from "../../domain/protection/value-objects/destination_service.ts";
import type { ViolationTypeError } from "../../domain/protection/value-objects/violation_type.ts";
import type { PatientIdError } from "../../domain/registry/value-objects/patient_id.ts";
import type { PersonIdError, ProfessionalIdError } from "../../domain/kernel/ids.ts";
import type { TimeStampError } from "../../domain/kernel/timestamp.ts";
import type { ProxyError } from "../shared/types.ts";

export type ProtectionAppError =
  | ReferralError
  | ViolationReportError
  | PlacementError
  | DestinationServiceError
  | ViolationTypeError
  | PatientIdError
  | PersonIdError
  | ProfessionalIdError
  | TimeStampError
  | ProxyError
  | "INVALID_PATIENT_ID"
  | "INVALID_PROFESSIONAL_ID"
  | "INVALID_PERSON_ID"
  | "INVALID_TIMESTAMP"
  | "INVALID_DESTINATION_SERVICE"
  | "INVALID_VIOLATION_TYPE";
