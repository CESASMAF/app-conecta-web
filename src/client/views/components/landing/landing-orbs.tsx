import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { alpha, color } from "../../../styles/tokens.ts"
import { float1, float2, reducedMotion } from "../../../styles/auth-hub.ts"

const orbBase = css`
  ${reducedMotion}
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
`

const orb1Style = css`
  ${orbBase}
  width: clamp(20rem, 15rem + 20vw, 32rem);
  height: clamp(20rem, 15rem + 20vw, 32rem);
  background: radial-gradient(circle, ${alpha(color.primary, 0.07)} 0%, transparent 70%);
  top: -15%;
  right: -10%;
  animation: ${float1} 12s ease-in-out infinite;
`

const orb2Style = css`
  ${orbBase}
  width: clamp(18rem, 14rem + 18vw, 38rem);
  height: clamp(18rem, 14rem + 18vw, 38rem);
  background: radial-gradient(circle, rgba(180, 160, 100, 0.05) 0%, transparent 70%);
  bottom: -20%;
  left: -5%;
  animation: ${float2} 15s ease-in-out infinite;
`

export const LandingOrbs: FC = () => (
  <>
    <div class={orb1Style} aria-hidden="true" />
    <div class={orb2Style} aria-hidden="true" />
  </>
)
