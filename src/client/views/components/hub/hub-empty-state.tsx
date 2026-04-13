import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight, alpha, radius } from "../../../styles/tokens.ts"
import { fadeInUp } from "../../../styles/auth-hub.ts"

interface HubEmptyStateProps {
  readonly strings: Readonly<{
    emptyTitle: string
    emptyDesc: string
    emptyContactAdmin: string
    emptyBackToStart: string
  }>
  readonly mailtoHref: string
  readonly onLogout: () => void
}

const containerStyle = css`
  text-align: center;
  padding: clamp(2rem, 1.5rem + 2vw, 3rem) clamp(1rem, 0.75rem + 1vw, 1.5rem);
  max-width: min(90%, 25rem);
  margin: 0 auto;
  background: ${color.bgCard};
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid ${color.bgCardBorder};
  border-radius: 16px;
  animation: ${fadeInUp} 600ms cubic-bezier(0.16, 1, 0.3, 1) 200ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const iconBoxStyle = css`
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: ${alpha(color.dangerAlt, 0.08)};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto clamp(1rem, 0.75rem + 1vw, 1.5rem);
`

const titleStyle = css`
  font-family: ${font.erode};
  font-size: clamp(1.125rem, 1rem + 0.5vw, 1.25rem);
  font-weight: ${weight.semibold};
  color: ${color.textSagePrimary};
  margin: 0 0 clamp(0.375rem, 0.25rem + 0.25vw, 0.5rem);
`

const descStyle = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.25vw, 0.9375rem);
  font-weight: ${weight.regular};
  color: ${color.textSageMuted};
  line-height: 1.6;
  margin: 0 0 clamp(1rem, 0.75rem + 1vw, 1.5rem);
`

const primaryBtnStyle = css`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem) clamp(1.25rem, 1rem + 1vw, 1.75rem);
  border-radius: ${radius.pill};
  border: none;
  background: ${color.primary};
  color: #fff;
  font-family: ${font.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.25vw, 0.875rem);
  font-weight: ${weight.semibold};
  text-decoration: none;
  cursor: pointer;
  transition: background 200ms ease, transform 200ms ease;
  &:hover {
    background: ${color.primaryDark};
    transform: translateY(-1px);
  }
  &:focus-visible {
    outline: 2px solid ${color.primary};
    outline-offset: 2px;
  }
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

const secondaryBtnStyle = css`
  display: block;
  margin: clamp(0.5rem, 0.375rem + 0.5vw, 0.75rem) auto 0;
  background: none;
  border: 1px solid ${alpha(color.primary, 0.15)};
  padding: clamp(0.5rem, 0.375rem + 0.5vw, 0.625rem) clamp(1rem, 0.75rem + 1vw, 1.5rem);
  border-radius: ${radius.pill};
  font-family: ${font.satoshi};
  font-size: clamp(0.75rem, 0.6875rem + 0.25vw, 0.8125rem);
  font-weight: ${weight.semibold};
  color: ${color.textSageMuted};
  cursor: pointer;
  transition: border-color 200ms ease, color 200ms ease;
  &:hover {
    border-color: ${color.textSagePrimary};
    color: ${color.textSagePrimary};
  }
  &:focus-visible {
    outline: 2px solid ${color.primary};
    outline-offset: 2px;
  }
`

export const HubEmptyState: FC<HubEmptyStateProps> = ({ strings, mailtoHref, onLogout }) => (
  <div class={containerStyle}>
    <div class={iconBoxStyle} aria-hidden="true">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color.dangerAlt} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    </div>
    <h2 class={titleStyle}>{strings.emptyTitle}</h2>
    <p class={descStyle}>{strings.emptyDesc}</p>
    <a class={primaryBtnStyle} href={mailtoHref}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M22 4L12 13 2 4" />
      </svg>
      {strings.emptyContactAdmin}
    </a>
    <button class={secondaryBtnStyle} onClick={onLogout}>
      {strings.emptyBackToStart}
    </button>
  </div>
)
