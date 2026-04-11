import { assertEquals } from "@std/assert";
import { HousingCondition } from "../../../src/domain/assessment/value-objects/housing_condition.ts";
import type { HousingConditionInput } from "../../../src/domain/assessment/value-objects/housing_condition.ts";

// =============================================================================
// Helper — valid full input
// =============================================================================

const validInput: HousingConditionInput = {
  type: "OWNED",
  wallMaterial: "MASONRY",
  numberOfRooms: 5,
  numberOfBedrooms: 3,
  numberOfBathrooms: 2,
  waterSupply: "PUBLIC_NETWORK",
  hasPipedWater: true,
  electricityAccess: "METERED_CONNECTION",
  sewageDisposal: "PUBLIC_SEWER",
  wasteCollection: "DIRECT_COLLECTION",
  accessibilityLevel: "FULLY_ACCESSIBLE",
  isInGeographicRiskArea: false,
  hasDifficultAccess: false,
  isInSocialConflictArea: false,
  hasDiagnosticObservations: false,
};

// =============================================================================
// Happy Path
// =============================================================================

Deno.test("HousingCondition - valid input returns Ok with all fields preserved", () => {
  const result = HousingCondition(validInput);
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.type, "OWNED");
    assertEquals(result.value.wallMaterial, "MASONRY");
    assertEquals(result.value.numberOfRooms, 5);
    assertEquals(result.value.numberOfBedrooms, 3);
    assertEquals(result.value.numberOfBathrooms, 2);
    assertEquals(result.value.waterSupply, "PUBLIC_NETWORK");
    assertEquals(result.value.hasPipedWater, true);
    assertEquals(result.value.electricityAccess, "METERED_CONNECTION");
    assertEquals(result.value.sewageDisposal, "PUBLIC_SEWER");
    assertEquals(result.value.wasteCollection, "DIRECT_COLLECTION");
    assertEquals(result.value.accessibilityLevel, "FULLY_ACCESSIBLE");
    assertEquals(result.value.isInGeographicRiskArea, false);
    assertEquals(result.value.hasDifficultAccess, false);
    assertEquals(result.value.isInSocialConflictArea, false);
    assertEquals(result.value.hasDiagnosticObservations, false);
  }
});

Deno.test("HousingCondition - valid with all enum variants", () => {
  const result = HousingCondition({
    ...validInput,
    type: "SQUATTED",
    wallMaterial: "MAKESHIFT_MATERIALS",
    waterSupply: "WATER_TRUCK",
    electricityAccess: "NO_ACCESS",
    sewageDisposal: "OPEN_SEWAGE",
    wasteCollection: "NO_COLLECTION",
    accessibilityLevel: "NOT_ACCESSIBLE",
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.type, "SQUATTED");
    assertEquals(result.value.wallMaterial, "MAKESHIFT_MATERIALS");
    assertEquals(result.value.waterSupply, "WATER_TRUCK");
    assertEquals(result.value.electricityAccess, "NO_ACCESS");
    assertEquals(result.value.sewageDisposal, "OPEN_SEWAGE");
    assertEquals(result.value.wasteCollection, "NO_COLLECTION");
    assertEquals(result.value.accessibilityLevel, "NOT_ACCESSIBLE");
  }
});

Deno.test("HousingCondition - zero rooms and zero bedrooms is valid", () => {
  const result = HousingCondition({
    ...validInput,
    numberOfRooms: 0,
    numberOfBedrooms: 0,
    numberOfBathrooms: 0,
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.numberOfRooms, 0);
    assertEquals(result.value.numberOfBedrooms, 0);
    assertEquals(result.value.numberOfBathrooms, 0);
  }
});

Deno.test("HousingCondition - boolean flags are preserved when true", () => {
  const result = HousingCondition({
    ...validInput,
    isInGeographicRiskArea: true,
    hasDifficultAccess: true,
    isInSocialConflictArea: true,
    hasDiagnosticObservations: true,
    hasPipedWater: false,
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.isInGeographicRiskArea, true);
    assertEquals(result.value.hasDifficultAccess, true);
    assertEquals(result.value.isInSocialConflictArea, true);
    assertEquals(result.value.hasDiagnosticObservations, true);
    assertEquals(result.value.hasPipedWater, false);
  }
});

// =============================================================================
// HC-001 — numberOfRooms < 0
// =============================================================================

Deno.test("HousingCondition - negative numberOfRooms returns HC-001", () => {
  const result = HousingCondition({ ...validInput, numberOfRooms: -1 });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "HC-001");
  }
});

// =============================================================================
// HC-002 — numberOfBedrooms < 0
// =============================================================================

Deno.test("HousingCondition - negative numberOfBedrooms returns HC-002", () => {
  const result = HousingCondition({ ...validInput, numberOfBedrooms: -1 });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "HC-002");
  }
});

// =============================================================================
// HC-003 — numberOfBathrooms < 0
// =============================================================================

Deno.test("HousingCondition - negative numberOfBathrooms returns HC-003", () => {
  const result = HousingCondition({ ...validInput, numberOfBathrooms: -1 });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "HC-003");
  }
});

// =============================================================================
// HC-004 — numberOfBedrooms > numberOfRooms
// =============================================================================

Deno.test("HousingCondition - bedrooms exceeding rooms returns HC-004", () => {
  const result = HousingCondition({
    ...validInput,
    numberOfRooms: 2,
    numberOfBedrooms: 3,
  });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "HC-004");
  }
});

Deno.test("HousingCondition - bedrooms equal to rooms is valid", () => {
  const result = HousingCondition({
    ...validInput,
    numberOfRooms: 3,
    numberOfBedrooms: 3,
  });
  assertEquals(result.ok, true);
});

// =============================================================================
// HC-005 — Invalid enum values
// =============================================================================

Deno.test("HousingCondition - invalid type returns HC-005", () => {
  const result = HousingCondition({ ...validInput, type: "BORROWED" });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "HC-005");
  }
});

Deno.test("HousingCondition - invalid wallMaterial returns HC-005", () => {
  const result = HousingCondition({ ...validInput, wallMaterial: "CONCRETE" });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "HC-005");
  }
});

Deno.test("HousingCondition - invalid waterSupply returns HC-005", () => {
  const result = HousingCondition({ ...validInput, waterSupply: "RIVER" });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "HC-005");
  }
});

Deno.test("HousingCondition - invalid electricityAccess returns HC-005", () => {
  const result = HousingCondition({ ...validInput, electricityAccess: "SOLAR" });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "HC-005");
  }
});

Deno.test("HousingCondition - invalid sewageDisposal returns HC-005", () => {
  const result = HousingCondition({ ...validInput, sewageDisposal: "CREEK" });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "HC-005");
  }
});

Deno.test("HousingCondition - invalid wasteCollection returns HC-005", () => {
  const result = HousingCondition({ ...validInput, wasteCollection: "BURNING" });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "HC-005");
  }
});

Deno.test("HousingCondition - invalid accessibilityLevel returns HC-005", () => {
  const result = HousingCondition({ ...validInput, accessibilityLevel: "UNKNOWN" });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "HC-005");
  }
});

Deno.test("HousingCondition - empty string enum returns HC-005", () => {
  const result = HousingCondition({ ...validInput, type: "" });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "HC-005");
  }
});
