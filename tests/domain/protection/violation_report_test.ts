import { assertEquals } from "@std/assert";
import { createViolationReport } from "../../../src/domain/protection/aggregates/rights-violation-report/operations.ts";
import { generateViolationReportId } from "../../../src/domain/protection/value-objects/violation_report_id.ts";
import { generatePersonId } from "../../../src/domain/kernel/ids.ts";
import { TimeStamp } from "../../../src/domain/kernel/timestamp.ts";
import type { CreateViolationReportInput } from "../../../src/domain/protection/aggregates/rights-violation-report/types.ts";
import type { ViolationType } from "../../../src/domain/protection/value-objects/violation_type.ts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const pastDate = (): ReturnType<typeof TimeStamp> => TimeStamp("2024-01-15T10:00:00.000Z");

const earlierDate = (): ReturnType<typeof TimeStamp> => TimeStamp("2024-01-10T10:00:00.000Z");

const futureDate = (): ReturnType<typeof TimeStamp> => TimeStamp("2099-12-31T23:59:59.999Z");

const validInput = (): CreateViolationReportInput => {
  const dateResult = pastDate();
  if (!dateResult.ok) throw new Error("Test setup: invalid date");
  return {
    id: generateViolationReportId(),
    reportDate: dateResult.value,
    incidentDate: undefined,
    victimId: generatePersonId(),
    violationType: "NEGLECT" as ViolationType,
    descriptionOfFact: "Child found without supervision in public area",
    actionsTaken: undefined,
  };
};

// =============================================================================
// createViolationReport — Happy Path
// =============================================================================

Deno.test("createViolationReport - valid input returns Ok", () => {
  const input = validInput();
  const result = createViolationReport(input);

  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.id, input.id);
    assertEquals(result.value.reportDate, input.reportDate);
    assertEquals(result.value.incidentDate, undefined);
    assertEquals(result.value.victimId, input.victimId);
    assertEquals(result.value.violationType, input.violationType);
    assertEquals(result.value.descriptionOfFact, input.descriptionOfFact);
    assertEquals(result.value.actionsTaken, undefined);
  }
});

Deno.test("createViolationReport - valid without incidentDate returns Ok", () => {
  const input: CreateViolationReportInput = {
    ...validInput(),
    incidentDate: undefined,
  };

  const result = createViolationReport(input);
  assertEquals(result.ok, true);
  if (result.ok) assertEquals(result.value.incidentDate, undefined);
});

Deno.test("createViolationReport - valid with actionsTaken returns Ok", () => {
  const input: CreateViolationReportInput = {
    ...validInput(),
    actionsTaken: "Contacted CREAS and police",
  };

  const result = createViolationReport(input);
  assertEquals(result.ok, true);
  if (result.ok) assertEquals(result.value.actionsTaken, "Contacted CREAS and police");
});

Deno.test("createViolationReport - valid with incidentDate before reportDate returns Ok", () => {
  const reportResult = pastDate();
  const incidentResult = earlierDate();
  if (!reportResult.ok || !incidentResult.ok) throw new Error("Test setup: invalid date");

  const input: CreateViolationReportInput = {
    ...validInput(),
    reportDate: reportResult.value,
    incidentDate: incidentResult.value,
  };

  const result = createViolationReport(input);
  assertEquals(result.ok, true);
  if (result.ok) assertEquals(result.value.incidentDate, incidentResult.value);
});

// =============================================================================
// createViolationReport — Error Paths
// =============================================================================

Deno.test("createViolationReport - future reportDate returns RVR-001", () => {
  const dateResult = futureDate();
  if (!dateResult.ok) throw new Error("Test setup: invalid date");

  const input: CreateViolationReportInput = {
    ...validInput(),
    reportDate: dateResult.value,
  };

  const result = createViolationReport(input);
  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "RVR-001");
});

Deno.test("createViolationReport - incidentDate after reportDate returns RVR-002", () => {
  const reportResult = earlierDate();
  const incidentResult = pastDate();
  if (!reportResult.ok || !incidentResult.ok) throw new Error("Test setup: invalid date");

  const input: CreateViolationReportInput = {
    ...validInput(),
    reportDate: reportResult.value,
    incidentDate: incidentResult.value,
  };

  const result = createViolationReport(input);
  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "RVR-002");
});

Deno.test("createViolationReport - empty descriptionOfFact returns RVR-003", () => {
  const input: CreateViolationReportInput = {
    ...validInput(),
    descriptionOfFact: "",
  };

  const result = createViolationReport(input);
  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "RVR-003");
});

Deno.test("createViolationReport - whitespace-only descriptionOfFact returns RVR-003", () => {
  const input: CreateViolationReportInput = {
    ...validInput(),
    descriptionOfFact: "   ",
  };

  const result = createViolationReport(input);
  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "RVR-003");
});
