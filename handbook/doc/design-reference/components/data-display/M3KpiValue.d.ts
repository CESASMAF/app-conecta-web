import * as React from "react";

/**
 * Large aggregated value in mono with pt-BR Intl formatting. `currency` expects
 * cents; `percent` expects a 0–1 ratio; `null` renders "—". Never applies a
 * semaphore tone automatically — the parent decides.
 */
export interface M3KpiValueProps {
  value: number | null;
  /** @default "integer" */
  format?: "integer" | "decimal" | "percent" | "currency";
  /** Unit shown small after the number, e.g. "registros". */
  unitLabel?: string;
  /** @default "md" */
  size?: "lg" | "md" | "sm";
  ariaLabel?: string;
}
export function M3KpiValue(props: M3KpiValueProps): JSX.Element;
export function formatValue(value: number | null, format?: string): string | null;
