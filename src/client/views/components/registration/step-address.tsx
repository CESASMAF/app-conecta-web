import type { FC } from "hono/jsx/dom";
import { css } from "hono/css";
import {
  easing,
  font,
  sage,
  sageRadius,
  weight,
} from "../../../styles/tokens.ts";
import {
  bannerSlide,
  fadeInUp,
  sageFormGrid,
  sageFullWidth,
  sageInputBase,
  sageInputError,
  sageInputLabel,
  sageTextError,
} from "../../../styles/base.ts";
import type {
  LocationType,
  WizardState,
} from "../../../viewmodels/registration/types.ts";

interface StepAddressProps {
  readonly address: WizardState["address"];
  readonly errors: ReadonlyMap<string, string>;
  readonly onUpdate: (field: string, value: string) => void;
  readonly onSetLocationType: (lt: LocationType) => void;
}

// --- FormField ---

interface FormFieldProps {
  readonly label: string;
  readonly name: string;
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly full?: boolean;
  readonly value: string;
  readonly error?: string;
  readonly onInput: (value: string) => void;
}

const fieldWrapperStyle = css`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const requiredStar = css`
  color: ${sage.danger};
`;

const FormField: FC<FormFieldProps> = ({
  label,
  name,
  placeholder,
  required,
  full,
  value,
  error,
  onInput,
}) => (
  <div class={`${fieldWrapperStyle} ${full ? sageFullWidth : ""}`}>
    <label class={sageInputLabel} for={name}>
      {label}
      {required && <span class={requiredStar}>*</span>}
    </label>
    <input
      id={name}
      name={name}
      type="text"
      class={`${sageInputBase} ${error ? sageInputError : ""}`}
      value={value}
      placeholder={placeholder}
      onInput={(e) => onInput((e.target as HTMLInputElement).value)}
    />
    {error && <span class={sageTextError} role="alert">{error}</span>}
  </div>
);

// --- FormSelect ---

const selectStyle = css`
  ${sageInputBase} appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238B9E85' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 4px center;
  padding-right: 24px;
  cursor: pointer;
`;

interface FormSelectProps {
  readonly label: string;
  readonly name: string;
  readonly required?: boolean;
  readonly value: string;
  readonly error?: string;
  readonly options: readonly {
    readonly value: string;
    readonly label: string;
  }[];
  readonly onInput: (value: string) => void;
}

const FormSelect: FC<FormSelectProps> = ({
  label,
  name,
  required,
  value,
  error,
  options,
  onInput,
}) => (
  <div class={fieldWrapperStyle}>
    <label class={sageInputLabel} for={name}>
      {label}
      {required && <span class={requiredStar}>*</span>}
    </label>
    <select
      id={name}
      name={name}
      class={`${selectStyle} ${error ? sageInputError : ""}`}
      value={value}
      onChange={(e) => onInput((e.target as HTMLSelectElement).value)}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <span class={sageTextError} role="alert">{error}</span>}
  </div>
);

// --- LocationTypeGate ---

const locationGateStyle = css`
  display: flex;
  flex-direction: column;
  gap: 6px;
  grid-column: 1 / -1;
`;

const locationCardsStyle = css`
  display: flex;
  gap: 10px;
  margin-top: 8px;
  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const locationCardStyle = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 16px 16px;
  min-height: 100px;
  gap: 4px;
  background: rgba(255, 255, 255, 0.4);
  border: 1.5px solid rgba(79, 132, 72, 0.1);
  border-radius: ${sageRadius.md};
  cursor: pointer;
  transition: all 150ms ${easing.out};
  &:hover {
    background: rgba(255, 255, 255, 0.6);
    border-color: rgba(79, 132, 72, 0.2);
  }
  &:focus-visible {
    outline: 2px solid ${sage.greenPrimary};
    outline-offset: 2px;
  }
`;

const locationCardSelectedStyle = css`
  ${locationCardStyle} background: ${sage.greenLight};
  border-color: ${sage.greenPrimary};
  box-shadow: 0 0 0 3px rgba(79, 132, 72, 0.08);
`;

const locationCardErrorStyle = css`
  border-color: rgba(196, 66, 43, 0.3);
`;

const locationIconStyle = css`
  font-size: 28px;
  margin-bottom: 4px;
`;

const locationLabelStyle = css`
  font-family: ${font.erode};
  font-size: 14px;
  font-weight: ${weight.semibold};
  color: ${sage.textPrimary};
`;

const locationLabelSelectedStyle = css`
  ${locationLabelStyle} color: ${sage.greenPrimary};
`;

const locationDescStyle = css`
  font-family: ${font.satoshi};
  font-size: 11px;
  color: ${sage.textSoft};
  text-align: center;
  line-height: 1.3;
`;

const locationDescSelectedStyle = css`
  ${locationDescStyle} color: ${sage.greenDark};
`;

const LOCATION_TYPES: readonly {
  readonly type: LocationType;
  readonly icon: string;
  readonly label: string;
  readonly description: string;
}[] = [
  {
    type: "URBANO",
    icon: "\uD83C\uDFD7\uFE0F",
    label: "Urbano",
    description: "Zona urbana do municipio",
  },
  {
    type: "RURAL",
    icon: "\uD83C\uDF3E",
    label: "Rural",
    description: "Zona rural ou distrito",
  },
  {
    type: "RUA",
    icon: "\uD83D\uDECC",
    label: "Rua",
    description: "Pessoa em situacao de rua",
  },
] as const;

interface AddressTypeCardProps {
  readonly type: LocationType;
  readonly icon: string;
  readonly label: string;
  readonly description: string;
  readonly selected: boolean;
  readonly hasError: boolean;
  readonly onSelect: () => void;
}

const AddressTypeCard: FC<AddressTypeCardProps> = ({
  icon,
  label,
  description,
  selected,
  hasError,
  onSelect,
}) => (
  <div
    role="radio"
    aria-checked={selected ? "true" : "false"}
    tabIndex={0}
    class={`${selected ? locationCardSelectedStyle : locationCardStyle} ${
      hasError && !selected ? locationCardErrorStyle : ""
    }`}
    onClick={onSelect}
    onKeyDown={(e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect();
      }
    }}
  >
    <span class={locationIconStyle} aria-hidden="true">{icon}</span>
    <span class={selected ? locationLabelSelectedStyle : locationLabelStyle}>
      {label}
    </span>
    <span class={selected ? locationDescSelectedStyle : locationDescStyle}>
      {description}
    </span>
  </div>
);

// --- AddressInfoBanner ---

const infoBannerStyle = css`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(79, 132, 72, 0.06);
  border: 1px solid rgba(79, 132, 72, 0.12);
  border-radius: ${sageRadius.md};
  grid-column: 1 / -1;
  animation: ${bannerSlide} 500ms ${easing.out};
`;

const infoBannerIconStyle = css`
  font-size: 16px;
  color: ${sage.greenPrimary};
  flex-shrink: 0;
`;

const infoBannerTextStyle = css`
  font-family: ${font.satoshi};
  font-size: 12px;
  font-weight: ${weight.medium};
  color: ${sage.textSecondary};
  line-height: 1.4;
`;

const BANNER_MESSAGES: Record<string, string> = {
  RURAL: "Rua e Complemento nao se aplicam para area rural.",
  RUA:
    "Apenas Estado e Cidade sao necessarios para cobertura territorial do CRAS.",
};

// --- GlobalErrorBanner ---

const globalBannerStyle = css`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(196, 66, 43, 0.06);
  border: 1px solid ${sage.dangerBorder};
  border-radius: ${sageRadius.md};
  animation: ${bannerSlide} 500ms ${easing.out};
`;

const globalBannerIconStyle = css`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${sage.danger};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${font.satoshi};
  font-size: 13px;
  font-weight: ${weight.bold};
  flex-shrink: 0;
`;

const globalBannerTextStyle = css`
  font-family: ${font.satoshi};
  font-size: 13px;
  font-weight: ${weight.medium};
  color: ${sage.danger};
  line-height: 1.4;
`;

// --- Data ---

const UF_OPTIONS = [
  { value: "", label: "Selecione..." },
  ...[
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ].map((uf) => ({ value: uf, label: uf })),
] as const;

const HOUSING_OPTIONS = [
  { value: "", label: "Selecione..." },
  { value: "PROPRIA", label: "Propria" },
  { value: "ALUGADA", label: "Alugada" },
  { value: "CEDIDA", label: "Cedida" },
  { value: "SITUACAO_DE_RUA", label: "Situacao de rua" },
  { value: "OUTROS", label: "Outros" },
] as const;

const formatCep = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

// --- Address Fields (conditional visibility) ---

const fieldsRevealStyle = css`
  animation: ${fadeInUp} 400ms ${easing.out};
`;

const containerStyle = css`
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: ${fadeInUp} 500ms ${easing.out};
`;

// --- Main Component ---

export const StepAddress: FC<StepAddressProps> = (
  { address, errors, onUpdate, onSetLocationType },
) => {
  const lt = address.locationType;
  const showUrbanFields = lt === "URBANO";
  const showRuralFields = lt === "RURAL";
  const hasFields = lt !== null;

  return (
    <div class={containerStyle}>
      {errors.get("address") && (
        <div class={globalBannerStyle} role="alert">
          <span class={globalBannerIconStyle} aria-hidden="true">!</span>
          <span class={globalBannerTextStyle}>{errors.get("address")}</span>
        </div>
      )}

      <div class={sageFormGrid}>
        {/* LocationTypeGate */}
        <div class={locationGateStyle}>
          <span class={sageInputLabel}>
            Tipo de localizacao<span class={requiredStar}>*</span>
          </span>
          <div
            class={locationCardsStyle}
            role="radiogroup"
            aria-label="Tipo de localizacao"
          >
            {LOCATION_TYPES.map((item) => (
              <AddressTypeCard
                type={item.type}
                icon={item.icon}
                label={item.label}
                description={item.description}
                selected={lt === item.type}
                hasError={!!errors.get("locationType") ||
                  !!errors.get("residenceLocation")}
                onSelect={() => onSetLocationType(item.type)}
              />
            ))}
          </div>
          {(errors.get("locationType") || errors.get("residenceLocation")) && (
            <span class={sageTextError} role="alert">
              {errors.get("locationType") || errors.get("residenceLocation")}
            </span>
          )}
        </div>

        {/* InfoBanner for Rural/Rua */}
        {(lt === "RURAL" || lt === "RUA") && (
          <div class={infoBannerStyle} role="status">
            <span class={infoBannerIconStyle} aria-hidden="true">&#8505;</span>
            <span class={infoBannerTextStyle}>{BANNER_MESSAGES[lt]}</span>
          </div>
        )}

        {/* Conditional address fields */}
        {hasFields && (
          <div class={`${sageFormGrid} ${sageFullWidth} ${fieldsRevealStyle}`}>
            {/* Housing: only for URBANO */}
            {showUrbanFields && (
              <FormSelect
                label="Situacao de moradia"
                name="housingSituation"
                required
                value={address.housingSituation}
                error={errors.get("housingSituation")}
                options={HOUSING_OPTIONS}
                onInput={(v) => onUpdate("housingSituation", v)}
              />
            )}

            {/* CEP: URBANO and RURAL */}
            {(showUrbanFields || showRuralFields) && (
              <FormField
                label="CEP"
                name="cep"
                placeholder="00000-000"
                value={formatCep(address.cep)}
                error={errors.get("cep")}
                onInput={(v) => onUpdate("cep", v.replace(/\D/g, ""))}
              />
            )}

            {/* Street fields: only URBANO */}
            {showUrbanFields && (
              <>
                <FormField
                  label="Rua"
                  name="street"
                  placeholder="Nome da rua"
                  value={address.street}
                  error={errors.get("street")}
                  onInput={(v) => onUpdate("street", v)}
                />
                <FormField
                  label="Numero"
                  name="addressNumber"
                  placeholder="Numero"
                  value={address.number}
                  error={errors.get("number")}
                  onInput={(v) =>
                    onUpdate("number", v)}
                />
                <FormField
                  label="Complemento"
                  name="complement"
                  placeholder="Apto, bloco, etc."
                  value={address.complement}
                  onInput={(v) => onUpdate("complement", v)}
                />
              </>
            )}

            {/* Neighborhood: URBANO and RURAL */}
            {(showUrbanFields || showRuralFields) && (
              <FormField
                label="Bairro"
                name="neighborhood"
                placeholder="Bairro"
                value={address.neighborhood}
                error={errors.get("neighborhood")}
                onInput={(v) => onUpdate("neighborhood", v)}
              />
            )}

            {/* State + City: always when type selected */}
            <FormSelect
              label="Estado"
              name="addressState"
              required
              value={address.state}
              error={errors.get("state")}
              options={UF_OPTIONS}
              onInput={(v) => onUpdate("state", v)}
            />
            <FormField
              label="Cidade"
              name="city"
              placeholder="Nome da cidade"
              required
              value={address.city}
              error={errors.get("city")}
              onInput={(v) => onUpdate("city", v)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
