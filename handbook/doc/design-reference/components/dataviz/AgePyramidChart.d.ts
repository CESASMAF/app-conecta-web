import * as React from "react";

export interface AgePyramidItem {
  ageBand: string;
  sex: "MALE" | "FEMALE" | "UNKNOWN";
  value: number;
}

/**
 * Age pyramid — mirrored horizontal bars by sex over the 17 canonical age bands
 * (oldest at top). Sex colors are fixed tokens. Ships a "Ver como tabela"
 * alternative, keyboard-focusable bars, and the right empty/privacy state.
 */
export interface AgePyramidChartProps {
  items: AgePyramidItem[];
  /** From `meta.suppressed_groups` — drives the privacy empty state. */
  suppressedGroups?: number;
  pending?: boolean;
  error?: string;
  onRetry?: () => void;
}
export function AgePyramidChart(props: AgePyramidChartProps): JSX.Element;
