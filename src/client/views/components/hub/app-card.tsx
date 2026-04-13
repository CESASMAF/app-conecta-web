import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight, alpha, radius, space } from "../../../styles/tokens.ts"
import { fadeInUp } from "../../../styles/auth-hub.ts"

interface AppCardProps {
  readonly app: Readonly<{
    name: string
    description: string
    icon: string
    color: string
  }>
  readonly index: number
  readonly onClick: () => void
}

const cardStyle = css`
  position: relative;
  background: ${color.surface};
  border-radius: ${radius.card};
  padding: ${space[4]};
  border: 1px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  overflow: hidden;
  transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 300ms ease,
    border-color 300ms ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14);
    border-color: ${color.inputLine};
  }
  &:hover [data-accent] {
    opacity: 1;
  }
  &:focus-visible {
    outline: 2px solid ${color.primary};
    outline-offset: 2px;
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14);
  }
  &:focus-visible [data-accent] {
    opacity: 1;
  }
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

const iconStyle = css`
  width: 44px;
  height: 44px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${space[3]};
`

const nameStyle = css`
  font-family: ${font.satoshi};
  font-size: 15px;
  font-weight: ${weight.bold};
  color: ${color.textPrimary};
  margin: 0 0 6px;
`

const descStyle = css`
  font-family: ${font.playfair};
  font-size: 13px;
  font-style: italic;
  font-weight: ${weight.light};
  color: ${color.textMuted};
  margin: 0;
  line-height: 1.5;
`

const handleKeyDown = (onClick: () => void) => (e: KeyboardEvent): void => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault()
    onClick()
  }
}

export const AppCard: FC<AppCardProps> = ({ app, index, onClick }) => {
  const delay = 350 + index * 70
  return (
    <article
      class={cardStyle}
      style={{ animation: `${fadeInUp} 500ms ease ${delay}ms both` }}
      role="button"
      tabindex={0}
      aria-label={`Abrir ${app.name}`}
      onClick={onClick}
      onKeyDown={handleKeyDown(onClick)}
    >
      <div
        class={iconStyle}
        style={{ background: alpha(app.color, 0.12) }}
        aria-hidden="true"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="8" stroke={app.color} stroke-width="1.5" />
        </svg>
      </div>
      <h3 class={nameStyle}>{app.name}</h3>
      <p class={descStyle}>{app.description}</p>
      <div
        data-accent
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: app.color,
          opacity: 0.5,
          transition: "opacity 200ms ease",
          borderRadius: `${radius.card} ${radius.card} 0 0`,
        }}
        aria-hidden="true"
      />
    </article>
  )
}
