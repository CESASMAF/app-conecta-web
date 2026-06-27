import * as React from "react";

/** Small status pill. Tinted by default; `solid` for high-emphasis counts. */
export interface M3BadgeProps {
  /** @default "neutral" */
  variant?: "neutral" | "primary" | "success" | "warning" | "danger" | "info";
  /** Filled high-contrast style (counts, live status). */
  solid?: boolean;
  /** Leading status dot. */
  dot?: boolean;
  /** Leading Material Symbols ligature name. */
  icon?: string;
  children?: React.ReactNode;
}
export function M3Badge(props: M3BadgeProps): JSX.Element;
