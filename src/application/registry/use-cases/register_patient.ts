// =============================================================================
// RegisterPatient — Use Case (Registry)
// =============================================================================
// Validates raw input via domain smart constructors, then proxies to backend.
// Sequence: validate → proxy. No local persistence (BFF pattern).
// =============================================================================

import type { Result } from "../../../domain/shared/result.ts";
import { PersonalData, type PersonalDataInput, type PersonalDataError } from "../../../domain/registry/value-objects/personal_data.ts";
import { CivilDocuments, type CivilDocumentsError } from "../../../domain/registry/value-objects/civil_documents.ts";
import { CPF, type CPFError } from "../../../domain/kernel/cpf.ts";
import { NIS, type NISError } from "../../../domain/kernel/nis.ts";
import { RGDocument, type RGDocumentInput, type RGDocumentError } from "../../../domain/kernel/rg_document.ts";
import { Address, type AddressInput, type AddressError } from "../../../domain/kernel/address.ts";
import { TimeStamp, type TimeStampError } from "../../../domain/kernel/timestamp.ts";
import { Diagnosis, type DiagnosisError } from "../../../domain/care/value-objects/diagnosis.ts";
import type { UseCase, BackendProxy, ProxyError } from "../../shared/types.ts";

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export type RegisterPatientInput = Readonly<{
  personalData: PersonalDataInput;
  civilDocuments: Readonly<{
    cpf?: string;
    nis?: string;
    rgDocument?: RGDocumentInput;
  }>;
  address: AddressInput;
  diagnoses: readonly Readonly<{ icdCode: string; date: string; description: string }>[];
  actorId: string;
}>;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

export type RegisterPatientError =
  | PersonalDataError
  | CivilDocumentsError
  | CPFError
  | NISError
  | RGDocumentError
  | AddressError
  | TimeStampError
  | DiagnosisError
  | ProxyError;

// ---------------------------------------------------------------------------
// Deps
// ---------------------------------------------------------------------------

export type RegisterPatientDeps = Readonly<{
  backendProxy: BackendProxy;
}>;

// ---------------------------------------------------------------------------
// Use Case Factory
// ---------------------------------------------------------------------------

export const registerPatient = (
  deps: RegisterPatientDeps,
): UseCase<RegisterPatientInput, unknown, RegisterPatientError> =>
  async (input) => {
    // 1. Validate PersonalData
    const personalDataResult = PersonalData(input.personalData);
    if (!personalDataResult.ok) return personalDataResult;

    // 2. Validate CivilDocuments (construct CPF/NIS/RG first)
    const cpfResult = input.civilDocuments.cpf !== undefined
      ? CPF(input.civilDocuments.cpf)
      : undefined;
    if (cpfResult !== undefined && !cpfResult.ok) return cpfResult;

    const nisResult = input.civilDocuments.nis !== undefined
      ? NIS(input.civilDocuments.nis)
      : undefined;
    if (nisResult !== undefined && !nisResult.ok) return nisResult;

    const rgResult = input.civilDocuments.rgDocument !== undefined
      ? RGDocument(input.civilDocuments.rgDocument)
      : undefined;
    if (rgResult !== undefined && !rgResult.ok) return rgResult;

    const civilDocsResult = CivilDocuments({
      cpf: cpfResult?.ok ? cpfResult.value : undefined,
      nis: nisResult?.ok ? nisResult.value : undefined,
      rgDocument: rgResult?.ok ? rgResult.value : undefined,
    });
    if (!civilDocsResult.ok) return civilDocsResult;

    // 3. Validate Address
    const addressResult = Address(input.address);
    if (!addressResult.ok) return addressResult;

    // 4. Validate each Diagnosis
    const diagnosisResults: Result<unknown, TimeStampError | DiagnosisError>[] = [];
    for (const d of input.diagnoses) {
      const dateResult = TimeStamp(d.date);
      if (!dateResult.ok) return dateResult;

      const diagResult = Diagnosis({
        id: d.icdCode,
        date: dateResult.value,
        description: d.description,
      });
      if (!diagResult.ok) return diagResult;
      diagnosisResults.push(diagResult);
    }

    // 5. Proxy to backend
    return deps.backendProxy.post(
      "/api/v1/patients",
      {
        personalData: personalDataResult.value,
        civilDocuments: civilDocsResult.value,
        address: addressResult.value,
        diagnoses: input.diagnoses,
      },
      input.actorId,
    );
  };
