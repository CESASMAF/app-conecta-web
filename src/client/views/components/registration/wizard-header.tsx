import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight } from "../../../styles/tokens.ts"

const headerStyle = css`
  font-family: ${font.satoshi};
  font-size: 38px;
  font-weight: ${weight.bold};
  color: ${color.textPrimary};
  margin: 0;
  line-height: 1.2;
`

export const WizardHeader: FC = () => (
  <h1 class={headerStyle}>Cadastrar Pessoa de Referencia</h1>
)
