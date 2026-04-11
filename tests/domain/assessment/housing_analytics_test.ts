import { assertEquals } from "@std/assert";
import {
  density,
  isOvercrowded,
} from "../../../src/domain/assessment/services/housing_analytics.ts";

// =============================================================================
// density
// =============================================================================

Deno.test("density — 4 members, 2 bedrooms = 2.0", () => {
  assertEquals(density(4, 2), 2.0);
});

Deno.test("density — 0 members, 0 bedrooms = 1.0 (max(0,1)/max(0,1))", () => {
  assertEquals(density(0, 0), 1.0);
});

Deno.test("density — 10 members, 3 bedrooms = 10/3", () => {
  assertEquals(density(10, 3), 10 / 3);
});

Deno.test("density — 0 bedrooms uses 1 as divisor", () => {
  assertEquals(density(5, 0), 5.0);
});

Deno.test("density — 0 members uses 1 as numerator", () => {
  assertEquals(density(0, 3), 1 / 3);
});

// =============================================================================
// isOvercrowded
// =============================================================================

Deno.test("isOvercrowded — 10 members, 3 bedrooms = true (density > 3.0)", () => {
  assertEquals(isOvercrowded(10, 3), true);
});

Deno.test("isOvercrowded — 3 members, 1 bedroom = false (exactly 3.0, threshold is >3.0)", () => {
  assertEquals(isOvercrowded(3, 1), false);
});

Deno.test("isOvercrowded — 2 members, 1 bedroom = false", () => {
  assertEquals(isOvercrowded(2, 1), false);
});
