import type { FC } from "hono/jsx/dom"
import { css, cx } from "hono/css"
import { color, font, weight, alpha } from "../../../styles/tokens.ts"

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
  gap: 0.375rem;
  width: 100%;
`

const labelStyle = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem);
  font-weight: ${weight.semibold};
  letter-spacing: 1px;
  text-transform: uppercase;
  color: ${color.textSageSoft};
`

const inputStyle = css`
  border: none;
  border-bottom: 1.5px solid ${alpha(color.primary, 0.15)};
  padding: clamp(0.5rem, 0.4rem + 0.4vw, 0.625rem) 0;
  font-family: ${font.satoshi};
  font-size: clamp(0.875rem, 0.8rem + 0.35vw, 0.9375rem);
  color: ${color.textSagePrimary};
  background: transparent;
  outline: none;
  width: 100%;
  transition: border-color 300ms cubic-bezier(0.16, 1, 0.3, 1);

  &:focus {
    border-color: ${color.primary};
  }

  &::placeholder {
    color: ${color.textSageSoft};
    font-style: italic;
  }
`

const inputFilledStyle = css`
  border-color: ${alpha(color.primary, 0.3)};
`

const inputErrorStyle = css`
  border-bottom: 2px solid ${color.dangerAlt};
  &:focus { border-bottom: 2px solid ${color.dangerAlt}; }
`

const errorTextStyle = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.15vw, 0.75rem);
  color: ${color.dangerAlt};
  margin-top: 0.25rem;
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
      class={cx(
        inputStyle,
        error ? inputErrorStyle : value ? inputFilledStyle : undefined,
      )}
      type={type ?? "text"}
      value={value}
      onInput={(e) => onChange((e.target as HTMLInputElement).value)}
      disabled={disabled}
      aria-label={label}
    />
    {error && <span class={errorTextStyle}>{error}</span>}
  </div>
)
