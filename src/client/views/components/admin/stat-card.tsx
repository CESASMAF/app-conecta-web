import type { FC } from "hono/jsx/dom";
import { css } from "hono/css";
import { color, font, radius, weight } from "../../../styles/tokens.ts";

interface StatCardProps {
  readonly label: string;
  readonly value: number;
  readonly detail?: string;
  readonly highlight?: boolean;
}

const cardStyle = (highlight: boolean) =>
  css`
    background: ${color.surface};
    border-radius: ${radius.card};
    padding: 20px;
    border: ${highlight
      ? `2px solid ${color.warning}`
      : "1px solid transparent"};
    transition: all 200ms ease;
    &:hover {
      border-color: ${color.inputLine};
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    }
  `;

const labelStyle = (highlight: boolean) =>
  css`
    font-family: ${font.satoshi};
    font-weight: ${weight.bold};
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: ${highlight ? color.warning : color.textMuted};
    margin: 0;
  `;

const valueStyle = css`
  font-family: ${font.playfair};
  font-style: italic;
  font-weight: ${weight.regular};
  font-size: 36px;
  color: ${color.textPrimary};
  line-height: 1;
  margin: 8px 0 0;
`;

const detailStyle = css`
  font-family: ${font.satoshi};
  font-weight: ${weight.regular};
  font-size: 12px;
  color: ${color.textMuted};
  margin-top: 6px;
`;

export const StatCard: FC<StatCardProps> = (
  { label, value, detail, highlight = false },
) => (
  <div class={cardStyle(highlight)}>
    <p class={labelStyle(highlight)}>{label}</p>
    <p class={valueStyle}>{value}</p>
    {detail && <p class={detailStyle}>{detail}</p>}
  </div>
);
