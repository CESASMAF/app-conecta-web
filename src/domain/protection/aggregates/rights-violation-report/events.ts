// =============================================================================
// RightsViolationReport — Domain Events (Protection)
// =============================================================================

import type { TimeStamp } from "../../../kernel/timestamp.ts";
import type { RightsViolationReport } from "./types.ts";

// ---------------------------------------------------------------------------
// Event Types
// ---------------------------------------------------------------------------

export type RightsViolationReported = Readonly<{
  type: "RightsViolationReported";
  report: RightsViolationReport;
  at: TimeStamp;
}>;

// ---------------------------------------------------------------------------
// Discriminated Union
// ---------------------------------------------------------------------------

export type ViolationReportEvent = RightsViolationReported;
