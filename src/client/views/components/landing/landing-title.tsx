import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight } from "../../../styles/tokens.ts"

const titleStyle = css`
  font-family: ${font.satoshi};
  font-size: 40px;
  font-weight: ${weight.bold};
  color: ${color.textOnDark};
  line-height: 1.2;
  margin: 0;
  @media (max-width: 599px) {
    font-size: 28px;
  }
`

export const LandingTitle: FC = () => (
  <h1 class={titleStyle}>ACDG</h1>
)
