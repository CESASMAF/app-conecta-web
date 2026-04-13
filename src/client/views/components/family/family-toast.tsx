import type { FC } from "hono/jsx/dom"
import { css, keyframes } from "hono/css"
import { color, font, weight, alpha } from "../../../styles/tokens.ts"

interface FamilyToastProps {
  readonly type: "success" | "error"
  readonly message: string
}

const slideUp = keyframes`
  from { transform: translateY(100px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`

const toastBase = css`
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${color.bgCardBorder};
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  font-family: ${font.satoshi};
  font-size: 0.875rem;
  color: ${color.textSageSecondary};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 200;
  animation: ${slideUp} 300ms cubic-bezier(0.34, 1.56, 0.64, 1);

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const toastSuccess = css`
  border-left: 3px solid ${color.primary};
`

const toastError = css`
  border-left: 3px solid ${color.dangerAlt};
`

const iconStyle = css`
  font-size: 18px;
`

export const FamilyToast: FC<FamilyToastProps> = ({ type, message }) => (
  <div class={`${toastBase} ${type === "success" ? toastSuccess : toastError}`} role="status">
    <span class={iconStyle} aria-hidden="true">{type === "success" ? "\u2713" : "\u26A0"}</span>
    <span>{message}</span>
  </div>
)
