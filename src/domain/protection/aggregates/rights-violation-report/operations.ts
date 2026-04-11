// =============================================================================
// RightsViolationReport — Aggregate Operations (Protection)
// =============================================================================
// Pure functions for creating RightsViolationReport aggregates.
// Rules:
//   RVR-001: reportDate must not be in the future
//   RVR-002: if incidentDate provided, incidentDate <= reportDate
//   RVR-003: descriptionOfFact must not be empty
// =============================================================================

import { type Result, ok, err } from "../../../shared/result.ts";
import { now as tsNow } from "../../../kernel/timestamp.ts";
import type { ViolationReportError } from "../../errors.ts";
import type { RightsViolationReport, CreateViolationReportInput } from "./types.ts";

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

/**
 * Creates a new RightsViolationReport aggregate.
 * Validates RVR-001, RVR-002, and RVR-003.
 */
export const createViolationReport = (
  input: CreateViolationReportInput,
): Result<RightsViolationReport, ViolationReportError> => {
  // RVR-001: reportDate must not be in the future
  const currentTime = new Date(tsNow() as unknown as string);
  const reportDate = new Date(input.reportDate as unknown as string);
  if (reportDate.getTime() > currentTime.getTime()) {
    return err("RVR-001");
  }

  // RVR-002: if incidentDate provided, incidentDate <= reportDate
  if (input.incidentDate !== undefined) {
    const incidentDate = new Date(input.incidentDate as unknown as string);
    if (incidentDate.getTime() > reportDate.getTime()) {
      return err("RVR-002");
    }
  }

  // RVR-003: descriptionOfFact must not be empty
  if (input.descriptionOfFact.trim().length === 0) {
    return err("RVR-003");
  }

  return ok({
    id: input.id,
    reportDate: input.reportDate,
    incidentDate: input.incidentDate,
    victimId: input.victimId,
    violationType: input.violationType,
    descriptionOfFact: input.descriptionOfFact.trim(),
    actionsTaken: input.actionsTaken?.trim(),
  });
};
