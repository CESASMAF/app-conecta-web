// FinancialAnalyticsService — Pure functions for financial indicator calculations.
// Pure functions only — no side effects. All monetary values in BRL.

export type FinancialIndicators = Readonly<{
  totalWorkIncome: number;
  perCapitaWorkIncome: number;
  totalGlobalIncome: number;
  perCapitaGlobalIncome: number;
}>;

/**
 * Calculates financial indicators from individual incomes, social benefits, and family size.
 * memberCount is guaranteed to be at least 1 (never divides by zero).
 */
export const calculateFinancialIndicators = (
  individualIncomes: readonly Readonly<{ monthlyAmount: number }>[],
  socialBenefitAmounts: readonly number[],
  totalFamilyMembers: number,
): FinancialIndicators => {
  const memberCount = Math.max(totalFamilyMembers, 1);

  const totalWorkIncome = individualIncomes.reduce(
    (sum, income) => sum + income.monthlyAmount,
    0,
  );

  const totalBenefits = socialBenefitAmounts.reduce(
    (sum, amount) => sum + amount,
    0,
  );

  const totalGlobalIncome = totalWorkIncome + totalBenefits;

  return {
    totalWorkIncome,
    perCapitaWorkIncome: totalWorkIncome / memberCount,
    totalGlobalIncome,
    perCapitaGlobalIncome: totalGlobalIncome / memberCount,
  };
};
