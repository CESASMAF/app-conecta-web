import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { alpha } from "../../../styles/tokens.ts"
import { fadeInUp } from "../../../styles/auth-hub.ts"

interface RedirectIconProps {
  readonly color: string
}

const containerStyle = css`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeInUp} 500ms ease both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

export const RedirectIcon: FC<RedirectIconProps> = ({ color: c }) => (
  <div class={containerStyle} style={{ background: alpha(c, 0.12) }}>
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={c} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
      <path d="M14 9l3 3-3 3" />
    </svg>
  </div>
)
