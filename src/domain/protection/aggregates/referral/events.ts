// =============================================================================
// Referral — Domain Events (Protection)
// =============================================================================

import type { TimeStamp } from "../../../kernel/timestamp.ts";
import type { ReferralId } from "../../value-objects/referral_id.ts";
import type { ReferralStatus } from "../../value-objects/referral_status.ts";
import type { Referral } from "./types.ts";

// ---------------------------------------------------------------------------
// Event Types
// ---------------------------------------------------------------------------

export type ReferralCreated = Readonly<{
  type: "ReferralCreated";
  referral: Referral;
  at: TimeStamp;
}>;

export type ReferralStatusChanged = Readonly<{
  type: "ReferralStatusChanged";
  referralId: ReferralId;
  from: ReferralStatus;
  to: ReferralStatus;
  at: TimeStamp;
}>;

// ---------------------------------------------------------------------------
// Discriminated Union
// ---------------------------------------------------------------------------

export type ReferralEvent = ReferralCreated | ReferralStatusChanged;
