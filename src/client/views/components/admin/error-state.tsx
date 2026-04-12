import type { FC } from "hono/jsx/dom";
import { css, keyframes } from "hono/css";
import { alpha, color, font, radius, weight } from "../../../styles/tokens.ts";

interface ErrorStateProps {
  readonly title: string;
  readonly message: string;
  readonly onRetry: () => void;
}

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
`;

const containerStyle = css`
  padding: 24px;
  background: ${alpha(color.danger, 0.05)};
  border: 1px solid ${alpha(color.danger, 0.15)};
  border-radius: ${radius.card};
  display: flex;
  align-items: flex-start;
  gap: 12px;
  animation: ${fadeInUp} 400ms ease-out;
`;

const iconStyle = css`
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: ${color.danger};
`;

const contentStyle = css`
  flex: 1;
`;

const titleStyle = css`
  font-family: ${font.satoshi};
  font-weight: ${weight.semibold};
  font-size: 14px;
  color: ${color.danger};
  margin: 0 0 4px;
`;

const messageStyle = css`
  font-family: ${font.satoshi};
  font-weight: ${weight.regular};
  font-size: 13px;
  color: ${color.textMuted};
  margin: 0;
`;

const retryBtnStyle = css`
  margin-left: auto;
  padding: 8px 16px;
  border: 1px solid ${color.danger};
  border-radius: ${radius.pill};
  background: none;
  color: ${color.danger};
  font-family: ${font.satoshi};
  font-weight: ${weight.semibold};
  font-size: 12px;
  cursor: pointer;
  flex-shrink: 0;
  align-self: center;
  &:focus-visible {
    outline: 2px solid ${color.primary};
    outline-offset: 2px;
  }
  &:hover {
    background: ${alpha(color.danger, 0.08)};
  }
`;

export const ErrorState: FC<ErrorStateProps> = (
  { title, message, onRetry },
) => (
  <div class={containerStyle} role="alert">
    <svg
      class={iconStyle}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
    <div class={contentStyle}>
      <h4 class={titleStyle}>{title}</h4>
      <p class={messageStyle}>{message}</p>
    </div>
    <button class={retryBtnStyle} type="button" onClick={onRetry}>
      Tentar novamente
    </button>
  </div>
);
