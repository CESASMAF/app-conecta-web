// Application Layer — Foundation Types
// UseCase pattern: (deps) => async (input) => Promise<Result<O, E>>

import type { Result } from "../../domain/shared/result.ts";

/** Generic use case signature. */
export type UseCase<Input, Output, Err> = (
  input: Input,
) => Promise<Result<Output, Err>>;

/** Async Result combinator — flatMap for async operations. */
export const flatMapAsync = async <T, U, E1, E2>(
  r: Result<T, E1>,
  fn: (v: T) => Promise<Result<U, E2>>,
): Promise<Result<U, E1 | E2>> => (r.ok ? fn(r.value) : r);

/** Async Result combinator — tap for side effects (e.g., event emission). */
export const tapAsync = async <T, E>(
  r: Result<T, E>,
  fn: (v: T) => Promise<void>,
): Promise<Result<T, E>> => {
  if (r.ok) await fn(r.value);
  return r;
};

/** Event bus port — publishes domain events after persistence. */
export type EventBus = Readonly<{
  publish: (event: Readonly<{ type: string }>) => Promise<void>;
}>;

/** Remote proxy port — the BFF proxies validated requests to the backend. */
export type BackendProxy = Readonly<{
  get: <T>(path: string) => Promise<Result<T, ProxyError>>;
  post: <T>(
    path: string,
    body: unknown,
    actorId: string,
  ) => Promise<Result<T, ProxyError>>;
  put: <T>(
    path: string,
    body: unknown,
    actorId: string,
  ) => Promise<Result<T, ProxyError>>;
  delete: (
    path: string,
    actorId: string,
  ) => Promise<Result<void, ProxyError>>;
}>;

export type ProxyError =
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "UNAUTHORIZED"
  | "SERVER_ERROR"
  | "VALIDATION_ERROR";

/** ID generator — injectable for testability, defaults to UUID v4. */
export type IdGenerator = () => string;
export const defaultIdGenerator: IdGenerator = () =>
  globalThis.crypto.randomUUID();
