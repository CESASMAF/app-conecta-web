import * as React from "react";

/**
 * Aggregated indicator card: label + big mono value + period + optional
 * footnote. Clickable (href/onPress) on the indicators home; static atop a
 * dashboard. Skeleton while pending.
 */
export interface M3KpiCardProps {
  label: string;
  value: number | null;
  /** @default "integer" */
  format?: "integer" | "decimal" | "percent" | "currency";
  unitLabel?: string;
  period?: string;
  /** @default "monthly" */
  granularity?: "monthly" | "quarterly" | "yearly";
  footnote?: string;
  /** Leading Material Symbols ligature name. */
  icon?: string;
  href?: string;
  onPress?: () => void;
  pending?: boolean;
}
export function M3KpiCard(props: M3KpiCardProps): JSX.Element;
