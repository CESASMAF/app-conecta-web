import * as React from "react";

/** A chart series legend entry. `colorToken` is a CSS chart-token NAME (e.g.
 * "--chart-sex-female", "--chart-cat-3") — never a raw color. Interactive when
 * `onPress` is set (toggles the series; `muted` greys it out). */
export interface M3SeriesLegendItemProps {
  label: string;
  /** A `--chart-*` custom-property name. */
  colorToken: string;
  /** @default "square" */
  shape?: "square" | "line";
  muted?: boolean;
  onPress?: () => void;
}
export function M3SeriesLegendItem(props: M3SeriesLegendItemProps): JSX.Element;
