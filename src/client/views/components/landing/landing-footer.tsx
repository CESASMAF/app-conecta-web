import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { font, color } from "../../../styles/tokens.ts"

const footerStyle = css`
  position: absolute;
  bottom: clamp(1rem, 0.75rem + 1vw, 2rem);
  left: 0;
  right: 0;
  text-align: center;
  font-family: ${font.satoshi};
  font-size: clamp(0.6875rem, 0.625rem + 0.25vw, 0.8125rem);
  color: ${color.textSageSoft};
  letter-spacing: 0.5px;
`

export const LandingFooter: FC = () => (
  <footer class={footerStyle}>
    ACDG — Assist\u00eancia e Cuidado em Desenvolvimento e Gest\u00e3o
  </footer>
)
