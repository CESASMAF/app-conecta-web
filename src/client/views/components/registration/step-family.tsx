import type { FC } from "hono/jsx/dom"
import { useState } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight, space, radius } from "../../../styles/tokens.ts"
import { UnderlineInput } from "../ui/underline-input.tsx"
import { Button } from "../ui/button.tsx"
import type { FamilyMemberSnapshot } from "../../../viewmodels/registration/types.ts"

interface StepFamilyProps {
  readonly familyMembers: readonly FamilyMemberSnapshot[]
  readonly onAddMember: (member: FamilyMemberSnapshot) => void
  readonly onRemoveMember: (index: number) => void
}

const containerStyle = css`
  display: flex;
  flex-direction: column;
  gap: ${space[4]};
`

const cardStyle = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${space[3]} ${space[4]};
  border: 1px solid ${color.inputLine};
  border-radius: ${radius.card};
  font-family: ${font.satoshi};
`

const cardInfoStyle = css`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const cardName = css`
  font-size: 16px;
  font-weight: ${weight.semibold};
  color: ${color.textPrimary};
`

const cardDetail = css`
  font-size: 13px;
  color: ${color.textMuted};
`

const removeCardBtn = css`
  border: none;
  background: transparent;
  color: ${color.danger};
  font-size: 18px;
  cursor: pointer;
  padding: ${space[1]};
  &:hover { opacity: 0.7; }
`

const formStyle = css`
  display: flex;
  flex-wrap: wrap;
  gap: ${space[4]};
  padding: ${space[4]};
  border: 1px solid ${color.primary};
  border-radius: ${radius.card};
`

const fieldItem = css`
  min-width: 200px;
  flex: 1;
`

const formActions = css`
  width: 100%;
  display: flex;
  gap: ${space[3]};
  justify-content: flex-end;
`

const emptyStyle = css`
  font-family: ${font.satoshi};
  font-size: 14px;
  color: ${color.textMuted};
  text-align: center;
  padding: ${space[4]} 0;
`

const checkboxLabel = css`
  display: flex;
  align-items: center;
  gap: ${space[2]};
  font-family: ${font.satoshi};
  font-size: 14px;
  color: ${color.textPrimary};
  cursor: pointer;
`

const EMPTY_MEMBER: FamilyMemberSnapshot = {
  name: "",
  birthDate: "",
  gender: "",
  relationship: "",
  livesWithPatient: true,
  isDisabled: false,
}

export const StepFamily: FC<StepFamilyProps> = ({ familyMembers, onAddMember, onRemoveMember }) => {
  const [showForm, setShowForm] = useState(false)
  const [draft, setDraft] = useState<FamilyMemberSnapshot>(EMPTY_MEMBER)

  const handleAdd = (): void => {
    if (draft.name.trim() && draft.relationship.trim()) {
      onAddMember(draft)
      setDraft(EMPTY_MEMBER)
      setShowForm(false)
    }
  }

  return (
    <div class={containerStyle}>
      {familyMembers.length === 0 && !showForm && (
        <p class={emptyStyle}>Nenhum membro familiar adicionado. Este passo e opcional.</p>
      )}

      {familyMembers.map((member, index) => (
        <div class={cardStyle}>
          <div class={cardInfoStyle}>
            <span class={cardName}>{member.name}</span>
            <span class={cardDetail}>
              {member.relationship} | {member.gender} | {member.livesWithPatient ? "Reside" : "Nao reside"}
            </span>
          </div>
          <button
            class={removeCardBtn}
            type="button"
            onClick={() => onRemoveMember(index)}
            aria-label="Remover membro"
          >
            &times;
          </button>
        </div>
      ))}

      {showForm && (
        <div class={formStyle}>
          <div class={fieldItem}>
            <UnderlineInput
              label="Nome"
              value={draft.name}
              onChange={(v) => setDraft({ ...draft, name: v })}
            />
          </div>
          <div class={fieldItem}>
            <UnderlineInput
              label="Data de nascimento"
              value={draft.birthDate}
              onChange={(v) => setDraft({ ...draft, birthDate: v })}
            />
          </div>
          <div class={fieldItem}>
            <UnderlineInput
              label="Genero"
              value={draft.gender}
              onChange={(v) => setDraft({ ...draft, gender: v })}
            />
          </div>
          <div class={fieldItem}>
            <UnderlineInput
              label="Parentesco"
              value={draft.relationship}
              onChange={(v) => setDraft({ ...draft, relationship: v })}
            />
          </div>
          <div class={fieldItem}>
            <label class={checkboxLabel}>
              <input
                type="checkbox"
                checked={draft.livesWithPatient}
                onChange={() => setDraft({ ...draft, livesWithPatient: !draft.livesWithPatient })}
              />
              Reside com o paciente
            </label>
          </div>
          <div class={fieldItem}>
            <label class={checkboxLabel}>
              <input
                type="checkbox"
                checked={draft.isDisabled}
                onChange={() => setDraft({ ...draft, isDisabled: !draft.isDisabled })}
              />
              Pessoa com deficiencia
            </label>
          </div>
          <div class={formActions}>
            <Button variant="danger" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleAdd}>Confirmar</Button>
          </div>
        </div>
      )}

      {!showForm && (
        <Button variant="secondary" onClick={() => setShowForm(true)}>
          Adicionar membro
        </Button>
      )}
    </div>
  )
}
