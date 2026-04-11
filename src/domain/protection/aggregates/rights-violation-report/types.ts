// =============================================================================
// RightsViolationReport — Aggregate Type (Protection)
// =============================================================================
// A report of a rights violation against a person under care.
// =============================================================================

import type { PersonId } from "../../../kernel/ids.ts";
import type { TimeStamp } from "../../../kernel/timestamp.ts";
import type { ViolationReportId } from "../../value-objects/violation_report_id.ts";
import type { ViolationType } from "../../value-objects/violation_type.ts";

// ---------------------------------------------------------------------------
// Aggregate Type
// ---------------------------------------------------------------------------

export type RightsViolationReport = Readonly<{
  id: ViolationReportId;
  reportDate: TimeStamp;
  incidentDate: TimeStamp | undefined;
  victimId: PersonId;
  violationType: ViolationType;
  descriptionOfFact: string;
  actionsTaken: string | undefined;
}>;

// ---------------------------------------------------------------------------
// Input Type
// ---------------------------------------------------------------------------

export type CreateViolationReportInput = Readonly<{
  id: ViolationReportId;
  reportDate: TimeStamp;
  incidentDate: TimeStamp | undefined;
  victimId: PersonId;
  violationType: ViolationType;
  descriptionOfFact: string;
  actionsTaken: string | undefined;
}>;
