import type { FC } from "hono/jsx/dom"
import { css, cx, keyframes } from "hono/css"
import { font, weight } from "../../../styles/tokens.ts"

export interface LandingAlertProps {
  readonly type: "error" | "warning"
  readonly title: string
  readonly description: string
}

const alertFadeIn = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
`

const containerBase = css`
  max-width: 440px;
  width: 90%;
  padding: 16px 20px;
  border-radius: 10px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  animation: ${alertFadeIn} 500ms ease both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const errorContainer = css`
  background: rgba(166, 41, 13, 0.15);
  border: 1px solid rgba(166, 41, 13, 0.25);
`

const warningContainer = css`
  background: rgba(201, 150, 10, 0.15);
  border: 1px solid rgba(201, 150, 10, 0.25);
`

const errorTitle = css`color: #FF8A7A;`
const warningTitle = css`color: #FFD066;`

const titleStyle = css`
  font-family: ${font.satoshi};
  font-size: 14px;
  font-weight: ${weight.semibold};
  margin: 0 0 4px;
  line-height: 1.3;
`

const descStyle = css`
  font-family: ${font.playfair};
  font-size: 13px;
  font-style: italic;
  font-weight: ${weight.light};
  color: rgba(242, 226, 196, 0.8);
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
  const accentColor = isError ? "#FF8A7A" : "#FFD066"

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
