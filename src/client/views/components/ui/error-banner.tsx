import type { FC } from "hono/jsx/dom"
import { css, keyframes } from "hono/css"
import { color, font, weight, space, radius, alpha } from "../../../styles/tokens.ts"

interface ErrorBannerProps {
  readonly message: string
  readonly onDismiss?: () => void
}

const bannerEntry = keyframes`
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`

const bannerStyle = css`
  display: flex;
  align-items: center;
  gap: ${space[3]};
  padding: ${space[3]} ${space[4]};
  background: ${alpha(color.danger, 0.06)};
  border: 1px solid ${alpha(color.danger, 0.12)};
  border-radius: ${radius.dropdown};
  animation: ${bannerEntry} 400ms ease-out;
`

const iconCircleStyle = css`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${color.danger};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${font.satoshi};
  font-size: 14px;
  font-weight: ${weight.bold};
  flex-shrink: 0;
`

const messageStyle = css`
  font-family: ${font.satoshi};
  font-size: 14px;
  color: ${color.danger};
  flex: 1;
`

const dismissStyle = css`
  border: none;
  background: transparent;
  cursor: pointer;
  color: ${color.danger};
  font-size: 18px;
  line-height: 1;
  padding: ${space[1]};
  opacity: 0.7;
  &:hover { opacity: 1; }
`

export const ErrorBanner: FC<ErrorBannerProps> = ({ message, onDismiss }) => (
  <div class={bannerStyle} role="alert">
    <div class={iconCircleStyle}>!</div>
    <span class={messageStyle}>{message}</span>
    {onDismiss && (
      <button class={dismissStyle} onClick={onDismiss} type="button" aria-label="Fechar">
        &times;
      </button>
    )}
  </div>
)
