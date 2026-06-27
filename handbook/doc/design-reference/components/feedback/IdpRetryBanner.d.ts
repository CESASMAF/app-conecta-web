import * as React from "react";

/**
 * 207 Multi-Status retry banner. Render it when `POST /people` returned 207
 * (person row created, IdP login provisioning failed) or when a retry
 * (`POST /people/:id/login`) returns `502 IDP-001`. It carries `role="alert"`;
 * move focus to it after the 207. The button delegates the retry to the
 * ViewModel — on success the banner unmounts and the login indicator flips to
 * "linked".
 *
 * @example
 * {idpFailure && <IdpRetryBanner onRetry={retry} isPending={pending} error="IDP-001" />}
 */
export interface IdpRetryBannerProps {
  /** Delegates the retry (POST /people/:id/login) to the ViewModel. */
  onRetry: () => void;
  /** Locks the button while the retry is in flight. */
  isPending?: boolean;
  /** Backend error code to surface in mono when a retry fails again. */
  error?: string;
}

export function IdpRetryBanner(props: IdpRetryBannerProps): JSX.Element;
