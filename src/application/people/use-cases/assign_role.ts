// =============================================================================
// AssignRole — Validates input then proxies role assignment to People Context
// =============================================================================

import type { Result } from "../../../domain/shared/result.ts";
import { PersonId, type PersonIdError } from "../../../domain/kernel/ids.ts";
import { err } from "../../../domain/shared/result.ts";
import type { UseCase, ProxyError } from "../../shared/types.ts";
import type { PeopleProxy } from "../ports/people-proxy.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AssignRoleInput = Readonly<{
  personId: string;
  system: string;
  role: string;
  actorId: string;
}>;

export type AssignRoleOutput = Readonly<{
  id: string;
}>;

export type AssignRoleError =
  | PersonIdError
  | ProxyError
  | "EMPTY_SYSTEM"
  | "EMPTY_ROLE"
  | "EMPTY_ACTOR_ID";

// ---------------------------------------------------------------------------
// Deps
// ---------------------------------------------------------------------------

type AssignRoleDeps = Readonly<{
  peopleProxy: PeopleProxy;
}>;

// ---------------------------------------------------------------------------
// Use Case
// ---------------------------------------------------------------------------

export const assignRole = (
  deps: AssignRoleDeps,
): UseCase<AssignRoleInput, AssignRoleOutput, AssignRoleError> =>
  async (input) => {
    // 1. Validate PersonId
    const personIdResult = PersonId(input.personId);
    if (!personIdResult.ok) return personIdResult;

    // 2. Validate system
    if (input.system.trim().length === 0) return err("EMPTY_SYSTEM");

    // 3. Validate role
    if (input.role.trim().length === 0) return err("EMPTY_ROLE");

    // 4. Validate actorId
    if (input.actorId.trim().length === 0) return err("EMPTY_ACTOR_ID");

    // 5. Proxy to People Context
    const body = {
      system: input.system.trim(),
      role: input.role.trim(),
    };

    // Cast: proxy returns unknown, but we trust the People Context API shape
    return deps.peopleProxy.post(
      `/api/v1/people/${personIdResult.value as string}/roles`,
      body,
      input.actorId,
    ) as Promise<Result<AssignRoleOutput, ProxyError>>;
  };
