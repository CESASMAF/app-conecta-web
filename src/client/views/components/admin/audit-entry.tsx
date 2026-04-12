import type { FC } from "hono/jsx/dom";
import { css } from "hono/css";
import { alpha, color, font, weight } from "../../../styles/tokens.ts";

interface AuditEntryProps {
  readonly timestamp: string;
  readonly action: string;
  readonly description: string;
  readonly actorName: string;
}

const entryStyle = css`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid ${alpha(color.textPrimary, 0.06)};
  flex-wrap: wrap;
  &:last-child {
    border-bottom: none;
  }
  @media (min-width: 600px) {
    flex-wrap: nowrap;
  }
`;

const timestampStyle = css`
  font-family: ${font.satoshi};
  font-weight: ${weight.regular};
  font-size: 12px;
  color: ${color.textMuted};
  white-space: nowrap;
  min-width: 120px;
`;

const getTagColor = (action: string): { bg: string; fg: string } => {
  if (action.includes("CREATED")) {
    return { bg: alpha(color.primary, 0.1), fg: color.primary };
  }
  if (action.includes("ASSIGNED") || action.includes("APPROVED")) {
    return { bg: alpha(color.backgroundDark, 0.1), fg: color.backgroundDark };
  }
  if (action.includes("TOGGLED") || action.includes("REJECTED")) {
    return { bg: alpha(color.warning, 0.1), fg: color.warning };
  }
  return { bg: alpha(color.textPrimary, 0.06), fg: color.textMuted };
};

const actionTagStyle = (action: string) => {
  const c = getTagColor(action);
  return css`
    font-family: ${font.satoshi};
    font-weight: ${weight.semibold};
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 3px 8px;
    border-radius: 4px;
    min-width: 100px;
    text-align: center;
    background: ${c.bg};
    color: ${c.fg};
    white-space: nowrap;
  `;
};

const descStyle = css`
  font-family: ${font.satoshi};
  font-weight: ${weight.regular};
  font-size: 13px;
  color: ${color.textPrimary};
  flex: 1;
`;

const actorStyle = css`
  font-family: ${font.satoshi};
  font-weight: ${weight.medium};
  font-size: 12px;
  color: ${color.textMuted};
  min-width: 100px;
  text-align: right;
`;

export const AuditEntryRow: FC<AuditEntryProps> = (
  { timestamp, action, description, actorName },
) => (
  <div class={entryStyle}>
    <span class={timestampStyle}>{timestamp}</span>
    <span class={actionTagStyle(action)}>{action}</span>
    <span class={descStyle}>{description}</span>
    <span class={actorStyle}>{actorName}</span>
  </div>
);
