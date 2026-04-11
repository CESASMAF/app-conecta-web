// =============================================================================
// ViolationReportRepository — Type Contract (Protection)
// =============================================================================
// Port for RightsViolationReport aggregate persistence. Implementation in adapters.
// =============================================================================

import type { Result } from "../../shared/result.ts";
import type { ViolationReportId } from "../value-objects/violation_report_id.ts";
import type { RightsViolationReport } from "../aggregates/rights-violation-report/types.ts";

// ---------------------------------------------------------------------------
// Repository Contract
// ---------------------------------------------------------------------------

export type ViolationReportRepository = Readonly<{
  findById: (id: ViolationReportId) => Promise<Result<RightsViolationReport, "NOT_FOUND">>;
  save: (report: RightsViolationReport) => Promise<Result<void, "CONFLICT">>;
}>;
