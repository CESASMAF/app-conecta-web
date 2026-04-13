import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight } from "../../../styles/tokens.ts"

interface EmptyStateProps {
  readonly icon: string
  readonly title: string
  readonly description: string
}

const containerStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: clamp(3rem, 2rem + 4vw, 5rem) clamp(1rem, 0.5rem + 2vw, 1.5rem);
  text-align: center;
`

const iconStyle = css`
  font-size: 48px;
  color: ${color.textSageSoft};
  margin-bottom: clamp(0.75rem, 0.5rem + 1vw, 1.5rem);
  opacity: 0.4;
`

const titleStyle = css`
  font-family: ${font.erode};
  font-size: clamp(1.125rem, 1rem + 0.5vw, 1.25rem);
  font-weight: ${weight.bold};
  color: ${color.textSageSecondary};
  margin-bottom: 0.5rem;
`

const descriptionStyle = css`
  font-family: ${font.satoshi};
  font-style: italic;
  font-size: clamp(0.8125rem, 0.75rem + 0.25vw, 0.875rem);
  color: ${color.textSageMuted};
  max-width: 17.5rem;
`

export const EmptyState: FC<EmptyStateProps> = ({ icon, title, description }) => (
  <div class={containerStyle}>
    <span class={iconStyle}>{icon}</span>
    <div class={titleStyle}>{title}</div>
    <div class={descriptionStyle}>{description}</div>
  </div>
)
