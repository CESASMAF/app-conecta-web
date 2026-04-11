// =============================================================================
// ReportRightsViolation — Use Case (Protection)
// =============================================================================
// Validates raw input via domain smart constructors, calls createViolationReport,
// then proxies to backend.
// Sequence: validate → domain → proxy POST
// =============================================================================

import type { Result } from "../../../domain/shared/result.ts";
import { err } from "../../../domain/shared/result.ts";
import { PatientId } from "../../../domain/registry/value-objects/patient_id.ts";
import { PersonId } from "../../../domain/kernel/ids.ts";
import { TimeStamp } from "../../../domain/kernel/timestamp.ts";
import { ViolationType } from "../../../domain/protection/value-objects/violation_type.ts";
import { generateViolationReportId } from "../../../domain/protection/value-objects/violation_report_id.ts";
import { createViolationReport } from "../../../domain/protection/aggregates/rights-violation-report/operations.ts";
import type { ViolationReportError } from "../../../domain/protection/errors.ts";
import type { ViolationTypeError } from "../../../domain/protection/value-objects/violation_type.ts";
import type { TimeStampError } from "../../../domain/kernel/timestamp.ts";
import type { UseCase, BackendProxy, ProxyError } from "../../shared/types.ts";

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export type ReportRightsViolationRawInput = Readonly<{
  patientId: string;
  reportDate: string;
  incidentDate?: string;
  victimId: string;
  violationType: string;
  descriptionOfFact: string;
  actionsTaken?: string;
  actorId: string;
}>;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

export type ReportRightsViolationError =
  | ViolationReportError
  | ViolationTypeError
  | TimeStampError
  | ProxyError
  | "INVALID_PATIENT_ID"
  | "INVALID_PERSON_ID"
  | "INVALID_TIMESTAMP"
  | "INVALID_VIOLATION_TYPE";

// ---------------------------------------------------------------------------
// Deps
// ---------------------------------------------------------------------------

export type ReportRightsViolationDeps = Readonly<{
  proxy: BackendProxy;
}>;

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export const reportRightsViolation = (
  deps: ReportRightsViolationDeps,
): UseCase<ReportRightsViolationRawInput, unknown, ReportRightsViolationError> =>
  async (input) => {
    // 1. Validate PatientId
    const patientId = PatientId(input.patientId);
    if (!patientId.ok) return err("INVALID_PATIENT_ID");

    // 2. Validate reportDate
    const reportDate = TimeStamp(input.reportDate);
    if (!reportDate.ok) return err("INVALID_TIMESTAMP");

    // 3. Validate incidentDate (optional)
    const incidentDate = input.incidentDate !== undefined
      ? TimeStamp(input.incidentDate)
      : undefined;
    if (incidentDate !== undefined && !incidentDate.ok) return err("INVALID_TIMESTAMP");

    // 4. Validate victimId
    const victimId = PersonId(input.victimId);
    if (!victimId.ok) return err("INVALID_PERSON_ID");

    // 5. Validate ViolationType
    const violationType = ViolationType(input.violationType);
    if (!violationType.ok) return violationType;

    // 6. Domain — create violation report
    const report = createViolationReport({
      id: generateViolationReportId(),
      reportDate: reportDate.value,
      incidentDate: incidentDate?.ok ? incidentDate.value : undefined,
      victimId: victimId.value,
      violationType: violationType.value,
      descriptionOfFact: input.descriptionOfFact,
      actionsTaken: input.actionsTaken,
    });
    if (!report.ok) return report;

    // 7. Proxy to backend
    return deps.proxy.post(
      `/api/v1/patients/${patientId.value}/violation-reports`,
      report.value,
      input.actorId,
    ) as Promise<Result<unknown, ProxyError>>;
  };
