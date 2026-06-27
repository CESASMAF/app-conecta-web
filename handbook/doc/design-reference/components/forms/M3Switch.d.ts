import * as React from "react";

/**
 * M3 switch toggle (`role="switch"`). Coral when on, animated thumb, accessible
 * label. Use for binary on/off settings.
 */
export interface M3SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean, e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  disabled?: boolean;
  id?: string;
}

export function M3Switch(props: M3SwitchProps): JSX.Element;
