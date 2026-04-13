import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight, alpha } from "../../../styles/tokens.ts"
import { UnderlineInput } from "../ui/underline-input.tsx"
import type { WizardState } from "../../../viewmodels/registration/types.ts"

interface StepDocumentsProps {
  readonly documents: WizardState["documents"]
  readonly errors: ReadonlyMap<string, string>
  readonly onUpdate: (field: string, value: string) => void
}

const gridStyle = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(1rem, 0.75rem + 1vw, 1.5rem) clamp(1.25rem, 1rem + 1vw, 1.75rem);

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
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

const globalErrorStyle = css`
  grid-column: 1 / -1;
  padding: clamp(0.625rem, 0.5rem + 0.5vw, 0.75rem) clamp(0.875rem, 0.75rem + 0.5vw, 1rem);
  background: ${alpha(color.dangerAlt, 0.06)};
  border: 1px solid ${alpha(color.dangerAlt, 0.15)};
  border-radius: 12px;
  font-family: ${font.satoshi};
  font-size: clamp(0.75rem, 0.7rem + 0.25vw, 0.8125rem);
  font-weight: ${weight.medium};
  color: ${color.dangerAlt};
  line-height: 1.4;
`

const formatCpf = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

const formatDate = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

const unformat = (value: string): string => value.replace(/\D/g, "")

export const StepDocuments: FC<StepDocumentsProps> = ({ documents, errors, onUpdate }) => {
  return (
    <div class={gridStyle}>
      {errors.get("documents") && (
        <div class={globalErrorStyle}>{errors.get("documents")}</div>
      )}
      <div>
        <UnderlineInput
          label="CPF"
          value={formatCpf(documents.cpf)}
          onChange={(v) => onUpdate("cpf", unformat(v))}
          error={errors.get("cpf")}
        />
      </div>
      <div>
        <UnderlineInput
          label="NIS"
          value={documents.nis}
          onChange={(v) => onUpdate("nis", v)}
          error={errors.get("nis")}
        />
      </div>
      <div>
        <UnderlineInput
          label="CNS"
          value={documents.cnsNumber}
          onChange={(v) => onUpdate("cnsNumber", v)}
          error={errors.get("cnsNumber")}
        />
      </div>
      <div>
        <UnderlineInput
          label="Data de Nascimento"
          value={formatDate(documents.birthDate)}
          onChange={(v) => onUpdate("birthDate", unformat(v))}
          error={errors.get("birthDate")}
        />
      </div>
      <div class={sectionTitleStyle}>RG (preencha todos ou nenhum)</div>
      <div>
        <UnderlineInput
          label="Numero do RG"
          value={documents.rgNumber}
          onChange={(v) => onUpdate("rgNumber", v)}
          error={errors.get("rgNumber")}
        />
      </div>
      <div>
        <UnderlineInput
          label="UF"
          value={documents.rgUf}
          onChange={(v) => onUpdate("rgUf", v)}
          error={errors.get("rgUf")}
        />
      </div>
      <div>
        <UnderlineInput
          label="Orgao Emissor"
          value={documents.rgAgency}
          onChange={(v) => onUpdate("rgAgency", v)}
          error={errors.get("rgAgency")}
        />
      </div>
      <div>
        <UnderlineInput
          label="Data de Emissao"
          value={formatDate(documents.rgDate)}
          onChange={(v) => onUpdate("rgDate", unformat(v))}
          error={errors.get("rgDate")}
        />
      </div>
    </div>
  )
}
