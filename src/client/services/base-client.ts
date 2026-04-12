// Client-side fetch wrapper — all requests go to same-origin /api/* endpoints.
// Returns Result<T, ServiceError> — never throws.
// The Hono BFF handles auth via __Host-session cookie.

export type Ok<T> = Readonly<{ ok: true; value: T }>;
export type Err<E> = Readonly<{ ok: false; error: E }>;
export type Result<T, E = string> = Ok<T> | Err<E>;

export type ServiceError =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "SERVER_ERROR"
  | "NETWORK_ERROR";

export type PaginatedMeta = Readonly<{
  timestamp: string;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;
  nextCursor: string | null;
}>;

export type PaginatedResult<T> = Readonly<{
  data: T;
  meta: PaginatedMeta;
}>;

const BASE_HEADERS: Readonly<Record<string, string>> = {
  "Content-Type": "application/json",
  "X-Requested-With": "XMLHttpRequest",
};

const handleResponse = async <T>(
  response: Response,
): Promise<Result<T, ServiceError>> => {
  if (response.status === 401) {
    globalThis.location.href = "/auth/login";
    return { ok: false, error: "UNAUTHORIZED" };
  }
  if (response.status === 403) return { ok: false, error: "FORBIDDEN" };
  if (response.status === 404) return { ok: false, error: "NOT_FOUND" };
  if (response.status === 204) {
    return { ok: true, value: undefined as unknown as T };
  }
  if (response.status >= 400 && response.status < 500) {
    return { ok: false, error: "VALIDATION_ERROR" };
  }
  if (response.status >= 500) return { ok: false, error: "SERVER_ERROR" };

  try {
    const json = await response.json();
    return { ok: true, value: json.data as T };
  } catch {
    return { ok: false, error: "SERVER_ERROR" };
  }
};

const handleResponseWithMeta = async <T>(
  response: Response,
): Promise<Result<PaginatedResult<T>, ServiceError>> => {
  if (response.status === 401) {
    globalThis.location.href = "/auth/login";
    return { ok: false, error: "UNAUTHORIZED" };
  }
  if (response.status === 403) return { ok: false, error: "FORBIDDEN" };
  if (response.status === 404) return { ok: false, error: "NOT_FOUND" };
  if (response.status >= 400 && response.status < 500) {
    return { ok: false, error: "VALIDATION_ERROR" };
  }
  if (response.status >= 500) return { ok: false, error: "SERVER_ERROR" };

  try {
    const json = await response.json();
    return {
      ok: true,
      value: { data: json.data as T, meta: json.meta as PaginatedMeta },
    };
  } catch {
    return { ok: false, error: "SERVER_ERROR" };
  }
};

export const get = async <T>(
  path: string,
): Promise<Result<T, ServiceError>> => {
  try {
    const res = await fetch(path, {
      credentials: "same-origin",
      headers: BASE_HEADERS,
    });
    return handleResponse<T>(res);
  } catch {
    return { ok: false, error: "NETWORK_ERROR" };
  }
};

export const getWithMeta = async <T>(
  path: string,
): Promise<Result<PaginatedResult<T>, ServiceError>> => {
  try {
    const res = await fetch(path, {
      credentials: "same-origin",
      headers: BASE_HEADERS,
    });
    return handleResponseWithMeta<T>(res);
  } catch {
    return { ok: false, error: "NETWORK_ERROR" };
  }
};

export const post = async <T>(
  path: string,
  body: unknown,
): Promise<Result<T, ServiceError>> => {
  try {
    const res = await fetch(path, {
      method: "POST",
      credentials: "same-origin",
      headers: BASE_HEADERS,
      body: JSON.stringify(body),
    });
    return handleResponse<T>(res);
  } catch {
    return { ok: false, error: "NETWORK_ERROR" };
  }
};

export const put = async <T>(
  path: string,
  body: unknown,
): Promise<Result<T, ServiceError>> => {
  try {
    const res = await fetch(path, {
      method: "PUT",
      credentials: "same-origin",
      headers: BASE_HEADERS,
      body: JSON.stringify(body),
    });
    return handleResponse<T>(res);
  } catch {
    return { ok: false, error: "NETWORK_ERROR" };
  }
};

export const patch = async <T>(
  path: string,
  body?: unknown,
): Promise<Result<T, ServiceError>> => {
  try {
    const res = await fetch(path, {
      method: "PATCH",
      credentials: "same-origin",
      headers: BASE_HEADERS,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res);
  } catch {
    return { ok: false, error: "NETWORK_ERROR" };
  }
};

export const del = async <T = void>(
  path: string,
): Promise<Result<T, ServiceError>> => {
  try {
    const res = await fetch(path, {
      method: "DELETE",
      credentials: "same-origin",
      headers: BASE_HEADERS,
    });
    return handleResponse<T>(res);
  } catch {
    return { ok: false, error: "NETWORK_ERROR" };
  }
};
