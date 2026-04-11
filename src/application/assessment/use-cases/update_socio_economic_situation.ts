// =============================================================================
// UpdateSocioEconomicSituation — Use Case
// =============================================================================
// Validates socio-economic input via domain smart constructor, then proxies
// the validated data to the backend via PUT.
// Sequence: validate patientId → validate VO → proxy PUT
// =============================================================================

import type { Result } from "../../../domain/shared/result.ts";
import { err } from "../../../domain/shared/result.ts";
import { PatientId } from "../../../domain/registry/value-objects/patient_id.ts";
import {
  type SocioEconomicInput,
  type SocioEconomicError,
  SocioEconomicSituation,
} from "../../../domain/assessment/value-objects/socio_economic_situation.ts";
import type { UseCase, BackendProxy, ProxyError } from "../../shared/types.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UpdateSocioEconomicSituationDeps = Readonly<{
  proxy: BackendProxy;
}>;

export type UpdateSocioEconomicSituationInput = Readonly<{
  patientId: string;
  data: SocioEconomicInput;
  actorId: string;
}>;

export type UpdateSocioEconomicSituationError =
  | SocioEconomicError
  | ProxyError
  | "INVALID_PATIENT_ID";

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export const updateSocioEconomicSituation = (
  deps: UpdateSocioEconomicSituationDeps,
): UseCase<UpdateSocioEconomicSituationInput, unknown, UpdateSocioEconomicSituationError> =>
  async (input) => {
    const patientId = PatientId(input.patientId);
    if (!patientId.ok) return err("INVALID_PATIENT_ID");

    const validated = SocioEconomicSituation(input.data);
    if (!validated.ok) return validated;

    return deps.proxy.put(
      `/api/v1/patients/${patientId.value}/socio-economic`,
      validated.value,
      input.actorId,
    ) as Promise<Result<unknown, ProxyError>>;
  };
