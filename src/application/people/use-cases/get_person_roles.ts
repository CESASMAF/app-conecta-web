// =============================================================================
// GetPersonRoles — Validates PersonId then proxies roles fetch to People Context
// =============================================================================

import type { Result } from "../../../domain/shared/result.ts";
import { PersonId, type PersonIdError } from "../../../domain/kernel/ids.ts";
import type { UseCase, ProxyError } from "../../shared/types.ts";
import type { PeopleProxy } from "../ports/people-proxy.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GetPersonRolesInput = Readonly<{
  personId: string;
  active?: boolean;
}>;

export type SystemRole = Readonly<{
  id: string;
  system: string;
  role: string;
  active: boolean;
}>;

export type GetPersonRolesOutput = readonly SystemRole[];

export type GetPersonRolesError = PersonIdError | ProxyError;

// ---------------------------------------------------------------------------
// Deps
// ---------------------------------------------------------------------------

type GetPersonRolesDeps = Readonly<{
  peopleProxy: PeopleProxy;
}>;

// ---------------------------------------------------------------------------
// Use Case
// ---------------------------------------------------------------------------

export const getPersonRoles = (
  deps: GetPersonRolesDeps,
): UseCase<GetPersonRolesInput, GetPersonRolesOutput, GetPersonRolesError> =>
  async (input) => {
    // 1. Validate PersonId
    const personIdResult = PersonId(input.personId);
    if (!personIdResult.ok) return personIdResult;

    // 2. Build path with optional active filter
    const params = new URLSearchParams();
    if (input.active !== undefined) params.set("active", String(input.active));

    const query = params.toString();
    const path = `/api/v1/people/${personIdResult.value as string}/roles${query ? `?${query}` : ""}`;

    // Cast: proxy returns unknown, but we trust the People Context API shape
    return deps.peopleProxy.get(path) as Promise<Result<GetPersonRolesOutput, ProxyError>>;
  };
