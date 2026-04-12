import type { FC } from "hono/jsx/dom";
import { css } from "hono/css";
import { color } from "../../../styles/tokens.ts";

interface ToggleSwitchProps {
  readonly checked: boolean;
  readonly label: string;
  readonly onToggle: () => void;
}

const switchStyle = (checked: boolean) =>
  css`
    width: 40px;
    height: 22px;
    border-radius: 11px;
    background: ${checked ? color.primary : color.inputLine};
    position: relative;
    cursor: pointer;
    transition: background 200ms ease;
    border: none;
    padding: 0;
    &:focus-visible {
      outline: 2px solid ${color.primary};
      outline-offset: 2px;
    }
  `;

const knobStyle = (checked: boolean) =>
  css`
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: white;
    position: absolute;
    top: 2px;
    left: 2px;
    transition: transform 200ms ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transform: ${checked ? "translateX(18px)" : "translateX(0)"};
    pointer-events: none;
  `;

export const ToggleSwitch: FC<ToggleSwitchProps> = (
  { checked, label, onToggle },
) => (
  <button
    class={switchStyle(checked)}
    role="switch"
    aria-checked={checked}
    aria-label={checked ? `Desativar valor ${label}` : `Ativar valor ${label}`}
    type="button"
    onClick={onToggle}
  >
    <span class={knobStyle(checked)} />
  </button>
);
