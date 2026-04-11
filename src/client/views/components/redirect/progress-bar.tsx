import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color } from "../../../styles/tokens.ts"
import { fadeInUp, progressFill } from "../../../styles/auth-hub.ts"

const trackStyle = css`
  width: 200px;
  height: 4px;
  background: ${color.inputLine};
  border-radius: 2px;
  overflow: hidden;
  animation: ${fadeInUp} 500ms ease 300ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const fillStyle = css`
  height: 100%;
  background: ${color.primary};
  border-radius: 2px;
  animation: ${progressFill} 2s ease-in-out 400ms both;
  @media (prefers-reduced-motion: reduce) {
    width: 100%;
    animation: none;
  }
`

export const ProgressBar: FC = () => (
  <div class={trackStyle} role="progressbar" aria-valuemin={0} aria-valuemax={100}>
    <div class={fillStyle} />
  </div>
)
