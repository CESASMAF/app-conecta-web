import type { FC } from "hono/jsx/dom"
import { useState } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight, space } from "../../../styles/tokens.ts"
import { UnderlineInput } from "../ui/underline-input.tsx"
import type { WizardState } from "../../../viewmodels/registration/types.ts"

interface StepAddressProps {
  readonly address: WizardState["address"]
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

const selectStyle = css`
  border: none;
  border-bottom: 1px solid ${color.inputLine};
  padding: 8px 0;
  font-family: ${font.satoshi};
  font-size: 16px;
  color: ${color.textPrimary};
  background: transparent;
  outline: none;
  width: 100%;
  cursor: pointer;
  &:focus { border-bottom: 2px solid ${color.textPrimary}; }
`

const selectLabelStyle = css`
  font-family: ${font.satoshi};
  font-size: 13px;
  font-weight: ${weight.bold};
  letter-spacing: 0.65px;
  text-transform: uppercase;
  color: ${color.textMuted};
`

const selectErrorStyle = css`
  font-family: ${font.satoshi};
  font-size: 11px;
  color: ${color.danger};
  margin-top: 4px;
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

const checkboxLabelStyle = css`
  display: flex;
  align-items: center;
  gap: ${space[2]};
  font-family: ${font.satoshi};
  font-size: 14px;
  color: ${color.textPrimary};
  cursor: pointer;
  padding: 8px 0;
  width: 100%;
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
  "", "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ",
  "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const

const formatCep = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 8)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

export const StepAddress: FC<StepAddressProps> = ({ address, errors, onUpdate }) => {
  const [homeless, setHomeless] = useState(address.housingSituation === "SITUACAO_DE_RUA")

  const handleHousingChange = (value: string): void => {
    const isHomeless = value === "SITUACAO_DE_RUA"
    setHomeless(isHomeless)
    onUpdate("housingSituation", value)
    if (isHomeless) {
      onUpdate("street", "")
      onUpdate("number", "")
      onUpdate("complement", "")
      onUpdate("neighborhood", "")
    }
  }

  return (
    <div class={gridStyle}>
      <div class={fieldItem}>
        <div>
          <label class={selectLabelStyle}>Situacao de moradia</label>
          <select
            class={selectStyle}
            value={address.housingSituation}
            onChange={(e) => handleHousingChange((e.target as HTMLSelectElement).value)}
          >
            {HOUSING_OPTIONS.map((opt) => (
              <option value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {errors.get("housingSituation") && (
            <span class={selectErrorStyle}>{errors.get("housingSituation")}</span>
          )}
        </div>
      </div>
      <div class={fieldItem}>
        <div>
          <label class={selectLabelStyle}>Localizacao</label>
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
            <span class={selectErrorStyle}>{errors.get("residenceLocation")}</span>
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
          disabled={homeless}
        />
      </div>
      <div class={fieldItem}>
        <UnderlineInput
          label="Numero"
          value={address.number}
          onChange={(v) => onUpdate("number", v)}
          error={errors.get("number")}
          disabled={homeless}
        />
      </div>
      <div class={fieldItem}>
        <UnderlineInput
          label="Complemento"
          value={address.complement}
          onChange={(v) => onUpdate("complement", v)}
          disabled={homeless}
        />
      </div>
      <div class={fieldItem}>
        <UnderlineInput
          label="Bairro"
          value={address.neighborhood}
          onChange={(v) => onUpdate("neighborhood", v)}
          error={errors.get("neighborhood")}
          disabled={homeless}
        />
      </div>
      <div class={fieldItem}>
        <div>
          <label class={selectLabelStyle}>Estado</label>
          <select
            class={selectStyle}
            value={address.state}
            onChange={(e) => onUpdate("state", (e.target as HTMLSelectElement).value)}
          >
            {UF_OPTIONS.map((uf) => (
              <option value={uf}>{uf || "Selecione..."}</option>
            ))}
          </select>
          {errors.get("state") && <span class={selectErrorStyle}>{errors.get("state")}</span>}
        </div>
      </div>
      <div class={fieldItem}>
        <UnderlineInput
          label="Cidade"
          value={address.city}
          onChange={(v) => onUpdate("city", v)}
          error={errors.get("city")}
        />
      </div>
    </div>
  )
}
