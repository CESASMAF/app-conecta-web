// =============================================================================
// RegisterIntakeInfo — Use Case (Care)
// =============================================================================
// Validates raw input via domain smart constructors, calls IngressInfo,
// then proxies to backend.
// Sequence: validate → domain → proxy POST
// =============================================================================

import type { Result } from "../../../domain/shared/result.ts";
import { err } from "../../../domain/shared/result.ts";
import { PatientId } from "../../../domain/registry/value-objects/patient_id.ts";
import { LookupId } from "../../../domain/kernel/ids.ts";
import { IngressInfo } from "../../../domain/care/value-objects/ingress_info.ts";
import type { IngressInfoError } from "../../../domain/care/value-objects/ingress_info.ts";
import type { LookupIdError } from "../../../domain/kernel/ids.ts";
import type { UseCase, BackendProxy, ProxyError } from "../../shared/types.ts";

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export type RegisterIntakeInfoRawInput = Readonly<{
  patientId: string;
  ingressTypeId: string;
  originName?: string;
  originContact?: string;
  serviceReason: string;
  linkedSocialPrograms: readonly Readonly<{
    programId: string;
    observation?: string;
  }>[];
  actorId: string;
}>;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

export type RegisterIntakeInfoError =
  | IngressInfoError
  | LookupIdError
  | ProxyError
  | "INVALID_PATIENT_ID"
  | "INVALID_LOOKUP_ID";

// ---------------------------------------------------------------------------
// Deps
// ---------------------------------------------------------------------------

export type RegisterIntakeInfoDeps = Readonly<{
  proxy: BackendProxy;
}>;

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export const registerIntakeInfo = (
  deps: RegisterIntakeInfoDeps,
): UseCase<RegisterIntakeInfoRawInput, unknown, RegisterIntakeInfoError> =>
  async (input) => {
    // 1. Validate PatientId
    const patientId = PatientId(input.patientId);
    if (!patientId.ok) return err("INVALID_PATIENT_ID");

    // 2. Validate LookupId for ingressTypeId
    const ingressTypeId = LookupId(input.ingressTypeId);
    if (!ingressTypeId.ok) return err("INVALID_LOOKUP_ID");

    // 3. Validate each program's LookupId
    const validatedPrograms: { programId: ReturnType<typeof LookupId> extends Result<infer T, unknown> ? T : never; observation: string | undefined }[] = [];
    for (const program of input.linkedSocialPrograms) {
      const programId = LookupId(program.programId);
      if (!programId.ok) return err("INVALID_LOOKUP_ID");
      validatedPrograms.push({
        programId: programId.value,
        observation: program.observation,
      });
    }

    // 4. Domain — create IngressInfo
    const ingressInfo = IngressInfo({
      ingressTypeId: ingressTypeId.value,
      originName: input.originName,
      originContact: input.originContact,
      serviceReason: input.serviceReason,
      linkedSocialPrograms: validatedPrograms,
    });
    if (!ingressInfo.ok) return ingressInfo;

    // 5. Proxy to backend
    return deps.proxy.post(
      `/api/v1/patients/${patientId.value}/intake-info`,
      ingressInfo.value,
      input.actorId,
    ) as Promise<Result<unknown, ProxyError>>;
  };
