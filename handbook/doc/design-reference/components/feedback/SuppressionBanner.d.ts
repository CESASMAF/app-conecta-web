import * as React from "react";

/**
 * Mandatory privacy suppression banner — render wherever aggregated data is
 * shown. It returns null when `suppressedGroups <= 0` and there is NO prop to
 * suppress it when groups > 0 (LGPD Art. 12 compliance invariant).
 */
export interface SuppressionBannerProps {
  /** From the API envelope `meta.suppressed_groups`. */
  suppressedGroups: number;
  /** From `meta.k_threshold`; never hard-code. @default 5 */
  kThreshold?: number;
  /** Compact variant for inside a single chart card. */
  compact?: boolean;
  /** Optional "Entenda" affordance explaining K-anonymity. */
  onLearnMore?: () => void;
}
export function SuppressionBanner(props: SuppressionBannerProps): JSX.Element | null;
