import * as React from "react";

/** A `<dt>/<dd>` label–value pair. Use inside a `<dl>`. */
export interface M3DataFieldProps {
  label: string;
  value?: React.ReactNode;
  /** Render the value in mono with tabular figures (codes, amounts). */
  mono?: boolean;
  /** Lay label and value on one row, space-between. */
  inline?: boolean;
  /** Shown when value is null/empty. @default "—" */
  emptyFallback?: string;
}
export function M3DataField(props: M3DataFieldProps): JSX.Element;
