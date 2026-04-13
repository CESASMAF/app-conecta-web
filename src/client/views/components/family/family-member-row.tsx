import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight, alpha } from "../../../styles/tokens.ts"
import type { FamilyMemberModel } from "../../../viewmodels/family-composition/types.ts"
import { calculateAge } from "../../../viewmodels/family-composition/reducer.ts"

interface FamilyMemberRowProps {
  readonly member: FamilyMemberModel
  readonly onEdit: () => void
  readonly onRemove: () => void
  readonly onSetCaregiver: () => void
}

const rowBase = css`
  display: table-row;
  font-family: ${font.satoshi};
  font-size: 13px;
  font-weight: ${weight.medium};
  color: ${color.textPrimary};
`

const rowPR = css`
  background: ${alpha(color.primary, 0.05)};
`

const rowCaregiver = css`
  background: ${alpha(color.backgroundDark, 0.04)};
`

const cellStyle = css`
  padding: 12px 8px;
  vertical-align: middle;
  border-bottom: 1px solid ${color.inputLine};
`

const badgeBase = css`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: ${weight.bold};
  letter-spacing: 0.3px;
`

const badgePR = css`
  ${badgeBase}
  background: ${alpha(color.primary, 0.12)};
  color: ${color.primary};
`

const badgeCaregiver = css`
  ${badgeBase}
  background: ${alpha(color.backgroundDark, 0.1)};
  color: ${color.backgroundDark};
`

const actionBtn = css`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 6px;
  font-size: 16px;
  opacity: 0.7;
  transition: opacity 0.2s;
  &:hover { opacity: 1; }
`

const lockIcon = css`
  padding: 4px 6px;
  font-size: 16px;
  opacity: 0.4;
  cursor: default;
`

export const FamilyMemberRow: FC<FamilyMemberRowProps> = ({
  member,
  onEdit,
  onRemove,
  onSetCaregiver,
}) => {
  const age = calculateAge(member.birthDate, new Date())
  const rowClass = member.isPR ? rowPR : member.isPrimaryCaregiver ? rowCaregiver : rowBase

  return (
    <tr class={rowClass}>
      <td class={cellStyle}>
        {member.name}
        {member.isPR && <span class={badgePR}> Referencia</span>}
        {member.isPrimaryCaregiver && !member.isPR && (
          <span class={badgeCaregiver}> Cuidador</span>
        )}
      </td>
      <td class={cellStyle}>{age}</td>
      <td class={cellStyle}>{member.sex}</td>
      <td class={cellStyle}>{member.relationshipLabel}</td>
      <td class={cellStyle}>{member.residesWithPatient ? "Sim" : "Nao"}</td>
      <td class={cellStyle}>{member.hasDisability ? "Sim" : "Nao"}</td>
      <td class={cellStyle}>{member.requiredDocuments.join(", ") || "-"}</td>
      <td class={cellStyle}>
        <button class={actionBtn} onClick={onSetCaregiver} title="Definir cuidador">
          &#9733;
        </button>
        <button class={actionBtn} onClick={onEdit} title="Editar">
          &#9998;
        </button>
        {member.isPR ? (
          <span class={lockIcon} title="Pessoa de referencia nao pode ser removida">
            &#128274;
          </span>
        ) : (
          <button class={actionBtn} onClick={onRemove} title="Remover">
            &#128465;
          </button>
        )}
      </td>
    </tr>
  )
}
