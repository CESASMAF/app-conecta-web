import { assertEquals } from "@std/assert";
import {
  calculateFinancialIndicators,
} from "../../../src/domain/assessment/services/financial_analytics.ts";

// =============================================================================
// calculateFinancialIndicators
// =============================================================================

Deno.test("financial — basic calculation with incomes and benefits", () => {
  const result = calculateFinancialIndicators(
    [{ monthlyAmount: 1000 }, { monthlyAmount: 500 }],
    [200, 300],
    4,
  );
  assertEquals(result.totalWorkIncome, 1500);
  assertEquals(result.perCapitaWorkIncome, 375);
  assertEquals(result.totalGlobalIncome, 2000);
  assertEquals(result.perCapitaGlobalIncome, 500);
});

Deno.test("financial — totalWorkIncome is sum of monthlyAmounts", () => {
  const result = calculateFinancialIndicators(
    [{ monthlyAmount: 800 }, { monthlyAmount: 1200 }, { monthlyAmount: 400 }],
    [],
    1,
  );
  assertEquals(result.totalWorkIncome, 2400);
});

Deno.test("financial — perCapitaWorkIncome = totalWorkIncome / members", () => {
  const result = calculateFinancialIndicators(
    [{ monthlyAmount: 3000 }],
    [],
    3,
  );
  assertEquals(result.perCapitaWorkIncome, 1000);
});

Deno.test("financial — totalGlobalIncome includes benefits", () => {
  const result = calculateFinancialIndicators(
    [{ monthlyAmount: 1000 }],
    [500, 250],
    2,
  );
  assertEquals(result.totalGlobalIncome, 1750);
  assertEquals(result.perCapitaGlobalIncome, 875);
});

Deno.test("financial — zero members uses 1 as divisor", () => {
  const result = calculateFinancialIndicators(
    [{ monthlyAmount: 1000 }],
    [500],
    0,
  );
  assertEquals(result.perCapitaWorkIncome, 1000);
  assertEquals(result.perCapitaGlobalIncome, 1500);
});

Deno.test("financial — empty incomes = 0 totalWorkIncome", () => {
  const result = calculateFinancialIndicators(
    [],
    [300],
    2,
  );
  assertEquals(result.totalWorkIncome, 0);
  assertEquals(result.perCapitaWorkIncome, 0);
  assertEquals(result.totalGlobalIncome, 300);
});

Deno.test("financial — empty benefits = totalGlobalIncome equals totalWorkIncome", () => {
  const result = calculateFinancialIndicators(
    [{ monthlyAmount: 2000 }],
    [],
    4,
  );
  assertEquals(result.totalGlobalIncome, result.totalWorkIncome);
  assertEquals(result.totalGlobalIncome, 2000);
});

Deno.test("financial — all zeros", () => {
  const result = calculateFinancialIndicators([], [], 0);
  assertEquals(result.totalWorkIncome, 0);
  assertEquals(result.perCapitaWorkIncome, 0);
  assertEquals(result.totalGlobalIncome, 0);
  assertEquals(result.perCapitaGlobalIncome, 0);
});
