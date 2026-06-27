import * as React from "react";

/** Vulnerability/risk pill derived from computedAnalytics & protection data.
 * Preset risks carry a fixed color + icon + label; pass `label`/`icon` to
 * customize. */
export interface M3RiskChipProps {
  /** @default "default" */
  risk?: "violation" | "overcrowding" | "dropout" | "prenatal" | "default";
  label?: string;
  icon?: string;
}
export function M3RiskChip(props: M3RiskChipProps): JSX.Element;
