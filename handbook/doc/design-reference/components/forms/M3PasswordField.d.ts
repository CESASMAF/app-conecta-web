import * as React from "react";

/**
 * Initial-password field with a reveal/hide toggle and a min-length requirement
 * hint (surfaced via aria-describedby, not colour alone). Optional by design —
 * provisioning can create the IdP user and the password can be set later via a
 * reset link. The value is never logged or persisted client-side;
 * autocomplete is "new-password".
 *
 * @example
 * <M3PasswordField
 *   value={form.initialPassword}
 *   onChange={(v) => set("initialPassword", v)}
 *   errorMessage={form.errors.initialPassword}
 * />
 */
export interface M3PasswordFieldProps {
  /** Field label. Default "Senha inicial". */
  label?: string;
  value: string;
  onChange: (value: string) => void;
  /** Local validation error (e.g. < minLength). Replaces the requirement hint. */
  errorMessage?: string;
  required?: boolean;
  disabled?: boolean;
  /** Mirrors the backend TypeBox minLength (initialPassword). Default 8. */
  minLength?: number;
  /** Overrides the default "Mínimo N caracteres" requirement hint. */
  hint?: string;
  id?: string;
  /** Defaults to "new-password" — do not weaken to "current-password". */
  autoComplete?: string;
}

export function M3PasswordField(props: M3PasswordFieldProps): JSX.Element;
