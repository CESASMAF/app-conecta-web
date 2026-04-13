import type { FC } from "hono/jsx/dom"
import { css, cx } from "hono/css"
import { color, font, weight, alpha } from "../../../styles/tokens.ts"
import { UnderlineInput } from "../ui/underline-input.tsx"
import type { WizardState } from "../../../viewmodels/registration/types.ts"

interface StepIntakeProps {
  readonly intake: WizardState["intake"]
  readonly errors: ReadonlyMap<string, string>
  readonly onUpdate: (field: string, value: string) => void
  readonly onToggleProgram: (programId: string) => void
}

const gridStyle = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(1rem, 0.75rem + 1vw, 1.5rem) clamp(1.25rem, 1rem + 1vw, 1.75rem);

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`

const fullCol = css`
  grid-column: 1 / -1;
`

const fieldLabelStyle = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem);
  font-weight: ${weight.semibold};
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${color.textSageSoft};
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
  transition: border-color 300ms cubic-bezier(0.16, 1, 0.3, 1);
  width: 100%;

  &:focus {
    border-color: ${color.primary};
  }
`

const selectError = css`
  border-color: ${color.dangerAlt};
`

const errorTextStyle = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.15vw, 0.75rem);
  color: ${color.dangerAlt};
  margin-top: 0.25rem;
`

const textareaStyle = css`
  background: rgba(255, 255, 255, 0.25);
  border: 1.5px solid ${alpha(color.primary, 0.12)};
  border-radius: 12px;
  padding: 0.75rem;
  font-family: ${font.satoshi};
  font-size: clamp(0.875rem, 0.8rem + 0.35vw, 0.9375rem);
  color: ${color.textSagePrimary};
  outline: none;
  resize: vertical;
  min-height: 100px;
  transition: border-color 300ms cubic-bezier(0.16, 1, 0.3, 1);
  width: 100%;

  &:focus {
    border-color: ${color.primary};
  }

  &::placeholder {
    color: ${color.textSageSoft};
    font-style: italic;
  }
`

const textareaErrorStyle = css`
  border-color: ${color.dangerAlt};

  &:focus {
    border-color: ${color.dangerAlt};
  }
`

const sectionTitleStyle = css`
  grid-column: 1 / -1;
  font-family: ${font.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem);
  font-weight: ${weight.semibold};
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${color.textSageSoft};
  padding-top: 1rem;
  border-top: 1px solid ${alpha(color.primary, 0.08)};
  margin-top: 0.5rem;
`

const programsGridStyle = css`
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`

const programItemBase = css`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: clamp(0.625rem, 0.5rem + 0.5vw, 0.75rem) clamp(0.875rem, 0.75rem + 0.5vw, 1rem);
  border: 1.5px solid ${alpha(color.primary, 0.1)};
  border-radius: 12px;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.16, 1, 0.3, 1);
  background: rgba(255, 255, 255, 0.3);

  &:hover {
    border-color: ${alpha(color.primary, 0.2)};
    background: rgba(255, 255, 255, 0.5);
  }
`

const programItemSelected = css`
  border-color: ${color.primary};
  background: ${alpha(color.primary, 0.08)};
  box-shadow: 0 0 0 3px ${alpha(color.primary, 0.08)};
`

const programCheckBase = css`
  width: 18px;
  height: 18px;
  border-radius: 8px;
  border: 1.5px solid ${alpha(color.primary, 0.2)};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
  color: transparent;
  transition: all 150ms ease;
`

const programCheckSelected = css`
  background: ${color.primary};
  border-color: ${color.primary};
  color: #fff;
`

const programLabelBase = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  color: ${color.textSageMuted};
`

const programLabelSelected = css`
  color: ${color.primary};
  font-weight: ${weight.medium};
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
    <div>
      <label class={fieldLabelStyle}>Tipo de Ingresso</label>
      <select
        class={cx(selectStyle, errors.get("ingressType") ? selectError : undefined)}
        value={intake.ingressType}
        onChange={(e) => onUpdate("ingressType", (e.target as HTMLSelectElement).value)}
        aria-label="Tipo de ingresso"
      >
        {INGRESS_OPTIONS.map((opt) => (
          <option value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {errors.get("ingressType") && (
        <div class={errorTextStyle}>{errors.get("ingressType")}</div>
      )}
    </div>
    <div>
      <UnderlineInput
        label="Nome da Origem"
        value={intake.originName}
        onChange={(v) => onUpdate("originName", v)}
      />
    </div>
    <div>
      <UnderlineInput
        label="Contato da Origem"
        value={intake.originContact}
        onChange={(v) => onUpdate("originContact", v)}
      />
    </div>
    <div class={fullCol}>
      <label class={fieldLabelStyle}>Motivo do Atendimento</label>
      <textarea
        class={cx(textareaStyle, errors.get("serviceReason") ? textareaErrorStyle : undefined)}
        value={intake.serviceReason}
        onInput={(e) => onUpdate("serviceReason", (e.target as HTMLTextAreaElement).value)}
        placeholder="Descreva o motivo do primeiro atendimento..."
        aria-label="Motivo do atendimento"
      />
      {errors.get("serviceReason") && (
        <div class={errorTextStyle}>{errors.get("serviceReason")}</div>
      )}
    </div>

    <div class={sectionTitleStyle}>Programas sociais vinculados</div>

    <div class={programsGridStyle}>
      {SOCIAL_PROGRAMS.map((prog) => {
        const selected = intake.selectedPrograms.includes(prog.id)
        return (
          <button
            type="button"
            class={cx(programItemBase, selected ? programItemSelected : undefined)}
            onClick={() => onToggleProgram(prog.id)}
            aria-label={`Programa: ${prog.label}`}
            aria-pressed={selected}
          >
            <div class={cx(programCheckBase, selected ? programCheckSelected : undefined)}>
              &#10003;
            </div>
            <span class={cx(programLabelBase, selected ? programLabelSelected : undefined)}>
              {prog.label}
            </span>
          </button>
        )
      })}
    </div>

    <div class={fullCol}>
      <label class={fieldLabelStyle}>Observacao</label>
      <textarea
        class={textareaStyle}
        value={intake.observation}
        onInput={(e) => onUpdate("observation", (e.target as HTMLTextAreaElement).value)}
        placeholder="Anotacoes gerais sobre o ingresso..."
        aria-label="Observacao de ingresso"
      />
    </div>
  </div>
)
