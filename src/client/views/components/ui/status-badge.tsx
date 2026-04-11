import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight } from "../../../styles/tokens.ts"

interface StatusBadgeProps {
  readonly status: "Ativo" | "Inativo"
}

const badgeStyle = css`
  display: flex;
  align-items: center;
  gap: 6px;
`

const dotStyle = (active: boolean) => css`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${active ? color.primary : color.danger};
`

const labelStyle = css`
  font-family: ${font.satoshi};
  font-weight: ${weight.medium};
  font-size: 14px;
  color: ${color.textPrimary};
`

export const StatusBadge: FC<StatusBadgeProps> = ({ status }) => (
  <div class={badgeStyle}>
    <div class={dotStyle(status === "Ativo")} />
    <span class={labelStyle}>{status}</span>
  </div>
)
