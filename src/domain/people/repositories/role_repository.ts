// =============================================================================
// RoleRepository — Port contract for Role operations via People service proxy
// =============================================================================

import type { PersonId } from "../../kernel/ids.ts";
import type { Result } from "../../shared/result.ts";
import type { RoleError, ProxyError } from "../errors.ts";
import type { PersonSummary } from "../value-objects/person.ts";
import type { AssignRoleInput, SystemRole } from "../value-objects/system_role.ts";

/** Repository contract for SystemRole operations via People service proxy. */
export type RoleRepository = Readonly<{
  findByPerson: (personId: PersonId, active?: boolean) => Promise<Result<readonly SystemRole[], ProxyError>>;
  assign: (personId: PersonId, input: AssignRoleInput, actorId: string) => Promise<Result<Readonly<{ id: string }> | void, RoleError | ProxyError>>;
  deactivate: (personId: PersonId, roleId: string, actorId: string) => Promise<Result<void, RoleError | ProxyError>>;
  reactivate: (personId: PersonId, roleId: string, actorId: string) => Promise<Result<void, RoleError | ProxyError>>;
  queryBySystem: (system: string, role?: string, active?: boolean) => Promise<Result<readonly Readonly<{ person: PersonSummary; role: SystemRole }>[], ProxyError>>;
}>;
