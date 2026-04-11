// =============================================================================
// Referral — Aggregate Type (Protection)
// =============================================================================
// A referral to an external service for a person under care.
// =============================================================================

import type { PersonId, ProfessionalId } from "../../../kernel/ids.ts";
import type { TimeStamp } from "../../../kernel/timestamp.ts";
import type { ReferralId } from "../../value-objects/referral_id.ts";
import type { DestinationService } from "../../value-objects/destination_service.ts";
import type { ReferralStatus } from "../../value-objects/referral_status.ts";

// ---------------------------------------------------------------------------
// Aggregate Type
// ---------------------------------------------------------------------------

export type Referral = Readonly<{
  id: ReferralId;
  date: TimeStamp;
  requestingProfessionalId: ProfessionalId;
  referredPersonId: PersonId;
  destinationService: DestinationService;
  reason: string;
  status: ReferralStatus;
}>;

// ---------------------------------------------------------------------------
// Input Type
// ---------------------------------------------------------------------------

export type CreateReferralInput = Readonly<{
  id: ReferralId;
  date: TimeStamp;
  requestingProfessionalId: ProfessionalId;
  referredPersonId: PersonId;
  destinationService: DestinationService;
  reason: string;
}>;
