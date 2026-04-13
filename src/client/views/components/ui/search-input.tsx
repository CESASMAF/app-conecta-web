import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, space } from "../../../styles/tokens.ts"

interface SearchInputProps {
  readonly query: string
  readonly onSearch: (query: string) => void
  readonly onClear: () => void
}

const wrapperStyle = css`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`

const inputStyle = css`
  border: none;
  border-bottom: 1px solid ${color.inputLine};
  padding: 8px 32px 8px 28px;
  font-family: ${font.satoshi};
  font-size: 18px;
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

const iconStyle = css`
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  opacity: 0.5;
  pointer-events: none;
`

const clearButtonStyle = css`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  cursor: pointer;
  padding: ${space[1]};
  color: ${color.textMuted};
  font-size: 18px;
  line-height: 1;
  &:hover { color: ${color.textPrimary}; }
`

export const SearchInput: FC<SearchInputProps> = ({ query, onSearch, onClear }) => (
  <div class={wrapperStyle}>
    <svg class={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
    <input
      class={inputStyle}
      type="text"
      placeholder="Buscar paciente..."
      value={query}
      onInput={(e) => onSearch((e.target as HTMLInputElement).value)}
    />
    {query.length > 0 && (
      <button class={clearButtonStyle} onClick={onClear} type="button" aria-label="Limpar busca">
        &times;
      </button>
    )}
  </div>
)
