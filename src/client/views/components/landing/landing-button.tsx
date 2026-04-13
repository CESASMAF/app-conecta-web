import type { FC } from "hono/jsx/dom"
import { css, keyframes } from "hono/css"
import { color, font, weight, radius } from "../../../styles/tokens.ts"
import { reducedMotion } from "../../../styles/auth-hub.ts"

interface LandingButtonProps {
  readonly onClick: () => void
  readonly loading?: boolean
}

const spin = keyframes`
  to { transform: rotate(360deg); }
`

const buttonStyle = css`
  ${reducedMotion}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: clamp(0.75rem, 0.625rem + 0.5vw, 1rem) clamp(2rem, 1.5rem + 2vw, 3rem);
  border-radius: ${radius.pill};
  border: none;
  background: linear-gradient(135deg, ${color.primary}, ${color.primaryDark});
  color: #fff;
  font-family: ${font.satoshi};
  font-size: clamp(0.9375rem, 0.875rem + 0.25vw, 1.0625rem);
  font-weight: ${weight.semibold};
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(79, 132, 72, 0.3),
              0 1px 4px rgba(0, 0, 0, 0.08);
  transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 300ms ease;
  letter-spacing: 0.01em;
  min-height: 48px;
  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 24px rgba(79, 132, 72, 0.35),
                0 2px 8px rgba(0, 0, 0, 0.1);
  }
  &:active {
    transform: translateY(0) scale(0.98);
  }
  &:focus-visible {
    outline: 2px solid ${color.primary};
    outline-offset: 3px;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`

const spinnerStyle = css`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
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
