import * as React from "react";

export interface M3EmptyStateAction {
  label: string;
  onPress: () => void;
  icon?: string;
}

/**
 * Empty / error placeholder with an optional action. Three variants distinguish
 * "no data" from "suppressed by privacy" from "service unavailable" — never a
 * blank chart without explanation.
 */
export interface M3EmptyStateProps {
  /** @default "default" */
  variant?: "default" | "privacy" | "unavailable";
  /** Override the variant's default Material Symbols icon. */
  icon?: string;
  title: string;
  description?: string;
  action?: M3EmptyStateAction;
}
export function M3EmptyState(props: M3EmptyStateProps): JSX.Element;
