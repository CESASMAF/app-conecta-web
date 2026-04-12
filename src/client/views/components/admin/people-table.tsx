import type { FC } from "hono/jsx/dom";
import { css } from "hono/css";
import { alpha, color, font, radius, weight } from "../../../styles/tokens.ts";
import type { PersonSummary } from "./types.ts";

interface PeopleTableProps {
  readonly people: readonly PersonSummary[];
  readonly searchQuery: string;
}

const tableWrapStyle = css`
  display: block;
  overflow-x: auto;
  @media (min-width: 600px) {
    display: block;
  }
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

const nameStyle = css`
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

const dotStyle = (_active: boolean) =>
  css`
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  `;

const roleBadgeStyle = css`
  display: inline-flex;
  padding: 3px 8px;
  border-radius: ${radius.pill};
  font-family: ${font.satoshi};
  font-weight: ${weight.semibold};
  font-size: 10px;
  background: ${alpha(color.backgroundDark, 0.1)};
  color: ${color.backgroundDark};
  margin-right: 4px;
`;

const filterPeople = (
  people: readonly PersonSummary[],
  query: string,
): readonly PersonSummary[] => {
  if (!query.trim()) return people;
  const q = query.toLowerCase().replace(/[.\-/]/g, "");
  return people.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.cpf.replace(/[.\-/]/g, "").includes(q),
  );
};

export const PeopleTable: FC<PeopleTableProps> = ({ people, searchQuery }) => {
  const filtered = filterPeople(people, searchQuery);

  if (filtered.length === 0) return null;

  return (
    <div class={tableWrapStyle}>
      <table class={tableStyle} aria-label="Lista de pessoas">
        <thead>
          <tr>
            <th class={thStyle}>Nome</th>
            <th class={thStyle}>CPF</th>
            <th class={thStyle}>Nascimento</th>
            <th class={thStyle}>Roles</th>
            <th class={thStyle}>Status</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p) => (
            <tr key={p.id} class={rowStyle}>
              <td class={tdStyle}>
                <span class={nameStyle}>{p.name}</span>
              </td>
              <td class={tdStyle}>{p.cpf}</td>
              <td class={tdStyle}>{p.birthDate}</td>
              <td class={tdStyle}>
                {p.roles.map((r) => (
                  <span key={r} class={roleBadgeStyle}>{r}</span>
                ))}
              </td>
              <td class={tdStyle}>
                <span class={badgeStyle(p.active)}>
                  <span class={dotStyle(p.active)} />
                  {p.active ? "Ativo" : "Inativo"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
