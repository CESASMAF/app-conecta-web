// Family service — calls /api/v1/patients/:id/family-members endpoints.

import {
  type Result,
  type ServiceError,
  del,
  post,
  put,
} from "./base-client.ts";

export const familyService = {
  addMember: (
    patientId: string,
    data: unknown,
  ): Promise<Result<void, ServiceError>> =>
    post<void>(`/api/v1/patients/${patientId}/family-members`, data),

  removeMember: (
    patientId: string,
    memberId: string,
  ): Promise<Result<void, ServiceError>> =>
    del<void>(
      `/api/v1/patients/${patientId}/family-members/${memberId}`,
    ),

  assignPrimaryCaregiver: (
    patientId: string,
    data: Readonly<{ memberId: string }>,
  ): Promise<Result<void, ServiceError>> =>
    put<void>(`/api/v1/patients/${patientId}/primary-caregiver`, data),
} as const;
