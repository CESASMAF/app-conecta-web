// =============================================================================
// SearchPeople — Proxies paginated people search to People Context
// =============================================================================

import type { Result } from "../../../domain/shared/result.ts";
import type { UseCase, ProxyError } from "../../shared/types.ts";
import type { PeopleProxy } from "../ports/people-proxy.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SearchPeopleInput = Readonly<{
  search?: string;
  limit?: number;
  cursor?: string;
}>;

export type PersonSummary = Readonly<{
  id: string;
  fullName: string;
  cpf?: string;
}>;

export type PaginatedPeople = Readonly<{
  items: readonly PersonSummary[];
  nextCursor?: string;
  total?: number;
}>;

export type SearchPeopleError = ProxyError;

// ---------------------------------------------------------------------------
// Deps
// ---------------------------------------------------------------------------

type SearchPeopleDeps = Readonly<{
  peopleProxy: PeopleProxy;
}>;

// ---------------------------------------------------------------------------
// Use Case
// ---------------------------------------------------------------------------

export const searchPeople = (
  deps: SearchPeopleDeps,
): UseCase<SearchPeopleInput, PaginatedPeople, SearchPeopleError> =>
  async (input) => {
    const params = new URLSearchParams();
    if (input.search) params.set("search", input.search);
    if (input.limit !== undefined) params.set("limit", String(input.limit));
    if (input.cursor) params.set("cursor", input.cursor);

    const query = params.toString();
    const path = `/api/v1/people${query ? `?${query}` : ""}`;

    // Cast: proxy returns unknown, but we trust the People Context API shape
    return deps.peopleProxy.get(path) as Promise<Result<PaginatedPeople, ProxyError>>;
  };
