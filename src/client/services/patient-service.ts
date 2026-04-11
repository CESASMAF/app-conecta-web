// Patient service — calls /api/v1/patients endpoints on the Hono BFF.

import {
  type PaginatedResult,
  type Result,
  type ServiceError,
  get,
  getWithMeta,
  post,
} from "./base-client.ts";

export type PatientSummary = Readonly<{
  patientId: string;
  personId: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  primaryDiagnosis: string | null;
  memberCount: number;
}>;

export type PatientDetail = Readonly<{
  patientId: string;
  personId: string;
  personalData: Readonly<{
    firstName: string;
    lastName: string;
    motherName: string | null;
    birthDate: string | null;
    phone: string | null;
  }> | null;
  civilDocuments: Readonly<{
    cpf: string | null;
    rg: string | null;
  }> | null;
  address: Readonly<{
    street: string | null;
    number: string | null;
    complement: string | null;
    neighborhood: string | null;
    city: string | null;
    state: string | null;
    cep: string | null;
  }> | null;
  diagnoses: readonly Readonly<{
    description: string;
    icdCode: string | null;
  }>[];
  familyMembers: readonly Readonly<{
    memberId: string;
    fullName: string;
    relationship: string;
  }>[];
  socialIdentity: unknown | null;
  socioeconomicSituation: unknown | null;
  healthStatus: unknown | null;
  communitySupportNetwork: unknown | null;
  educationalStatus: unknown | null;
  violationReports: readonly unknown[];
  workAndIncome: unknown | null;
  intakeInfo: unknown | null;
  housingCondition: unknown | null;
}>;

export const patientService = {
  search: (
    query?: string,
    limit = 20,
    cursor?: string,
  ): Promise<Result<PaginatedResult<readonly PatientSummary[]>, ServiceError>> => {
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    if (cursor) params.set("cursor", cursor);
    params.set("limit", String(limit));
    return getWithMeta<readonly PatientSummary[]>(
      `/api/v1/patients?${params.toString()}`,
    );
  },

  getById: (
    patientId: string,
  ): Promise<Result<PatientDetail, ServiceError>> =>
    get<PatientDetail>(`/api/v1/patients/${patientId}`),

  create: (
    data: unknown,
  ): Promise<Result<Readonly<{ id: string }>, ServiceError>> =>
    post<Readonly<{ id: string }>>("/api/v1/patients", data),
} as const;
