import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { font, weight } from "../../../styles/tokens.ts"

const taglineStyle = css`
  font-family: ${font.playfair};
  font-size: 18px;
  font-style: italic;
  font-weight: ${weight.light};
  color: rgba(242, 226, 196, 0.82);
  line-height: 1.6;
  max-width: 380px;
  text-align: center;
  margin: 0;
  @media (max-width: 599px) {
    font-size: 16px;
  }
`

export const LandingTagline: FC = () => (
  <p class={taglineStyle}>
    Plataforma integrada de assistência e cuidado social para gestão de
    famílias e acompanhamento comunitário
  </p>
)
