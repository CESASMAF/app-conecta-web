import * as React from "react";

/**
 * Modal dialog (scrim + centered surface, Esc/scrim-click to close, focus moved
 * in). Base for confirmation flows (status transitions, member removal, lookup
 * approval). Provide your own form fields as children and buttons as `actions`.
 */
export interface M3DialogProps {
  open: boolean;
  title: string;
  description?: string;
  /** Leading Material Symbols ligature name in the header. */
  icon?: string;
  /** Tints the header icon danger for destructive flows. */
  destructive?: boolean;
  children?: React.ReactNode;
  /** Footer buttons (right-aligned), e.g. cancel + confirm M3Buttons. */
  actions?: React.ReactNode;
  onClose?: () => void;
}
export function M3Dialog(props: M3DialogProps): JSX.Element | null;
