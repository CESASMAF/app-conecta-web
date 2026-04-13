import type { FC } from "hono/jsx/dom"
import { css, keyframes } from "hono/css"
import { color, font, weight } from "../../../styles/tokens.ts"
import { reducedMotion } from "../../../styles/auth-hub.ts"

const shimmer = keyframes`
  0%, 100% { opacity: 0.85; }
  50% { opacity: 1; }
`

const logoStyle = css`
  ${reducedMotion}
  width: clamp(4rem, 3.5rem + 2vw, 5rem);
  height: clamp(4rem, 3.5rem + 2vw, 5rem);
  border-radius: 16px;
  background: linear-gradient(135deg, ${color.primary}, ${color.primaryDark});
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(79, 132, 72, 0.25),
              0 2px 8px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
  animation: ${shimmer} 4s ease-in-out infinite;
`

const letterStyle = css`
  font-family: ${font.erode};
  font-size: clamp(1.5rem, 1.25rem + 1vw, 2rem);
  font-weight: ${weight.bold};
  color: #fff;
  line-height: 1;
`

export const LandingLogo: FC = () => (
  <div class={logoStyle} aria-hidden="true">
    <span class={letterStyle}>C</span>
  </div>
)
