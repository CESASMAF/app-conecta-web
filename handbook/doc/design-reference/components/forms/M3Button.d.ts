import * as React from "react";

/**
 * Primary action button. Material 3 grammar: filled (main CTA), tonal
 * (secondary), outlined, text, destructive. State layers on hover/press;
 * always-visible coral focus ring.
 */
export interface M3ButtonProps {
  /** Visual emphasis. @default "filled" */
  variant?: "filled" | "tonal" | "outlined" | "text" | "destructive";
  /** @default "md" */
  size?: "sm" | "md";
  /** @default "button" */
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  /** Shows a spinner and blocks interaction (e.g. export in flight). */
  pending?: boolean;
  /** Leading Material Symbols Rounded ligature name, e.g. "download". */
  icon?: string;
  /** Trailing Material Symbols Rounded ligature name. */
  iconTrailing?: string;
  onPress?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode;
}

export function M3Button(props: M3ButtonProps): JSX.Element;
