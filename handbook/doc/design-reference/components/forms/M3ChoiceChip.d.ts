import * as React from "react";

export interface M3ChoiceOption {
  value: string;
  label: string;
  /** Optional leading Material Symbols ligature name. */
  icon?: string;
}

/**
 * Single-select chip group (`role="radiogroup"`, arrow-key nav). Base for
 * granularity (mensal/trimestral/anual) and top-N selectors.
 */
export interface M3ChoiceChipProps {
  options: M3ChoiceOption[];
  value?: string;
  onChange?: (value: string) => void;
  /** Accessible group name, e.g. "Granularidade". */
  ariaLabel?: string;
  disabled?: boolean;
  /** Show the check glyph on the selected chip. @default true */
  showCheck?: boolean;
}

export function M3ChoiceChip(props: M3ChoiceChipProps): JSX.Element;
