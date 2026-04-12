import type { FC } from "hono/jsx/dom";
import { css, keyframes } from "hono/css";
import { color, font, radius, weight } from "../../../styles/tokens.ts";

interface ToastProps {
  readonly type: "success" | "error";
  readonly message: string;
  readonly onDismiss: () => void;
}

const slideUp = keyframes`
  from { transform: translateX(-50%) translateY(150%); }
  to { transform: translateX(-50%) translateY(0); }
`;

const toastStyle = (variant: "success" | "error") =>
  css`
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    border-radius: ${radius.pill};
    font-family: ${font.satoshi};
    font-weight: ${weight.semibold};
    font-size: 13px;
    color: white;
    background: ${variant === "success" ? color.primary : color.danger};
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
    z-index: 6000;
    animation: ${slideUp} 400ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
    cursor: pointer;
    white-space: nowrap;
  `;

export const Toast: FC<ToastProps> = ({ type, message, onDismiss }) => (
  <div
    class={toastStyle(type)}
    role={type === "error" ? "alert" : "status"}
    aria-live={type === "error" ? "assertive" : "polite"}
    onClick={onDismiss}
  >
    {message}
  </div>
);
