import type { FC } from "hono/jsx/dom";
import { css, keyframes } from "hono/css";
import { alpha, color, font, radius, weight } from "../../../styles/tokens.ts";
import type { LookupEntry } from "./types.ts";
import { SectionHeader } from "./section-header.tsx";
import { ToggleSwitch } from "./toggle-switch.tsx";

interface LookupDetailPanelProps {
  readonly tableName: string;
  readonly entries: readonly LookupEntry[];
  readonly onToggle: (entryId: string) => void;
  readonly onCreateEntry: () => void;
}

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
`;

const panelStyle = css`
  background: ${color.surfaceLight};
  border-radius: ${radius.panel};
  padding: 24px;
  margin-top: 24px;
  animation: ${fadeInUp} 400ms ease;
`;

const tableStyle = css`
  width: 100%;
  border-collapse: collapse;
  background: ${color.surface};
  border-radius: ${radius.card};
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const thStyle = css`
  font-family: ${font.satoshi};
  font-weight: ${weight.bold};
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: ${color.textMuted};
  padding: 12px 16px;
  text-align: left;
  background: ${alpha(color.textPrimary, 0.03)};
  border-bottom: 1px solid ${color.inputLine};
`;

const tdStyle = css`
  font-family: ${font.satoshi};
  font-weight: ${weight.regular};
  font-size: 14px;
  padding: 12px 16px;
  border-bottom: 1px solid ${alpha(color.textPrimary, 0.06)};
  color: ${color.textPrimary};
`;

const rowStyle = css`
  transition: background 150ms ease;
  &:hover {
    background: ${alpha(color.textPrimary, 0.02)};
  }
  &:last-child td {
    border-bottom: none;
  }
`;

const badgeStyle = (active: boolean) =>
  css`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: ${radius.pill};
    font-family: ${font.satoshi};
    font-weight: ${weight.semibold};
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: ${active
      ? alpha(color.primary, 0.12)
      : alpha(color.textPrimary, 0.06)};
    color: ${active ? color.primary : color.textMuted};
  `;

export const LookupDetailPanel: FC<LookupDetailPanelProps> = ({
  tableName,
  entries,
  onToggle,
  onCreateEntry,
}) => (
  <div class={panelStyle}>
    <SectionHeader
      title={`Detalhes: ${tableName}`}
      actionLabel="+ Novo Valor"
      onAction={onCreateEntry}
    />
    <table class={tableStyle} aria-label={`Valores da tabela ${tableName}`}>
      <thead>
        <tr>
          <th class={thStyle}>Valor</th>
          <th class={thStyle}>Status</th>
          <th class={thStyle}>Ativo</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => (
          <tr key={entry.id} class={rowStyle}>
            <td class={tdStyle}>{entry.label}</td>
            <td class={tdStyle}>
              <span class={badgeStyle(entry.active)}>
                {entry.active ? "Ativo" : "Inativo"}
              </span>
            </td>
            <td class={tdStyle}>
              <ToggleSwitch
                checked={entry.active}
                label={entry.label}
                onToggle={() => onToggle(entry.id)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
