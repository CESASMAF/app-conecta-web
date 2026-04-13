import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight } from "../../../styles/tokens.ts"

const titleStyle = css`
  font-family: ${font.erode};
  font-size: clamp(2rem, 1.5rem + 2.5vw, 2.625rem);
  font-weight: ${weight.semibold};
  color: ${color.textSagePrimary};
  line-height: 1.2;
  margin: 0;
  letter-spacing: -0.01em;
`

export const LandingTitle: FC = () => (
  <h1 class={titleStyle}>Conecta</h1>
)
