// =============================================================================
// FindPersonById — Validates PersonId then proxies lookup to People Context
// =============================================================================

import type { Result } from "../../../domain/shared/result.ts";
import { PersonId, type PersonIdError } from "../../../domain/kernel/ids.ts";
import type { UseCase, ProxyError } from "../../shared/types.ts";
import type { PeopleProxy } from "../ports/people-proxy.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FindPersonByIdInput = Readonly<{
  personId: string;
}>;

export type Person = Readonly<{
  id: string;
  fullName: string;
  cpf?: string;
  birthDate?: string;
}>;

export type FindPersonByIdError = PersonIdError | ProxyError | "NOT_FOUND";

// ---------------------------------------------------------------------------
// Deps
// ---------------------------------------------------------------------------

type FindPersonByIdDeps = Readonly<{
  peopleProxy: PeopleProxy;
}>;

// ---------------------------------------------------------------------------
// Use Case
// ---------------------------------------------------------------------------

export const findPersonById = (
  deps: FindPersonByIdDeps,
): UseCase<FindPersonByIdInput, Person, FindPersonByIdError> =>
  async (input) => {
    // 1. Validate PersonId
    const personIdResult = PersonId(input.personId);
    if (!personIdResult.ok) return personIdResult;

    // 2. Proxy to People Context
    const path = `/api/v1/people/${personIdResult.value as string}`;
    // Cast: proxy returns unknown, but we trust the People Context API shape
    return deps.peopleProxy.get(path) as Promise<Result<Person, ProxyError>>;
  };
