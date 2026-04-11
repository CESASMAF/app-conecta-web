// =============================================================================
// Test Double — BackendProxy Stub for Assessment use case tests
// =============================================================================

import { ok, err } from "../../../src/domain/shared/result.ts";
import type { Result } from "../../../src/domain/shared/result.ts";
import type { BackendProxy, ProxyError } from "../../../src/application/shared/types.ts";

export type ProxyCall = Readonly<{
  method: "post" | "put" | "delete";
  path: string;
  body: unknown;
  actorId: string;
}>;

export type StubProxy = BackendProxy & Readonly<{
  calls: readonly ProxyCall[];
  reset: () => void;
}>;

/** Creates a proxy stub that records calls and returns a configurable result. */
export const createProxyStub = (
  returnValue: Result<unknown, ProxyError> = ok({ success: true }),
): StubProxy => {
  const calls: ProxyCall[] = [];

  return {
    get calls() {
      return calls as readonly ProxyCall[];
    },
    reset: () => {
      calls.length = 0;
    },
    put: async <T>(path: string, body: unknown, actorId: string): Promise<Result<T, ProxyError>> => {
      calls.push({ method: "put", path, body, actorId });
      return returnValue as Result<T, ProxyError>;
    },
    post: async <T>(path: string, body: unknown, actorId: string): Promise<Result<T, ProxyError>> => {
      calls.push({ method: "post", path, body, actorId });
      return returnValue as Result<T, ProxyError>;
    },
    delete: async (path: string, actorId: string): Promise<Result<void, ProxyError>> => {
      calls.push({ method: "delete", path, body: undefined, actorId });
      return returnValue as Result<void, ProxyError>;
    },
  };
};

/** Creates a proxy stub that always returns a ProxyError. */
export const createFailingProxyStub = (
  error: ProxyError = "NETWORK_ERROR",
): StubProxy => createProxyStub(err(error));
