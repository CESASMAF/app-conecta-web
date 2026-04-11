// =============================================================================
// ReferralRepository — Type Contract (Protection)
// =============================================================================
// Port for Referral aggregate persistence. Implementation lives in adapters.
// =============================================================================

import type { Result } from "../../shared/result.ts";
import type { ReferralId } from "../value-objects/referral_id.ts";
import type { Referral } from "../aggregates/referral/types.ts";

// ---------------------------------------------------------------------------
// Repository Contract
// ---------------------------------------------------------------------------

export type ReferralRepository = Readonly<{
  findById: (id: ReferralId) => Promise<Result<Referral, "NOT_FOUND">>;
  save: (referral: Referral) => Promise<Result<void, "CONFLICT">>;
}>;
