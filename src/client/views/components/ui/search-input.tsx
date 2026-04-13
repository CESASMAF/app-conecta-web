import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, radius } from "../../../styles/tokens.ts"

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
  width: 100%;
  padding: 0.625rem 1rem 0.625rem 2.5rem;
  background: ${color.bgCard};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid ${color.bgCardBorder};
  border-radius: ${radius.pill};
  font-family: ${font.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.25vw, 0.875rem);
  color: ${color.textSagePrimary};
  outline: none;
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);

  &::placeholder {
    color: ${color.textSageSoft};
    font-style: italic;
  }

  &:focus {
    border-color: ${color.bgCardBorderHover};
    box-shadow: 0 0 0 3px rgba(79, 132, 72, 0.08);
  }
`

const iconStyle = css`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: ${color.textSageSoft};
  pointer-events: none;
  width: 14px;
  height: 14px;
`

const clearButtonStyle = css`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 4px;
  color: ${color.textSageMuted};
  font-size: 16px;
  line-height: 1;
  transition: color 150ms ease;
  &:hover { color: ${color.textSagePrimary}; }
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
      placeholder="Buscar por nome, CPF..."
      value={query}
      onInput={(e) => onSearch((e.target as HTMLInputElement).value)}
      aria-label="Buscar familias"
    />
    {query.length > 0 && (
      <button class={clearButtonStyle} onClick={onClear} type="button" aria-label="Limpar busca">
        &times;
      </button>
    )}
  </div>
)
