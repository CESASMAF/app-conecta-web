// =============================================================================
// Address — Contract
// =============================================================================
// Defines the public API surface for the Address Value Object.
// Implementation lives at src/domain/kernel/address.ts
// =============================================================================

import type { Result } from "../../../src/domain/shared/result.ts";
import type { CEP } from "../../../src/domain/kernel/cep.ts";

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
// Function Signatures
// ---------------------------------------------------------------------------

/** Smart constructor: validates and creates an Address from raw input. */
export declare const Address: (input: AddressInput) => Result<Address, AddressError>;
