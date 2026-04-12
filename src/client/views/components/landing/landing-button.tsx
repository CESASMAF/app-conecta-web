import type { FC } from "hono/jsx/dom"
import { css, keyframes } from "hono/css"
import { color, font, radius } from "../../../styles/tokens.ts"

interface LandingButtonProps {
  readonly onClick: () => void
  readonly loading?: boolean
}

const spin = keyframes`
  to { transform: rotate(360deg); }
`

const buttonStyle = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16px 48px;
  border-radius: ${radius.pill};
  border: none;
  background: ${color.background};
  color: ${color.backgroundDark};
  font-family: ${font.playfair};
  font-style: italic;
  font-size: 18px;
  font-weight: 400;
  cursor: pointer;
  box-shadow: 2.5px 2.5px 5px 2px rgba(0, 0, 0, 0.12);
  transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 300ms ease;
  &:hover {
    transform: scale(1.04);
    box-shadow: 3px 3px 8px 3px rgba(0, 0, 0, 0.18);
  }
  &:active {
    transform: scale(0.98);
  }
  &:focus-visible {
    outline: 2px solid ${color.background};
    outline-offset: 3px;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  @media (max-width: 599px) {
    padding: 14px 36px;
    font-size: 16px;
    white-space: nowrap;
    min-height: 48px;
  }
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

const spinnerStyle = css`
  width: 20px;
  height: 20px;
  border: 2px solid ${color.backgroundDark};
  border-top-color: transparent;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`

export const LandingButton: FC<LandingButtonProps> = ({ onClick, loading }) => (
  <button
    class={buttonStyle}
    onClick={onClick}
    disabled={loading}
    type="button"
    aria-label="Entrar na plataforma"
  >
    {loading
      ? <div class={spinnerStyle} aria-hidden="true" />
      : "Entrar na plataforma"}
  </button>
)
