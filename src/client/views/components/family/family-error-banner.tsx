import type { FC } from "hono/jsx/dom"
import { css, keyframes } from "hono/css"
import { color, font, weight, alpha } from "../../../styles/tokens.ts"

interface FamilyErrorBannerProps {
  readonly message: string
}

const bannerSlide = keyframes`
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
`

const bannerStyle = css`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: ${alpha(color.dangerAlt, 0.08)};
  border: 1px solid ${alpha(color.dangerAlt, 0.15)};
  border-radius: 12px;
  margin-bottom: 1.5rem;
  animation: ${bannerSlide} 500ms cubic-bezier(0.16, 1, 0.3, 1);

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const iconStyle = css`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${color.dangerAlt};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: ${weight.bold};
  flex-shrink: 0;
`

const textStyle = css`
  font-family: ${font.satoshi};
  font-size: 0.875rem;
  color: ${color.dangerAlt};
`

export const FamilyErrorBanner: FC<FamilyErrorBannerProps> = ({ message }) => (
  <div class={bannerStyle} role="alert">
    <div class={iconStyle} aria-hidden="true">!</div>
    <span class={textStyle}>{message}</span>
  </div>
)
