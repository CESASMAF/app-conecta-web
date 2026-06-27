import * as React from "react";

export interface RankedItem {
  /** Optional mono code shown before the label (icd_code, etc.). */
  code?: string;
  label: string;
  value: number;
}

/**
 * Horizontal ranking bars — top-N CID-10, income bands, referral destinations,
 * violation/appointment types. Categorical colors from `--chart-cat-1..8` in
 * order (max 8). Set `fixedOrder` for ordinal scales (income bands) so bars keep
 * domain order instead of sorting by value. Ships a table alternative.
 */
export interface TopNBarChartProps {
  items: RankedItem[];
  /** Keep domain order instead of sorting by value (ordinal scales). */
  fixedOrder?: boolean;
  suppressedGroups?: number;
  unitLabel?: string;
  pending?: boolean;
  error?: string;
  onRetry?: () => void;
  /** Table caption (a11y). */
  caption?: string;
}
export function TopNBarChart(props: TopNBarChartProps): JSX.Element;
