import type { FC } from "hono/jsx/dom"
import { css, cx } from "hono/css"
import { color, alpha } from "../../../styles/tokens.ts"

interface CircleButtonProps {
  readonly variant: "default" | "close"
  readonly onClick: () => void
  readonly children: unknown
}

const baseStyle = css`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1.5px solid ${color.background};
  background: transparent;
  color: ${color.background};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 200ms ease, border-color 200ms ease;
`

const defaultHover = css`
  &:hover {
    background: ${alpha(color.background, 0.1)};
  }
`

const closeVariant = css`
  border-color: ${color.danger};
  color: ${color.danger};
  &:hover {
    background: ${alpha(color.danger, 0.2)};
  }
`

export const CircleButton: FC<CircleButtonProps> = ({ variant, onClick, children }) => (
  <button
    class={cx(baseStyle, variant === "close" ? closeVariant : defaultHover)}
    onClick={onClick}
    type="button"
  >
    {children}
  </button>
)
