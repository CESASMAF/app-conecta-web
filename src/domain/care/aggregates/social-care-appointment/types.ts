// =============================================================================
// SocialCareAppointment — Aggregate Type (Care)
// =============================================================================
// Represents a social care appointment with a professional.
// Immutable struct — mutations via spread returning new copy.
// =============================================================================

import type { AppointmentId } from "../../value-objects/appointment_id.ts";
import type { AppointmentType } from "../../value-objects/appointment_type.ts";
import type { ProfessionalId } from "../../../kernel/ids.ts";
import type { TimeStamp } from "../../../kernel/timestamp.ts";

// ---------------------------------------------------------------------------
// Aggregate Type
// ---------------------------------------------------------------------------

export type SocialCareAppointment = Readonly<{
  id: AppointmentId;
  date: TimeStamp;
  professionalInChargeId: ProfessionalId;
  type: AppointmentType;
  summary: string | undefined;
  actionPlan: string | undefined;
}>;

// ---------------------------------------------------------------------------
// Input Type
// ---------------------------------------------------------------------------

export type CreateAppointmentInput = Readonly<{
  id: AppointmentId;
  date: TimeStamp;
  professionalInChargeId: ProfessionalId;
  type: AppointmentType;
  summary?: string;
  actionPlan?: string;
}>;
