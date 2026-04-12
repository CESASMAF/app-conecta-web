import type { FC } from "hono/jsx/dom";
import { css } from "hono/css";
import { color, font, radius, weight } from "../../../styles/tokens.ts";

interface AdminSearchInputProps {
  readonly placeholder: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly ariaLabel: string;
  readonly disabled?: boolean;
}

const wrapperStyle = css`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: ${color.surface};
  border-radius: ${radius.pill};
  border: 1px solid ${color.inputLine};
  max-width: 400px;
  margin-bottom: 24px;
  transition: border-color 200ms ease;
  &:focus-within {
    border-color: ${color.backgroundDark};
  }
`;

const iconStyle = css`
  width: 16px;
  height: 16px;
  color: ${color.textMuted};
  flex-shrink: 0;
`;

const inputStyle = css`
  border: none;
  background: none;
  font-family: ${font.playfair};
  font-style: italic;
  font-weight: ${weight.light};
  font-size: 14px;
  color: ${color.textPrimary};
  flex: 1;
  outline: none;
  &::placeholder {
    color: ${color.textMuted};
  }
`;

export const AdminSearchInput: FC<AdminSearchInputProps> = ({
  placeholder,
  value,
  onChange,
  ariaLabel,
  disabled = false,
}) => (
  <div class={wrapperStyle}>
    <svg
      class={iconStyle}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
    <input
      class={inputStyle}
      type="text"
      placeholder={placeholder}
      value={value}
      aria-label={ariaLabel}
      disabled={disabled}
      // Cast required: Hono's event target is typed as EventTarget, but onInput always fires on HTMLInputElement
      onInput={(e) => onChange((e.target as HTMLInputElement).value)}
    />
  </div>
);
