import * as React from "react";

/**
 * PT-BR masked input. Displays the formatted value in mono; emits raw digits
 * (and the formatted string) to onChange so the BFF receives clean values.
 * `money` treats raw digits as cents.
 */
export interface M3MaskedFieldProps {
  /** @default "cpf" */
  mask?: "cpf" | "nis" | "cep" | "phone" | "date" | "money";
  /** Raw value: digits (or cents for money). */
  value?: string;
  onChange?: (raw: string, formatted: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  errorMessage?: string;
  hint?: string;
}
export function M3MaskedField(props: M3MaskedFieldProps): JSX.Element;
export function formatMask(mask: string, raw: string): string;
export function onlyDigits(s: string): string;
