import * as React from "react";

/**
 * Computed-analytics stat card (housing density, RPC, vulnerability index, age
 * profile). Numeric values render in mono via M3KpiValue; an optional semaphore
 * `tone` chip carries the judgement (never the value color alone).
 */
export interface M3StatCardProps {
  label: string;
  /** Number (mono) or a short string/node. */
  value: number | string | null;
  format?: "integer" | "decimal" | "percent" | "currency";
  unit?: string;
  icon?: string;
  /** Semaphore for the indicator's judgement. */
  tone?: "success" | "warning" | "danger" | "neutral";
  /** Label inside the tone chip, e.g. "Sobrelotação", "Alto". */
  toneLabel?: string;
  footnote?: string;
  pending?: boolean;
}
export function M3StatCard(props: M3StatCardProps): JSX.Element;
