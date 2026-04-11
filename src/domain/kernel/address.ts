// =============================================================================
// Address — Value Object
// =============================================================================
// Compound value object representing a Brazilian address with validation,
// normalization, and residence metadata. Reuses CEP and BrazilianState from
// the kernel CEP module.
// =============================================================================

import { type Result, ok, err } from "../shared/result.ts";
import { type CEP, CEP as createCEP, type BrazilianState } from "./cep.ts";

// ---------------------------------------------------------------------------
// Residence Location
// ---------------------------------------------------------------------------

export type ResidenceLocation = "URBANO" | "RURAL";

// ---------------------------------------------------------------------------
// Address Type
// ---------------------------------------------------------------------------

export type Address = Readonly<{
  cep: CEP | undefined;
  state: string;
  city: string;
  street: string | undefined;
  neighborhood: string | undefined;
  number: string | undefined;
  complement: string | undefined;
  residenceLocation: ResidenceLocation;
  isShelter: boolean;
  isHomeless: boolean;
}>;

// ---------------------------------------------------------------------------
// Input Type
// ---------------------------------------------------------------------------

export type AddressInput = Readonly<{
  cep?: string;
  state: string;
  city: string;
  street?: string;
  neighborhood?: string;
  number?: string;
  complement?: string;
  residenceLocation: string;
  isShelter: boolean;
  isHomeless?: boolean;
}>;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

export type AddressError =
  | "ADDR-001" // invalid CEP (wraps CEPError)
  | "ADDR-002" // state is empty
  | "ADDR-003" // state is not a valid Brazilian state
  | "ADDR-004" // city is empty
  | "ADDR-005"; // invalid residenceLocation (not URBANO or RURAL)

// ---------------------------------------------------------------------------
// Valid Brazilian States (module-private)
// ---------------------------------------------------------------------------

const VALID_STATES: ReadonlySet<string> = new Set<BrazilianState>([
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES",
  "GO", "MA", "MG", "MS", "MT", "PA", "PB", "PE",
  "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC",
  "SE", "SP", "TO",
]);

// ---------------------------------------------------------------------------
// Valid Residence Locations (module-private)
// ---------------------------------------------------------------------------

const VALID_RESIDENCE_LOCATIONS: ReadonlySet<string> = new Set<ResidenceLocation>([
  "URBANO",
  "RURAL",
]);

// ---------------------------------------------------------------------------
// Normalization Helpers (module-private)
// ---------------------------------------------------------------------------

/** Trims and collapses multiple whitespace into a single space. */
const normalizeText = (value: string): string =>
  value.trim().replace(/\s+/g, " ");

/** Normalizes an optional string field. Returns undefined if input is undefined. */
const normalizeOptional = (value: string | undefined): string | undefined =>
  value !== undefined ? normalizeText(value) : undefined;

// ---------------------------------------------------------------------------
// Smart Constructor
// ---------------------------------------------------------------------------

/**
 * Validates and creates an Address from raw input.
 *
 * Validation order: CEP (if provided) → state empty → state valid →
 * city empty → residenceLocation valid.
 *
 * Normalization: state is trimmed+uppercased, city and optional text fields
 * are trimmed with whitespace collapsed.
 */
const validateCep = (raw: string | undefined): Result<CEP | undefined, AddressError> => {
  if (raw === undefined) return ok(undefined);
  const cepResult = createCEP(raw);
  if (!cepResult.ok) return err("ADDR-001");
  return ok(cepResult.value);
};

export const Address = (input: AddressInput): Result<Address, AddressError> => {
  // --- CEP (optional) ---
  const cepResult = validateCep(input.cep);
  if (!cepResult.ok) return cepResult;

  // --- State ---
  const normalizedState = input.state.trim().toUpperCase();
  if (normalizedState.length === 0) {
    return err("ADDR-002");
  }
  if (!VALID_STATES.has(normalizedState)) {
    return err("ADDR-003");
  }

  // --- City ---
  const normalizedCity = normalizeText(input.city);
  if (normalizedCity.length === 0) {
    return err("ADDR-004");
  }

  // --- Residence Location ---
  if (!VALID_RESIDENCE_LOCATIONS.has(input.residenceLocation)) {
    return err("ADDR-005");
  }

  return ok({
    cep: cepResult.value,
    state: normalizedState,
    city: normalizedCity,
    street: normalizeOptional(input.street),
    neighborhood: normalizeOptional(input.neighborhood),
    number: normalizeOptional(input.number),
    complement: normalizeOptional(input.complement),
    residenceLocation: input.residenceLocation as ResidenceLocation,
    isShelter: input.isShelter,
    isHomeless: input.isHomeless ?? false,
  });
};
