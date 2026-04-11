import { assertEquals } from "@std/assert";
import {
  ViolationReportId,
  generateViolationReportId,
} from "../../../src/domain/protection/value-objects/violation_report_id.ts";

// =============================================================================
// ViolationReportId Smart Constructor — Happy Path
// =============================================================================

Deno.test("ViolationReportId - valid lowercase UUID returns Ok", () => {
  const result = ViolationReportId("550e8400-e29b-41d4-a716-446655440000");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "550e8400-e29b-41d4-a716-446655440000" as unknown);
  }
});

Deno.test("ViolationReportId - valid uppercase UUID normalizes to lowercase", () => {
  const result = ViolationReportId("550E8400-E29B-41D4-A716-446655440000");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "550e8400-e29b-41d4-a716-446655440000" as unknown);
  }
});

Deno.test("ViolationReportId - UUID with leading/trailing spaces trims", () => {
  const result = ViolationReportId("  550e8400-e29b-41d4-a716-446655440000  ");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "550e8400-e29b-41d4-a716-446655440000" as unknown);
  }
});

// =============================================================================
// ViolationReportId Smart Constructor — Error Path
// =============================================================================

Deno.test("ViolationReportId - empty string returns VRI-001", () => {
  const result = ViolationReportId("");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "VRI-001");
  }
});

Deno.test("ViolationReportId - invalid format returns VRI-001", () => {
  const result = ViolationReportId("not-a-uuid");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "VRI-001");
  }
});

// =============================================================================
// Generator
// =============================================================================

Deno.test("generateViolationReportId - returns valid ViolationReportId", () => {
  const id = generateViolationReportId();
  const result = ViolationReportId(id as unknown as string);
  assertEquals(result.ok, true);
});
