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
  max-width: 720px;
  margin-bottom: 40px;
  animation: ${fadeInUp} 600ms ease 200ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const labelStyle = css`
  font-family: ${font.satoshi};
  font-size: 10px;
  font-weight: ${weight.bold};
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: ${color.textMuted};
  margin: 0 0 12px;
`

const cardStyle = css`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 24px;
  background: ${color.backgroundDark};
  border-radius: ${radius.card};
  cursor: pointer;
  transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 300ms ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  &:hover {
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  }
  &:hover [data-arrow] {
    transform: translateX(4px);
    color: ${color.textOnDark};
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
  font-family: ${font.satoshi};
  font-size: 16px;
  font-weight: ${weight.semibold};
  color: ${color.textOnDark};
  margin: 0 0 4px;
`

const descStyle = css`
  font-family: ${font.playfair};
  font-size: 13px;
  font-style: italic;
  font-weight: ${weight.light};
  color: ${alpha(color.textOnDark, 0.75)};
  margin: 0;
  line-height: 1.5;
`

const arrowStyle = css`
  font-size: 20px;
  color: ${alpha(color.textOnDark, 0.75)};
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
        style={{ background: alpha(app.color, 0.15) }}
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
