import { assertEquals } from "@std/assert";
import {
  createPlacementHistory,
  addPlacement,
} from "../../../src/domain/protection/entities/placement_history.ts";
import type {
  PlacementRegistry,
  CreatePlacementHistoryInput,
} from "../../../src/domain/protection/entities/placement_history.ts";
import { generatePersonId } from "../../../src/domain/kernel/ids.ts";
import { generatePatientId } from "../../../src/domain/registry/value-objects/patient_id.ts";
import { TimeStamp } from "../../../src/domain/kernel/timestamp.ts";
import type { TimeStamp as TimeStampType } from "../../../src/domain/kernel/timestamp.ts";
import type { PersonId } from "../../../src/domain/kernel/ids.ts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeTimestamp = (raw: string): TimeStampType => {
  const result = TimeStamp(raw);
  if (!result.ok) throw new Error(`Test setup: invalid date ${raw}`);
  return result.value;
};

const validPlacement = (options?: { withoutEndDate: true }): PlacementRegistry => ({
  id: crypto.randomUUID(),
  memberId: generatePersonId(),
  startDate: makeTimestamp("2024-01-01T00:00:00.000Z"),
  endDate: options?.withoutEndDate ? undefined : makeTimestamp("2024-06-01T00:00:00.000Z"),
  reason: "Temporary shelter placement",
});

const validInput = (placements?: readonly PlacementRegistry[]): CreatePlacementHistoryInput => ({
  familyId: generatePatientId(),
  individualPlacements: placements ?? [validPlacement()],
  collectiveSituations: {
    homeLossReport: undefined,
    thirdPartyGuardReport: undefined,
  },
  separationChecklist: {
    adultInPrison: false,
    adolescentInInternment: false,
  },
});

// =============================================================================
// createPlacementHistory — Happy Path
// =============================================================================

Deno.test("createPlacementHistory - valid input returns Ok", () => {
  const input = validInput();
  const result = createPlacementHistory(input);

  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.familyId, input.familyId);
    assertEquals(result.value.individualPlacements.length, 1);
    assertEquals(result.value.collectiveSituations.homeLossReport, undefined);
    assertEquals(result.value.separationChecklist.adultInPrison, false);
  }
});

Deno.test("createPlacementHistory - placement without endDate returns Ok", () => {
  const placement = validPlacement({ withoutEndDate: true });
  const input = validInput([placement]);
  const result = createPlacementHistory(input);

  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.individualPlacements[0]?.endDate, undefined);
  }
});

Deno.test("createPlacementHistory - empty placements returns Ok", () => {
  const input = validInput([]);
  const result = createPlacementHistory(input);

  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.individualPlacements.length, 0);
  }
});

// =============================================================================
// createPlacementHistory — Error Paths
// =============================================================================

Deno.test("createPlacementHistory - endDate before startDate returns PLC-001", () => {
  const placement: PlacementRegistry = {
    id: crypto.randomUUID(),
    memberId: generatePersonId(),
    startDate: makeTimestamp("2024-06-01T00:00:00.000Z"),
    endDate: makeTimestamp("2024-01-01T00:00:00.000Z"),
    reason: "Invalid dates",
  };

  const input = validInput([placement]);
  const result = createPlacementHistory(input);

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "PLC-001");
});

// =============================================================================
// addPlacement — Happy Path
// =============================================================================

Deno.test("addPlacement - valid placement appended to history", () => {
  const input = validInput([]);
  const historyResult = createPlacementHistory(input);
  if (!historyResult.ok) throw new Error("Test setup: create failed");

  const newPlacement = validPlacement();
  const result = addPlacement(historyResult.value, newPlacement);

  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.individualPlacements.length, 1);
    assertEquals(result.value.individualPlacements[0]?.id, newPlacement.id);
  }
});

Deno.test("addPlacement - placement without endDate appended", () => {
  const input = validInput([]);
  const historyResult = createPlacementHistory(input);
  if (!historyResult.ok) throw new Error("Test setup: create failed");

  const newPlacement = validPlacement({ withoutEndDate: true });
  const result = addPlacement(historyResult.value, newPlacement);

  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.individualPlacements.length, 1);
    assertEquals(result.value.individualPlacements[0]?.endDate, undefined);
  }
});

// =============================================================================
// addPlacement — Error Paths
// =============================================================================

Deno.test("addPlacement - endDate before startDate returns PLC-001", () => {
  const input = validInput([]);
  const historyResult = createPlacementHistory(input);
  if (!historyResult.ok) throw new Error("Test setup: create failed");

  const badPlacement: PlacementRegistry = {
    id: crypto.randomUUID(),
    memberId: generatePersonId(),
    startDate: makeTimestamp("2024-06-01T00:00:00.000Z"),
    endDate: makeTimestamp("2024-01-01T00:00:00.000Z"),
    reason: "Invalid dates",
  };

  const result = addPlacement(historyResult.value, badPlacement);
  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "PLC-001");
});
