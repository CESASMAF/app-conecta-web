import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight, space } from "../../../styles/tokens.ts"

interface TopBarProps {
  readonly activeTab: "familias" | "cadastro"
  readonly familyCount: number
  readonly onTabChange: (tab: "familias" | "cadastro") => void
}

const containerStyle = css`
  display: flex;
  align-items: baseline;
  gap: ${space[4]};
  padding: ${space[3]} 0;
  font-family: ${font.satoshi};
`

const tabStyle = css`
  font-size: 14px;
  font-weight: ${weight.bold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: ${space[1]} 0;
  border-bottom: 2px solid transparent;
  color: ${color.textMuted};
  transition: color 250ms ease, border-color 250ms ease;
  &:hover { color: ${color.textPrimary}; }
`

const tabActiveStyle = css`
  color: ${color.textPrimary};
  border-bottom-color: ${color.textPrimary};
`

const counterStyle = css`
  font-size: 14px;
  font-weight: ${weight.bold};
  color: ${color.textMuted};
  margin-left: auto;
`

export const TopBar: FC<TopBarProps> = ({ activeTab, familyCount, onTabChange }) => (
  <nav class={containerStyle}>
    <button
      class={`${tabStyle} ${activeTab === "familias" ? tabActiveStyle : ""}`}
      onClick={() => onTabChange("familias")}
      type="button"
    >
      Familias
    </button>
    <button
      class={`${tabStyle} ${activeTab === "cadastro" ? tabActiveStyle : ""}`}
      onClick={() => onTabChange("cadastro")}
      type="button"
    >
      Cadastro
    </button>
    <span class={counterStyle}>{familyCount} familias cadastradas</span>
  </nav>
)
