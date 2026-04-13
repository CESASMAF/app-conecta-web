import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight, space } from "../../../styles/tokens.ts"

interface EmptyStateProps {
  readonly message: string
  readonly icon?: string
}

const containerStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${space[7]} ${space[4]};
  gap: ${space[3]};
`

const iconStyle = css`
  font-size: 40px;
  opacity: 0.4;
  color: ${color.textMuted};
`

const messageStyle = css`
  font-family: ${font.playfair};
  font-style: italic;
  font-weight: ${weight.light};
  font-size: 18px;
  color: ${color.textMuted};
  text-align: center;
`

export const EmptyState: FC<EmptyStateProps> = ({ message, icon }) => (
  <div class={containerStyle}>
    {icon && <span class={iconStyle}>{icon}</span>}
    <p class={messageStyle}>{message}</p>
  </div>
)
