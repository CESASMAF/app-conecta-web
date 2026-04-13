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
  margin-bottom: 48px;
  animation: ${fadeInUp} 600ms ease 100ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const greetingStyle = css`
  font-family: ${font.satoshi};
  font-size: 24px;
  font-weight: ${weight.bold};
  color: ${color.textPrimary};
  margin: 0 0 8px;
  @media (min-width: ${breakpoint.mobile}px) {
    font-size: 32px;
  }
`

const subtitleStyle = css`
  font-family: ${font.playfair};
  font-size: 16px;
  font-style: italic;
  font-weight: ${weight.light};
  color: ${color.textMuted};
  margin: 0;
`

export const HubWelcome: FC<HubWelcomeProps> = ({ greeting, subtitle }) => (
  <div class={containerStyle}>
    <h1 class={greetingStyle}>{greeting}</h1>
    <p class={subtitleStyle}>{subtitle}</p>
  </div>
)
