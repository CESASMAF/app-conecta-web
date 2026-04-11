// =============================================================================
// HousingCondition — Value Object
// =============================================================================
// Captures the physical characteristics, infrastructure, and risk factors of a
// patient's housing. Used in the Assessment bounded context to evaluate living
// conditions as part of the social vulnerability analysis.
// =============================================================================

import { type Result, ok, err } from "../../shared/result.ts";

// ---------------------------------------------------------------------------
// Enum Types
// ---------------------------------------------------------------------------

export type HousingType =
  | "OWNED"
  | "RENTED"
  | "CEDED"
  | "SQUATTED";

export type WallMaterial =
  | "MASONRY"
  | "FINISHED_WOOD"
  | "MAKESHIFT_MATERIALS";

export type WaterSupply =
  | "PUBLIC_NETWORK"
  | "WELL_OR_SPRING"
  | "RAINWATER_HARVEST"
  | "WATER_TRUCK"
  | "OTHER";

export type ElectricityAccess =
  | "METERED_CONNECTION"
  | "IRREGULAR_CONNECTION"
  | "NO_ACCESS";

export type SewageDisposal =
  | "PUBLIC_SEWER"
  | "SEPTIC_TANK"
  | "RUDIMENTARY_PIT"
  | "OPEN_SEWAGE"
  | "NO_BATHROOM";

export type WasteCollection =
  | "DIRECT_COLLECTION"
  | "INDIRECT_COLLECTION"
  | "NO_COLLECTION";

export type AccessibilityLevel =
  | "FULLY_ACCESSIBLE"
  | "PARTIALLY_ACCESSIBLE"
  | "NOT_ACCESSIBLE";

// ---------------------------------------------------------------------------
// HousingCondition Type
// ---------------------------------------------------------------------------

export type HousingCondition = Readonly<{
  type: HousingType;
  wallMaterial: WallMaterial;
  numberOfRooms: number;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  waterSupply: WaterSupply;
  hasPipedWater: boolean;
  electricityAccess: ElectricityAccess;
  sewageDisposal: SewageDisposal;
  wasteCollection: WasteCollection;
  accessibilityLevel: AccessibilityLevel;
  isInGeographicRiskArea: boolean;
  hasDifficultAccess: boolean;
  isInSocialConflictArea: boolean;
  hasDiagnosticObservations: boolean;
}>;

// ---------------------------------------------------------------------------
// Input Type
// ---------------------------------------------------------------------------

export type HousingConditionInput = Readonly<{
  type: string;
  wallMaterial: string;
  numberOfRooms: number;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  waterSupply: string;
  hasPipedWater: boolean;
  electricityAccess: string;
  sewageDisposal: string;
  wasteCollection: string;
  accessibilityLevel: string;
  isInGeographicRiskArea: boolean;
  hasDifficultAccess: boolean;
  isInSocialConflictArea: boolean;
  hasDiagnosticObservations: boolean;
}>;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

export type HousingConditionError =
  | "HC-001" // numberOfRooms < 0
  | "HC-002" // numberOfBedrooms < 0
  | "HC-003" // numberOfBathrooms < 0
  | "HC-004" // numberOfBedrooms > numberOfRooms
  | "HC-005"; // invalid enum value

// ---------------------------------------------------------------------------
// Valid Enum Sets (module-private)
// ---------------------------------------------------------------------------

const VALID_HOUSING_TYPES: ReadonlySet<string> = new Set<HousingType>([
  "OWNED", "RENTED", "CEDED", "SQUATTED",
]);

const VALID_WALL_MATERIALS: ReadonlySet<string> = new Set<WallMaterial>([
  "MASONRY", "FINISHED_WOOD", "MAKESHIFT_MATERIALS",
]);

const VALID_WATER_SUPPLIES: ReadonlySet<string> = new Set<WaterSupply>([
  "PUBLIC_NETWORK", "WELL_OR_SPRING", "RAINWATER_HARVEST", "WATER_TRUCK", "OTHER",
]);

const VALID_ELECTRICITY_ACCESS: ReadonlySet<string> = new Set<ElectricityAccess>([
  "METERED_CONNECTION", "IRREGULAR_CONNECTION", "NO_ACCESS",
]);

const VALID_SEWAGE_DISPOSAL: ReadonlySet<string> = new Set<SewageDisposal>([
  "PUBLIC_SEWER", "SEPTIC_TANK", "RUDIMENTARY_PIT", "OPEN_SEWAGE", "NO_BATHROOM",
]);

const VALID_WASTE_COLLECTION: ReadonlySet<string> = new Set<WasteCollection>([
  "DIRECT_COLLECTION", "INDIRECT_COLLECTION", "NO_COLLECTION",
]);

const VALID_ACCESSIBILITY_LEVELS: ReadonlySet<string> = new Set<AccessibilityLevel>([
  "FULLY_ACCESSIBLE", "PARTIALLY_ACCESSIBLE", "NOT_ACCESSIBLE",
]);

// ---------------------------------------------------------------------------
// Smart Constructor
// ---------------------------------------------------------------------------

/**
 * Validates and creates a HousingCondition from raw input.
 *
 * Validation order (fail-first):
 * 1. Enum fields (HC-005)
 * 2. numberOfRooms >= 0 (HC-001)
 * 3. numberOfBedrooms >= 0 (HC-002)
 * 4. numberOfBathrooms >= 0 (HC-003)
 * 5. numberOfBedrooms <= numberOfRooms (HC-004)
 */
export const HousingCondition = (
  input: HousingConditionInput,
): Result<HousingCondition, HousingConditionError> => {
  // --- Enum validation ---
  if (!VALID_HOUSING_TYPES.has(input.type)) return err("HC-005");
  if (!VALID_WALL_MATERIALS.has(input.wallMaterial)) return err("HC-005");
  if (!VALID_WATER_SUPPLIES.has(input.waterSupply)) return err("HC-005");
  if (!VALID_ELECTRICITY_ACCESS.has(input.electricityAccess)) return err("HC-005");
  if (!VALID_SEWAGE_DISPOSAL.has(input.sewageDisposal)) return err("HC-005");
  if (!VALID_WASTE_COLLECTION.has(input.wasteCollection)) return err("HC-005");
  if (!VALID_ACCESSIBILITY_LEVELS.has(input.accessibilityLevel)) return err("HC-005");

  // --- Numeric validation ---
  if (input.numberOfRooms < 0) return err("HC-001");
  if (input.numberOfBedrooms < 0) return err("HC-002");
  if (input.numberOfBathrooms < 0) return err("HC-003");
  if (input.numberOfBedrooms > input.numberOfRooms) return err("HC-004");

  return ok({
    type: input.type as HousingType,
    wallMaterial: input.wallMaterial as WallMaterial,
    numberOfRooms: input.numberOfRooms,
    numberOfBedrooms: input.numberOfBedrooms,
    numberOfBathrooms: input.numberOfBathrooms,
    waterSupply: input.waterSupply as WaterSupply,
    hasPipedWater: input.hasPipedWater,
    electricityAccess: input.electricityAccess as ElectricityAccess,
    sewageDisposal: input.sewageDisposal as SewageDisposal,
    wasteCollection: input.wasteCollection as WasteCollection,
    accessibilityLevel: input.accessibilityLevel as AccessibilityLevel,
    isInGeographicRiskArea: input.isInGeographicRiskArea,
    hasDifficultAccess: input.hasDifficultAccess,
    isInSocialConflictArea: input.isInSocialConflictArea,
    hasDiagnosticObservations: input.hasDiagnosticObservations,
  });
};
