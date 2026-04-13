import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight, alpha, radius } from "../../../styles/tokens.ts"
import { fadeInUp } from "../../../styles/auth-hub.ts"

interface RecentAppCardProps {
  readonly app: Readonly<{
    name: string
    description: string
    color: string
  }>
  readonly label: string
  readonly onClick: () => void
}

const containerStyle = css`
  width: 100%;
  max-width: min(90%, 45rem);
  margin-bottom: clamp(1.5rem, 1rem + 2vw, 2.5rem);
  animation: ${fadeInUp} 600ms cubic-bezier(0.16, 1, 0.3, 1) 200ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const labelStyle = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.5625rem, 0.5rem + 0.25vw, 0.625rem);
  font-weight: ${weight.bold};
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: ${color.textSageMuted};
  margin: 0 0 clamp(0.5rem, 0.375rem + 0.5vw, 0.75rem);
`

const cardStyle = css`
  display: flex;
  align-items: center;
  gap: clamp(0.875rem, 0.75rem + 0.5vw, 1.25rem);
  padding: clamp(1rem, 0.75rem + 1vw, 1.25rem) clamp(1.125rem, 0.875rem + 1vw, 1.5rem);
  background: ${color.bgCard};
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid ${color.bgCardBorder};
  border-radius: 16px;
  cursor: pointer;
  transition: background 300ms cubic-bezier(0.16, 1, 0.3, 1),
    border-color 300ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 300ms ease;
  &:hover {
    background: ${color.bgCardHover};
    border-color: ${color.bgCardBorderHover};
    transform: translateY(-2px) scale(1.005);
    box-shadow: 0 8px 32px rgba(79,132,72,0.08);
  }
  &:hover [data-arrow] {
    transform: translateX(4px);
    color: ${color.primary};
  }
  &:focus-visible {
    outline: 2px solid ${color.primary};
    outline-offset: 2px;
  }
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

const iconStyle = css`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

const infoStyle = css`
  flex: 1;
  min-width: 0;
`

const nameStyle = css`
  font-family: ${font.erode};
  font-size: clamp(0.9375rem, 0.875rem + 0.25vw, 1rem);
  font-weight: ${weight.semibold};
  color: ${color.textSagePrimary};
  margin: 0 0 4px;
`

const descStyle = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.75rem, 0.6875rem + 0.25vw, 0.8125rem);
  font-weight: ${weight.regular};
  color: ${color.textSageMuted};
  margin: 0;
  line-height: 1.5;
`

const arrowStyle = css`
  font-size: clamp(1.125rem, 1rem + 0.25vw, 1.25rem);
  color: ${color.textSageSoft};
  flex-shrink: 0;
  transition: transform 200ms ease, color 200ms ease;
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

const handleKeyDown = (onClick: () => void) => (e: KeyboardEvent): void => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault()
    onClick()
  }
}

export const RecentAppCard: FC<RecentAppCardProps> = ({ app, label, onClick }) => (
  <div class={containerStyle}>
    <p class={labelStyle}>{label}</p>
    <div
      class={cardStyle}
      role="button"
      tabindex={0}
      aria-label={`${app.name}: ${app.description}`}
      onClick={onClick}
      onKeyDown={handleKeyDown(onClick)}
    >
      <div
        class={iconStyle}
        style={{ background: alpha(app.color, 0.1) }}
        aria-hidden="true"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="8" stroke={app.color} stroke-width="1.5" />
        </svg>
      </div>
      <div class={infoStyle}>
        <h3 class={nameStyle}>{app.name}</h3>
        <p class={descStyle}>{app.description}</p>
      </div>
      <span class={arrowStyle} data-arrow aria-hidden="true">{"\u2192"}</span>
    </div>
  </div>
)
