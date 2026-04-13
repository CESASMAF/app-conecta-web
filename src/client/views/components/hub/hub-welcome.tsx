import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight, breakpoint } from "../../../styles/tokens.ts"
import { fadeInUp } from "../../../styles/auth-hub.ts"

interface HubWelcomeProps {
  readonly greeting: string
  readonly subtitle: string
}

const containerStyle = css`
  text-align: center;
  margin-bottom: clamp(2rem, 1.5rem + 2vw, 3rem);
  animation: ${fadeInUp} 600ms cubic-bezier(0.16, 1, 0.3, 1) 100ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const greetingStyle = css`
  font-family: ${font.erode};
  font-size: clamp(1.5rem, 1.125rem + 1.5vw, 2rem);
  font-weight: ${weight.semibold};
  color: ${color.textSagePrimary};
  margin: 0 0 clamp(0.25rem, 0.125rem + 0.5vw, 0.5rem);
  letter-spacing: -0.01em;
  @media (min-width: ${breakpoint.mobile}px) {
    font-size: clamp(2rem, 1.5rem + 2.5vw, 2.625rem);
  }
`

const subtitleStyle = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.875rem, 0.8125rem + 0.25vw, 1rem);
  font-weight: ${weight.regular};
  color: ${color.textSageMuted};
  margin: 0;
`

export const HubWelcome: FC<HubWelcomeProps> = ({ greeting, subtitle }) => (
  <div class={containerStyle}>
    <h1 class={greetingStyle}>{greeting}</h1>
    <p class={subtitleStyle}>{subtitle}</p>
  </div>
)
