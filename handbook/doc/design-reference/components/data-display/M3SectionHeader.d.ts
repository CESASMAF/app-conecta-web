import * as React from "react";

/** Section title + optional description and a right-aligned action slot. */
export interface M3SectionHeaderProps {
  title: string;
  description?: string;
  /** Right-aligned actions, e.g. a "Ver como tabela" M3Button. */
  action?: React.ReactNode;
  /** Heading level. @default "h2" */
  as?: "h1" | "h2" | "h3" | "h4";
}
export function M3SectionHeader(props: M3SectionHeaderProps): JSX.Element;
