import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight } from "../../../styles/tokens.ts"
import type { FamilyMemberModel } from "../../../viewmodels/family-composition/types.ts"
import { FamilyMemberRow } from "./family-member-row.tsx"

interface FamilyTableProps {
  readonly members: readonly FamilyMemberModel[]
  readonly onEdit: (index: number) => void
  readonly onRemove: (personId: string) => void
  readonly onSetCaregiver: (personId: string) => void
}

const tableStyle = css`
  width: 100%;
  border-collapse: collapse;
  margin-top: 24px;
`

const thStyle = css`
  font-family: ${font.satoshi};
  font-size: 13px;
  font-weight: ${weight.bold};
  text-transform: uppercase;
  letter-spacing: 0.65px;
  color: ${color.textMuted};
  text-align: left;
  padding: 12px 8px;
  border-bottom: 2px solid ${color.inputLine};
`

const COLUMNS = ["Nome", "Idade", "Sexo", "Parentesco", "Reside", "PcD", "Docs", "Acoes"] as const

export const FamilyTable: FC<FamilyTableProps> = ({
  members,
  onEdit,
  onRemove,
  onSetCaregiver,
}) => (
  <table class={tableStyle}>
    <thead>
      <tr>
        {COLUMNS.map((col) => (
          <th class={thStyle} key={col}>{col}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {members.map((member, index) => (
        <FamilyMemberRow
          key={member.personId}
          member={member}
          onEdit={() => onEdit(index)}
          onRemove={() => onRemove(member.personId)}
          onSetCaregiver={() => onSetCaregiver(member.personId)}
        />
      ))}
    </tbody>
  </table>
)
