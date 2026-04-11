import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { font } from "../../../styles/tokens.ts"

const footerStyle = css`
  position: absolute;
  bottom: 32px;
  left: 0;
  right: 0;
  text-align: center;
  font-family: ${font.satoshi};
  font-size: 13px;
  color: rgba(242, 226, 196, 0.5);
  letter-spacing: 0.5px;
`

export const LandingFooter: FC = () => (
  <footer class={footerStyle}>
    ACDG — Assistência e Cuidado em Desenvolvimento e Gestão
  </footer>
)
