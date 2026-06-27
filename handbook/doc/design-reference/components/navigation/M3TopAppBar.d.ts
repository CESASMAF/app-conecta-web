import * as React from "react";

/**
 * Sticky top app bar: optional back button, h1 title (truncates), a status slot
 * (e.g. a network badge), and right-aligned actions.
 */
export interface M3TopAppBarProps {
  title: string;
  onBack?: () => void;
  /** Small slot next to the title for status (e.g. an M3Badge). */
  statusSlot?: React.ReactNode;
  /** Right-aligned action buttons. */
  actions?: React.ReactNode;
}
export function M3TopAppBar(props: M3TopAppBarProps): JSX.Element;
