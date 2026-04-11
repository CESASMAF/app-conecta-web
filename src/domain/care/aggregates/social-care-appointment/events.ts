// =============================================================================
// Care — Domain Events
// =============================================================================
// Past-tense named events for the Care bounded context.
// Discriminated union with `type` field for exhaustive matching.
// =============================================================================

import type { PatientId } from "../../../registry/value-objects/patient_id.ts";
import type { TimeStamp } from "../../../kernel/timestamp.ts";
import type { IngressInfo } from "../../value-objects/ingress_info.ts";
import type { SocialCareAppointment } from "./types.ts";

// ---------------------------------------------------------------------------
// Event Union
// ---------------------------------------------------------------------------

export type CareEvent =
  | Readonly<{
      type: "AppointmentRegistered";
      appointment: SocialCareAppointment;
      at: TimeStamp;
    }>
  | Readonly<{
      type: "IntakeInfoRegistered";
      patientId: PatientId;
      ingressInfo: IngressInfo;
      at: TimeStamp;
    }>;
