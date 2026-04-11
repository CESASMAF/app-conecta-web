import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight, space } from "../../../styles/tokens.ts"
import { UnderlineInput } from "../ui/underline-input.tsx"
import { UnderlineSelect } from "../ui/underline-select.tsx"
import { CheckboxField } from "../ui/checkbox-field.tsx"
import type { WizardState } from "../../../viewmodels/registration/types.ts"

interface StepAddressProps {
  readonly address: WizardState["address"]
  readonly errors: ReadonlyMap<string, string>
  readonly onUpdate: (field: string, value: string) => void
  readonly onToggleFlag: (field: "isShelter" | "isHomeless") => void
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

const radioLabelStyle = css`
  font-family: ${font.satoshi};
  font-size: 13px;
  font-weight: ${weight.bold};
  letter-spacing: 0.65px;
  text-transform: uppercase;
  color: ${color.textMuted};
`

const radioGroupStyle = css`
  display: flex;
  gap: ${space[4]};
  padding: 8px 0;
`

const radioOptionStyle = css`
  display: flex;
  align-items: center;
  gap: ${space[2]};
  font-family: ${font.satoshi};
  font-size: 16px;
  color: ${color.textPrimary};
  cursor: pointer;
`

const radioErrorStyle = css`
  font-family: ${font.satoshi};
  font-size: 12px;
  color: ${color.danger};
  margin-top: 4px;
`

const HOUSING_OPTIONS = [
  { value: "", label: "Selecione..." },
  { value: "PROPRIA", label: "Propria" },
  { value: "ALUGADA", label: "Alugada" },
  { value: "CEDIDA", label: "Cedida" },
  { value: "SITUACAO_DE_RUA", label: "Situacao de rua" },
  { value: "OUTROS", label: "Outros" },
] as const

const UF_OPTIONS = [
  { value: "", label: "Selecione..." },
  ...["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
    "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ",
    "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
  ].map((uf) => ({ value: uf, label: uf })),
] as const

const formatCep = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 8)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

export const StepAddress: FC<StepAddressProps> = ({ address, errors, onUpdate, onToggleFlag }) => {

  return (
    <div class={gridStyle}>
      <div class={fieldItem}>
        <UnderlineSelect
          label="Situacao de moradia"
          value={address.housingSituation}
          options={HOUSING_OPTIONS}
          onChange={(v) => onUpdate("housingSituation", v)}
          error={errors.get("housingSituation")}
          required
        />
      </div>
      <div class={fieldItem}>
        <div>
          <label class={radioLabelStyle}>Localizacao *</label>
          <div class={radioGroupStyle}>
            <label class={radioOptionStyle}>
              <input
                type="radio"
                name="residenceLocation"
                value="URBANO"
                checked={address.residenceLocation === "URBANO"}
                onChange={() => onUpdate("residenceLocation", "URBANO")}
              />
              Urbano
            </label>
            <label class={radioOptionStyle}>
              <input
                type="radio"
                name="residenceLocation"
                value="RURAL"
                checked={address.residenceLocation === "RURAL"}
                onChange={() => onUpdate("residenceLocation", "RURAL")}
              />
              Rural
            </label>
          </div>
          {errors.get("residenceLocation") && (
            <span class={radioErrorStyle}>{errors.get("residenceLocation")}</span>
          )}
        </div>
      </div>
      <div class={fieldItem}>
        <UnderlineInput
          label="CEP"
          value={formatCep(address.cep)}
          onChange={(v) => onUpdate("cep", v.replace(/\D/g, ""))}
          error={errors.get("cep")}
        />
      </div>
      <div class={fieldItem}>
        <UnderlineInput
          label="Rua"
          value={address.street}
          onChange={(v) => onUpdate("street", v)}
          error={errors.get("street")}
          disabled={address.isHomeless}
        />
      </div>
      <div class={fieldItem}>
        <UnderlineInput
          label="Numero"
          value={address.number}
          onChange={(v) => onUpdate("number", v)}
          error={errors.get("number")}
          disabled={address.isHomeless}
        />
      </div>
      <div class={fieldItem}>
        <UnderlineInput
          label="Complemento"
          value={address.complement}
          onChange={(v) => onUpdate("complement", v)}
          disabled={address.isHomeless}
        />
      </div>
      <div class={fieldItem}>
        <UnderlineInput
          label="Bairro"
          value={address.neighborhood}
          onChange={(v) => onUpdate("neighborhood", v)}
          error={errors.get("neighborhood")}
          disabled={address.isHomeless}
        />
      </div>
      <div class={fieldItem}>
        <UnderlineSelect
          label="Estado"
          value={address.state}
          options={UF_OPTIONS}
          onChange={(v) => onUpdate("state", v)}
          error={errors.get("state")}
          required
        />
      </div>
      <div class={fieldItem}>
        <UnderlineInput
          label="Cidade"
          value={address.city}
          onChange={(v) => onUpdate("city", v)}
          error={errors.get("city")}
          required
        />
      </div>
      <div class={fieldItem}>
        <CheckboxField
          label="Unidade de acolhimento / abrigo"
          checked={address.isShelter}
          onChange={() => onToggleFlag("isShelter")}
        />
      </div>
      <div class={fieldItem}>
        <CheckboxField
          label="Pessoa em situacao de rua"
          checked={address.isHomeless}
          onChange={() => onToggleFlag("isHomeless")}
        />
      </div>
    </div>
  )
}
