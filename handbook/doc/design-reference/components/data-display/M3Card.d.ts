import * as React from "react";

/**
 * Base surface container — white, hairline border, lg radius, soft shadow.
 * Renders as `<a>` (href), `<button>` (onPress), or `<div>`; clickable cards get
 * a hover state layer + focus ring.
 */
export interface M3CardProps {
  children?: React.ReactNode;
  /** @default "md" */
  padding?: "md" | "sm" | "none";
  /** Remove the shadow (for nested/sunken cards). */
  flat?: boolean;
  href?: string;
  onPress?: () => void;
  className?: string;
  style?: React.CSSProperties;
}
export function M3Card(props: M3CardProps): JSX.Element;
