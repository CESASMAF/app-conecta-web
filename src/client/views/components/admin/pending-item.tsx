import type { FC } from "hono/jsx/dom";
import { css } from "hono/css";
import { alpha, color, font, radius, weight } from "../../../styles/tokens.ts";

interface PendingItemProps {
  readonly title: string;
  readonly meta: string;
  readonly onApprove: () => void;
  readonly onReject: () => void;
}

const itemStyle = css`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${color.surface};
  border-radius: ${radius.dropdown};
  border: 1px solid transparent;
  transition: all 200ms ease;
  &:hover {
    border-color: ${color.inputLine};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }
`;

const iconStyle = css`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${alpha(color.warning, 0.12)};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
`;

const infoStyle = css`
  flex: 1;
  min-width: 0;
`;

const titleStyle = css`
  font-family: ${font.satoshi};
  font-weight: ${weight.semibold};
  font-size: 14px;
  color: ${color.textPrimary};
  margin: 0;
`;

const metaStyle = css`
  font-family: ${font.satoshi};
  font-weight: ${weight.regular};
  font-size: 12px;
  color: ${color.textMuted};
  margin: 2px 0 0;
`;

const actionsStyle = css`
  display: flex;
  gap: 10px;
  flex-shrink: 0;
`;

const approveBtnStyle = css`
  padding: 8px 18px;
  border-radius: ${radius.pill};
  background: ${alpha(color.primary, 0.12)};
  color: ${color.primary};
  border: none;
  font-family: ${font.satoshi};
  font-weight: ${weight.semibold};
  font-size: 13px;
  cursor: pointer;
  transition: all 200ms ease;
  &:hover {
    background: ${color.primary};
    color: white;
  }
  &:focus-visible {
    outline: 2px solid ${color.primary};
    outline-offset: 2px;
  }
`;

const rejectBtnStyle = css`
  padding: 8px 18px;
  border-radius: ${radius.pill};
  background: ${alpha(color.danger, 0.08)};
  color: ${color.danger};
  border: none;
  font-family: ${font.satoshi};
  font-weight: ${weight.semibold};
  font-size: 13px;
  cursor: pointer;
  transition: all 200ms ease;
  &:hover {
    background: ${color.danger};
    color: white;
  }
  &:focus-visible {
    outline: 2px solid ${color.primary};
    outline-offset: 2px;
  }
`;

export const PendingItem: FC<PendingItemProps> = (
  { title, meta, onApprove, onReject },
) => (
  <div class={itemStyle} role="group">
    <div class={iconStyle} aria-hidden="true">!</div>
    <div class={infoStyle}>
      <p class={titleStyle}>{title}</p>
      <p class={metaStyle}>{meta}</p>
    </div>
    <div class={actionsStyle}>
      <button class={approveBtnStyle} type="button" onClick={onApprove}>
        Aprovar
      </button>
      <button class={rejectBtnStyle} type="button" onClick={onReject}>
        Rejeitar
      </button>
    </div>
  </div>
);
