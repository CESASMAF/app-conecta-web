// =============================================================================
// CreateReferral — Use Case (Protection)
// =============================================================================
// Validates raw input via domain smart constructors, calls createReferral,
// then proxies to backend.
// Sequence: validate → domain → proxy POST
// =============================================================================

import type { Result } from "../../../domain/shared/result.ts";
import { err } from "../../../domain/shared/result.ts";
import { PatientId } from "../../../domain/registry/value-objects/patient_id.ts";
import { ProfessionalId, PersonId } from "../../../domain/kernel/ids.ts";
import { TimeStamp } from "../../../domain/kernel/timestamp.ts";
import { DestinationService } from "../../../domain/protection/value-objects/destination_service.ts";
import { generateReferralId } from "../../../domain/protection/value-objects/referral_id.ts";
import { createReferral } from "../../../domain/protection/aggregates/referral/operations.ts";
import type { ReferralError } from "../../../domain/protection/errors.ts";
import type { DestinationServiceError } from "../../../domain/protection/value-objects/destination_service.ts";
import type { TimeStampError } from "../../../domain/kernel/timestamp.ts";
import type { UseCase, BackendProxy, ProxyError } from "../../shared/types.ts";

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export type CreateReferralRawInput = Readonly<{
  patientId: string;
  date: string;
  requestingProfessionalId: string;
  referredPersonId: string;
  destinationService: string;
  reason: string;
  actorId: string;
}>;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

export type CreateReferralError =
  | ReferralError
  | DestinationServiceError
  | TimeStampError
  | ProxyError
  | "INVALID_PATIENT_ID"
  | "INVALID_PROFESSIONAL_ID"
  | "INVALID_PERSON_ID"
  | "INVALID_TIMESTAMP"
  | "INVALID_DESTINATION_SERVICE";

// ---------------------------------------------------------------------------
// Deps
// ---------------------------------------------------------------------------

export type CreateReferralDeps = Readonly<{
  proxy: BackendProxy;
}>;

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export const createReferralUseCase = (
  deps: CreateReferralDeps,
): UseCase<CreateReferralRawInput, unknown, CreateReferralError> =>
  async (input) => {
    // 1. Validate PatientId
    const patientId = PatientId(input.patientId);
    if (!patientId.ok) return err("INVALID_PATIENT_ID");

    // 2. Validate TimeStamp
    const date = TimeStamp(input.date);
    if (!date.ok) return err("INVALID_TIMESTAMP");

    // 3. Validate ProfessionalId
    const professionalId = ProfessionalId(input.requestingProfessionalId);
    if (!professionalId.ok) return err("INVALID_PROFESSIONAL_ID");

    // 4. Validate PersonId
    const personId = PersonId(input.referredPersonId);
    if (!personId.ok) return err("INVALID_PERSON_ID");

    // 5. Validate DestinationService
    const destinationService = DestinationService(input.destinationService);
    if (!destinationService.ok) return destinationService;

    // 6. Domain — create referral aggregate
    const referral = createReferral({
      id: generateReferralId(),
      date: date.value,
      requestingProfessionalId: professionalId.value,
      referredPersonId: personId.value,
      destinationService: destinationService.value,
      reason: input.reason,
    });
    if (!referral.ok) return referral;

    // 7. Proxy to backend
    return deps.proxy.post(
      `/api/v1/patients/${patientId.value}/referrals`,
      referral.value,
      input.actorId,
    ) as Promise<Result<unknown, ProxyError>>;
  };
