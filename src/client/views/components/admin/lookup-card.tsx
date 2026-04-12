import type { FC } from "hono/jsx/dom";
import { css } from "hono/css";
import { color, font, radius, weight } from "../../../styles/tokens.ts";

interface LookupCardProps {
  readonly tableName: string;
  readonly entryCount: number;
  readonly isSelected: boolean;
  readonly onClick: () => void;
}

const cardStyle = (selected: boolean) =>
  css`
    background: ${color.surface};
    border-radius: ${radius.card};
    padding: 16px;
    border: 1px solid transparent;
    ${selected
      ? `border-left: 3px solid ${color.primary};`
      : ""} cursor: pointer;
    transition: all 200ms ease;
    &:hover {
      border-color: ${color.inputLine};
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    }
    &:focus-visible {
      outline: 2px solid ${color.primary};
      outline-offset: 2px;
    }
  `;

const nameStyle = css`
  font-family: ${font.satoshi};
  font-weight: ${weight.semibold};
  font-size: 13px;
  color: ${color.textPrimary};
  margin: 0;
`;

const countStyle = css`
  font-family: ${font.playfair};
  font-style: italic;
  font-weight: ${weight.light};
  font-size: 13px;
  color: ${color.textMuted};
  margin: 4px 0 0;
`;

export const LookupCard: FC<LookupCardProps> = (
  { tableName, entryCount, isSelected, onClick },
) => {
  const handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      class={cardStyle(isSelected)}
      role="button"
      tabindex={0}
      aria-label={`Ver ${tableName}, ${entryCount} valores ativos`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <p class={nameStyle}>{tableName}</p>
      <p class={countStyle}>{entryCount} valores</p>
    </div>
  );
};
