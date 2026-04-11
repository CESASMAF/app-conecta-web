// =============================================================================
// Registry Application — Error Union
// =============================================================================
// Aggregates all possible errors from Registry use cases.
// Domain validation errors + proxy errors + application-specific errors.
// =============================================================================

import type { PersonalDataError } from "../../domain/registry/value-objects/personal_data.ts";
import type { CivilDocumentsError } from "../../domain/registry/value-objects/civil_documents.ts";
import type { SocialIdentityError } from "../../domain/registry/value-objects/social_identity.ts";
import type { PatientIdError } from "../../domain/registry/value-objects/patient_id.ts";
import type { CPFError } from "../../domain/kernel/cpf.ts";
import type { NISError } from "../../domain/kernel/nis.ts";
import type { RGDocumentError } from "../../domain/kernel/rg_document.ts";
import type { AddressError } from "../../domain/kernel/address.ts";
import type { PersonIdError, LookupIdError } from "../../domain/kernel/ids.ts";
import type { TimeStampError } from "../../domain/kernel/timestamp.ts";
import type { DiagnosisError } from "../../domain/care/value-objects/diagnosis.ts";
import type { FamilyMemberError } from "../../domain/registry/entities/family_member.ts";
import type { ProxyError } from "../shared/types.ts";

export type RegistryAppError =
  | PersonalDataError
  | CivilDocumentsError
  | SocialIdentityError
  | PatientIdError
  | CPFError
  | NISError
  | RGDocumentError
  | AddressError
  | PersonIdError
  | LookupIdError
  | TimeStampError
  | DiagnosisError
  | FamilyMemberError
  | ProxyError
  | "INVALID_PATIENT_ID"
  | "INVALID_PERSON_ID"
  | "INVALID_LOOKUP_ID"
  | "INVALID_TIMESTAMP"
  | "INVALID_DIAGNOSIS";
