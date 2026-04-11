import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { space } from "../../../styles/tokens.ts"
import { UnderlineInput } from "../ui/underline-input.tsx"
import type { WizardState } from "../../../viewmodels/registration/types.ts"

interface StepDocumentsProps {
  readonly documents: WizardState["documents"]
  readonly errors: ReadonlyMap<string, string>
  readonly onUpdate: (field: string, value: string) => void
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

const sectionTitle = css`
  width: 100%;
  font-size: 14px;
  font-weight: 600;
  color: rgba(38, 29, 17, 0.6);
  margin-top: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

// Pure formatting functions — store raw digits, format for display
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

const unformatToDigits = (value: string): string => value.replace(/\D/g, "")

export const StepDocuments: FC<StepDocumentsProps> = ({ documents, errors, onUpdate }) => (
  <div class={gridStyle}>
    <div class={fieldItem}>
      <UnderlineInput
        label="CPF"
        value={formatCpf(documents.cpf)}
        onChange={(v) => onUpdate("cpf", unformatToDigits(v))}
        error={errors.get("cpf")}
      />
    </div>
    <div class={fieldItem}>
      <UnderlineInput
        label="Data de nascimento"
        value={formatDate(documents.birthDate)}
        onChange={(v) => onUpdate("birthDate", unformatToDigits(v))}
        error={errors.get("birthDate")}
      />
    </div>
    <div class={fieldItem}>
      <UnderlineInput
        label="NIS"
        value={documents.nis}
        onChange={(v) => onUpdate("nis", v)}
        error={errors.get("nis")}
      />
    </div>
    <div class={fieldItem}>
      <UnderlineInput
        label="CNS"
        value={documents.cnsNumber}
        onChange={(v) => onUpdate("cnsNumber", v)}
        error={errors.get("cnsNumber")}
      />
    </div>
    <span class={sectionTitle}>RG (preencha todos ou nenhum)</span>
    <div class={fieldItem}>
      <UnderlineInput
        label="Numero do RG"
        value={documents.rgNumber}
        onChange={(v) => onUpdate("rgNumber", v)}
        error={errors.get("rgNumber")}
      />
    </div>
    <div class={fieldItem}>
      <UnderlineInput
        label="UF"
        value={documents.rgUf}
        onChange={(v) => onUpdate("rgUf", v)}
        error={errors.get("rgUf")}
      />
    </div>
    <div class={fieldItem}>
      <UnderlineInput
        label="Orgao emissor"
        value={documents.rgAgency}
        onChange={(v) => onUpdate("rgAgency", v)}
        error={errors.get("rgAgency")}
      />
    </div>
    <div class={fieldItem}>
      <UnderlineInput
        label="Data de emissao"
        value={formatDate(documents.rgDate)}
        onChange={(v) => onUpdate("rgDate", unformatToDigits(v))}
        error={errors.get("rgDate")}
      />
    </div>
  </div>
)
