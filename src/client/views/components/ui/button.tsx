import type { FC } from "hono/jsx/dom"
import { css, cx } from "hono/css"
import { color, font, radius } from "../../../styles/tokens.ts"

interface ButtonProps {
  readonly variant: "primary" | "secondary" | "danger"
  readonly disabled?: boolean
  readonly onClick: () => void
  readonly children: unknown
}

const baseStyle = css`
  border-radius: ${radius.pill};
  font-family: ${font.satoshi};
  font-size: 16px;
  padding: 12px 24px;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s, background 0.2s;
  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`

const primaryStyle = css`
  background: ${color.primary};
  color: white;
`

const secondaryStyle = css`
  background: transparent;
  color: ${color.textPrimary};
  border: 1.5px solid ${color.textPrimary};
`

const dangerStyle = css`
  background: transparent;
  color: ${color.danger};
  border: none;
`

const variantMap = {
  primary: primaryStyle,
  secondary: secondaryStyle,
  danger: dangerStyle,
} as const

export const Button: FC<ButtonProps> = ({ variant, disabled, onClick, children }) => (
  <button
    class={cx(baseStyle, variantMap[variant])}
    disabled={disabled}
    onClick={onClick}
    type="button"
  >
    {children}
  </button>
)
