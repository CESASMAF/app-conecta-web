import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight } from "../../../styles/tokens.ts"

const logoStyle = css`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: ${color.background};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
`

const letterStyle = css`
  font-family: ${font.satoshi};
  font-size: 36px;
  font-weight: ${weight.bold};
  color: ${color.backgroundDark};
  line-height: 1;
`

export const LandingLogo: FC = () => (
  <div class={logoStyle} aria-hidden="true">
    <span class={letterStyle}>A</span>
  </div>
)
