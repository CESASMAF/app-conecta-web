import type { FC } from "hono/jsx/dom"
import { css, cx } from "hono/css"
import { color, font, weight, space } from "../../../styles/tokens.ts"

interface SelectOption {
  readonly value: string
  readonly label: string
}

interface UnderlineSelectProps {
  readonly label: string
  readonly value: string
  readonly options: readonly SelectOption[]
  readonly onChange: (value: string) => void
  readonly error?: string
  readonly required?: boolean
  readonly disabled?: boolean
}

const wrapperStyle = css`
  display: flex;
  flex-direction: column;
  gap: ${space[1]};
  width: 100%;
`

const labelStyle = css`
  font-family: ${font.satoshi};
  font-size: 13px;
  font-weight: ${weight.bold};
  letter-spacing: 0.65px;
  text-transform: uppercase;
  color: ${color.textMuted};
`

const selectStyle = css`
  border: none;
  border-bottom: 1px solid ${color.inputLine};
  padding: 8px 0;
  font-family: ${font.satoshi};
  font-size: 16px;
  color: ${color.textPrimary};
  background: transparent;
  outline: none;
  width: 100%;
  cursor: pointer;
  transition: border-color 0.2s;
  &:focus { border-bottom: 2px solid ${color.textPrimary}; }
`

const selectErrorBorderStyle = css`
  border-bottom: 2px solid ${color.danger};
  &:focus { border-bottom: 2px solid ${color.danger}; }
`

const errorTextStyle = css`
  font-family: ${font.satoshi};
  font-size: 12px;
  color: ${color.danger};
  margin-top: 4px;
`

const disabledStyle = css`
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
`

export const UnderlineSelect: FC<UnderlineSelectProps> = ({ label, value, options, onChange, error, required, disabled }) => (
  <div class={cx(wrapperStyle, disabled ? disabledStyle : undefined)}>
    <label class={labelStyle}>{label}{required && " *"}</label>
    <select
      class={cx(selectStyle, error ? selectErrorBorderStyle : undefined)}
      value={value}
      onChange={(e) => onChange((e.target as HTMLSelectElement).value)}
      disabled={disabled}
      aria-required={required}
    >
      {options.map((opt) => (
        <option value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <span class={errorTextStyle}>{error}</span>}
  </div>
)
