// =============================================================================
// Care Application — Error Union
// =============================================================================
// Aggregates all possible errors from Care use cases.
// Domain validation errors + proxy errors + application-specific errors.
// =============================================================================

import type { AppointmentError } from "../../domain/care/errors.ts";
import type { AppointmentTypeError } from "../../domain/care/value-objects/appointment_type.ts";
import type { IngressInfoError } from "../../domain/care/value-objects/ingress_info.ts";
import type { PatientIdError } from "../../domain/registry/value-objects/patient_id.ts";
import type { ProfessionalIdError, LookupIdError } from "../../domain/kernel/ids.ts";
import type { TimeStampError } from "../../domain/kernel/timestamp.ts";
import type { ProxyError } from "../shared/types.ts";

export type CareAppError =
  | AppointmentError
  | AppointmentTypeError
  | IngressInfoError
  | PatientIdError
  | ProfessionalIdError
  | LookupIdError
  | TimeStampError
  | ProxyError
  | "INVALID_PATIENT_ID"
  | "INVALID_PROFESSIONAL_ID"
  | "INVALID_TIMESTAMP"
  | "INVALID_LOOKUP_ID";
