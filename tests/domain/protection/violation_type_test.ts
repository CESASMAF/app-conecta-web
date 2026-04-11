import { assertEquals } from "@std/assert";
import { ViolationType } from "../../../src/domain/protection/value-objects/violation_type.ts";

// =============================================================================
// ViolationType Smart Constructor — Happy Path (all 9 values)
// =============================================================================

Deno.test("ViolationType - NEGLECT returns Ok", () => {
  const result = ViolationType("NEGLECT");
  assertEquals(result.ok, true);
  if (result.ok) assertEquals(result.value, "NEGLECT");
});

Deno.test("ViolationType - PSYCHOLOGICAL_VIOLENCE returns Ok", () => {
  const result = ViolationType("PSYCHOLOGICAL_VIOLENCE");
  assertEquals(result.ok, true);
  if (result.ok) assertEquals(result.value, "PSYCHOLOGICAL_VIOLENCE");
});

Deno.test("ViolationType - PHYSICAL_VIOLENCE returns Ok", () => {
  const result = ViolationType("PHYSICAL_VIOLENCE");
  assertEquals(result.ok, true);
  if (result.ok) assertEquals(result.value, "PHYSICAL_VIOLENCE");
});

Deno.test("ViolationType - SEXUAL_ABUSE returns Ok", () => {
  const result = ViolationType("SEXUAL_ABUSE");
  assertEquals(result.ok, true);
  if (result.ok) assertEquals(result.value, "SEXUAL_ABUSE");
});

Deno.test("ViolationType - SEXUAL_EXPLOITATION returns Ok", () => {
  const result = ViolationType("SEXUAL_EXPLOITATION");
  assertEquals(result.ok, true);
  if (result.ok) assertEquals(result.value, "SEXUAL_EXPLOITATION");
});

Deno.test("ViolationType - CHILD_LABOR returns Ok", () => {
  const result = ViolationType("CHILD_LABOR");
  assertEquals(result.ok, true);
  if (result.ok) assertEquals(result.value, "CHILD_LABOR");
});

Deno.test("ViolationType - FINANCIAL_EXPLOITATION returns Ok", () => {
  const result = ViolationType("FINANCIAL_EXPLOITATION");
  assertEquals(result.ok, true);
  if (result.ok) assertEquals(result.value, "FINANCIAL_EXPLOITATION");
});

Deno.test("ViolationType - DISCRIMINATION returns Ok", () => {
  const result = ViolationType("DISCRIMINATION");
  assertEquals(result.ok, true);
  if (result.ok) assertEquals(result.value, "DISCRIMINATION");
});

Deno.test("ViolationType - OTHER returns Ok", () => {
  const result = ViolationType("OTHER");
  assertEquals(result.ok, true);
  if (result.ok) assertEquals(result.value, "OTHER");
});

// =============================================================================
// ViolationType Smart Constructor — Error Path
// =============================================================================

Deno.test("ViolationType - INVALID returns VT-001", () => {
  const result = ViolationType("INVALID");
  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "VT-001");
});
