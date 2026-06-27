import * as React from "react";

/**
 * "Has login" indicator for a Person's IdP link. The state is derived in the
 * ViewModel, never read raw from the API: idpUserId present → "linked";
 * idpUserId null → "none"; null plus a 207-creation flag in the current session
 * → "failed". It is not itself an alert — IdpRetryBanner owns the alert role.
 *
 * @example
 * <M3LoginIndicator state={person.loginState} />
 */
export interface M3LoginIndicatorProps {
  /** linked → "Tem login" (green), none → "Sem login" (grey), failed → "Provisão falhou" (amber). */
  state: "linked" | "none" | "failed";
}

export function M3LoginIndicator(props: M3LoginIndicatorProps): JSX.Element;
