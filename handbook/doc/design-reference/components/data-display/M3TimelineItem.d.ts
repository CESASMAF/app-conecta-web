import * as React from "react";

export interface AuditDiffRow {
  field: string;
  before: React.ReactNode;
  after: React.ReactNode;
}

/**
 * One audit-trail entry. Use inside `<ol className="m3-timeline">`. Shows a
 * marker, the event title, actor + `<time>`, and an optional before→after diff.
 */
export interface M3TimelineItemProps {
  title: string;
  /** Actor (resolved name, or abbreviated IdP UUID in mono). */
  actor?: string;
  /** Display datetime (pt-BR). */
  datetime?: string;
  /** Machine datetime for `<time dateTime>`. */
  iso?: string;
  icon?: string;
  /** @default "default" */
  tone?: "default" | "success" | "danger" | "info" | "neutral";
  diff?: AuditDiffRow[];
  /** Hide the connector after the last item. */
  last?: boolean;
}
export function M3TimelineItem(props: M3TimelineItemProps): JSX.Element;
