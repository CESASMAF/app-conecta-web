import * as React from "react";

/**
 * Active / inactive state badge for the People context. A direct image of the
 * domain `active` boolean of Person and SystemRole — never a third state.
 * Renders colour + icon + label together (legible without colour).
 *
 * @example
 * <M3ActiveBadge active={person.active} />
 * <M3ActiveBadge active={role.active} size="sm" labels={{ on: "Ativo", off: "Inativo" }} />
 */
export interface M3ActiveBadgeProps {
  /** The domain boolean. true → "Ativa" (green), false → "Inativa" (grey). */
  active: boolean;
  /** Visual density. "sm" for table rows, "md" (default) for headers. */
  size?: "sm" | "md";
  /**
   * Label overrides. Defaults to feminine ("Ativa"/"Inativa") because Pessoa is
   * feminine; pass `{ on: "Ativo", off: "Inativo" }` for a masculine subject
   * such as a Vínculo (SystemRole).
   */
  labels?: { on: string; off: string };
}

export function M3ActiveBadge(props: M3ActiveBadgeProps): JSX.Element;
