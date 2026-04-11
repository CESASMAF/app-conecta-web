// =============================================================================
// RegisterAppointment — Use Case (Care)
// =============================================================================
// Validates raw input via domain smart constructors, calls createAppointment,
// then proxies to backend.
// Sequence: validate → domain → proxy POST
// =============================================================================

import type { Result } from "../../../domain/shared/result.ts";
import { err } from "../../../domain/shared/result.ts";
import { PatientId } from "../../../domain/registry/value-objects/patient_id.ts";
import { ProfessionalId } from "../../../domain/kernel/ids.ts";
import { TimeStamp } from "../../../domain/kernel/timestamp.ts";
import { AppointmentType } from "../../../domain/care/value-objects/appointment_type.ts";
import { generateAppointmentId } from "../../../domain/care/value-objects/appointment_id.ts";
import { createAppointment } from "../../../domain/care/aggregates/social-care-appointment/operations.ts";
import type { AppointmentError } from "../../../domain/care/errors.ts";
import type { AppointmentTypeError } from "../../../domain/care/value-objects/appointment_type.ts";
import type { TimeStampError } from "../../../domain/kernel/timestamp.ts";
import type { UseCase, BackendProxy, ProxyError } from "../../shared/types.ts";

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export type RegisterAppointmentRawInput = Readonly<{
  patientId: string;
  date: string;
  professionalInChargeId: string;
  type: string;
  summary?: string;
  actionPlan?: string;
  actorId: string;
}>;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

export type RegisterAppointmentError =
  | AppointmentError
  | AppointmentTypeError
  | TimeStampError
  | ProxyError
  | "INVALID_PATIENT_ID"
  | "INVALID_PROFESSIONAL_ID"
  | "INVALID_TIMESTAMP";

// ---------------------------------------------------------------------------
// Deps
// ---------------------------------------------------------------------------

export type RegisterAppointmentDeps = Readonly<{
  proxy: BackendProxy;
}>;

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export const registerAppointment = (
  deps: RegisterAppointmentDeps,
): UseCase<RegisterAppointmentRawInput, unknown, RegisterAppointmentError> =>
  async (input) => {
    // 1. Validate PatientId
    const patientId = PatientId(input.patientId);
    if (!patientId.ok) return err("INVALID_PATIENT_ID");

    // 2. Validate TimeStamp
    const date = TimeStamp(input.date);
    if (!date.ok) return err("INVALID_TIMESTAMP");

    // 3. Validate ProfessionalId
    const professionalId = ProfessionalId(input.professionalInChargeId);
    if (!professionalId.ok) return err("INVALID_PROFESSIONAL_ID");

    // 4. Validate AppointmentType
    const appointmentType = AppointmentType(input.type);
    if (!appointmentType.ok) return appointmentType;

    // 5. Domain — create appointment aggregate
    const appointment = createAppointment({
      id: generateAppointmentId(),
      date: date.value,
      professionalInChargeId: professionalId.value,
      type: appointmentType.value,
      summary: input.summary,
      actionPlan: input.actionPlan,
    });
    if (!appointment.ok) return appointment;

    // 6. Proxy to backend
    return deps.proxy.post(
      `/api/v1/patients/${patientId.value}/appointments`,
      appointment.value,
      input.actorId,
    ) as Promise<Result<unknown, ProxyError>>;
  };
