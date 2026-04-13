// =============================================================================
// People Proxy Port — Backend proxy targeting the People Context service
// =============================================================================

import type { Result } from "../../../domain/shared/result.ts";
import type { ProxyError } from "../../shared/types.ts";

/** Proxy port specifically for the People Context backend. */
export type PeopleProxy = Readonly<{
  get: (path: string) => Promise<Result<unknown, ProxyError>>;
  post: (
    path: string,
    body: unknown,
    actorId: string,
  ) => Promise<Result<unknown, ProxyError>>;
}>;
