import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight, alpha } from "../../../styles/tokens.ts"

interface DataFieldProps {
  readonly label: string
  readonly value: string | null
}

const labelStyle = css`
  font-family: ${font.satoshi};
  font-size: 13px;
  font-weight: ${weight.bold};
  letter-spacing: 0.65px;
  text-transform: uppercase;
  color: ${alpha(color.background, 0.5)};
`

const valueStyle = css`
  font-family: ${font.playfair};
  font-size: 16px;
  color: ${color.background};
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const DataField: FC<DataFieldProps> = ({ label, value }) => (
  <div>
    <div class={labelStyle}>{label}</div>
    <div class={valueStyle}>{value ?? "\u2014"}</div>
  </div>
)
