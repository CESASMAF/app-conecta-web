// =============================================================================
// AppointmentRepository — Repository Contract (Care)
// =============================================================================
// Type-only contract for appointment persistence.
// Implementations live in src/adapters/ — never in domain.
// =============================================================================

import type { Result } from "../../shared/result.ts";
import type { AppointmentId } from "../value-objects/appointment_id.ts";
import type { SocialCareAppointment } from "../aggregates/social-care-appointment/types.ts";

// ---------------------------------------------------------------------------
// Repository Contract
// ---------------------------------------------------------------------------

export type AppointmentRepository = Readonly<{
  findById: (id: AppointmentId) => Promise<Result<SocialCareAppointment, "NOT_FOUND">>;
  save: (appointment: SocialCareAppointment) => Promise<Result<void, "CONFLICT">>;
}>;
