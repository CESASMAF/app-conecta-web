import * as React from "react";

/**
 * Outlined text input wired to tokens. Coral focus border, inline PT-BR error
 * with icon, optional mono mode for codes/periods (YYYY-MM), leading/trailing
 * Material Symbols icons.
 */
export interface M3TextFieldProps {
  label?: string;
  value?: string;
  onChange?: (value: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  /** @default "text" */
  type?: string;
  required?: boolean;
  disabled?: boolean;
  /** Presence switches the field to its error state and renders this message. */
  errorMessage?: string;
  /** Helper text shown when not in error. */
  hint?: string;
  /** Render the input in mono with tabular figures (codes, periods, amounts). */
  mono?: boolean;
  leadingIcon?: string;
  trailingIcon?: string;
  id?: string;
}

export function M3TextField(props: M3TextFieldProps): JSX.Element;
