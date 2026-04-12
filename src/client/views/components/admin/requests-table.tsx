import type { FC } from "hono/jsx/dom";
import { css } from "hono/css";
import { alpha, color, font, radius, weight } from "../../../styles/tokens.ts";
import type { LookupRequest } from "./types.ts";

interface RequestsTableProps {
  readonly requests: readonly LookupRequest[];
  readonly onApprove: (id: string, label: string) => void;
  readonly onReject: (id: string, label: string) => void;
}

const tableWrapStyle = css`
  display: block;
  overflow-x: auto;
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

const boldStyle = css`
  font-weight: ${weight.semibold};
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

const statusBadge = (status: LookupRequest["status"]) => {
  const map = {
    pendente: { bg: alpha(color.warning, 0.12), fg: color.warning },
    aprovado: { bg: alpha(color.primary, 0.12), fg: color.primary },
    rejeitado: { bg: alpha(color.danger, 0.08), fg: color.danger },
  } as const;
  const c = map[status];
  return css`
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
    background: ${c.bg};
    color: ${c.fg};
  `;
};

const dotStyle = css`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
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

const actionsStyle = css`
  display: flex;
  gap: 10px;
`;

const noteStyle = css`
  font-family: ${font.satoshi};
  font-weight: ${weight.regular};
  font-size: 12px;
  color: ${color.textMuted};
`;

const sortByStatus = (
  requests: readonly LookupRequest[],
): readonly LookupRequest[] => {
  const order: Record<string, number> = {
    pendente: 0,
    aprovado: 1,
    rejeitado: 2,
  };
  return [...requests].sort((a, b) =>
    (order[a.status] ?? 3) - (order[b.status] ?? 3)
  );
};

export const RequestsTable: FC<RequestsTableProps> = (
  { requests, onApprove, onReject },
) => {
  const sorted = sortByStatus(requests);

  return (
    <div class={tableWrapStyle}>
      <table class={tableStyle} aria-label="Lista de solicitacoes">
        <thead>
          <tr>
            <th class={thStyle}>Tabela</th>
            <th class={thStyle}>Valor Proposto</th>
            <th class={thStyle}>Solicitante</th>
            <th class={thStyle}>Data</th>
            <th class={thStyle}>Status</th>
            <th class={thStyle}>Acoes</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.id} class={rowStyle}>
              <td class={tdStyle}>{r.tableName}</td>
              <td class={tdStyle}>
                <span class={boldStyle}>{r.label}</span>
              </td>
              <td class={tdStyle}>{r.requestedBy}</td>
              <td class={tdStyle}>{r.createdAt}</td>
              <td class={tdStyle}>
                <span class={statusBadge(r.status)}>
                  <span class={dotStyle} />
                  {r.status}
                </span>
              </td>
              <td class={tdStyle}>
                {r.status === "pendente"
                  ? (
                    <div class={actionsStyle}>
                      <button
                        class={approveBtnStyle}
                        type="button"
                        onClick={() => onApprove(r.id, r.label)}
                      >
                        Aprovar
                      </button>
                      <button
                        class={rejectBtnStyle}
                        type="button"
                        onClick={() => onReject(r.id, r.label)}
                      >
                        Rejeitar
                      </button>
                    </div>
                  )
                  : r.status === "aprovado"
                  ? <span class={noteStyle}>Aprovado em {r.updatedAt}</span>
                  : <span class={noteStyle}>Motivo: {r.reviewNote ?? "-"}
                  </span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
