// =============================================================================
// Protection — Command Discriminated Unions
// =============================================================================

import type { ReferralId } from "../value-objects/referral_id.ts";
import type { ReferralStatus } from "../value-objects/referral_status.ts";
import type { PatientId } from "../../registry/value-objects/patient_id.ts";
import type { CreateReferralInput } from "../aggregates/referral/types.ts";
import type { CreateViolationReportInput } from "../aggregates/rights-violation-report/types.ts";
import type { CreatePlacementHistoryInput } from "../entities/placement_history.ts";

// ---------------------------------------------------------------------------
// Command Union
// ---------------------------------------------------------------------------

export type ProtectionCommand =
  | Readonly<{ type: "CreateReferral"; input: CreateReferralInput }>
  | Readonly<{ type: "TransitionReferralStatus"; referralId: ReferralId; newStatus: ReferralStatus }>
  | Readonly<{ type: "ReportRightsViolation"; input: CreateViolationReportInput }>
  | Readonly<{ type: "UpdatePlacementHistory"; patientId: PatientId; input: CreatePlacementHistoryInput }>;
