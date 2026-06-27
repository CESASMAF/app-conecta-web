import * as React from "react";

export interface ParsedPeriod {
  short: string;
  long: string;
  iso?: string;
}

/** Parse the contract's "YYYY-MM" | "YYYY-Qn" | "YYYY" into display forms. */
export function parsePeriod(period: string, granularity?: string): ParsedPeriod;

/**
 * Period label rendered as `<time>` with a spelled-out aria-label. `axis` is the
 * short form (mar/2025, T1 2025, 2025); `inline` is long (março de 2025).
 */
export interface M3PeriodLabelProps {
  period: string;
  /** @default "monthly" */
  granularity?: "monthly" | "quarterly" | "yearly";
  /** @default "inline" */
  variant?: "axis" | "inline";
}
export function M3PeriodLabel(props: M3PeriodLabelProps): JSX.Element;
