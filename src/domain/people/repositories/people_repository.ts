// =============================================================================
// PeopleRepository — Port contract for People Context proxy
// =============================================================================

import type { PersonId } from "../../kernel/ids.ts";
import type { Result } from "../../shared/result.ts";
import type { PersonError, ProxyError } from "../errors.ts";
import type { Person, PersonSummary, PaginatedResult, RegisterPersonInput } from "../value-objects/person.ts";

/** Repository contract for Person operations via People service proxy. */
export type PeopleRepository = Readonly<{
  findById: (id: PersonId) => Promise<Result<Person, "PEO-002" | ProxyError>>;
  findByCpf: (cpf: string) => Promise<Result<Person, "PEO-002" | "PEO-004" | ProxyError>>;
  search: (query: string, limit: number, cursor?: string) => Promise<Result<PaginatedResult<PersonSummary>, ProxyError>>;
  register: (input: RegisterPersonInput, actorId: string) => Promise<Result<Readonly<{ id: string }>, PersonError | ProxyError>>;
  update: (personId: PersonId, input: Partial<RegisterPersonInput>, actorId: string) => Promise<Result<void, PersonError | ProxyError>>;
}>;
