// =============================================================================
// Assessment Application — Error Union
// =============================================================================
// Aggregates all possible errors from Assessment use cases.
// Domain validation errors + proxy errors + application-specific errors.
// =============================================================================

import type { HousingConditionError } from "../../domain/assessment/value-objects/housing_condition.ts";
import type { SocioEconomicError } from "../../domain/assessment/value-objects/socio_economic_situation.ts";
import type { WorkAndIncomeError } from "../../domain/assessment/value-objects/work_and_income.ts";
import type { SocialBenefitError } from "../../domain/assessment/value-objects/social_benefit.ts";
import type { SocialBenefitsCollectionError } from "../../domain/assessment/value-objects/social_benefits_collection.ts";
import type { CommunitySupportNetworkError } from "../../domain/assessment/value-objects/community_support_network.ts";
import type { SocialHealthSummaryError } from "../../domain/assessment/value-objects/social_health_summary.ts";
import type { PatientIdError } from "../../domain/registry/value-objects/patient_id.ts";
import type { ProxyError } from "../shared/types.ts";

export type AssessmentAppError =
  | HousingConditionError
  | SocioEconomicError
  | WorkAndIncomeError
  | SocialBenefitError
  | SocialBenefitsCollectionError
  | CommunitySupportNetworkError
  | SocialHealthSummaryError
  | PatientIdError
  | ProxyError
  | "INVALID_PATIENT_ID";
