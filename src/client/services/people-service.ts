// People service — calls /api/people endpoints on the Hono BFF.

import {
  type PaginatedResult,
  type Result,
  type ServiceError,
  get,
  getWithMeta,
  post,
} from "./base-client.ts";

export type PersonSummary = Readonly<{
  personId: string;
  fullName: string;
  cpf: string | null;
}>;

export type Person = Readonly<{
  personId: string;
  fullName: string;
  cpf: string | null;
  birthDate: string | null;
  createdAt: string;
}>;

export type SystemRole = Readonly<{
  roleId: string;
  system: string;
  role: string;
  active: boolean;
  assignedAt: string;
}>;

export const peopleService = {
  findByCpf: (cpf: string): Promise<Result<Person, ServiceError>> =>
    get<Person>(`/api/people/by-cpf/${cpf}`),

  search: (
    query?: string,
    limit = 20,
  ): Promise<Result<PaginatedResult<readonly PersonSummary[]>, ServiceError>> => {
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    params.set("limit", String(limit));
    return getWithMeta<readonly PersonSummary[]>(
      `/api/people?${params.toString()}`,
    );
  },

  register: (
    data: Readonly<{ fullName: string; cpf?: string; birthDate: string }>,
  ): Promise<Result<Readonly<{ id: string }>, ServiceError>> =>
    post<Readonly<{ id: string }>>("/api/people", data),

  assignRole: (
    personId: string,
    system: string,
    role: string,
  ): Promise<Result<Readonly<{ id: string }>, ServiceError>> =>
    post<Readonly<{ id: string }>>(`/api/people/${personId}/roles`, {
      system,
      role,
    }),

  getById: (personId: string): Promise<Result<Person, ServiceError>> =>
    get<Person>(`/api/people/${personId}`),

  getRoles: (
    personId: string,
    active?: boolean,
  ): Promise<Result<readonly SystemRole[], ServiceError>> => {
    const params = active !== undefined ? `?active=${active}` : "";
    return get<readonly SystemRole[]>(
      `/api/people/${personId}/roles${params}`,
    );
  },
} as const;
