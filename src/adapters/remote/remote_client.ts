// RemoteClient — Proxies requests from BFF to upstream backend services.
// Injects Bearer token from session. The browser NEVER sees the backend URL or tokens.

import { type Result, ok, err } from "../../domain/shared/result.ts";
import type { ServerConfig } from "../config/server_config.ts";

export type RemoteError =
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "UNAUTHORIZED"
  | "SERVER_ERROR";

export type RemoteResponse = Readonly<{
  status: number;
  headers: Headers;
  body: unknown;
}>;

export type RemoteRequestOptions = Readonly<{
  baseUrl: string;
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  accessToken: string;
  actorId?: string;
  body?: unknown;
  headers?: Readonly<Record<string, string>>;
  timeoutMs?: number;
}>;

export type RemoteClient = Readonly<{
  fetch: (
    options: RemoteRequestOptions,
  ) => Promise<Result<RemoteResponse, RemoteError>>;
}>;

const DEFAULT_TIMEOUT_MS = 10_000;

const buildHeaders = (
  options: RemoteRequestOptions,
): Record<string, string> => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${options.accessToken}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    ...options.headers,
  };

  if (options.actorId !== undefined) {
    headers["X-Actor-Id"] = options.actorId;
  }

  return headers;
};

const classifyResponse = async (
  response: Response,
): Promise<Result<RemoteResponse, RemoteError>> => {
  if (response.status === 401) {
    return err("UNAUTHORIZED");
  }

  if (response.status >= 500) {
    return err("SERVER_ERROR");
  }

  try {
    const body: unknown = await response.json();
    return ok({
      status: response.status,
      headers: response.headers,
      body,
    });
  } catch {
    // Response was not JSON — return body as null
    return ok({
      status: response.status,
      headers: response.headers,
      body: null,
    });
  }
};

const classifyError = (error: unknown): RemoteError => {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "TIMEOUT";
  }
  return "NETWORK_ERROR";
};

export const createRemoteClient = (_config: ServerConfig): RemoteClient => ({
  fetch: async (
    options: RemoteRequestOptions,
  ): Promise<Result<RemoteResponse, RemoteError>> => {
    const url = `${options.baseUrl}${options.path}`;
    const headers = buildHeaders(options);
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await globalThis.fetch(url, {
        method: options.method,
        headers,
        body: options.body !== undefined
          ? JSON.stringify(options.body)
          : undefined,
        signal: controller.signal,
      });

      return await classifyResponse(response);
    } catch (error: unknown) {
      return err(classifyError(error));
    } finally {
      clearTimeout(timeoutId);
    }
  },
});
