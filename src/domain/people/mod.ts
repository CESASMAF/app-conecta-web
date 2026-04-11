// =============================================================================
// People Context — Public API barrel
// =============================================================================

export type { PersonError, RoleError, ProxyError } from "./errors.ts";

export { Person, RegisterPersonInput } from "./value-objects/person.ts";
export type { PersonSummary, PaginatedResult } from "./value-objects/person.ts";

export { AssignRoleInput } from "./value-objects/system_role.ts";
export type { SystemRole } from "./value-objects/system_role.ts";

export type { PeopleRepository } from "./repositories/people_repository.ts";
export type { RoleRepository } from "./repositories/role_repository.ts";
