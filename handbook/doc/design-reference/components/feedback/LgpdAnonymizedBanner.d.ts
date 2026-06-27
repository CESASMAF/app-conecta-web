import * as React from "react";

/** Permanent LGPD-anonymized record banner. Not dismissible; signals that PII is
 * hidden and edits are blocked. role="note". */
export interface LgpdAnonymizedBannerProps {
  /** Override the default PT-BR message. */
  message?: React.ReactNode;
}
export function LgpdAnonymizedBanner(props: LgpdAnonymizedBannerProps): JSX.Element;
