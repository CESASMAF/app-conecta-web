import * as React from "react";

/** Patient lifecycle status pill (color + icon + PT-BR label). Maps the
 * `PatientStatus` enum; color is never the only channel. */
export interface M3StatusChipProps {
  status: "waitlisted" | "active" | "discharged" | "withdrawn";
  /** Override the default PT-BR label. */
  label?: string;
}
export function M3StatusChip(props: M3StatusChipProps): JSX.Element;
