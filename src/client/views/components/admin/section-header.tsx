import type { FC } from "hono/jsx/dom";
import { css } from "hono/css";
import { color, font, radius, space, weight } from "../../../styles/tokens.ts";

interface SectionHeaderProps {
  readonly title: string;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
  readonly linkLabel?: string;
  readonly onLink?: () => void;
}

const containerStyle = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${space[4]};
`;

const titleStyle = css`
  font-family: ${font.satoshi};
  font-weight: ${weight.bold};
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: ${color.textMuted};
`;

const actionBtnStyle = css`
  font-family: ${font.satoshi};
  font-weight: ${weight.semibold};
  font-size: 13px;
  color: white;
  background: ${color.primary};
  border: none;
  border-radius: ${radius.pill};
  padding: 8px 18px;
  cursor: pointer;
  transition: opacity 200ms ease;
  &:hover {
    opacity: 0.9;
  }
  &:focus-visible {
    outline: 2px solid ${color.primary};
    outline-offset: 2px;
  }
`;

const linkBtnStyle = css`
  font-family: ${font.satoshi};
  font-weight: ${weight.semibold};
  font-size: 12px;
  color: ${color.textMuted};
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  &:hover {
    color: ${color.textPrimary};
  }
  &:focus-visible {
    outline: 2px solid ${color.primary};
    outline-offset: 2px;
  }
`;

export const SectionHeader: FC<SectionHeaderProps> = ({
  title,
  actionLabel,
  onAction,
  linkLabel,
  onLink,
}) => (
  <div class={containerStyle}>
    <h3 class={titleStyle}>{title}</h3>
    <div>
      {actionLabel && onAction && (
        <button class={actionBtnStyle} type="button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
      {linkLabel && onLink && (
        <button class={linkBtnStyle} type="button" onClick={onLink}>
          {linkLabel}
        </button>
      )}
    </div>
  </div>
);
