import type { FC } from "hono/jsx/dom"
import { css, cx, keyframes } from "hono/css"
import { font, weight, color } from "../../../styles/tokens.ts"
import { reducedMotion } from "../../../styles/auth-hub.ts"

export interface LandingAlertProps {
  readonly type: "error" | "warning"
  readonly title: string
  readonly description: string
}

const alertFadeIn = keyframes`
  from { opacity: 0; transform: translateY(1.5rem); }
  to { opacity: 1; transform: translateY(0); }
`

const containerBase = css`
  ${reducedMotion}
  max-width: min(90%, 28rem);
  width: 100%;
  padding: clamp(0.75rem, 0.625rem + 0.5vw, 1.25rem) clamp(1rem, 0.75rem + 0.75vw, 1.5rem);
  border-radius: 12px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  animation: ${alertFadeIn} 500ms ease both;
  background: ${color.bgCard};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid ${color.bgCardBorder};
`

const errorContainer = css`
  border-color: rgba(196, 66, 43, 0.2);
`

const warningContainer = css`
  border-color: rgba(201, 150, 10, 0.2);
`

const errorTitle = css`color: ${color.dangerAlt};`
const warningTitle = css`color: ${color.warning};`

const titleStyle = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.25vw, 0.875rem);
  font-weight: ${weight.semibold};
  margin: 0 0 4px;
  line-height: 1.3;
`

const descStyle = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.75rem, 0.6875rem + 0.25vw, 0.8125rem);
  font-weight: ${weight.regular};
  color: ${color.textSageMuted};
  line-height: 1.5;
  margin: 0;
`

const iconStyle = css`
  flex-shrink: 0;
  margin-top: 2px;
`

const WarningIcon: FC<{ readonly color: string }> = ({ color: c }) => (
  <svg class={iconStyle} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const ClockIcon: FC<{ readonly color: string }> = ({ color: c }) => (
  <svg class={iconStyle} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

export const LandingAlert: FC<LandingAlertProps> = ({ type, title, description }) => {
  const isError = type === "error"
  const accentColor = isError ? color.dangerAlt : color.warning

  return (
    <div
      class={cx(containerBase, isError ? errorContainer : warningContainer)}
      role="alert"
      aria-live="assertive"
    >
      {isError
        ? <WarningIcon color={accentColor} />
        : <ClockIcon color={accentColor} />}
      <div>
        <p class={cx(titleStyle, isError ? errorTitle : warningTitle)}>
          {title}
        </p>
        <p class={descStyle}>{description}</p>
      </div>
    </div>
  )
}
