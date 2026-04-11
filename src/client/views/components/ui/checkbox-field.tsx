import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight, space, radius } from "../../../styles/tokens.ts"

interface CheckboxFieldProps {
  readonly label: string
  readonly checked: boolean
  readonly onChange: () => void
}

const labelStyle = css`
  display: flex;
  align-items: center;
  gap: ${space[2]};
  font-family: ${font.satoshi};
  font-size: 14px;
  font-weight: ${weight.regular};
  color: ${color.textPrimary};
  cursor: pointer;
  padding: 8px 0;
  user-select: none;
`

const hiddenCheckboxStyle = css`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
`

const checkboxVisualStyle = css`
  width: 18px;
  height: 18px;
  border: 1.5px solid ${color.inputLine};
  border-radius: ${radius.checkbox};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s, border-color 0.15s;
`

const checkboxCheckedStyle = css`
  width: 18px;
  height: 18px;
  border: 1.5px solid ${color.primary};
  border-radius: ${radius.checkbox};
  background: ${color.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s, border-color 0.15s;
`

export const CheckboxField: FC<CheckboxFieldProps> = ({ label, checked, onChange }) => (
  <label class={labelStyle}>
    <input
      type="checkbox"
      class={hiddenCheckboxStyle}
      checked={checked}
      onChange={onChange}
    />
    <span class={checked ? checkboxCheckedStyle : checkboxVisualStyle}>
      {checked && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
          <path d="M5 13l4 4L19 7" />
        </svg>
      )}
    </span>
    {label}
  </label>
)
