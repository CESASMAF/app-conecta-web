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
  gap: 10px;
  padding: 16px 40px;
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
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

const arrowStyle = css`
  transition: transform 300ms ease;
  ${buttonStyle}:hover & {
    transform: translateX(4px);
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

const ArrowIcon: FC = () => (
  <svg class={arrowStyle} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

export const LandingButton: FC<LandingButtonProps> = ({ onClick, loading }) => (
  <button
    class={buttonStyle}
    onClick={onClick}
    disabled={loading}
    type="button"
    aria-label="Entrar na plataforma"
  >
    Entrar na plataforma
    {loading ? <div class={spinnerStyle} aria-hidden="true" /> : <ArrowIcon />}
  </button>
)
