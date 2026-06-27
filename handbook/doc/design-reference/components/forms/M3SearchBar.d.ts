import * as React from "react";

/** Pill search input with leading icon and a clear button. Submits on Enter. */
export interface M3SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  /** @default "Buscar…" */
  placeholder?: string;
  ariaLabel?: string;
}
export function M3SearchBar(props: M3SearchBarProps): JSX.Element;
