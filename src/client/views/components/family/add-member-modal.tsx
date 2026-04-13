import type { FC } from "hono/jsx/dom"
import { useState } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight, alpha, space, radius } from "../../../styles/tokens.ts"
import type { FamilyMemberModel, LookupItem } from "../../../viewmodels/family-composition/types.ts"
import { ModalShell } from "../ui/modal-shell.tsx"

interface AddMemberModalProps {
  readonly lookups: readonly LookupItem[]
  readonly onSave: (member: FamilyMemberModel) => void
  readonly onClose: () => void
  readonly editMember?: FamilyMemberModel
}

const layoutStyle = css`
  display: flex;
  gap: ${space[5]};
  flex-wrap: wrap;
`

const formSection = css`
  flex: 1 1 300px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const listSection = css`
  flex: 0 1 220px;
  max-height: 360px;
  overflow-y: auto;
  border: 1px solid ${alpha(color.background, 0.2)};
  border-radius: ${radius.dropdown};
  padding: ${space[2]};
`

const titleStyle = css`
  font-family: ${font.satoshi};
  font-size: 22px;
  font-weight: ${weight.bold};
  color: ${color.background};
  margin-bottom: ${space[4]};
`

const labelStyle = css`
  font-family: ${font.satoshi};
  font-size: 12px;
  font-weight: ${weight.bold};
  color: ${alpha(color.background, 0.5)};
  text-transform: uppercase;
  letter-spacing: 0.65px;
  margin-bottom: 4px;
`

const darkInput = css`
  border: none;
  border-bottom: 1px solid ${alpha(color.background, 0.3)};
  padding: 0 0 6px 0;
  font-family: ${font.playfair};
  font-style: italic;
  font-size: 14px;
  font-weight: 300;
  color: ${color.background};
  background: transparent;
  outline: none;
  width: 100%;
  &:focus { border-bottom-color: ${color.background}; }
  &::placeholder { color: ${alpha(color.background, 0.5)}; }
`

const darkSelect = css`
  ${darkInput}
  appearance: none;
  cursor: pointer;
`

const listItemStyle = (selected: boolean) => css`
  padding: 8px 12px;
  font-family: ${font.satoshi};
  font-size: 13px;
  color: ${color.background};
  cursor: pointer;
  border-radius: 4px;
  font-weight: ${selected ? weight.semibold : weight.regular};
  background: ${selected ? alpha(color.background, 0.1) : "transparent"};
  &:hover { background: ${alpha(color.background, 0.05)}; }
`

const checkboxRow = css`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${color.background};
  font-family: ${font.satoshi};
  font-size: 14px;
`

const saveBtnStyle = css`
  margin-top: ${space[4]};
  padding: 12px 32px;
  border-radius: ${radius.pill};
  border: none;
  background: ${color.primary};
  color: white;
  font-family: ${font.satoshi};
  font-size: 14px;
  font-weight: ${weight.bold};
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover { opacity: 0.9; }
`

export const AddMemberModal: FC<AddMemberModalProps> = ({
  lookups,
  onSave,
  onClose,
  editMember,
}) => {
  const isEdit = !!editMember
  const [name, setName] = useState(editMember?.name ?? "")
  const [birthDate, setBirthDate] = useState(editMember?.birthDate ?? "")
  const [sex, setSex] = useState(editMember?.sex ?? "")
  const [resides, setResides] = useState(editMember?.residesWithPatient ?? true)
  const [disability, setDisability] = useState(editMember?.hasDisability ?? false)
  const [caregiver, setCaregiver] = useState(editMember?.isPrimaryCaregiver ?? false)
  const [relationshipId, setRelationshipId] = useState(editMember?.relationshipId ?? "")

  const handleSave = (): void => {
    if (!name || !birthDate || !sex || !relationshipId) return
    const selectedLookup = lookups.find((l) => l.id === relationshipId)
    onSave({
      personId: editMember?.personId ?? crypto.randomUUID(),
      name,
      birthDate,
      sex,
      relationshipId,
      relationshipLabel: selectedLookup?.descricao ?? "",
      residesWithPatient: resides,
      hasDisability: disability,
      isPrimaryCaregiver: caregiver,
      isPR: editMember?.isPR ?? false,
      requiredDocuments: editMember?.requiredDocuments ?? [],
    })
  }

  return (
    <ModalShell onClose={onClose} maxWidth="760px">
      <h2 class={titleStyle}>{isEdit ? "Editar Membro" : "Adicionar Membro"}</h2>
      <div class={layoutStyle}>
        <div class={formSection}>
          <div>
            <label class={labelStyle}>Nome *</label>
            <input
              class={darkInput}
              value={name}
              onInput={(e) => setName((e.target as HTMLInputElement).value)}
              placeholder="Nome completo"
              disabled={isEdit}
            />
          </div>
          <div>
            <label class={labelStyle}>Data Nasc. *</label>
            <input
              class={darkInput}
              type="date"
              value={birthDate}
              onInput={(e) => setBirthDate((e.target as HTMLInputElement).value)}
              disabled={isEdit}
            />
          </div>
          <div>
            <label class={labelStyle}>Sexo *</label>
            <select
              class={darkSelect}
              value={sex}
              onChange={(e) => setSex((e.target as HTMLSelectElement).value)}
              disabled={isEdit}
            >
              <option value="">Selecione</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
            </select>
          </div>
          <label class={checkboxRow}>
            <input
              type="checkbox"
              checked={resides}
              onChange={() => setResides(!resides)}
            />
            Reside com paciente
          </label>
          <label class={checkboxRow}>
            <input
              type="checkbox"
              checked={disability}
              onChange={() => setDisability(!disability)}
            />
            Pessoa com deficiencia
          </label>
          <label class={checkboxRow}>
            <input
              type="checkbox"
              checked={caregiver}
              onChange={() => setCaregiver(!caregiver)}
            />
            Cuidador principal
          </label>
          <button class={saveBtnStyle} onClick={handleSave}>
            {isEdit ? "Salvar alteracoes" : "Adicionar"}
          </button>
        </div>
        <div class={listSection}>
          {lookups.map((item) => (
            <div
              key={item.id}
              class={listItemStyle(relationshipId === item.id)}
              onClick={() => setRelationshipId(item.id)}
            >
              {item.descricao}
            </div>
          ))}
        </div>
      </div>
    </ModalShell>
  )
}
