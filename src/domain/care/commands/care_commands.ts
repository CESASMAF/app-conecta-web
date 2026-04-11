// =============================================================================
// Care — Commands (Discriminated Union)
// =============================================================================
// Command types for the Care bounded context.
// Each variant has a `type` discriminant for exhaustive switching.
// =============================================================================

import type { PatientId } from "../../registry/value-objects/patient_id.ts";
import type { IngressInfo } from "../value-objects/ingress_info.ts";
import type { CreateAppointmentInput } from "../aggregates/social-care-appointment/types.ts";

// ---------------------------------------------------------------------------
// Command Union
// ---------------------------------------------------------------------------

export type CareCommand =
  | Readonly<{
      type: "RegisterAppointment";
      input: CreateAppointmentInput;
    }>
  | Readonly<{
      type: "RegisterIntakeInfo";
      patientId: PatientId;
      ingressInfo: IngressInfo;
    }>;
