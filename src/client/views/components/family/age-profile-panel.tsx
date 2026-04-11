import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight, alpha, space } from "../../../styles/tokens.ts"

interface AgeProfilePanelProps {
  readonly ageProfile: Readonly<Record<string, number>>
}

const panelStyle = css`
  margin-top: ${space[5]};
`

const titleStyle = css`
  font-family: ${font.satoshi};
  font-size: 10px;
  font-weight: ${weight.bold};
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: ${color.textMuted};
  margin-bottom: ${space[3]};
`

const tableStyle = css`
  width: 100%;
  max-width: 320px;
  border-collapse: collapse;
`

const rowStyle = (highlighted: boolean) => css`
  background: ${highlighted ? alpha(color.primary, 0.07) : "transparent"};
`

const cellStyle = css`
  font-family: ${font.satoshi};
  font-size: 13px;
  font-weight: ${weight.medium};
  color: ${color.textPrimary};
  padding: 8px 12px;
  border-bottom: 1px solid ${color.inputLine};
`

const countCell = css`
  ${cellStyle}
  text-align: right;
  font-weight: ${weight.bold};
`

const LABELS: Readonly<Record<string, string>> = {
  "0-5": "0 a 5 anos",
  "6-11": "6 a 11 anos",
  "12-17": "12 a 17 anos",
  "18-24": "18 a 24 anos",
  "25-34": "25 a 34 anos",
  "35-44": "35 a 44 anos",
  "45-59": "45 a 59 anos",
  "60+": "60 anos ou mais",
}

export const AgeProfilePanel: FC<AgeProfilePanelProps> = ({ ageProfile }) => (
  <div class={panelStyle}>
    <h3 class={titleStyle}>Perfil Etario</h3>
    <table class={tableStyle}>
      <tbody>
        {Object.entries(LABELS).map(([key, label]) => {
          const count = ageProfile[key] ?? 0
          return (
            <tr key={key} class={rowStyle(count > 0)}>
              <td class={cellStyle}>{label}</td>
              <td class={countCell}>{count}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  </div>
)
