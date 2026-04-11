import { assertEquals } from "@std/assert";
import { DestinationService } from "../../../src/domain/protection/value-objects/destination_service.ts";

// =============================================================================
// DestinationService Smart Constructor — Happy Path (all 6 values)
// =============================================================================

Deno.test("DestinationService - CRAS returns Ok", () => {
  const result = DestinationService("CRAS");
  assertEquals(result.ok, true);
  if (result.ok) assertEquals(result.value, "CRAS");
});

Deno.test("DestinationService - CREAS returns Ok", () => {
  const result = DestinationService("CREAS");
  assertEquals(result.ok, true);
  if (result.ok) assertEquals(result.value, "CREAS");
});

Deno.test("DestinationService - HEALTH_CARE returns Ok", () => {
  const result = DestinationService("HEALTH_CARE");
  assertEquals(result.ok, true);
  if (result.ok) assertEquals(result.value, "HEALTH_CARE");
});

Deno.test("DestinationService - EDUCATION returns Ok", () => {
  const result = DestinationService("EDUCATION");
  assertEquals(result.ok, true);
  if (result.ok) assertEquals(result.value, "EDUCATION");
});

Deno.test("DestinationService - LEGAL returns Ok", () => {
  const result = DestinationService("LEGAL");
  assertEquals(result.ok, true);
  if (result.ok) assertEquals(result.value, "LEGAL");
});

Deno.test("DestinationService - OTHER returns Ok", () => {
  const result = DestinationService("OTHER");
  assertEquals(result.ok, true);
  if (result.ok) assertEquals(result.value, "OTHER");
});

// =============================================================================
// DestinationService Smart Constructor — Error Path
// =============================================================================

Deno.test("DestinationService - INVALID returns DS-001", () => {
  const result = DestinationService("INVALID");
  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "DS-001");
});
