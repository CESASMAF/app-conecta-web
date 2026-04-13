import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight, space } from "../../../styles/tokens.ts"

const navStyle = css`
  display: flex;
  align-items: center;
  gap: ${space[2]};
  font-family: ${font.satoshi};
  font-size: 14px;
  color: ${color.textMuted};
`

const linkStyle = css`
  text-decoration: none;
  color: ${color.textMuted};
  font-weight: ${weight.medium};
  &:hover { color: ${color.textPrimary}; }
`

const currentStyle = css`
  color: ${color.textPrimary};
  font-weight: ${weight.semibold};
`

export const WizardNavBar: FC = () => (
  <nav class={navStyle}>
    <a href="/social-care" class={linkStyle}>Familias</a>
    <span>/</span>
    <span class={currentStyle}>Cadastro</span>
  </nav>
)
