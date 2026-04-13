import type { FC } from "hono/jsx/dom"
import { useState } from "hono/jsx/dom"
import { css, cx, keyframes } from "hono/css"
import { color, font, weight, alpha } from "../../../styles/tokens.ts"
import { UnderlineInput } from "../ui/underline-input.tsx"
import type { FamilyMemberSnapshot } from "../../../viewmodels/registration/types.ts"

interface StepFamilyProps {
  readonly familyMembers: readonly FamilyMemberSnapshot[]
  readonly onAddMember: (member: FamilyMemberSnapshot) => void
  readonly onRemoveMember: (index: number) => void
}

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`

const containerStyle = css`
  display: flex;
  flex-direction: column;
`

const memberRowStyle = css`
  display: grid;
  grid-template-columns: auto 1fr 1fr auto;
  align-items: center;
  gap: clamp(0.75rem, 0.625rem + 0.5vw, 1.5rem);
  padding: 0.75rem 0;
  border-bottom: 1px solid ${alpha(color.primary, 0.08)};
  animation: ${fadeInUp} 500ms cubic-bezier(0.16, 1, 0.3, 1) both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  @media (max-width: 600px) {
    grid-template-columns: auto 1fr auto;
    gap: 0.5rem;
  }
`

const memberIndex = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.15vw, 0.75rem);
  color: ${color.textSageSoft};
  font-variant-numeric: tabular-nums;
  min-width: 20px;
`

const memberNameStyle = css`
  font-family: ${font.erode};
  font-size: clamp(0.875rem, 0.8rem + 0.35vw, 1rem);
  font-weight: ${weight.semibold};
  color: ${color.textSagePrimary};
`

const memberMetaStyle = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  color: ${color.textSageMuted};

  @media (max-width: 600px) {
    grid-column: 2;
    font-size: clamp(0.6875rem, 0.65rem + 0.15vw, 0.75rem);
  }
`

const removeBtnStyle = css`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid ${alpha(color.primary, 0.15)};
  background: transparent;
  color: ${color.textSageMuted};
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease;

  &:hover {
    border-color: ${color.dangerAlt};
    color: ${color.dangerAlt};
  }
`

const emptyStyle = css`
  text-align: center;
  padding: clamp(1.5rem, 1.25rem + 1vw, 2.5rem) 0;
  color: ${color.textSageSoft};
  font-family: ${font.satoshi};
  font-size: clamp(0.875rem, 0.8rem + 0.35vw, 0.9375rem);
`

const formCardStyle = css`
  border: 1.5px solid ${color.primary};
  border-radius: 16px;
  padding: clamp(1rem, 0.75rem + 1vw, 1.5rem);
  margin-top: 0.75rem;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  animation: ${fadeInUp} 500ms cubic-bezier(0.16, 1, 0.3, 1) both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const formGridStyle = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(0.75rem, 0.625rem + 0.5vw, 1rem) clamp(1rem, 0.875rem + 0.5vw, 1.5rem);

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`

const selectStyle = css`
  background: transparent;
  border: none;
  border-bottom: 1.5px solid ${alpha(color.primary, 0.15)};
  padding: clamp(0.5rem, 0.4rem + 0.4vw, 0.625rem) 0;
  font-family: ${font.satoshi};
  font-size: clamp(0.875rem, 0.8rem + 0.35vw, 0.9375rem);
  color: ${color.textSagePrimary};
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  width: 100%;
  transition: border-color 300ms cubic-bezier(0.16, 1, 0.3, 1);

  &:focus {
    border-color: ${color.primary};
  }
`

const fieldLabelSmall = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem);
  font-weight: ${weight.semibold};
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${color.textSageSoft};
`

const checkboxLabelStyle = css`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.75rem 0;
  font-family: ${font.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  color: ${color.textSageMuted};
`

const formActionsStyle = css`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1rem;
`

const btnSecondary = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  font-weight: ${weight.semibold};
  border-radius: 100px;
  background: transparent;
  border: 1.5px solid ${alpha(color.primary, 0.2)};
  color: ${color.textSageMuted};
  padding: 0.5rem 1.25rem;
  cursor: pointer;
  transition: all 150ms ease;

  &:hover {
    border-color: ${alpha(color.primary, 0.4)};
    color: ${color.textSageSecondary};
  }
`

const btnPrimary = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  font-weight: ${weight.semibold};
  border-radius: 100px;
  background: linear-gradient(135deg, ${color.primary}, ${color.primaryDark});
  color: #fff;
  border: none;
  padding: 0.5rem 1.25rem;
  cursor: pointer;
  transition: all 150ms ease;
  box-shadow: 0 2px 12px ${alpha(color.primary, 0.2)};

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 20px ${alpha(color.primary, 0.3)};
  }

  @media (prefers-reduced-motion: reduce) {
    &:hover { transform: none; }
  }
`

const addBtnStyle = css`
  background: rgba(255, 255, 255, 0.25);
  border: 1.5px dashed ${alpha(color.primary, 0.2)};
  color: ${color.textSageMuted};
  width: 100%;
  padding: clamp(0.75rem, 0.625rem + 0.5vw, 1rem);
  border-radius: 12px;
  font-family: ${font.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  cursor: pointer;
  transition: all 150ms ease;
  margin-top: 0.75rem;

  &:hover {
    border-color: ${color.primary};
    color: ${color.primary};
    background: ${alpha(color.primary, 0.08)};
  }
`

const RELATIONSHIP_OPTIONS = [
  { value: "CONJUGE", label: "Conjuge / Companheiro(a)" },
  { value: "FILHO", label: "Filho(a)" },
  { value: "ENTEADO", label: "Enteado(a)" },
  { value: "PAI", label: "Pai" },
  { value: "MAE", label: "Mae" },
  { value: "AVO", label: "Avo / Avo" },
  { value: "NETO", label: "Neto(a)" },
  { value: "IRMAO", label: "Irmao / Irma" },
  { value: "TIO", label: "Tio(a)" },
  { value: "SOBRINHO", label: "Sobrinho(a)" },
  { value: "PRIMO", label: "Primo(a)" },
  { value: "OUTRO_PARENTE", label: "Outro Parente" },
  { value: "NAO_PARENTE", label: "Nao Parente" },
] as const

const GENDER_OPTIONS = ["Masculino", "Feminino", "Outro"] as const

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

  const handleConfirm = (): void => {
    if (draft.name.trim() && draft.relationship.trim()) {
      onAddMember(draft)
      setDraft(EMPTY_MEMBER)
      setShowForm(false)
    }
  }

  const handleCancel = (): void => {
    setDraft(EMPTY_MEMBER)
    setShowForm(false)
  }

  return (
    <div class={containerStyle}>
      {familyMembers.length === 0 && !showForm && (
        <p class={emptyStyle}>Nenhum membro familiar adicionado. Este passo e opcional.</p>
      )}

      {familyMembers.map((member, i) => (
        <div class={memberRowStyle} style={`animation-delay: ${i * 60}ms`}>
          <span class={memberIndex}>{String(i + 1).padStart(2, "0")}</span>
          <span class={memberNameStyle}>{member.name}</span>
          <span class={memberMetaStyle}>
            {member.relationship} | {member.gender} | {member.livesWithPatient ? "Reside" : "Nao reside"}
          </span>
          <button
            class={removeBtnStyle}
            type="button"
            onClick={() => onRemoveMember(i)}
            aria-label={`Remover ${member.name}`}
          >
            &times;
          </button>
        </div>
      ))}

      {showForm && (
        <div class={formCardStyle}>
          <div class={formGridStyle}>
            <div>
              <UnderlineInput
                label="Nome"
                value={draft.name}
                onChange={(v) => setDraft({ ...draft, name: v })}
              />
            </div>
            <div>
              <UnderlineInput
                label="Data de Nascimento"
                value={draft.birthDate}
                onChange={(v) => setDraft({ ...draft, birthDate: v })}
              />
            </div>
            <div>
              <label class={fieldLabelSmall}>Sexo</label>
              <select
                class={selectStyle}
                value={draft.gender}
                onChange={(e) => setDraft({ ...draft, gender: (e.target as HTMLSelectElement).value })}
                aria-label="Sexo"
              >
                <option value="">Selecione...</option>
                {GENDER_OPTIONS.map((g) => (
                  <option value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label class={fieldLabelSmall}>Parentesco</label>
              <select
                class={selectStyle}
                value={draft.relationship}
                onChange={(e) => setDraft({ ...draft, relationship: (e.target as HTMLSelectElement).value })}
                aria-label="Parentesco"
              >
                <option value="">Selecione...</option>
                {RELATIONSHIP_OPTIONS.map((r) => (
                  <option value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label class={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={draft.livesWithPatient}
                  onChange={() => setDraft({ ...draft, livesWithPatient: !draft.livesWithPatient })}
                />
                Reside com o paciente
              </label>
            </div>
            <div>
              <label class={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={draft.isDisabled}
                  onChange={() => setDraft({ ...draft, isDisabled: !draft.isDisabled })}
                />
                Pessoa com deficiencia
              </label>
            </div>
          </div>
          <div class={formActionsStyle}>
            <button class={btnSecondary} type="button" onClick={handleCancel}>
              Cancelar
            </button>
            <button class={btnPrimary} type="button" onClick={handleConfirm} aria-label="Confirmar membro">
              Confirmar
            </button>
          </div>
        </div>
      )}

      {!showForm && (
        <button class={addBtnStyle} type="button" onClick={() => setShowForm(true)} aria-label="Adicionar membro">
          + Adicionar membro
        </button>
      )}
    </div>
  )
}
