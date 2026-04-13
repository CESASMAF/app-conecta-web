import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight } from "../../../styles/tokens.ts"

interface FamilyNavBarProps {
  readonly lastName: string
}

const navStyle = css`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: ${font.satoshi};
  font-size: 14px;
  font-weight: ${weight.bold};
  color: ${color.textMuted};
`

const separatorStyle = css`
  color: ${color.textMuted};
`

const activeStyle = css`
  color: ${color.textPrimary};
`

export const FamilyNavBar: FC<FamilyNavBarProps> = ({ lastName }) => (
  <nav class={navStyle}>
    <span>Familias</span>
    <span class={separatorStyle}>/</span>
    <span>{lastName}</span>
    <span class={separatorStyle}>/</span>
    <span class={activeStyle}>Composicao Familiar</span>
  </nav>
)
