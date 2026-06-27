import * as React from "react";

export interface M3DropdownOption {
  value: string;
  label: string;
}

/**
 * Outlined native-select dropdown wired to tokens (mesoregion filter, export
 * dataset/format pickers). Accessible combobox semantics, coral focus.
 */
export interface M3DropdownFieldProps {
  label?: string;
  value?: string;
  onChange?: (value: string, e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: M3DropdownOption[];
  /** Disabled placeholder row shown when no value is selected. */
  placeholder?: string;
  disabled?: boolean;
  errorMessage?: string;
  hint?: string;
  id?: string;
}

export function M3DropdownField(props: M3DropdownFieldProps): JSX.Element;
