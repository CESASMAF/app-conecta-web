import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { font, weight, color } from "../../../styles/tokens.ts"

const taglineStyle = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.9375rem, 0.875rem + 0.25vw, 1.0625rem);
  font-style: italic;
  font-weight: ${weight.regular};
  color: ${color.textSageMuted};
  line-height: 1.6;
  max-width: min(90%, 24rem);
  text-align: center;
  margin: 0;
`

export const LandingTagline: FC = () => (
  <p class={taglineStyle}>
    Plataforma integrada de assistência e cuidado social para gestão de
    famílias e acompanhamento comunitário
  </p>
)
