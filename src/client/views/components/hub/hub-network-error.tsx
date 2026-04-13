import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight, alpha, radius } from "../../../styles/tokens.ts"
import { fadeInUp } from "../../../styles/auth-hub.ts"

interface HubNetworkErrorProps {
  readonly strings: Readonly<{
    networkErrorTitle: string
    networkErrorDesc: string
    networkErrorRetry: string
  }>
  readonly onRetry: () => void
}

const containerStyle = css`
  text-align: center;
  padding: 48px 24px;
  max-width: 400px;
  margin: 0 auto;
  animation: ${fadeInUp} 600ms ease 200ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const iconBoxStyle = css`
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: ${alpha(color.danger, 0.08)};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
`

const titleStyle = css`
  font-family: ${font.satoshi};
  font-size: 20px;
  font-weight: ${weight.bold};
  color: ${color.textPrimary};
  margin: 0 0 8px;
`

const descStyle = css`
  font-family: ${font.playfair};
  font-size: 15px;
  font-style: italic;
  font-weight: ${weight.light};
  color: ${color.textMuted};
  line-height: 1.6;
  margin: 0 0 24px;
`

const retryBtnStyle = css`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: ${radius.pill};
  border: none;
  background: ${color.primary};
  color: ${color.textOnDark};
  font-family: ${font.satoshi};
  font-size: 14px;
  font-weight: ${weight.semibold};
  cursor: pointer;
  transition: opacity 200ms ease;
  &:hover {
    opacity: 0.9;
  }
  &:focus-visible {
    outline: 2px solid ${color.primary};
    outline-offset: 2px;
  }
`

export const HubNetworkError: FC<HubNetworkErrorProps> = ({ strings, onRetry }) => (
  <div class={containerStyle}>
    <div class={iconBoxStyle} aria-hidden="true">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color.danger} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
        <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </svg>
    </div>
    <h2 class={titleStyle}>{strings.networkErrorTitle}</h2>
    <p class={descStyle}>{strings.networkErrorDesc}</p>
    <button class={retryBtnStyle} onClick={onRetry}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </svg>
      {strings.networkErrorRetry}
    </button>
  </div>
)
