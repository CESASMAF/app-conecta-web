import type { FC } from "hono/jsx/dom"
import { css, cx } from "hono/css"
import { color, font, weight, space } from "../../../styles/tokens.ts"

interface UnderlineInputProps {
  readonly label: string
  readonly value: string
  readonly onChange: (value: string) => void
  readonly error?: string
  readonly type?: string
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

const inputStyle = css`
  border: none;
  border-bottom: 1px solid ${color.inputLine};
  padding: 8px 0;
  font-family: ${font.satoshi};
  font-size: 16px;
  color: ${color.textPrimary};
  background: transparent;
  outline: none;
  width: 100%;
  transition: border-color 0.2s;
  &:focus { border-bottom: 2px solid ${color.textPrimary}; }
  &::placeholder {
    color: ${color.textMuted};
    font-family: ${font.playfair};
    font-style: italic;
    font-weight: 300;
  }
`

const inputErrorStyle = css`
  border-bottom: 2px solid ${color.danger};
  &:focus { border-bottom: 2px solid ${color.danger}; }
`

const errorTextStyle = css`
  font-family: ${font.satoshi};
  font-size: 11px;
  color: ${color.danger};
  margin-top: ${space[1]};
`

const disabledStyle = css`
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
`

export const UnderlineInput: FC<UnderlineInputProps> = ({ label, value, onChange, error, type, disabled }) => (
  <div class={cx(wrapperStyle, disabled ? disabledStyle : undefined)}>
    <label class={labelStyle}>{label}</label>
    <input
      class={cx(inputStyle, error ? inputErrorStyle : undefined)}
      type={type ?? "text"}
      value={value}
      onInput={(e) => onChange((e.target as HTMLInputElement).value)}
      disabled={disabled}
    />
    {error && <span class={errorTextStyle}>{error}</span>}
  </div>
)
