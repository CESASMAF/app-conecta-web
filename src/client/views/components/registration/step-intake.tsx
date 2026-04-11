import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight, space, radius } from "../../../styles/tokens.ts"
import { UnderlineInput } from "../ui/underline-input.tsx"
import { UnderlineSelect } from "../ui/underline-select.tsx"
import { CheckboxField } from "../ui/checkbox-field.tsx"
import type { WizardState } from "../../../viewmodels/registration/types.ts"

interface StepIntakeProps {
  readonly intake: WizardState["intake"]
  readonly errors: ReadonlyMap<string, string>
  readonly onUpdate: (field: string, value: string) => void
  readonly onToggleProgram: (programId: string) => void
}

const gridStyle = css`
  display: flex;
  flex-wrap: wrap;
  gap: ${space[6]};
`

const fieldItem = css`
  min-width: 280px;
  flex: 1;
`

const fullWidth = css`
  width: 100%;
`

const sectionLabelStyle = css`
  font-family: ${font.satoshi};
  font-size: 13px;
  font-weight: ${weight.bold};
  letter-spacing: 0.65px;
  text-transform: uppercase;
  color: ${color.textMuted};
`

const textareaErrorTextStyle = css`
  font-family: ${font.satoshi};
  font-size: 12px;
  color: ${color.danger};
  margin-top: 4px;
`

const textareaStyle = css`
  border: 1px solid ${color.inputLine};
  border-radius: ${radius.dropdown};
  padding: ${space[3]};
  font-family: ${font.satoshi};
  font-size: 16px;
  color: ${color.textPrimary};
  background: transparent;
  outline: none;
  width: 100%;
  min-height: 100px;
  resize: vertical;
  &:focus { border-color: ${color.textPrimary}; }
`

const textareaErrorStyle = css`
  ${textareaStyle}
  border-color: ${color.danger};
  &:focus { border-color: ${color.danger}; }
`

const programsSection = css`
  display: flex;
  flex-direction: column;
  gap: ${space[2]};
  width: 100%;
`

const INGRESS_OPTIONS = [
  { value: "", label: "Selecione..." },
  { value: "DEMANDA_ESPONTANEA", label: "Demanda espontanea" },
  { value: "BUSCA_ATIVA", label: "Busca ativa" },
  { value: "ENCAMINHAMENTO", label: "Encaminhamento" },
  { value: "REINCIDENCIA", label: "Reincidencia" },
] as const

const SOCIAL_PROGRAMS = [
  { id: "BPC", label: "BPC (Beneficio de Prestacao Continuada)" },
  { id: "BOLSA_FAMILIA", label: "Bolsa Familia" },
  { id: "AUXILIO_BRASIL", label: "Auxilio Brasil" },
  { id: "PETI", label: "PETI" },
  { id: "OUTROS", label: "Outros programas" },
] as const

export const StepIntake: FC<StepIntakeProps> = ({ intake, errors, onUpdate, onToggleProgram }) => (
  <div class={gridStyle}>
    <div class={fieldItem}>
      <UnderlineSelect
        label="Tipo de ingresso"
        value={intake.ingressType}
        options={INGRESS_OPTIONS}
        onChange={(v) => onUpdate("ingressType", v)}
        error={errors.get("ingressType")}
        required
      />
    </div>
    <div class={fieldItem}>
      <UnderlineInput
        label="Nome da origem"
        value={intake.originName}
        onChange={(v) => onUpdate("originName", v)}
      />
    </div>
    <div class={fieldItem}>
      <UnderlineInput
        label="Contato da origem"
        value={intake.originContact}
        onChange={(v) => onUpdate("originContact", v)}
      />
    </div>
    <div class={fullWidth}>
      <label class={sectionLabelStyle}>Motivo do atendimento *</label>
      <textarea
        class={errors.get("serviceReason") ? textareaErrorStyle : textareaStyle}
        value={intake.serviceReason}
        onInput={(e) => onUpdate("serviceReason", (e.target as HTMLTextAreaElement).value)}
      />
      {errors.get("serviceReason") && (
        <span class={textareaErrorTextStyle}>{errors.get("serviceReason")}</span>
      )}
    </div>
    <div class={programsSection}>
      <label class={sectionLabelStyle}>Programas sociais vinculados</label>
      {SOCIAL_PROGRAMS.map((prog) => (
        <CheckboxField
          label={prog.label}
          checked={intake.selectedPrograms.includes(prog.id)}
          onChange={() => onToggleProgram(prog.id)}
        />
      ))}
    </div>
  </div>
)
