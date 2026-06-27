import * as React from "react";

export interface M3NavRailItem {
  id: string;
  label: string;
  /** Material Symbols Rounded ligature name. */
  icon: string;
  href?: string;
}

/**
 * Fixed 72px navigation rail (icon + short label per destination). Active item
 * gets a coral tonal pill. Provide `logo` and optional `footer` (e.g. user menu).
 */
export interface M3NavRailProps {
  items: M3NavRailItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  /** Logo image URL or a custom node. */
  logo?: string | React.ReactNode;
  footer?: React.ReactNode;
}
export function M3NavRail(props: M3NavRailProps): JSX.Element;
