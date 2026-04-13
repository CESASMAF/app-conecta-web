import type { FC } from "hono/jsx/dom"
import { useState } from "hono/jsx/dom"
import { css, keyframes } from "hono/css"
import { color, font, weight, radius, alpha } from "../../../styles/tokens.ts"
import type { FamilyMemberModel, LookupItem } from "../../../viewmodels/family-composition/types.ts"

interface AddMemberModalProps {
  readonly lookups: readonly LookupItem[]
  readonly onSave: (member: FamilyMemberModel) => void
  readonly onClose: () => void
  readonly editMember?: FamilyMemberModel
}

const overlayStyle = css`
  position: fixed;
  inset: 0;
  background: rgba(248,243,236,0.7);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`

const scaleIn = keyframes`
  from { transform: scale(0.96); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`

const modalStyle = css`
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid ${color.bgCardBorder};
  border-radius: 20px;
  padding: clamp(1.5rem, 1rem + 1vw, 2rem);
  width: 90%;
  max-width: 620px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 16px 64px rgba(0,0,0,0.08);
  animation: ${scaleIn} 300ms cubic-bezier(0.34, 1.56, 0.64, 1);

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const modalHeader = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`

const modalTitle = css`
  font-family: ${font.erode};
  font-size: clamp(1.125rem, 1rem + 0.5vw, 1.375rem);
  font-weight: ${weight.bold};
  color: ${color.textSagePrimary};
`

const closeBtn = css`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid ${color.bgCardBorder};
  background: rgba(255,255,255,0.4);
  color: ${color.textSageSecondary};
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease;

  &:hover {
    background: rgba(255,255,255,0.7);
    color: ${color.textSagePrimary};
  }
`

const formGrid = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const fullField = css`
  grid-column: 1 / -1;
`

const fieldLabel = css`
  font-family: ${font.satoshi};
  font-size: 11px;
  font-weight: ${weight.semibold};
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${color.textSageSoft};
  margin-bottom: 0.375rem;
  display: block;
`

const fieldRequired = css`
  &::after {
    content: ' *';
    color: ${color.dangerAlt};
  }
`

const fieldInput = css`
  background: transparent;
  border: none;
  border-bottom: 1.5px solid ${alpha(color.primary, 0.15)};
  padding: 0.625rem 0;
  font-family: ${font.satoshi};
  font-size: 0.9375rem;
  color: ${color.textSagePrimary};
  outline: none;
  width: 100%;
  transition: border-color 300ms cubic-bezier(0.16, 1, 0.3, 1);

  &::placeholder {
    color: ${color.textSageSoft};
    font-style: italic;
  }
  &:focus { border-color: ${color.primary}; }
`

const fieldInputError = css`
  border-color: ${color.dangerAlt};
`

const fieldSelect = css`
  ${fieldInput}
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
`

const fieldError = css`
  font-family: ${font.satoshi};
  font-size: 0.75rem;
  color: ${color.dangerAlt};
  min-height: 0;
  margin-top: 2px;
`

const cardSelectorGroup = css`
  display: flex;
  gap: 0.625rem;
  margin-top: 4px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`

const cardSelector = (selected: boolean): string => css`
  flex: 1;
  padding: 0.75rem 0.875rem;
  background: ${selected ? alpha(color.primary, 0.08) : "rgba(255,255,255,0.4)"};
  border: 1.5px solid ${selected ? color.primary : alpha(color.primary, 0.1)};
  border-radius: 12px;
  cursor: pointer;
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
  text-align: center;
  font-family: ${font.satoshi};
  font-size: 0.875rem;
  font-weight: ${selected ? weight.semibold : weight.medium};
  color: ${selected ? color.primary : color.textSageMuted};
  ${selected ? `box-shadow: 0 0 0 3px ${alpha(color.primary, 0.08)};` : ""}

  &:hover {
    background: ${selected ? alpha(color.primary, 0.08) : "rgba(255,255,255,0.6)"};
    border-color: ${selected ? color.primary : alpha(color.primary, 0.2)};
  }
  &:focus-visible {
    outline: 2px solid ${color.primary};
    outline-offset: 2px;
  }
`

const checkboxField = css`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem 0;
  font-family: ${font.satoshi};
  font-size: 0.875rem;
  color: ${color.textSageSecondary};
`

const checkboxBox = css`
  width: 18px;
  height: 18px;
  border-radius: 8px;
  border: 1.5px solid ${alpha(color.primary, 0.2)};
  background: rgba(255,255,255,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
`

const checkboxChecked = css`
  background: ${color.primary};
  border-color: ${color.primary};
  color: white;
  font-size: 12px;
  font-weight: ${weight.bold};
`

const modalFooter = css`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid ${alpha(color.primary, 0.08)};
`

const btnSecondary = css`
  font-family: ${font.satoshi};
  font-size: 0.875rem;
  font-weight: ${weight.semibold};
  padding: 0.625rem 1.25rem;
  border-radius: ${radius.pill};
  background: transparent;
  border: 1.5px solid ${alpha(color.primary, 0.2)};
  color: ${color.textSageMuted};
  cursor: pointer;
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    border-color: ${alpha(color.primary, 0.4)};
    color: ${color.textSageSecondary};
  }
`

const btnPrimary = css`
  font-family: ${font.satoshi};
  font-size: 0.875rem;
  font-weight: ${weight.semibold};
  padding: 0.75rem 1.75rem;
  border-radius: ${radius.pill};
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg, ${color.primary}, ${color.primaryDark});
  color: #fff;
  box-shadow: 0 2px 12px ${alpha(color.primary, 0.2)};
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 20px ${alpha(color.primary, 0.3)};
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    &:hover { transform: none; }
  }
`

const SEX_OPTIONS = ["M", "F", "Outro"] as const

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
  const [relationshipId, setRelationshipId] = useState(editMember?.relationshipId ?? "")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = "Nome e obrigatorio"
    if (!birthDate.trim()) e.birthDate = "Data de nascimento e obrigatoria"
    if (!relationshipId) e.relationshipId = "Parentesco e obrigatorio"
    if (!sex) e.sex = "Sexo e obrigatorio"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = (): void => {
    if (!validate()) return
    const selectedLookup = lookups.find((l) => l.id === relationshipId)
    onSave({
      personId: editMember?.personId ?? crypto.randomUUID(),
      name,
      birthDate,
      sex: sex === "M" ? "Masculino" : sex === "F" ? "Feminino" : "Outro",
      relationshipId,
      relationshipLabel: selectedLookup?.descricao ?? "",
      residesWithPatient: resides,
      hasDisability: disability,
      isPrimaryCaregiver: editMember?.isPrimaryCaregiver ?? false,
      isPR: editMember?.isPR ?? false,
      requiredDocuments: editMember?.requiredDocuments ?? [],
    })
  }

  return (
    <div class={overlayStyle} onClick={onClose} role="dialog" aria-modal="true" aria-label={isEdit ? "Editar Membro" : "Adicionar Membro"}>
      <div class={modalStyle} onClick={(e: Event) => e.stopPropagation()}>
        <div class={modalHeader}>
          <h2 class={modalTitle}>{isEdit ? "Editar Membro" : "Adicionar Membro"}</h2>
          <button class={closeBtn} onClick={onClose} aria-label="Fechar">&times;</button>
        </div>

        <div class={formGrid}>
          <div class={fullField}>
            <label class={`${fieldLabel} ${fieldRequired}`}>Nome Completo</label>
            <input
              class={`${fieldInput} ${errors.name ? fieldInputError : ""}`}
              value={name}
              onInput={(e) => setName((e.target as HTMLInputElement).value)}
              placeholder="Nome do membro"
              aria-required="true"
            />
            {errors.name && <div class={fieldError} role="alert">{errors.name}</div>}
          </div>

          <div>
            <label class={`${fieldLabel} ${fieldRequired}`}>Data de Nascimento</label>
            <input
              class={`${fieldInput} ${errors.birthDate ? fieldInputError : ""}`}
              value={birthDate}
              onInput={(e) => setBirthDate((e.target as HTMLInputElement).value)}
              placeholder="DD/MM/AAAA"
              maxLength={10}
              aria-required="true"
            />
            {errors.birthDate && <div class={fieldError} role="alert">{errors.birthDate}</div>}
          </div>

          <div>
            <label class={`${fieldLabel} ${fieldRequired}`}>Parentesco</label>
            <select
              class={`${fieldSelect} ${errors.relationshipId ? fieldInputError : ""}`}
              value={relationshipId}
              onChange={(e) => setRelationshipId((e.target as HTMLSelectElement).value)}
              aria-required="true"
            >
              <option value="">Selecione...</option>
              {lookups.map((l) => (
                <option key={l.id} value={l.id}>{l.descricao}</option>
              ))}
            </select>
            {errors.relationshipId && <div class={fieldError} role="alert">{errors.relationshipId}</div>}
          </div>

          <div>
            <label class={`${fieldLabel} ${fieldRequired}`}>Sexo</label>
            <div class={cardSelectorGroup} role="radiogroup" aria-label="Sexo do membro">
              {SEX_OPTIONS.map((opt) => (
                <div
                  key={opt}
                  class={cardSelector(sex === opt)}
                  role="radio"
                  aria-checked={sex === opt}
                  tabIndex={0}
                  onClick={() => setSex(opt)}
                  onKeyDown={(e: KeyboardEvent) => {
                    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSex(opt) }
                  }}
                >{opt}</div>
              ))}
            </div>
            {errors.sex && <div class={fieldError} role="alert">{errors.sex}</div>}
          </div>

          <div>
            <label class={checkboxField} onClick={() => setResides(!resides)}>
              <span class={`${checkboxBox} ${resides ? checkboxChecked : ""}`}>
                {resides ? "\u2713" : ""}
              </span>
              Reside com o paciente
            </label>
          </div>

          <div>
            <label class={checkboxField} onClick={() => setDisability(!disability)}>
              <span class={`${checkboxBox} ${disability ? checkboxChecked : ""}`}>
                {disability ? "\u2713" : ""}
              </span>
              Possui deficiencia
            </label>
          </div>
        </div>

        <div class={modalFooter}>
          <button class={btnSecondary} onClick={onClose} aria-label="Cancelar">Cancelar</button>
          <button class={btnPrimary} onClick={handleSave} aria-label="Salvar membro">Salvar membro</button>
        </div>
      </div>
    </div>
  )
}
