import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight, alpha, radius } from "../../../styles/tokens.ts"
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
  background: ${color.bgCard};
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 16px;
  padding: clamp(1.125rem, 0.875rem + 1vw, 1.5rem);
  border: 1px solid ${color.bgCardBorder};
  cursor: pointer;
  overflow: hidden;
  transition: background 300ms cubic-bezier(0.16, 1, 0.3, 1),
    border-color 300ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 300ms ease;
  &:hover {
    background: ${color.bgCardHover};
    border-color: ${color.bgCardBorderHover};
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(79,132,72,0.06);
  }
  &:focus-visible {
    outline: 2px solid ${color.primary};
    outline-offset: 2px;
    background: ${color.bgCardHover};
    border-color: ${color.bgCardBorderHover};
    transform: translateY(-2px);
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
  margin-bottom: clamp(0.75rem, 0.5rem + 0.5vw, 1rem);
`

const nameStyle = css`
  font-family: ${font.erode};
  font-size: clamp(0.875rem, 0.8125rem + 0.25vw, 0.9375rem);
  font-weight: ${weight.semibold};
  color: ${color.textSagePrimary};
  margin: 0 0 6px;
`

const descStyle = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.75rem, 0.6875rem + 0.25vw, 0.8125rem);
  font-weight: ${weight.regular};
  color: ${color.textSageMuted};
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
      style={{ animation: `${fadeInUp} 500ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms both` }}
      role="button"
      tabindex={0}
      aria-label={`Abrir ${app.name}`}
      onClick={onClick}
      onKeyDown={handleKeyDown(onClick)}
    >
      <div
        class={iconStyle}
        style={{ background: alpha(app.color, 0.1) }}
        aria-hidden="true"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="8" stroke={app.color} stroke-width="1.5" />
        </svg>
      </div>
      <h3 class={nameStyle}>{app.name}</h3>
      <p class={descStyle}>{app.description}</p>
    </article>
  )
}
