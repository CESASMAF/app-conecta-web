import type { FC } from "hono/jsx/dom";
import { useState } from "hono/jsx/dom";
import { css } from "hono/css";
import {
  easing,
  font,
  sage,
  sageRadius,
  weight,
} from "../../../styles/tokens.ts";
import {
  fadeInUp,
  sageButtonPrimary,
  sageButtonSecondary,
  sageFormGrid,
  sageFullWidth,
  sageInputBase,
  sageInputLabel,
} from "../../../styles/base.ts";
import type {
  FamilyMemberDocument,
  FamilyMemberSnapshot,
} from "../../../viewmodels/registration/types.ts";

interface StepFamilyProps {
  readonly familyMembers: readonly FamilyMemberSnapshot[];
  readonly onAddMember: (member: FamilyMemberSnapshot) => void;
  readonly onRemoveMember: (index: number) => void;
}

// --- MemberRow ---

interface MemberRowProps {
  readonly index: number;
  readonly name: string;
  readonly meta: string;
  readonly isReference: boolean;
  readonly onRemove?: () => void;
}

const memberRowStyle = css`
  display: grid;
  grid-template-columns: auto 1fr 1fr auto;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(79, 132, 72, 0.08);
  align-items: center;
  animation: ${fadeInUp} 500ms ${easing.out};
  @media (max-width: 600px) {
    grid-template-columns: auto 1fr auto;
    gap: 8px;
  }
`;

const memberIndexStyle = css`
  font-family: ${font.satoshi};
  font-size: 12px;
  color: ${sage.textSoft};
  font-variant-numeric: tabular-nums;
  min-width: 20px;
`;

const memberNameStyle = css`
  font-family: ${font.erode};
  font-size: 16px;
  font-weight: ${weight.semibold};
  color: ${sage.textPrimary};
`;

const memberMetaStyle = css`
  font-family: ${font.satoshi};
  font-size: 14px;
  color: ${sage.textMuted};
  @media (max-width: 600px) {
    grid-column: 2 / -1;
    grid-row: 2;
  }
`;

const removeBtnStyle = css`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid rgba(79, 132, 72, 0.15);
  background: transparent;
  color: ${sage.textMuted};
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease;
  &:hover {
    border-color: ${sage.danger};
    color: ${sage.danger};
  }
  &:focus-visible {
    outline: 2px solid ${sage.greenPrimary};
    outline-offset: 2px;
  }
`;

const buildMeta = (m: FamilyMemberSnapshot): string => {
  const parts: string[] = [];
  if (m.relationshipLabel || m.relationship) {
    parts.push(m.relationshipLabel || m.relationship);
  }
  if (m.sex || m.gender) parts.push(m.sex || m.gender);
  parts.push(m.livesWithPatient ? "Reside" : "Nao reside");
  if (m.documents && m.documents.length > 0) {
    parts.push(m.documents.map((d) => d.type.toUpperCase()).join(", "));
  }
  return parts.join(" | ");
};

const MemberRow: FC<MemberRowProps> = (
  { index, name, meta, isReference, onRemove },
) => (
  <div class={memberRowStyle}>
    <span class={memberIndexStyle}>{String(index + 1).padStart(2, "0")}</span>
    <span class={memberNameStyle}>{name || "Sem nome"}</span>
    <span class={memberMetaStyle}>{meta}</span>
    {!isReference && onRemove
      ? (
        <button
          type="button"
          class={removeBtnStyle}
          onClick={onRemove}
          aria-label={`Remover membro ${name}`}
        >
          &times;
        </button>
      )
      : <span />}
  </div>
);

// --- DocumentChip ---

interface DocumentChipProps {
  readonly label: string;
  readonly docType: string;
  readonly isActive: boolean;
  readonly onToggle: () => void;
}

const chipStyle = css`
  font-family: ${font.satoshi};
  font-size: 12px;
  font-weight: ${weight.medium};
  padding: 4px 12px;
  border-radius: 100px;
  border: 1px solid rgba(79, 132, 72, 0.15);
  background: rgba(255, 255, 255, 0.3);
  color: ${sage.textMuted};
  cursor: pointer;
  transition: all 150ms ${easing.out};
  &:hover {
    border-color: ${sage.greenPrimary};
    color: ${sage.greenPrimary};
    background: ${sage.greenLight};
  }
  &:focus-visible {
    outline: 2px solid ${sage.greenPrimary};
    outline-offset: 2px;
  }
`;

const chipActiveStyle = css`
  ${chipStyle} border-color: ${sage.greenPrimary};
  background: ${sage.greenPrimary};
  color: white;
  font-weight: ${weight.semibold};
  &:hover {
    background: ${sage.greenDark};
    border-color: ${sage.greenDark};
    color: white;
  }
`;

const DocumentChip: FC<DocumentChipProps> = ({ label, isActive, onToggle }) => (
  <button
    type="button"
    class={isActive ? chipActiveStyle : chipStyle}
    aria-pressed={isActive ? "true" : "false"}
    onClick={onToggle}
  >
    {label}
  </button>
);

// --- DocumentSection ---

const docSectionStyle = css`
  background: rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(79, 132, 72, 0.1);
  border-radius: ${sageRadius.md};
  padding: 16px;
  margin-top: 12px;
  animation: ${fadeInUp} 400ms ${easing.out};
`;

const docSectionTitleStyle = css`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
`;

const docBadgeStyle = css`
  font-family: ${font.satoshi};
  font-size: 10px;
  font-weight: ${weight.semibold};
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 100px;
  background: ${sage.greenLight};
  color: ${sage.greenPrimary};
`;

const docSectionLabelStyle = css`
  font-family: ${font.erode};
  font-size: 13px;
  font-weight: ${weight.semibold};
  color: ${sage.textSecondary};
`;

const docGridStyle = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

// Document type configurations
type DocType = "cpf" | "rg" | "cn" | "cns" | "te" | "ctps";

const DOC_LABELS: Record<DocType, string> = {
  cpf: "CPF",
  rg: "RG",
  cn: "Certidao de Nascimento",
  cns: "CNS",
  te: "Titulo de Eleitor",
  ctps: "CTPS",
};

const DOC_FIELDS: Record<
  DocType,
  readonly {
    readonly key: string;
    readonly label: string;
    readonly placeholder: string;
    readonly full?: boolean;
  }[]
> = {
  cpf: [{
    key: "number",
    label: "Numero do CPF",
    placeholder: "000.000.000-00",
  }],
  rg: [
    { key: "number", label: "Numero do RG", placeholder: "Numero" },
    { key: "uf", label: "UF", placeholder: "Estado" },
    { key: "agency", label: "Orgao emissor", placeholder: "Ex: SSP" },
    { key: "date", label: "Data de emissao", placeholder: "DD/MM/AAAA" },
  ],
  cn: [{
    key: "matricula",
    label: "Matricula",
    placeholder: "32 digitos",
    full: true,
  }],
  cns: [{
    key: "number",
    label: "Numero do CNS",
    placeholder: "15 digitos",
    full: true,
  }],
  te: [
    { key: "number", label: "Numero", placeholder: "Numero do titulo" },
    { key: "zona", label: "Zona", placeholder: "Zona" },
    { key: "secao", label: "Secao", placeholder: "Secao" },
    { key: "uf", label: "UF", placeholder: "Estado" },
  ],
  ctps: [
    { key: "number", label: "Numero", placeholder: "Numero da CTPS" },
    { key: "serie", label: "Serie", placeholder: "Serie" },
    { key: "uf", label: "UF", placeholder: "Estado" },
  ],
};

// --- FormField (inline) ---

const fieldWrapperStyle = css`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

// --- Chip Container ---

const chipContainerStyle = css`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

// --- Form area ---

const formContainerStyle = css`
  border: 1.5px solid rgba(79, 132, 72, 0.15);
  border-radius: ${sageRadius.lg};
  padding: 24px;
  background: rgba(255, 255, 255, 0.2);
  animation: ${fadeInUp} 400ms ${easing.out};
`;

const formActionsStyle = css`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
`;

const cancelBtnStyle = css`
  ${sageButtonSecondary} font-size: 13px;
  padding: 8px 16px;
`;

const confirmBtnStyle = css`
  ${sageButtonPrimary} font-size: 13px;
  padding: 8px 16px;
`;

// --- Checkbox (inline, Sage-styled) ---

const checkWrapperStyle = css`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 4px 0;
`;

const checkBoxStyle = css`
  width: 18px;
  height: 18px;
  border-radius: 8px;
  border: 1.5px solid rgba(79, 132, 72, 0.2);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 150ms ease;
`;

const checkBoxCheckedStyle = css`
  ${checkBoxStyle} background: ${sage.greenPrimary};
  border-color: ${sage.greenPrimary};
`;

const checkLabelStyle = css`
  font-family: ${font.satoshi};
  font-size: 14px;
  color: ${sage.textMuted};
`;

const CheckIcon: FC = () => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 10 10"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M2 5.5L4 7.5L8 3"
      stroke="white"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

// --- Empty / Add ---

const emptyStyle = css`
  font-family: ${font.satoshi};
  font-size: 14px;
  color: ${sage.textMuted};
  text-align: center;
  padding: 24px 0;
`;

const addBtnStyle = css`
  ${sageButtonSecondary} align-self: flex-start;
`;

// --- Container ---

const containerStyle = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: ${fadeInUp} 500ms ${easing.out};
`;

// --- Section title ---

const sectionLabelStyle = css`
  font-family: ${font.satoshi};
  font-size: 12px;
  font-weight: ${weight.semibold};
  color: ${sage.textLabel};
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
`;

// --- Draft type for form state ---

type DraftState = {
  name: string;
  birthDate: string;
  sex: string;
  relationship: string;
  livesWithPatient: boolean;
  isDisabled: boolean;
  selectedDocTypes: DocType[];
  docFields: Record<string, Record<string, string>>;
};

const EMPTY_DRAFT: DraftState = {
  name: "",
  birthDate: "",
  sex: "",
  relationship: "",
  livesWithPatient: true,
  isDisabled: false,
  selectedDocTypes: [],
  docFields: {},
};

// --- Main Component ---

export const StepFamily: FC<StepFamilyProps> = (
  { familyMembers, onAddMember, onRemoveMember },
) => {
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<DraftState>(EMPTY_DRAFT);

  const toggleDocType = (dt: DocType): void => {
    const exists = draft.selectedDocTypes.includes(dt);
    const updated = exists
      ? draft.selectedDocTypes.filter((t) => t !== dt)
      : [...draft.selectedDocTypes, dt];
    setDraft({ ...draft, selectedDocTypes: updated });
  };

  const updateDocField = (dt: DocType, field: string, value: string): void => {
    const current = draft.docFields[dt] || {};
    setDraft({
      ...draft,
      docFields: { ...draft.docFields, [dt]: { ...current, [field]: value } },
    });
  };

  const handleAdd = (): void => {
    if (!draft.name.trim() || !draft.relationship.trim()) return;
    const documents: FamilyMemberDocument[] = draft.selectedDocTypes.map((
      dt,
    ) => ({
      type: dt,
      fields: draft.docFields[dt] || {},
    }));
    const member: FamilyMemberSnapshot = {
      name: draft.name,
      birthDate: draft.birthDate,
      sex: draft.sex,
      gender: draft.sex,
      relationship: draft.relationship,
      relationshipLabel: draft.relationship,
      livesWithPatient: draft.livesWithPatient,
      isDisabled: draft.isDisabled,
      hasDisability: draft.isDisabled,
      documents: documents.length > 0 ? documents : undefined,
    };
    onAddMember(member);
    setDraft(EMPTY_DRAFT);
    setShowForm(false);
  };

  return (
    <div class={containerStyle}>
      {familyMembers.length === 0 && !showForm && (
        <p class={emptyStyle}>
          Nenhum membro familiar adicionado. Este passo e opcional.
        </p>
      )}

      {familyMembers.map((member, index) => (
        <MemberRow
          index={index}
          name={member.name}
          meta={buildMeta(member)}
          isReference={index === 0}
          onRemove={() => onRemoveMember(index)}
        />
      ))}

      {showForm && (
        <div class={formContainerStyle}>
          <div class={sageFormGrid}>
            <div class={fieldWrapperStyle}>
              <label class={sageInputLabel} for="fm-name">Nome *</label>
              <input
                id="fm-name"
                type="text"
                class={sageInputBase}
                value={draft.name}
                placeholder="Nome completo"
                onInput={(e) =>
                  setDraft({
                    ...draft,
                    name: (e.target as HTMLInputElement).value,
                  })}
              />
            </div>
            <div class={fieldWrapperStyle}>
              <label class={sageInputLabel} for="fm-birth">
                Data de nascimento
              </label>
              <input
                id="fm-birth"
                type="text"
                class={sageInputBase}
                value={draft.birthDate}
                placeholder="DD/MM/AAAA"
                onInput={(e) =>
                  setDraft({
                    ...draft,
                    birthDate: (e.target as HTMLInputElement).value,
                  })}
              />
            </div>
            <div class={fieldWrapperStyle}>
              <label class={sageInputLabel} for="fm-sex">Sexo</label>
              <input
                id="fm-sex"
                type="text"
                class={sageInputBase}
                value={draft.sex}
                placeholder="Masculino, Feminino, Outro"
                onInput={(e) =>
                  setDraft({
                    ...draft,
                    sex: (e.target as HTMLInputElement).value,
                  })}
              />
            </div>
            <div class={fieldWrapperStyle}>
              <label class={sageInputLabel} for="fm-rel">Parentesco *</label>
              <input
                id="fm-rel"
                type="text"
                class={sageInputBase}
                value={draft.relationship}
                placeholder="Conjuge, Filho(a), etc."
                onInput={(e) =>
                  setDraft({
                    ...draft,
                    relationship: (e.target as HTMLInputElement).value,
                  })}
              />
            </div>

            {/* Checkboxes */}
            <div
              class={checkWrapperStyle}
              role="checkbox"
              aria-checked={draft.livesWithPatient ? "true" : "false"}
              tabIndex={0}
              onClick={() =>
                setDraft({
                  ...draft,
                  livesWithPatient: !draft.livesWithPatient,
                })}
              onKeyDown={(e: KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setDraft({
                    ...draft,
                    livesWithPatient: !draft.livesWithPatient,
                  });
                }
              }}
            >
              <div
                class={draft.livesWithPatient
                  ? checkBoxCheckedStyle
                  : checkBoxStyle}
              >
                {draft.livesWithPatient && <CheckIcon />}
              </div>
              <span class={checkLabelStyle}>Reside com o paciente</span>
            </div>
            <div
              class={checkWrapperStyle}
              role="checkbox"
              aria-checked={draft.isDisabled ? "true" : "false"}
              tabIndex={0}
              onClick={() =>
                setDraft({ ...draft, isDisabled: !draft.isDisabled })}
              onKeyDown={(e: KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setDraft({ ...draft, isDisabled: !draft.isDisabled });
                }
              }}
            >
              <div
                class={draft.isDisabled ? checkBoxCheckedStyle : checkBoxStyle}
              >
                {draft.isDisabled && <CheckIcon />}
              </div>
              <span class={checkLabelStyle}>Pessoa com deficiencia</span>
            </div>

            {/* Document Chips */}
            <div class={sageFullWidth}>
              <span class={sectionLabelStyle}>Documentos</span>
              <div class={chipContainerStyle}>
                {(Object.keys(DOC_LABELS) as DocType[]).map((dt) => (
                  <DocumentChip
                    label={DOC_LABELS[dt]}
                    docType={dt}
                    isActive={draft.selectedDocTypes.includes(dt)}
                    onToggle={() => toggleDocType(dt)}
                  />
                ))}
              </div>
            </div>

            {/* Document Sections */}
            {draft.selectedDocTypes.map((dt) => (
              <div class={`${sageFullWidth}`}>
                <div class={docSectionStyle}>
                  <div class={docSectionTitleStyle}>
                    <span class={docBadgeStyle}>{dt.toUpperCase()}</span>
                    <span class={docSectionLabelStyle}>{DOC_LABELS[dt]}</span>
                  </div>
                  <div class={docGridStyle}>
                    {DOC_FIELDS[dt].map((f) => (
                      <div
                        class={`${fieldWrapperStyle} ${
                          f.full ? sageFullWidth : ""
                        }`}
                      >
                        <label class={sageInputLabel}>{f.label}</label>
                        <input
                          type="text"
                          class={sageInputBase}
                          value={(draft.docFields[dt] || {})[f.key] || ""}
                          placeholder={f.placeholder}
                          onInput={(e) =>
                            updateDocField(
                              dt,
                              f.key,
                              (e.target as HTMLInputElement).value,
                            )}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div class={formActionsStyle}>
            <button
              type="button"
              class={cancelBtnStyle}
              onClick={() => {
                setDraft(EMPTY_DRAFT);
                setShowForm(false);
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              class={confirmBtnStyle}
              onClick={handleAdd}
            >
              Confirmar
            </button>
          </div>
        </div>
      )}

      {!showForm && (
        <button
          type="button"
          class={addBtnStyle}
          onClick={() => setShowForm(true)}
        >
          + Adicionar membro
        </button>
      )}
    </div>
  );
};
