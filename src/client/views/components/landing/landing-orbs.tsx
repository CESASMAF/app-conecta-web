import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, alpha } from "../../../styles/tokens.ts"
import { float1, float2 } from "../../../styles/auth-hub.ts"

const orbBase = css`
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  @media (prefers-reduced-motion: reduce) {
    animation: none !important;
  }
`

const orb1Style = css`
  ${orbBase}
  width: 600px;
  height: 600px;
  background: ${alpha(color.primary, 0.15)};
  top: -200px;
  right: -150px;
  animation: ${float1} 12s ease-in-out infinite;
  @media (max-width: 599px) {
    width: 400px;
    height: 400px;
  }
`

const orb2Style = css`
  ${orbBase}
  width: 500px;
  height: 500px;
  background: ${alpha(color.background, 0.1)};
  bottom: -150px;
  left: -100px;
  animation: ${float2} 15s ease-in-out infinite;
  @media (max-width: 599px) {
    width: 350px;
    height: 350px;
  }
`

export const LandingOrbs: FC = () => (
  <>
    <div class={orb1Style} aria-hidden="true" />
    <div class={orb2Style} aria-hidden="true" />
  </>
)
