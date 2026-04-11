import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight, alpha, radius } from "../../../styles/tokens.ts"
import { fadeInUp } from "../../../styles/auth-hub.ts"
import { AUTH_HUB_STRINGS } from "../../../viewmodels/auth-hub/strings.ts"

interface HubEmptyStateProps {
  readonly onLogout: () => void
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

const primaryBtnStyle = css`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: ${radius.pill};
  border: none;
  background: ${color.primary};
  color: white;
  font-family: ${font.satoshi};
  font-size: 14px;
  font-weight: ${weight.semibold};
  text-decoration: none;
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

const secondaryBtnStyle = css`
  display: block;
  margin: 12px auto 0;
  background: none;
  border: 1px solid ${color.inputLine};
  padding: 10px 24px;
  border-radius: ${radius.pill};
  font-family: ${font.satoshi};
  font-size: 13px;
  font-weight: ${weight.semibold};
  color: ${color.textMuted};
  cursor: pointer;
  transition: border-color 200ms ease, color 200ms ease;
  &:hover {
    border-color: ${color.textPrimary};
    color: ${color.textPrimary};
  }
  &:focus-visible {
    outline: 2px solid ${color.primary};
    outline-offset: 2px;
  }
`

const mailtoHref = `mailto:${AUTH_HUB_STRINGS.emptyContactEmail}?subject=${encodeURIComponent(AUTH_HUB_STRINGS.emptyContactSubject)}`

export const HubEmptyState: FC<HubEmptyStateProps> = ({ onLogout }) => (
  <div class={containerStyle}>
    <div class={iconBoxStyle} aria-hidden="true">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color.danger} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    </div>
    <h2 class={titleStyle}>{AUTH_HUB_STRINGS.emptyTitle}</h2>
    <p class={descStyle}>{AUTH_HUB_STRINGS.emptyDesc}</p>
    <a class={primaryBtnStyle} href={mailtoHref}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M22 4L12 13 2 4" />
      </svg>
      {AUTH_HUB_STRINGS.emptyContactAdmin}
    </a>
    <button class={secondaryBtnStyle} onClick={onLogout}>
      {AUTH_HUB_STRINGS.emptyBackToStart}
    </button>
  </div>
)
