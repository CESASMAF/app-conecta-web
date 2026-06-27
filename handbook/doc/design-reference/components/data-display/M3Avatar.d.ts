import * as React from "react";

/** Circular avatar — initials fallback when no image. */
export interface M3AvatarProps {
  name?: string;
  src?: string;
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  alt?: string;
}
export function M3Avatar(props: M3AvatarProps): JSX.Element;
